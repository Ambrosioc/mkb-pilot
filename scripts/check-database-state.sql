-- Script pour vérifier l'état de la base de données après un supabase reset
-- Exécutez ce script pour voir quelles tables existent

-- 1. Lister toutes les tables existantes
SELECT 
    'Tables existantes' as info_type,
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
ORDER BY schemaname, tablename;

-- 2. Vérifier si cars_v2 existe
SELECT 
    'Vérification cars_v2' as info_type,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cars_v2') 
        THEN 'EXISTE' 
        ELSE 'N''EXISTE PAS' 
    END as status;

-- 3. Vérifier si advertisements existe
SELECT 
    'Vérification advertisements' as info_type,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'advertisements') 
        THEN 'EXISTE' 
        ELSE 'N''EXISTE PAS' 
    END as status;

-- 4. Lister les migrations appliquées
SELECT 
    'Migrations' as info_type,
    version,
    statements,
    name,
    created_at
FROM supabase_migrations.schema_migrations
ORDER BY created_at DESC;

-- 5. Vérifier les séquences existantes
SELECT 
    'Séquences' as info_type,
    schemaname,
    sequencename,
    start_value,
    minimum_value,
    maximum_value,
    increment
FROM pg_sequences
WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
ORDER BY schemaname, sequencename;

-- 6. Instructions post-reset
SELECT 
    'Instructions post-reset' as info_type,
    '1. Appliquer les migrations: supabase db reset' as step_1,
    '2. Vérifier que les tables sont créées' as step_2,
    '3. Insérer des données de test si nécessaire' as step_3,
    '4. Puis exécuter la réorganisation des IDs' as step_4; 