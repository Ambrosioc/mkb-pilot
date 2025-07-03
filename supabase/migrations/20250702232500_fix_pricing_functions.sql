-- Fix pricing functions to work without created_by column
-- Since the table structure doesn't include user tracking, we'll return default values

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_average_posts_per_user_this_month();
DROP FUNCTION IF EXISTS get_best_pricer_this_month();

-- Function to get average posts per user this month (returns 0 for now)
CREATE OR REPLACE FUNCTION get_average_posts_per_user_this_month()
RETURNS DECIMAL AS $$
BEGIN
    -- Since we don't have user tracking in cars_v2, return 0
    -- This can be updated when user tracking is added
    RETURN 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get best pricer this month (returns null for now)
CREATE OR REPLACE FUNCTION get_best_pricer_this_month()
RETURNS TABLE(user_id UUID, total BIGINT) AS $$
BEGIN
    -- Since we don't have user tracking in cars_v2, return empty result
    -- This can be updated when user tracking is added
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON FUNCTION get_average_posts_per_user_this_month() IS 'Returns the average number of cars posted per user in the current month (currently returns 0 as user tracking is not implemented)';
COMMENT ON FUNCTION get_best_pricer_this_month() IS 'Returns the user who posted the most cars in the current month (currently returns null as user tracking is not implemented)'; 