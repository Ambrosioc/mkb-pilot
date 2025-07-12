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

    // Récupérer l'ID utilisateur depuis les headers
    const userId = request.headers.get('x-user-id');
    
    console.log('Vérification du user-id:', {
      userIdPresent: !!userId,
      userId: userId || 'non défini',
      allHeaders: Object.fromEntries(request.headers.entries())
    });
    
    if (!userId) {
      console.log('❌ Aucun user-id trouvé dans les headers');
      return NextResponse.json({ error: 'User ID manquant' }, { status: 400 });
    }

    console.log('✅ User ID reçu:', userId);

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

    console.log('✅ Authentification réussie pour l\'utilisateur:', user.email);

    // Vérifier que l'utilisateur existe dans la table users
    console.log('Vérification de l\'existence de l\'utilisateur dans la table users...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('❌ Erreur lors de la récupération de l\'utilisateur:', {
        userError: userError?.message || 'Aucune erreur spécifique',
        userErrorCode: userError?.code || 'non défini',
        userErrorDetails: userError?.details || 'non défini',
        userDataPresent: !!userData,
        userIdRecherche: userId
      });
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

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

    // Récupérer les notifications de l'utilisateur avec jointure sur users
    console.log('Récupération des notifications avec jointure...');
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
      console.error('❌ Erreur lors de la récupération des notifications:', {
        error: error.message,
        errorCode: error.code,
        errorDetails: error.details,
        query: 'SELECT notifications avec jointure users'
      });
      return NextResponse.json({ error: 'Erreur lors de la récupération des notifications' }, { status: 500 });
    }

    console.log('✅ Notifications récupérées avec succès:', {
      count: notifications?.length || 0,
      notifications: notifications?.map(n => ({
        id: n.id,
        title: n.title,
        type: n.type,
        created_at: n.created_at,
        sender: n.sender?.email || 'système'
      })) || []
    });

    console.log('=== GET /api/notifications - Requête terminée avec succès ===');
    return NextResponse.json({ notifications: notifications || [] });
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

    // Récupérer l'ID utilisateur depuis les headers
    const senderUserId = request.headers.get('x-user-id');
    
    console.log('Vérification du sender user-id:', {
      senderUserIdPresent: !!senderUserId,
      senderUserId: senderUserId || 'non défini'
    });
    
    if (!senderUserId) {
      console.log('❌ Aucun user-id trouvé dans les headers');
      return NextResponse.json({ error: 'User ID manquant' }, { status: 400 });
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

    console.log('✅ Authentification réussie pour l\'utilisateur:', user.email);

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