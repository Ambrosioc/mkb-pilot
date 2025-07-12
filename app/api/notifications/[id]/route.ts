import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// PATCH - Marquer une notification comme lue
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    // Marquer la notification comme lue
    const { data: notification, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('recipient_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors du marquage comme lu:', error);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    return NextResponse.json({ notification });
  } catch (error) {
    console.error('Erreur inattendue:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer une notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    // Supprimer la notification
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('recipient_id', userId);

    if (error) {
      console.error('Erreur lors de la suppression:', error);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur inattendue:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 