import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ [DEBUG API] Variables d\'environnement Supabase manquantes');
  throw new Error('Variables d\'environnement Supabase manquantes');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 [DEBUG API] Debug de la base de données');

    // Vérifier les tables existantes
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.error('❌ [DEBUG API] Erreur lors de la vérification des tables:', tablesError);
    }

    // Vérifier la structure de sales_documents
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'sales_documents');

    if (columnsError) {
      console.error('❌ [DEBUG API] Erreur lors de la vérification des colonnes:', columnsError);
    }

    // Compter les documents
    const { count, error: countError } = await supabase
      .from('sales_documents')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ [DEBUG API] Erreur lors du comptage:', countError);
    }

    // Essayer de récupérer tous les documents
    const { data: allDocs, error: allDocsError } = await supabase
      .from('sales_documents')
      .select('id, type, number, created_at')
      .limit(10);

    if (allDocsError) {
      console.error('❌ [DEBUG API] Erreur lors de la récupération des documents:', allDocsError);
    }

    return NextResponse.json({
      success: true,
      environment: {
        supabaseUrl: supabaseUrl ? 'CONFIGURÉ' : 'MANQUANT',
        supabaseKey: supabaseAnonKey ? 'CONFIGURÉ' : 'MANQUANT'
      },
      tables: tables?.map(t => t.table_name) || [],
      salesDocumentsColumns: columns?.map(c => ({
        name: c.column_name,
        type: c.data_type,
        nullable: c.is_nullable
      })) || [],
      documentCount: count || 0,
      documents: allDocs || [],
      errors: {
        tables: tablesError?.message,
        columns: columnsError?.message,
        count: countError?.message,
        allDocs: allDocsError?.message
      }
    });

  } catch (error) {
    console.error('❌ [DEBUG API] Erreur serveur:', error);
    return NextResponse.json({
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 