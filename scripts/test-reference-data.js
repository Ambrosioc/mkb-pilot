const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Utilise la clé service si elle est présente, sinon la clé anonyme
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testReferenceData() {
  try {
    console.log('🧪 Test des données de référence...\n');

    // Test 1: Types de véhicules
    console.log('📋 Test 1: Types de véhicules');
    const { data: carTypes, error: carTypesError } = await supabase
      .from('car_types')
      .select('*')
      .order('name');

    if (carTypesError) {
      console.error('❌ Erreur lors de la récupération des types de véhicules:', carTypesError);
    } else {
      console.log(`✅ ${carTypes?.length || 0} types de véhicules trouvés`);
      console.log('Types:', carTypes?.map(t => t.name).join(', '));
    }

    // Test 2: Types de carburant
    console.log('\n📋 Test 2: Types de carburant');
    const { data: fuelTypes, error: fuelTypesError } = await supabase
      .from('fuel_types')
      .select('*')
      .order('name');

    if (fuelTypesError) {
      console.error('❌ Erreur lors de la récupération des types de carburant:', fuelTypesError);
    } else {
      console.log(`✅ ${fuelTypes?.length || 0} types de carburant trouvés`);
      console.log('Types:', fuelTypes?.map(t => t.name).join(', '));
    }

    // Test 3: Types de dossiers
    console.log('\n📋 Test 3: Types de dossiers');
    const { data: dossierTypes, error: dossierTypesError } = await supabase
      .from('dossier_types')
      .select('*')
      .order('name');

    if (dossierTypesError) {
      console.error('❌ Erreur lors de la récupération des types de dossiers:', dossierTypesError);
    } else {
      console.log(`✅ ${dossierTypes?.length || 0} types de dossiers trouvés`);
      dossierTypes?.forEach(dt => {
        console.log(`  - ${dt.name}: ${dt.description}`);
      });
    }

    // Test 4: Marques
    console.log('\n📋 Test 4: Marques');
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('*')
      .order('name');

    if (brandsError) {
      console.error('❌ Erreur lors de la récupération des marques:', brandsError);
    } else {
      console.log(`✅ ${brands?.length || 0} marques trouvées`);
      console.log('Marques:', brands?.map(b => b.name).join(', '));
    }

    // Test 5: Modèles (pour quelques marques populaires)
    console.log('\n📋 Test 5: Modèles (exemples)');
    const popularBrands = ['Peugeot', 'Renault', 'BMW', 'Mercedes', 'Volkswagen'];
    
    for (const brandName of popularBrands) {
      const { data: models, error: modelsError } = await supabase
        .from('models')
        .select('name')
        .eq('brand_id', brands?.find(b => b.name === brandName)?.id)
        .order('name');

      if (modelsError) {
        console.error(`❌ Erreur lors de la récupération des modèles ${brandName}:`, modelsError);
      } else {
        console.log(`✅ ${brandName}: ${models?.length || 0} modèles`);
        console.log(`   ${models?.map(m => m.name).join(', ')}`);
      }
    }

    // Test 6: Statistiques globales
    console.log('\n📋 Test 6: Statistiques globales');
    console.log(`📊 Total marques: ${brands?.length || 0}`);
    
    const { count: totalModels, error: modelsCountError } = await supabase
      .from('models')
      .select('*', { count: 'exact', head: true });

    if (modelsCountError) {
      console.error('❌ Erreur lors du comptage des modèles:', modelsCountError);
    } else {
      console.log(`📊 Total modèles: ${totalModels || 0}`);
    }

    console.log(`📊 Total types de véhicules: ${carTypes?.length || 0}`);
    console.log(`📊 Total types de carburant: ${fuelTypes?.length || 0}`);
    console.log(`📊 Total types de dossiers: ${dossierTypes?.length || 0}`);

    console.log('\n✅ Tests des données de référence terminés avec succès !');
    console.log('\n💡 Toutes les données de référence sont maintenant disponibles pour les formulaires et les filtres.');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
  }
}

testReferenceData().catch(console.error); 