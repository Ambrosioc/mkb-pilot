# Gestion des Pôles par Utilisateur

## 🎯 Vue d'ensemble

Cette fonctionnalité permet d'assigner et de gérer les pôles métiers pour chaque utilisateur individuellement. Chaque utilisateur peut être affecté à plusieurs pôles, ce qui détermine ses permissions d'accès aux différentes sections de l'application.

## 🏗️ Architecture

### Base de données

#### Table `user_poles`
```sql
CREATE TABLE user_poles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  pole_id INTEGER REFERENCES poles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, pole_id)
);
```

#### Table `poles`
```sql
CREATE TABLE poles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Pôles disponibles
1. **ACSG** - Gestion administrative, comptable, sociale et générale
2. **Commercial** - Gestion commerciale et relation client
3. **Direction** - Direction générale et administration
4. **Entretien** - Gestion des entretiens et réparations
5. **IT** - Gestion informatique et systèmes
6. **Marketing** - Gestion des campagnes marketing et communication
7. **Pricing** - Gestion du pricing des véhicules
8. **Stock** - Gestion du stock et inventaire
9. **Technique** - Gestion technique et maintenance
10. **Transport** - Gestion des transports et logistique

## 🔧 Fonctionnalités

### 1. Interface de gestion des utilisateurs

#### Page des utilisateurs (`/dashboard/direction/administration/utilisateurs`)
- **Nouvelle colonne "Pôles"** : Affiche les pôles assignés à chaque utilisateur
- **Badges colorés** : Chaque pôle est affiché avec un badge bleu
- **Vue d'ensemble** : Permet de voir rapidement les affectations de tous les utilisateurs

#### Dialogue de détails utilisateur
- **Section "Pôles assignés"** : Interface dédiée à la gestion des pôles
- **Ajout de pôles** : Bouton pour assigner de nouveaux pôles
- **Suppression de pôles** : Bouton pour retirer des pôles
- **Liste des affectations** : Affichage détaillé avec dates d'assignation

### 2. Composants créés

#### `UserPolesManager`
```typescript
interface UserPolesManagerProps {
  user: User;
  onPolesUpdated: () => void;
}
```

**Fonctionnalités :**
- Affichage des pôles assignés à l'utilisateur
- Interface d'ajout de nouveaux pôles
- Suppression d'affectations existantes
- Gestion des états de chargement
- Notifications de succès/erreur

#### `poleService`
```typescript
export const poleService = {
  fetchPoles(): Promise<Pole[]>
  fetchUserPoles(userId: string): Promise<UserPole[]>
  assignPoleToUser(assignData: AssignPoleData): Promise<void>
  removePoleFromUser(userId: string, poleId: number): Promise<void>
  hasPoleAccess(userId: string, poleName: string): Promise<boolean>
  getUserPoleAccess(userId: string, poleName: string)
}
```

### 3. Service direct Supabase

L'assignation et le retrait de pôles se font directement via le service `poleService.ts` qui utilise Supabase.

**Méthodes disponibles :**
- `assignPoleToUser(userId, poleId, adminName)` : Assigner un pôle
- `removePoleFromUser(userId, poleId, adminName)` : Retirer un pôle

**Avantages :**
- Plus simple et direct
- Pas de surcharge API
- Gestion des notifications intégrée

## 🎨 Interface utilisateur

### Page des utilisateurs
```
┌─────────────────────────────────────────────────────────────────┐
│ Utilisateur    │ Rôle           │ Pôles           │ Statut │ Actions │
├─────────────────────────────────────────────────────────────────┤
│ Jean Dupont    │ Manager (N3)   │ [Stock] [IT]    │ Actif  │ [👁️] [✏️] │
│ Marie Martin   │ Collaborateur  │ [Commercial]    │ Actif  │ [👁️] [✏️] │
│ Pierre Durand  │ CEO (N1)       │ [Direction]     │ Actif  │ [👁️] [✏️] │
└─────────────────────────────────────────────────────────────────┘
```

### Dialogue de détails
```
┌─────────────────────────────────────────────────────────────────┐
│ Détails de l'utilisateur                                        │
├─────────────────────────────────────────────────────────────────┤
│ [Avatar] Jean Dupont                                            │
│ jean.dupont@mkb.com                                             │
│ [Actif] [Manager (Niveau 3)]                                    │
├─────────────────────────────────────────────────────────────────┤
│ Pôles assignés (2)                    [Assigner un pôle]        │
├─────────────────────────────────────────────────────────────────┤
│ 🏢 Stock - Gestion du stock et inventaire                       │
│    Assigné le 15/01/2024                    [Accès accordé] [🗑️] │
│                                                                 │
│ 💻 IT - Gestion informatique et systèmes                        │
│    Assigné le 10/01/2024                    [Accès accordé] [🗑️] │
└─────────────────────────────────────────────────────────────────┘
```

## 🔐 Sécurité et permissions

### Contrôle d'accès
- **Authentification requise** : Toutes les opérations nécessitent un token valide
- **Permissions hiérarchiques** : Seuls les managers (niveau 1-3) peuvent gérer les affectations
- **Validation des données** : Vérification des UUID et des relations existantes

### Politiques RLS (Row Level Security)
```sql
-- Politique pour permettre aux utilisateurs de voir leurs affectations
CREATE POLICY "Users can see their pole assignments"
ON user_poles FOR SELECT
USING (auth.uid() = user_id);

-- Politique pour permettre aux managers de gérer les affectations
CREATE POLICY "Managers can manage pole assignments"
ON user_poles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.niveau <= 3
  )
);
```

## 🧪 Tests et validation

### Script de test
```bash
node scripts/test-pole-assignment.js
```

**Fonctionnalités testées :**
- Récupération des pôles disponibles
- Assignation d'un pôle à un utilisateur
- Vérification des affectations
- Test des fonctions RPC
- Gestion des erreurs

### Validation des données
- **Contrainte d'unicité** : Un utilisateur ne peut être affecté qu'une fois à un pôle
- **Cascade delete** : Suppression automatique des affectations si l'utilisateur ou le pôle est supprimé
- **Validation des relations** : Vérification de l'existence des utilisateurs et pôles

## 📊 Utilisation

### 1. Assigner un pôle à un utilisateur
1. Aller sur la page des utilisateurs
2. Cliquer sur l'icône "Voir les détails" (👁️)
3. Dans le dialogue, aller à la section "Pôles assignés"
4. Cliquer sur "Assigner un pôle"
5. Sélectionner le pôle dans la liste déroulante
6. Cliquer sur "Assigner"

### 2. Retirer un pôle d'un utilisateur
1. Dans le dialogue de détails utilisateur
2. Section "Pôles assignés"
3. Cliquer sur l'icône de suppression (🗑️) à côté du pôle
4. Confirmer la suppression

### 3. Voir les affectations
- **Liste générale** : Colonne "Pôles" dans le tableau des utilisateurs
- **Détails** : Section dédiée dans le dialogue de détails utilisateur

## 🔄 Intégration avec le système existant

### Compatibilité
- **Système de rôles** : Les pôles fonctionnent en complément du système de rôles hiérarchiques
- **Permissions** : Les permissions sont calculées en combinant le rôle et les pôles assignés
- **Interface** : Intégration transparente dans l'interface existante

### Migration
- **Données existantes** : Les utilisateurs existants n'ont pas de pôles assignés par défaut
- **Rétrocompatibilité** : Le système fonctionne même sans pôles assignés
- **Progressive enhancement** : Les nouvelles fonctionnalités s'ajoutent sans casser l'existant

## 🚀 Évolutions futures

### Fonctionnalités prévues
- **Affectation en lot** : Assigner plusieurs pôles à plusieurs utilisateurs
- **Templates d'affectation** : Créer des modèles d'affectation réutilisables
- **Historique des changements** : Tracer les modifications d'affectation
- **Notifications** : Informer les utilisateurs des changements d'accès

### Améliorations techniques
- **Cache des permissions** : Optimiser les performances de vérification
- **API GraphQL** : Migration vers GraphQL pour plus de flexibilité
- **Webhooks** : Notifications en temps réel des changements

## 📝 Maintenance

### Scripts utiles
```bash
# Vérifier les affectations
node scripts/test-pole-assignment.js

# Nettoyer les affectations orphelines
node scripts/cleanup-orphaned-assignments.js

# Générer un rapport des affectations
node scripts/generate-pole-report.js
```

### Monitoring
- **Logs d'assignation** : Tracer toutes les opérations d'affectation
- **Métriques d'utilisation** : Suivre l'utilisation des pôles
- **Alertes** : Notifier en cas d'anomalies

---

## ✅ Checklist de déploiement

- [ ] Migration de base de données appliquée
- [ ] Composants frontend déployés
- [ ] Routes API fonctionnelles
- [ ] Tests de validation passés
- [ ] Documentation mise à jour
- [ ] Formation des utilisateurs effectuée
- [ ] Monitoring configuré 