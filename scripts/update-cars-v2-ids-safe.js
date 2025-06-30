// Script sécurisé pour normaliser et mettre à jour les IDs dans cars_v2
// Usage: node scripts/update-cars-v2-ids-safe.js

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
 */
function normalizeString(str) {
  if (!str || typeof str !== 'string') return str;
  
  const trimmed = str.trim();
  if (!trimmed) return str;
  
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

/**
 * Normalise un nom de modèle en respectant les exceptions
 */
function normalizeModel(model) {
  if (!model || typeof model !== 'string') return model;
  
  const trimmed = model.trim();
  if (!trimmed) return model;
  
  if (MODEL_EXCEPTIONS.has(trimmed.toUpperCase())) {
    return trimmed.toUpperCase();
  }
  
  return normalizeString(trimmed);
}

/**
 * Récupère ou crée une marque et retourne son ID
 */
async function getOrCreateBrand(brandName) {
  if (!brandName) return null;
  
  const normalizedBrand = normalizeString(brandName);
  
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
    
    cache.brands.set(normalizedBrand, brandId);
    return brandId;
    
  } catch (error) {
    console.error(`❌ Erreur inattendue pour la marque "${normalizedBrand}":`, error.message);
    return null;
  }
}

/**
 * Récupère ou crée un modèle et retourne son ID
 */
async function getOrCreateModel(modelName, brandId) {
  if (!modelName || !brandId) return null;
  
  const normalizedModel = normalizeModel(modelName);
  const cacheKey = `${brandId}-${normalizedModel}`;
  
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
    
    cache.models.set(cacheKey, modelId);
    return modelId;
    
  } catch (error) {
    console.error(`❌ Erreur inattendue pour le modèle "${normalizedModel}":`, error.message);
    return null;
  }
}

/**
 * Récupère ou crée un type de véhicule et retourne son ID
 */
async function getOrCreateCarType(typeName) {
  if (!typeName) return null;
  
  const normalizedType = normalizeString(typeName);
  
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
    
    cache.carTypes.set(normalizedType, typeId);
    return typeId;
    
  } catch (error) {
    console.error(`❌ Erreur inattendue pour le type "${normalizedType}":`, error.message);
    return null;
  }
}

/**
 * Récupère ou crée un type de carburant et retourne son ID
 */
async function getOrCreateFuelType(fuelTypeName) {
  if (!fuelTypeName) return null;
  
  const normalizedFuelType = normalizeString(fuelTypeName);
  
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
    
    cache.fuelTypes.set(normalizedFuelType, fuelTypeId);
    return fuelTypeId;
    
  } catch (error) {
    console.error(`❌ Erreur inattendue pour le carburant "${normalizedFuelType}":`, error.message);
    return null;
  }
}

/**
 * Met à jour une voiture avec les IDs normalisés (version sécurisée)
 */
async function updateCarSafe(car) {
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
  
  // Mettre à jour chaque champ individuellement pour éviter les problèmes de triggers
  let successCount = 0;
  
  if (brandId !== null) {
    try {
      const { error } = await supabase
        .from('cars_v2')
        .update({ brand_id: brandId })
        .eq('id', car.id);
      
      if (error) {
        console.error(`   ❌ Erreur mise à jour brand_id: ${error.message}`);
      } else {
        console.log(`   ✅ brand_id mis à jour: ${brandId}`);
        successCount++;
      }
    } catch (error) {
      console.error(`   ❌ Erreur inattendue brand_id: ${error.message}`);
    }
  }
  
  if (modelId !== null) {
    try {
      const { error } = await supabase
        .from('cars_v2')
        .update({ model_id: modelId })
        .eq('id', car.id);
      
      if (error) {
        console.error(`   ❌ Erreur mise à jour model_id: ${error.message}`);
      } else {
        console.log(`   ✅ model_id mis à jour: ${modelId}`);
        successCount++;
      }
    } catch (error) {
      console.error(`   ❌ Erreur inattendue model_id: ${error.message}`);
    }
  }
  
  if (carTypeId !== null) {
    try {
      const { error } = await supabase
        .from('cars_v2')
        .update({ vehicle_type_id: carTypeId })
        .eq('id', car.id);
      
      if (error) {
        console.error(`   ❌ Erreur mise à jour vehicle_type_id: ${error.message}`);
      } else {
        console.log(`   ✅ vehicle_type_id mis à jour: ${carTypeId}`);
        successCount++;
      }
    } catch (error) {
      console.error(`   ❌ Erreur inattendue vehicle_type_id: ${error.message}`);
    }
  }
  
  if (fuelTypeId !== null) {
    try {
      const { error } = await supabase
        .from('cars_v2')
        .update({ fuel_type_id: fuelTypeId })
        .eq('id', car.id);
      
      if (error) {
        console.error(`   ❌ Erreur mise à jour fuel_type_id: ${error.message}`);
      } else {
        console.log(`   ✅ fuel_type_id mis à jour: ${fuelTypeId}`);
        successCount++;
      }
    } catch (error) {
      console.error(`   ❌ Erreur inattendue fuel_type_id: ${error.message}`);
    }
  }
  
  if (successCount > 0) {
    console.log(`   ✅ ${successCount} champ(s) mis à jour avec succès`);
    return true;
  } else {
    console.log(`   ⚠️  Aucun champ mis à jour`);
    return false;
  }
}

/**
 * Fonction principale pour traiter toutes les voitures (version sécurisée)
 */
async function updateCarsV2IdsSafe() {
  console.log('🚀 Début de la normalisation et mise à jour des IDs dans cars_v2 (version sécurisée)...\n');
  
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
    
    // Traiter chaque voiture
    for (let i = 0; i < cars.length; i++) {
      const car = cars[i];
      console.log(`\n📊 Progression: ${i + 1}/${cars.length} (${Math.round(((i + 1) / cars.length) * 100)}%)`);
      
      const success = await updateCarSafe(car);
      
      if (success) {
        updatedCount++;
      } else {
        errorCount++;
      }
      
      // Pause plus longue pour éviter les problèmes de triggers
      await new Promise(resolve => setTimeout(resolve, 500));
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
 * Fonction principale
 */
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'update':
      await updateCarsV2IdsSafe();
      break;
    default:
      console.log('Usage:');
      console.log('  node scripts/update-cars-v2-ids-safe.js update  - Normaliser et mettre à jour les IDs (version sécurisée)');
      break;
  }
}

main(); 