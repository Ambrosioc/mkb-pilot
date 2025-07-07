# Guide d'intégration Mailjet dans MKB Pilot

Ce guide explique comment configurer et utiliser Mailjet pour l'envoi d'emails transactionnels dans l'application MKB Pilot.

## 1. Configuration initiale

### Création d'un compte Mailjet

1. Créez un compte sur [Mailjet](https://www.mailjet.com/)
2. Validez votre domaine d'envoi
3. Récupérez vos clés API dans la section "Paramètres du compte > Clés API REST"

### Configuration des variables d'environnement

Ajoutez les variables suivantes à votre fichier `.env.local` :

```
# Mailjet
MAILJET_API_KEY=your_mailjet_api_key
MAILJET_SECRET_KEY=your_mailjet_secret_key
MAILJET_SENDER_EMAIL=your_sender_email@example.com
MAILJET_SENDER_NAME=Your Company Name
```

## 2. Désactivation des emails Supabase

Pour désactiver les emails automatiques de Supabase et utiliser uniquement Mailjet :

1. Connectez-vous à votre dashboard Supabase
2. Allez dans "Authentication > Email Templates"
3. Pour chaque template (Confirmation, Invitation, Magic Link, Reset Password) :
   - Décochez la case "Enable email template"
   - Cliquez sur "Save"

## 3. Types d'emails configurés

### Emails d'authentification

- **Email de bienvenue** : Envoyé après l'inscription d'un nouvel utilisateur
- **Email de confirmation** : Pour valider l'adresse email d'un utilisateur
- **Email de réinitialisation de mot de passe** : Pour réinitialiser un mot de passe oublié

### Emails de documents

- **Email de devis** : Pour envoyer un devis à un client
- **Email de facture** : Pour envoyer une facture à un client

## 4. Personnalisation des templates

Les templates HTML sont définis dans `lib/mailjet.ts`. Vous pouvez les personnaliser selon vos besoins :

- Modifier le design (couleurs, polices, etc.)
- Ajouter votre logo (remplacer les URLs dans les templates)
- Adapter les textes et messages

## 5. Utilisation dans le code

### Envoi d'un email simple

```typescript
import { sendEmail } from '@/lib/mailjet';

await sendEmail({
  subject: 'Sujet de l\'email',
  htmlContent: '<p>Contenu HTML de l\'email</p>',
  textContent: 'Version texte de l\'email',
  recipients: [{ Email: 'destinataire@example.com', Name: 'Nom Destinataire' }],
});
```

### Envoi d'un document

```typescript
import { sendDocumentEmail } from '@/lib/mailjet';

await sendDocumentEmail(
  { email: 'client@example.com', name: 'Nom Client' },
  { 
    type: 'devis', 
    number: 'D202401-001', 
    pdfBase64: 'base64_du_pdf', 
    vehicleInfo: 'Peugeot 308 (2022)' 
  },
  'Message personnalisé optionnel'
);
```

## 6. API Routes

L'application expose deux routes API pour l'envoi d'emails :

- **POST /api/send-email** : Pour envoyer un email générique
- **PUT /api/send-email** : Pour envoyer un document (devis/facture)

Ces routes nécessitent une authentification (Bearer token).

## 7. Génération de PDF

Les documents PDF sont générés avec la bibliothèque `pdf-lib` :

- Les devis et factures sont créés via `lib/pdf-generator.ts`
- Le design est personnalisable (couleurs, polices, etc.)
- Les PDFs sont stockés en base64 dans la table `sales_documents`

## 8. Suivi des emails

Tous les emails envoyés sont tracés dans la table `email_logs` avec :

- L'utilisateur qui a envoyé l'email
- Le destinataire
- Le type de document
- Le statut d'envoi (succès/erreur)
- La date d'envoi

## 9. Dépannage

### Problèmes courants

- **Emails non reçus** : Vérifiez les logs dans la table `email_logs`
- **Erreurs d'authentification** : Vérifiez vos clés API Mailjet
- **Problèmes de génération PDF** : Consultez les logs serveur

### Support

Pour toute question ou problème :
- Consultez la [documentation Mailjet](https://dev.mailjet.com/)
- Vérifiez les logs dans la console serveur
- Contactez l'équipe de support MKB Pilot