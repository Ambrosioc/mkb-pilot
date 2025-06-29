// Script pour migrer les données de ref_auto vers reference
// Usage: node scripts/migrate-ref-auto-to-reference.js

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
 * Migre les données de ref_auto vers reference
 */
async function migrateRefAutoToReference() {
  console.log('🚀 Début de la migration ref_auto → reference...\n');
  
  try {
    // Récupérer tous les véhicules qui ont ref_auto mais pas reference
    console.log('📋 Récupération des véhicules à migrer...');
    const { data: vehiclesToMigrate, error } = await supabase
      .from('cars_v2')
      .select('id, ref_auto, reference')
      .not('ref_auto', 'is', null)
      .or('reference.is.null,reference.eq.')
      .order('id');
    
    if (error) {
      throw new Error(`Erreur lors de la récupération: ${error.message}`);
    }
    
    console.log(`✅ ${vehiclesToMigrate.length} véhicules trouvés à migrer\n`);
    
    if (vehiclesToMigrate.length === 0) {
      console.log('ℹ️  Aucun véhicule à migrer');
      return;
    }
    
    // Statistiques
    let migratedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    // Traiter chaque véhicule
    for (let i = 0; i < vehiclesToMigrate.length; i++) {
      const vehicle = vehiclesToMigrate[i];
      
      console.log(`\n🔄 Migration ${i + 1}/${vehiclesToMigrate.length}:`);
      console.log(`   ID: ${vehicle.id}`);
      console.log(`   ref_auto: "${vehicle.ref_auto}"`);
      console.log(`   reference actuel: "${vehicle.reference || 'null'}"`);
      
      // Vérifier si la référence existe déjà
      if (vehicle.reference && vehicle.reference.trim() !== '') {
        console.log(`   ⚠️  Référence déjà présente, ignoré`);
        skippedCount++;
        continue;
      }
      
      // Vérifier si ref_auto est valide
      if (!vehicle.ref_auto || vehicle.ref_auto.trim() === '') {
        console.log(`   ⚠️  ref_auto vide, ignoré`);
        skippedCount++;
        continue;
      }
      
      // Vérifier que ref_auto n'est pas déjà utilisé comme reference
      const { data: existingRef, error: checkError } = await supabase
        .from('cars_v2')
        .select('id')
        .eq('reference', vehicle.ref_auto)
        .neq('id', vehicle.id);
      
      if (checkError) {
        console.error(`   ❌ Erreur lors de la vérification: ${checkError.message}`);
        errorCount++;
        continue;
      }
      
      if (existingRef && existingRef.length > 0) {
        console.log(`   ⚠️  ref_auto "${vehicle.ref_auto}" déjà utilisé comme reference, ignoré`);
        skippedCount++;
        continue;
      }
      
      // Migrer ref_auto vers reference
      try {
        const { error: updateError } = await supabase
          .from('cars_v2')
          .update({ reference: vehicle.ref_auto })
          .eq('id', vehicle.id);
        
        if (updateError) {
          console.error(`   ❌ Erreur lors de la mise à jour: ${updateError.message}`);
          errorCount++;
        } else {
          console.log(`   ✅ Migré avec succès: "${vehicle.ref_auto}"`);
          migratedCount++;
        }
      } catch (error) {
        console.error(`   ❌ Erreur inattendue: ${error.message}`);
        errorCount++;
      }
      
      // Pause courte
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Résumé final
    console.log('\n🎉 Migration terminée !');
    console.log('\n📊 Résumé:');
    console.log(`   ✅ Migrés avec succès: ${migratedCount}`);
    console.log(`   ⚠️  Ignorés: ${skippedCount}`);
    console.log(`   ❌ Erreurs: ${errorCount}`);
    console.log(`   📋 Total traité: ${vehiclesToMigrate.length}`);
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  }
}

/**
 * Affiche les statistiques de migration
 */
async function showMigrationStats() {
  console.log('📊 Statistiques de migration...\n');
  
  try {
    // Compter les véhicules avec ref_auto
    const { count: withRefAuto, error: withRefAutoError } = await supabase
      .from('cars_v2')
      .select('*', { count: 'exact', head: true })
      .not('ref_auto', 'is', null);
    
    // Compter les véhicules avec reference
    const { count: withReference, error: withReferenceError } = await supabase
      .from('cars_v2')
      .select('*', { count: 'exact', head: true })
      .not('reference', 'is', null);
    
    // Compter les véhicules avec les deux
    const { count: withBoth, error: withBothError } = await supabase
      .from('cars_v2')
      .select('*', { count: 'exact', head: true })
      .not('ref_auto', 'is', null)
      .not('reference', 'is', null);
    
    // Compter les véhicules avec ref_auto mais sans reference
    const { count: refAutoOnly, error: refAutoOnlyError } = await supabase
      .from('cars_v2')
      .select('*', { count: 'exact', head: true })
      .not('ref_auto', 'is', null)
      .or('reference.is.null,reference.eq.');
    
    // Compter le total
    const { count: total, error: totalError } = await supabase
      .from('cars_v2')
      .select('*', { count: 'exact', head: true });
    
    if (withRefAutoError || withReferenceError || withBothError || refAutoOnlyError || totalError) {
      throw new Error('Erreur lors de la récupération des statistiques');
    }
    
    console.log('📈 État de la migration:');
    console.log(`   Total véhicules: ${total}`);
    console.log(`   Avec ref_auto: ${withRefAuto}`);
    console.log(`   Avec reference: ${withReference}`);
    console.log(`   Avec les deux: ${withBoth}`);
    console.log(`   ref_auto seulement: ${refAutoOnly}`);
    console.log(`   Sans aucune référence: ${total - withRefAuto - withReference + withBoth}`);
    
    // Afficher quelques exemples
    console.log('\n🔍 Exemples de véhicules avec ref_auto seulement:');
    const { data: examples } = await supabase
      .from('cars_v2')
      .select('id, ref_auto, reference')
      .not('ref_auto', 'is', null)
      .or('reference.is.null,reference.eq.')
      .limit(5);
    
    examples?.forEach(car => {
      console.log(`   ID ${car.id}: ref_auto="${car.ref_auto}" | reference="${car.reference || 'null'}"`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'affichage des statistiques:', error.message);
  }
}

/**
 * Vérifie la cohérence des données
 */
async function checkDataConsistency() {
  console.log('🔍 Vérification de la cohérence des données...\n');
  
  try {
    // Vérifier les doublons dans reference
    console.log('1️⃣ Vérification des doublons dans reference...');
    const { data: duplicateRefs, error: duplicateRefsError } = await supabase
      .from('cars_v2')
      .select('reference, COUNT(*) as count')
      .not('reference', 'is', null)
      .group('reference')
      .gt('count', 1);
    
    if (duplicateRefsError) {
      console.error('❌ Erreur lors de la vérification des doublons reference:', duplicateRefsError.message);
    } else if (duplicateRefs && duplicateRefs.length > 0) {
      console.log(`⚠️  ${duplicateRefs.length} doublons trouvés dans reference:`);
      duplicateRefs.forEach(dup => {
        console.log(`   "${dup.reference}": ${dup.count} occurrences`);
      });
    } else {
      console.log('✅ Aucun doublon dans reference');
    }
    
    // Vérifier les doublons dans ref_auto
    console.log('\n2️⃣ Vérification des doublons dans ref_auto...');
    const { data: duplicateRefAutos, error: duplicateRefAutosError } = await supabase
      .from('cars_v2')
      .select('ref_auto, COUNT(*) as count')
      .not('ref_auto', 'is', null)
      .group('ref_auto')
      .gt('count', 1);
    
    if (duplicateRefAutosError) {
      console.error('❌ Erreur lors de la vérification des doublons ref_auto:', duplicateRefAutosError.message);
    } else if (duplicateRefAutos && duplicateRefAutos.length > 0) {
      console.log(`⚠️  ${duplicateRefAutos.length} doublons trouvés dans ref_auto:`);
      duplicateRefAutos.forEach(dup => {
        console.log(`   "${dup.ref_auto}": ${dup.count} occurrences`);
      });
    } else {
      console.log('✅ Aucun doublon dans ref_auto');
    }
    
    // Vérifier les incohérences entre ref_auto et reference
    console.log('\n3️⃣ Vérification des incohérences ref_auto ↔ reference...');
    const { data: inconsistencies, error: inconsistenciesError } = await supabase
      .from('cars_v2')
      .select('id, ref_auto, reference')
      .not('ref_auto', 'is', null)
      .not('reference', 'is', null)
      .neq('ref_auto', 'reference');
    
    if (inconsistenciesError) {
      console.error('❌ Erreur lors de la vérification des incohérences:', inconsistenciesError.message);
    } else if (inconsistencies && inconsistencies.length > 0) {
      console.log(`⚠️  ${inconsistencies.length} incohérences trouvées:`);
      inconsistencies.forEach(inc => {
        console.log(`   ID ${inc.id}: ref_auto="${inc.ref_auto}" ≠ reference="${inc.reference}"`);
      });
    } else {
      console.log('✅ Aucune incohérence entre ref_auto et reference');
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
    case 'migrate':
      await migrateRefAutoToReference();
      break;
    case 'stats':
      await showMigrationStats();
      break;
    case 'check':
      await checkDataConsistency();
      break;
    case 'all':
      console.log('🚀 Processus complet de migration...\n');
      
      console.log('1️⃣ Vérification de la cohérence...');
      await checkDataConsistency();
      
      console.log('\n2️⃣ Statistiques avant migration...');
      await showMigrationStats();
      
      console.log('\n3️⃣ Migration des données...');
      await migrateRefAutoToReference();
      
      console.log('\n4️⃣ Statistiques après migration...');
      await showMigrationStats();
      
      break;
    default:
      console.log('Usage:');
      console.log('  node scripts/migrate-ref-auto-to-reference.js migrate  - Migrer ref_auto vers reference');
      console.log('  node scripts/migrate-ref-auto-to-reference.js stats     - Afficher les statistiques');
      console.log('  node scripts/migrate-ref-auto-to-reference.js check     - Vérifier la cohérence');
      console.log('  node scripts/migrate-ref-auto-to-reference.js all       - Processus complet');
      break;
  }
}

main(); 