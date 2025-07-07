import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('PDF API: Variables d\'environnement Supabase manquantes');
  throw new Error('Variables d\'environnement Supabase manquantes');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  request: NextRequest,
  context: any
) {
  // Fix Next.js 15: context peut être une Promise
  const realContext = typeof context.then === 'function' ? await context : context;
  const { id } = realContext.params;

  try {
    if (!id) {
      return NextResponse.json(
        { error: 'ID du document requis' },
        { status: 400 }
      );
    }

    // Vérifier d'abord si le document existe
    const { data: documentCheck, error: checkError } = await supabase
      .from('sales_documents')
      .select('id, type, number')
      .eq('id', id)
      .maybeSingle();

    if (checkError) {
      console.error('PDF API: Erreur lors de la vérification du document:', checkError.message);
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer le document avec le contenu PDF
    const { data: document, error } = await supabase
      .from('sales_documents')
      .select('pdf_content, type, number')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('PDF API: Erreur lors de la récupération du contenu PDF:', error.message);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération du PDF' },
        { status: 500 }
      );
    }

    if (!document || !document.pdf_content) {
      console.error('PDF API: Aucun contenu PDF trouvé pour le document:', id);
      return NextResponse.json(
        { error: 'PDF non trouvé' },
        { status: 404 }
      );
    }

    // Convertir le contenu base64 en buffer
    const pdfBuffer = Buffer.from(document.pdf_content, 'base64');

    // Retourner le PDF avec les bons headers
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${document.type}_${document.number}.pdf"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error) {
    console.error('PDF API: Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 