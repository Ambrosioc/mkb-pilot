import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// GET - Récupérer les notifications d'un utilisateur
export async function GET(request: NextRequest) {
  console.log('=== GET /api/notifications - Début de la requête ===');
  
  try {
    // Vérifier les variables d'environnement
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('Vérification des variables d\'environnement:', {
      supabaseUrl: supabaseUrl ? '✅ Présent' : '❌ Manquant',
      serviceRoleKey: serviceRoleKey ? '✅ Présent' : '❌ Manquant',
      nodeEnv: process.env.NODE_ENV || 'non défini'
    });

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ Variables d\'environnement manquantes:', {
        supabaseUrl: !!supabaseUrl,
        serviceRoleKey: !!serviceRoleKey,
        supabaseUrlLength: supabaseUrl?.length || 0,
        serviceRoleKeyLength: serviceRoleKey?.length || 0
      });
      return NextResponse.json({ 
        error: 'Configuration serveur manquante' 
      }, { status: 500 });
    }

    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    console.log('Vérification du token d\'autorisation:', {
      authHeaderPresent: !!authHeader,
      tokenPresent: !!token,
      tokenLength: token?.length || 0
    });

    if (!token) {
      console.log('❌ Aucun token d\'autorisation trouvé');
      return NextResponse.json({ error: 'Token d\'autorisation manquant' }, { status: 401 });
    }

    // Créer un client Supabase avec la clé service_role pour contourner RLS
    console.log('Création du client Supabase...');
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    });

    // Vérifier l'utilisateur avec le token (pour la sécurité)
    console.log('Vérification de l\'authentification avec le token...');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('❌ Erreur d\'authentification avec token:', {
        authError: authError?.message || 'Aucune erreur spécifique',
        userPresent: !!user,
        userEmail: user?.email || 'non défini'
      });
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    console.log('✅ Authentification réussie pour l\'utilisateur:', {
      email: user.email,
      id: user.id,
      user_metadata: user.user_metadata
    });

    // Récupérer l'ID utilisateur de la table users (pas auth.users)
    console.log('Récupération de l\'ID utilisateur de la table users...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (userError || !userData) {
      console.error('❌ Erreur lors de la récupération de l\'utilisateur:', {
        userError: userError?.message || 'Aucune erreur spécifique',
        userErrorCode: userError?.code || 'non défini',
        userErrorDetails: userError?.details || 'non défini',
        userDataPresent: !!userData,
        authUserIdRecherche: user.id,
        authUserIdType: typeof user.id
      });
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Utiliser l'ID de la table users pour les notifications
    const userId = userData.id;

    console.log('✅ Utilisateur trouvé dans la table users:', {
      userId: userData.id,
      email: userData.email,
      prenom: userData.prenom,
      nom: userData.nom
    });

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('Paramètres de pagination:', { limit, offset });

    // Récupérer les notifications de l'utilisateur (sans jointure automatique)
    console.log('Récupération des notifications...');
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Erreur lors de la récupération des notifications:', {
        error: error.message,
        errorCode: error.code,
        errorDetails: error.details,
        query: 'SELECT notifications',
        recipientId: userId
      });
      return NextResponse.json({ error: 'Erreur lors de la récupération des notifications' }, { status: 500 });
    }

    // Récupérer les informations des senders si des notifications existent
    let notificationsWithSenders = notifications || [];
    if (notifications && notifications.length > 0) {
      console.log('Récupération des informations des senders...');
      
      // Récupérer tous les sender_ids uniques
      const senderIds = Array.from(new Set(notifications.map(n => n.sender_id).filter(id => id)));
      
      if (senderIds.length > 0) {
        const { data: senders, error: sendersError } = await supabase
          .from('users')
          .select('id, prenom, nom, email')
          .in('id', senderIds);

        if (sendersError) {
          console.error('❌ Erreur lors de la récupération des senders:', sendersError);
        } else {
          // Créer un map pour un accès rapide
          const sendersMap = new Map(senders?.map(s => [s.id, s]) || []);
          
          // Enrichir les notifications avec les infos du sender
          notificationsWithSenders = notifications.map(notification => ({
            ...notification,
            sender: notification.sender_id ? sendersMap.get(notification.sender_id) : null
          }));
        }
      }
    }

    console.log('✅ Notifications récupérées avec succès:', {
      count: notificationsWithSenders?.length || 0,
      notifications: notificationsWithSenders?.map(n => ({
        id: n.id,
        title: n.title,
        type: n.type,
        created_at: n.created_at,
        sender: n.sender?.email || 'système'
      })) || []
    });

    console.log('=== GET /api/notifications - Requête terminée avec succès ===');
    return NextResponse.json({ notifications: notificationsWithSenders || [] });
  } catch (error) {
    console.error('❌ Erreur inattendue dans GET /api/notifications:', {
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : 'Pas de stack trace',
      errorType: error?.constructor?.name || 'Type inconnu',
      timestamp: new Date().toISOString()
    });
    return NextResponse.json({ 
      error: 'Erreur serveur interne',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
}

// POST - Créer une nouvelle notification
export async function POST(request: NextRequest) {
  console.log('=== POST /api/notifications - Début de la requête ===');
  
  try {
    // Vérifier les variables d'environnement
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('Vérification des variables d\'environnement:', {
      supabaseUrl: supabaseUrl ? '✅ Présent' : '❌ Manquant',
      serviceRoleKey: serviceRoleKey ? '✅ Présent' : '❌ Manquant',
      nodeEnv: process.env.NODE_ENV || 'non défini'
    });

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ Variables d\'environnement manquantes:', {
        supabaseUrl: !!supabaseUrl,
        serviceRoleKey: !!serviceRoleKey,
        supabaseUrlLength: supabaseUrl?.length || 0,
        serviceRoleKeyLength: serviceRoleKey?.length || 0
      });
      return NextResponse.json({ 
        error: 'Configuration serveur manquante' 
      }, { status: 500 });
    }

    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    console.log('Vérification du token d\'autorisation:', {
      authHeaderPresent: !!authHeader,
      tokenPresent: !!token,
      tokenLength: token?.length || 0
    });

    if (!token) {
      console.log('❌ Aucun token d\'autorisation trouvé');
      return NextResponse.json({ error: 'Token d\'autorisation manquant' }, { status: 401 });
    }

    // Créer un client Supabase avec la clé service_role pour contourner RLS
    console.log('Création du client Supabase...');
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    });

    // Vérifier l'utilisateur avec le token
    console.log('Vérification de l\'authentification avec le token...');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('❌ Erreur d\'authentification avec token:', {
        authError: authError?.message || 'Aucune erreur spécifique',
        userPresent: !!user,
        userEmail: user?.email || 'non défini'
      });
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    console.log('✅ Authentification réussie pour l\'utilisateur:', {
      email: user.email,
      id: user.id,
      user_metadata: user.user_metadata
    });

    // Récupérer l'ID utilisateur de la table users (pas auth.users)
    console.log('Récupération de l\'ID utilisateur de la table users (POST)...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (userError || !userData) {
      console.error('❌ Erreur lors de la récupération de l\'utilisateur (POST):', {
        userError: userError?.message || 'Aucune erreur spécifique',
        userErrorCode: userError?.code || 'non défini',
        userErrorDetails: userError?.details || 'non défini',
        userDataPresent: !!userData,
        authUserIdRecherche: user.id,
        authUserIdType: typeof user.id
      });
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Utiliser l'ID de la table users pour les notifications
    const senderUserId = userData.id;

    // Parser le body de la requête
    console.log('Parsing du body de la requête...');
    let body;
    try {
      body = await request.json();
      console.log('✅ Body parsé avec succès:', body);
    } catch (parseError) {
      console.error('❌ Erreur lors du parsing du body:', {
        error: parseError instanceof Error ? parseError.message : 'Erreur inconnue',
        bodyText: await request.text()
      });
      return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 });
    }

    const { recipient_user_id, title, message, type, category } = body;

    console.log('Validation des données reçues:', {
      recipient_user_id: recipient_user_id || '❌ Manquant',
      title: title || '❌ Manquant',
      message: message || '❌ Manquant',
      type: type || '❌ Manquant',
      category: category || 'système (par défaut)'
    });

    if (!recipient_user_id || !title || !message || !type) {
      console.error('❌ Données manquantes dans la requête:', {
        recipient_user_id: !!recipient_user_id,
        title: !!title,
        message: !!message,
        type: !!type
      });
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // Créer la notification directement avec les IDs utilisateur
    console.log('Création de la notification dans la base de données...');
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
      console.error('❌ Erreur lors de la création de la notification:', {
        error: error.message,
        errorCode: error.code,
        errorDetails: error.details,
        dataInserted: {
          recipient_id: recipient_user_id,
          sender_id: senderUserId,
          title,
          message,
          type,
          category: category || 'system'
        }
      });
      return NextResponse.json({ error: 'Erreur lors de la création de la notification' }, { status: 500 });
    }

    console.log('✅ Notification créée avec succès:', {
      notificationId: notification.id,
      recipientId: notification.recipient_id,
      senderId: notification.sender_id,
      title: notification.title,
      type: notification.type,
      createdAt: notification.created_at
    });

    console.log('=== POST /api/notifications - Requête terminée avec succès ===');
    
    // Retourner une réponse de succès avec l'ID de la notification
    return NextResponse.json({ 
      success: true, 
      notification_id: notification.id,
      message: 'Notification créée avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur inattendue dans POST /api/notifications:', {
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : 'Pas de stack trace',
      errorType: error?.constructor?.name || 'Type inconnu',
      timestamp: new Date().toISOString()
    });
    return NextResponse.json({ 
      error: 'Erreur serveur interne',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
} 