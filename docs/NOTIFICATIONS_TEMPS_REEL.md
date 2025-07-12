# Système de Notifications en Temps Réel

## Vue d'ensemble

Le système de notifications en temps réel permet aux utilisateurs de recevoir des notifications instantanément sans avoir à recharger la page manuellement. Il utilise Supabase Realtime pour écouter les changements de la table `notifications` en temps réel.

## Fonctionnalités

### 🔔 Notifications en Temps Réel
- **Réception instantanée** : Les nouvelles notifications apparaissent immédiatement dans l'interface
- **Mise à jour automatique** : Les changements de statut (lu/non lu) sont synchronisés en temps réel
- **Suppression en temps réel** : Les notifications supprimées disparaissent instantanément

### 📱 Notifications du Navigateur
- **Notifications natives** : Affichage de notifications système du navigateur
- **Gestion des permissions** : Demande automatique des permissions de notification
- **Indicateur visuel** : Affichage de l'état des permissions dans l'interface

### 🍞 Notifications Toast
- **Notifications in-app** : Affichage de notifications toast dans l'interface utilisateur
- **Animations fluides** : Transitions et animations avec Framer Motion
- **Auto-dismiss** : Fermeture automatique après 5 secondes

## Architecture

### Hooks Utilisés

#### `useNotifications`
- Gère l'état des notifications
- Configure les abonnements Supabase Realtime
- Met à jour automatiquement l'interface

#### `useNotificationPermission`
- Gère les permissions de notification du navigateur
- Demande automatiquement les permissions
- Fournit des fonctions pour afficher des notifications

#### `useToastNotifications`
- Gère les notifications toast dans l'interface
- Fournit un système de gestion des toasts global

### Composants

#### `NotificationDropdown`
- Affiche la liste des notifications
- Gère les interactions utilisateur
- Affiche l'état des permissions

#### `ToastNotification`
- Composant de notification toast
- Animations et transitions
- Auto-fermeture

#### `ToastProvider`
- Provider global pour les notifications toast
- Gère l'état des toasts à travers l'application

## Configuration Supabase Realtime

Le système utilise Supabase Realtime pour écouter les changements de la table `notifications` :

```typescript
const channel = supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `recipient_id=eq.${userId}`
    },
    async (payload) => {
      // Traitement de la nouvelle notification
    }
  )
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'notifications',
      filter: `recipient_id=eq.${userId}`
    },
    (payload) => {
      // Mise à jour de la notification
    }
  )
  .on(
    'postgres_changes',
    {
      event: 'DELETE',
      schema: 'public',
      table: 'notifications',
      filter: `recipient_id=eq.${userId}`
    },
    (payload) => {
      // Suppression de la notification
    }
  )
  .subscribe();
```

## Utilisation

### Pour les Développeurs

#### Créer une Notification
```typescript
import { notificationService } from '@/lib/services/notificationService';

// Créer une notification simple
await notificationService.createNotification({
  recipient_user_id: userId,
  title: 'Nouvelle notification',
  message: 'Contenu de la notification',
  type: 'info',
  category: 'system'
});

// Utiliser les méthodes spécialisées
await notificationService.notifyPoleAccess(userId, poleName, adminName);
await notificationService.notifyPoleRemoval(userId, poleName, adminName);
await notificationService.notifyRoleChange(userId, newRole, adminName);
```

#### Utiliser les Notifications Toast
```typescript
import { useToast } from '@/components/providers/ToastProvider';

const { addToast } = useToast();

// Afficher une notification toast
addToast({
  title: 'Succès',
  message: 'Opération réussie',
  type: 'success'
});
```

### Pour les Utilisateurs

#### Permissions de Notification
1. **Première visite** : Le système demande automatiquement les permissions après 2 secondes
2. **Permissions accordées** : Les notifications du navigateur s'affichent
3. **Permissions refusées** : Un indicateur orange apparaît sur l'icône de notification
4. **Réactivation** : Clic sur "Réactiver les notifications" dans le dropdown

#### Interface Utilisateur
- **Icône de notification** : Affiche le nombre de notifications non lues
- **Indicateur de permission** : Point orange si les notifications sont désactivées
- **Dropdown** : Liste des notifications avec actions (marquer comme lu, supprimer)
- **Notifications toast** : Apparaissent en haut à droite de l'écran

## Types de Notifications

### Par Type
- **info** : Informations générales
- **success** : Opérations réussies
- **warning** : Avertissements
- **error** : Erreurs

### Par Catégorie
- **system** : Notifications système
- **user** : Notifications utilisateur
- **commercial** : Notifications commerciales
- **technique** : Notifications techniques

## Sécurité

- **Authentification** : Vérification du token utilisateur
- **Filtrage** : Seules les notifications destinées à l'utilisateur connecté sont reçues
- **RLS** : Row Level Security activé sur la table notifications
- **Service Role** : Utilisation de la clé service_role pour contourner RLS de manière sécurisée

## Performance

- **Abonnement unique** : Un seul abonnement Realtime par utilisateur
- **Nettoyage automatique** : Désabonnement lors du démontage du composant
- **Optimisation des requêtes** : Récupération des détails du sender uniquement si nécessaire
- **Mise en cache** : État local synchronisé avec la base de données

## Dépannage

### Problèmes Courants

#### Les notifications n'apparaissent pas en temps réel
1. Vérifier la connexion Supabase
2. Vérifier les permissions RLS
3. Vérifier la configuration Realtime

#### Les notifications du navigateur ne s'affichent pas
1. Vérifier les permissions du navigateur
2. Vérifier que le site est en HTTPS (requis pour les notifications)
3. Vérifier la configuration du service worker

#### Erreurs de connexion Realtime
1. Vérifier la configuration Supabase
2. Vérifier les variables d'environnement
3. Vérifier la connectivité réseau

### Logs de Débogage

Le système inclut des logs détaillés pour faciliter le débogage :

```typescript
console.log('Nouvelle notification reçue en temps réel:', payload);
console.log('Notification mise à jour en temps réel:', payload);
console.log('Notification supprimée en temps réel:', payload);
```

## Évolutions Futures

- **Notifications push** : Support des notifications push pour les applications mobiles
- **Préférences utilisateur** : Permettre aux utilisateurs de configurer leurs préférences
- **Notifications groupées** : Regroupement des notifications similaires
- **Historique** : Page dédiée à l'historique des notifications
- **Filtres avancés** : Filtrage par type, catégorie, date 