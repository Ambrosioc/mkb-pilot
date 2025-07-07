# Documentation des Composants Frontend - MKB Dashboard

## Vue d'ensemble

Cette documentation décrit les composants frontend principaux de l'application MKB Dashboard.

## Architecture

### Technologies Utilisées
- **Framework :** Next.js 14 (App Router)
- **UI Library :** React Hook Form + Zod
- **Styling :** Tailwind CSS + shadcn/ui
- **State Management :** Zustand
- **Animations :** Framer Motion
- **Icons :** Lucide React
- **Notifications :** Sonner

## Structure des Composants

### Layout Components

#### `app/layout.tsx`
Layout principal de l'application avec :
- Providers (Auth, Toast)
- Navigation globale
- Styles globaux

#### `app/dashboard/layout.tsx`
Layout du dashboard avec :
- Sidebar de navigation
- Topbar avec notifications
- Gestion des onglets

### Navigation Components

#### `components/Sidebar.tsx`
Sidebar de navigation avec :
- Menu de navigation dynamique
- Gestion des rôles utilisateur
- Navigation par onglets

#### `components/Topbar.tsx`
Barre supérieure avec :
- Notifications
- Profil utilisateur
- Sélecteur de langue

#### `components/navigation/NavigationConfig.ts`
Configuration de navigation :
- Routes par rôle
- Permissions d'accès
- Structure du menu

### Form Components

#### `components/forms/VehicleAngolaForm.tsx`
Formulaire principal pour les véhicules Angola :
- **Étape 1 :** Informations du véhicule
- **Étape 2 :** Informations de l'annonce
- **Étape 3 :** Upload des photos

**Fonctionnalités :**
- Validation avec Zod
- Upload d'images avec drag & drop
- Génération automatique de référence
- Cache des données

#### `components/forms/ContactDrawer.tsx`
Drawer pour la gestion des contacts :
- Création/édition de contacts
- Gestion des tags
- Historique des interactions

#### `components/forms/DocumentForm.tsx`
Formulaire pour les documents :
- Génération de PDF
- Templates personnalisables
- Preview en temps réel

### UI Components (shadcn/ui)

#### Composants de Base
- `Button` - Boutons avec variants
- `Input` - Champs de saisie
- `Select` - Sélecteurs
- `Card` - Cartes de contenu
- `Dialog` - Modales
- `Drawer` - Tiroirs latéraux
- `Table` - Tableaux de données
- `Form` - Formulaires avec validation

#### Composants Avancés
- `DataTable` - Tableaux avec filtres et pagination
- `TagManager` - Gestionnaire de tags
- `ImageUploader` - Upload d'images
- `NotificationDropdown` - Menu des notifications
- `LanguageSelector` - Sélecteur de langue

### Hooks Personnalisés

#### `hooks/useAuth.ts`
Hook d'authentification :
```typescript
const { user, loading, signIn, signOut, signUp } = useAuth();
```

#### `hooks/useDataFetching.ts`
Hook pour le fetching de données :
```typescript
const { data, loading, error, refetch } = useDataFetching(query);
```

#### `hooks/useNotifications.ts`
Hook pour les notifications :
```typescript
const { notifications, markAsRead, fetchNotifications } = useNotifications();
```

#### `hooks/useTabs.ts`
Hook pour la gestion des onglets :
```typescript
const { activeTab, setActiveTab, tabs } = useTabs();
```

#### `hooks/useVehicleFormData.ts`
Hook pour les données du formulaire véhicule :
```typescript
const { brands, models, vehicleTypes, fuelTypes, dealers, dossierTypes } = useVehicleFormData();
```

### Store (Zustand)

#### `store/useAuth.ts`
Store d'authentification :
```typescript
const { user, setUser, clearUser } = useAuthStore();
```

#### `store/useTabsStore.ts`
Store des onglets :
```typescript
const { tabs, addTab, removeTab, setActiveTab } = useTabsStore();
```

#### `lib/store/vehicleFormStore.ts`
Store du formulaire véhicule :
```typescript
const { 
  currentStep, 
  vehicleId, 
  images, 
  nextStep, 
  addImages, 
  removeImage 
} = useVehicleFormStore();
```

## Pages Principales

### Dashboard
- **Route :** `/dashboard`
- **Composant :** `app/dashboard/page.tsx`
- **Fonctionnalités :** Vue d'ensemble, statistiques, accès rapide

### Pricing Angola
- **Route :** `/dashboard/pricing/angola`
- **Composant :** `app/dashboard/pricing/angola/page.tsx`
- **Fonctionnalités :** Gestion des véhicules Angola, statistiques

### Ajout de Véhicule
- **Route :** `/dashboard/pricing/angola/add`
- **Composant :** `app/dashboard/pricing/angola/add/page.tsx`
- **Fonctionnalités :** Formulaire d'ajout de véhicule

### Profil Utilisateur
- **Route :** `/dashboard/profile`
- **Composant :** `app/dashboard/profile/page.tsx`
- **Fonctionnalités :** Gestion du profil, photo de profil

## Gestion des États

### État Global (Zustand)
```typescript
// Store principal
interface AppState {
  user: User | null;
  tabs: Tab[];
  notifications: Notification[];
  theme: 'light' | 'dark';
}

// Actions
const useAppStore = create<AppState>((set) => ({
  setUser: (user) => set({ user }),
  addTab: (tab) => set((state) => ({ 
    tabs: [...state.tabs, tab] 
  })),
  // ...
}));
```

### État Local (React State)
```typescript
// État local pour les composants
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);
const [error, setError] = useState(null);
```

## Validation des Données

### Schémas Zod
```typescript
// lib/schemas/vehicle-angola.ts
export const vehicleAngolaSchema = z.object({
  brand_id: z.number().min(1, "Marque requise"),
  model_id: z.number().min(1, "Modèle requis"),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  price: z.number().min(0, "Prix doit être positif"),
  // ...
});
```

### Validation des Formulaires
```typescript
const form = useForm<VehicleFormData>({
  resolver: zodResolver(vehicleAngolaSchema),
  defaultValues: {
    brand_id: undefined,
    year: new Date().getFullYear(),
    // ...
  }
});
```

## Gestion des Erreurs

### Toast Notifications
```typescript
import { toast } from 'sonner';

// Succès
toast.success('Opération réussie');

// Erreur
toast.error('Une erreur est survenue');

// Information
toast.info('Information importante');
```

### Gestion des Erreurs API
```typescript
try {
  const result = await apiCall();
  // Traitement du succès
} catch (error) {
  console.error('Erreur:', error);
  toast.error(getErrorMessage(error));
}
```

## Animations

### Framer Motion
```typescript
import { motion } from 'framer-motion';

// Animation d'entrée
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Contenu animé
</motion.div>

// Animation de transition entre pages
<AnimatePresence mode="wait">
  <motion.div
    key={route}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

## Responsive Design

### Breakpoints Tailwind
```typescript
// Mobile First
<div className="w-full md:w-1/2 lg:w-1/3">
  Contenu responsive
</div>

// Grille responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  Éléments en grille
</div>
```

## Performance

### Optimisations
- **Lazy Loading :** Composants chargés à la demande
- **Memoization :** `React.memo`, `useMemo`, `useCallback`
- **Code Splitting :** Pages séparées automatiquement
- **Image Optimization :** Next.js Image component

### Monitoring
```typescript
// Mesure des performances
const startTime = performance.now();
// ... opération
const endTime = performance.now();
console.log(`Temps d'exécution: ${endTime - startTime}ms`);
```

## Tests

### Tests Unitaires
```typescript
// __tests__/components/VehicleForm.test.tsx
import { render, screen } from '@testing-library/react';
import { VehicleAngolaForm } from '../VehicleAngolaForm';

test('affiche le formulaire de véhicule', () => {
  render(<VehicleAngolaForm />);
  expect(screen.getByText('Informations du véhicule')).toBeInTheDocument();
});
```

### Tests d'Intégration
```typescript
// __tests__/pages/pricing.test.tsx
test('charge les données de pricing', async () => {
  render(<PricingPage />);
  await waitFor(() => {
    expect(screen.getByText('Véhicules pricés')).toBeInTheDocument();
  });
});
```

## Déploiement

### Build de Production
```bash
npm run build
npm start
```

### Variables d'Environnement
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
MAILJET_API_KEY=your_mailjet_key
MAILJET_API_SECRET=your_mailjet_secret
```

## Maintenance

### Mise à Jour des Dépendances
```bash
npm update
npm audit fix
```

### Nettoyage du Cache
```bash
npm run clean
rm -rf .next
npm run dev
``` 