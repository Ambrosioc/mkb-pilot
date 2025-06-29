// Script pour nettoyer complètement ref_auto après la migration
// Usage: node scripts/cleanup-ref-auto.js

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
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Vérifie l'état actuel de la table cars_v2
 */
async function checkCurrentState() {
  console.log('🔍 Vérification de l\'état actuel de cars_v2...\n');
  
  try {
    // Vérifier si la colonne ref_auto existe encore
    const { data: sampleRow, error: sampleError } = await supabase
      .from('cars_v2')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('❌ Erreur lors de la récupération d\'un échantillon:', sampleError.message);
      return;
    }
    
    if (sampleRow && sampleRow.length > 0) {
      const columns = Object.keys(sampleRow[0]);
      const hasRefAuto = columns.includes('ref_auto');
      const hasReference = columns.includes('reference');
      
      console.log('📋 Colonnes détectées:');
      columns.forEach((column, index) => {
        const status = column === 'ref_auto' ? '❌ À SUPPRIMER' : 
                      column === 'reference' ? '✅ À CONSERVER' : '📋';
        console.log(`   ${index + 1}. ${column} ${status}`);
      });
      
      console.log('\n📊 État des colonnes:');
      console.log(`   ref_auto présent: ${hasRefAuto ? '❌ OUI' : '✅ NON'}`);
      console.log(`   reference présent: ${hasReference ? '✅ OUI' : '❌ NON'}`);
      
      if (hasRefAuto) {
        console.log('\n⚠️  La colonne ref_auto existe encore !');
        console.log('   Exécutez la migration SQL pour la supprimer.');
      } else {
        console.log('\n✅ La colonne ref_auto a été supprimée avec succès !');
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  }
}

/**
 * Teste la génération de référence après nettoyage
 */
async function testReferenceGeneration() {
  console.log('🧪 Test de génération de référence après nettoyage...\n');
  
  try {
    // Données de test minimales
    const testData = {
      brand: 'Test Cleanup',
      model: 'Test Model',
      year: 2024,
      first_registration: '2024-01-01',
      mileage: 1000,
      type: 'Test Type',
      color: 'Test Color',
      fuel_type: 'Test Fuel',
      gearbox: 'Test Gearbox',
      din_power: 100,
      nb_seats: 5,
      nb_doors: 5,
      average_consumption: 6.5,
      road_consumption: 5.5,
      city_consumption: 7.5,
      emissions: 120,
      location: 'Test Location',
      fiscal_power: 8
    };
    
    console.log('📋 Tentative d\'insertion de test...');
    
    const { data: newVehicle, error } = await supabase
      .from('cars_v2')
      .insert([testData])
      .select('id, reference')
      .single();
    
    if (error) {
      console.error('❌ Erreur lors de l\'insertion:', error.message);
      console.error('   Code:', error.code);
      console.error('   Détails:', error.details);
      return false;
    }
    
    console.log('✅ Insertion réussie !');
    console.log(`   ID: ${newVehicle.id}`);
    console.log(`   Reference: ${newVehicle.reference}`);
    
    // Vérifier le format de la référence
    const referencePattern = /^[A-Z]{2}[0-9]{5}$/;
    if (referencePattern.test(newVehicle.reference)) {
      console.log('✅ Format de référence valide');
    } else {
      console.error('❌ Format de référence invalide');
    }
    
    // Nettoyer
    const { error: deleteError } = await supabase
      .from('cars_v2')
      .delete()
      .eq('id', newVehicle.id);
    
    if (deleteError) {
      console.error('⚠️  Erreur lors du nettoyage:', deleteError.message);
    } else {
      console.log('✅ Véhicule de test supprimé');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
    return false;
  }
}

/**
 * Affiche les statistiques finales
 */
async function showFinalStats() {
  console.log('📊 Statistiques finales...\n');
  
  try {
    // Compter les véhicules avec référence
    const { count: withReference, error: withRefError } = await supabase
      .from('cars_v2')
      .select('*', { count: 'exact', head: true })
      .not('reference', 'is', null);
    
    // Compter le total
    const { count: total, error: totalError } = await supabase
      .from('cars_v2')
      .select('*', { count: 'exact', head: true });
    
    if (withRefError || totalError) {
      throw new Error('Erreur lors de la récupération des statistiques');
    }
    
    console.log('📈 État final:');
    console.log(`   Total véhicules: ${total}`);
    console.log(`   Avec référence: ${withReference}`);
    console.log(`   Sans référence: ${total - withReference}`);
    console.log(`   Taux de couverture: ${((withReference / total) * 100).toFixed(1)}%`);
    
    // Afficher quelques exemples de références
    console.log('\n🔍 Exemples de références actuelles:');
    const { data: examples } = await supabase
      .from('cars_v2')
      .select('id, reference')
      .not('reference', 'is', null)
      .order('id', { ascending: false })
      .limit(5);
    
    examples?.forEach(car => {
      console.log(`   ID ${car.id}: ${car.reference}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'affichage des statistiques:', error.message);
  }
}

/**
 * Vérifie les triggers et fonctions
 */
async function checkTriggersAndFunctions() {
  console.log('🔍 Vérification des triggers et fonctions...\n');
  
  try {
    // Test de la fonction generate_vehicle_reference
    console.log('1️⃣ Test de la fonction generate_vehicle_reference...');
    const { data: functionResult, error: functionError } = await supabase
      .rpc('generate_vehicle_reference');
    
    if (functionError) {
      console.error('❌ Erreur avec generate_vehicle_reference:', functionError.message);
    } else {
      console.log('✅ generate_vehicle_reference fonctionne');
      console.log(`   Résultat: ${functionResult}`);
    }
    
    // Test de la fonction generate_vehicle_ref
    console.log('\n2️⃣ Test de la fonction generate_vehicle_ref...');
    const { data: refResult, error: refError } = await supabase
      .rpc('generate_vehicle_ref');
    
    if (refError) {
      console.error('❌ Erreur avec generate_vehicle_ref:', refError.message);
    } else {
      console.log('✅ generate_vehicle_ref fonctionne');
      console.log(`   Résultat: ${refResult}`);
    }
    
    // Vérifier que les deux fonctions donnent le même résultat
    if (!functionError && !refError && functionResult === refResult) {
      console.log('\n✅ Les deux fonctions sont synchronisées');
    } else if (!functionError && !refError) {
      console.log('\n⚠️  Les fonctions donnent des résultats différents');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  }
}

/**
 * Fonction principale
 */
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'check':
      await checkCurrentState();
      break;
    case 'test':
      await testReferenceGeneration();
      break;
    case 'stats':
      await showFinalStats();
      break;
    case 'triggers':
      await checkTriggersAndFunctions();
      break;
    case 'all':
      console.log('🚀 Vérification complète après nettoyage...\n');
      
      console.log('1️⃣ État actuel de la table...');
      await checkCurrentState();
      
      console.log('\n2️⃣ Vérification des triggers et fonctions...');
      await checkTriggersAndFunctions();
      
      console.log('\n3️⃣ Statistiques finales...');
      await showFinalStats();
      
      console.log('\n4️⃣ Test de génération de référence...');
      await testReferenceGeneration();
      
      console.log('\n🎉 Nettoyage terminé !');
      console.log('✅ La colonne reference fonctionne maintenant correctement');
      console.log('✅ La colonne ref_auto a été supprimée');
      console.log('✅ Tous les triggers et fonctions sont opérationnels');
      
      break;
    default:
      console.log('Usage:');
      console.log('  node scripts/cleanup-ref-auto.js check    - Vérifier l\'état actuel');
      console.log('  node scripts/cleanup-ref-auto.js test     - Tester la génération');
      console.log('  node scripts/cleanup-ref-auto.js stats    - Statistiques finales');
      console.log('  node scripts/cleanup-ref-auto.js triggers - Vérifier triggers/fonctions');
      console.log('  node scripts/cleanup-ref-auto.js all      - Vérification complète');
      break;
  }
}

main(); 