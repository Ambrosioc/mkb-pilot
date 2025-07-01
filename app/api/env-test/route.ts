import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return NextResponse.json({
    environment: {
      supabaseUrl: supabaseUrl || 'NON CONFIGURÉ',
      supabaseKey: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NON CONFIGURÉ',
      isLocal: supabaseUrl?.includes('127.0.0.1') || supabaseUrl?.includes('localhost'),
      expectedLocalUrl: 'http://127.0.0.1:54321',
      expectedLocalKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
    }
  });
} 