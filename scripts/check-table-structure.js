// Script pour vérifier la structure de la table cars_v2
// Usage: node scripts/check-table-structure.js

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
 * Vérifie la structure de la table cars_v2
 */
async function checkTableStructure() {
  console.log('🔍 Vérification de la structure de la table cars_v2...\n');
  
  try {
    // Récupérer un enregistrement pour voir les colonnes disponibles
    const { data, error } = await supabase
      .from('cars_v2')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur lors de la récupération des données:', error.message);
      return;
    }
    
    if (data && data.length > 0) {
      const sampleRecord = data[0];
      console.log('📋 Colonnes disponibles dans cars_v2:');
      
      Object.keys(sampleRecord).forEach((column, index) => {
        const value = sampleRecord[column];
        const type = typeof value;
        const isNull = value === null;
        console.log(`   ${index + 1}. ${column} (${type})${isNull ? ' [NULL]' : ''}`);
      });
      
      console.log('\n📝 Exemple d\'enregistrement:');
      console.log(JSON.stringify(sampleRecord, null, 2));
      
    } else {
      console.log('ℹ️  Aucun enregistrement trouvé dans cars_v2');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  }
}

/**
 * Teste l'insertion avec les bonnes colonnes
 */
async function testInsertion() {
  console.log('\n🧪 Test d\'insertion avec les bonnes colonnes...\n');
  
  try {
    // D'abord, récupérer un enregistrement pour voir la structure
    const { data: sample, error: sampleError } = await supabase
      .from('cars_v2')
      .select('*')
      .limit(1);
    
    if (sampleError || !sample || sample.length === 0) {
      console.error('❌ Impossible de récupérer un échantillon:', sampleError?.message);
      return;
    }
    
    const sampleRecord = sample[0];
    console.log('📋 Structure détectée:');
    Object.keys(sampleRecord).forEach(key => {
      if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
        console.log(`   - ${key}: ${typeof sampleRecord[key]}`);
      }
    });
    
    // Créer un véhicule de test avec les bonnes colonnes
    const testVehicle = {};
    
    // Ajouter les colonnes essentielles
    if ('marque' in sampleRecord) testVehicle.marque = 'TEST';
    if ('modele' in sampleRecord) testVehicle.modele = 'REFERENCE_TEST';
    if ('prix' in sampleRecord) testVehicle.prix = 50000;
    if ('annee' in sampleRecord) testVehicle.annee = 2024;
    if ('annee_fabrication' in sampleRecord) testVehicle.annee_fabrication = 2024;
    
    console.log('\n📝 Tentative d\'insertion avec:', testVehicle);
    
    const { data, error } = await supabase
      .from('cars_v2')
      .insert([testVehicle])
      .select('*');
    
    if (error) {
      console.error('❌ Erreur lors de l\'insertion:', error.message);
      return;
    }
    
    if (data && data.length > 0) {
      const vehicle = data[0];
      console.log('✅ Véhicule inséré avec succès:');
      console.log(`   ID: ${vehicle.id}`);
      console.log(`   Référence: ${vehicle.reference}`);
      console.log(`   Marque/Modèle: ${vehicle.marque} ${vehicle.modele}`);
      
      // Nettoyer le véhicule de test
      console.log('\n🧹 Nettoyage du véhicule de test...');
      const { error: deleteError } = await supabase
        .from('cars_v2')
        .delete()
        .eq('id', vehicle.id);
      
      if (deleteError) {
        console.error('⚠️  Erreur lors du nettoyage:', deleteError.message);
      } else {
        console.log('✅ Véhicule de test supprimé');
      }
      
    } else {
      console.log('⚠️  Aucune donnée retournée après insertion');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

/**
 * Fonction principale
 */
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'structure':
      await checkTableStructure();
      break;
    case 'test':
      await testInsertion();
      break;
    case 'all':
      await checkTableStructure();
      await testInsertion();
      break;
    default:
      console.log('Usage:');
      console.log('  node scripts/check-table-structure.js structure - Vérifier la structure');
      console.log('  node scripts/check-table-structure.js test      - Tester l\'insertion');
      console.log('  node scripts/check-table-structure.js all       - Vérification complète');
      break;
  }
}

main(); 