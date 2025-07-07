# Système de Permissions Simplifié

## Vue d'ensemble

Le système de permissions a été simplifié en supprimant le champ `role_level` de la table `user_poles` et en utilisant uniquement le système de rôles hiérarchiques (`user_roles`).

## Architecture

### Tables principales

1. **`user_roles`** - Rôle hiérarchique de l'utilisateur
   - `user_id` - UUID de l'utilisateur
   - `role_id` - ID du rôle (1-5)

2. **`user_poles`** - Affectation aux pôles métiers (sans niveau)
   - `user_id` - UUID de l'utilisateur
   - `pole_id` - ID du pôle

3. **`roles`** - Définition des rôles hiérarchiques
   - `id` - ID du rôle (1-5)
   - `nom` - Nom du rôle
   - `niveau` - Niveau hiérarchique (1=plus haut, 5=plus bas)

4. **`poles`** - Pôles métiers
   - `id` - ID du pôle
   - `name` - Nom du pôle
   - `description` - Description du pôle

## Niveaux d'accès

| Niveau | Rôle | Permissions | Description |
|--------|------|-------------|-------------|
| 1 | CEO | Toutes | Accès global |
| 2 | G4 | Lecture + Écriture + Gestion | Direction |
| 3 | Responsable de Pôle | Lecture + Écriture + Gestion | Chef de pôle |
| 4 | Collaborateur confirmé | Lecture + Écriture | Accès intermédiaire |
| 5 | Collaborateur simple | Lecture uniquement | Accès restreint |

## Fonctions SQL

### `get_user_pole_access(p_user_id, p_pole_name)`
Retourne les permissions d'un utilisateur pour un pôle spécifique.

**Retourne :**
- `role_level` - Niveau du rôle hiérarchique
- `can_read` - Peut lire (niveau ≤ 5)
- `can_write` - Peut écrire (niveau ≤ 4)
- `can_manage` - Peut gérer (niveau ≤ 3)

### `get_user_poles(p_user_id)`
Retourne tous les pôles d'un utilisateur avec ses permissions.

### `has_pole_access(p_user_id, p_pole_name)`
Vérifie si un utilisateur a accès à un pôle spécifique.

### `get_user_access_level(p_user_id)`
Retourne le niveau d'accès global d'un utilisateur.

## Utilisation dans le frontend

### Hook `usePoleAccess`

```typescript
const { canRead, canWrite, canManage, isLoading } = usePoleAccess('Stock');
```

### Hook `useUserPoles`

```typescript
const { userPoles, isLoading } = useUserPoles();
```

### HOC `withPoleAccess`

```typescript
const ProtectedComponent = withPoleAccess('Stock', { requireWrite: true })(MyComponent);
```

## Migration effectuée

### Changements apportés

1. **Suppression du champ `role_level`** de la table `user_poles`
2. **Mise à jour des fonctions SQL** pour utiliser le système de rôles hiérarchiques
3. **Simplification des politiques RLS**
4. **Création de nouvelles fonctions utilitaires**

### Avantages

- **Simplicité** : Un seul système de niveaux d'accès
- **Cohérence** : Les permissions sont basées sur le rôle hiérarchique
- **Maintenabilité** : Moins de complexité dans la base de données
- **Flexibilité** : Facile d'ajouter de nouveaux pôles sans gérer les niveaux

## Test du système

Le script `scripts/test-simplified-permissions.js` permet de tester le système :

```bash
node scripts/test-simplified-permissions.js
```

## Exemple de résultat

```
🎯 RÉSUMÉ FINAL
================
Rôle hiérarchique: Collaborateur confirmé (Niveau 4)
Niveau d'accès global: 4
Pôles affectés: 2

✅ Permissions Stock:
   - Lecture: ✅
   - Écriture: ✅
   - Gestion: ❌

✅ Vous pouvez maintenant:
   - Créer des véhicules
   - Modifier des véhicules
   - Créer des devis/factures
   - Envoyer des emails
```

## Prochaines étapes

1. **Tester l'application** pour s'assurer que tout fonctionne
2. **Mettre à jour la documentation** des composants si nécessaire
3. **Former les utilisateurs** sur le nouveau système
4. **Surveiller les logs** pour détecter d'éventuels problèmes 