// hospital-frontend/app/api/bank/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { authenticate } from '@/lib/auth-middleware';
import { ethers } from 'ethers';

const verifySchema = z.object({
  depositId: z.string(),
  verifiedValue: z.number().positive(),
  tokensToMint: z.number().positive(),
  notes: z.string().optional(),
  ipfsHash: z.string().optional(),
  approve: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    const authUser = await authenticate(request, 'BANK');
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = verifySchema.parse(body);

    // Get bank staff
    const bankStaff = await prisma.bankStaff.findUnique({
      where: { userId: authUser.userId },
    });

    if (!bankStaff) {
      return NextResponse.json({ error: 'Bank staff not found' }, { status: 404 });
    }

    // Get deposit
    const deposit = await prisma.assetDeposit.findUnique({
      where: { id: data.depositId },
      include: { patient: { include: { user: true } } },
    });

    if (!deposit) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
    }

    if (deposit.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Deposit already processed' },
        { status: 400 }
      );
    }

    // Create verification and update deposit in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create verification record
      const verification = await tx.assetVerification.create({
        data: {
          depositId: deposit.id,
          verifiedById: bankStaff.id,
          verifiedValue: data.verifiedValue,
          tokensToMint: data.tokensToMint,
          notes: data.notes,
          ipfsHash: data.ipfsHash,
          approvedAt: data.approve ? new Date() : null,
          rejectedAt: !data.approve ? new Date() : null,
          rejectionReason: !data.approve ? data.notes : null,
        },
      });

      // Update deposit status
      await tx.assetDeposit.update({
        where: { id: deposit.id },
        data: {
          status: data.approve ? 'APPROVED' : 'REJECTED',
        },
      });

      return verification;
    });

    // If approved, mint tokens on blockchain
    if (data.approve) {
      try {
        // Initialize provider and signer
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL!);
        const wallet = new ethers.Wallet(process.env.BANK_PRIVATE_KEY!, provider);

        // Get contract
        const hospitalContract = new ethers.Contract(
          process.env.HOSPITAL_FINANCIALS_ADDRESS!,
          require('@/artifacts/contracts/HospitalFinancials.sol/HospitalFinancials.json').abi,
          wallet
        );

        // Mint asset tokens
        const tx = await hospitalContract.mintAssetToken(
          deposit.patient.user.walletAddress,
          deposit.depositId,
          ethers.parseEther(data.tokensToMint.toString()),
          data.ipfsHash || ''
        );

        const receipt = await tx.wait();

        // Update deposit with blockchain data
        await prisma.assetDeposit.update({
          where: { id: deposit.id },
          data: {
            txHash: receipt.hash,
            blockNumber: BigInt(receipt.blockNumber),
            status: 'MINTED',
          },
        });

        // Create asset token record
        await prisma.assetToken.create({
          data: {
            depositId: deposit.id,
            patientAddress: deposit.patient.user.walletAddress,
            tokenAmount: data.tokensToMint,
            contractAddress: process.env.ASSET_TOKEN_ADDRESS!,
            txHash: receipt.hash,
            blockNumber: BigInt(receipt.blockNumber),
          },
        });

        // Log audit
        await prisma.auditLog.create({
          data: {
            userId: authUser.userId,
            action: 'TOKENS_MINTED',
            entity: 'ASSET_TOKEN',
            entityId: deposit.id,
            details: {
              depositId: deposit.depositId,
              amount: data.tokensToMint,
              txHash: receipt.hash,
            },
          },
        });
      } catch (blockchainError) {
        console.error('Blockchain minting error:', blockchainError);
        // Mark as approved but not minted
        await prisma.assetDeposit.update({
          where: { id: deposit.id },
          data: { status: 'APPROVED' },
        });
      }
    }

    return NextResponse.json({
      success: true,
      verification: {
        id: result.id,
        approved: data.approve,
      },
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}