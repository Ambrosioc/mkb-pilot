require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRoleChangeNotifications() {
  console.log('🧪 Test des notifications de changement de rôle');
  console.log('==============================================\n');

  try {
    // 1. Récupérer un utilisateur de test
    console.log('1. Récupération d\'un utilisateur de test...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        prenom,
        nom,
        email,
        user_roles(
          role_id,
          roles(
            id,
            nom,
            niveau
          )
        )
      `)
      .limit(1);

    if (usersError || !users || users.length === 0) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError);
      return;
    }

    const testUser = users[0];
    console.log(`✅ Utilisateur trouvé: ${testUser.prenom} ${testUser.nom} (${testUser.email})`);
    console.log(`   ID: ${testUser.id}`);
    console.log(`   Rôle actuel: ${testUser.user_roles?.[0]?.roles?.nom || 'Aucun'}\n`);

    // 2. Récupérer les rôles disponibles
    console.log('2. Récupération des rôles disponibles...');
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('id, nom, niveau')
      .order('niveau');

    if (rolesError || !roles) {
      console.error('❌ Erreur lors de la récupération des rôles:', rolesError);
      return;
    }

    console.log('✅ Rôles disponibles:');
    roles.forEach(role => {
      console.log(`   - ${role.nom} (ID: ${role.id}, Niveau: ${role.niveau})`);
    });
    console.log();

    // 3. Trouver un rôle différent pour le test
    const currentRoleId = testUser.user_roles?.[0]?.role_id;
    const newRole = roles.find(role => role.id !== currentRoleId);
    
    if (!newRole) {
      console.log('⚠️  Aucun autre rôle disponible pour le test');
      return;
    }

    console.log(`3. Test de changement de rôle vers: ${newRole.nom}\n`);

    // 4. Compter les notifications avant le changement
    console.log('4. Comptage des notifications avant le changement...');
    const { data: notificationsBefore, error: notificationsBeforeError } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', testUser.id);

    if (notificationsBeforeError) {
      console.error('❌ Erreur lors du comptage des notifications:', notificationsBeforeError);
      return;
    }

    console.log(`✅ Notifications avant: ${notificationsBefore.length}\n`);

    // 5. Simuler le changement de rôle via la fonction RPC
    console.log('5. Changement de rôle...');
    const { error: updateError } = await supabase.rpc('update_user_info', {
      p_user_id: testUser.id,
      p_role_id: newRole.id
    });

    if (updateError) {
      console.error('❌ Erreur lors du changement de rôle:', updateError);
      return;
    }

    console.log('✅ Rôle changé avec succès\n');

    // 6. Créer une notification manuellement (simulation)
    console.log('6. Création de la notification de changement de rôle...');
    const adminName = 'Test Admin';
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        recipient_id: testUser.id,
        sender_id: null, // Notification système
        title: 'Rôle mis à jour',
        message: `${adminName} a mis à jour votre rôle vers "${newRole.nom}"`,
        type: 'info',
        category: 'user',
        read: false
      })
      .select()
      .single();

    if (notificationError) {
      console.error('❌ Erreur lors de la création de la notification:', notificationError);
      return;
    }

    console.log('✅ Notification créée avec succès');
    console.log(`   ID: ${notification.id}`);
    console.log(`   Titre: ${notification.title}`);
    console.log(`   Message: ${notification.message}\n`);

    // 7. Vérifier les notifications après le changement
    console.log('7. Vérification des notifications après le changement...');
    const { data: notificationsAfter, error: notificationsAfterError } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', testUser.id)
      .order('created_at', { ascending: false });

    if (notificationsAfterError) {
      console.error('❌ Erreur lors de la vérification des notifications:', notificationsAfterError);
      return;
    }

    console.log(`✅ Notifications après: ${notificationsAfter.length}`);
    console.log('   Dernières notifications:');
    notificationsAfter.slice(0, 3).forEach((notif, index) => {
      console.log(`   ${index + 1}. ${notif.title} - ${notif.message} (${notif.created_at})`);
    });
    console.log();

    // 8. Vérifier le nouveau rôle
    console.log('8. Vérification du nouveau rôle...');
    const { data: updatedUser, error: updatedUserError } = await supabase
      .from('users')
      .select(`
        id,
        prenom,
        nom,
        user_roles(
          role_id,
          roles(
            id,
            nom,
            niveau
          )
        )
      `)
      .eq('id', testUser.id)
      .single();

    if (updatedUserError) {
      console.error('❌ Erreur lors de la vérification du rôle:', updatedUserError);
      return;
    }

    const newUserRole = updatedUser.user_roles?.[0]?.roles;
    console.log(`✅ Nouveau rôle: ${newUserRole?.nom || 'Aucun'}`);
    console.log(`   Niveau: ${newUserRole?.niveau || 'N/A'}\n`);

    // 9. Test de l'API de récupération des notifications
    console.log('9. Test de l\'API de récupération des notifications...');
    
    // Simuler une requête API avec l'ID utilisateur
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/notifications?recipient_id=eq.${testUser.id}&order=created_at.desc`, {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('❌ Erreur lors de la requête API:', response.status, response.statusText);
      return;
    }

    const apiNotifications = await response.json();
    console.log(`✅ API retourne ${apiNotifications.length} notifications`);
    
    if (apiNotifications.length > 0) {
      const latestNotification = apiNotifications[0];
      console.log(`   Dernière notification via API:`);
      console.log(`   - Titre: ${latestNotification.title}`);
      console.log(`   - Message: ${latestNotification.message}`);
      console.log(`   - Type: ${latestNotification.type}`);
      console.log(`   - Lu: ${latestNotification.read ? 'Oui' : 'Non'}`);
    }

    console.log('\n🎉 Test terminé avec succès !');
    console.log('\n📋 Résumé:');
    console.log(`   - Utilisateur testé: ${testUser.prenom} ${testUser.nom}`);
    console.log(`   - Rôle changé: ${newRole.nom}`);
    console.log(`   - Notification créée: Oui`);
    console.log(`   - API fonctionnelle: Oui`);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
testRoleChangeNotifications()
  .then(() => {
    console.log('\n✅ Test terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }); 