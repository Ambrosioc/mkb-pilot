// Script pour analyser et réorganiser les IDs de cars_v2
// Usage: node scripts/fix-cars-v2-sequence.js

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
 * Analyse l'état actuel de la séquence
 */
async function analyzeCurrentState() {
  console.log('🔍 Analyse de l\'état actuel de cars_v2...\n');
  
  try {
    // Récupérer les IDs actuels
    const { data: ids, error } = await supabase
      .from('cars_v2')
      .select('id')
      .order('id');
    
    if (error) {
      console.error('❌ Erreur lors de la récupération des IDs:', error.message);
      return null;
    }
    
    if (!ids || ids.length === 0) {
      console.log('ℹ️  Aucun enregistrement trouvé dans cars_v2');
      return null;
    }
    
    const currentIds = ids.map(row => row.id);
    const minId = Math.min(...currentIds);
    const maxId = Math.max(...currentIds);
    const totalRecords = currentIds.length;
    
    console.log('📊 Statistiques actuelles:');
    console.log(`   Nombre total d'enregistrements: ${totalRecords}`);
    console.log(`   ID minimum: ${minId}`);
    console.log(`   ID maximum: ${maxId}`);
    console.log(`   Plage attendue: 1 à ${totalRecords}`);
    
    // Identifier les trous
    const holes = [];
    for (let i = 1; i <= maxId; i++) {
      if (!currentIds.includes(i)) {
        holes.push(i);
      }
    }
    
    if (holes.length > 0) {
      console.log(`   Trou(s) détecté(s): ${holes.length}`);
      console.log(`   IDs manquants: ${holes.slice(0, 10).join(', ')}${holes.length > 10 ? '...' : ''}`);
    } else {
      console.log('   ✅ Aucun trou détecté dans la séquence');
    }
    
    // Vérifier si la séquence est désynchronisée
    const expectedMaxId = totalRecords;
    const isSequenceOutOfSync = maxId !== expectedMaxId;
    
    console.log(`\n🔧 État de la séquence:`);
    console.log(`   ID max actuel: ${maxId}`);
    console.log(`   ID max attendu: ${expectedMaxId}`);
    console.log(`   Séquence désynchronisée: ${isSequenceOutOfSync ? '❌ OUI' : '✅ NON'}`);
    
    return {
      currentIds,
      minId,
      maxId,
      totalRecords,
      holes,
      isSequenceOutOfSync
    };
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error.message);
    return null;
  }
}

/**
 * Vérifie les dépendances (clés étrangères)
 */
async function checkDependencies() {
  console.log('\n🔍 Vérification des dépendances...\n');
  
  try {
    // Vérifier s'il y a des références vers cars_v2.id
    const tablesToCheck = [
      'advertisements',
      'vehicle_images',
      'vehicle_documents',
      'vehicle_contacts',
      'vehicle_notes'
    ];
    
    const dependencies = [];
    
    for (const tableName of tablesToCheck) {
      try {
        // Essayer de récupérer des données de chaque table
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error && data) {
          // Vérifier si la table a une colonne qui pourrait référencer cars_v2.id
          const columns = Object.keys(data[0] || {});
          const possibleRefs = columns.filter(col => 
            col.includes('car') || 
            col.includes('vehicle') || 
            col.endsWith('_id')
          );
          
          if (possibleRefs.length > 0) {
            dependencies.push({
              table: tableName,
              possibleColumns: possibleRefs
            });
          }
        }
      } catch (e) {
        // Table n'existe pas ou erreur d'accès
      }
    }
    
    if (dependencies.length > 0) {
      console.log('⚠️  Tables potentiellement dépendantes détectées:');
      dependencies.forEach(dep => {
        console.log(`   - ${dep.table}: ${dep.possibleColumns.join(', ')}`);
      });
      console.log('\n💡 Ces tables pourraient référencer cars_v2.id');
      console.log('   Il faudra les mettre à jour après la réorganisation');
    } else {
      console.log('✅ Aucune dépendance évidente détectée');
    }
    
    return dependencies;
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des dépendances:', error.message);
    return [];
  }
}

/**
 * Génère le script SQL de réorganisation
 */
function generateReorganizationScript(analysis, dependencies) {
  console.log('\n📝 Génération du script SQL de réorganisation...\n');
  
  if (!analysis) {
    console.log('❌ Impossible de générer le script sans analyse');
    return;
  }
  
  const { currentIds, totalRecords, holes, isSequenceOutOfSync } = analysis;
  
  console.log('-- Script de réorganisation des IDs de cars_v2');
  console.log('-- À exécuter dans l\'interface Supabase SQL Editor');
  console.log('-- ATTENTION: Sauvegardez vos données avant d\'exécuter ce script !');
  console.log('');
  
  // Simulation
  console.log('-- 1. SIMULATION - Voir les changements avant application');
  console.log('-- Exécutez d\'abord cette requête pour voir les changements:');
  console.log('');
  console.log('WITH reordered AS (');
  console.log('  SELECT id, ROW_NUMBER() OVER (ORDER BY id) as new_id');
  console.log('  FROM cars_v2');
  console.log(')');
  console.log('SELECT id as old_id, new_id,');
  console.log('       CASE WHEN id = new_id THEN \'✅ Pas de changement\' ELSE \'🔄 Changement\' END as status');
  console.log('FROM reordered');
  console.log('ORDER BY id;');
  console.log('');
  
  // Script principal
  console.log('-- 2. RÉORGANISATION - Exécutez ceci pour appliquer les changements');
  console.log('-- Début de transaction');
  console.log('BEGIN;');
  console.log('');
  
  // Créer une table temporaire avec les nouveaux IDs
  console.log('-- Créer une table temporaire avec les nouveaux IDs');
  console.log('CREATE TEMP TABLE cars_v2_reorder AS');
  console.log('SELECT id as old_id, ROW_NUMBER() OVER (ORDER BY id) as new_id');
  console.log('FROM cars_v2;');
  console.log('');
  
  // Mettre à jour les IDs
  console.log('-- Mettre à jour les IDs dans cars_v2');
  console.log('UPDATE cars_v2 SET id = r.new_id');
  console.log('FROM cars_v2_reorder r');
  console.log('WHERE cars_v2.id = r.old_id;');
  console.log('');
  
  // Mettre à jour les dépendances si nécessaire
  if (dependencies.length > 0) {
    console.log('-- 3. MISE À JOUR DES DÉPENDANCES');
    console.log('-- ATTENTION: Vérifiez et adaptez ces requêtes selon vos besoins');
    console.log('');
    
    dependencies.forEach(dep => {
      const possibleColumns = dep.possibleColumns.filter(col => 
        col.includes('car') || col.includes('vehicle')
      );
      
      if (possibleColumns.length > 0) {
        possibleColumns.forEach(col => {
          console.log(`-- Mettre à jour ${dep.table}.${col} (si cette colonne référence cars_v2.id)`);
          console.log(`-- UPDATE ${dep.table} SET ${col} = r.new_id`);
          console.log(`-- FROM cars_v2_reorder r`);
          console.log(`-- WHERE ${dep.table}.${col} = r.old_id;`);
          console.log('');
        });
      }
    });
  }
  
  // Réinitialiser la séquence
  console.log('-- 4. RÉINITIALISER LA SÉQUENCE');
  console.log('-- Trouver le nom de la séquence');
  console.log('SELECT pg_get_serial_sequence(\'cars_v2\', \'id\');');
  console.log('');
  console.log('-- Réinitialiser la séquence (remplacez cars_v2_id_seq par le nom réel)');
  console.log(`ALTER SEQUENCE cars_v2_id_seq RESTART WITH ${totalRecords + 1};`);
  console.log('');
  
  // Nettoyer
  console.log('-- 5. NETTOYAGE');
  console.log('DROP TABLE cars_v2_reorder;');
  console.log('');
  
  // Validation
  console.log('-- 6. VALIDATION');
  console.log('-- Vérifier que tout est correct');
  console.log('SELECT MIN(id) as min_id, MAX(id) as max_id, COUNT(*) as total');
  console.log('FROM cars_v2;');
  console.log('');
  console.log('-- Vérifier qu\'il n\'y a plus de trous');
  console.log('WITH sequence_check AS (');
  console.log('  SELECT id, ROW_NUMBER() OVER (ORDER BY id) as expected_id');
  console.log('  FROM cars_v2');
  console.log(')');
  console.log('SELECT COUNT(*) as holes_count');
  console.log('FROM sequence_check');
  console.log('WHERE id != expected_id;');
  console.log('');
  
  // Fin de transaction
  console.log('-- Fin de transaction');
  console.log('COMMIT;');
  console.log('');
  console.log('-- Script terminé');
  console.log('-- Vérifiez que tout fonctionne correctement avant de continuer');
}

/**
 * Fonction principale
 */
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'analyze':
      console.log('🚀 Analyse de l\'état de cars_v2...\n');
      await analyzeCurrentState();
      break;
      
    case 'dependencies':
      console.log('🔍 Vérification des dépendances...\n');
      await checkDependencies();
      break;
      
    case 'script':
      console.log('📝 Génération du script de réorganisation...\n');
      const analysis = await analyzeCurrentState();
      const dependencies = await checkDependencies();
      generateReorganizationScript(analysis, dependencies);
      break;
      
    case 'all':
      console.log('🚀 Analyse complète...\n');
      const analysis2 = await analyzeCurrentState();
      const dependencies2 = await checkDependencies();
      generateReorganizationScript(analysis2, dependencies2);
      break;
      
    default:
      console.log('Usage:');
      console.log('  node scripts/fix-cars-v2-sequence.js analyze     - Analyser l\'état actuel');
      console.log('  node scripts/fix-cars-v2-sequence.js dependencies - Vérifier les dépendances');
      console.log('  node scripts/fix-cars-v2-sequence.js script      - Générer le script SQL');
      console.log('  node scripts/fix-cars-v2-sequence.js all         - Analyse complète');
      break;
  }
}

main(); 