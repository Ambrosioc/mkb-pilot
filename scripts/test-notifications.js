require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔧 Configuration Supabase:');
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Présent' : 'Manquant');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testNotifications() {
  try {
    console.log('🧪 Test du système de notifications...');
    
    // Test de connexion
    console.log('🔌 Test de connexion à la base...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erreur de connexion:', testError);
      return;
    }
    
    console.log('✅ Connexion réussie');
    
    // Récupérer un utilisateur pour tester
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, prenom, nom, email')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError);
      return;
    }
    
    if (!users || users.length === 0) {
      console.error('❌ Aucun utilisateur trouvé dans la table users');
      return;
    }
    
    const testUser = users[0];
    console.log('👤 Utilisateur de test:', testUser);
    
    // Créer une notification de test
    const { data: notification, error: createError } = await supabase
      .from('notifications')
      .insert({
        recipient_id: testUser.id,
        sender_id: testUser.id, // Même utilisateur pour le test
        title: 'Test de notification',
        message: 'Ceci est un test du système de notifications',
        type: 'info',
        category: 'system'
      })
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Erreur lors de la création de la notification:', createError);
      return;
    }
    
    console.log('✅ Notification créée:', notification);
    
    // Récupérer les notifications de l'utilisateur
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

testNotifications(); 