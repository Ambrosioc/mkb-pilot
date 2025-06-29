// Script pour identifier toutes les dépendances de ref_auto
// Usage: node scripts/identify-ref-auto-dependencies.js

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
 * Identifie tous les triggers sur cars_v2
 */
async function identifyTriggers() {
  console.log('🔍 Identification des triggers sur cars_v2...\n');
  
  try {
    // Requête SQL directe pour récupérer les triggers
    const { data: triggers, error } = await supabase
      .rpc('exec_sql', { 
        sql_query: `
          SELECT 
            trigger_name,
            event_manipulation,
            action_statement
          FROM information_schema.triggers 
          WHERE event_object_table = 'cars_v2'
          ORDER BY trigger_name;
        `
      });
    
    if (error) {
      console.log('⚠️  Impossible de récupérer les triggers via RPC');
      console.log('   Erreur:', error.message);
      
      // Alternative : essayer une requête plus simple
      console.log('\n🔍 Tentative avec requête simple...');
      await identifyTriggersSimple();
      return;
    }
    
    if (triggers && triggers.length > 0) {
      console.log('📋 Triggers détectés sur cars_v2:');
      triggers.forEach((trigger, index) => {
        const status = trigger.trigger_name.includes('ref_auto') ? '❌ À SUPPRIMER' : '✅ À CONSERVER';
        console.log(`   ${index + 1}. ${trigger.trigger_name} (${trigger.event_manipulation}) ${status}`);
      });
      
      // Identifier les triggers à supprimer
      const triggersToDrop = triggers.filter(t => t.trigger_name.includes('ref_auto'));
      if (triggersToDrop.length > 0) {
        console.log('\n⚠️  Triggers à supprimer avant de supprimer ref_auto:');
        triggersToDrop.forEach(trigger => {
          console.log(`   DROP TRIGGER IF EXISTS ${trigger.trigger_name} ON cars_v2;`);
        });
      } else {
        console.log('\n✅ Aucun trigger ref_auto détecté');
      }
    } else {
      console.log('ℹ️  Aucun trigger détecté sur cars_v2');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'identification des triggers:', error.message);
  }
}

/**
 * Identification simple des triggers
 */
async function identifyTriggersSimple() {
  try {
    // Essayer de lister les triggers avec une requête simple
    const { data: triggers, error } = await supabase
      .rpc('exec_sql', { 
        sql_query: `
          SELECT 
            tgname as trigger_name,
            tgenabled as enabled
          FROM pg_trigger 
          WHERE tgrelid = 'cars_v2'::regclass
          ORDER BY tgname;
        `
      });
    
    if (error) {
      console.error('❌ Erreur lors de la récupération des triggers:', error.message);
      return;
    }
    
    if (triggers && triggers.length > 0) {
      console.log('📋 Triggers détectés sur cars_v2:');
      triggers.forEach((trigger, index) => {
        const status = trigger.trigger_name.includes('ref_auto') ? '❌ À SUPPRIMER' : '✅ À CONSERVER';
        console.log(`   ${index + 1}. ${trigger.trigger_name} (enabled: ${trigger.enabled}) ${status}`);
      });
      
      // Identifier les triggers à supprimer
      const triggersToDrop = triggers.filter(t => t.trigger_name.includes('ref_auto'));
      if (triggersToDrop.length > 0) {
        console.log('\n⚠️  Triggers à supprimer avant de supprimer ref_auto:');
        triggersToDrop.forEach(trigger => {
          console.log(`   DROP TRIGGER IF EXISTS ${trigger.trigger_name} ON cars_v2;`);
        });
      } else {
        console.log('\n✅ Aucun trigger ref_auto détecté');
      }
    } else {
      console.log('ℹ️  Aucun trigger trouvé sur cars_v2');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'identification simple:', error.message);
  }
}

/**
 * Identifie les contraintes sur ref_auto
 */
async function identifyConstraints() {
  console.log('\n🔍 Identification des contraintes sur ref_auto...\n');
  
  try {
    // Requête SQL directe pour récupérer les contraintes
    const { data: constraints, error } = await supabase
      .rpc('exec_sql', { 
        sql_query: `
          SELECT 
            conname as constraint_name,
            contype as constraint_type
          FROM pg_constraint 
          WHERE conrelid = 'cars_v2'::regclass
          ORDER BY conname;
        `
      });
    
    if (error) {
      console.error('❌ Erreur lors de la récupération des contraintes:', error.message);
      return;
    }
    
    if (constraints && constraints.length > 0) {
      console.log('📋 Contraintes détectées sur cars_v2:');
      constraints.forEach((constraint, index) => {
        const status = constraint.constraint_name.includes('ref_auto') ? '❌ À SUPPRIMER' : '✅ À CONSERVER';
        const type = constraint.constraint_type === 'u' ? 'UNIQUE' : 
                    constraint.constraint_type === 'p' ? 'PRIMARY KEY' : 
                    constraint.constraint_type === 'f' ? 'FOREIGN KEY' : 
                    constraint.constraint_type === 'c' ? 'CHECK' : constraint.constraint_type;
        console.log(`   ${index + 1}. ${constraint.constraint_name} (${type}) ${status}`);
      });
      
      // Identifier les contraintes à supprimer
      const constraintsToDrop = constraints.filter(c => c.constraint_name.includes('ref_auto'));
      if (constraintsToDrop.length > 0) {
        console.log('\n⚠️  Contraintes à supprimer avant de supprimer ref_auto:');
        constraintsToDrop.forEach(constraint => {
          console.log(`   ALTER TABLE cars_v2 DROP CONSTRAINT IF EXISTS ${constraint.constraint_name};`);
        });
      } else {
        console.log('\n✅ Aucune contrainte ref_auto détectée');
      }
    } else {
      console.log('ℹ️  Aucune contrainte détectée sur cars_v2');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'identification des contraintes:', error.message);
  }
}

/**
 * Identifie les fonctions qui utilisent ref_auto
 */
async function identifyFunctions() {
  console.log('\n🔍 Identification des fonctions utilisant ref_auto...\n');
  
  try {
    // Requête SQL directe pour récupérer les fonctions
    const { data: functions, error } = await supabase
      .rpc('exec_sql', { 
        sql_query: `
          SELECT 
            proname as function_name,
            prosrc as source_code
          FROM pg_proc 
          WHERE prosrc LIKE '%ref_auto%'
          ORDER BY proname;
        `
      });
    
    if (error) {
      console.error('❌ Erreur lors de la récupération des fonctions:', error.message);
      return;
    }
    
    if (functions && functions.length > 0) {
      console.log('📋 Fonctions utilisant ref_auto:');
      functions.forEach((func, index) => {
        const status = func.function_name.includes('ref_auto') ? '❌ À SUPPRIMER' : '⚠️  À MODIFIER';
        console.log(`   ${index + 1}. ${func.function_name} ${status}`);
      });
      
      // Identifier les fonctions à supprimer
      const functionsToDrop = functions.filter(f => f.function_name.includes('ref_auto'));
      if (functionsToDrop.length > 0) {
        console.log('\n⚠️  Fonctions à supprimer:');
        functionsToDrop.forEach(func => {
          console.log(`   DROP FUNCTION IF EXISTS ${func.function_name}();`);
        });
      }
    } else {
      console.log('ℹ️  Aucune fonction utilisant ref_auto détectée');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'identification des fonctions:', error.message);
  }
}

/**
 * Génère le script SQL de nettoyage
 */
async function generateCleanupScript() {
  console.log('\n📝 Génération du script SQL de nettoyage...\n');
  
  try {
    // Collecter toutes les informations
    const { data: triggers } = await supabase
      .rpc('exec_sql', { 
        sql_query: `
          SELECT tgname as trigger_name
          FROM pg_trigger 
          WHERE tgrelid = 'cars_v2'::regclass
          AND tgname LIKE '%ref_auto%';
        `
      });
    
    const { data: constraints } = await supabase
      .rpc('exec_sql', { 
        sql_query: `
          SELECT conname as constraint_name
          FROM pg_constraint 
          WHERE conrelid = 'cars_v2'::regclass
          AND conname LIKE '%ref_auto%';
        `
      });
    
    const { data: functions } = await supabase
      .rpc('exec_sql', { 
        sql_query: `
          SELECT proname as function_name
          FROM pg_proc 
          WHERE proname LIKE '%ref_auto%';
        `
      });
    
    console.log('-- Script de nettoyage pour ref_auto');
    console.log('-- Généré automatiquement');
    console.log('');
    
    // Supprimer les triggers
    if (triggers && triggers.length > 0) {
      console.log('-- Suppression des triggers ref_auto');
      triggers.forEach(trigger => {
        console.log(`DROP TRIGGER IF EXISTS ${trigger.trigger_name} ON cars_v2;`);
      });
      console.log('');
    }
    
    // Supprimer les contraintes
    if (constraints && constraints.length > 0) {
      console.log('-- Suppression des contraintes ref_auto');
      constraints.forEach(constraint => {
        console.log(`ALTER TABLE cars_v2 DROP CONSTRAINT IF EXISTS ${constraint.constraint_name};`);
      });
      console.log('');
    }
    
    // Supprimer les fonctions
    if (functions && functions.length > 0) {
      console.log('-- Suppression des fonctions ref_auto');
      functions.forEach(func => {
        console.log(`DROP FUNCTION IF EXISTS ${func.function_name}();`);
      });
      console.log('');
    }
    
    // Supprimer la colonne
    console.log('-- Suppression de la colonne ref_auto');
    console.log('ALTER TABLE cars_v2 DROP COLUMN IF EXISTS ref_auto;');
    console.log('');
    console.log('-- Nettoyage terminé');
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération du script:', error.message);
  }
}

/**
 * Fonction principale
 */
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'triggers':
      await identifyTriggers();
      break;
    case 'constraints':
      await identifyConstraints();
      break;
    case 'functions':
      await identifyFunctions();
      break;
    case 'script':
      await generateCleanupScript();
      break;
    case 'all':
      console.log('🚀 Identification complète des dépendances ref_auto...\n');
      
      await identifyTriggers();
      await identifyConstraints();
      await identifyFunctions();
      
      console.log('\n📝 Génération du script de nettoyage...');
      await generateCleanupScript();
      
      break;
    default:
      console.log('Usage:');
      console.log('  node scripts/identify-ref-auto-dependencies.js triggers  - Identifier les triggers');
      console.log('  node scripts/identify-ref-auto-dependencies.js constraints - Identifier les contraintes');
      console.log('  node scripts/identify-ref-auto-dependencies.js functions   - Identifier les fonctions');
      console.log('  node scripts/identify-ref-auto-dependencies.js script     - Générer le script SQL');
      console.log('  node scripts/identify-ref-auto-dependencies.js all        - Identification complète');
      break;
  }
}

main(); 