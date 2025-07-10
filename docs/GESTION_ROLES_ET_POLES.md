# Gestion des Rôles et Pôles

## Vue d'ensemble

Cette fonctionnalité permet de gérer de manière complète les rôles et pôles des utilisateurs dans le système MKB Dashboard. Elle offre une interface intuitive pour créer, modifier, supprimer et visualiser les rôles et pôles, ainsi que leurs statistiques d'utilisation.

## Fonctionnalités

### Gestion des Rôles

#### Opérations disponibles
- **Créer un nouveau rôle** : Définir un nom, un niveau (1-5) et une description
- **Modifier un rôle existant** : Changer le nom, le niveau ou la description
- **Supprimer un rôle** : Suppression sécurisée (vérification des utilisateurs affectés)
- **Visualiser les statistiques** : Nombre d'utilisateurs par rôle

#### Niveaux de rôles
- **Niveau 1** : CEO
- **Niveau 2** : G4 (Direction)
- **Niveau 3** : Responsable
- **Niveau 4** : Collaborateur confirmé
- **Niveau 5** : Collaborateur simple

### Gestion des Pôles

#### Opérations disponibles
- **Créer un nouveau pôle** : Définir un nom et une description
- **Modifier un pôle existant** : Changer le nom ou la description
- **Supprimer un pôle** : Suppression sécurisée (vérification des utilisateurs affectés)
- **Visualiser les statistiques** : Nombre total de pôles

## Architecture technique

### Services

#### `roleService.ts`
Service principal pour la gestion des rôles avec les méthodes :
- `fetchRoles()` : Récupérer tous les rôles
- `fetchRoleById(id)` : Récupérer un rôle par ID
- `createRole(data)` : Créer un nouveau rôle
- `updateRole(id, data)` : Mettre à jour un rôle
- `deleteRole(id)` : Supprimer un rôle
- `fetchRoleStats()` : Récupérer les statistiques des rôles
- `checkRoleNameExists(name, excludeId?)` : Vérifier l'unicité du nom

#### `poleService.ts`
Service principal pour la gestion des pôles avec les méthodes :
- `fetchPoles()` : Récupérer tous les pôles
- `fetchPoleById(id)` : Récupérer un pôle par ID
- `assignPoleToUser(userId, poleId)` : Assigner un pôle à un utilisateur
- `removePoleFromUser(userId, poleId)` : Retirer un pôle d'un utilisateur

### Composants React

#### `RoleManager.tsx`
Composant principal pour la gestion des rôles avec :
- Liste des rôles avec actions (éditer/supprimer)
- Dialogue de création de rôle
- Dialogue d'édition de rôle
- Gestion des états de chargement et erreurs

#### `PoleManager.tsx`
Composant principal pour la gestion des pôles avec :
- Liste des pôles avec actions (éditer/supprimer)
- Dialogue de création de pôle
- Dialogue d'édition de pôle
- Gestion des états de chargement et erreurs

### Page principale

#### `roles/page.tsx`
Page principale avec :
- Interface à onglets pour séparer la gestion des rôles et pôles
- Statistiques en temps réel
- Intégration des composants `RoleManager` et `PoleManager`

## Base de données

### Tables utilisées

#### `roles`
```sql
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(255) NOT NULL UNIQUE,
  niveau INTEGER NOT NULL CHECK (niveau >= 1 AND niveau <= 5),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `poles`
```sql
CREATE TABLE poles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `user_roles`
```sql
CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);
```

#### `user_poles`
```sql
CREATE TABLE user_poles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pole_id INTEGER REFERENCES poles(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, pole_id)
);
```

## Sécurité

### Contrôles d'accès
- Vérification des permissions avant suppression
- Protection contre la suppression de rôles/pôles utilisés
- Validation des données côté client et serveur

### Intégrité des données
- Contraintes d'unicité sur les noms
- Contraintes de clés étrangères
- Vérification des dépendances avant suppression

## Utilisation

### Accès à la page
1. Se connecter au dashboard
2. Naviguer vers **Direction > Administration > Rôles**
3. Utiliser les onglets pour basculer entre "Gestion des Rôles" et "Gestion des Pôles"

### Créer un nouveau rôle
1. Cliquer sur "Nouveau Rôle"
2. Remplir le formulaire :
   - Nom du rôle (obligatoire)
   - Niveau (1-5)
   - Description (optionnelle)
3. Cliquer sur "Créer le rôle"

### Créer un nouveau pôle
1. Basculer vers l'onglet "Gestion des Pôles"
2. Cliquer sur "Nouveau Pôle"
3. Remplir le formulaire :
   - Nom du pôle (obligatoire)
   - Description (optionnelle)
4. Cliquer sur "Créer le pôle"

### Modifier un rôle/pôle
1. Cliquer sur l'icône d'édition (crayon) à côté de l'élément
2. Modifier les champs souhaités
3. Cliquer sur "Sauvegarder"

### Supprimer un rôle/pôle
1. Cliquer sur l'icône de suppression (poubelle) à côté de l'élément
2. Confirmer la suppression
3. Le système vérifiera automatiquement s'il peut être supprimé

## Tests

### Script de test
Le fichier `scripts/test-roles-poles-management.js` permet de tester toutes les fonctionnalités :

```bash
node scripts/test-roles-poles-management.js
```

### Tests inclus
- Récupération des rôles et pôles existants
- Création de nouveaux rôles et pôles
- Mise à jour des rôles et pôles
- Suppression sécurisée
- Vérification des noms uniques
- Statistiques d'utilisation

## Maintenance

### Nettoyage
- Les rôles et pôles non utilisés peuvent être supprimés
- Les statistiques sont mises à jour automatiquement
- Les logs d'audit sont conservés dans les tables

### Monitoring
- Surveiller les statistiques d'utilisation
- Vérifier régulièrement les rôles/pôles orphelins
- Maintenir la cohérence des données

## Évolutions futures

### Fonctionnalités prévues
- Historique des modifications de rôles/pôles
- Workflow d'approbation pour les changements
- Permissions granulaires par rôle
- Import/export de configurations
- Templates de rôles prédéfinis

### Améliorations techniques
- Cache des données pour améliorer les performances
- Notifications en temps réel
- API REST complète
- Documentation OpenAPI 