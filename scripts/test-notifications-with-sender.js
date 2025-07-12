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

async function testNotificationsWithSender() {
  console.log('🧪 Test des notifications avec informations du sender');
  console.log('=' .repeat(50));

  try {
    // 1. Connexion utilisateur
    console.log('1️⃣ Connexion...');
    
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

    // 3. Test GET avec affichage détaillé des notifications
    console.log('\n2️⃣ Test GET /api/notifications avec détails...');
    
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
      
      // Afficher les détails complets des notifications
      if (data.notifications && data.notifications.length > 0) {
        console.log('\n📋 Détails complets des notifications:');
        data.notifications.forEach((notif, index) => {
          console.log(`\n${index + 1}. Notification ID: ${notif.id}`);
          console.log(`   Titre: ${notif.title}`);
          console.log(`   Message: ${notif.message}`);
          console.log(`   Type: ${notif.type}`);
          console.log(`   Catégorie: ${notif.category}`);
          console.log(`   Créée: ${notif.created_at}`);
          console.log(`   Lu: ${notif.read}`);
          console.log(`   Recipient ID: ${notif.recipient_id}`);
          console.log(`   Sender ID: ${notif.sender_id}`);
          
          // Afficher les infos du sender
          if (notif.sender) {
            console.log(`   Sender: ${notif.sender.prenom} ${notif.sender.nom} (${notif.sender.email})`);
          } else {
            console.log(`   Sender: système (pas d'utilisateur associé)`);
          }
        });
      }
    } else {
      const error = await getResponse.json();
      console.error('❌ GET échoué:', error);
    }

    console.log('\n🎉 Test terminé !');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await supabase.auth.signOut();
    console.log('👋 Déconnexion');
  }
}

testNotificationsWithSender(); 