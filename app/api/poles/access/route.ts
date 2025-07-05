import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const poleName = url.searchParams.get('pole');
    
    if (!poleName) {
      return NextResponse.json(
        { error: 'Paramètre pole requis' },
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
        { role_level: null, can_read: false, can_write: false, can_manage: false },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { role_level: null, can_read: false, can_write: false, can_manage: false },
        { status: 401 }
      );
    }

    // Utiliser la fonction RPC pour obtenir les accès
    const { data, error } = await supabase
      .rpc('get_user_pole_access', {
        p_user_id: user.id,
        p_pole_name: poleName
      });

    if (error) {
      console.error('Erreur get_user_pole_access:', error);
      return NextResponse.json(
        { role_level: null, can_read: false, can_write: false, can_manage: false },
        { status: 500 }
      );
    }

    // Si aucun accès trouvé, retourner des permissions par défaut
    if (!data || data.length === 0) {
      return NextResponse.json({
        role_level: null,
        can_read: false,
        can_write: false,
        can_manage: false
      });
    }

    // Retourner le premier résultat (il ne devrait y en avoir qu'un)
    const access = data[0];
    return NextResponse.json({
      role_level: access.role_level,
      can_read: access.can_read,
      can_write: access.can_write,
      can_manage: access.can_manage
    });

  } catch (error) {
    console.error('Erreur API poles/access:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 