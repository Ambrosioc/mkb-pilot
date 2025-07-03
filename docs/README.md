# MKB Dashboard - Documentation Complète

## 🚀 Vue d'ensemble

MKB Dashboard est une application web moderne pour la gestion de véhicules et d'annonces, spécialement conçue pour l'équipe Angola. L'application permet de gérer le pricing des véhicules, créer des annonces, et suivre les performances commerciales.

## 📋 Table des Matières

1. [Installation et Configuration](#installation-et-configuration)
2. [Architecture](#architecture)
3. [Base de Données](#base-de-données)
4. [API Endpoints](#api-endpoints)
5. [Composants Frontend](#composants-frontend)
6. [Fonctionnalités](#fonctionnalités)
7. [Déploiement](#déploiement)
8. [Maintenance](#maintenance)

## 🛠 Installation et Configuration

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Supabase CLI
- Git

### Installation

```bash
# Cloner le repository
git clone <repository-url>
cd mkb-dashboard

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
```

### Variables d'Environnement

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email (Mailjet)
MAILJET_API_KEY=your_mailjet_key
MAILJET_API_SECRET=your_mailjet_secret

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Configuration de la Base de Données

```bash
# Démarrer Supabase localement
supabase start

# Appliquer les migrations
supabase db reset

# Vérifier le statut
supabase status
```

### Démarrage de l'Application

```bash
# Mode développement
npm run dev

# Mode production
npm run build
npm start
```

## 🏗 Architecture

### Stack Technologique

**Frontend :**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion

**Backend :**
- Supabase (PostgreSQL)
- Next.js API Routes
- Row Level Security (RLS)

**État et Validation :**
- Zustand (State Management)
- React Hook Form
- Zod (Validation)

**Autres :**
- Lucide React (Icons)
- Sonner (Notifications)
- React Dropzone (Upload)

### Structure du Projet

```
mkb-dashboard/
├── app/                    # Pages Next.js (App Router)
│   ├── api/               # API Routes
│   ├── dashboard/         # Pages du dashboard
│   ├── login/            # Pages d'authentification
│   └── layout.tsx        # Layout principal
├── components/            # Composants React
│   ├── forms/            # Formulaires
│   ├── ui/               # Composants UI (shadcn/ui)
│   └── navigation/       # Navigation
├── hooks/                # Hooks personnalisés
├── lib/                  # Utilitaires et configuration
├── store/                # Stores Zustand
├── supabase/             # Migrations et configuration Supabase
├── types/                # Types TypeScript
└── docs/                 # Documentation
```

## 🗄 Base de Données

### Tables Principales

**Tables de Référence :**
- `brands` - Marques de véhicules
- `models` - Modèles (liés aux marques)
- `car_types` - Types de véhicules
- `fuel_types` - Types de carburant
- `dealers` - Concessionnaires
- `dossier_types` - Types de dossiers

**Tables Métier :**
- `cars_v2` - Véhicules (table principale)
- `advertisements` - Annonces
- `post_logs` - Suivi des posts

### Fonctionnalités Spéciales

- **Références automatiques :** Format AB00001, AB00002, etc.
- **Row Level Security (RLS) :** Sécurité au niveau des lignes
- **Triggers automatiques :** Mise à jour des timestamps
- **Contraintes de validation :** Intégrité des données

📖 [Documentation complète de la base de données](./DATABASE_SCHEMA.md)

## 🔌 API Endpoints

### Endpoints Principaux

**Authentification :**
- `POST /api/auth/signup` - Créer un compte
- `POST /api/auth/reset-password` - Réinitialiser le mot de passe
- `POST /api/auth/update-password` - Mettre à jour le mot de passe

**Profil :**
- `POST /api/profile/upload-photo` - Upload photo de profil

**Documents :**
- `POST /api/documents/generate` - Générer un PDF
- `GET /api/documents/[id]/pdf` - Télécharger un PDF

**Email :**
- `POST /api/send-email` - Envoyer un email

📖 [Documentation complète des API](./API_ENDPOINTS.md)

## 🎨 Composants Frontend

### Composants Principaux

**Formulaires :**
- `VehicleAngolaForm` - Formulaire principal véhicules
- `ContactDrawer` - Gestion des contacts
- `DocumentForm` - Génération de documents

**Navigation :**
- `Sidebar` - Menu de navigation
- `Topbar` - Barre supérieure
- `NavigationConfig` - Configuration des routes

**UI :**
- Composants shadcn/ui (Button, Input, Card, etc.)
- Composants personnalisés (DataTable, TagManager, etc.)

### Hooks Personnalisés

- `useAuth` - Authentification
- `useDataFetching` - Récupération de données
- `useNotifications` - Notifications
- `useTabs` - Gestion des onglets
- `useVehicleFormData` - Données du formulaire véhicule

📖 [Documentation complète des composants](./FRONTEND_COMPONENTS.md)

## ⚡ Fonctionnalités

### Gestion des Véhicules

**Formulaire en 3 étapes :**
1. **Informations du véhicule :** Marque, modèle, caractéristiques techniques
2. **Informations de l'annonce :** Titre, description, prix
3. **Upload des photos :** Drag & drop, réorganisation, validation

**Fonctionnalités avancées :**
- Génération automatique de références (AB00001)
- Validation en temps réel avec Zod
- Cache des données pour les performances
- Upload d'images avec preview

### Dashboard et Statistiques

**Pricing Angola :**
- Vue d'ensemble des véhicules
- Statistiques de performance
- Filtres et recherche
- Pagination

**Fonctionnalités :**
- Statistiques en temps réel
- Graphiques de performance
- Export de données
- Notifications

### Gestion des Utilisateurs

**Authentification :**
- Inscription/Connexion
- Gestion des rôles
- Profils utilisateurs
- Photos de profil

**Sécurité :**
- Row Level Security (RLS)
- Validation des permissions
- Tokens JWT
- Protection CSRF

## 🚀 Déploiement

### Environnement de Développement

```bash
# Démarrer Supabase
supabase start

# Démarrer l'application
npm run dev
```

### Environnement de Production

```bash
# Build de production
npm run build

# Démarrer en production
npm start
```

### Variables d'Environnement de Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
MAILJET_API_KEY=your_production_mailjet_key
MAILJET_API_SECRET=your_production_mailjet_secret
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🔧 Maintenance

### Commandes Utiles

```bash
# Mise à jour des dépendances
npm update
npm audit fix

# Nettoyage du cache
npm run clean
rm -rf .next

# Reset de la base de données
supabase db reset

# Vérifier le statut Supabase
supabase status

# Générer une nouvelle migration
supabase migration new nom_de_la_migration
```

### Monitoring

**Logs :**
- Logs d'application dans la console
- Logs Supabase dans le dashboard
- Logs d'erreur avec stack traces

**Métriques :**
- Performance des requêtes
- Utilisation du stockage
- Taux d'erreur
- Temps de réponse

### Sauvegarde

```bash
# Sauvegarde de la base de données
supabase db dump

# Restauration
supabase db restore backup.sql
```

## 🐛 Dépannage

### Problèmes Courants

**Erreur de connexion Supabase :**
```bash
# Vérifier les variables d'environnement
supabase status

# Redémarrer Supabase
supabase stop
supabase start
```

**Erreur de migration :**
```bash
# Reset complet
supabase db reset

# Vérifier les logs
supabase logs
```

**Problème de build :**
```bash
# Nettoyer le cache
rm -rf .next node_modules
npm install
npm run build
```

## 📞 Support

### Contact
- **Email :** support@mkb.com
- **Documentation :** [docs.mkb.com](https://docs.mkb.com)
- **Issues :** [GitHub Issues](https://github.com/mkb/dashboard/issues)

### Ressources
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)

---

**Version :** 1.0.0  
**Dernière mise à jour :** Décembre 2024  
**Auteur :** Équipe MKB 