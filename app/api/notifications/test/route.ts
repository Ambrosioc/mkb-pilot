import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    supabaseUrl: supabaseUrl ? '✅ Configuré' : '❌ Manquant',
    serviceRoleKey: serviceRoleKey ? '✅ Configuré' : '❌ Manquant',
    timestamp: new Date().toISOString()
  });
} 