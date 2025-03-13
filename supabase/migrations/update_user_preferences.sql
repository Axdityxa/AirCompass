-- Rename the column from aqi_preference to preferred_aqi_category if it exists
DO $$
BEGIN
    -- Check if the column exists
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'user_preferences'
        AND column_name = 'aqi_preference'
    ) THEN
        -- Rename the column
        ALTER TABLE user_preferences RENAME COLUMN aqi_preference TO preferred_aqi_category;
    END IF;
END $$; 