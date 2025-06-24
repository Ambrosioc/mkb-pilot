# MKB Pilot Dashboard

Dashboard professionnel MKB Pilot - Application web moderne et performante pour la gestion d'entreprise.

## 🚀 Fonctionnalités

- **Interface moderne** : Design responsive avec Tailwind CSS et Radix UI
- **Gestion des onglets** : Navigation multi-onglets avec persistance
- **Authentification** : Système d'auth sécurisé avec Supabase
- **Modules spécialisés** : Pôles Direction, Commercial, Transport, etc.
- **Gestion des contacts** : Carnet d'adresses unifié
- **Gestion du stock** : Suivi des véhicules et inventaire
- **Tableaux de bord** : Métriques et KPIs en temps réel
- **Notifications** : Système de notifications en temps réel
- **Thèmes** : Support des thèmes clair/sombre
- **Internationalisation** : Support multi-langues

## 🏗️ Architecture

### Structure du projet

```
mkb-dashboard/
├── app/                    # Pages Next.js 14 (App Router)
│   ├── dashboard/         # Pages du dashboard
│   ├── login/            # Pages d'authentification
│   └── layout.tsx        # Layout principal
├── components/           # Composants React
│   ├── ui/              # Composants UI de base
│   ├── providers/       # Providers React
│   └── navigation/      # Composants de navigation
├── hooks/               # Hooks personnalisés
├── lib/                 # Utilitaires et configuration
├── store/               # Stores Zustand
├── types/               # Types TypeScript
└── supabase/            # Migrations et configuration DB
```

### Technologies utilisées

- **Framework** : Next.js 14 avec App Router
- **Langage** : TypeScript 5.2+
- **Styling** : Tailwind CSS 3.3+
- **UI Components** : Radix UI + shadcn/ui
- **State Management** : Zustand 4.4+
- **Database** : Supabase (PostgreSQL)
- **Authentication** : Supabase Auth
- **Animations** : Framer Motion
- **Charts** : Recharts
- **Forms** : React Hook Form + Zod

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte Supabase

### Installation

1. **Cloner le repository**
   ```bash
   git clone <repository-url>
   cd mkb-dashboard
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration Supabase**
   - Créer un projet Supabase
   - Copier les variables d'environnement :
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

5. **Ouvrir l'application**
   ```
   http://localhost:3000
   ```

## 📦 Scripts disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Serveur de production
npm run lint         # Vérification ESLint
npm run type-check   # Vérification TypeScript
npm run analyze      # Analyse du bundle
```

## 🏗️ Architecture technique

### Hooks personnalisés

- `useAuth()` : Gestion de l'authentification
- `useTabs()` : Gestion des onglets
- `useNotifications()` : Gestion des notifications

### Stores Zustand

- `useAuthStore` : État d'authentification
- `useTabsStore` : État des onglets

### Types TypeScript

Tous les types sont centralisés dans `/types/index.ts` :
- `User`, `Contact`, `Vehicle`
- `Tab`, `MenuItem`, `Notification`
- `Permission`, `Role`, `Log`
- Et bien d'autres...

### Configuration

- `/lib/constants.ts` : Constantes de l'application
- `/lib/supabase.ts` : Configuration Supabase
- `/lib/utils.ts` : Utilitaires généraux

## 🎨 Design System

### Couleurs principales

```css
--mkb-blue: #2bbbdc
--mkb-yellow: #f59e0b
--success: #10b981
--warning: #f59e0b
--error: #ef4444
```

### Composants UI

Tous les composants suivent les principes de design de shadcn/ui :
- Accessibilité (ARIA)
- Responsive design
- Thèmes clair/sombre
- Animations fluides

## 🔧 Optimisations de performance

### Next.js 14

- **App Router** : Routage optimisé
- **Server Components** : Rendu côté serveur
- **Streaming** : Chargement progressif
- **Image Optimization** : Optimisation automatique

### Bundle Optimization

- **Tree Shaking** : Élimination du code inutilisé
- **Code Splitting** : Division automatique du bundle
- **Dynamic Imports** : Chargement à la demande
- **Bundle Analyzer** : Analyse des performances

### React Optimizations

- **React.memo()** : Mémorisation des composants
- **useMemo/useCallback** : Optimisation des calculs
- **Lazy Loading** : Chargement différé
- **Virtual Scrolling** : Pour les grandes listes

## 🔒 Sécurité

### Authentification

- **Supabase Auth** : Authentification sécurisée
- **JWT Tokens** : Gestion des sessions
- **Role-based Access** : Contrôle d'accès
- **Session Management** : Gestion des sessions

### Validation

- **Zod** : Validation des schémas
- **TypeScript** : Vérification des types
- **Input Sanitization** : Nettoyage des entrées
- **CSRF Protection** : Protection CSRF

## 📊 Monitoring et Analytics

### Performance

- **Core Web Vitals** : Métriques de performance
- **Bundle Size** : Taille du bundle
- **Loading Times** : Temps de chargement
- **Error Tracking** : Suivi des erreurs

### Analytics

- **User Behavior** : Comportement utilisateur
- **Feature Usage** : Utilisation des fonctionnalités
- **Error Rates** : Taux d'erreur
- **Performance Metrics** : Métriques de performance

## 🚀 Déploiement

### Vercel (Recommandé)

1. **Connecter le repository**
2. **Configurer les variables d'environnement**
3. **Déployer automatiquement**

### Autres plateformes

- **Netlify** : Support complet
- **Railway** : Déploiement simple
- **Docker** : Containerisation possible

## 🤝 Contribution

### Guidelines

1. **Fork** le repository
2. **Créer** une branche feature
3. **Commit** vos changements
4. **Push** vers la branche
5. **Créer** une Pull Request

### Standards de code

- **TypeScript** : Typage strict
- **ESLint** : Linting automatique
- **Prettier** : Formatage automatique
- **Conventional Commits** : Messages de commit

## 📝 Changelog

### v1.0.0 (2024-01-XX)

#### ✨ Nouvelles fonctionnalités
- Refactorisation complète de l'architecture
- Mise à jour vers Next.js 14
- Système de types TypeScript centralisé
- Hooks personnalisés pour la logique métier
- Optimisations de performance majeures

#### 🔧 Améliorations
- Meilleure séparation des responsabilités
- Code plus maintenable et lisible
- Performance améliorée avec React.memo
- Configuration centralisée
- Documentation complète

#### 🐛 Corrections
- Correction des erreurs TypeScript
- Amélioration de la gestion d'état
- Optimisation du bundle
- Correction des fuites mémoire

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- **Issues** : Créer une issue sur GitHub
- **Documentation** : Consulter la documentation
- **Email** : contact@mkbpilot.com

---

**MKB Pilot Dashboard** - Propulsé par Next.js 14 et Supabase