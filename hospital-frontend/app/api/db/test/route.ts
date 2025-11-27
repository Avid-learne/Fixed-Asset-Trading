// hospital-frontend/app/api/db/test/route.ts
/**
 * Test endpoint to verify Supabase integration
 * GET /api/db/test - Run integration tests
 */
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [] as any[],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
    },
  };

  try {
    // Test 1: Check environment variables
    results.tests.push({
      name: 'Environment Variables',
      status: process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'PASS' : 'FAIL',
      details: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing',
      },
    });

    // Test 2: Basic connection
    try {
      const { data, error } = await supabase.auth.getSession();
      results.tests.push({
        name: 'Supabase Connection',
        status: !error ? 'PASS' : 'FAIL',
        details: {
          error: error?.message || 'Connected successfully',
        },
      });
    } catch (e) {
      results.tests.push({
        name: 'Supabase Connection',
        status: 'FAIL',
        details: { error: e instanceof Error ? e.message : 'Unknown error' },
      });
    }

    // Test 3: List tables
    try {
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(100);

      const tableCount = data?.length || 0;
      results.tests.push({
        name: 'Database Tables',
        status: tableCount > 0 ? 'PASS' : 'FAIL',
        details: {
          count: tableCount,
          tables: data?.map(t => (t as any).table_name).slice(0, 10) || [],
        },
      });
    } catch (e) {
      results.tests.push({
        name: 'Database Tables',
        status: 'FAIL',
        details: {
          error: e instanceof Error ? e.message : 'Unknown error',
          hint: 'Run sql/schema.sql in Supabase SQL Editor',
        },
      });
    }

    // Calculate summary
    results.summary.total = results.tests.length;
    results.summary.passed = results.tests.filter(t => t.status === 'PASS').length;
    results.summary.failed = results.tests.filter(t => t.status === 'FAIL').length;

  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Test execution failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }

  return NextResponse.json(results);
}
