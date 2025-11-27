// hospital-frontend/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const registerSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  email: z.string().email().optional(),
  password: z.string().min(6),
  name: z.string().optional(),
  role: z.enum(['PATIENT', 'BANK', 'HOSPITAL']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { walletAddress: data.walletAddress.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Wallet address already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hash(data.password, 12);

    // Create user and role-specific profile in transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          walletAddress: data.walletAddress.toLowerCase(),
          email: data.email,
          passwordHash,
          name: data.name,
          role: data.role,
        },
      });

      // Create role-specific profile
      if (data.role === 'PATIENT') {
        await tx.patient.create({
          data: { userId: newUser.id },
        });
      }

      return newUser;
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        entity: 'USER',
        entityId: user.id,
        details: { role: user.role },
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        role: user.role,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
