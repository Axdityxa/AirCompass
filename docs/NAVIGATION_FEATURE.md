# Route Navigation Feature

This document explains the implementation of real-time navigation in the AirCompass app, which guides users along routes with good air quality.

## Overview

The Route Navigation feature provides turn-by-turn directions and real-time air quality information as users follow their chosen route. It builds upon the Explore screen's route generation functionality but offers an interactive guidance experience.

## Features

1. **Real-time Navigation**
   - Turn-by-turn directions with visual cues
   - Progress tracking along the route
   - Estimated time and distance remaining
   - Live air quality monitoring at user's current position

2. **Interactive Map View**
   - Follows user's location in real-time
   - Displays entire route with start and destination markers
   - Option to manually control map view or auto-follow

3. **Navigation Instructions**
   - Clear, concise directional guidance
   - Context-aware instructions based on route segments
   - Visual indication of upcoming turns or actions

4. **Air Quality Information**
   - Real-time AQI display at current location
   - Color-coded indicators for air quality levels
   - Category labels (Good, Moderate, etc.)

## Technical Implementation

### Components

- **RouteNavigation**: Main component handling the navigation experience
- **Navigation Instructions**: Animated instructions panel with real-time updates
- **Progress Indicator**: Visual progress bar showing completion percentage
- **Info Panel**: Bottom panel with distance, time, and AQI information

### Location Tracking

The navigation system uses Expo's Location API to:
- Track user position in real-time with high accuracy
- Calculate proximity to route points
- Determine current route segment
- Update navigation data based on position changes

### Navigation Logic

1. **Route Proximity Detection**
   - Determines closest point on route to user's current position
   - Calculates progress percentage based on position
   - Updates current route segment for appropriate instructions

2. **ETA Calculation**
   - Dynamically updates time remaining based on:
     - Distance to destination
     - User's current speed
     - Selected transport mode (walking, jogging, cycling)

3. **Air Quality Monitoring**
   - Retrieves AQI data at current location
   - Shows real-time air quality information
   - Updates color coding based on AQI levels

## UI/UX Considerations

1. **Top Navigation Bar**
   - Close button to exit navigation
   - Current mode indicator (Walking, Jogging, Cycling)
   - Toggle for map follow mode

2. **Instruction Panel**
   - Semi-transparent overlay with gradient background
   - Large, readable text with appropriate contrast
   - Mode-specific icon for visual association

3. **Bottom Info Panel**
   - Progress bar showing completion percentage
   - Time remaining with dynamic updates
   - Distance traveled/remaining
   - Current air quality with color-coded indicators

4. **Exit Handling**
   - Confirmation dialog to prevent accidental exits
   - Clear cancel and confirm options
   - Returns to route preview on exit

## Integration

The navigation feature is integrated with the Explore screen through the "Start Route" button. When pressed:

1. Location permissions are verified
2. The RouteNavigation component is rendered
3. Real-time location tracking begins
4. Turn-by-turn directions are provided based on the generated route

## Future Enhancements

1. **Voice Guidance**
   - Spoken turn-by-turn instructions
   - Air quality alerts

2. **Alternative Routes**
   - On-the-fly route adjustments based on changing air quality
   - Detour options for areas with poor air quality

3. **Health Integration**
   - Connect with health monitoring devices
   - Adjust routes based on health data and air quality

4. **Offline Support**
   - Cache route and map data for offline use
   - Limited functionality without internet connection

5. **Sharing**
   - Share current route and progress with others
   - Emergency contact notifications

## Usage Example

```tsx
// Example of using the RouteNavigation component
<RouteNavigation
  route={routeData}
  transportMode="walking"
  onExit={handleNavigationExit}
/>
``` 