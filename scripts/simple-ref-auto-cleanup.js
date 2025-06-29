// Script simple pour nettoyer ref_auto
// Usage: node scripts/simple-ref-auto-cleanup.js

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
 * Exécute une requête SQL via l'interface Supabase
 */
async function executeSQL(sql) {
  try {
    const { data, error } = await supabase
      .from('cars_v2')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur de connexion:', error.message);
      return null;
    }
    
    // Pour les requêtes SQL, nous devons utiliser une approche différente
    // Essayons d'utiliser l'API REST avec des requêtes personnalisées
    console.log('⚠️  Impossible d\'exécuter des requêtes SQL directes via l\'API Supabase');
    console.log('   Utilisation d\'une approche alternative...');
    
    return null;
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution SQL:', error.message);
    return null;
  }
}

/**
 * Vérifie si la colonne ref_auto existe
 */
async function checkRefAutoColumn() {
  console.log('🔍 Vérification de l\'existence de la colonne ref_auto...\n');
  
  try {
    // Essayer de sélectionner la colonne ref_auto
    const { data, error } = await supabase
      .from('cars_v2')
      .select('ref_auto')
      .limit(1);
    
    if (error) {
      if (error.message.includes('column "ref_auto" does not exist')) {
        console.log('✅ La colonne ref_auto n\'existe plus');
        return false;
      } else {
        console.error('❌ Erreur lors de la vérification:', error.message);
        return null;
      }
    }
    
    console.log('❌ La colonne ref_auto existe encore');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    return null;
  }
}

/**
 * Vérifie si la colonne reference existe et fonctionne
 */
async function checkReferenceColumn() {
  console.log('🔍 Vérification de la colonne reference...\n');
  
  try {
    // Essayer de sélectionner la colonne reference
    const { data, error } = await supabase
      .from('cars_v2')
      .select('reference')
      .limit(5);
    
    if (error) {
      console.error('❌ Erreur lors de la vérification de reference:', error.message);
      return false;
    }
    
    console.log('✅ La colonne reference existe');
    console.log('📋 Exemples de références:');
    data.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.reference || 'NULL'}`);
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de reference:', error.message);
    return false;
  }
}

/**
 * Teste l'insertion avec génération automatique de référence
 */
async function testReferenceGeneration() {
  console.log('\n🧪 Test de génération automatique de référence...\n');
  
  try {
    // Insérer un véhicule de test avec les bonnes colonnes
    const testVehicle = {
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
      model: 'REFERENCE_TEST',
      type: 'BERLINE',
      fuel_type: 'ESSENCE'
      // reference sera généré automatiquement
    };
    
    console.log('📝 Insertion d\'un véhicule de test...');
    const { data, error } = await supabase
      .from('cars_v2')
      .insert([testVehicle])
      .select('id, reference, brand, model');
    
    if (error) {
      console.error('❌ Erreur lors de l\'insertion:', error.message);
      return false;
    }
    
    if (data && data.length > 0) {
      const vehicle = data[0];
      console.log('✅ Véhicule inséré avec succès:');
      console.log(`   ID: ${vehicle.id}`);
      console.log(`   Référence: ${vehicle.reference}`);
      console.log(`   Marque/Modèle: ${vehicle.brand} ${vehicle.model}`);
      
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
      
      return true;
    }
    
    return false;
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    return false;
  }
}

/**
 * Génère le script SQL de nettoyage manuel
 */
function generateManualCleanupScript() {
  console.log('\n📝 Script SQL de nettoyage manuel:\n');
  
  console.log('-- Script de nettoyage pour ref_auto');
  console.log('-- À exécuter manuellement dans l\'interface Supabase SQL Editor');
  console.log('');
  console.log('-- 1. Supprimer les triggers ref_auto');
  console.log('DROP TRIGGER IF EXISTS ensure_ref_auto_on_cars_v2 ON cars_v2;');
  console.log('DROP TRIGGER IF EXISTS set_ref_auto ON cars_v2;');
  console.log('');
  console.log('-- 2. Supprimer la fonction ref_auto');
  console.log('DROP FUNCTION IF EXISTS set_ref_auto_if_null();');
  console.log('');
  console.log('-- 3. Supprimer la contrainte d\'unicité ref_auto');
  console.log('ALTER TABLE cars_v2 DROP CONSTRAINT IF EXISTS cars_v2_ref_auto_unique;');
  console.log('');
  console.log('-- 4. Supprimer la colonne ref_auto');
  console.log('ALTER TABLE cars_v2 DROP COLUMN IF EXISTS ref_auto;');
  console.log('');
  console.log('-- 5. Vérifier que la colonne reference fonctionne');
  console.log('SELECT reference FROM cars_v2 LIMIT 5;');
  console.log('');
  console.log('-- 6. Tester l\'insertion avec génération automatique');
  console.log('INSERT INTO cars_v2 (year, first_registration, mileage, color, gearbox, din_power, nb_seats, nb_doors, average_consumption, road_consumption, city_consumption, emissions, location, fiscal_power, status, brand_id, model_id, vehicle_type_id, fuel_type_id, brand, model, type, fuel_type) VALUES (2024, \'2024-01-01\', 1000, \'BLANC\', \'M\', 100, 5, 5, 5.0, 4.5, 6.0, 120, \'Paris (75)\', 8, \'disponible\', 1, 1, 1, 1, \'TEST\', \'AUTO\', \'BERLINE\', \'ESSENCE\') RETURNING id, reference;');
  console.log('');
  console.log('-- Nettoyage terminé');
}

/**
 * Fonction principale
 */
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'check':
      console.log('🚀 Vérification de l\'état des colonnes...\n');
      
      const refAutoExists = await checkRefAutoColumn();
      const referenceExists = await checkReferenceColumn();
      
      if (refAutoExists === true) {
        console.log('\n⚠️  La colonne ref_auto existe encore');
        console.log('   Utilisez le script SQL manuel pour la supprimer');
        generateManualCleanupScript();
      } else if (refAutoExists === false) {
        console.log('\n✅ La colonne ref_auto a été supprimée');
      }
      
      if (referenceExists) {
        console.log('\n✅ La colonne reference fonctionne correctement');
      }
      
      break;
      
    case 'test':
      console.log('🧪 Test de génération de référence...\n');
      await testReferenceGeneration();
      break;
      
    case 'script':
      generateManualCleanupScript();
      break;
      
    case 'all':
      console.log('🚀 Vérification complète...\n');
      
      const refAutoExists2 = await checkRefAutoColumn();
      const referenceExists2 = await checkReferenceColumn();
      
      if (refAutoExists2 === false && referenceExists2) {
        console.log('\n🧪 Test de génération automatique...');
        await testReferenceGeneration();
      } else if (refAutoExists2 === true) {
        console.log('\n⚠️  La colonne ref_auto existe encore');
        generateManualCleanupScript();
      }
      
      break;
      
    default:
      console.log('Usage:');
      console.log('  node scripts/simple-ref-auto-cleanup.js check  - Vérifier l\'état des colonnes');
      console.log('  node scripts/simple-ref-auto-cleanup.js test   - Tester la génération de référence');
      console.log('  node scripts/simple-ref-auto-cleanup.js script - Générer le script SQL manuel');
      console.log('  node scripts/simple-ref-auto-cleanup.js all    - Vérification complète');
      break;
  }
}

main(); 