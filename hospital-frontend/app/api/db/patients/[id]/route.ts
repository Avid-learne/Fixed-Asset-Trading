// hospital-frontend/app/api/db/patients/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PatientDB } from '@/lib/db-operations';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const patient = await PatientDB.getById(params.id);
    if (!patient) {
      return NextResponse.json(
        { status: 'error', message: 'Patient not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      status: 'success',
      data: patient,
    });
  } catch (error) {
    console.error('Error fetching patient:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to fetch patient',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const patient = await PatientDB.update(params.id, data);
    return NextResponse.json({
      status: 'success',
      data: patient,
      message: 'Patient updated successfully',
    });
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to update patient',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await PatientDB.delete(params.id);
    return NextResponse.json({
      status: 'success',
      message: 'Patient deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete patient',
      },
      { status: 500 }
    );
  }
}
