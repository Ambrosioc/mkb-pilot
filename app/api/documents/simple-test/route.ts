import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ [SIMPLE TEST] Variables d\'environnement Supabase manquantes');
  throw new Error('Variables d\'environnement Supabase manquantes');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 [SIMPLE TEST] Test simple de la table sales_documents');

    // Test simple de la table sales_documents
    const { data, error } = await supabase
      .from('sales_documents')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ [SIMPLE TEST] Erreur:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      }, { status: 500 });
    }

    console.log('✅ [SIMPLE TEST] Succès, documents trouvés:', data?.length || 0);

    return NextResponse.json({
      success: true,
      documentCount: data?.length || 0,
      documents: data || [],
      message: 'Connexion à la base de données réussie'
    });

  } catch (error) {
    console.error('❌ [SIMPLE TEST] Erreur serveur:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 