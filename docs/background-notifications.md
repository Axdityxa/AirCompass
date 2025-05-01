# AirCompass Background Notifications Guide

## Overview

AirCompass uses a background task system for monitoring air quality and sending notifications when the app is not actively being used. This document explains how this system works and how to use it effectively.

## Types of Notifications

### 1. User-visible Notifications

These are standard notifications with titles and bodies that appear in the notification tray.

**When to use:** Use these for notifying users of something they should see and potentially act on.

**Example payload:**
```json
{
  "to": "ExponentPushToken[xxxxxxxxxxxxxxxx]",
  "title": "Air Quality Alert",
  "body": "AQI levels in your area have exceeded your threshold!",
  "data": {
    "type": "aqi_alert",
    "value": 150
  },
  "sound": "default"
}
```

### 2. Background Task Notifications

These are data-only notifications that trigger a background process but don't show anything to the user. They're used to perform checks and potentially trigger user-visible notifications.

**When to use:** For periodic background checks or data updates when the app is not in use.

**Example payload:**
```json
{
  "to": "ExponentPushToken[xxxxxxxxxxxxxxxx]",
  "data": {
    "type": "aqi_check",
    "timestamp": 1718298366314
  },
  "_contentAvailable": true,
  "priority": "high"
}
```

> **Important**: For iOS, you must include `"_contentAvailable": true` to trigger background processing.

## Implementation Details

### Background Task Registration

The app uses the TaskManager from Expo to register a background task that runs when a data-only notification is received:

```typescript
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async ({ data, error }) => {
  // Process background notification data
  // Check AQI and send a user-visible notification if needed
});

// Register the task
await Notifications.registerTaskAsync(BACKGROUND_FETCH_TASK);
```

### Technical Limitations

1. **Firebase Messaging Constraints**:
   - Only data-only notifications will trigger the background task
   - Regular notifications with title/body will not trigger background processing
   
2. **iOS Constraints**:
   - Requires `"_contentAvailable": true` in the notification payload
   - May have delayed processing due to iOS background execution limitations
   
3. **Android Constraints**:
   - On newer Android versions (13+), apps need notification permission
   - Background execution may be limited on some devices with aggressive battery optimization

## Testing Background Notifications

The app includes a testing component in the Notification Settings screen that allows you to:

1. Send test visible notifications
2. Send test background notifications

When testing, check the app logs to see if the background task is running as expected.

## Troubleshooting

If background notifications aren't working:

1. **Check Permissions**:
   - Ensure notification permissions are granted
   - On Android 13+, ensure notification permission is explicitly granted

2. **Check Background Task Registration**:
   - Verify the task is registered using `TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK)`

3. **Check Payloads**:
   - For background tasks, ensure you're sending data-only notifications
   - For iOS, make sure `"_contentAvailable": true` is included

4. **Debug Android Battery Optimization**:
   - Some devices may restrict background processing
   - Consider instructing users to disable battery optimization for the app 