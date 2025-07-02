# Fonctionnalité d'Upload de Photos de Profil

## Vue d'ensemble

Cette fonctionnalité permet aux utilisateurs d'uploader, gérer et afficher leur photo de profil dans l'application MKB Dashboard. Le système garantit qu'un seul utilisateur ne peut avoir qu'une seule photo de profil à la fois.

## Architecture

### Composants impliqués

1. **`ProfilePhotoUploader.tsx`** - Composant React pour l'interface d'upload
2. **`/api/profile/upload-photo/route.ts`** - API route pour gérer l'upload
3. **`page.tsx`** - Page de profil utilisateur
4. **Bucket Supabase Storage `profile`** - Stockage des fichiers

### Flux de données

```
Utilisateur → ProfilePhotoUploader → API Route → Supabase Storage + Database
```

## Configuration Supabase

### Bucket Storage

Le bucket `profile` doit être créé manuellement dans Supabase Studio :

1. Aller dans **Storage** > **Buckets**
2. Cliquer sur **New bucket**
3. Nommer le bucket : `profile`
4. Cocher **Public bucket** pour permettre l'accès public aux photos

### Politiques RLS (Row Level Security)

Les politiques suivantes doivent être configurées sur le bucket `profile` :

#### 1. SELECT - Accès public en lecture
```sql
-- Politique : Public read access to profile photos
-- Permet à tous les utilisateurs de voir les photos de profil
CREATE POLICY "Public read access to profile photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'profile');
```

#### 2. INSERT - Upload de photos
```sql
-- Politique : Users can upload their own profile photos
-- Permet aux utilisateurs d'uploader dans leur dossier personnel
CREATE POLICY "Users can upload their own profile photos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'profile' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
```

#### 3. UPDATE - Mise à jour de photos
```sql
-- Politique : Users can update their own profile photos
-- Permet aux utilisateurs de mettre à jour leurs photos
CREATE POLICY "Users can update their own profile photos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'profile' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
```

#### 4. DELETE - Suppression de photos
```sql
-- Politique : Users can delete their own profile photos
-- Permet aux utilisateurs de supprimer leurs photos
CREATE POLICY "Users can delete their own profile photos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'profile' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
```

### Politiques sur la table `users`

Les politiques RLS suivantes sont nécessaires sur la table `users` :

```sql
-- Permet aux utilisateurs de lire leur propre profil
CREATE POLICY "Users can read their own profile" ON users
    FOR SELECT USING (auth.uid() = auth_user_id);

-- Permet aux utilisateurs de mettre à jour leur propre profil
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = auth_user_id);
```

## Structure des données

### Table `users`
- `photo_url` : Chemin du fichier dans le bucket (ex: `user-id/profile-1234567890.jpg`)

### Bucket `profile`
- Structure : `{user-id}/{filename}`
- Exemple : `bf0414b2-5bef-4364-8a9f-ff053acc2920/profile-1751500214786.jpg`

## Fonctionnalités

### 1. Upload de photo
- **Formats supportés** : JPG, PNG, WEBP
- **Taille maximale** : 5MB
- **Interface** : Drag & drop ou sélection de fichier
- **Prévisualisation** : Affichage immédiat avant confirmation

### 2. Gestion automatique
- **Suppression automatique** : L'ancienne photo est supprimée avant l'upload de la nouvelle
- **Nommage unique** : Chaque fichier a un timestamp unique
- **Organisation** : Chaque utilisateur a son propre dossier

### 3. Sécurité
- **Authentification requise** : Seuls les utilisateurs connectés peuvent uploader
- **Isolation** : Chaque utilisateur ne peut accéder qu'à ses propres fichiers
- **Validation** : Vérification des types de fichiers et de la taille

## API Endpoints

### POST `/api/profile/upload-photo`

Upload une nouvelle photo de profil.

**Paramètres :**
- `file` : Fichier image (FormData)
- `userId` : ID de l'utilisateur (auth_user_id)

**Réponse :**
```json
{
  "success": true,
  "filePath": "user-id/profile-1234567890.jpg",
  "publicUrl": "http://127.0.0.1:54321/storage/v1/object/public/profile/user-id/profile-1234567890.jpg",
  "user": {
    "id": "user-id",
    "auth_user_id": "user-id",
    "prenom": "Prénom",
    "nom": "Nom",
    "email": "email@example.com",
    "photo_url": "user-id/profile-1234567890.jpg"
  }
}
```

## Utilisation

### Dans un composant React

```tsx
import { ProfilePhotoUploader } from '@/components/ui/ProfilePhotoUploader';

function ProfilePage() {
  const handlePhotoUploaded = (photoUrl: string) => {
    // Mettre à jour l'interface après l'upload
    console.log('Nouvelle photo:', photoUrl);
  };

  return (
    <ProfilePhotoUploader
      userId="user-auth-id"
      currentPhotoUrl="http://..."
      onPhotoUploaded={handlePhotoUploaded}
      size="lg"
    />
  );
}
```

### Génération d'URL publique

```tsx
import { supabase } from '@/lib/supabase';

const getPublicUrl = (filePath: string | null) => {
  if (!filePath) return null;
  const { data: urlData } = supabase.storage
    .from('profile')
    .getPublicUrl(filePath);
  return urlData.publicUrl;
};
```

## Gestion des erreurs

### Erreurs courantes

1. **"Bucket not found"** : Le bucket `profile` n'existe pas
2. **"Unauthorized"** : Les politiques RLS ne sont pas configurées
3. **"File too large"** : Le fichier dépasse 5MB
4. **"Invalid file type"** : Format de fichier non supporté

### Solutions

1. **Créer le bucket** dans Supabase Studio
2. **Configurer les politiques RLS** selon la documentation ci-dessus
3. **Vérifier la taille** du fichier avant upload
4. **Utiliser les formats supportés** : JPG, PNG, WEBP

## Maintenance

### Nettoyage des fichiers orphelins

Les anciennes photos sont automatiquement supprimées lors de l'upload d'une nouvelle photo. Cependant, en cas de problème, un script de nettoyage peut être exécuté :

```sql
-- Supprimer les fichiers orphelins (à exécuter avec précaution)
DELETE FROM storage.objects 
WHERE bucket_id = 'profile' 
AND name NOT IN (
  SELECT photo_url FROM users 
  WHERE photo_url IS NOT NULL
);
```

### Monitoring

- **Logs** : Vérifier les logs de l'API route pour les erreurs
- **Stockage** : Surveiller l'utilisation du bucket `profile`
- **Performance** : Optimiser la taille des images si nécessaire

## Déploiement

### Variables d'environnement requises

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Étapes de déploiement

1. **Créer le bucket** `profile` dans Supabase
2. **Configurer les politiques RLS** sur le bucket et la table `users`
3. **Déployer l'application** avec les variables d'environnement
4. **Tester l'upload** avec un utilisateur de test

## Sécurité

### Bonnes pratiques

1. **Validation côté serveur** : Toujours valider les fichiers dans l'API route
2. **Limitation de taille** : Imposer une taille maximale pour éviter les abus
3. **Types de fichiers** : Restreindre aux formats d'image sécurisés
4. **Authentification** : Vérifier l'authentification de l'utilisateur
5. **Isolation** : Chaque utilisateur ne peut accéder qu'à ses propres fichiers

### Audit

- **Logs d'accès** : Surveiller les accès aux fichiers
- **Tentatives d'upload** : Logger les tentatives d'upload échouées
- **Utilisation du stockage** : Surveiller l'utilisation du bucket

---

**Dernière mise à jour :** 2 juillet 2025  
**Version :** 1.0.0  
**Auteur :** Équipe MKB Dashboard 