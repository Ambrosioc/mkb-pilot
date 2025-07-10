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

    // Récupérer le nom du pôle pour la notification
    const { data: pole, error: poleError } = await supabase
      .from('poles')
      .select('name')
      .eq('id', pole_id)
      .single();

    if (poleError || !pole) {
      console.error('Erreur lors de la récupération du pôle:', poleError);
      return NextResponse.json(
        { error: 'Pôle non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer le nom de l'administrateur qui effectue l'action
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('prenom, nom')
      .eq('auth_user_id', user.id)
      .single();

    const adminName = adminError || !adminUser 
      ? 'Administrateur' 
      : `${adminUser.prenom} ${adminUser.nom}`.trim() || 'Administrateur';

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
      console.error('Erreur lors de l\'assignation:', error);
      return NextResponse.json(
        { error: 'Erreur lors de l\'assignation du pôle' },
        { status: 500 }
      );
    }

    // Envoyer une notification à l'utilisateur
    try {
      const { data: notification, error: notificationError } = await supabase
        .from('notifications')
        .insert({
          recipient_id: user_id,
          sender_id: user.id,
          title: 'Accès au pôle accordé',
          message: `${adminName} vous a accordé l'accès au pôle "${pole.name}"`,
          type: 'success',
          category: 'user'
        })
        .select()
        .single();

      if (notificationError) {
        console.warn('Erreur lors de l\'envoi de la notification:', notificationError);
      } else {
        console.log('Notification d\'assignation de pôle envoyée:', notification.id);
      }
    } catch (notificationError) {
      console.warn('Erreur lors de l\'envoi de la notification:', notificationError);
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Erreur API poles/assign POST:', error);
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

    // Récupérer le nom du pôle pour la notification
    const { data: pole, error: poleError } = await supabase
      .from('poles')
      .select('name')
      .eq('id', pole_id)
      .single();

    if (poleError || !pole) {
      console.error('Erreur lors de la récupération du pôle:', poleError);
      return NextResponse.json(
        { error: 'Pôle non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer le nom de l'administrateur qui effectue l'action
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('prenom, nom')
      .eq('auth_user_id', user.id)
      .single();

    const adminName = adminError || !adminUser 
      ? 'Administrateur' 
      : `${adminUser.prenom} ${adminUser.nom}`.trim() || 'Administrateur';

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

    // Envoyer une notification à l'utilisateur
    try {
      const { data: notification, error: notificationError } = await supabase
        .from('notifications')
        .insert({
          recipient_id: user_id,
          sender_id: user.id,
          title: 'Accès au pôle retiré',
          message: `${adminName} a retiré votre accès au pôle "${pole.name}"`,
          type: 'warning',
          category: 'user'
        })
        .select()
        .single();

      if (notificationError) {
        console.warn('Erreur lors de l\'envoi de la notification:', notificationError);
      } else {
        console.log('Notification de suppression de pôle envoyée:', notification.id);
      }
    } catch (notificationError) {
      console.warn('Erreur lors de l\'envoi de la notification:', notificationError);
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