# AirCompass

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

## Permissions

The app requires the following permissions:

- **Location**: To provide accurate air quality data for your current location
- **Notifications**: To send alerts when air quality changes

## Technologies Used

- React Native
- Expo
- TypeScript
- OpenWeatherMap API for air quality data