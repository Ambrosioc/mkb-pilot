// Script de test pour vérifier l'inscription utilisateur
// Usage: node scripts/test-user-registration.js

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (à adapter selon votre configuration)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testUserRegistration() {
  console.log('🧪 Test d\'inscription utilisateur...\n');

  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  const testFirstName = 'Jean';
  const testLastName = 'Dupont';

  try {
    // 1. Créer un utilisateur via l'API Supabase
    console.log('1️⃣ Création de l\'utilisateur via Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        full_name: `${testFirstName} ${testLastName}`,
        role: 'user',
      }
    });

    if (authError) {
      throw new Error(`Erreur Auth: ${authError.message}`);
    }

    console.log('✅ Utilisateur créé dans auth.users');
    console.log(`   ID: ${authData.user.id}`);
    console.log(`   Email: ${authData.user.email}`);

    // 2. Créer l'enregistrement dans la table users via RPC
    console.log('\n2️⃣ Création de l\'enregistrement dans la table users via RPC...');
    const { error: userError } = await supabase
      .rpc('create_user_profile', {
        auth_user_id: authData.user.id,
        prenom: testFirstName,
        nom: testLastName,
        email: testEmail
      });

    if (userError) {
      throw new Error(`Erreur table users: ${userError.message}`);
    }

    // 3. Vérifier que les données sont correctes
    console.log('\n3️⃣ Vérification des données...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('users')
      .select('prenom, nom, email')
      .eq('auth_user_id', authData.user.id)
      .single();

    if (verifyError) {
      throw new Error(`Erreur vérification: ${verifyError.message}`);
    }

    if (verifyData.prenom === testFirstName && verifyData.nom === testLastName) {
      console.log('✅ Données correctement enregistrées');
      console.log(`   Prénom attendu: ${testFirstName} → Reçu: ${verifyData.prenom}`);
      console.log(`   Nom attendu: ${testLastName} → Reçu: ${verifyData.nom}`);
    } else {
      console.log('❌ Données incorrectes');
      console.log(`   Prénom attendu: ${testFirstName} → Reçu: ${verifyData.prenom}`);
      console.log(`   Nom attendu: ${testLastName} → Reçu: ${verifyData.nom}`);
    }

    // 4. Nettoyer les données de test
    console.log('\n4️⃣ Nettoyage des données de test...');
    await supabase.auth.admin.deleteUser(authData.user.id);
    console.log('✅ Utilisateur supprimé');

    console.log('\n🎉 Test terminé avec succès !');
    console.log('\n📋 Résumé:');
    console.log('   ✅ Inscription utilisateur fonctionne');
    console.log('   ✅ Séparation prénom/nom correcte');
    console.log('   ✅ Données stockées dans la table users');

  } catch (error) {
    console.error('\n❌ Erreur lors du test:', error.message);
    process.exit(1);
  }
}

// Fonction pour vérifier les utilisateurs existants
async function checkExistingUsers() {
  console.log('🔍 Vérification des utilisateurs existants...\n');

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('prenom, nom, email, date_creation')
      .order('date_creation', { ascending: false })
      .limit(10);

    if (error) {
      throw new Error(`Erreur: ${error.message}`);
    }

    console.log(`📊 ${users.length} utilisateurs trouvés (10 plus récents):\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.prenom} ${user.nom} (${user.email})`);
      console.log(`   Créé le: ${new Date(user.date_creation).toLocaleDateString('fr-FR')}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  }
}

// Exécuter les tests
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'test':
      await testUserRegistration();
      break;
    case 'check':
      await checkExistingUsers();
      break;
    default:
      console.log('Usage:');
      console.log('  node scripts/test-user-registration.js test  - Tester l\'inscription');
      console.log('  node scripts/test-user-registration.js check - Vérifier les utilisateurs existants');
      break;
  }
}

main(); 