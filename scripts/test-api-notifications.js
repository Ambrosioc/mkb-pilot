require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase pour récupérer le token et l'user ID
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testApiNotifications() {
  try {
    console.log('🧪 Test des API Next.js de notifications...');
    
    // 1. Se connecter pour obtenir un token
    console.log('🔐 Connexion pour obtenir un token...');
    const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
      email: 'a.cazimira@gmail.com', // Utilise un email de ta liste
      password: 'test123' // Remplace par le bon mot de passe
    });
    
    if (authError || !session) {
      console.error('❌ Erreur de connexion:', authError);
      return;
    }
    
    console.log('✅ Connexion réussie');
    console.log('Token:', session.access_token ? 'Présent' : 'Manquant');
    console.log('User ID:', session.user.id);
    
    // 2. Récupérer l'ID utilisateur depuis la table users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', session.user.id)
      .single();
    
    if (userError || !userData) {
      console.error('❌ Erreur lors de la récupération de l\'utilisateur:', userError);
      return;
    }
    
    console.log('👤 User ID de la table users:', userData.id);
    
    // 3. Tester l'API GET /api/notifications
    console.log('📡 Test de l\'API GET /api/notifications...');
    const response = await fetch('http://localhost:3000/api/notifications?limit=10&offset=0', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'x-user-id': userData.id
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur API GET:', response.status, errorText);
      return;
    }
    
    const notifications = await response.json();
    console.log('✅ API GET réussie');
    console.log('📢 Notifications récupérées:', notifications.notifications?.length || 0);
    
    if (notifications.notifications && notifications.notifications.length > 0) {
      notifications.notifications.forEach((notif, index) => {
        console.log(`  ${index + 1}. ${notif.title} - ${notif.read ? 'Lu' : 'Non lu'}`);
      });
    }
    
    // 4. Tester l'API POST /api/notifications (créer une notification)
    console.log('📝 Test de l\'API POST /api/notifications...');
    const createResponse = await fetch('http://localhost:3000/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'x-user-id': userData.id
      },
      body: JSON.stringify({
        recipient_user_id: userData.id,
        title: 'Test API Next.js',
        message: 'Ceci est un test de l\'API Next.js avec service_role',
        type: 'info',
        category: 'system'
      })
    });
    
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('❌ Erreur API POST:', createResponse.status, errorText);
      return;
    }
    
    const createResult = await createResponse.json();
    console.log('✅ API POST réussie');
    console.log('📝 Notification créée:', createResult.notification_id);
    
    console.log('🎉 Test des API terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

testApiNotifications(); 