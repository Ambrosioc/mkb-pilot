import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// POST - Marquer toutes les notifications comme lues
export async function POST(request: NextRequest) {
  try {
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      console.log('Aucun token d\'autorisation trouvé');
      return NextResponse.json({ error: 'Token d\'autorisation manquant' }, { status: 401 });
    }

    // Créer un client Supabase avec la clé service_role pour contourner RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      }
    );

    // Vérifier l'utilisateur avec le token (pour la sécurité)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Erreur d\'authentification avec token:', authError);
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Récupérer l'ID utilisateur de la table users (pas auth.users)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (userError || !userData) {
      console.error('❌ Erreur lors de la récupération de l\'utilisateur:', {
        userError: userError?.message || 'Aucune erreur spécifique',
        userDataPresent: !!userData,
        authUserIdRecherche: user.id
      });
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const userId = userData.id;

    // Marquer toutes les notifications non lues comme lues
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('recipient_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur inattendue:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 