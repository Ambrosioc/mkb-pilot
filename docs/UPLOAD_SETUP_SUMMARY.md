# Résumé de la Configuration Upload Infomaniak

## ✅ Modifications Effectuées

### 1. Fonction d'Upload Modifiée (`lib/uploadImage.ts`)
- ✅ Ajout de l'authentification avec token Supabase
- ✅ Envoi du token dans les headers de la requête
- ✅ Gestion des erreurs d'authentification

### 2. API Route Configurée (`app/api/upload/route.ts`)
- ✅ Upload via SFTP vers le serveur Infomaniak
- ✅ Authentification requise pour chaque upload
- ✅ Validation des fichiers (types, taille)
- ✅ Génération d'URLs publiques : `https://images.mkbautomobile.com/photos/{reference}/{fileName}`
- ✅ Mise à jour automatique de la base de données

### 3. Scripts de Test Créés
- ✅ `scripts/test-sftp-connection.js` : Test de connexion SFTP
- ✅ `scripts/test-upload-complete.js` : Test d'upload complet
- ✅ `scripts/test-image-urls.js` : Test des URLs d'images

### 4. Documentation Créée
- ✅ `docs/INFOMANIAK_UPLOAD_SETUP.md` : Guide complet de configuration
- ✅ `docs/UPLOAD_SETUP_SUMMARY.md` : Ce résumé

### 5. Migration Créée
- ✅ `supabase/migrations/20250703020000_update_image_urls.sql` : Mise à jour des URLs existantes

## 🔧 Configuration Requise

### Variables d'Environnement (.env.local)
```bash
# Configuration SFTP Infomaniak
SFTP_HOST=sw7sw.ftp.infomaniak.com
SFTP_PORT=22
SFTP_USER=sw7sw_mkb
SFTP_PASSWORD=votre_mot_de_passe_sftp

# Configuration Supabase (déjà configurée)
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_supabase
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_role_supabase
```

## 🧪 Tests à Effectuer

### 1. Test de Connexion SFTP
```bash
node scripts/test-sftp-connection.js
```

### 2. Test via l'Interface
1. Lancez le serveur : `npm run dev`
2. Connectez-vous à l'application
3. Allez dans **Pricing** → **Angola**
4. Ajoutez un véhicule et uploadez des images
5. Vérifiez que les images sont uploadées sur Infomaniak

## 📁 Structure des Fichiers sur Infomaniak

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

## 🌐 URLs Publiques

Les images seront accessibles via :
```
https://images.mkbautomobile.com/photos/AB00001/photo-1.jpg
https://images.mkbautomobile.com/photos/AB00001/photo-2.jpg
```

## 🔒 Sécurité

- ✅ Authentification requise pour chaque upload
- ✅ Validation des types de fichiers
- ✅ Limitation de taille (10MB max)
- ✅ Isolation des dossiers par véhicule
- ✅ Nommage sécurisé des fichiers

## 🚀 Prochaines Étapes

1. **Configurer les variables SFTP** dans `.env.local`
2. **Tester la connexion SFTP** avec le script
3. **Tester l'upload** via l'interface utilisateur
4. **Vérifier les URLs** générées dans la base de données

## ❓ En Cas de Problème

### Erreur "Token d'authentification manquant"
- Vérifiez que l'utilisateur est connecté
- Reconnectez-vous si nécessaire

### Erreur "Configuration SFTP manquante"
- Vérifiez les variables d'environnement dans `.env.local`
- Relancez le serveur après modification

### Erreur "Authentication failed"
- Vérifiez les identifiants SFTP dans Infomaniak
- Testez la connexion avec le script

### Erreur "ECONNREFUSED"
- Vérifiez l'adresse et le port du serveur SFTP
- Vérifiez la connectivité réseau

## 📞 Support

En cas de problème :
1. Vérifiez les logs dans la console du serveur
2. Testez la connexion SFTP avec le script
3. Consultez la documentation complète
4. Contactez l'équipe avec les logs d'erreur 