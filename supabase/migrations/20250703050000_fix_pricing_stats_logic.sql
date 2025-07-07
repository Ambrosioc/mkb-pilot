-- Migration pour corriger la logique des statistiques de pricing
-- 1. Ajouter posted_by_user dans advertisements
-- 2. Renommer posted_by_user en add_by_user dans cars_v2

-- 1. Ajouter la colonne posted_by_user dans advertisements
ALTER TABLE advertisements 
ADD COLUMN IF NOT EXISTS posted_by_user UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Mettre à jour posted_by_user avec la valeur de user_id de cars_v2 pour les annonces existantes
UPDATE advertisements 
SET posted_by_user = cars_v2.user_id
FROM cars_v2 
WHERE advertisements.car_id = cars_v2.id 
AND advertisements.posted_by_user IS NULL;

-- 3. Renommer posted_by_user en add_by_user dans cars_v2
ALTER TABLE cars_v2 
RENAME COLUMN posted_by_user TO add_by_user;

-- 4. Ajouter des index pour optimiser les requêtes de statistiques
CREATE INDEX IF NOT EXISTS idx_advertisements_posted_by_user ON advertisements(posted_by_user);
CREATE INDEX IF NOT EXISTS idx_advertisements_created_at ON advertisements(created_at);
CREATE INDEX IF NOT EXISTS idx_advertisements_car_id ON advertisements(car_id);
CREATE INDEX IF NOT EXISTS idx_cars_v2_add_by_user ON cars_v2(add_by_user);

-- 5. Créer une fonction pour calculer les statistiques de véhicules postés
CREATE OR REPLACE FUNCTION get_posted_vehicles_stats(
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_end_date TIMESTAMPTZ DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
    total_posted INTEGER,
    posted_today INTEGER,
    posted_this_month INTEGER,
    avg_posts_per_user NUMERIC,
    best_pricer_user_id UUID,
    best_pricer_total INTEGER,
    user_posted_today INTEGER,
    user_posted_this_month INTEGER
) AS $$
BEGIN
    -- Dates par défaut
    IF p_start_date IS NULL THEN
        p_start_date := date_trunc('month', CURRENT_DATE);
    END IF;
    
    IF p_end_date IS NULL THEN
        p_end_date := CURRENT_DATE + INTERVAL '1 day';
    END IF;
    
    -- Total des véhicules postés dans la période
    SELECT COUNT(*) INTO total_posted
    FROM advertisements a
    WHERE a.created_at >= p_start_date 
    AND a.created_at < p_end_date
    AND (p_user_id IS NULL OR a.posted_by_user = p_user_id);
    
    -- Véhicules postés aujourd'hui
    SELECT COUNT(*) INTO posted_today
    FROM advertisements a
    WHERE a.created_at >= date_trunc('day', CURRENT_DATE)
    AND a.created_at < date_trunc('day', CURRENT_DATE) + INTERVAL '1 day'
    AND (p_user_id IS NULL OR a.posted_by_user = p_user_id);
    
    -- Véhicules postés ce mois
    SELECT COUNT(*) INTO posted_this_month
    FROM advertisements a
    WHERE a.created_at >= date_trunc('month', CURRENT_DATE)
    AND a.created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
    AND (p_user_id IS NULL OR a.posted_by_user = p_user_id);
    
    -- Moyenne des posts par utilisateur ce mois
    SELECT COALESCE(AVG(posts_count), 0) INTO avg_posts_per_user
    FROM (
        SELECT posted_by_user, COUNT(*) as posts_count
        FROM advertisements a
        WHERE a.created_at >= date_trunc('month', CURRENT_DATE)
        AND a.created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
        AND a.posted_by_user IS NOT NULL
        GROUP BY posted_by_user
    ) user_posts;
    
    -- Meilleur priceur du mois
    SELECT 
        posted_by_user,
        posts_count
    INTO 
        best_pricer_user_id,
        best_pricer_total
    FROM (
        SELECT 
            posted_by_user, 
            COUNT(*) as posts_count
        FROM advertisements a
        WHERE a.created_at >= date_trunc('month', CURRENT_DATE)
        AND a.created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
        AND a.posted_by_user IS NOT NULL
        GROUP BY posted_by_user
        ORDER BY posts_count DESC
        LIMIT 1
    ) best_pricer;
    
    -- Statistiques utilisateur spécifique
    IF p_user_id IS NOT NULL THEN
        -- Posts de l'utilisateur aujourd'hui
        SELECT COUNT(*) INTO user_posted_today
        FROM advertisements a
        WHERE a.posted_by_user = p_user_id
        AND a.created_at >= date_trunc('day', CURRENT_DATE)
        AND a.created_at < date_trunc('day', CURRENT_DATE) + INTERVAL '1 day';
        
        -- Posts de l'utilisateur ce mois
        SELECT COUNT(*) INTO user_posted_this_month
        FROM advertisements a
        WHERE a.posted_by_user = p_user_id
        AND a.created_at >= date_trunc('month', CURRENT_DATE)
        AND a.created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month';
    END IF;
    
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Créer une fonction pour lister les véhicules à poster
CREATE OR REPLACE FUNCTION get_vehicles_to_post()
RETURNS TABLE (
    car_id BIGINT,
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

-- 7. Créer une fonction pour lister les véhicules postés avec pagination
CREATE OR REPLACE FUNCTION get_posted_vehicles(
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_end_date TIMESTAMPTZ DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 10,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id BIGINT,
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

-- 8. Ajouter des commentaires pour documenter les changements
COMMENT ON COLUMN advertisements.posted_by_user IS 'Utilisateur qui a effectivement publié l''annonce';
COMMENT ON COLUMN cars_v2.add_by_user IS 'Utilisateur qui a ajouté le véhicule dans le stock';
COMMENT ON FUNCTION get_posted_vehicles_stats IS 'Calcule les statistiques des véhicules réellement postés';
COMMENT ON FUNCTION get_vehicles_to_post IS 'Liste les véhicules disponibles qui n''ont pas encore été postés';
COMMENT ON FUNCTION get_posted_vehicles IS 'Liste les véhicules postés avec pagination et filtres'; 