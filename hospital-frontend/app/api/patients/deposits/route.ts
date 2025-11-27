// hospital-frontend/app/api/patients/deposits/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { authenticate } from '@/lib/auth-middleware';

const depositSchema = z.object({
  assetType: z.enum([
    'GOLD_JEWELRY',
    'SILVER_COINS',
    'PRECIOUS_METALS',
    'MEDICAL_EQUIPMENT',
    'PROPERTY',
    'CRYPTOCURRENCY',
    'VEHICLE',
    'ARTWORK',
    'OTHER',
  ]),
  quantity: z.number().positive(),
  unit: z.string(),
  estimatedValue: z.number().positive(),
  description: z.string(),
  photos: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authUser = await authenticate(request, 'PATIENT');
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = depositSchema.parse(body);

    // Get patient ID
    const patient = await prisma.patient.findUnique({
      where: { userId: authUser.userId },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Create deposit
    const deposit = await prisma.assetDeposit.create({
      data: {
        patientId: patient.id,
        assetType: data.assetType,
        quantity: data.quantity,
        unit: data.unit,
        estimatedValue: data.estimatedValue,
        description: data.description,
        photos: data.photos || [],
        status: 'PENDING',
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: authUser.userId,
        action: 'DEPOSIT_CREATED',
        entity: 'ASSET_DEPOSIT',
        entityId: deposit.id,
        details: { depositId: deposit.depositId, assetType: data.assetType },
      },
    });

    return NextResponse.json({
      success: true,
      deposit: {
        id: deposit.id,
        depositId: deposit.depositId,
        status: deposit.status,
      },
    });
  } catch (error) {
    console.error('Deposit creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create deposit' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await authenticate(request, 'PATIENT');
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: authUser.userId },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const deposits = await prisma.assetDeposit.findMany({
      where: { patientId: patient.id },
      include: {
        verification: true,
        assetTokens: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ deposits });
  } catch (error) {
    console.error('Fetch deposits error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deposits' },
      { status: 500 }
    );
  }
}