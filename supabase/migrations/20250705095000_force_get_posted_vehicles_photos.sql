-- Migration pour forcer la mise à jour de get_posted_vehicles avec photos
-- Migration: 20250705095000_force_get_posted_vehicles_photos

-- Vérifier d'abord la structure de la table advertisements
DO $$
BEGIN
    RAISE NOTICE 'Vérification de la structure de la table advertisements...';
    RAISE NOTICE 'Colonnes de advertisements: %', (
        SELECT string_agg(column_name || ' (' || data_type || ')', ', ')
        FROM information_schema.columns 
        WHERE table_name = 'advertisements' 
        AND table_schema = 'public'
    );
END $$;

-- Supprimer complètement la fonction existante
DROP FUNCTION IF EXISTS get_posted_vehicles(TIMESTAMPTZ, TIMESTAMPTZ, UUID, INTEGER, INTEGER);

-- Recréer la fonction avec une structure explicite
CREATE OR REPLACE FUNCTION get_posted_vehicles(
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_end_date TIMESTAMPTZ DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 10,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    reference TEXT,
    brand_name TEXT,
    model_name TEXT,
    price NUMERIC,
    purchase_price NUMERIC,
    location TEXT,
    created_at TIMESTAMPTZ,
    posted_by_user_id UUID,
    posted_by_user_name TEXT,
    photos TEXT[]
) AS $$
BEGIN
    -- Dates par défaut
    IF p_start_date IS NULL THEN
        p_start_date := date_trunc('month', CURRENT_DATE);
    END IF;
    
    IF p_end_date IS NULL THEN
        p_end_date := CURRENT_DATE + INTERVAL '1 day';
    END IF;
    
    -- Requête explicite avec jointure sur advertisements
    RETURN QUERY
    SELECT 
        c.id,
        c.reference,
        b.name as brand_name,
        m.name as model_name,
        c.price,
        c.purchase_price,
        c.location,
        a.created_at,
        a.posted_by_user as posted_by_user_id,
        CONCAT(u.prenom, ' ', u.nom) as posted_by_user_name,
        COALESCE(a.photos, ARRAY[]::TEXT[]) as photos
    FROM advertisements a
    INNER JOIN cars_v2 c ON a.car_id = c.id
    LEFT JOIN brands b ON c.brand_id = b.id
    LEFT JOIN models m ON c.model_id = m.id
    LEFT JOIN users u ON a.posted_by_user = u.auth_user_id
    WHERE a.created_at >= p_start_date 
    AND a.created_at < p_end_date
    AND (p_user_id IS NULL OR a.posted_by_user = p_user_id)
    ORDER BY a.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test de la fonction
DO $$
DECLARE
    test_result RECORD;
    photo_count INTEGER;
BEGIN
    RAISE NOTICE 'Test de la fonction get_posted_vehicles...';
    
    -- Tester avec un véhicule qui a des photos
    SELECT * INTO test_result 
    FROM get_posted_vehicles(
        '2025-01-01'::TIMESTAMPTZ,
        '2025-12-31'::TIMESTAMPTZ,
        NULL,
        1,
        0
    );
    
    IF test_result.id IS NOT NULL THEN
        RAISE NOTICE 'Véhicule trouvé: % - % %', test_result.reference, test_result.brand_name, test_result.model_name;
        
        IF test_result.photos IS NOT NULL THEN
            photo_count := array_length(test_result.photos, 1);
            RAISE NOTICE 'Photos trouvées: %', photo_count;
            IF photo_count > 0 THEN
                RAISE NOTICE 'Première photo: %', test_result.photos[1];
            END IF;
        ELSE
            RAISE NOTICE 'Photos: NULL';
        END IF;
    ELSE
        RAISE NOTICE 'Aucun véhicule trouvé';
    END IF;
END $$;

-- Ajouter un commentaire pour documenter
COMMENT ON FUNCTION get_posted_vehicles IS 'Retourne les véhicules postés avec leurs photos - Version forcée avec photos'; 