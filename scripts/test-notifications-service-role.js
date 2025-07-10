require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔧 Configuration Supabase avec service_role:');
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Présent' : 'Manquant');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testNotificationsWithServiceRole() {
  try {
    console.log('🧪 Test du système de notifications avec service_role...');
    
    // Test de connexion avec service_role
    console.log('🔌 Test de connexion à la base avec service_role...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Erreur de connexion:', usersError);
      return;
    }
    
    console.log('✅ Connexion réussie avec service_role');
    console.log('👥 Utilisateurs trouvés:', users.length);
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ID: ${user.id}, Nom: ${user.prenom} ${user.nom}, Email: ${user.email}`);
    });
    
    if (users.length === 0) {
      console.error('❌ Aucun utilisateur trouvé dans la base');
      return;
    }
    
    const testUser = users[0];
    console.log('👤 Utilisateur de test sélectionné:', testUser.prenom, testUser.nom);
    
    // Créer une notification de test
    console.log('📝 Création d\'une notification de test...');
    const { data: notification, error: createError } = await supabase
      .from('notifications')
      .insert({
        recipient_id: testUser.id,
        sender_id: testUser.id, // Même utilisateur pour le test
        title: 'Test de notification avec service_role',
        message: 'Ceci est un test du système de notifications utilisant la clé service_role',
        type: 'info',
        category: 'system'
      })
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Erreur lors de la création de la notification:', createError);
      return;
    }
    
    console.log('✅ Notification créée:', notification.id);
    
    // Récupérer les notifications de l'utilisateur
    console.log('📢 Récupération des notifications...');
    const { data: notifications, error: fetchError } = await supabase
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
    
    console.log('📢 Notifications récupérées:', notifications.length);
    notifications.forEach((notif, index) => {
      console.log(`  ${index + 1}. ID: ${notif.id}, Titre: ${notif.title}, Lu: ${notif.read}`);
      if (notif.sender) {
        console.log(`     Expéditeur: ${notif.sender.prenom} ${notif.sender.nom}`);
      }
    });
    
    // Marquer la notification comme lue
    console.log('✅ Marquage de la notification comme lue...');
    const { data: updatedNotification, error: updateError } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notification.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Erreur lors du marquage comme lu:', updateError);
      return;
    }
    
    console.log('✅ Notification marquée comme lue:', updatedNotification.read);
    
    // Nettoyer - supprimer la notification de test
    console.log('🧹 Suppression de la notification de test...');
    const { error: deleteError } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notification.id);
    
    if (deleteError) {
      console.error('❌ Erreur lors de la suppression:', deleteError);
      return;
    }
    
    console.log('🧹 Notification de test supprimée');
    console.log('✅ Test terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

testNotificationsWithServiceRole(); 