# Configuration des Données de Référence - MKB Dashboard

## Vue d'ensemble

Ce document explique le système de données de référence automatique qui s'installe à chaque reset de la base de données.

## Migration Automatique

La migration `20250703030002_add_reference_data.sql` s'exécute automatiquement à chaque `supabase db reset` et ajoute toutes les données de référence nécessaires.

## Données Ajoutées Automatiquement

### 1. Types de Véhicules (10 types)
- **Berline** - Voiture classique 4 portes
- **SUV** - Véhicule utilitaire sport
- **Break** - Berline avec hayon
- **Citadine** - Petite voiture urbaine
- **Utilitaire** - Véhicule commercial
- **Cabriolet** - Voiture décapotable
- **Coupé** - Voiture 2 portes sportive
- **Monospace** - Véhicule familial spacieux
- **Pick-up** - Véhicule utilitaire avec benne
- **4x4** - Véhicule tout-terrain

### 2. Types de Carburant (8 types)
- **Essence** - Carburant classique
- **Diesel** - Carburant diesel
- **Hybride** - Moteur hybride essence/électrique
- **Électrique** - Moteur 100% électrique
- **GPL** - Gaz de pétrole liquéfié
- **Hydrogène** - Pile à combustible
- **Hybride rechargeable** - Hybride avec batterie rechargeable
- **Éthanol** - Carburant bioéthanol

### 3. Types de Dossiers (6 types)
- **DPV** - Dossier de Vente
- **REMA FR** - Remise France
- **REMA ALL** - Remise Allemagne
- **REMA BE** - Remise Belgique
- **STOCK** - Véhicule en stock
- **REPRISE** - Véhicule en reprise

### 4. Marques (50 marques)
Liste complète des marques automobiles européennes et internationales :
- Marques françaises : Peugeot, Renault, Citroën, DS, Dacia
- Marques allemandes : Volkswagen, BMW, Mercedes, Audi, Opel
- Marques italiennes : Fiat, Alfa Romeo, Ferrari, Lamborghini, Maserati
- Marques japonaises : Toyota, Honda, Nissan, Mazda, Mitsubishi
- Marques coréennes : Hyundai, Kia
- Marques américaines : Ford, Chevrolet, Chrysler, Jeep, Dodge
- Marques de luxe : Porsche, Bentley, Rolls-Royce, Aston Martin, McLaren
- Et bien d'autres...

### 5. Modèles (267 modèles)
Chaque marque dispose de ses modèles spécifiques. Exemples :
- **Peugeot** : 208, 308, 408, 508, 2008, 3008, 5008, etc.
- **Renault** : Clio, Captur, Megane, Scenic, Kadjar, etc.
- **BMW** : Série 1-8, X1-X7, i3, i4, i7, iX, etc.
- **Mercedes** : Classe A-S, CLA, CLS, GLA-GLS, EQA-EQS, etc.
- **Volkswagen** : Polo, Golf, Passat, T-Cross, Tiguan, etc.

## Utilisation

### Dans les Formulaires
Les données de référence sont automatiquement disponibles dans :
- Formulaire d'ajout de véhicule
- Formulaire Angola
- Filtres de recherche
- Sélecteurs de type

### Dans l'API
```typescript
// Récupérer les marques
const { data: brands } = await supabase
  .from('brands')
  .select('*')
  .order('name');

// Récupérer les modèles d'une marque
const { data: models } = await supabase
  .from('models')
  .select('*')
  .eq('brand_id', brandId)
  .order('name');

// Récupérer les types de véhicules
const { data: carTypes } = await supabase
  .from('car_types')
  .select('*')
  .order('name');
```

## Scripts de Test

### Tester les Données de Référence
```bash
node scripts/test-reference-data.js
```

### Créer des Véhicules de Test
```bash
node scripts/create-test-vehicles-with-reference.js
```

## Ajout de Nouvelles Données

### Pour Ajouter une Nouvelle Marque
1. Modifier la migration `20250703030002_add_reference_data.sql`
2. Ajouter la marque dans la section `INSERT INTO brands`
3. Ajouter les modèles correspondants dans la section `INSERT INTO models`

### Pour Ajouter un Nouveau Type
1. Modifier la migration appropriée
2. Ajouter le nouveau type dans la section correspondante
3. Faire un `supabase db reset` pour appliquer

## Politiques RLS

Toutes les tables de référence ont des politiques RLS qui permettent :
- **Lecture** : Tous les utilisateurs authentifiés
- **Écriture** : Utilisateurs authentifiés (pour les formulaires)

## Maintenance

### Vérification des Données
Après chaque reset, vérifier que toutes les données sont présentes :
```bash
node scripts/test-reference-data.js
```

### Statistiques Attendues
- **Marques** : 50
- **Modèles** : 267
- **Types de véhicules** : 10
- **Types de carburant** : 8
- **Types de dossiers** : 6

## Avantages

1. **Automatisation** : Plus besoin d'insérer manuellement les données
2. **Cohérence** : Mêmes données sur tous les environnements
3. **Complétude** : Couverture large des marques et modèles
4. **Maintenance** : Facile à mettre à jour via les migrations
5. **Performance** : Données optimisées avec index appropriés

## Notes Importantes

- Les données sont insérées avec `ON CONFLICT DO NOTHING` pour éviter les doublons
- Chaque reset de base réinitialise et réinsère toutes les données
- Les données sont triées alphabétiquement pour une meilleure UX
- Les relations entre marques et modèles sont automatiquement créées 