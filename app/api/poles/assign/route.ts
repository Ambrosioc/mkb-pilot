import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { user_id, pole_id } = await req.json();

    if (!user_id || !pole_id) {
      return NextResponse.json(
        { error: 'user_id et pole_id sont requis' },
        { status: 400 }
      );
    }

    // Créer le client Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Configuration Supabase manquante' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupérer le token d'authentification depuis les headers
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Assigner le pôle à l'utilisateur
    const { data, error } = await supabase
      .from('user_poles')
      .insert({
        user_id: user_id,
        pole_id: pole_id
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'L\'utilisateur est déjà affecté à ce pôle' },
          { status: 409 }
        );
      }
      console.error('Erreur lors de l\'assignation:', error);
      return NextResponse.json(
        { error: 'Erreur lors de l\'assignation du pôle' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Erreur API poles/assign:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user_id, pole_id } = await req.json();

    if (!user_id || !pole_id) {
      return NextResponse.json(
        { error: 'user_id et pole_id sont requis' },
        { status: 400 }
      );
    }

    // Créer le client Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Configuration Supabase manquante' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupérer le token d'authentification depuis les headers
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Supprimer l'affectation du pôle
    const { error } = await supabase
      .from('user_poles')
      .delete()
      .eq('user_id', user_id)
      .eq('pole_id', pole_id);

    if (error) {
      console.error('Erreur lors de la suppression:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression de l\'affectation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true
    });

  } catch (error) {
    console.error('Erreur API poles/assign DELETE:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 