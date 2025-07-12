const { createClient } = require('@supabase/supabase-js');

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testNotificationsAPI() {
  console.log('🧪 Test de l\'API notifications avec la nouvelle logique d\'authentification');
  console.log('=' .repeat(60));

  try {
    // 1. Connexion d'un utilisateur de test
    console.log('1️⃣ Connexion utilisateur...');
    const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'admin@mkb.com',
      password: 'admin123'
    });

    if (signInError || !user) {
      console.error('❌ Erreur de connexion:', signInError?.message);
      return;
    }

    console.log('✅ Utilisateur connecté:', {
      id: user.id,
      email: user.email
    });

    // 2. Récupérer le token d'accès
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    if (!accessToken) {
      console.error('❌ Pas de token d\'accès');
      return;
    }

    console.log('✅ Token d\'accès récupéré');

    // 3. Test GET /api/notifications
    console.log('\n2️⃣ Test GET /api/notifications...');
    
    const getResponse = await fetch('http://localhost:3000/api/notifications', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Réponse GET:', {
      status: getResponse.status,
      statusText: getResponse.statusText
    });

    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log('✅ GET réussi:', {
        notificationsCount: getData.notifications?.length || 0
      });
    } else {
      const errorData = await getResponse.json();
      console.error('❌ GET échoué:', errorData);
    }

    // 4. Test POST /api/notifications
    console.log('\n3️⃣ Test POST /api/notifications...');
    
    const testNotification = {
      recipient_user_id: user.id, // Utiliser l'ID de l'utilisateur connecté
      title: 'Test notification',
      message: 'Ceci est un test de notification',
      type: 'info',
      category: 'test'
    };

    const postResponse = await fetch('http://localhost:3000/api/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testNotification)
    });

    console.log('📊 Réponse POST:', {
      status: postResponse.status,
      statusText: postResponse.statusText
    });

    if (postResponse.ok) {
      const postData = await postResponse.json();
      console.log('✅ POST réussi:', postData);
    } else {
      const errorData = await postResponse.json();
      console.error('❌ POST échoué:', errorData);
    }

    // 5. Vérifier que la notification a été créée
    console.log('\n4️⃣ Vérification de la notification créée...');
    
    const verifyResponse = await fetch('http://localhost:3000/api/notifications', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      const newNotifications = verifyData.notifications?.filter(n => 
        n.title === 'Test notification' && n.message === 'Ceci est un test de notification'
      );
      
      console.log('✅ Notification vérifiée:', {
        found: newNotifications?.length > 0,
        count: newNotifications?.length || 0
      });
    }

    console.log('\n🎉 Test terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    // Déconnexion
    await supabase.auth.signOut();
    console.log('👋 Déconnexion effectuée');
  }
}

// Exécuter le test
testNotificationsAPI(); 