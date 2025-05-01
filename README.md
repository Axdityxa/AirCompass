# AirCompass 🍃

AirCompass is a mobile app that helps users monitor air quality in their area and receive alerts when air quality changes.

## Features

- **Real-time Air Quality Monitoring**: Get up-to-date AQI information for your location
- **Smart Alerts & Notifications**: Receive alerts when air quality exceeds your preferred threshold
- **Background Monitoring**: Continues to monitor air quality even when the app is closed
- **Customizable Settings**: Set your preferred alert thresholds and notification frequency
- **Quiet Hours**: Prevent notifications during specific hours
- **Location-based Updates**: Automatically updates as you change locations
- **Beautiful UI**: Modern, clean interface with visual indicators of air quality

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Backend**: Supabase for authentication and data storage
- **AQI Data**: IQAir and WAQI API integration
- **Notifications**: Expo Notifications with background tasks
- **Storage**: AsyncStorage for local data persistence
- **Location**: Expo Location for geolocation services

## Setup

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your mobile device (for development)

### Environment Variables

Create a `.env` file in the project root with the following variables:

```
EXPO_PUBLIC_IQAIR_API_KEY=your_iqair_api_key
EXPO_PUBLIC_WAQI_API_KEY=your_waqi_api_key
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_PROJECT_ID=your_expo_project_id
```

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/aircompass.git
   cd aircompass
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm start
   ```

4. Use Expo Go to scan the QR code and run the app on your device

### Running with Expo Go

For standard development (without background notifications):
```
npm run start-expo-go
```

### Development Build (Required for background notifications)

To test full functionality including background notifications:
```
npx eas build --profile development --platform all
```

## Docker Setup

To run the project using Docker:

1. Build the Docker image
   ```
   docker build -t aircompass .
   ```

2. Run the container
   ```
   docker run -p 19000:19000 -p 19001:19001 -p 19002:19002 -e REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.x aircompass
   ```
   (Replace 192.168.1.x with your machine's IP address)

### Using docker-compose

```
docker-compose up
```

### Docker for Teammates

1. Install Docker Desktop
2. Clone the repository
3. Update the `REACT_NATIVE_PACKAGER_HOSTNAME` in docker-compose.yml to your local IP address
4. Run `docker-compose up`
5. Use Expo Go on your mobile device to scan the QR code

## Notification System

AirCompass includes a sophisticated notification system with:

1. **Threshold-based Alerts**: Get notifications when AQI exceeds your preferred threshold
2. **Frequency Settings**: Choose how often to receive notifications (Low: 1-2/day, Normal: ~4/day, High: ~12/day)
3. **Quiet Hours**: Set times when notifications should be silenced
4. **Background Monitoring**: AQI checks occur even when the app is closed
5. **Battery-Efficient Design**: Optimized to minimize battery usage while maintaining alerts

> Note: Background notifications require a development build and will not work in Expo Go

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

### Background Notifications Not Working

1. Make sure you're using a development build, not Expo Go
2. Ensure all required permissions are granted in device settings
3. Check that "Allow background activity" is enabled in app settings
4. Verify that notifications are enabled in device settings
5. Make sure "battery optimization" is disabled for the app in device settings

## License

This project is licensed under the MIT License - see the LICENSE file for details.

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
