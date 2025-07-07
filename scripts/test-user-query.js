const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testUserQuery() {
  try {
    console.log('🧪 Test de la requête avec informations utilisateur...\n');

    // Vérifier les variables d'environnement
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Variables d\'environnement Supabase manquantes');
      return;
    }

    console.log('✅ Variables d\'environnement Supabase configurées');

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test 1: Vérifier la structure de la table cars_v2
    console.log('\n📋 Test 1: Structure de la table cars_v2');
    const { data: carsData, error: carsError } = await supabase
      .from('cars_v2')
      .select('id, user_id, created_at')
      .limit(3);

    if (carsError) {
      console.error('❌ Erreur lors de la récupération des véhicules:', carsError);
      return;
    }

    console.log('✅ Véhicules trouvés:', carsData?.length || 0);
    if (carsData && carsData.length > 0) {
      console.log('Exemple de véhicule:', carsData[0]);
    }

    // Test 2: Vérifier la structure de la table users
    console.log('\n📋 Test 2: Structure de la table users');
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, prenom, nom, auth_user_id')
      .limit(3);

    if (usersError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError);
      return;
    }

    console.log('✅ Utilisateurs trouvés:', usersData?.length || 0);
    if (usersData && usersData.length > 0) {
      console.log('Exemple d\'utilisateur:', usersData[0]);
    }

    // Test 3: Requête complète avec jointure
    console.log('\n📋 Test 3: Requête complète avec jointure');
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const { data: fullData, error: fullError } = await supabase
      .from('cars_v2')
      .select(`
        id,
        price,
        purchase_price,
        location,
        created_at,
        user_id,
        brands!inner(name),
        models!inner(name),
        users!inner(prenom, nom)
      `)
      .gte('created_at', firstDayOfMonth.toISOString())
      .order('created_at', { ascending: false })
      .limit(5);

    if (fullError) {
      console.error('❌ Erreur lors de la requête complète:', fullError);
      return;
    }

    console.log('✅ Requête complète réussie');
    console.log('Nombre de résultats:', fullData?.length || 0);

    if (fullData && fullData.length > 0) {
      console.log('\n📊 Résultats:');
      fullData.forEach((item, index) => {
        console.log(`\nVéhicule ${index + 1}:`);
        console.log(`  - ID: ${item.id}`);
        console.log(`  - Marque: ${item.brands?.name || 'N/A'}`);
        console.log(`  - Modèle: ${item.models?.name || 'N/A'}`);
        console.log(`  - Prix: ${item.price}`);
        console.log(`  - User ID: ${item.user_id}`);
        console.log(`  - Utilisateur: ${item.users?.prenom || 'N/A'} ${item.users?.nom || 'N/A'}`);
        console.log(`  - Date: ${item.created_at}`);
      });
    } else {
      console.log('⚠️ Aucun véhicule trouvé pour ce mois');
    }

    // Test 4: Vérifier la relation entre cars_v2.user_id et users.auth_user_id
    console.log('\n📋 Test 4: Vérification de la relation user_id');
    if (carsData && carsData.length > 0 && usersData && usersData.length > 0) {
      const carUserId = carsData[0].user_id;
      const matchingUser = usersData.find(user => user.auth_user_id === carUserId);
      
      if (matchingUser) {
        console.log('✅ Relation trouvée:');
        console.log(`  - Car user_id: ${carUserId}`);
        console.log(`  - User auth_user_id: ${matchingUser.auth_user_id}`);
        console.log(`  - Nom: ${matchingUser.prenom} ${matchingUser.nom}`);
      } else {
        console.log('⚠️ Aucune relation trouvée entre cars_v2.user_id et users.auth_user_id');
        console.log(`  - Car user_id: ${carUserId}`);
        console.log(`  - Users auth_user_ids: ${usersData.map(u => u.auth_user_id).join(', ')}`);
      }
    }

    console.log('\n✅ Tests terminés avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
  }
}

testUserQuery().catch(console.error); 