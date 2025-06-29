// Script pour synchroniser les prix entre advertisements et cars_v2
// Usage: node scripts/update-car-prices.js

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
 * Met à jour le prix d'une voiture dans cars_v2
 * @param {number} carId - L'ID de la voiture
 * @param {number} price - Le nouveau prix
 * @returns {Promise<boolean>} - true si succès, false sinon
 */
async function updateCarPrice(carId, price) {
  try {
    console.log(`   📝 Mise à jour du prix pour la voiture ID ${carId}: ${price}`);
    
    const { data, error } = await supabase
      .from('cars_v2')
      .update({ price: price })
      .eq('id', carId)
      .select('id, price');
    
    if (error) {
      console.error(`   ❌ Erreur lors de la mise à jour: ${error.message}`);
      console.error(`   🔍 Code d'erreur: ${error.code}`);
      console.error(`   📋 Détails: ${error.details || 'Aucun détail'}`);
      return false;
    }
    
    if (data && data.length > 0) {
      console.log(`   ✅ Prix mis à jour avec succès: ${data[0].price}`);
      return true;
    } else {
      console.error(`   ❌ Aucune ligne mise à jour pour l'ID ${carId}`);
      return false;
    }
    
  } catch (error) {
    console.error(`   ❌ Erreur inattendue: ${error.message}`);
    return false;
  }
}

/**
 * Traite une annonce et met à jour le prix correspondant
 * @param {Object} advertisement - L'objet annonce
 * @param {number} index - L'index de l'annonce dans la liste
 * @param {number} total - Le nombre total d'annonces
 * @returns {Promise<boolean>} - true si succès, false sinon
 */
async function processAdvertisement(advertisement, index, total) {
  const { car_id, price } = advertisement;
  
  console.log(`\n🔄 Traitement de l'annonce ${index + 1}/${total}:`);
  console.log(`   📋 ID Annonce: ${advertisement.id || 'N/A'}`);
  console.log(`   🚗 ID Voiture: ${car_id}`);
  console.log(`   💰 Prix: ${price}`);
  
  // Vérifier que le prix n'est pas null
  if (price === null || price === undefined) {
    console.log(`   ⚠️  Prix null/undefined, annonce ignorée`);
    return false;
  }
  
  // Vérifier que car_id existe
  if (!car_id) {
    console.error(`   ❌ car_id manquant, annonce ignorée`);
    return false;
  }
  
  // Vérifier que le prix est un nombre valide
  if (typeof price !== 'number' || isNaN(price) || price <= 0) {
    console.error(`   ❌ Prix invalide (${price}), annonce ignorée`);
    return false;
  }
  
  // Vérifier que la voiture existe
  try {
    const { data: car, error: carError } = await supabase
      .from('cars_v2')
      .select('id, price')
      .eq('id', car_id)
      .single();
    
    if (carError) {
      console.error(`   ❌ Voiture ID ${car_id} non trouvée: ${carError.message}`);
      return false;
    }
    
    console.log(`   ✅ Voiture trouvée (prix actuel: ${car.price || 'null'})`);
    
    // Mettre à jour le prix
    return await updateCarPrice(car_id, price);
    
  } catch (error) {
    console.error(`   ❌ Erreur lors de la vérification de la voiture: ${error.message}`);
    return false;
  }
}

/**
 * Fonction principale pour traiter toutes les annonces
 */
async function updateCarPrices() {
  console.log('🚀 Début de la synchronisation des prix entre advertisements et cars_v2...\n');
  
  try {
    // Récupérer toutes les annonces avec prix non-null
    console.log('📋 Récupération des annonces avec prix...');
    const { data: advertisements, error } = await supabase
      .from('advertisements')
      .select('id, car_id, price')
      .not('price', 'is', null)
      .order('id');
    
    if (error) {
      throw new Error(`Erreur lors de la récupération des annonces: ${error.message}`);
    }
    
    console.log(`✅ ${advertisements.length} annonces trouvées avec prix\n`);
    
    if (advertisements.length === 0) {
      console.log('ℹ️  Aucune annonce avec prix à traiter');
      return;
    }
    
    // Statistiques
    let updatedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    // Traiter chaque annonce
    for (let i = 0; i < advertisements.length; i++) {
      const advertisement = advertisements[i];
      
      const success = await processAdvertisement(advertisement, i, advertisements.length);
      
      if (success) {
        updatedCount++;
      } else {
        errorCount++;
      }
      
      // Pause courte pour éviter de surcharger la base de données
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Résumé final
    console.log('\n🎉 Synchronisation terminée !');
    console.log('\n📊 Résumé:');
    console.log(`   ✅ Prix mis à jour: ${updatedCount}`);
    console.log(`   ❌ Erreurs: ${errorCount}`);
    console.log(`   📋 Total traité: ${advertisements.length}`);
    
  } catch (error) {
    console.error('\n❌ Erreur lors du traitement:', error.message);
    process.exit(1);
  }
}

/**
 * Affiche les statistiques actuelles
 */
async function showStats() {
  console.log('📊 Statistiques actuelles...\n');
  
  try {
    // Compter les annonces avec prix
    const { count: adsWithPrice, error: adsError } = await supabase
      .from('advertisements')
      .select('*', { count: 'exact', head: true })
      .not('price', 'is', null);
    
    // Compter les voitures avec prix
    const { count: carsWithPrice, error: carsError } = await supabase
      .from('cars_v2')
      .select('*', { count: 'exact', head: true })
      .not('price', 'is', null);
    
    // Compter le total des annonces
    const { count: totalAds, error: totalAdsError } = await supabase
      .from('advertisements')
      .select('*', { count: 'exact', head: true });
    
    // Compter le total des voitures
    const { count: totalCars, error: totalCarsError } = await supabase
      .from('cars_v2')
      .select('*', { count: 'exact', head: true });
    
    if (adsError || carsError || totalAdsError || totalCarsError) {
      throw new Error('Erreur lors de la récupération des statistiques');
    }
    
    console.log('📈 Table advertisements:');
    console.log(`   Total: ${totalAds}`);
    console.log(`   Avec prix: ${adsWithPrice}`);
    console.log(`   Sans prix: ${totalAds - adsWithPrice}`);
    
    console.log('\n📈 Table cars_v2:');
    console.log(`   Total: ${totalCars}`);
    console.log(`   Avec prix: ${carsWithPrice}`);
    console.log(`   Sans prix: ${totalCars - carsWithPrice}`);
    
    // Afficher quelques exemples
    console.log('\n🔍 Exemples d\'annonces avec prix:');
    const { data: examples } = await supabase
      .from('advertisements')
      .select('id, car_id, price')
      .not('price', 'is', null)
      .limit(5);
    
    examples?.forEach(ad => {
      console.log(`   ID ${ad.id}: Voiture ${ad.car_id} - Prix ${ad.price}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'affichage des statistiques:', error.message);
  }
}

/**
 * Teste une mise à jour simple
 */
async function testUpdate() {
  console.log('🧪 Test de mise à jour...\n');
  
  try {
    // Récupérer une annonce avec prix
    const { data: testAd, error: testAdError } = await supabase
      .from('advertisements')
      .select('id, car_id, price')
      .not('price', 'is', null)
      .limit(1);
    
    if (testAdError) {
      console.error('❌ Erreur lors de la récupération d\'une annonce de test:', testAdError.message);
      return false;
    }
    
    if (!testAd || testAd.length === 0) {
      console.log('⚠️  Aucune annonce avec prix trouvée pour le test');
      return false;
    }
    
    const ad = testAd[0];
    console.log(`📋 Test sur l'annonce ID ${ad.id}:`);
    console.log(`   Voiture ID: ${ad.car_id}`);
    console.log(`   Prix: ${ad.price}`);
    
    // Vérifier la voiture
    const { data: car, error: carError } = await supabase
      .from('cars_v2')
      .select('id, price')
      .eq('id', ad.car_id)
      .single();
    
    if (carError) {
      console.error('❌ Voiture de test non trouvée:', carError.message);
      return false;
    }
    
    console.log(`✅ Voiture trouvée (prix actuel: ${car.price || 'null'})`);
    
    // Test de mise à jour
    const success = await updateCarPrice(ad.car_id, ad.price);
    
    if (success) {
      console.log('✅ Test réussi !');
      return true;
    } else {
      console.log('❌ Test échoué');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    return false;
  }
}

/**
 * Fonction principale
 */
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'update':
      await updateCarPrices();
      break;
    case 'stats':
      await showStats();
      break;
    case 'test':
      await testUpdate();
      break;
    default:
      console.log('Usage:');
      console.log('  node scripts/update-car-prices.js update  - Synchroniser les prix');
      console.log('  node scripts/update-car-prices.js stats   - Afficher les statistiques');
      console.log('  node scripts/update-car-prices.js test    - Tester une mise à jour');
      break;
  }
}

main(); 