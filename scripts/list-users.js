require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Utilise la clé service_role pour bypasser la RLS en lecture
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Configuration:', {
  url: supabaseUrl,
  hasKey: !!serviceRoleKey,
  isLocal: supabaseUrl?.includes('127.0.0.1') || supabaseUrl?.includes('localhost')
});

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function listUsers() {
  console.log('📋 Liste des utilisateurs dans la base de données');
  console.log('=' .repeat(50));

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(20);

    if (error) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', error.message);
      return;
    }

    if (!data || data.length === 0) {
      console.log('📭 Aucun utilisateur trouvé dans la table users');
      return;
    }

    console.log(`✅ ${data.length} utilisateur(s) trouvé(s) :\n`);
    
    data.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Nom: ${user.prenom || 'N/A'} ${user.nom || 'N/A'}`);
      console.log(`   Créé: ${user.created_at || 'N/A'}`);
      console.log('');
    });

    // Afficher le premier utilisateur pour le test
    if (data.length > 0) {
      const firstUser = data[0];
      console.log('🎯 Utilisateur recommandé pour le test :');
      console.log(`   Email: ${firstUser.email}`);
      console.log(`   ID: ${firstUser.id}`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

listUsers(); 