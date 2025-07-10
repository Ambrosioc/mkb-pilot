require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testUserLookup() {
  try {
    console.log('🔍 Test de la table users...');
    
    // Vérifier la structure de la table users
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .limit(10);
    
    if (error) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
      return;
    }
    
    console.log('✅ Utilisateurs trouvés:', users.length);
    console.log('📋 Structure des utilisateurs:');
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ID: ${user.id}, Auth ID: ${user.auth_user_id}, Nom: ${user.prenom} ${user.nom}, Email: ${user.email}`);
    });
    
    // Vérifier s'il y a des utilisateurs avec auth_user_id
    const { data: usersWithAuth, error: authError } = await supabase
      .from('users')
      .select('id, auth_user_id, prenom, nom, email')
      .not('auth_user_id', 'is', null);
    
    if (authError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs avec auth_user_id:', authError);
      return;
    }
    
    console.log('\n🔑 Utilisateurs avec auth_user_id:', usersWithAuth.length);
    usersWithAuth.forEach((user, index) => {
      console.log(`  ${index + 1}. Auth ID: ${user.auth_user_id}, Nom: ${user.prenom} ${user.nom}`);
    });
    
    // Vérifier la table notifications
    console.log('\n📢 Test de la table notifications...');
    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .limit(5);
    
    if (notifError) {
      console.error('❌ Erreur lors de la récupération des notifications:', notifError);
    } else {
      console.log('✅ Notifications trouvées:', notifications.length);
      notifications.forEach((notif, index) => {
        console.log(`  ${index + 1}. ID: ${notif.id}, Recipient: ${notif.recipient_id}, Titre: ${notif.title}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

testUserLookup(); 