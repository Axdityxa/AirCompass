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
      NSLocationAlwaysAndWhenInUseUsageDescription: "We need your location to provide accurate air quality data for your area.",
      UIBackgroundModes: ["location", "fetch"]
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
      "ACCESS_BACKGROUND_LOCATION"
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
        "locationAlwaysAndWhenInUsePermission": "Allow AirCompass to use your location to provide accurate air quality data."
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
    ]
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    IQAIR_API_KEY: process.env.IQAIR_API_KEY,
    WAQI_API_KEY: process.env.WAQI_API_KEY,
    eas: {
      projectId: "cd744ef1-35ba-4387-8fae-9d39704d449a"
    }
  }
}; 