require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Configuration:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  isLocal: supabaseUrl?.includes('127.0.0.1') || supabaseUrl?.includes('localhost')
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testNotificationsAPI() {
  console.log('🧪 Test de l\'API notifications - Logique corrigée');
  console.log('=' .repeat(50));

  try {
    // 1. Connexion utilisateur existant
    console.log('1️⃣ Connexion avec a.cazimira@gmail.com...');
    
    const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'a.cazimira@gmail.com',
      password: 'U4d5s*pg7Gtr.YA'
    });

    if (signInError || !user) {
      console.error('❌ Erreur de connexion:', signInError?.message);
      return;
    }

    console.log('✅ Connecté:', user.email, 'ID:', user.id);

    // 2. Récupérer le token
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    if (!accessToken) {
      console.error('❌ Pas de token');
      return;
    }

    console.log('✅ Token d\'accès récupéré');

    // 3. Test GET sans x-user-id (nouvelle logique)
    console.log('\n2️⃣ Test GET /api/notifications (sans x-user-id)...');
    
    const getResponse = await fetch('http://localhost:3000/api/notifications', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Status:', getResponse.status, getResponse.statusText);

    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log('✅ GET réussi - Notifications:', data.notifications?.length || 0);
      
      // Afficher quelques détails des notifications
      if (data.notifications && data.notifications.length > 0) {
        console.log('📋 Détails des notifications:');
        data.notifications.slice(0, 3).forEach((notif, index) => {
          console.log(`   ${index + 1}. ${notif.title} (${notif.type}) - ${notif.created_at}`);
        });
      }
    } else {
      const error = await getResponse.json();
      console.error('❌ GET échoué:', error);
    }

    // 4. Test avec x-user-id incorrect (pour vérifier la sécurité)
    console.log('\n3️⃣ Test GET (avec x-user-id incorrect)...');
    
    const getResponseWrong = await fetch('http://localhost:3000/api/notifications', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'x-user-id': 'wrong-user-id',
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Status (wrong user-id):', getResponseWrong.status, getResponseWrong.statusText);

    if (getResponseWrong.ok) {
      const data = await getResponseWrong.json();
      console.log('✅ GET réussi même avec mauvais x-user-id (utilise token)');
    } else {
      const error = await getResponseWrong.json();
      console.log('❌ GET échoué avec mauvais x-user-id:', error);
    }

    // 5. Test POST pour créer une notification
    console.log('\n4️⃣ Test POST /api/notifications...');
    
    const testNotification = {
      recipient_user_id: user.id, // Utiliser l'ID de l'utilisateur connecté
      title: 'Test notification API',
      message: 'Ceci est un test de l\'API notifications avec la nouvelle logique',
      type: 'info',
      category: 'system' // <-- valeur autorisée
    };

    const postResponse = await fetch('http://localhost:3000/api/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testNotification)
    });

    console.log('📊 Status POST:', postResponse.status, postResponse.statusText);

    if (postResponse.ok) {
      const postData = await postResponse.json();
      console.log('✅ POST réussi:', postData);
    } else {
      const error = await postResponse.json();
      console.error('❌ POST échoué:', error);
    }

    console.log('\n🎉 Test terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await supabase.auth.signOut();
    console.log('👋 Déconnexion');
  }
}

testNotificationsAPI(); 