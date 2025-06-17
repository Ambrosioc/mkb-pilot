# 🚀 MKB Pilot Dashboard

Un dashboard d'entreprise modulaire et moderne construit avec Next.js, TypeScript et Supabase. MKB Pilot offre une interface intuitive pour gérer différents pôles d'activité avec des modules spécialisés pour le commercial, la technique, le marketing et plus encore.

## 📋 Sommaire

- [🛠️ Stack Technique](#️-stack-technique)
- [📋 Prérequis](#-prérequis)
- [🚀 Installation](#-installation)
- [🗄️ Configuration Supabase](#️-configuration-supabase)
- [⚙️ Configuration Environnement](#️-configuration-environnement)
- [🏃‍♂️ Démarrage](#️-démarrage)
- [📁 Structure du Projet](#-structure-du-projet)
- [🧪 Test du Module](#-test-du-module)
- [📦 Dépendances Principales](#-dépendances-principales)
- [🧹 Nettoyage](#-nettoyage)
- [🤝 Contribution](#-contribution)

## 🛠️ Stack Technique

| Technologie | Version | Description |
|-------------|---------|-------------|
| **Next.js** | 13.5+ | Framework React avec App Router |
| **TypeScript** | 5.2+ | Typage statique |
| **Tailwind CSS** | 3.3+ | Framework CSS utilitaire |
| **ShadCN UI** | Latest | Composants UI modernes |
| **Framer Motion** | 10.16+ | Animations fluides |
| **Supabase** | 2.38+ | Base de données et authentification |
| **React Hook Form** | 7.53+ | Gestion des formulaires |
| **Zod** | 3.23+ | Validation de schémas |
| **Zustand** | 4.4+ | Gestion d'état globale |

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (version 18.0 ou supérieure)
- **npm** ou **yarn** ou **pnpm**
- **Docker** (pour Supabase local)
- **Git**

```bash
# Vérifier les versions
node --version  # >= 18.0.0
npm --version   # >= 9.0.0
docker --version
```

## 🚀 Installation

### 1. Cloner le repository

```bash
git clone https://github.com/votre-username/mkb-pilot-dashboard.git
cd mkb-pilot-dashboard
```

### 2. Installer les dépendances

```bash
# Avec npm
npm install

# Avec yarn
yarn install

# Avec pnpm
pnpm install
```

## 🗄️ Configuration Supabase

### 1. Initialiser Supabase

```bash
# Installer Supabase CLI (si pas déjà fait)
npm install -g @supabase/cli

# Initialiser Supabase dans le projet
npx supabase init
```

### 2. Démarrer Supabase local

```bash
# Démarrer les services Supabase (Docker requis)
npx supabase start
```

Cette commande va :
- 📦 Télécharger les images Docker nécessaires
- 🚀 Démarrer PostgreSQL, Auth, API, etc.
- 📋 Afficher les URLs et clés d'accès

### 3. Récupérer les informations de connexion

Après `npx supabase start`, notez les informations affichées :

```bash
API URL: http://localhost:54321
GraphQL URL: http://localhost:54321/graphql/v1
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
Inbucket URL: http://localhost:54324
JWT secret: your-jwt-secret
anon key: your-anon-key
service_role key: your-service-role-key
```

## ⚙️ Configuration Environnement

### 1. Créer le fichier `.env.local`

```bash
# Copier le template d'environnement
cp .env.example .env.local
```

### 2. Configurer les variables Supabase

Éditez `.env.local` avec les valeurs de votre instance Supabase locale :

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optionnel : pour les opérations admin
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## 🏃‍♂️ Démarrage

### 1. Lancer le serveur de développement

```bash
# Avec npm
npm run dev

# Avec yarn
yarn dev

# Avec pnpm
pnpm dev
```

### 2. Accéder à l'application

- 🌐 **Application** : [http://localhost:3000](http://localhost:3000)
- 🗄️ **Supabase Studio** : [http://localhost:54323](http://localhost:54323)

### 3. Connexion par défaut

```
Email: a.cazimira@gmail.com
Mot de passe: U4d5s*pg7Gtr.YA
```

## 📁 Structure du Projet

```
mkb-pilot-dashboard/
├── 📁 app/                          # App Router Next.js
│   ├── 📁 dashboard/                # Pages du dashboard
│   │   ├── 📁 pricing/              # Module Pricing
│   │   │   └── 📁 angola/           # Sous-module Angola
│   │   ├── 📁 commercial/           # Module Commercial
│   │   ├── 📁 technique/            # Module Technique
│   │   └── 📁 marketing/            # Module Marketing
│   ├── 📁 login/                    # Page de connexion
│   └── layout.tsx                   # Layout principal
├── 📁 components/                   # Composants réutilisables
│   ├── 📁 ui/                       # Composants ShadCN UI
│   ├── 📁 forms/                    # Formulaires spécialisés
│   ├── Sidebar.tsx                  # Navigation latérale
│   └── Topbar.tsx                   # Barre de navigation
├── 📁 lib/                          # Utilitaires et configuration
│   ├── 📁 schemas/                  # Schémas Zod
│   ├── supabase.ts                  # Client Supabase
│   └── utils.ts                     # Fonctions utilitaires
├── 📁 store/                        # Stores Zustand
│   ├── useAuth.ts                   # Authentification
│   └── useTabsStore.ts              # Gestion des onglets
├── 📁 supabase/                     # Configuration Supabase
│   ├── 📁 migrations/               # Migrations SQL
│   └── config.toml                  # Configuration locale
└── 📄 README.md                     # Documentation
```

## 🧪 Test du Module

### Module Pricing Angola

Pour tester le module d'ajout de véhicule :

1. 🔐 **Connectez-vous** à l'application
2. 🧭 **Naviguez** vers `Dashboard > Pricing > Angola`
3. ➕ **Cliquez** sur "Ajouter un véhicule"
4. 📝 **Remplissez** le formulaire avec :
   - Informations du véhicule (marque, modèle, année...)
   - Détails de l'annonce (titre, description, prix...)
   - Photos (optionnel)
5. 💾 **Sauvegardez** et vérifiez la création

```bash
# URL directe pour tester
http://localhost:3000/dashboard/pricing/angola
```

## 📦 Dépendances Principales

### 🎨 Interface & Design

```bash
npm install @radix-ui/react-* tailwindcss-animate class-variance-authority
npm install framer-motion lucide-react
```

### 📝 Formulaires & Validation

```bash
npm install react-hook-form @hookform/resolvers zod
```

### 🗄️ Base de données & Auth

```bash
npm install @supabase/supabase-js
```

### 🔄 État Global

```bash
npm install zustand
```

### 🎯 Utilitaires

```bash
npm install clsx tailwind-merge date-fns
npm install sonner  # Pour les notifications toast
```

### 🛠️ Développement

```bash
npm install -D @types/node @types/react @types/react-dom
npm install -D eslint eslint-config-next
npm install -D autoprefixer postcss tailwindcss
```

## 🧹 Nettoyage

### Arrêter Supabase

```bash
# Arrêter tous les services Supabase
npx supabase stop
```

### Reset complet de la base de données

```bash
# Arrêter et supprimer les données
npx supabase stop --no-backup

# Redémarrer avec une DB propre
npx supabase start
```

### Nettoyage du projet

```bash
# Supprimer node_modules et reinstaller
rm -rf node_modules package-lock.json
npm install

# Nettoyer le cache Next.js
npm run build
rm -rf .next
```

## 🤝 Contribution

### Workflow de développement

1. 🌿 **Créer une branche** : `git checkout -b feature/nouvelle-fonctionnalite`
2. 💻 **Développer** avec les standards du projet
3. ✅ **Tester** : `npm run build` et `npm run lint`
4. 📤 **Commit** : Messages clairs et descriptifs
5. 🔄 **Pull Request** : Description détaillée des changements

### Standards de code

- 📏 **ESLint** : Respect des règles configurées
- 🎨 **Prettier** : Formatage automatique
- 📝 **TypeScript** : Typage strict
- 🧪 **Tests** : Couverture des nouvelles fonctionnalités

---

<div align="center">

**MKB Pilot Dashboard** - Propulsé par [acdinnovservices](https://acdinnovservices.com)
</div>