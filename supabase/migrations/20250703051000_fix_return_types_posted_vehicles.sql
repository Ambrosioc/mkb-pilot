-- Correction des types de retour pour les fonctions de statistiques de pricing
-- get_vehicles_to_post et get_posted_vehicles : car_id et id doivent être UUID

DROP FUNCTION IF EXISTS get_vehicles_to_post();
CREATE OR REPLACE FUNCTION get_vehicles_to_post()
RETURNS TABLE (
    car_id UUID,
    reference TEXT,
    brand_name TEXT,
    model_name TEXT,
    year INTEGER,
    color TEXT,
    price NUMERIC,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as car_id,
        c.reference,
        b.name as brand_name,
        m.name as model_name,
        c.year,
        c.color,
        c.price,
        c.status
    FROM cars_v2 c
    LEFT JOIN brands b ON c.brand_id = b.id
    LEFT JOIN models m ON c.model_id = m.id
    WHERE c.status = 'disponible'
    AND NOT EXISTS (
        SELECT 1 FROM advertisements a 
        WHERE a.car_id = c.id
    )
    ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
    posted_by_user_name TEXT
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
        CONCAT(u.prenom, ' ', u.nom) as posted_by_user_name
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