# AirCompass 🍃

AirCompass is a mobile app that helps users monitor air quality in their area and receive alerts when air quality changes.

## Features

- Beautiful launch screen with modern UI
- Location permission request to provide accurate air quality data
- Smart Alerts for air quality changes
- Real-time air quality monitoring

## Setup

1. Make sure you have Expo CLI installed:
```
npm install -g expo-cli
```

2. Install dependencies:
```
npm install
```

3. Replace the placeholder notification icon:
   - Create a proper PNG icon at `assets/images/notification-icon.png`
   - Recommended size: 96x96 pixels for Android

4. Start the development server:
```
npm start
```

## Database Setup

AirCompass uses Supabase for authentication and data storage. You need to set up the following tables:

1. Log in to your Supabase dashboard and navigate to the SQL Editor
2. Create the `users` table and trigger:
```sql
-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user function on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

3. Create the `user_preferences` table:
```sql
-- Create user_preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  preferred_aqi_category INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT user_preferences_user_id_key UNIQUE (user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user_preferences table
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" ON public.user_preferences
  FOR DELETE USING (auth.uid() = user_id);
```

## Troubleshooting

### User Preferences Column Name Issue

If you encounter errors like `column user_preferences.preferred_aqi_category does not exist`, run this SQL to fix the column name:

```sql
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
    END IF;
END $$;
```

### User Creation Issues

If you encounter issues with user preferences not being saved, it might be because the user record doesn't exist in the `users` table. You can manually insert a user with:

```sql
INSERT INTO public.users (id, email)
VALUES ('your-auth-user-id', 'your-email@example.com');
```

## Development

```
# Start the development server
npx expo start --clear

# Start with a specific platform
npx expo start --android
npx expo start --ios
npx expo start --web
```

## Permissions

The app requires the following permissions:

- **Location**: To provide accurate air quality data for your current location
- **Notifications**: To send alerts when air quality changes

## Technologies Used

- React Native
- Expo
- TypeScript
- OpenWeatherMap API for air quality data
