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

async function createTestVehiclesWithReference() {
  try {
    console.log('🧪 Création de véhicules de test avec données de référence...\n');

    // Récupérer les données de référence
    console.log('📋 Récupération des données de référence...');
    
    const [
      { data: brands },
      { data: carTypes },
      { data: fuelTypes },
      { data: dossierTypes }
    ] = await Promise.all([
      supabase.from('brands').select('id, name').order('name'),
      supabase.from('car_types').select('id, name').order('name'),
      supabase.from('fuel_types').select('id, name').order('name'),
      supabase.from('dossier_types').select('id, name').order('name')
    ]);

    // Récupérer les modèles pour quelques marques populaires
    const popularBrands = ['Peugeot', 'Renault', 'BMW', 'Mercedes', 'Volkswagen'];
    const modelsData = {};
    
    for (const brandName of popularBrands) {
      const brand = brands?.find(b => b.name === brandName);
      if (brand) {
        const { data: models } = await supabase
          .from('models')
          .select('id, name')
          .eq('brand_id', brand.id)
          .order('name');
        modelsData[brandName] = models || [];
      }
    }

    console.log('✅ Données de référence récupérées');

    // Créer des véhicules de test avec les données de référence
    console.log('\n📋 Création des véhicules de test...');
    
    const testVehicles = [
      {
        brand_id: brands?.find(b => b.name === 'Peugeot')?.id,
        model_id: modelsData['Peugeot']?.find(m => m.name === '308')?.id,
        year: 2022,
        first_registration: '03/2022',
        mileage: 45000,
        color: 'Blanc',
        car_type_id: carTypes?.find(t => t.name === 'Berline')?.id,
        fuel_type_id: fuelTypes?.find(f => f.name === 'Essence')?.id,
        price: 18500,
        purchase_price: 15000,
        location: 'FR',
        status: 'disponible',
        dossier_type_id: dossierTypes?.find(d => d.name === 'STOCK')?.id,
        user_id: '00000000-0000-0000-0000-000000000001'
      },
      {
        brand_id: brands?.find(b => b.name === 'Renault')?.id,
        model_id: modelsData['Renault']?.find(m => m.name === 'Clio')?.id,
        year: 2021,
        first_registration: '06/2021',
        mileage: 32000,
        color: 'Gris',
        car_type_id: carTypes?.find(t => t.name === 'Citadine')?.id,
        fuel_type_id: fuelTypes?.find(f => f.name === 'Diesel')?.id,
        price: 14500,
        purchase_price: 12000,
        location: 'FR',
        status: 'disponible',
        dossier_type_id: dossierTypes?.find(d => d.name === 'DPV')?.id,
        user_id: '00000000-0000-0000-0000-000000000001'
      },
      {
        brand_id: brands?.find(b => b.name === 'Volkswagen')?.id,
        model_id: modelsData['Volkswagen']?.find(m => m.name === 'Golf')?.id,
        year: 2023,
        first_registration: '01/2023',
        mileage: 18000,
        color: 'Bleu',
        car_type_id: carTypes?.find(t => t.name === 'Berline')?.id,
        fuel_type_id: fuelTypes?.find(f => f.name === 'Hybride')?.id,
        price: 22500,
        purchase_price: 19000,
        location: 'FR',
        status: 'reserve',
        dossier_type_id: dossierTypes?.find(d => d.name === 'REMA FR')?.id,
        user_id: '00000000-0000-0000-0000-000000000001'
      },
      {
        brand_id: brands?.find(b => b.name === 'BMW')?.id,
        model_id: modelsData['BMW']?.find(m => m.name === 'Série 3')?.id,
        year: 2020,
        first_registration: '09/2020',
        mileage: 65000,
        color: 'Noir',
        car_type_id: carTypes?.find(t => t.name === 'Berline')?.id,
        fuel_type_id: fuelTypes?.find(f => f.name === 'Diesel')?.id,
        price: 28500,
        purchase_price: 24000,
        location: 'FR',
        status: 'vendu',
        dossier_type_id: dossierTypes?.find(d => d.name === 'DPV')?.id,
        user_id: '00000000-0000-0000-0000-000000000001'
      },
      {
        brand_id: brands?.find(b => b.name === 'Mercedes')?.id,
        model_id: modelsData['Mercedes']?.find(m => m.name === 'Classe A')?.id,
        year: 2022,
        first_registration: '12/2022',
        mileage: 28000,
        color: 'Rouge',
        car_type_id: carTypes?.find(t => t.name === 'Berline')?.id,
        fuel_type_id: fuelTypes?.find(f => f.name === 'Essence')?.id,
        price: 26500,
        purchase_price: 22000,
        location: 'FR',
        status: 'a-verifier',
        dossier_type_id: dossierTypes?.find(d => d.name === 'REPRISE')?.id,
        user_id: '00000000-0000-0000-0000-000000000001'
      },
      {
        brand_id: brands?.find(b => b.name === 'Peugeot')?.id,
        model_id: modelsData['Peugeot']?.find(m => m.name === '3008')?.id,
        year: 2023,
        first_registration: '02/2023',
        mileage: 15000,
        color: 'Vert',
        car_type_id: carTypes?.find(t => t.name === 'SUV')?.id,
        fuel_type_id: fuelTypes?.find(f => f.name === 'Électrique')?.id,
        price: 35000,
        purchase_price: 30000,
        location: 'FR',
        status: 'disponible',
        dossier_type_id: dossierTypes?.find(d => d.name === 'STOCK')?.id,
        user_id: '00000000-0000-0000-0000-000000000001'
      },
      {
        brand_id: brands?.find(b => b.name === 'Renault')?.id,
        model_id: modelsData['Renault']?.find(m => m.name === 'Captur')?.id,
        year: 2021,
        first_registration: '08/2021',
        mileage: 38000,
        color: 'Orange',
        car_type_id: carTypes?.find(t => t.name === 'SUV')?.id,
        fuel_type_id: fuelTypes?.find(f => f.name === 'Hybride rechargeable')?.id,
        price: 19500,
        purchase_price: 16000,
        location: 'FR',
        status: 'reserve',
        dossier_type_id: dossierTypes?.find(d => d.name === 'REMA BE')?.id,
        user_id: '00000000-0000-0000-0000-000000000001'
      }
    ].filter(vehicle => vehicle.brand_id && vehicle.model_id); // Filtrer les véhicules sans brand_id ou model_id

    const { data: insertedVehicles, error: vehiclesError } = await supabase
      .from('cars_v2')
      .insert(testVehicles)
      .select('id, reference, brand_id, model_id, year, price, status, car_type_id, fuel_type_id, dossier_type_id');

    if (vehiclesError) {
      console.error('❌ Erreur lors de la création des véhicules:', vehiclesError);
      return;
    }

    console.log(`✅ ${insertedVehicles?.length || 0} véhicules créés avec données de référence`);
    console.log('\n📊 Véhicules créés:');
    
    insertedVehicles?.forEach(vehicle => {
      const brand = brands?.find(b => b.id === vehicle.brand_id);
      const model = modelsData[brand?.name]?.find(m => m.id === vehicle.model_id);
      const carType = carTypes?.find(t => t.id === vehicle.car_type_id);
      const fuelType = fuelTypes?.find(f => f.id === vehicle.fuel_type_id);
      const dossierType = dossierTypes?.find(d => d.id === vehicle.dossier_type_id);
      
      console.log(`  - ${brand?.name} ${model?.name} ${vehicle.year} (${vehicle.reference})`);
      console.log(`    Statut: ${vehicle.status} | Type: ${carType?.name} | Carburant: ${fuelType?.name} | Dossier: ${dossierType?.name}`);
      console.log(`    Prix: €${vehicle.price?.toLocaleString()} | Kilométrage: ${vehicle.mileage?.toLocaleString()} km`);
      console.log('');
    });

    console.log('✅ Véhicules de test créés avec succès !');
    console.log('\n💡 Tu peux maintenant tester la page de stock avec des données complètes.');

  } catch (error) {
    console.error('❌ Erreur lors de la création des véhicules:', error.message);
  }
}

createTestVehiclesWithReference().catch(console.error); 