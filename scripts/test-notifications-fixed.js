// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.log('SUPABASE_SERVICE_ROLE_KEY:', !!serviceRoleKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

async function testNotifications() {
  console.log('🧪 Test du système de notifications après correction des clés étrangères\n');

  try {
    // 1. Vérifier que la table notifications existe
    console.log('1️⃣ Vérification de l\'existence de la table notifications...');
    const { data: tableExists, error: tableError } = await supabase
      .rpc('check_table_exists', { table_name: 'notifications' })
      .single();

    if (tableError) {
      // Fallback: essayer de récupérer une notification pour vérifier l'existence
      const { data: testNotification, error: testError } = await supabase
        .from('notifications')
        .select('id')
        .limit(1);

      if (testError) {
        console.error('❌ La table notifications n\'existe pas ou n\'est pas accessible:', testError);
        return;
      }
      console.log('✅ La table notifications existe et est accessible');
    } else {
      console.log('✅ La table notifications existe');
    }

    // 2. Vérifier qu'il y a des utilisateurs dans la table users
    console.log('\n2️⃣ Vérification des utilisateurs dans la table users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, prenom, nom')
      .limit(5);

    if (usersError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError);
      return;
    }

    if (!users || users.length === 0) {
      console.error('❌ Aucun utilisateur trouvé dans la table users');
      return;
    }

    console.log(`✅ ${users.length} utilisateurs trouvés:`);
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.prenom} ${user.nom}) - ID: ${user.id}`);
    });

    // 3. Tester la création d'une notification
    console.log('\n3️⃣ Test de création d\'une notification...');
    const testUser = users[0];
    const senderUser = users[1] || users[0];

    const { data: newNotification, error: createError } = await supabase
      .from('notifications')
      .insert({
        recipient_id: testUser.id,
        sender_id: senderUser.id,
        title: 'Test de notification',
        message: 'Ceci est un test après correction des clés étrangères',
        type: 'info',
        category: 'system'
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Erreur lors de la création de la notification:', createError);
      return;
    }

    console.log('✅ Notification créée avec succès:');
    console.log(`   - ID: ${newNotification.id}`);
    console.log(`   - Titre: ${newNotification.title}`);
    console.log(`   - Destinataire: ${testUser.email}`);
    console.log(`   - Expéditeur: ${senderUser.email}`);

    // 4. Tester la récupération des notifications avec jointure
    console.log('\n4️⃣ Test de récupération des notifications avec jointure...');
    const { data: notificationsWithSenders, error: fetchError } = await supabase
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
      .eq('recipient_id', testUser.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération des notifications:', fetchError);
      return;
    }

    console.log(`✅ ${notificationsWithSenders.length} notifications récupérées:`);
    notificationsWithSenders.forEach(notif => {
      const senderName = notif.sender ? `${notif.sender.prenom} ${notif.sender.nom}` : 'Système';
      console.log(`   - ${notif.title} (par ${senderName}) - ${notif.created_at}`);
    });

    // 5. Tester la récupération des notifications sans jointure (comme dans l'API)
    console.log('\n5️⃣ Test de récupération des notifications sans jointure...');
    const { data: notificationsSimple, error: fetchSimpleError } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', testUser.id)
      .order('created_at', { ascending: false });

    if (fetchSimpleError) {
      console.error('❌ Erreur lors de la récupération simple des notifications:', fetchSimpleError);
      return;
    }

    console.log(`✅ ${notificationsSimple.length} notifications récupérées (sans jointure):`);
    notificationsSimple.forEach(notif => {
      console.log(`   - ${notif.title} (sender_id: ${notif.sender_id}) - ${notif.created_at}`);
    });

    // 6. Nettoyer la notification de test
    console.log('\n6️⃣ Nettoyage de la notification de test...');
    const { error: deleteError } = await supabase
      .from('notifications')
      .delete()
      .eq('id', newNotification.id);

    if (deleteError) {
      console.error('❌ Erreur lors de la suppression de la notification de test:', deleteError);
    } else {
      console.log('✅ Notification de test supprimée');
    }

    console.log('\n🎉 Tous les tests sont passés avec succès!');
    console.log('✅ Le système de notifications fonctionne correctement après les corrections.');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Exécuter le test
testNotifications(); 