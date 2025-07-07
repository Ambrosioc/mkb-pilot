-- Correction de la fonction get_posted_vehicles pour retourner les photos
-- Migration: 20250705094000_fix_get_posted_vehicles_photos

-- Supprimer et recréer la fonction pour s'assurer qu'elle retourne les photos
DROP FUNCTION IF EXISTS get_posted_vehicles(TIMESTAMPTZ, TIMESTAMPTZ, UUID, INTEGER, INTEGER);

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
    JOIN cars_v2 c ON a.car_id = c.id
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

-- Ajouter un commentaire pour documenter la correction
COMMENT ON FUNCTION get_posted_vehicles IS 'Retourne les véhicules postés avec leurs photos'; 