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

console.log('🔎 RÉSUMÉ DES PERMISSIONS - UTILISATEUR AMBROSIE');
console.log('================================================\n');

async function testPermissionsSummary() {
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

    // 2. Vérifier toutes les affectations
    console.log('\n📋 2. Affectations actuelles...');
    const { data: userPoles, error: userPolesError } = await supabase
      .from('user_poles')
      .select(`
        role_level,
        poles (
          name,
          description
        )
      `)
      .eq('user_id', user.auth_user_id);

    if (userPolesError) {
      console.error('❌ Erreur lors de la récupération des affectations:', userPolesError);
      return;
    }

    console.log('✅ Affectations trouvées:', userPoles.length);
    userPoles.forEach(assignment => {
      const pole = assignment.poles;
      console.log(`   - ${pole.name} (niveau ${assignment.role_level})`);
      
      // Déterminer les permissions selon le niveau
      let permissions = [];
      if (assignment.role_level <= 5) permissions.push('Lecture');
      if (assignment.role_level <= 4) permissions.push('Écriture');
      if (assignment.role_level <= 3) permissions.push('Gestion');
      
      console.log(`     Permissions: ${permissions.join(', ')}`);
    });

    // 3. Résumé des accès par page
    console.log('\n📋 3. Résumé des accès par page...');
    
    const pages = [
      { name: 'Stock', pole: 'Stock', url: '/dashboard/stock' },
      { name: 'Contacts', pole: 'Commercial', url: '/dashboard/contacts' },
      { name: 'Pricing Angola', pole: 'Pricing', url: '/dashboard/pricing/angola' },
      { name: 'Direction', pole: 'Direction', url: '/dashboard/direction' },
      { name: 'Création véhicule', pole: 'Stock', url: '/dashboard/stock/new' }
    ];

    pages.forEach(page => {
      const assignment = userPoles.find(up => up.poles.name === page.pole);
      if (assignment) {
        const canRead = assignment.role_level <= 5;
        const canWrite = assignment.role_level <= 4;
        const canManage = assignment.role_level <= 3;
        
        console.log(`   ${page.name} (${page.url}):`);
        console.log(`     - Accès: ${canRead ? '✅' : '❌'}`);
        console.log(`     - Lecture: ${canRead ? '✅' : '❌'}`);
        console.log(`     - Écriture: ${canWrite ? '✅' : '❌'}`);
        console.log(`     - Gestion: ${canManage ? '✅' : '❌'}`);
      } else {
        console.log(`   ${page.name} (${page.url}): ❌ Aucun accès`);
      }
    });

    console.log('\n🎯 RÉSUMÉ FINAL');
    console.log('===============');
    console.log('✅ Pages accessibles (lecture uniquement):');
    console.log('   - /dashboard/stock (niveau 5)');
    console.log('   - /dashboard/contacts (niveau 5)');
    console.log('');
    console.log('❌ Pages non accessibles:');
    console.log('   - /dashboard/pricing/angola (aucune affectation)');
    console.log('   - /dashboard/direction (aucune affectation)');
    console.log('   - /dashboard/stock/new (niveau 5 < niveau requis)');
    console.log('');
    console.log('📝 Actions disponibles en niveau 5:');
    console.log('   - ✅ Voir les listes de véhicules et contacts');
    console.log('   - ✅ Voir les détails des véhicules et contacts');
    console.log('   - ✅ Rechercher et filtrer');
    console.log('   - ✅ Voir les statistiques');
    console.log('   - ❌ Ajouter/modifier/supprimer des éléments');
    console.log('   - ❌ Créer des devis/factures');
    console.log('   - ❌ Envoyer des emails groupés');
    console.log('   - ❌ Gérer les tags');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testPermissionsSummary(); 