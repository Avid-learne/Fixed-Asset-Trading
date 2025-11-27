// hospital-frontend/app/api/db/patients/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PatientDB } from '@/lib/db-operations';

export async function GET(request: NextRequest) {
  try {
    const patients = await PatientDB.getAll();
    return NextResponse.json({
      status: 'success',
      data: patients,
      count: patients?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to fetch patients',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const patient = await PatientDB.create(data);
    return NextResponse.json(
      {
        status: 'success',
        data: patient,
        message: 'Patient created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to create patient',
      },
      { status: 500 }
    );
  }
}
