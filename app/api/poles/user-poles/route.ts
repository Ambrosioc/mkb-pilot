import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
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

    // Utiliser la fonction RPC pour obtenir tous les pôles de l'utilisateur
    const { data, error } = await supabase
      .rpc('get_user_poles', {
        p_user_id: user.id
      });

    if (error) {
      console.error('Erreur get_user_poles:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des pôles' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      poles: data || []
    });

  } catch (error) {
    console.error('Erreur API poles/user-poles:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 