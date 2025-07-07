-- Script pour vérifier les contraintes existantes sur cars_v2 et advertisements
-- Exécutez ce script pour comprendre la structure de vos contraintes

-- 1. Contraintes sur cars_v2
SELECT 
    'cars_v2' as table_name,
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'cars_v2'::regclass
ORDER BY contype, conname;

-- 2. Contraintes sur advertisements
SELECT 
    'advertisements' as table_name,
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'advertisements'::regclass
ORDER BY contype, conname;

-- 3. Index sur cars_v2
SELECT 
    'cars_v2' as table_name,
    indexname as index_name,
    indexdef as index_definition
FROM pg_indexes
WHERE tablename = 'cars_v2'
ORDER BY indexname;

-- 4. Index sur advertisements
SELECT 
    'advertisements' as table_name,
    indexname as index_name,
    indexdef as index_definition
FROM pg_indexes
WHERE tablename = 'advertisements'
ORDER BY indexname;

-- 5. Structure des colonnes de cars_v2
SELECT 
    'cars_v2' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_name = 'cars_v2'
ORDER BY ordinal_position;

-- 6. Structure des colonnes de advertisements
SELECT 
    'advertisements' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_name = 'advertisements'
ORDER BY ordinal_position;

-- 7. Vérification de la séquence auto-incrémentée
SELECT 
    'Séquence' as info_type,
    pg_get_serial_sequence('cars_v2', 'id') as sequence_name,
    currval(pg_get_serial_sequence('cars_v2', 'id')) as current_value
WHERE pg_get_serial_sequence('cars_v2', 'id') IS NOT NULL;

-- 8. Résumé des contraintes de clé étrangère
SELECT 
    'Clés étrangères' as info_type,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('cars_v2', 'advertisements')
ORDER BY tc.table_name, kcu.column_name; 