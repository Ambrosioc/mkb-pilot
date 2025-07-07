# Guide de configuration de l'envoi d'email - MKB Pilot

Ce guide vous explique comment configurer l'envoi d'email pour les devis et factures dans MKB Pilot.

## 🚀 Configuration rapide

### 1. Créer un compte Mailjet

1. Allez sur [Mailjet](https://www.mailjet.com/) et créez un compte gratuit
2. Validez votre adresse email
3. Dans "Paramètres du compte > Clés API REST", récupérez vos clés

### 2. Configurer les variables d'environnement

Ajoutez ces variables à votre fichier `.env.local` :

```bash
# Mailjet Configuration
MAILJET_API_KEY=your_mailjet_api_key_here
MAILJET_SECRET_KEY=your_mailjet_secret_key_here
MAILJET_SENDER_EMAIL=contact@mkbautomobile.com
MAILJET_SENDER_NAME=MKB Automobile
```

### 3. Tester la configuration

1. Démarrez votre serveur : `npm run dev`
2. Allez sur : `http://localhost:3000/test-email`
3. Saisissez votre email et cliquez sur "Envoyer un email de test"
4. Vérifiez votre boîte de réception

## 📧 Fonctionnalités d'email

### Emails automatiques configurés

- ✅ **Devis** : Envoi automatique avec PDF en pièce jointe
- ✅ **Factures** : Envoi automatique avec PDF en pièce jointe
- ✅ **Template personnalisé** : Design professionnel MKB Automobile
- ✅ **Logs d'envoi** : Suivi complet dans la base de données

### Template d'email

Le template inclut :
- Logo et identité visuelle MKB Automobile
- Informations du véhicule
- Détails du document (devis/facture)
- Coordonnées de contact
- Message personnalisé optionnel

## 🔧 Utilisation dans l'application

### Envoi d'un devis/facture

1. Ouvrez un véhicule dans le dashboard
2. Allez dans l'onglet "Documents"
3. Créez un devis ou une facture
4. Cliquez sur "Envoyer l'email au client"
5. L'email sera envoyé automatiquement avec le PDF en pièce jointe

### Fonctionnalités disponibles

- **Aperçu** : Voir le document avant envoi
- **Impression** : Imprimer directement le document
- **Téléchargement** : Télécharger le PDF
- **Envoi par email** : Envoyer au client avec template professionnel

## 📊 Suivi et logs

### Table `email_logs`

Tous les emails sont tracés avec :
- Utilisateur qui a envoyé l'email
- Destinataire
- Type de document (devis/facture)
- Statut d'envoi (succès/erreur)
- Date et heure d'envoi

### Consultation des logs

```sql
-- Voir tous les emails envoyés
SELECT * FROM email_logs ORDER BY sent_at DESC;

-- Voir les emails échoués
SELECT * FROM email_logs WHERE success = false;

-- Statistiques par type de document
SELECT document_type, COUNT(*) as total, 
       SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful
FROM email_logs 
GROUP BY document_type;
```

## 🛠️ Dépannage

### Problèmes courants

#### 1. Emails non reçus
- Vérifiez les logs dans `email_logs`
- Vérifiez votre dossier spam
- Testez avec `/test-email`

#### 2. Erreurs d'authentification
- Vérifiez vos clés API Mailjet
- Assurez-vous que les variables d'environnement sont correctes
- Redémarrez le serveur après modification des variables

#### 3. PDF non généré
- Vérifiez que le document existe dans `sales_documents`
- Consultez les logs serveur pour les erreurs de génération

### Test de la configuration

Utilisez la page de test intégrée :
```
http://localhost:3000/test-email
```

Cette page vous permet de :
- Tester l'envoi d'email simple
- Vérifier la configuration Mailjet
- Diagnostiquer les problèmes

## 🔒 Sécurité

### Bonnes pratiques

- ✅ Utilisez des clés API sécurisées
- ✅ Ne partagez jamais vos clés API
- ✅ Utilisez un domaine d'envoi validé
- ✅ Surveillez les logs d'envoi
- ✅ Limitez les envois par utilisateur

### Variables d'environnement

Assurez-vous que votre `.env.local` n'est pas commité dans Git :
```bash
# .gitignore
.env.local
.env.production
```

## 📞 Support

En cas de problème :
1. Consultez les logs dans la console serveur
2. Vérifiez la table `email_logs`
3. Testez avec la page `/test-email`
4. Consultez la [documentation Mailjet](https://dev.mailjet.com/)

---

**Note** : Ce système d'envoi d'email est maintenant entièrement fonctionnel et prêt pour la production ! 