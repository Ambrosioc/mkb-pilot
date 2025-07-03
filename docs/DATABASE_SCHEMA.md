# Documentation du Schéma de Base de Données - MKB Dashboard

## Vue d'ensemble

Ce document décrit le schéma de base de données du dashboard MKB, un système de gestion de véhicules et d'annonces pour l'équipe Angola.

## Architecture

### Tables de Référence
Ces tables contiennent les données de référence utilisées dans l'application :

#### `brands` - Marques de véhicules
```sql
CREATE TABLE brands (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `models` - Modèles de véhicules
```sql
CREATE TABLE models (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(brand_id, name)
);
```

#### `car_types` - Types de véhicules
```sql
CREATE TABLE car_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `fuel_types` - Types de carburant
```sql
CREATE TABLE fuel_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `dealers` - Concessionnaires
```sql
CREATE TABLE dealers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    address TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `dossier_types` - Types de dossiers
```sql
CREATE TABLE dossier_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tables Métier

#### `cars_v2` - Véhicules (Table principale)
```sql
CREATE TABLE cars_v2 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reference TEXT UNIQUE DEFAULT 'AB' || lpad(nextval('cars_v2_reference_seq'::regclass)::text, 5, '0'),
    brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL,
    model_id INTEGER REFERENCES models(id) ON DELETE SET NULL,
    year INTEGER NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 1),
    first_registration TEXT, -- Format: MM/YYYY
    mileage INTEGER DEFAULT 0 CHECK (mileage >= 0),
    color TEXT,
    car_type_id INTEGER REFERENCES car_types(id) ON DELETE SET NULL,
    fuel_type_id INTEGER REFERENCES fuel_types(id) ON DELETE SET NULL,
    dealer_id INTEGER REFERENCES dealers(id) ON DELETE SET NULL,
    dossier_type_id INTEGER REFERENCES dossier_types(id) ON DELETE SET NULL,
    nb_doors INTEGER DEFAULT 5 CHECK (nb_doors IN (3, 4, 5)),
    nb_seats INTEGER DEFAULT 5 CHECK (nb_seats >= 2 AND nb_seats <= 9),
    gearbox TEXT CHECK (gearbox IN ('Manuelle', 'Automatique', 'Semi-automatique', 'Séquentielle')),
    din_power INTEGER CHECK (din_power >= 0),
    fiscal_power INTEGER CHECK (fiscal_power >= 0),
    price DECIMAL(10,2) DEFAULT 0 CHECK (price >= 0),
    purchase_price DECIMAL(10,2) DEFAULT 0 CHECK (purchase_price >= 0),
    location TEXT DEFAULT 'FR',
    description TEXT,
    status TEXT DEFAULT 'disponible' CHECK (status IN ('disponible', 'vendue', 'en attente', 'annulée', 'prêt à poster')),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    posted_by_user UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `advertisements` - Annonces
```sql
CREATE TABLE advertisements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    car_id UUID REFERENCES cars_v2(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) DEFAULT 0 CHECK (price >= 0),
    photos TEXT[], -- Array of photo URLs/paths
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `post_logs` - Suivi des posts
```sql
CREATE TABLE post_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    car_id UUID REFERENCES cars_v2(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    post_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    platform TEXT, -- Optional: which platform was posted to
    status TEXT DEFAULT 'posted' CHECK (status IN ('posted', 'failed', 'pending'))
);
```

## Fonctionnalités Spéciales

### Génération Automatique des Références
- **Format :** `AB00001`, `AB00002`, etc.
- **Séquence :** `cars_v2_reference_seq` (commence à 1)
- **Trigger :** `generate_car_reference_trigger`

### Mise à Jour Automatique des Timestamps
- **Fonction :** `update_updated_at_column()`
- **Triggers :** Sur toutes les tables pour `updated_at`

### Row Level Security (RLS)
Toutes les tables ont RLS activé avec des politiques appropriées :

#### Politiques pour `cars_v2` :
- **SELECT :** Tous les utilisateurs peuvent voir tous les véhicules
- **INSERT/UPDATE/DELETE :** Seuls les propriétaires peuvent modifier leurs véhicules

#### Politiques pour `advertisements` :
- **SELECT :** Tous les utilisateurs peuvent voir toutes les annonces
- **INSERT/UPDATE/DELETE :** Seuls les propriétaires des véhicules peuvent modifier les annonces

#### Politiques pour les tables de référence :
- **SELECT :** Tous les utilisateurs authentifiés peuvent lire

## Index et Performance

### Index Principaux
```sql
-- Tables de référence
CREATE INDEX idx_brands_name ON brands(name);
CREATE INDEX idx_models_brand_id ON models(brand_id);
CREATE INDEX idx_models_name ON models(name);
CREATE INDEX idx_car_types_name ON car_types(name);
CREATE INDEX idx_fuel_types_name ON fuel_types(name);
CREATE INDEX idx_dealers_name ON dealers(name);
CREATE INDEX idx_dossier_types_name ON dossier_types(name);

-- Table cars_v2
CREATE INDEX idx_cars_v2_brand_id ON cars_v2(brand_id);
CREATE INDEX idx_cars_v2_model_id ON cars_v2(model_id);
CREATE INDEX idx_cars_v2_user_id ON cars_v2(user_id);
CREATE INDEX idx_cars_v2_status ON cars_v2(status);
CREATE INDEX idx_cars_v2_created_at ON cars_v2(created_at);
CREATE INDEX idx_cars_v2_price ON cars_v2(price);
CREATE INDEX idx_cars_v2_purchase_price ON cars_v2(purchase_price);
CREATE INDEX idx_cars_v2_reference ON cars_v2(reference);

-- Table advertisements
CREATE INDEX idx_advertisements_car_id ON advertisements(car_id);
CREATE INDEX idx_advertisements_status ON advertisements(status);
CREATE INDEX idx_advertisements_created_at ON advertisements(created_at);

-- Table post_logs
CREATE INDEX idx_post_logs_car_id ON post_logs(car_id);
CREATE INDEX idx_post_logs_user_id ON post_logs(user_id);
CREATE INDEX idx_post_logs_post_date ON post_logs(post_date);
```

## Contraintes et Validation

### Contraintes CHECK
- **Année :** Entre 1900 et l'année suivante
- **Kilométrage :** >= 0
- **Portes :** 3, 4 ou 5
- **Places :** Entre 2 et 9
- **Boîte de vitesses :** Manuelle, Automatique, Semi-automatique, Séquentielle
- **Prix :** >= 0
- **Statut véhicule :** disponible, vendue, en attente, annulée, prêt à poster
- **Statut annonce :** active, inactive, sold, expired
- **Statut post :** posted, failed, pending

### Contraintes UNIQUE
- **Référence :** Chaque véhicule a une référence unique
- **Marque :** Nom unique
- **Modèle :** Nom unique par marque
- **Types :** Noms uniques pour car_types, fuel_types, dossier_types
- **Concessionnaire :** Nom unique

## Relations

### Diagramme des Relations
```
brands (1) ←→ (N) models
brands (1) ←→ (N) cars_v2
models (1) ←→ (N) cars_v2
car_types (1) ←→ (N) cars_v2
fuel_types (1) ←→ (N) cars_v2
dealers (1) ←→ (N) cars_v2
dossier_types (1) ←→ (N) cars_v2
auth.users (1) ←→ (N) cars_v2
cars_v2 (1) ←→ (N) advertisements
cars_v2 (1) ←→ (N) post_logs
auth.users (1) ←→ (N) post_logs
```

## Migration et Maintenance

### Migrations Principales
1. `20250702234000_complete_cars_v2_and_advertisements_schema.sql` - Schéma complet
2. `20250702235000_cleanup_and_reorganize.sql` - Nettoyage et réorganisation

### Commandes Utiles
```bash
# Reset complet de la base
supabase db reset

# Voir le statut
supabase status

# Générer une nouvelle migration
supabase migration new nom_de_la_migration
```

## Données de Test

### Insertion de Données de Référence
```sql
-- Marques
INSERT INTO brands (name) VALUES 
('Peugeot'), ('Renault'), ('Citroën'), ('Volkswagen'), ('BMW'), ('Mercedes');

-- Types de véhicules
INSERT INTO car_types (name) VALUES 
('Berline'), ('SUV'), ('Break'), ('Citadine'), ('Utilitaire');

-- Types de carburant
INSERT INTO fuel_types (name) VALUES 
('Essence'), ('Diesel'), ('Électrique'), ('Hybride'), ('GPL');

-- Concessionnaires
INSERT INTO dealers (name, address, phone, email) VALUES 
('Concessionnaire Auto', '123 Rue de la Paix', '01 23 45 67 89', 'contact@auto.fr'),
('Garage Central', '456 Avenue des Champs', '01 98 76 54 32', 'info@garage.fr'),
('Auto Plus', '789 Boulevard Central', '01 11 22 33 44', 'contact@autoplus.fr');

-- Types de dossiers
INSERT INTO dossier_types (name, description) VALUES 
('Standard', 'Dossier standard'),
('Premium', 'Dossier premium avec services supplémentaires'),
('VIP', 'Dossier VIP avec services exclusifs');
```

## Sécurité

### Authentification
- Utilise Supabase Auth
- Intégration avec `auth.users`
- Politiques RLS basées sur `auth.uid()`

### Autorisations
- **Lecture :** Tous les utilisateurs authentifiés
- **Écriture :** Seuls les propriétaires des données
- **Suppression :** Seuls les propriétaires des données

## Monitoring et Logs

### Tables de Suivi
- `post_logs` : Suivi des publications d'annonces
- `created_at` / `updated_at` : Timestamps automatiques sur toutes les tables

### Fonctions de Monitoring
```sql
-- Compter les véhicules par statut
SELECT status, COUNT(*) FROM cars_v2 GROUP BY status;

-- Véhicules créés ce mois
SELECT COUNT(*) FROM cars_v2 
WHERE created_at >= date_trunc('month', CURRENT_DATE);

-- Meilleur vendeur du mois
SELECT user_id, COUNT(*) as total_posts 
FROM post_logs 
WHERE post_date >= date_trunc('month', CURRENT_DATE)
GROUP BY user_id 
ORDER BY total_posts DESC 
LIMIT 1;
``` 