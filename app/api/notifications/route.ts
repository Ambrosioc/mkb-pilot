import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// GET - Récupérer les notifications d'un utilisateur
export async function GET(request: NextRequest) {
  try {
    // Vérifier les variables d'environnement
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Variables d\'environnement manquantes:', {
        supabaseUrl: !!supabaseUrl,
        serviceRoleKey: !!serviceRoleKey
      });
      return NextResponse.json({ 
        error: 'Configuration serveur manquante' 
      }, { status: 500 });
    }

    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      console.log('Aucun token d\'autorisation trouvé');
      return NextResponse.json({ error: 'Token d\'autorisation manquant' }, { status: 401 });
    }

    // Récupérer l'ID utilisateur depuis les headers
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      console.log('Aucun user-id trouvé dans les headers');
      return NextResponse.json({ error: 'User ID manquant' }, { status: 400 });
    }

    console.log('User ID reçu:', userId);

    // Créer un client Supabase avec la clé service_role pour contourner RLS
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    });

    // Vérifier l'utilisateur avec le token (pour la sécurité)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Erreur d\'authentification avec token:', authError);
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier que l'utilisateur existe dans la table users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', userError);
      console.error('User ID recherché:', userId);
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    console.log('Utilisateur trouvé dans la table users:', userData);

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Récupérer les notifications de l'utilisateur avec jointure sur users
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select(`
        *,
        sender:users!notifications_sender_id_fkey(
          id,
          prenom,
          nom,
          email
        )
      `)
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      return NextResponse.json({ error: 'Erreur lors de la récupération des notifications' }, { status: 500 });
    }

    console.log('Notifications récupérées:', notifications?.length || 0);
    return NextResponse.json({ notifications: notifications || [] });
  } catch (error) {
    console.error('Erreur inattendue dans GET /api/notifications:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur interne',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
}

// POST - Créer une nouvelle notification
export async function POST(request: NextRequest) {
  try {
    // Vérifier les variables d'environnement
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Variables d\'environnement manquantes:', {
        supabaseUrl: !!supabaseUrl,
        serviceRoleKey: !!serviceRoleKey
      });
      return NextResponse.json({ 
        error: 'Configuration serveur manquante' 
      }, { status: 500 });
    }

    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      console.log('Aucun token d\'autorisation trouvé');
      return NextResponse.json({ error: 'Token d\'autorisation manquant' }, { status: 401 });
    }

    // Récupérer l'ID utilisateur depuis les headers
    const senderUserId = request.headers.get('x-user-id');
    
    if (!senderUserId) {
      console.log('Aucun user-id trouvé dans les headers');
      return NextResponse.json({ error: 'User ID manquant' }, { status: 400 });
    }

    // Créer un client Supabase avec la clé service_role pour contourner RLS
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    });

    // Vérifier l'utilisateur avec le token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Erreur d\'authentification avec token:', authError);
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const body = await request.json();
    const { recipient_user_id, title, message, type, category } = body;

    if (!recipient_user_id || !title || !message || !type) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // Créer la notification directement avec les IDs utilisateur
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        recipient_id: recipient_user_id,
        sender_id: senderUserId,
        title,
        message,
        type,
        category: category || 'system'
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création de la notification:', error);
      return NextResponse.json({ error: 'Erreur lors de la création de la notification' }, { status: 500 });
    }

    // Retourner une réponse de succès avec l'ID de la notification
    return NextResponse.json({ 
      success: true, 
      notification_id: notification.id,
      message: 'Notification créée avec succès'
    });
  } catch (error) {
    console.error('Erreur inattendue dans POST /api/notifications:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur interne',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
} 