require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testVehiclesRelations() {
  console.log('🚗 Test des relations véhicules - brands/models...\n');

  try {
    // 1. Test de la requête avec relations
    console.log('1. Test de la requête avec relations brands et models...');
    const { data, error } = await supabase
      .from('cars_v2')
      .select(`
        id,
        reference,
        year,
        color,
        price,
        purchase_price,
        location,
        status,
        created_at,
        add_by_user,
        brand_id,
        model_id,
        brands!inner(name),
        models!inner(name)
      `)
      .eq('status', 'disponible')
      .limit(3);

    if (error) throw error;
    console.log(`✅ ${data.length} véhicules récupérés avec relations`);

    // 2. Afficher les données pour vérifier
    console.log('\n2. Données récupérées:');
    console.log('='.repeat(80));
    
    data.forEach((vehicle, index) => {
      console.log(`${index + 1}. ${vehicle.reference}`);
      console.log(`   Brand ID: ${vehicle.brand_id}, Brand: ${JSON.stringify(vehicle.brands)}`);
      console.log(`   Model ID: ${vehicle.model_id}, Model: ${JSON.stringify(vehicle.models)}`);
      console.log(`   Année: ${vehicle.year}, Couleur: ${vehicle.color}`);
      console.log(`   Prix: ${vehicle.price}€`);
      console.log('');
    });

    // 3. Test de transformation des données
    console.log('3. Test de transformation des données...');
    const transformedData = data.map(item => ({
      id: item.id,
      reference: item.reference,
      brand_name: item.brands?.[0]?.name || 'N/A',
      model_name: item.models?.[0]?.name || 'N/A',
      year: item.year,
      color: item.color,
      price: item.price
    }));

    console.log('\nDonnées transformées:');
    transformedData.forEach((vehicle, index) => {
      console.log(`${index + 1}. ${vehicle.reference}`);
      console.log(`   Marque: ${vehicle.brand_name}`);
      console.log(`   Modèle: ${vehicle.model_name}`);
      console.log(`   Année: ${vehicle.year}, Couleur: ${vehicle.color}`);
      console.log('');
    });

    // 4. Vérifier la structure des relations
    console.log('4. Structure des relations:');
    if (data.length > 0) {
      const firstVehicle = data[0];
      console.log('   brands type:', typeof firstVehicle.brands);
      console.log('   brands is array:', Array.isArray(firstVehicle.brands));
      console.log('   models type:', typeof firstVehicle.models);
      console.log('   models is array:', Array.isArray(firstVehicle.models));
    }

    console.log('\n🎯 Test terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    console.error('Détails:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint
    });
  }
}

// Exécuter le test
testVehiclesRelations(); 