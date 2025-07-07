# Configuration de l'Upload vers le Serveur Infomaniak

## Vue d'ensemble

Ce projet utilise un serveur Infomaniak pour stocker les images des véhicules via SFTP, au lieu de Supabase Storage. Cela permet un meilleur contrôle sur le stockage et l'accès aux fichiers.

## Architecture

```
Frontend (Next.js) → API Route (/api/upload) → Serveur Infomaniak (SFTP)
```

### Flux d'upload

1. **Frontend** : L'utilisateur sélectionne des images dans le formulaire de véhicule
2. **API Route** : `/api/upload` reçoit les fichiers et les upload via SFTP
3. **Serveur Infomaniak** : Stocke les fichiers dans le dossier `/uploads/{reference}/`
4. **Base de données** : Met à jour la table `advertisements` avec les URLs des images

## Configuration des Variables d'Environnement

Ajoutez ces variables dans votre fichier `.env.local` :

```bash
# Configuration SFTP Infomaniak
SFTP_HOST=sw7sw.ftp.infomaniak.com
SFTP_PORT=22
SFTP_USER=sw7sw_mkb
SFTP_PASSWORD=votre_mot_de_passe_sftp

# Configuration Supabase (pour l'authentification et la base de données)
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_supabase
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_role_supabase
```

### Obtention des Identifiants SFTP

1. Connectez-vous à votre panneau de contrôle Infomaniak
2. Allez dans **Hébergement Web** → **Votre domaine**
3. Cliquez sur **Accès FTP/SFTP**
4. Notez les informations de connexion :
   - **Serveur** : `sw7sw.ftp.infomaniak.com`
   - **Port** : `22` (SFTP) ou `21` (FTP)
   - **Nom d'utilisateur** : `sw7sw_mkb`
   - **Mot de passe** : Votre mot de passe FTP

## Structure des Dossiers sur le Serveur

Les images sont organisées comme suit sur le serveur Infomaniak :

```
/home/clients/579d9810fe84939753a28b4360138c3f/var/www/mkbautomobile/uploads/
├── AB00001/
│   ├── photo-1.jpg
│   ├── photo-2.jpg
│   └── photo-3.jpg
├── AB00002/
│   ├── photo-1.jpg
│   └── photo-2.jpg
└── ...
```

### Conventions de Nommage

- **Dossier** : Référence du véhicule (ex: `AB00001`)
- **Fichiers** : `photo-1.jpg`, `photo-2.jpg`, etc.
- **Formats supportés** : JPG, JPEG, PNG, WEBP, GIF
- **Taille maximale** : 10MB par fichier

### URLs Publiques

Les images sont accessibles via le sous-domaine `images.mkbautomobile.com` :

```
https://images.mkbautomobile.com/photos/AB00001/photo-1.jpg
https://images.mkbautomobile.com/photos/AB00001/photo-2.jpg
https://images.mkbautomobile.com/photos/AB00002/photo-1.jpg
```

**Note** : Les URLs générées automatiquement utilisent le sous-domaine `images` pour une meilleure organisation et performance.

## Test de la Configuration

### 1. Test de Connexion SFTP

Exécutez le script de test pour vérifier la connexion :

```bash
node scripts/test-sftp-connection.js
```

Ce script va :
- Vérifier les variables d'environnement
- Tester la connexion SFTP
- Créer un dossier de test
- Uploader un fichier de test
- Supprimer le fichier de test

### 2. Test via l'Interface

1. Connectez-vous à l'application
2. Allez dans **Pricing** → **Angola**
3. Ajoutez un nouveau véhicule
4. Uploadez des images à l'étape 3
5. Vérifiez que les images apparaissent dans la base de données

## Gestion des Erreurs

### Erreurs Courantes

#### 1. "Token d'authentification manquant"
- **Cause** : L'utilisateur n'est pas connecté
- **Solution** : Se reconnecter à l'application

#### 2. "Configuration SFTP manquante"
- **Cause** : Variables d'environnement non configurées
- **Solution** : Vérifier le fichier `.env.local`

#### 3. "Authentication failed"
- **Cause** : Identifiants SFTP incorrects
- **Solution** : Vérifier les identifiants dans Infomaniak

#### 4. "ECONNREFUSED"
- **Cause** : Serveur SFTP inaccessible
- **Solution** : Vérifier l'adresse et le port

### Logs de Débogage

Les logs détaillés sont disponibles dans :
- **Console du navigateur** : Erreurs côté frontend
- **Logs Next.js** : Erreurs côté serveur
- **Logs Infomaniak** : Erreurs côté serveur d'hébergement

## Sécurité

### Mesures de Sécurité Implémentées

1. **Authentification** : Token Supabase requis pour chaque upload
2. **Validation des fichiers** : Types et tailles vérifiés
3. **Isolation des dossiers** : Un dossier par véhicule
4. **Nommage sécurisé** : Pas d'injection de noms de fichiers

### Bonnes Pratiques

1. **Ne jamais commiter** les mots de passe dans le code
2. **Utiliser des variables d'environnement** pour les secrets
3. **Limiter les permissions** du compte SFTP
4. **Surveiller les logs** d'accès

## Maintenance

### Nettoyage des Fichiers

Pour nettoyer les anciens fichiers :

1. Connectez-vous en SFTP au serveur
2. Naviguez vers `/uploads/`
3. Supprimez les dossiers des véhicules supprimés

### Sauvegarde

Les images sont stockées sur le serveur Infomaniak. Pour la sauvegarde :

1. **Sauvegarde automatique** : Configurée par Infomaniak
2. **Sauvegarde manuelle** : Télécharger le dossier `/uploads/`
3. **Base de données** : Sauvegarder la table `advertisements`

## Déploiement

### Variables d'Environnement en Production

Assurez-vous que toutes les variables d'environnement sont configurées sur votre plateforme de déploiement (Vercel, Netlify, etc.).

### Test Post-Déploiement

Après chaque déploiement :

1. Tester l'upload d'une image
2. Vérifier que les URLs sont correctes
3. Contrôler les permissions des dossiers

## Support

En cas de problème :

1. **Vérifier les logs** de l'application
2. **Tester la connexion SFTP** avec le script
3. **Contacter l'équipe** avec les logs d'erreur
4. **Vérifier la configuration** Infomaniak

## Migration depuis Supabase Storage

Si vous migrez depuis Supabase Storage :

1. **Exporter les images** depuis Supabase
2. **Uploader vers Infomaniak** avec la même structure
3. **Mettre à jour les URLs** dans la base de données
4. **Tester l'upload** de nouveaux véhicules 