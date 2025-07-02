# Réorganisation des IDs de la table cars_v2

Ce dossier contient tous les scripts nécessaires pour réorganiser les IDs de la table `cars_v2` afin qu'ils deviennent consécutifs à partir de 1, tout en préservant l'intégrité référentielle avec la table `advertisements`.

## 📋 Prérequis

- Base de données PostgreSQL
- Tables `cars_v2` et `advertisements` existantes
- Droits d'administration sur la base de données
- Espace disque suffisant pour les sauvegardes

## 🚀 Procédure recommandée

### Étape 1: Sauvegarde (OBLIGATOIRE)
```sql
-- Exécutez ce script en premier
\i scripts/backup-before-reorganization.sql
```

### Étape 2: Vérification des contraintes
```sql
-- Vérifiez les contraintes existantes
\i scripts/check-constraints.sql
```

### Étape 3: Analyse préalable
```sql
-- Analysez l'état actuel de vos données
\i scripts/analyze-cars-v2-before-reorganization.sql
```

### Étape 4: Réorganisation
```sql
-- Script principal de réorganisation
\i scripts/reorganize-cars-v2-ids-robust.sql
```

### Étape 5: Vérification post-réorganisation
```sql
-- Vérifiez que tout s'est bien passé
SELECT 
    'Vérification finale' as check_type,
    COUNT(*) as total_cars,
    MIN(id) as min_id,
    MAX(id) as max_id,
    MAX(id) - MIN(id) + 1 as expected_consecutive
FROM cars_v2;

SELECT 
    'Intégrité référentielle finale' as check_type,
    COUNT(*) as orphaned_ads
FROM advertisements a
LEFT JOIN cars_v2 c ON a.car_id = c.id
WHERE c.id IS NULL;
```

## 📁 Fichiers disponibles

### Scripts principaux
- **`backup-before-reorganization.sql`** - Sauvegarde automatique avant réorganisation
- **`check-constraints.sql`** - Vérification des contraintes existantes
- **`analyze-cars-v2-before-reorganization.sql`** - Analyse de l'état actuel des données
- **`reorganize-cars-v2-ids.sql`** - Script de réorganisation simple
- **`reorganize-cars-v2-ids-robust.sql`** - Script de réorganisation robuste (recommandé)
- **`rollback-cars-v2-reorganization.sql`** - Script de rollback en cas de problème

## ⚠️ Points importants

### Avant d'exécuter
1. **Sauvegarde obligatoire** : Exécutez toujours le script de sauvegarde en premier
2. **Vérification de l'espace disque** : Assurez-vous d'avoir suffisamment d'espace
3. **Maintenance** : Idéalement, exécutez pendant une période de maintenance
4. **Tests** : Testez d'abord sur un environnement de développement

### Pendant l'exécution
- Le script utilise des transactions pour garantir l'intégrité
- Les contraintes de clé étrangère sont temporairement désactivées
- Une nouvelle table est créée puis renommée pour éviter les conflits

### Après l'exécution
- Vérifiez que les IDs sont bien consécutifs (1, 2, 3, 4...)
- Vérifiez l'intégrité référentielle
- Testez votre application pour vous assurer que tout fonctionne

## 🔄 Rollback

En cas de problème, vous pouvez utiliser le script de rollback :

```sql
\i scripts/rollback-cars-v2-reorganization.sql
```

**Note** : Le rollback n'est possible que si vous avez exécuté le script de sauvegarde au préalable.

## 📊 Exemple de transformation

### Avant la réorganisation
```
cars_v2.id: 3, 7, 9, 15, 22, 45
advertisements.car_id: 7, 15, 3, 9, 22
```

### Après la réorganisation
```
cars_v2.id: 1, 2, 3, 4, 5, 6
advertisements.car_id: 2, 4, 1, 3, 5
```

## 🛠️ Personnalisation

### Ajuster le nom de la séquence
Si votre séquence ne s'appelle pas `vehicles_id_seq`, modifiez cette ligne dans le script :

```sql
-- Remplacez 'vehicles_id_seq' par le nom de votre séquence
SELECT setval('vehicles_id_seq', (SELECT MAX(id) FROM cars_v2), true);
```

### Gérer d'autres contraintes
Si vous avez d'autres contraintes ou index, ajoutez-les dans la section appropriée du script.

## ❓ Questions fréquentes

**Q: Combien de temps prend la réorganisation ?**
R: Cela dépend du nombre d'enregistrements. Pour quelques milliers d'enregistrements, cela prend généralement quelques secondes.

**Q: Puis-je annuler la réorganisation ?**
R: Oui, si vous avez exécuté le script de sauvegarde au préalable.

**Q: Que se passe-t-il si le script échoue ?**
R: Grâce aux transactions, la base de données revient à son état initial.

**Q: Puis-je exécuter le script plusieurs fois ?**
R: Oui, mais c'est inutile car les IDs seront déjà consécutifs après la première exécution.

## 🆘 Support

En cas de problème :
1. Vérifiez les logs PostgreSQL
2. Consultez les messages d'erreur dans le script
3. Utilisez le script de rollback si nécessaire
4. Restaurez depuis une sauvegarde complète si le rollback échoue 