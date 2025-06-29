# Scripts de maintenance

Ce dossier contient les scripts de maintenance pour le projet MKB Dashboard.

## Script de normalisation et mise à jour des IDs cars_v2

### Description
Le script `update-cars-v2-ids.js` permet de normaliser les données textuelles et de mettre à jour les colonnes d'IDs dans la table `cars_v2` en utilisant les données des tables de référence.

### Fonctionnalités principales

#### 🔄 Normalisation des données
- **Marques, types et carburants** : Première lettre en majuscule, reste en minuscule
  - `PEUGEOT` → `Peugeot`
  - `beRLiNe` → `Berline`
  - `ESSENCE` → `Essence`

- **Modèles** : Normalisation avec gestion des exceptions
  - Modèles standards : `208` → `208`
  - Exceptions conservées en majuscule : `GLA`, `CR-V`, `CX-5`, etc.

#### ➕ Création automatique des références
Le script crée automatiquement les entrées manquantes dans les tables de référence :
- `brands` : Création si la marque n'existe pas
- `models` : Création si le modèle n'existe pas pour la marque
- `car_types` : Création si le type n'existe pas
- `fuel_types` : Création si le carburant n'existe pas

#### 💾 Cache intelligent
- Évite les requêtes répétées pour les mêmes données
- Améliore significativement les performances

### Prérequis
1. Variables d'environnement configurées dans `.env.local` :
   - `NEXT_PUBLIC_SUPABASE_URL` : URL de votre projet Supabase
   - `SUPABASE_SERVICE_ROLE_KEY` : Clé de service Supabase (avec permissions d'écriture)

2. Tables de référence existantes :
   - `brands` (avec colonnes `id`, `name`)
   - `models` (avec colonnes `id`, `name`, `brand_id`)
   - `car_types` (avec colonnes `id`, `name`)
   - `fuel_types` (avec colonnes `id`, `name`)

3. Table `cars_v2` avec les colonnes :
   - `id` (clé primaire)
   - `brand` (texte)
   - `model` (texte)
   - `type` (texte)
   - `fuel_type` (texte)
   - `brand_id` (référence vers brands.id)
   - `model_id` (référence vers models.id)
   - `vehicle_type_id` (référence vers car_types.id)
   - `fuel_type_id` (référence vers fuel_types.id)

### Utilisation

#### Normaliser et mettre à jour les IDs
```bash
node scripts/update-cars-v2-ids.js update
```

#### Afficher les statistiques actuelles
```bash
node scripts/update-cars-v2-ids.js stats
```

#### Afficher la liste des exceptions pour les modèles
```bash
node scripts/update-cars-v2-ids.js exceptions
```

### Liste des exceptions pour les modèles

Le script conserve en majuscule les modèles suivants :
- **Mercedes** : GLA, GLB, GLC, GLE, GLS, CLA, CLS, EQA, EQB, EQC, EQE, EQS
- **BMW** : X1, X2, X3, X4, X5, X6, X7, iX, i4, i7, iX1, iX3
- **Audi** : Q3, Q4, Q5, Q7, Q8, A1, A3, A4, A5, A6, A7, A8, e-tron, Q3 Sportback
- **Volkswagen** : ID.3, ID.4, ID.5, ID.7, T-Cross, T-Roc, Tiguan, Touareg
- **Peugeot** : 2008, 3008, 5008, e-2008, e-3008, e-5008
- **Citroën** : C3, C4, C5, e-C4, e-C4 X
- **Renault** : ZOE, Kangoo, Captur, Clio, Megane, Scenic
- **Honda** : CR-V, HR-V, e:Ny1, Civic, Jazz
- **Mazda** : CX-3, CX-30, CX-5, CX-60, MX-30
- **Volvo** : EX30, EX90, XC40, XC60, XC90, C40
- **Tesla** : Model S, Model 3, Model X, Model Y, Cybertruck
- **Autres** : Leaf, Ariya, Ioniq, Kona, Tucson, Santa Fe, Sportage, Sorento, etc.

### Exemple de sortie

```
🚀 Début de la normalisation et mise à jour des IDs dans cars_v2...

📋 Récupération de toutes les voitures...
✅ 150 voitures trouvées

📊 Progression: 1/150 (1%)

🔄 Traitement de la voiture ID 1:
   Original - Marque: "PEUGEOT", Modèle: "208", Type: "beRLiNe", Carburant: "ESSENCE"
   Normalisé - Marque: "Peugeot", Modèle: "208", Type: "Berline", Carburant: "Essence"
   ➕ Marque créée: "Peugeot" (ID: 1)
   ➕ Modèle créé: "208" (ID: 15)
   ✅ Type trouvé: "Berline" (ID: 2)
   ✅ Carburant trouvé: "Essence" (ID: 1)
   ✅ Voiture mise à jour avec succès

🎉 Traitement terminé !

📊 Résumé:
   ✅ Voitures mises à jour: 145
   ❌ Erreurs: 5
   📋 Total traité: 150

💾 Statistiques du cache:
   Marques mises en cache: 12
   Modèles mis en cache: 45
   Types de véhicules mis en cache: 8
   Types de carburant mis en cache: 4
```

### Gestion d'erreurs

#### Gestion gracieuse des données manquantes
- Le script continue le traitement même si certaines correspondances ne sont pas trouvées
- Affichage d'avertissements détaillés pour chaque problème

#### Éviter les doublons
- Vérification de l'existence avant création
- Cache intelligent pour éviter les requêtes répétées

#### Optimisation des performances
- Pause de 200ms entre chaque mise à jour
- Cache en mémoire pour les données fréquemment utilisées

### Notes importantes

1. **Sauvegarde** : Il est recommandé de faire une sauvegarde de la table `cars_v2` avant d'exécuter le script
2. **Permissions** : Le script nécessite des permissions d'écriture sur toutes les tables
3. **Performance** : Pour de grandes tables, le script peut prendre plusieurs minutes
4. **Résilience** : Le script peut être relancé sans problème, il ne modifie que les colonnes d'IDs
5. **Conservation des données** : Les colonnes textuelles (`brand`, `model`, `type`, `fuel_type`) ne sont pas supprimées

### Dépannage

#### Erreur "Variables d'environnement manquantes"
Vérifiez que votre fichier `.env.local` contient :
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### Erreur "Permission denied"
Vérifiez que votre clé de service a les permissions nécessaires pour :
- Lire et écrire sur `cars_v2`
- Lire et écrire sur `brands`, `models`, `car_types`, `fuel_types`

#### Ajouter une nouvelle exception pour un modèle
Modifiez la constante `MODEL_EXCEPTIONS` dans le script pour ajouter de nouveaux modèles à conserver en majuscule. 