// Script pour normaliser et mettre à jour les IDs dans la table cars_v2
// Usage: node scripts/update-cars-v2-ids.js

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

// Cache pour optimiser les requêtes
const cache = {
  brands: new Map(),
  models: new Map(),
  carTypes: new Map(),
  fuelTypes: new Map()
};

// Liste des exceptions pour les modèles (à conserver en majuscule ou avec tirets)
const MODEL_EXCEPTIONS = new Set([
  // Mercedes
  'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'CLA', 'CLS', 'EQA', 'EQB', 'EQC', 'EQE', 'EQS',
  // BMW
  'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'iX', 'i4', 'i7', 'iX1', 'iX3',
  // Audi
  'Q3', 'Q4', 'Q5', 'Q7', 'Q8', 'A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'e-tron', 'Q3 Sportback',
  // Volkswagen
  'ID.3', 'ID.4', 'ID.5', 'ID.7', 'T-Cross', 'T-Roc', 'Tiguan', 'Touareg',
  // Peugeot
  '2008', '3008', '5008', 'e-2008', 'e-3008', 'e-5008',
  // Citroën
  'C3', 'C4', 'C5', 'e-C4', 'e-C4 X',
  // Renault
  'ZOE', 'Kangoo', 'Captur', 'Clio', 'Megane', 'Scenic',
  // Honda
  'CR-V', 'HR-V', 'e:Ny1', 'Civic', 'Jazz',
  // Mazda
  'CX-3', 'CX-30', 'CX-5', 'CX-60', 'MX-30',
  // Volvo
  'EX30', 'EX90', 'XC40', 'XC60', 'XC90', 'C40',
  // Tesla
  'Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck',
  // Autres
  'Leaf', 'Ariya', 'Ioniq', 'Kona', 'Tucson', 'Santa Fe', 'Sportage', 'Sorento',
  'Outlander', 'Eclipse Cross', 'ASX', 'Tiguan', 'Touareg', 'Arteon', 'Golf',
  'Polo', 'Passat', 'T-Cross', 'T-Roc', 'ID.3', 'ID.4', 'ID.5', 'ID.7'
]);

/**
 * Normalise une chaîne de caractères (première lettre en majuscule, reste en minuscule)
 * @param {string} str - La chaîne à normaliser
 * @returns {string} - La chaîne normalisée
 */
function normalizeString(str) {
  if (!str || typeof str !== 'string') return str;
  
  // Supprimer les espaces en début et fin
  const trimmed = str.trim();
  if (!trimmed) return str;
  
  // Mettre la première lettre en majuscule et le reste en minuscule
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

/**
 * Normalise un nom de modèle en respectant les exceptions
 * @param {string} model - Le nom du modèle à normaliser
 * @returns {string} - Le modèle normalisé
 */
function normalizeModel(model) {
  if (!model || typeof model !== 'string') return model;
  
  const trimmed = model.trim();
  if (!trimmed) return model;
  
  // Vérifier si le modèle est dans la liste des exceptions
  if (MODEL_EXCEPTIONS.has(trimmed.toUpperCase())) {
    return trimmed.toUpperCase();
  }
  
  // Normalisation standard (première lettre en majuscule)
  return normalizeString(trimmed);
}

/**
 * Récupère ou crée une marque et retourne son ID
 * @param {string} brandName - Le nom de la marque
 * @returns {Promise<number|null>} - L'ID de la marque ou null si erreur
 */
async function getOrCreateBrand(brandName) {
  if (!brandName) return null;
  
  const normalizedBrand = normalizeString(brandName);
  
  // Vérifier le cache
  if (cache.brands.has(normalizedBrand)) {
    return cache.brands.get(normalizedBrand);
  }
  
  try {
    // Chercher la marque existante
    let { data: existingBrand, error: searchError } = await supabase
      .from('brands')
      .select('id')
      .eq('name', normalizedBrand)
      .single();
    
    if (searchError && searchError.code !== 'PGRST116') {
      console.error(`❌ Erreur lors de la recherche de la marque "${normalizedBrand}":`, searchError.message);
      return null;
    }
    
    let brandId;
    
    if (existingBrand) {
      // Marque existante
      brandId = existingBrand.id;
      console.log(`   ✅ Marque trouvée: "${normalizedBrand}" (ID: ${brandId})`);
    } else {
      // Créer la nouvelle marque
      const { data: newBrand, error: createError } = await supabase
        .from('brands')
        .insert({ name: normalizedBrand })
        .select('id')
        .single();
      
      if (createError) {
        console.error(`❌ Erreur lors de la création de la marque "${normalizedBrand}":`, createError.message);
        return null;
      }
      
      brandId = newBrand.id;
      console.log(`   ➕ Marque créée: "${normalizedBrand}" (ID: ${brandId})`);
    }
    
    // Mettre en cache
    cache.brands.set(normalizedBrand, brandId);
    return brandId;
    
  } catch (error) {
    console.error(`❌ Erreur inattendue pour la marque "${normalizedBrand}":`, error.message);
    return null;
  }
}

/**
 * Récupère ou crée un modèle et retourne son ID
 * @param {string} modelName - Le nom du modèle
 * @param {number} brandId - L'ID de la marque
 * @returns {Promise<number|null>} - L'ID du modèle ou null si erreur
 */
async function getOrCreateModel(modelName, brandId) {
  if (!modelName || !brandId) return null;
  
  const normalizedModel = normalizeModel(modelName);
  const cacheKey = `${brandId}-${normalizedModel}`;
  
  // Vérifier le cache
  if (cache.models.has(cacheKey)) {
    return cache.models.get(cacheKey);
  }
  
  try {
    // Chercher le modèle existant
    let { data: existingModel, error: searchError } = await supabase
      .from('models')
      .select('id')
      .eq('name', normalizedModel)
      .eq('brand_id', brandId)
      .single();
    
    if (searchError && searchError.code !== 'PGRST116') {
      console.error(`❌ Erreur lors de la recherche du modèle "${normalizedModel}":`, searchError.message);
      return null;
    }
    
    let modelId;
    
    if (existingModel) {
      // Modèle existant
      modelId = existingModel.id;
      console.log(`   ✅ Modèle trouvé: "${normalizedModel}" (ID: ${modelId})`);
    } else {
      // Créer le nouveau modèle
      const { data: newModel, error: createError } = await supabase
        .from('models')
        .insert({ 
          name: normalizedModel, 
          brand_id: brandId 
        })
        .select('id')
        .single();
      
      if (createError) {
        console.error(`❌ Erreur lors de la création du modèle "${normalizedModel}":`, createError.message);
        return null;
      }
      
      modelId = newModel.id;
      console.log(`   ➕ Modèle créé: "${normalizedModel}" (ID: ${modelId})`);
    }
    
    // Mettre en cache
    cache.models.set(cacheKey, modelId);
    return modelId;
    
  } catch (error) {
    console.error(`❌ Erreur inattendue pour le modèle "${normalizedModel}":`, error.message);
    return null;
  }
}

/**
 * Récupère ou crée un type de véhicule et retourne son ID
 * @param {string} typeName - Le nom du type
 * @returns {Promise<number|null>} - L'ID du type ou null si erreur
 */
async function getOrCreateCarType(typeName) {
  if (!typeName) return null;
  
  const normalizedType = normalizeString(typeName);
  
  // Vérifier le cache
  if (cache.carTypes.has(normalizedType)) {
    return cache.carTypes.get(normalizedType);
  }
  
  try {
    // Chercher le type existant
    let { data: existingType, error: searchError } = await supabase
      .from('car_types')
      .select('id')
      .eq('name', normalizedType)
      .single();
    
    if (searchError && searchError.code !== 'PGRST116') {
      console.error(`❌ Erreur lors de la recherche du type "${normalizedType}":`, searchError.message);
      return null;
    }
    
    let typeId;
    
    if (existingType) {
      // Type existant
      typeId = existingType.id;
      console.log(`   ✅ Type trouvé: "${normalizedType}" (ID: ${typeId})`);
    } else {
      // Créer le nouveau type
      const { data: newType, error: createError } = await supabase
        .from('car_types')
        .insert({ name: normalizedType })
        .select('id')
        .single();
      
      if (createError) {
        console.error(`❌ Erreur lors de la création du type "${normalizedType}":`, createError.message);
        return null;
      }
      
      typeId = newType.id;
      console.log(`   ➕ Type créé: "${normalizedType}" (ID: ${typeId})`);
    }
    
    // Mettre en cache
    cache.carTypes.set(normalizedType, typeId);
    return typeId;
    
  } catch (error) {
    console.error(`❌ Erreur inattendue pour le type "${normalizedType}":`, error.message);
    return null;
  }
}

/**
 * Récupère ou crée un type de carburant et retourne son ID
 * @param {string} fuelTypeName - Le nom du type de carburant
 * @returns {Promise<number|null>} - L'ID du type de carburant ou null si erreur
 */
async function getOrCreateFuelType(fuelTypeName) {
  if (!fuelTypeName) return null;
  
  const normalizedFuelType = normalizeString(fuelTypeName);
  
  // Vérifier le cache
  if (cache.fuelTypes.has(normalizedFuelType)) {
    return cache.fuelTypes.get(normalizedFuelType);
  }
  
  try {
    // Chercher le type de carburant existant
    let { data: existingFuelType, error: searchError } = await supabase
      .from('fuel_types')
      .select('id')
      .eq('name', normalizedFuelType)
      .single();
    
    if (searchError && searchError.code !== 'PGRST116') {
      console.error(`❌ Erreur lors de la recherche du carburant "${normalizedFuelType}":`, searchError.message);
      return null;
    }
    
    let fuelTypeId;
    
    if (existingFuelType) {
      // Type de carburant existant
      fuelTypeId = existingFuelType.id;
      console.log(`   ✅ Carburant trouvé: "${normalizedFuelType}" (ID: ${fuelTypeId})`);
    } else {
      // Créer le nouveau type de carburant
      const { data: newFuelType, error: createError } = await supabase
        .from('fuel_types')
        .insert({ name: normalizedFuelType })
        .select('id')
        .single();
      
      if (createError) {
        console.error(`❌ Erreur lors de la création du carburant "${normalizedFuelType}":`, createError.message);
        return null;
      }
      
      fuelTypeId = newFuelType.id;
      console.log(`   ➕ Carburant créé: "${normalizedFuelType}" (ID: ${fuelTypeId})`);
    }
    
    // Mettre en cache
    cache.fuelTypes.set(normalizedFuelType, fuelTypeId);
    return fuelTypeId;
    
  } catch (error) {
    console.error(`❌ Erreur inattendue pour le carburant "${normalizedFuelType}":`, error.message);
    return null;
  }
}

/**
 * Met à jour une voiture avec les IDs normalisés
 * @param {Object} car - L'objet voiture avec les données
 * @returns {Promise<boolean>} - true si succès, false sinon
 */
async function updateCar(car) {
  console.log(`\n🔄 Traitement de la voiture ID ${car.id}:`);
  console.log(`   Original - Marque: "${car.brand}", Modèle: "${car.model}", Type: "${car.type}", Carburant: "${car.fuel_type}"`);
  
  // Normaliser les données
  const normalizedBrand = normalizeString(car.brand);
  const normalizedModel = normalizeModel(car.model);
  const normalizedType = normalizeString(car.type);
  const normalizedFuelType = normalizeString(car.fuel_type);
  
  console.log(`   Normalisé - Marque: "${normalizedBrand}", Modèle: "${normalizedModel}", Type: "${normalizedType}", Carburant: "${normalizedFuelType}"`);
  
  // Récupérer ou créer les IDs
  const brandId = await getOrCreateBrand(normalizedBrand);
  const modelId = brandId ? await getOrCreateModel(normalizedModel, brandId) : null;
  const carTypeId = await getOrCreateCarType(normalizedType);
  const fuelTypeId = await getOrCreateFuelType(normalizedFuelType);
  
  // Préparer les données de mise à jour (exclure posted_by_user pour éviter le trigger)
  const updateData = {};
  
  if (brandId) {
    updateData.brand_id = brandId;
  } else {
    console.log(`   ❌ Impossible de récupérer/créer brand_id pour "${normalizedBrand}"`);
  }
  
  if (modelId) {
    updateData.model_id = modelId;
  } else {
    console.log(`   ❌ Impossible de récupérer/créer model_id pour "${normalizedModel}"`);
  }
  
  if (carTypeId) {
    updateData.vehicle_type_id = carTypeId;
  } else {
    console.log(`   ❌ Impossible de récupérer/créer vehicle_type_id pour "${normalizedType}"`);
  }
  
  if (fuelTypeId) {
    updateData.fuel_type_id = fuelTypeId;
  } else {
    console.log(`   ❌ Impossible de récupérer/créer fuel_type_id pour "${normalizedFuelType}"`);
  }
  
  // Mettre à jour la voiture si au moins un ID a été trouvé
  if (Object.keys(updateData).length > 0) {
    try {
      console.log(`   📝 Tentative de mise à jour avec les données:`, updateData);
      console.log(`   ⚠️  Note: posted_by_user n'est pas modifié pour éviter le trigger`);
      
      const { data, error } = await supabase
        .from('cars_v2')
        .update(updateData)
        .eq('id', car.id)
        .select();
      
      if (error) {
        console.error(`   ❌ Erreur lors de la mise à jour: ${error.message}`);
        console.error(`   🔍 Code d'erreur: ${error.code}`);
        console.error(`   📋 Détails: ${error.details || 'Aucun détail'}`);
        console.error(`   💡 Suggestion: ${error.hint || 'Aucune suggestion'}`);
        
        // Si l'erreur mentionne date_post, c'est probablement un trigger
        if (error.message.includes('date_post')) {
          console.error(`   ⚠️  Erreur liée au champ 'date_post' - Le trigger fait référence à une colonne inexistante`);
          console.error(`   💡 Solution: Corriger le trigger pour utiliser 'post_date' au lieu de 'date_post'`);
        }
        
        return false;
      }
      
      console.log(`   ✅ Voiture mise à jour avec succès`);
      return true;
      
    } catch (error) {
      console.error(`   ❌ Erreur inattendue lors de la mise à jour: ${error.message}`);
      console.error(`   🔍 Stack trace: ${error.stack}`);
      return false;
    }
  } else {
    console.log(`   ⚠️  Aucun ID trouvé, voiture non mise à jour`);
    return false;
  }
}

/**
 * Fonction principale pour traiter toutes les voitures
 */
async function updateCarsV2Ids() {
  console.log('🚀 Début de la normalisation et mise à jour des IDs dans cars_v2...\n');
  
  try {
    // Récupérer toutes les voitures
    console.log('📋 Récupération de toutes les voitures...');
    const { data: cars, error } = await supabase
      .from('cars_v2')
      .select('id, brand, model, type, fuel_type')
      .order('id');
    
    if (error) {
      throw new Error(`Erreur lors de la récupération des voitures: ${error.message}`);
    }
    
    console.log(`✅ ${cars.length} voitures trouvées\n`);
    
    // Statistiques
    let updatedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    // Traiter chaque voiture
    for (let i = 0; i < cars.length; i++) {
      const car = cars[i];
      console.log(`\n📊 Progression: ${i + 1}/${cars.length} (${Math.round(((i + 1) / cars.length) * 100)}%)`);
      
      const success = await updateCar(car);
      
      if (success) {
        updatedCount++;
      } else {
        errorCount++;
      }
      
      // Pause courte pour éviter de surcharger la base de données
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Résumé final
    console.log('\n🎉 Traitement terminé !');
    console.log('\n📊 Résumé:');
    console.log(`   ✅ Voitures mises à jour: ${updatedCount}`);
    console.log(`   ❌ Erreurs: ${errorCount}`);
    console.log(`   📋 Total traité: ${cars.length}`);
    
    // Afficher les statistiques du cache
    console.log('\n💾 Statistiques du cache:');
    console.log(`   Marques mises en cache: ${cache.brands.size}`);
    console.log(`   Modèles mis en cache: ${cache.models.size}`);
    console.log(`   Types de véhicules mis en cache: ${cache.carTypes.size}`);
    console.log(`   Types de carburant mis en cache: ${cache.fuelTypes.size}`);
    
  } catch (error) {
    console.error('\n❌ Erreur lors du traitement:', error.message);
    process.exit(1);
  }
}

/**
 * Affiche les statistiques actuelles de la table cars_v2
 */
async function showCurrentStats() {
  console.log('📊 Statistiques actuelles de cars_v2...\n');
  
  try {
    // Compter les voitures avec et sans IDs
    const { data: withIds, error: withIdsError } = await supabase
      .from('cars_v2')
      .select('id')
      .not('brand_id', 'is', null)
      .not('model_id', 'is', null)
      .not('vehicle_type_id', 'is', null)
      .not('fuel_type_id', 'is', null);
    
    const { data: withoutIds, error: withoutIdsError } = await supabase
      .from('cars_v2')
      .select('id')
      .or('brand_id.is.null,model_id.is.null,vehicle_type_id.is.null,fuel_type_id.is.null');
    
    const { count: totalCount, error: totalError } = await supabase
      .from('cars_v2')
      .select('*', { count: 'exact', head: true });
    
    if (withIdsError || withoutIdsError || totalError) {
      throw new Error('Erreur lors de la récupération des statistiques');
    }
    
    console.log(`📈 Total de voitures: ${totalCount}`);
    console.log(`✅ Avec tous les IDs: ${withIds?.length || 0}`);
    console.log(`❌ Sans tous les IDs: ${withoutIds?.length || 0}`);
    
    if (withoutIds && withoutIds.length > 0) {
      console.log('\n🔍 Exemples de voitures sans IDs:');
      const { data: examples } = await supabase
        .from('cars_v2')
        .select('id, brand, model, type, fuel_type, brand_id, model_id, vehicle_type_id, fuel_type_id')
        .or('brand_id.is.null,model_id.is.null,vehicle_type_id.is.null,fuel_type_id.is.null')
        .limit(5);
      
      examples?.forEach(car => {
        console.log(`   ID ${car.id}: ${car.brand} ${car.model} (${car.type}, ${car.fuel_type})`);
        console.log(`      brand_id: ${car.brand_id || 'null'}, model_id: ${car.model_id || 'null'}, vehicle_type_id: ${car.vehicle_type_id || 'null'}, fuel_type_id: ${car.fuel_type_id || 'null'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'affichage des statistiques:', error.message);
  }
}

/**
 * Affiche la liste des exceptions pour les modèles
 */
function showModelExceptions() {
  console.log('📋 Liste des exceptions pour les modèles (conservés en majuscule):\n');
  
  const sortedExceptions = Array.from(MODEL_EXCEPTIONS).sort();
  sortedExceptions.forEach((exception, index) => {
    console.log(`${(index + 1).toString().padStart(3)}. ${exception}`);
  });
  
  console.log(`\nTotal: ${MODEL_EXCEPTIONS.size} exceptions`);
}

/**
 * Diagnostique la structure de la table cars_v2
 */
async function diagnoseTableStructure() {
  console.log('🔍 Diagnostic de la structure de la table cars_v2...\n');
  
  try {
    // Alternative : récupérer une ligne pour voir les colonnes
    const { data: sampleRow, error: sampleError } = await supabase
      .from('cars_v2')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('❌ Erreur lors de la récupération d\'un échantillon:', sampleError.message);
      return;
    }
    
    if (sampleRow && sampleRow.length > 0) {
      console.log('📋 Colonnes détectées dans cars_v2:');
      Object.keys(sampleRow[0]).forEach((column, index) => {
        console.log(`   ${index + 1}. ${column} (${typeof sampleRow[0][column]})`);
      });
    }
    
    // Test de mise à jour simple
    console.log('\n🧪 Test de mise à jour simple...');
    const { data: testCar, error: testCarError } = await supabase
      .from('cars_v2')
      .select('id, brand, model, type, fuel_type')
      .limit(1);
    
    if (testCarError) {
      console.error('❌ Erreur lors de la récupération d\'une voiture de test:', testCarError.message);
      return;
    }
    
    if (testCar && testCar.length > 0) {
      const testUpdate = { brand_id: null }; // Test avec une valeur null
      console.log(`   Test sur la voiture ID ${testCar[0].id}...`);
      
      const { error: testUpdateError } = await supabase
        .from('cars_v2')
        .update(testUpdate)
        .eq('id', testCar[0].id);
      
      if (testUpdateError) {
        console.error('❌ Erreur lors du test de mise à jour:', testUpdateError.message);
        console.error('   Code:', testUpdateError.code);
        console.error('   Détails:', testUpdateError.details);
        console.error('   Suggestion:', testUpdateError.hint);
      } else {
        console.log('✅ Test de mise à jour réussi');
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error.message);
  }
}

/**
 * Fonction principale
 */
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'update':
      await updateCarsV2Ids();
      break;
    case 'stats':
      await showCurrentStats();
      break;
    case 'exceptions':
      showModelExceptions();
      break;
    case 'diagnose':
      await diagnoseTableStructure();
      break;
    default:
      console.log('Usage:');
      console.log('  node scripts/update-cars-v2-ids.js update     - Normaliser et mettre à jour les IDs');
      console.log('  node scripts/update-cars-v2-ids.js stats      - Afficher les statistiques');
      console.log('  node scripts/update-cars-v2-ids.js exceptions - Afficher la liste des exceptions');
      console.log('  node scripts/update-cars-v2-ids.js diagnose   - Diagnostiquer la structure de la table');
      break;
  }
}

main(); 