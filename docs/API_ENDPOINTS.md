# Documentation des Endpoints API - MKB Dashboard

## Vue d'ensemble

Cette documentation décrit tous les endpoints API disponibles dans l'application MKB Dashboard.

## Base URL

```
http://localhost:54321 (développement local)
```

## Authentification

Tous les endpoints nécessitent une authentification via Supabase Auth. Les tokens JWT doivent être inclus dans les headers :

```
Authorization: Bearer <jwt_token>
```

## Endpoints d'Authentification

### POST `/api/auth/signup`
Créer un nouveau compte utilisateur.

**Body :**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response :**
```json
{
  "success": true,
  "message": "Compte créé avec succès"
}
```

### POST `/api/auth/reset-password`
Demander une réinitialisation de mot de passe.

**Body :**
```json
{
  "email": "user@example.com"
}
```

### POST `/api/auth/update-password`
Mettre à jour le mot de passe.

**Body :**
```json
{
  "password": "newpassword123"
}
```

## Endpoints de Profil

### POST `/api/profile/upload-photo`
Uploader une photo de profil.

**Body :** `FormData`
- `file`: Fichier image (JPG, PNG, WEBP)

**Response :**
```json
{
  "success": true,
  "photo_url": "https://storage.supabase.co/profile/user123/photo.jpg"
}
```

## Endpoints de Documents

### POST `/api/documents/generate`
Générer un document PDF.

**Body :**
```json
{
  "type": "invoice",
  "data": {
    "vehicle_id": "uuid",
    "customer_name": "John Doe"
  }
}
```

**Response :**
```json
{
  "success": true,
  "pdf_url": "https://storage.supabase.co/documents/invoice_123.pdf"
}
```

### GET `/api/documents/[id]/pdf`
Télécharger un document PDF.

**Response :** Fichier PDF

## Endpoints de Test

### GET `/api/env-test`
Tester la configuration des variables d'environnement.

**Response :**
```json
{
  "supabase_url": "https://xxx.supabase.co",
  "supabase_anon_key": "***",
  "mailjet_api_key": "***"
}
```

### GET `/api/documents/debug`
Debug des documents.

### GET `/api/documents/direct-test`
Test direct des documents.

### GET `/api/documents/simple-test`
Test simple des documents.

## Endpoints d'Email

### POST `/api/send-email`
Envoyer un email.

**Body :**
```json
{
  "to": "recipient@example.com",
  "subject": "Sujet de l'email",
  "template": "welcome",
  "data": {
    "name": "John Doe",
    "activation_link": "https://..."
  }
}
```

**Response :**
```json
{
  "success": true,
  "message_id": "email_123"
}
```

## Endpoints d'Upload

### POST `/api/upload`
Uploader des fichiers.

**Body :** `FormData`
- `file`: Fichier à uploader

**Response :**
```json
{
  "success": true,
  "file_path": "uploads/file_123.jpg",
  "public_url": "https://storage.supabase.co/uploads/file_123.jpg"
}
```

## Endpoints de Test Email

### GET `/api/test-email`
Tester l'envoi d'emails.

**Response :**
```json
{
  "success": true,
  "message": "Email de test envoyé"
}
```

## Gestion des Erreurs

### Format d'Erreur Standard
```json
{
  "error": true,
  "message": "Description de l'erreur",
  "code": "ERROR_CODE",
  "details": {
    "field": "additional_info"
  }
}
```

### Codes d'Erreur Communs
- `INVALID_CREDENTIALS` - Identifiants invalides
- `UNAUTHORIZED` - Non autorisé
- `VALIDATION_ERROR` - Erreur de validation
- `FILE_TOO_LARGE` - Fichier trop volumineux
- `INVALID_FILE_TYPE` - Type de fichier non supporté
- `STORAGE_ERROR` - Erreur de stockage
- `EMAIL_ERROR` - Erreur d'envoi d'email

## Exemples d'Utilisation

### JavaScript/TypeScript
```typescript
// Upload de photo de profil
const uploadPhoto = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/profile/upload-photo', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabase.auth.session()?.access_token}`
    },
    body: formData
  });

  return response.json();
};

// Générer un document
const generateDocument = async (data: any) => {
  const response = await fetch('/api/documents/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabase.auth.session()?.access_token}`
    },
    body: JSON.stringify(data)
  });

  return response.json();
};
```

### cURL
```bash
# Upload de photo
curl -X POST http://localhost:54321/api/profile/upload-photo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@photo.jpg"

# Générer document
curl -X POST http://localhost:54321/api/documents/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "invoice", "data": {"vehicle_id": "uuid"}}'
```

## Sécurité

### Headers de Sécurité
- `Authorization: Bearer <jwt_token>` - Authentification
- `Content-Type: application/json` - Pour les requêtes JSON
- `Content-Type: multipart/form-data` - Pour les uploads

### Validation
- Tous les inputs sont validés côté serveur
- Sanitisation des données
- Vérification des types de fichiers
- Limitation de taille des fichiers

### Rate Limiting
- Limitation par utilisateur
- Protection contre les abus
- Timeout sur les opérations longues

## Monitoring

### Logs
Tous les endpoints loggent :
- Requêtes entrantes
- Erreurs
- Temps de réponse
- Utilisateur authentifié

### Métriques
- Nombre de requêtes par endpoint
- Temps de réponse moyen
- Taux d'erreur
- Utilisation du stockage 