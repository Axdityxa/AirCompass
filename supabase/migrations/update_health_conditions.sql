-- Add other_health_conditions column to store user-specified conditions
-- and has_explicitly_set_conditions flag to track if user has completed the form
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS other_health_conditions TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS has_explicitly_set_conditions BOOLEAN DEFAULT FALSE; 