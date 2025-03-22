# Explore Screen: Clean Air Routing

This document explains the implementation of the Explore screen in the AirCompass app, which allows users to find routes with good air quality for different modes of transportation.

## Overview

The Explore screen lets users select a transportation mode (Walking, Jogging, or Cycling) and generates a route from their current location to a destination with optimal air quality along the path.

## Features

1. **Mode Selection**
   - Choose from Walking, Jogging, or Cycling
   - Each mode has specific speed parameters for accurate time estimation
   - Visually distinct with different colors and icons

2. **Air Quality Optimized Routes**
   - Routes are generated with preference for paths with good air quality
   - AQI (Air Quality Index) is displayed for the route
   - Users can see both distance and estimated duration

3. **Interactive Map**
   - Displays the route with a colored polyline
   - Shows start (A) and destination (B) markers
   - Map is centered on the route for optimal viewing

4. **Location Services**
   - Uses the device's current location as the starting point
   - Handles location permission requests
   - Provides feedback when location services are unavailable

## Technical Implementation

### Route Generation Algorithm

The route generation process:

1. Gets the user's current location
2. Generates a destination point (in a real app, this would be user-selected)
3. Processes route request through the `RoutesService`
4. Service calculates multiple possible routes and scores them based on AQI values
5. Returns the route with the best overall air quality

### Data Flow

```
User selects mode → Get current location → Generate destination →
Calculate route with optimal AQI → Display on map with route details
```

### AQI Scoring

- Routes are scored based on the average AQI along the path
- Lower scores indicate better air quality
- The route also considers:
  - Total distance
  - Traffic conditions (when available)
  - Elevation changes (for cycling especially)

## UI/UX Considerations

1. **Loading States**
   - Clear loading indicators during route generation
   - Descriptive text to inform users of the process

2. **Error Handling**
   - Permissions handling for location services
   - Graceful error messages with recovery options
   - Network error handling

3. **Accessibility**
   - High contrast colors
   - Screen reader support
   - Large touch targets

## Future Enhancements

1. Allow users to select custom destinations
2. Add route alternatives with different AQI/time tradeoffs
3. Implement real-time AQI data updates
4. Add turn-by-turn navigation
5. Enable saving favorite routes
6. Add historical AQI data for planning future activities 