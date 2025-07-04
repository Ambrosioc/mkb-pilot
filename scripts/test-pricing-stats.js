const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Utiliser les variables d'environnement locales de Supabase
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPricingStats() {
  console.log('🧪 Test des nouvelles fonctions de statistiques de pricing...\n');

  try {
    // 1. Test de la fonction get_posted_vehicles_stats
    console.log('1. Test de get_posted_vehicles_stats...');
    const { data: statsData, error: statsError } = await supabase
      .rpc('get_posted_vehicles_stats');

    if (statsError) {
      console.error('❌ Erreur get_posted_vehicles_stats:', statsError);
    } else {
      console.log('✅ get_posted_vehicles_stats:', statsData);
    }

    // 2. Test de la fonction get_vehicles_to_post
    console.log('\n2. Test de get_vehicles_to_post...');
    const { data: vehiclesToPostData, error: vehiclesToPostError } = await supabase
      .rpc('get_vehicles_to_post');

    if (vehiclesToPostError) {
      console.error('❌ Erreur get_vehicles_to_post:', vehiclesToPostError);
    } else {
      console.log('✅ get_vehicles_to_post:', vehiclesToPostData?.length || 0, 'véhicules');
      if (vehiclesToPostData && vehiclesToPostData.length > 0) {
        console.log('   Premier véhicule:', vehiclesToPostData[0]);
      }
    }

    // 3. Test de la fonction get_posted_vehicles
    console.log('\n3. Test de get_posted_vehicles...');
    const { data: postedVehiclesData, error: postedVehiclesError } = await supabase
      .rpc('get_posted_vehicles', {
        p_limit: 5,
        p_offset: 0
      });

    if (postedVehiclesError) {
      console.error('❌ Erreur get_posted_vehicles:', postedVehiclesError);
    } else {
      console.log('✅ get_posted_vehicles:', postedVehiclesData?.length || 0, 'véhicules');
      if (postedVehiclesData && postedVehiclesData.length > 0) {
        console.log('   Premier véhicule posté:', postedVehiclesData[0]);
      }
    }

    // 4. Vérifier la structure de la table advertisements
    console.log('\n4. Vérification de la structure advertisements...');
    const { data: advertisementsStructure, error: structureError } = await supabase
      .from('advertisements')
      .select('*')
      .limit(1);

    if (structureError) {
      console.error('❌ Erreur structure advertisements:', structureError);
    } else {
      console.log('✅ Structure advertisements OK');
      if (advertisementsStructure && advertisementsStructure.length > 0) {
        const columns = Object.keys(advertisementsStructure[0]);
        console.log('   Colonnes disponibles:', columns);
        console.log('   posted_by_user présent:', columns.includes('posted_by_user'));
      }
    }

    // 5. Vérifier la structure de la table cars_v2
    console.log('\n5. Vérification de la structure cars_v2...');
    const { data: carsStructure, error: carsStructureError } = await supabase
      .from('cars_v2')
      .select('*')
      .limit(1);

    if (carsStructureError) {
      console.error('❌ Erreur structure cars_v2:', carsStructureError);
    } else {
      console.log('✅ Structure cars_v2 OK');
      if (carsStructure && carsStructure.length > 0) {
        const columns = Object.keys(carsStructure[0]);
        console.log('   Colonnes disponibles:', columns);
        console.log('   add_by_user présent:', columns.includes('add_by_user'));
        console.log('   posted_by_user absent:', !columns.includes('posted_by_user'));
      }
    }

    // 6. Test avec un utilisateur spécifique
    console.log('\n6. Test avec un utilisateur spécifique...');
    const { data: userStatsData, error: userStatsError } = await supabase
      .rpc('get_posted_vehicles_stats', {
        p_user_id: '00000000-0000-0000-0000-000000000000' // UUID fictif pour test
      });

    if (userStatsError) {
      console.error('❌ Erreur stats utilisateur:', userStatsError);
    } else {
      console.log('✅ Stats utilisateur:', userStatsData);
    }

    console.log('\n🎉 Tests terminés avec succès!');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Fonction pour créer des données de test
async function createTestData() {
  console.log('\n🔧 Création de données de test...');

  try {
    // 1. Créer des utilisateurs de test
    const testUsers = [
      {
        auth_user_id: '11111111-1111-1111-1111-111111111111',
        prenom: 'Jean',
        nom: 'Dupont',
        email: 'jean.dupont@test.com'
      },
      {
        auth_user_id: '22222222-2222-2222-2222-222222222222',
        prenom: 'Marie',
        nom: 'Martin',
        email: 'marie.martin@test.com'
      }
    ];

    for (const testUser of testUsers) {
      const { error: userError } = await supabase
        .from('users')
        .upsert([testUser], { onConflict: 'auth_user_id' });

      if (userError) {
        console.error('❌ Erreur création utilisateur:', userError);
      } else {
        console.log('✅ Utilisateur créé/mis à jour:', testUser.prenom, testUser.nom);
      }
    }

    // 2. Créer des véhicules de test
    const testVehicles = [
      {
        reference: 'TEST-001',
        brand_id: 1,
        model_id: 1,
        year: 2020,
        color: 'Blanc',
        price: 15000,
        purchase_price: 12000,
        location: 'FR',
        status: 'disponible',
        add_by_user: '11111111-1111-1111-1111-111111111111'
      },
      {
        reference: 'TEST-002',
        brand_id: 1,
        model_id: 1,
        year: 2021,
        color: 'Noir',
        price: 18000,
        purchase_price: 14000,
        location: 'FR',
        status: 'disponible',
        add_by_user: '22222222-2222-2222-2222-222222222222'
      }
    ];

    const createdVehicles = [];
    for (const testVehicle of testVehicles) {
      const { data: carData, error: carError } = await supabase
        .from('cars_v2')
        .insert([testVehicle])
        .select()
        .single();

      if (carError) {
        console.error('❌ Erreur création véhicule:', carError);
      } else {
        console.log('✅ Véhicule créé:', carData.id);
        createdVehicles.push(carData);
      }
    }

    // 3. Créer des annonces de test (Jean Dupont poste 2 véhicules, Marie Martin 1)
    const testAdvertisements = [
      {
        car_id: createdVehicles[0].id,
        title: 'Véhicule de test 1',
        description: 'Description de test 1',
        posted_by_user: '11111111-1111-1111-1111-111111111111'
      },
      {
        car_id: createdVehicles[1].id,
        title: 'Véhicule de test 2',
        description: 'Description de test 2',
        posted_by_user: '11111111-1111-1111-1111-111111111111'
      }
    ];

    for (const testAd of testAdvertisements) {
      const { data: adData, error: adError } = await supabase
        .from('advertisements')
        .insert([testAd])
        .select()
        .single();

      if (adError) {
        console.error('❌ Erreur création annonce:', adError);
      } else {
        console.log('✅ Annonce créée:', adData.id);
      }
    }

    console.log('🎉 Données de test créées avec succès!');
    console.log('Jean Dupont devrait être le best priceur avec 2 posts');

  } catch (error) {
    console.error('❌ Erreur création données de test:', error);
  }
}

// Exécuter les tests
async function main() {
  console.log('🚀 Démarrage des tests de pricing stats...\n');
  
  // Créer des données de test pour voir le best priceur
  await createTestData();
  
  await testPricingStats();
}

main().catch(console.error); 