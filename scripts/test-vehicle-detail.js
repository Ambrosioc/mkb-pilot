const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testVehicleDetail() {
  console.log('🧪 Test du détail d\'un véhicule avec jointures...\n');

  try {
    // 1. Récupérer un véhicule existant
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('cars_v2')
      .select('id, reference')
      .limit(1);

    if (vehiclesError) {
      throw new Error(`Erreur lors de la récupération des véhicules: ${vehiclesError.message}`);
    }

    if (!vehicles || vehicles.length === 0) {
      console.log('❌ Aucun véhicule trouvé dans la base de données');
      return;
    }

    const vehicleId = vehicles[0].id;
    console.log(`📋 Test avec le véhicule: ${vehicles[0].reference} (ID: ${vehicleId})\n`);

    // 2. Test de la requête avec jointures (comme dans VehicleDetailDrawer)
    console.log('🔍 Test de la requête avec jointures...');
    const { data: vehicleData, error: vehicleError } = await supabase
      .from('cars_v2')
      .select(`
        *,
        brands!left(name),
        models!left(name)
      `)
      .eq('id', vehicleId)
      .single();

    if (vehicleError) {
      console.error('❌ Erreur lors de la récupération du véhicule:', vehicleError.message);
      return;
    }

    console.log('✅ Données du véhicule récupérées avec succès');
    console.log('📊 Données brutes:');
    console.log('  - ID:', vehicleData.id);
    console.log('  - Référence:', vehicleData.reference);
    console.log('  - Brand ID:', vehicleData.brand_id);
    console.log('  - Model ID:', vehicleData.model_id);
    console.log('  - Brands join:', vehicleData.brands);
    console.log('  - Models join:', vehicleData.models);

    // 3. Transformation des données (comme dans le composant)
    const transformedVehicle = {
      ...vehicleData,
      brand: vehicleData.brands?.name || 'N/A',
      model: vehicleData.models?.name || 'N/A'
    };

    console.log('\n🔄 Données transformées:');
    console.log('  - Brand:', transformedVehicle.brand);
    console.log('  - Model:', transformedVehicle.model);

    // 4. Vérification des données de référence
    console.log('\n🔍 Vérification des données de référence...');
    
    if (vehicleData.brand_id) {
      const { data: brandData, error: brandError } = await supabase
        .from('brands')
        .select('name')
        .eq('id', vehicleData.brand_id)
        .single();

      if (brandError) {
        console.error('❌ Erreur lors de la récupération de la marque:', brandError.message);
      } else {
        console.log('✅ Marque trouvée:', brandData.name);
      }
    }

    if (vehicleData.model_id) {
      const { data: modelData, error: modelError } = await supabase
        .from('models')
        .select('name')
        .eq('id', vehicleData.model_id)
        .single();

      if (modelError) {
        console.error('❌ Erreur lors de la récupération du modèle:', modelError.message);
      } else {
        console.log('✅ Modèle trouvé:', modelData.name);
      }
    }

    // 5. Test de la requête simple (ancienne méthode)
    console.log('\n🔍 Test de la requête simple (ancienne méthode)...');
    const { data: simpleVehicleData, error: simpleError } = await supabase
      .from('cars_v2')
      .select('*')
      .eq('id', vehicleId)
      .single();

    if (simpleError) {
      console.error('❌ Erreur avec la requête simple:', simpleError.message);
    } else {
      console.log('✅ Requête simple réussie');
      console.log('  - Brand ID:', simpleVehicleData.brand_id);
      console.log('  - Model ID:', simpleVehicleData.model_id);
      console.log('  - Brand (direct):', simpleVehicleData.brand);
      console.log('  - Model (direct):', simpleVehicleData.model);
    }

    console.log('\n✅ Test terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testVehicleDetail(); 