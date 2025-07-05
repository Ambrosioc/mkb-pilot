require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔎 TEST DE PROTECTION DE LA SECTION DOCUMENTS');
console.log('==============================================\n');

async function testDocumentProtection() {
  try {
    // 1. Récupérer l'utilisateur Ambrosie
    console.log('📋 1. Récupération de l\'utilisateur Ambrosie...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'a.cazimira@gmail.com');

    if (usersError || users.length === 0) {
      console.error('❌ Utilisateur Ambrosie non trouvé');
      return;
    }

    const user = users[0];
    console.log('✅ Utilisateur trouvé:', user.prenom, user.nom);

    // 2. Vérifier les permissions pour le pôle Stock
    console.log('\n📋 2. Vérification des permissions Stock...');
    const { data: userPoles, error: userPolesError } = await supabase
      .from('user_poles')
      .select(`
        role_level,
        poles (
          name,
          description
        )
      `)
      .eq('user_id', user.auth_user_id)
      .eq('poles.name', 'Stock');

    if (userPolesError) {
      console.error('❌ Erreur lors de la vérification des permissions Stock:', userPolesError);
      return;
    }

    if (userPoles && userPoles.length > 0) {
      const stockPermission = userPoles[0];
      console.log('✅ Permissions Stock trouvées:', stockPermission);
      console.log(`   - Niveau: ${stockPermission.role_level}`);
      console.log(`   - Lecture: ${stockPermission.role_level <= 5 ? '✅' : '❌'}`);
      console.log(`   - Écriture: ${stockPermission.role_level <= 4 ? '✅' : '❌'}`);
      console.log(`   - Gestion: ${stockPermission.role_level <= 3 ? '✅' : '❌'}`);

      // 3. Résumé des protections
      console.log('\n📋 3. Résumé des protections appliquées...');
      
      const isLevel5 = stockPermission.role_level === 5;
    
            console.log('✅ Protections dans le détail d\'un véhicule:');
        console.log(`   - Onglet Documents: ${isLevel5 ? '❌ Masqué' : '✅ Visible'}`);
        console.log(`   - Bouton "Créer un document": ${isLevel5 ? '❌ Masqué' : '✅ Visible'}`);
        console.log(`   - Boutons "Créer devis/facture": ${isLevel5 ? '❌ Désactivés' : '✅ Actifs'}`);
        console.log(`   - Formulaire de création: ${isLevel5 ? '❌ Non accessible' : '✅ Accessible'}`);

        console.log('\n📋 4. Actions disponibles en niveau 5:');
        console.log('   ✅ Voir les détails du véhicule');
        console.log('   ✅ Voir l\'annonce du véhicule');
        console.log('   ❌ Créer des devis/factures');
        console.log('   ❌ Accéder à la section documents');

        console.log('\n🎯 RÉSUMÉ');
        console.log('==========');
        console.log('En niveau 5 (lecture uniquement), l\'utilisateur peut:');
        console.log('   - ✅ Consulter les détails des véhicules');
        console.log('   - ✅ Voir les annonces');
        console.log('   - ❌ Créer des documents (devis/factures)');
        console.log('   - ❌ Accéder à la section documents');
        console.log('');
        console.log('Pour tester manuellement:');
        console.log('   1. Connectez-vous avec a.cazimira@gmail.com');
        console.log('   2. Allez dans Stock');
        console.log('   3. Cliquez sur "Voir détails" d\'un véhicule');
        console.log('   4. Vérifiez que l\'onglet "Documents" n\'est pas accessible');
      } else {
        console.log('❌ Aucune permission Stock trouvée');
      }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testDocumentProtection(); 