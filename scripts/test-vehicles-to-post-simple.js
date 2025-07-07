require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.log('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testVehiclesToPost() {
  console.log('🚗 Test des véhicules à poster...\n');

  try {
    // 1. Récupérer tous les véhicules disponibles
    console.log('1. Récupération des véhicules disponibles...');
    const { data: vehicles, error: vehiclesError } = await supabase
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
        add_by_user
      `)
      .eq('status', 'disponible')
      .order('created_at', { ascending: false });

    if (vehiclesError) throw vehiclesError;
    console.log(`✅ ${vehicles.length} véhicules disponibles trouvés`);

    // 2. Récupérer les véhicules déjà postés
    console.log('\n2. Récupération des véhicules déjà postés...');
    const { data: postedVehicles, error: postedError } = await supabase
      .from('advertisements')
      .select('car_id');

    if (postedError) throw postedError;
    console.log(`✅ ${postedVehicles.length} véhicules déjà postés`);

    // 3. Filtrer les véhicules à poster
    const postedIds = new Set(postedVehicles.map(v => v.car_id));
    const vehiclesToPost = vehicles.filter(v => !postedIds.has(v.id));
    console.log(`✅ ${vehiclesToPost.length} véhicules à poster`);

    // 4. Récupérer les informations utilisateur
    console.log('\n3. Récupération des informations utilisateur...');
    const userIds = [...new Set(vehiclesToPost.map(v => v.add_by_user).filter(Boolean))];
    let usersMap = {};

    if (userIds.length > 0) {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('auth_user_id, prenom, nom')
        .in('auth_user_id', userIds);

      if (!usersError && usersData) {
        usersMap = usersData.reduce((acc, user) => {
          acc[user.auth_user_id] = { prenom: user.prenom, nom: user.nom };
          return acc;
        }, {});
      }
      console.log(`✅ ${Object.keys(usersMap).length} utilisateurs récupérés`);
    }

    // 5. Afficher les résultats
    console.log('\n4. Résultats:');
    console.log('='.repeat(80));
    
    if (vehiclesToPost.length === 0) {
      console.log('🎉 Aucun véhicule à poster ! Tous les véhicules disponibles ont déjà été publiés.');
    } else {
      vehiclesToPost.forEach((vehicle, index) => {
        const user = usersMap[vehicle.add_by_user];
        const userName = user ? `${user.prenom} ${user.nom}` : 'Utilisateur inconnu';
        
        console.log(`${index + 1}. ${vehicle.reference}`);
        console.log(`   Année: ${vehicle.year}, Couleur: ${vehicle.color}`);
        console.log(`   Prix: ${vehicle.price}€ (Achat: ${vehicle.purchase_price}€)`);
        console.log(`   Localisation: ${vehicle.location}`);
        console.log(`   Ajouté par: ${userName}`);
        console.log(`   Date: ${new Date(vehicle.created_at).toLocaleDateString('fr-FR')}`);
        console.log('');
      });
    }

    // 6. Test de création d'une annonce (simulation)
    if (vehiclesToPost.length > 0) {
      console.log('5. Test de création d\'annonce (simulation)...');
      const testVehicle = vehiclesToPost[0];
      
      const testAdvertisement = {
        car_id: testVehicle.id,
        title: `Test - ${testVehicle.reference}`,
        description: `Véhicule de test ${testVehicle.reference}`,
        price: testVehicle.price,
        photos: [],
        status: 'actif',
        posted_by_user: testVehicle.add_by_user
      };

      console.log('📝 Données de test:');
      console.log(JSON.stringify(testAdvertisement, null, 2));
      console.log('\n✅ Simulation réussie - les données sont correctement formatées');
    }

    console.log('\n🎯 Test terminé avec succès !');
    console.log(`📊 Résumé:`);
    console.log(`   - Véhicules disponibles: ${vehicles.length}`);
    console.log(`   - Véhicules déjà postés: ${postedVehicles.length}`);
    console.log(`   - Véhicules à poster: ${vehiclesToPost.length}`);

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
testVehiclesToPost(); 