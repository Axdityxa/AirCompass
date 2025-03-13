-- Add preferred_aqi_category column if it doesn't exist
DO $$
BEGIN
    -- Check if the column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'user_preferences'
        AND column_name = 'preferred_aqi_category'
    ) THEN
        -- Add the column
        ALTER TABLE user_preferences ADD COLUMN preferred_aqi_category INTEGER;
        
        -- If aqi_preference exists, copy data from it
        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'user_preferences'
            AND column_name = 'aqi_preference'
        ) THEN
            UPDATE user_preferences SET preferred_aqi_category = aqi_preference;
        END IF;
    END IF;
END $$; 