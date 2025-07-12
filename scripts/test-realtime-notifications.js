require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceRoleKey || !anonKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
});

const supabaseRealtime = createClient(supabaseUrl, anonKey, {
  realtime: { params: { eventsPerSecond: 10 } }
});

async function testRealtimeNotifications() {
  console.log('🔴 Test du système de notifications en temps réel\n');

  try {
    // 1. Récupérer un utilisateur de test
    console.log('1️⃣ Récupération d\'un utilisateur de test...');
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, prenom, nom')
      .limit(2);

    if (usersError || !users || users.length < 2) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError);
      return;
    }

    const testUser = users[0];
    const senderUser = users[1];

    console.log(`✅ Utilisateur de test: ${testUser.email}`);
    console.log(`✅ Utilisateur expéditeur: ${senderUser.email}`);

    // 2. Configurer l'abonnement realtime
    console.log('\n2️⃣ Configuration de l\'abonnement realtime...');
    
    let realtimeConnected = false;
    let notificationReceived = false;
    let receivedNotification = null;

    const channel = supabaseRealtime
      .channel('test-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${testUser.id}`
        },
        (payload) => {
          console.log('🎉 Notification reçue en temps réel!');
          notificationReceived = true;
          receivedNotification = payload.new;
        }
      )
      .subscribe((status) => {
        console.log(`📡 Statut Realtime: ${status}`);
        if (status === 'SUBSCRIBED') {
          realtimeConnected = true;
          console.log('✅ Abonnement realtime établi avec succès');
        }
      });

    // 3. Attendre que la connexion soit établie
    console.log('\n3️⃣ Attente de la connexion realtime...');
    let attempts = 0;
    while (!realtimeConnected && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
      console.log(`   Tentative ${attempts}/10...`);
    }

    if (!realtimeConnected) {
      console.error('❌ Impossible d\'établir la connexion realtime');
      return;
    }

    // 4. Créer une notification de test
    console.log('\n4️⃣ Création d\'une notification de test...');
    const { data: newNotification, error: createError } = await supabaseAdmin
      .from('notifications')
      .insert({
        recipient_id: testUser.id,
        sender_id: senderUser.id,
        title: 'Test Realtime',
        message: 'Ceci est un test de notification en temps réel',
        type: 'info',
        category: 'system'
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Erreur lors de la création de la notification:', createError);
      return;
    }

    console.log('✅ Notification créée:', newNotification.id);

    // 5. Attendre la réception de la notification
    console.log('\n5️⃣ Attente de la réception de la notification...');
    attempts = 0;
    while (!notificationReceived && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
      console.log(`   Attente ${attempts}/10...`);
    }

    if (!notificationReceived) {
      console.error('❌ Notification non reçue en temps réel');
    } else {
      console.log('✅ Notification reçue en temps réel avec succès!');
      console.log('   - ID:', receivedNotification.id);
      console.log('   - Titre:', receivedNotification.title);
    }

    // 6. Nettoyer
    console.log('\n6️⃣ Nettoyage...');
    const { error: deleteError } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('id', newNotification.id);

    if (deleteError) {
      console.error('❌ Erreur lors de la suppression:', deleteError);
    } else {
      console.log('✅ Notification supprimée');
    }

    // 7. Fermer la connexion
    console.log('\n7️⃣ Fermeture de la connexion realtime...');
    await supabaseRealtime.removeChannel(channel);

    // 8. Résumé
    console.log('\n📊 Résumé du test:');
    console.log(`   - Connexion realtime: ${realtimeConnected ? '✅' : '❌'}`);
    console.log(`   - Notification reçue: ${notificationReceived ? '✅' : '❌'}`);
    
    if (realtimeConnected && notificationReceived) {
      console.log('\n🎉 Test realtime réussi! Le système de notifications en temps réel fonctionne correctement.');
    } else {
      console.log('\n❌ Test realtime échoué. Vérifiez la configuration Supabase Realtime.');
    }

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

testRealtimeNotifications(); 