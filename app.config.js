import 'dotenv/config';

export default {
  name: "AirCompass",
  slug: "aircompass",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#b3c7ff"
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.axdityxa.aircompass",
    infoPlist: {
      NSLocationWhenInUseUsageDescription: "We need your location to provide accurate air quality data for your area.",
      NSLocationAlwaysAndWhenInUseUsageDescription: "We need your location to provide accurate air quality data for your area and send you alerts when air quality deteriorates.",
      UIBackgroundModes: ["location", "fetch", "remote-notification"],
      BGTaskSchedulerPermittedIdentifiers: [
        "background-fetch-aqi",
        "background-location-task"
      ]
    },

    icon: {
      dark: "./assets/images/ios-dark.png",
      light: "./assets/images/ios-light.png",
      tinted: "./assets/images/ios-tinted.png"
    }
  },
  android: {
    package: "com.axdityxa.aircompass",
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      monochromeImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    permissions: [
      "ACCESS_COARSE_LOCATION",
      "ACCESS_FINE_LOCATION",
      "ACCESS_BACKGROUND_LOCATION",
      "RECEIVE_BOOT_COMPLETED",
      "WAKE_LOCK"
    ]
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png"
  },
  plugins: [
    "expo-router",
    [
      "expo-location",
      {
        "locationAlwaysAndWhenInUsePermission": "Allow AirCompass to use your location to provide accurate air quality data and alerts.",
        "isAndroidBackgroundLocationEnabled": true
      }
    ],
    [
      "expo-notifications",
      {
        "icon": "./assets/images/notification-icon.png",
        "color": "#1e88e5"
      }
    ],
    [
      "expo-splash-screen",
      {
        "image": "./assets/images/splash-icon-dark.png",
        "imageWidth": 200,
        "resizeMode": "contain",
        "backgroundColor": "#ffffff",
        "dark": {
          "image": "./assets/images/splash-icon-light.png",
          "backgroundColor": "#000000"
        }
      }
    ],
    [
      "expo-task-manager",
      {
        "backgroundTaskName": "background-fetch-aqi",
        "backgroundTaskIdentifier": "background-fetch-aqi",
        "backgroundTaskPeriod": 15, // Minutes
        "backgroundTaskTimeout": 30 // Seconds
      }
    ]
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    EXPO_PUBLIC_IQAIR_API_KEY: process.env.EXPO_PUBLIC_IQAIR_API_KEY || process.env.IQAIR_API_KEY,
    EXPO_PUBLIC_WAQI_API_KEY: process.env.EXPO_PUBLIC_WAQI_API_KEY || process.env.WAQI_API_KEY,
    
    // Important! Explicitly include Supabase variables here to ensure they are bundled in production
    SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    
    // Add a developer debug mode flag - set to true to help with troubleshooting
    DEBUG_MODE: process.env.DEBUG_MODE === 'true' || false,
    
    eas: {
      projectId: "cd744ef1-35ba-4387-8fae-9d39704d449a"
    }
  },
  // Make sure the Supabase environment variables are explicitly defined as public
  // This ensures they are properly included in the production build
  publicRuntimeConfig: {
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  }
}; 