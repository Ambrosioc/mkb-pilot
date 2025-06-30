// Script de test pour vérifier la génération de référence après réorganisation
// Usage: node scripts/test-reference-generation.js

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Charger les variables d'environnement depuis .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Vérifie l'état de la séquence après réorganisation
 */
async function checkSequenceState() {
  console.log('🔍 Vérification de l\'état de la séquence...\n');
  
  try {
    // Récupérer les statistiques
    const { data: stats, error } = await supabase
      .from('cars_v2')
      .select('id')
      .order('id');
    
    if (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error.message);
      return false;
    }
    
    if (!stats || stats.length === 0) {
      console.log('ℹ️  Aucun enregistrement trouvé');
      return false;
    }
    
    const ids = stats.map(row => row.id);
    const minId = Math.min(...ids);
    const maxId = Math.max(...ids);
    const totalRecords = ids.length;
    
    console.log('📊 État de la séquence:');
    console.log(`   Nombre total d'enregistrements: ${totalRecords}`);
    console.log(`   ID minimum: ${minId}`);
    console.log(`   ID maximum: ${maxId}`);
    console.log(`   Plage attendue: 1 à ${totalRecords}`);
    
    // Vérifier s'il y a des trous
    const holes = [];
    for (let i = 1; i <= maxId; i++) {
      if (!ids.includes(i)) {
        holes.push(i);
      }
    }
    
    if (holes.length > 0) {
      console.log(`   ❌ Trou(s) détecté(s): ${holes.length}`);
      console.log(`   IDs manquants: ${holes.slice(0, 10).join(', ')}${holes.length > 10 ? '...' : ''}`);
      return false;
    } else {
      console.log('   ✅ Aucun trou détecté');
    }
    
    // Vérifier si la séquence est correcte
    const isSequenceCorrect = minId === 1 && maxId === totalRecords;
    console.log(`   Séquence correcte: ${isSequenceCorrect ? '✅ OUI' : '❌ NON'}`);
    
    return isSequenceCorrect;
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    return false;
  }
}

/**
 * Teste l'insertion avec génération automatique de référence
 */
async function testReferenceGeneration() {
  console.log('\n🧪 Test de génération automatique de référence...\n');
  
  try {
    // Données de test
    const testVehicles = [
      {
        year: 2024,
        first_registration: '2024-01-01',
        mileage: 1000,
        color: 'BLANC',
        gearbox: 'M',
        din_power: 100,
        nb_seats: 5,
        nb_doors: 5,
        average_consumption: 5.0,
        road_consumption: 4.5,
        city_consumption: 6.0,
        emissions: 120,
        location: 'Paris (75)',
        fiscal_power: 8,
        status: 'disponible',
        brand_id: 1,
        model_id: 1,
        vehicle_type_id: 1,
        fuel_type_id: 1,
        brand: 'TEST',
        model: 'REFERENCE_TEST_1',
        type: 'BERLINE',
        fuel_type: 'ESSENCE'
      },
      {
        year: 2023,
        first_registration: '2023-06-15',
        mileage: 5000,
        color: 'NOIR',
        gearbox: 'A',
        din_power: 150,
        nb_seats: 5,
        nb_doors: 5,
        average_consumption: 6.5,
        road_consumption: 5.8,
        city_consumption: 7.2,
        emissions: 140,
        location: 'Lyon (69)',
        fiscal_power: 12,
        status: 'disponible',
        brand_id: 1,
        model_id: 1,
        vehicle_type_id: 1,
        fuel_type_id: 1,
        brand: 'TEST',
        model: 'REFERENCE_TEST_2',
        type: 'SUV',
        fuel_type: 'DIESEL'
      }
    ];
    
    const insertedVehicles = [];
    
    for (let i = 0; i < testVehicles.length; i++) {
      const vehicle = testVehicles[i];
      console.log(`📝 Insertion du véhicule de test ${i + 1}...`);
      
      const { data, error } = await supabase
        .from('cars_v2')
        .insert([vehicle])
        .select('id, reference, brand, model, year');
      
      if (error) {
        console.error(`❌ Erreur lors de l'insertion ${i + 1}:`, error.message);
        return false;
      }
      
      if (data && data.length > 0) {
        const insertedVehicle = data[0];
        insertedVehicles.push(insertedVehicle);
        
        console.log(`✅ Véhicule ${i + 1} inséré avec succès:`);
        console.log(`   ID: ${insertedVehicle.id}`);
        console.log(`   Référence: ${insertedVehicle.reference}`);
        console.log(`   Marque/Modèle: ${insertedVehicle.brand} ${insertedVehicle.model}`);
        console.log(`   Année: ${insertedVehicle.year}`);
      }
    }
    
    // Vérifier que les références sont uniques
    const references = insertedVehicles.map(v => v.reference);
    const uniqueReferences = [...new Set(references)];
    
    if (references.length === uniqueReferences.length) {
      console.log('\n✅ Toutes les références sont uniques');
    } else {
      console.log('\n❌ Références en double détectées');
      return false;
    }
    
    // Nettoyer les véhicules de test
    console.log('\n🧹 Nettoyage des véhicules de test...');
    for (const vehicle of insertedVehicles) {
      const { error: deleteError } = await supabase
        .from('cars_v2')
        .delete()
        .eq('id', vehicle.id);
      
      if (deleteError) {
        console.error(`⚠️  Erreur lors du nettoyage de ${vehicle.id}:`, deleteError.message);
      }
    }
    
    console.log('✅ Véhicules de test supprimés');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    return false;
  }
}

/**
 * Vérifie l'intégrité des références
 */
async function checkReferenceIntegrity() {
  console.log('\n🔍 Vérification de l\'intégrité des références...\n');
  
  try {
    // Vérifier les références dans advertisements
    const { data: ads, error: adsError } = await supabase
      .from('advertisements')
      .select('id, car_id')
      .not('car_id', 'is', null)
      .limit(10);
    
    if (adsError) {
      console.log('⚠️  Impossible de vérifier advertisements:', adsError.message);
    } else if (ads && ads.length > 0) {
      console.log('📋 Vérification des références dans advertisements:');
      
      for (const ad of ads) {
        const { data: car, error: carError } = await supabase
          .from('cars_v2')
          .select('id, reference, brand, model')
          .eq('id', ad.car_id)
          .single();
        
        if (carError) {
          console.log(`   ❌ Référence invalide: ad_id=${ad.id}, car_id=${ad.car_id}`);
        } else {
          console.log(`   ✅ Référence valide: ad_id=${ad.id}, car_id=${ad.car_id}, ref=${car.reference}`);
        }
      }
    } else {
      console.log('ℹ️  Aucune référence trouvée dans advertisements');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    return false;
  }
}

/**
 * Fonction principale
 */
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'sequence':
      console.log('🔍 Vérification de la séquence...\n');
      await checkSequenceState();
      break;
      
    case 'test':
      console.log('🧪 Test de génération de référence...\n');
      await testReferenceGeneration();
      break;
      
    case 'integrity':
      console.log('🔍 Vérification de l\'intégrité...\n');
      await checkReferenceIntegrity();
      break;
      
    case 'all':
      console.log('🚀 Test complet après réorganisation...\n');
      
      const sequenceOk = await checkSequenceState();
      if (sequenceOk) {
        console.log('\n✅ Séquence correcte, test de génération...');
        await testReferenceGeneration();
      } else {
        console.log('\n❌ Séquence incorrecte, arrêt des tests');
        return;
      }
      
      console.log('\n🔍 Vérification de l\'intégrité...');
      await checkReferenceIntegrity();
      
      console.log('\n🎉 Tests terminés !');
      break;
      
    default:
      console.log('Usage:');
      console.log('  node scripts/test-reference-generation.js sequence - Vérifier la séquence');
      console.log('  node scripts/test-reference-generation.js test      - Tester la génération');
      console.log('  node scripts/test-reference-generation.js integrity - Vérifier l\'intégrité');
      console.log('  node scripts/test-reference-generation.js all       - Test complet');
      break;
  }
}

main(); 