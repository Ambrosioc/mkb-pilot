-- Update image URLs to use images.mkbautomobile.com subdomain
-- Migration: 20250703020000_update_image_urls

-- Update advertisements table to replace mkbautomobile.com with images.mkbautomobile.com
UPDATE advertisements
SET photos = array(
  SELECT replace(unnest(photos), 'mkbautomobile.com', 'images.mkbautomobile.com')
)
WHERE photos IS NOT NULL;

-- Add comment to document the change
COMMENT ON COLUMN advertisements.photos IS 'Array of photo URLs pointing to images.mkbautomobile.com subdomain';

-- Log the number of updated records
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % advertisement records with new image URLs', updated_count;
END $$; 