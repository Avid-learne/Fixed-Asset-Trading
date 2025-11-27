// hospital-frontend/app/api/db/health/route.ts
import { NextResponse } from 'next/server';
import { checkSupabaseConnection } from '@/lib/supabase';

export async function GET() {
  try {
    const isConnected = await checkSupabaseConnection();
    
    if (isConnected) {
      return NextResponse.json({
        status: 'success',
        message: 'Supabase connection successful',
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Failed to connect to Supabase',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
