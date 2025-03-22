import * as Location from 'expo-location';
import { LatLng } from 'react-native-maps';

/**
 * Route utility functions for calculating distances, ETAs, and related route information
 */

interface RoutePoint extends LatLng {
  instruction?: string;
  distance?: number;
  time?: number;
  aqi?: number;
}

export interface RouteSegment {
  points: RoutePoint[];
  instruction: string;
  distance: number;
  time: number;
  averageAqi?: number;
}

/**
 * Calculate distance between two coordinates in meters
 * Uses Haversine formula
 */
export function calculateDistance(point1: LatLng, point2: LatLng): number {
  const R = 6371e3; // Earth radius in meters
  const lat1Rad = (point1.latitude * Math.PI) / 180;
  const lat2Rad = (point2.latitude * Math.PI) / 180;
  const deltaLat = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const deltaLon = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Find the closest point on a route to the given location
 */
export function findClosestPointOnRoute(
  location: Location.LocationObject | LatLng,
  routePoints: RoutePoint[]
): { point: RoutePoint; distance: number; index: number } {
  if (routePoints.length === 0) {
    throw new Error('Route points array is empty');
  }

  const userLocation: LatLng = {
    latitude: 'coords' in location ? location.coords.latitude : location.latitude,
    longitude: 'coords' in location ? location.coords.longitude : location.longitude,
  };

  let closestPoint = routePoints[0];
  let minDistance = calculateDistance(userLocation, closestPoint);
  let closestIndex = 0;

  for (let i = 1; i < routePoints.length; i++) {
    const distance = calculateDistance(userLocation, routePoints[i]);
    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = routePoints[i];
      closestIndex = i;
    }
  }

  return { point: closestPoint, distance: minDistance, index: closestIndex };
}

/**
 * Calculate estimated time of arrival based on distance and transport mode
 * @param distanceMeters Distance in meters
 * @param transportMode Transport mode (walking, jogging, cycling)
 * @returns Estimated time in seconds
 */
export function calculateETA(distanceMeters: number, transportMode: string): number {
  // Average speeds in meters per second
  const speeds = {
    walking: 1.4, // ~5 km/h
    jogging: 2.8, // ~10 km/h
    cycling: 4.2, // ~15 km/h
  };

  const speedMps = speeds[transportMode as keyof typeof speeds] || speeds.walking;
  return distanceMeters / speedMps;
}

/**
 * Format duration in seconds to human-readable string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes} min`;
  }
}

/**
 * Format distance in meters to human-readable string
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  } else {
    return `${(meters / 1000).toFixed(1)}km`;
  }
}

/**
 * Calculate progress percentage along a route
 * @param currentIndex Current index in route points array
 * @param totalPoints Total number of points in route
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(currentIndex: number, totalPoints: number): number {
  if (totalPoints <= 1) return 0;
  return Math.min(100, Math.max(0, (currentIndex / (totalPoints - 1)) * 100));
}

/**
 * Get color for AQI value
 * @param aqi Air Quality Index value
 * @returns Hex color code
 */
export function getAqiColor(aqi: number): string {
  if (aqi <= 50) return '#00E400'; // Good
  if (aqi <= 100) return '#FFFF00'; // Moderate
  if (aqi <= 150) return '#FF7E00'; // Unhealthy for Sensitive Groups
  if (aqi <= 200) return '#FF0000'; // Unhealthy
  if (aqi <= 300) return '#99004C'; // Very Unhealthy
  return '#7E0023'; // Hazardous
}

/**
 * Get category for AQI value
 * @param aqi Air Quality Index value
 * @returns Category name
 */
export function getAqiCategory(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

/**
 * Divide a route into segments based on instructions
 * @param points Array of route points
 * @returns Array of route segments
 */
export function createRouteSegments(points: RoutePoint[]): RouteSegment[] {
  if (points.length === 0) return [];

  const segments: RouteSegment[] = [];
  let currentSegment: RouteSegment = {
    points: [points[0]],
    instruction: points[0].instruction || 'Start',
    distance: 0,
    time: 0,
    averageAqi: points[0].aqi,
  };

  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    const prevPoint = points[i - 1];
    
    // Calculate distance between consecutive points
    const segmentDistance = calculateDistance(prevPoint, point);
    
    // If this point has a new instruction, start a new segment
    if (point.instruction && point.instruction !== currentSegment.instruction) {
      // Finalize current segment
      segments.push(currentSegment);
      
      // Start new segment
      currentSegment = {
        points: [point],
        instruction: point.instruction,
        distance: 0,
        time: point.time || 0,
        averageAqi: point.aqi,
      };
    } else {
      // Add point to current segment
      currentSegment.points.push(point);
      currentSegment.distance += segmentDistance;
      
      // Update average AQI
      if (point.aqi && currentSegment.averageAqi) {
        currentSegment.averageAqi = 
          (currentSegment.averageAqi * (currentSegment.points.length - 1) + point.aqi) / 
          currentSegment.points.length;
      }
    }
    
    // If this is the last point and we haven't added the final segment
    if (i === points.length - 1 && currentSegment.points.length > 0) {
      segments.push(currentSegment);
    }
  }

  return segments;
}

/**
 * Get the next instruction based on current position
 * @param currentIndex Current index in route points array
 * @param routePoints Array of route points
 * @returns Instruction for next action
 */
export function getNextInstruction(currentIndex: number, routePoints: RoutePoint[]): string {
  if (!routePoints.length || currentIndex >= routePoints.length - 1) {
    return "You've reached your destination";
  }

  // Look ahead for the next instruction
  for (let i = currentIndex + 1; i < routePoints.length; i++) {
    if (routePoints[i].instruction) {
      return routePoints[i].instruction || '';
    }
  }

  return "Continue straight";
} 