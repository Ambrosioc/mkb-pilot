# Système de Pôles Métiers et Contrôle d'Accès

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture du système](#architecture-du-système)
3. [Base de données](#base-de-données)
4. [Niveaux d'accès](#niveaux-daccès)
5. [Pôles métiers](#pôles-métiers)
6. [API et fonctions](#api-et-fonctions)
7. [Composants frontend](#composants-frontend)
8. [Hooks React](#hooks-react)
9. [Utilisation](#utilisation)
10. [Exemples pratiques](#exemples-pratiques)
11. [Tests et validation](#tests-et-validation)
12. [Maintenance](#maintenance)

---

## 🎯 Vue d'ensemble

Le système de pôles métiers et de contrôle d'accès permet de gérer les permissions des utilisateurs selon leur rôle et leur affectation à des pôles métiers spécifiques. Chaque utilisateur peut être affecté à plusieurs pôles avec des niveaux d'accès différents.

### Objectifs
- **Sécurité** : Contrôler l'accès aux fonctionnalités selon les rôles
- **Flexibilité** : Permettre des affectations multiples et des niveaux granulaires
- **Auditabilité** : Tracer les accès et les modifications
- **Évolutivité** : Faciliter l'ajout de nouveaux pôles et rôles

---

## 🏗️ Architecture du système

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes    │    │   Database      │
│                 │    │                 │    │                 │
│ • Hooks         │◄──►│ • /api/poles/   │◄──►│ • poles         │
│ • HOCs          │    │ • /api/auth/    │    │ • user_poles    │
│ • Components    │    │                 │    │ • Functions     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Flux d'authentification
1. L'utilisateur se connecte
2. Les permissions sont récupérées via l'API
3. Les composants vérifient les accès
4. L'interface s'adapte selon les permissions

---

## 🗄️ Base de données

### Table `poles`
```sql
CREATE TABLE poles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Pôles par défaut :**
- **Stock** : Gestion du stock et inventaire
- **Commercial** : Gestion commerciale et ventes
- **Pricing** : Gestion des prix et devis
- **Direction** : Direction générale et administration

### Table `user_poles`
```sql
CREATE TABLE user_poles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pole_id UUID REFERENCES poles(id) ON DELETE CASCADE,
  role_level INTEGER NOT NULL CHECK (role_level BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, pole_id)
);
```

### Index et contraintes
```sql
-- Index pour les performances
CREATE INDEX idx_user_poles_user_id ON user_poles(user_id);
CREATE INDEX idx_user_poles_pole_id ON user_poles(pole_id);
CREATE INDEX idx_user_poles_role_level ON user_poles(role_level);

-- Contrainte d'unicité
ALTER TABLE user_poles ADD CONSTRAINT unique_user_pole UNIQUE(user_id, pole_id);
```

---

## 📊 Niveaux d'accès

Le système utilise 5 niveaux d'accès hiérarchiques :

| Niveau | Nom | Permissions | Description |
|--------|-----|-------------|-------------|
| 1 | **Administrateur** | Toutes les permissions | Accès complet, gestion des utilisateurs |
| 2 | **Manager** | Création, modification, suppression | Gestion d'équipe, validation |
| 3 | **Superviseur** | Création, modification, suppression | Supervision, contrôle qualité |
| 4 | **Opérateur** | Création, modification | Opérations quotidiennes |
| 5 | **Lecteur** | Lecture uniquement | Consultation, rapports |

### Matrice des permissions
```
Niveau 1-3 : Gestion complète (CRUD)
Niveau 4   : Écriture (CRU)
Niveau 5   : Lecture uniquement (R)
```

---

## 🏢 Pôles métiers

### Stock
- **Description** : Gestion du stock et inventaire
- **Fonctionnalités** : 
  - Gestion des véhicules
  - Création de devis/factures
  - Suivi des stocks
- **Niveaux requis** :
  - Lecture : 5
  - Écriture : 4
  - Gestion : 3

### Commercial
- **Description** : Gestion commerciale et ventes
- **Fonctionnalités** :
  - Gestion des contacts
  - Suivi des ventes
  - Rapports commerciaux
- **Niveaux requis** :
  - Lecture : 5
  - Écriture : 4
  - Gestion : 3

### Pricing
- **Description** : Gestion des prix et devis
- **Fonctionnalités** :
  - Gestion des prix
  - Création de devis
  - Analyse des prix
- **Niveaux requis** :
  - Lecture : 5
  - Écriture : 4
  - Gestion : 3

### Direction
- **Description** : Direction générale et administration
- **Fonctionnalités** :
  - Administration des utilisateurs
  - Rapports de direction
  - Paramètres système
- **Niveaux requis** :
  - Lecture : 5
  - Écriture : 4
  - Gestion : 3

---

## 🔌 API et fonctions

### Fonctions SQL

#### `check_pole_access(user_id, pole_name, required_level)`
```sql
CREATE OR REPLACE FUNCTION check_pole_access(
  user_id UUID,
  pole_name TEXT,
  required_level INTEGER
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_poles up
    JOIN poles p ON up.pole_id = p.id
    WHERE up.user_id = check_pole_access.user_id
      AND p.name = pole_name
      AND up.role_level <= required_level
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### `get_user_poles(user_id)`
```sql
CREATE OR REPLACE FUNCTION get_user_poles(user_id UUID)
RETURNS TABLE (
  pole_name TEXT,
  role_level INTEGER,
  can_read BOOLEAN,
  can_write BOOLEAN,
  can_manage BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.name,
    up.role_level,
    up.role_level <= 5 as can_read,
    up.role_level <= 4 as can_write,
    up.role_level <= 3 as can_manage
  FROM user_poles up
  JOIN poles p ON up.pole_id = p.id
  WHERE up.user_id = get_user_poles.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Routes API

#### `GET /api/poles/access`
Vérifie l'accès d'un utilisateur à un pôle spécifique.

**Paramètres :**
- `poleName` : Nom du pôle
- `requiredAccess` : Niveau d'accès requis ('read', 'write', 'manage')

**Réponse :**
```json
{
  "hasAccess": true,
  "userLevel": 4,
  "requiredLevel": 5,
  "poleName": "Stock"
}
```

#### `GET /api/poles/user-poles`
Récupère tous les pôles et niveaux d'accès d'un utilisateur.

**Réponse :**
```json
{
  "poles": [
    {
      "poleName": "Stock",
      "roleLevel": 5,
      "canRead": true,
      "canWrite": false,
      "canManage": false
    }
  ]
}
```

---

## 🧩 Composants frontend

### HOC `withPoleAccess`
Composant d'ordre supérieur pour protéger les pages.

```typescript
interface PoleAccessConfig {
  poleName: string;
  requiredAccess: 'read' | 'write' | 'manage';
  redirectTo?: string;
}

const withPoleAccess = <P extends object>(
  Component: React.ComponentType<P>,
  config: PoleAccessConfig
) => {
  return function ProtectedComponent(props: P) {
    const { hasAccess, isLoading } = usePoleAccess(
      config.poleName,
      config.requiredAccess
    );

    if (isLoading) {
      return <LoadingSpinner />;
    }

    if (!hasAccess) {
      return <AccessDenied poleName={config.poleName} />;
    }

    return <Component {...props} />;
  };
};
```

### Composant `AccessDenied`
Affiche un message d'accès refusé.

```typescript
interface AccessDeniedProps {
  poleName: string;
  requiredAccess?: string;
}

export function AccessDenied({ poleName, requiredAccess }: AccessDeniedProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Lock className="h-16 w-16 text-red-500 mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Accès refusé
      </h1>
      <p className="text-gray-600 text-center max-w-md">
        Vous n'avez pas les permissions nécessaires pour accéder au pôle{' '}
        <strong>{poleName}</strong>.
        {requiredAccess && (
          <span> Niveau requis : {requiredAccess}</span>
        )}
      </p>
    </div>
  );
}
```

### Composant `PoleAccessSection`
Protège une section spécifique d'une page.

```typescript
interface PoleAccessSectionProps {
  poleName: string;
  requiredAccess: 'read' | 'write' | 'manage';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PoleAccessSection({
  poleName,
  requiredAccess,
  children,
  fallback
}: PoleAccessSectionProps) {
  const { hasAccess } = usePoleAccess(poleName, requiredAccess);

  if (!hasAccess) {
    return fallback || null;
  }

  return <>{children}</>;
}
```

---

## 🎣 Hooks React

### `usePoleAccess`
Hook principal pour vérifier les accès.

```typescript
interface UsePoleAccessReturn {
  hasAccess: boolean;
  isLoading: boolean;
  error: string | null;
  userLevel: number | null;
  canRead: boolean;
  canWrite: boolean;
  canManage: boolean;
}

export function usePoleAccess(
  poleName: string,
  requiredAccess: 'read' | 'write' | 'manage' = 'read'
): UsePoleAccessReturn {
  const [state, setState] = useState<UsePoleAccessReturn>({
    hasAccess: false,
    isLoading: true,
    error: null,
    userLevel: null,
    canRead: false,
    canWrite: false,
    canManage: false
  });

  useEffect(() => {
    checkAccess();
  }, [poleName, requiredAccess]);

  const checkAccess = async () => {
    try {
      const response = await fetch(`/api/poles/access?poleName=${poleName}&requiredAccess=${requiredAccess}`);
      const data = await response.json();
      
      setState({
        hasAccess: data.hasAccess,
        isLoading: false,
        error: null,
        userLevel: data.userLevel,
        canRead: data.userLevel <= 5,
        canWrite: data.userLevel <= 4,
        canManage: data.userLevel <= 3
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erreur lors de la vérification des permissions'
      }));
    }
  };

  return state;
}
```

### `useUserPoles`
Hook pour récupérer tous les pôles d'un utilisateur.

```typescript
interface UserPole {
  poleName: string;
  roleLevel: number;
  canRead: boolean;
  canWrite: boolean;
  canManage: boolean;
}

interface UseUserPolesReturn {
  poles: UserPole[];
  isLoading: boolean;
  error: string | null;
}

export function useUserPoles(): UseUserPolesReturn {
  const [state, setState] = useState<UseUserPolesReturn>({
    poles: [],
    isLoading: true,
    error: null
  });

  useEffect(() => {
    fetchUserPoles();
  }, []);

  const fetchUserPoles = async () => {
    try {
      const response = await fetch('/api/poles/user-poles');
      const data = await response.json();
      
      setState({
        poles: data.poles,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erreur lors de la récupération des pôles'
      }));
    }
  };

  return state;
}
```

---

## 🚀 Utilisation

### Protection d'une page complète

```typescript
// app/dashboard/stock/page.tsx
import { withPoleAccess } from '@/components/auth/withPoleAccess';

function StockPage() {
  return (
    <div>
      <h1>Gestion du Stock</h1>
      {/* Contenu de la page */}
    </div>
  );
}

export default withPoleAccess(StockPage, {
  poleName: 'Stock',
  requiredAccess: 'read'
});
```

### Protection d'une section

```typescript
import { PoleAccessSection } from '@/components/auth/PoleAccessSection';

function DashboardPage() {
  return (
    <div>
      <h1>Tableau de bord</h1>
      
      {/* Section accessible à tous */}
      <div>Contenu public</div>
      
      {/* Section protégée */}
      <PoleAccessSection poleName="Stock" requiredAccess="write">
        <button>Ajouter un véhicule</button>
      </PoleAccessSection>
      
      {/* Section avec fallback */}
      <PoleAccessSection 
        poleName="Direction" 
        requiredAccess="manage"
        fallback={<p>Accès réservé à la direction</p>}
      >
        <button>Gérer les utilisateurs</button>
      </PoleAccessSection>
    </div>
  );
}
```

### Utilisation du hook

```typescript
import { usePoleAccess } from '@/hooks/usePoleAccess';

function VehicleActions({ vehicleId }: { vehicleId: string }) {
  const { canWrite, canManage } = usePoleAccess('Stock', 'write');

  return (
    <div className="flex gap-2">
      <button>Voir détails</button>
      
      {canWrite && (
        <button>Modifier</button>
      )}
      
      {canManage && (
        <button className="text-red-600">Supprimer</button>
      )}
    </div>
  );
}
```

---

## 💡 Exemples pratiques

### Page Stock avec protections granulaires

```typescript
function StockPage() {
  const { canWrite, canManage } = usePoleAccess('Stock', 'read');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Gestion du Stock</h1>
        
        {canWrite && (
          <button className="btn-primary">
            Ajouter un véhicule
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Statistiques toujours visibles */}
        <StatCard title="Total véhicules" value={totalVehicles} />
        <StatCard title="En vente" value={forSale} />
        <StatCard title="Vendus" value={sold} />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Liste des véhicules</h2>
        </div>
        
        <VehicleTable 
          vehicles={vehicles}
          canEdit={canWrite}
          canDelete={canManage}
        />
      </div>

      {/* Actions en lot - niveau gestion requis */}
      <PoleAccessSection poleName="Stock" requiredAccess="manage">
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Actions en lot</h3>
          <div className="flex gap-2">
            <button>Archiver la sélection</button>
            <button>Exporter en CSV</button>
          </div>
        </div>
      </PoleAccessSection>
    </div>
  );
}
```

### Composant de tableau avec permissions

```typescript
interface VehicleTableProps {
  vehicles: Vehicle[];
  canEdit: boolean;
  canDelete: boolean;
}

function VehicleTable({ vehicles, canEdit, canDelete }: VehicleTableProps) {
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th>Référence</th>
          <th>Marque</th>
          <th>Modèle</th>
          <th>Prix</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {vehicles.map(vehicle => (
          <tr key={vehicle.id}>
            <td>{vehicle.reference}</td>
            <td>{vehicle.brand}</td>
            <td>{vehicle.model}</td>
            <td>{formatPrice(vehicle.price)}</td>
            <td className="flex gap-2">
              <button className="btn-sm">Voir</button>
              
              {canEdit && (
                <button className="btn-sm btn-secondary">
                  Modifier
                </button>
              )}
              
              {canDelete && (
                <button className="btn-sm btn-danger">
                  Supprimer
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## 🧪 Tests et validation

### Scripts de test

#### Test des permissions utilisateur
```bash
node scripts/test-permissions-summary.js
```

#### Test de protection des documents
```bash
node scripts/test-document-protection.js
```

### Validation manuelle

1. **Test avec utilisateur niveau 5 (lecture uniquement)**
   - Connectez-vous avec `a.cazimira@gmail.com`
   - Vérifiez que les boutons de création sont désactivés
   - Confirmez que l'accès aux pages protégées est refusé

2. **Test avec utilisateur niveau 1-3 (gestion complète)**
   - Connectez-vous avec un utilisateur de direction
   - Vérifiez que toutes les fonctionnalités sont accessibles
   - Testez la création, modification et suppression

3. **Test des pôles multiples**
   - Affectez un utilisateur à plusieurs pôles
   - Vérifiez que les permissions sont correctement appliquées
   - Testez les transitions entre pôles

### Matrice de test

| Utilisateur | Stock | Commercial | Pricing | Direction |
|-------------|-------|------------|---------|-----------|
| Niveau 5 | ✅ Lecture | ✅ Lecture | ❌ Accès | ❌ Accès |
| Niveau 4 | ✅ Écriture | ✅ Écriture | ✅ Écriture | ❌ Accès |
| Niveau 3 | ✅ Gestion | ✅ Gestion | ✅ Gestion | ✅ Gestion |

---

## 🔧 Maintenance

### Ajout d'un nouveau pôle

1. **Base de données**
```sql
INSERT INTO poles (name, description) 
VALUES ('NouveauPole', 'Description du nouveau pôle');
```

2. **Frontend**
```typescript
// Ajouter le pôle dans la matrice d'accès
const POLE_ACCESS_MATRIX = {
  // ... pôles existants
  NouveauPole: {
    name: 'NouveauPole',
    description: 'Description du nouveau pôle',
    levels: {
      read: 5,
      write: 4,
      manage: 3
    }
  }
};
```

3. **Protection des pages**
```typescript
export default withPoleAccess(NouvellePage, {
  poleName: 'NouveauPole',
  requiredAccess: 'read'
});
```

### Modification des niveaux d'accès

1. **Mettre à jour les affectations**
```sql
UPDATE user_poles 
SET role_level = 4 
WHERE user_id = 'user-uuid' AND pole_id = 'pole-uuid';
```

2. **Vérifier les impacts**
```bash
node scripts/test-permissions-summary.js
```

### Audit des accès

#### Script d'audit
```bash
node scripts/audit-user-access.js
```

#### Logs d'accès
```sql
-- Table pour tracer les accès (optionnel)
CREATE TABLE access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  pole_name TEXT,
  action TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 📚 Ressources

### Fichiers clés
- `supabase/migrations/` : Migrations de base de données
- `hooks/usePoleAccess.ts` : Hook principal
- `components/auth/withPoleAccess.tsx` : HOC de protection
- `api/poles/` : Routes API
- `scripts/` : Scripts de test et maintenance

### Variables d'environnement
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Dépendances
```json
{
  "@supabase/supabase-js": "^2.x",
  "react": "^18.x",
  "next": "^15.x"
}
```

---

## 🆘 Dépannage

### Problèmes courants

#### 1. Accès refusé inattendu
```bash
# Vérifier les permissions utilisateur
node scripts/test-permissions-summary.js

# Vérifier la base de données
SELECT * FROM user_poles WHERE user_id = 'user-uuid';
```

#### 2. HOC ne fonctionne pas
```typescript
// Vérifier l'import
import { withPoleAccess } from '@/components/auth/withPoleAccess';

// Vérifier la configuration
export default withPoleAccess(Component, {
  poleName: 'Stock', // Nom exact du pôle
  requiredAccess: 'read' // Niveau requis
});
```

#### 3. Hook retourne des valeurs incorrectes
```typescript
// Vérifier les paramètres
const { hasAccess } = usePoleAccess('Stock', 'write');

// Vérifier la réponse API
console.log('API Response:', response);
```

### Logs de débogage

```typescript
// Activer les logs de débogage
const DEBUG_POLE_ACCESS = process.env.NODE_ENV === 'development';

if (DEBUG_POLE_ACCESS) {
  console.log('Pole Access Check:', {
    poleName,
    requiredAccess,
    hasAccess,
    userLevel
  });
}
```

---

## 📝 Changelog

### Version 1.0.0
- ✅ Système de pôles métiers complet
- ✅ 5 niveaux d'accès hiérarchiques
- ✅ HOC et hooks React
- ✅ API routes sécurisées
- ✅ Composants de protection
- ✅ Scripts de test et maintenance
- ✅ Documentation complète

---

## 🤝 Contribution

Pour contribuer au système de pôles et rôles :

1. **Tests** : Ajoutez des tests pour les nouvelles fonctionnalités
2. **Documentation** : Mettez à jour cette documentation
3. **Sécurité** : Vérifiez les implications de sécurité
4. **Performance** : Optimisez les requêtes de base de données

---

*Dernière mise à jour : $(date)* 