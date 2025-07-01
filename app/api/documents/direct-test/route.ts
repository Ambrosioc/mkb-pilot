import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Utiliser exactement la même configuration que le client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 [DIRECT TEST] Configuration:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  isLocal: supabaseUrl?.includes('127.0.0.1')
});

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 [DIRECT TEST] Test direct de la table sales_documents');

    // Test direct avec la même configuration
    const { data, error } = await supabase
      .from('sales_documents')
      .select('*')
      .limit(10);

    if (error) {
      console.error('❌ [DIRECT TEST] Erreur:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code
      }, { status: 500 });
    }

    console.log('✅ [DIRECT TEST] Succès, documents trouvés:', data?.length || 0);

    return NextResponse.json({
      success: true,
      documentCount: data?.length || 0,
      documents: data?.map(doc => ({
        id: doc.id,
        type: doc.type,
        number: doc.number,
        created_at: doc.created_at,
        hasPdfContent: !!doc.pdf_content
      })) || [],
      message: 'Test direct réussi'
    });

  } catch (error) {
    console.error('❌ [DIRECT TEST] Erreur serveur:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 