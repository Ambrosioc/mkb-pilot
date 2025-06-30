// Script pour diagnostiquer et corriger les triggers sur cars_v2
// Usage: node scripts/fix-cars-v2-triggers.js

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
 * Teste une mise à jour simple
 */
async function testUpdate() {
  console.log('🧪 Test de mise à jour simple...');
  
  try {
    const { data: testCar, error: testCarError } = await supabase
      .from('cars_v2')
      .select('id')
      .limit(1);
    
    if (testCarError) {
      console.error('❌ Erreur lors de la récupération d\'une voiture de test:', testCarError.message);
      return false;
    }
    
    if (!testCar || testCar.length === 0) {
      console.log('⚠️  Aucune voiture trouvée pour le test');
      return false;
    }
    
    const testUpdate = { brand_id: null };
    console.log(`   Test sur la voiture ID ${testCar[0].id}...`);
    
    const { error: testUpdateError } = await supabase
      .from('cars_v2')
      .update(testUpdate)
      .eq('id', testCar[0].id);
    
    if (testUpdateError) {
      console.error('❌ Erreur lors du test de mise à jour:', testUpdateError.message);
      console.error('   Code:', testUpdateError.code);
      console.error('   Détails:', testUpdateError.details);
      return false;
    } else {
      console.log('✅ Test de mise à jour réussi');
      return true;
    }
  } catch (error) {
    console.error('❌ Erreur inattendue lors du test:', error.message);
    return false;
  }
}

/**
 * Supprime tous les triggers sur cars_v2 (solution radicale)
 */
async function dropAllTriggers() {
  console.log('🗑️  Suppression de tous les triggers sur cars_v2...\n');
  
  // Liste des triggers connus qui pourraient causer des problèmes
  const knownTriggers = [
    'ensure_ref_auto_on_cars_v2',
    'update_cars_v2_updated_at',
    'set_ref_auto_if_null'
  ];
  
  let droppedCount = 0;
  
  for (const triggerName of knownTriggers) {
    console.log(`🔍 Tentative de suppression du trigger ${triggerName}...`);
    
    try {
      // On ne peut pas exécuter DROP TRIGGER directement via l'API Supabase
      // Cette fonction est juste pour l'information
      console.log(`   ⚠️  Impossible de supprimer le trigger ${triggerName} via l'API`);
      console.log(`   💡 Utilisez l'interface Supabase ou pgAdmin pour supprimer ce trigger`);
    } catch (error) {
      console.error(`   ❌ Erreur: ${error.message}`);
    }
  }
  
  console.log(`\n📊 Résumé: ${droppedCount} trigger(s) supprimé(s)`);
  console.log('\n💡 Pour supprimer les triggers manuellement:');
  console.log('   1. Allez dans l\'interface Supabase > SQL Editor');
  console.log('   2. Exécutez: DROP TRIGGER IF EXISTS trigger_name ON cars_v2;');
  console.log('   3. Ou utilisez pgAdmin pour examiner et supprimer les triggers');
}

/**
 * Affiche les instructions pour corriger le problème
 */
function showInstructions() {
  console.log('🔧 Instructions pour corriger le problème des triggers:\n');
  
  console.log('1️⃣ DIAGNOSTIC MANUEL:');
  console.log('   - Allez dans Supabase > SQL Editor');
  console.log('   - Exécutez: SELECT * FROM information_schema.triggers WHERE event_object_table = \'cars_v2\';');
  console.log('   - Identifiez les triggers qui font référence à \'date_post\'');
  
  console.log('\n2️⃣ SUPPRESSION DES TRIGGERS PROBLÉMATIQUES:');
  console.log('   - Exécutez: DROP TRIGGER IF EXISTS trigger_name ON cars_v2;');
  console.log('   - Remplacez \'trigger_name\' par le nom du trigger problématique');
  
  console.log('\n3️⃣ VÉRIFICATION:');
  console.log('   - Testez une mise à jour: UPDATE cars_v2 SET brand_id = NULL WHERE id = 1;');
  console.log('   - Si ça fonctionne, le problème est résolu');
  
  console.log('\n4️⃣ ALTERNATIVE - DÉSACTIVER TEMPORAIREMENT:');
  console.log('   - Exécutez: ALTER TABLE cars_v2 DISABLE TRIGGER ALL;');
  console.log('   - Faites vos mises à jour');
  console.log('   - Réactivez: ALTER TABLE cars_v2 ENABLE TRIGGER ALL;');
}

/**
 * Fonction principale
 */
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'test':
      await testUpdate();
      break;
    case 'drop':
      await dropAllTriggers();
      break;
    case 'instructions':
      showInstructions();
      break;
    default:
      console.log('Usage:');
      console.log('  node scripts/fix-cars-v2-triggers.js test         - Tester une mise à jour');
      console.log('  node scripts/fix-cars-v2-triggers.js drop         - Instructions pour supprimer les triggers');
      console.log('  node scripts/fix-cars-v2-triggers.js instructions - Afficher les instructions de correction');
      break;
  }
}

main(); 