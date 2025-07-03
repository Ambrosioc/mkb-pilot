-- Add pricing functions for the dashboard

-- Function to get average posts per user this month
CREATE OR REPLACE FUNCTION get_average_posts_per_user_this_month()
RETURNS DECIMAL AS $$
DECLARE
    avg_posts DECIMAL;
BEGIN
    SELECT COALESCE(AVG(posts_count), 0) INTO avg_posts
    FROM (
        SELECT COUNT(*) as posts_count
        FROM cars_v2
        WHERE created_at >= date_trunc('month', CURRENT_DATE)
        AND created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
        GROUP BY created_by
    ) user_posts;
    
    RETURN avg_posts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get best pricer this month
CREATE OR REPLACE FUNCTION get_best_pricer_this_month()
RETURNS TABLE(user_id UUID, total BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.created_by as user_id,
        COUNT(*) as total
    FROM cars_v2 c
    WHERE c.created_at >= date_trunc('month', CURRENT_DATE)
    AND c.created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
    AND c.created_by IS NOT NULL
    GROUP BY c.created_by
    ORDER BY total DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON FUNCTION get_average_posts_per_user_this_month() IS 'Returns the average number of cars posted per user in the current month';
COMMENT ON FUNCTION get_best_pricer_this_month() IS 'Returns the user who posted the most cars in the current month'; 