-- Add health conditions columns to user_preferences table
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS has_respiratory_issues BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_cardiovascular_disease BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_cancer_risk BOOLEAN DEFAULT FALSE;

-- Create the function if it doesn't exist (safety check)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update triggers for timestamp management
DROP TRIGGER IF EXISTS handle_updated_at ON public.user_preferences;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at(); 