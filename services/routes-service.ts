import { supabase } from '@/lib/supabase';

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface RouteRequest {
  origin: Coordinate;
  destination: Coordinate;
  transportMode: 'walking' | 'jogging' | 'cycling';
  preferLowAQI?: boolean;
}

export interface RoutePoint extends Coordinate {
  aqi?: number;
  pollutant?: string;
  instruction?: string;
  distance?: number;
  time?: number;
}

export interface Route {
  origin: RoutePoint;
  destination: RoutePoint;
  points: RoutePoint[];
  distance?: number; // in meters
  duration?: number; // in seconds
  averageAqi?: number;
  segments?: RouteSegment[];
}

export interface RouteSegment {
  instruction: string;
  points: RoutePoint[];
  distance: number;
  time: number;
  aqi?: number;
}

export interface RouteResponse {
  origin: RoutePoint;
  destination: RoutePoint;
  points: RoutePoint[];
  distance: string;
  duration: string;
  aqi: string;
  averageAQI: number;
  totalDistance: number; // in meters
  totalDuration: number; // in seconds
  route: Route; // Enhanced route object
}

/**
 * Service to generate routes optimized for good air quality
 */
export class RoutesService {
  /**
   * Generate a route between two points optimized for air quality
   * @param request Route request parameters
   * @returns Promise with route information
   */
  static async generateRoute(request: RouteRequest): Promise<RouteResponse> {
    try {
      // In a real application, we would:
      // 1. Call a routing API like Google Directions or MapBox
      // 2. Get air quality data along the route from our Supabase database
      // 3. Calculate alternate routes with better air quality if available
      // 4. Return the optimized route

      // For this demo, we'll return a mock response after a short delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate initial points for our mocked route
      const points = this.generateRoutePoints(request);
      
      // Add navigation instructions to the route points
      const pointsWithInstructions = this.addNavigationInstructions(points, request.transportMode);
      
      // Calculate average AQI
      const aqiValues = pointsWithInstructions.map(p => p.aqi || 0);
      const averageAQI = aqiValues.reduce((sum, val) => sum + val, 0) / aqiValues.length;
      
      // Get AQI category
      const aqiCategory = this.getAQICategory(averageAQI);
      
      // Calculate approximate distance and duration based on transport mode
      const totalDistanceMeters = this.calculateTotalDistance(pointsWithInstructions);
      const durationSeconds = this.calculateDuration(totalDistanceMeters, request.transportMode);
      
      // Create route segments
      const segments = this.createRouteSegments(pointsWithInstructions);
      
      // Create enhanced route object
      const route: Route = {
        origin: pointsWithInstructions[0],
        destination: pointsWithInstructions[pointsWithInstructions.length - 1],
        points: pointsWithInstructions,
        distance: totalDistanceMeters,
        duration: durationSeconds,
        averageAqi: averageAQI,
        segments
      };
      
      return {
        origin: { ...request.origin, aqi: pointsWithInstructions[0].aqi },
        destination: { ...request.destination, aqi: pointsWithInstructions[pointsWithInstructions.length - 1].aqi },
        points: pointsWithInstructions,
        distance: this.formatDistance(totalDistanceMeters),
        duration: this.formatDuration(durationSeconds),
        aqi: `${aqiCategory} (${Math.round(averageAQI)} AQI)`,
        averageAQI,
        totalDistance: totalDistanceMeters,
        totalDuration: durationSeconds,
        route
      };
    } catch (error) {
      console.error('Error generating route:', error);
      throw error;
    }
  }
  
  /**
   * Generate route points between origin and destination
   */
  private static generateRoutePoints(request: RouteRequest): RoutePoint[] {
    const points: RoutePoint[] = [
      { ...request.origin, aqi: 35 },
    ];
    
    // Generate additional points between origin and destination
    const latDiff = request.destination.latitude - request.origin.latitude;
    const lngDiff = request.destination.longitude - request.origin.longitude;
    const steps = 20; // Increased number of points for more realistic routes
    
    for (let i = 1; i < steps - 1; i++) {
      const fraction = i / steps;
      
      // Add more randomness for a more realistic path
      // Create a slight curve to the route for realism
      const progress = i / (steps - 1);
      const curveStrength = 0.0008;
      const curve = Math.sin(progress * Math.PI) * curveStrength;
      
      // Direction perpendicular to straight line
      const perpLat = -lngDiff;
      const perpLng = latDiff;
      const perpLength = Math.sqrt(perpLat * perpLat + perpLng * perpLng);
      
      // Normalized perpendicular vector
      const normPerpLat = perpLength ? perpLat / perpLength : 0;
      const normPerpLng = perpLength ? perpLng / perpLength : 0;
      
      // Additional random jitter for natural appearance
      const jitterStrength = 0.0002;
      const jitterLat = (Math.random() - 0.5) * jitterStrength;
      const jitterLng = (Math.random() - 0.5) * jitterStrength;
      
      points.push({
        latitude: request.origin.latitude + (latDiff * fraction) + (normPerpLat * curve) + jitterLat,
        longitude: request.origin.longitude + (lngDiff * fraction) + (normPerpLng * curve) + jitterLng,
        aqi: this.generateAQIForPoint(fraction),
      });
    }
    
    points.push({ ...request.destination, aqi: 28 });
    
    return points;
  }
  
  /**
   * Generate a realistic AQI value for a point
   */
  private static generateAQIForPoint(progress: number): number {
    // Create a pattern where AQI varies in a way that's interesting for the demo
    // Higher in the middle of the route, lower at start and end
    const baseValue = 30;
    const amplitude = 20;
    const aqiVariation = Math.sin(progress * Math.PI) * amplitude;
    
    // Add some randomness
    const randomFactor = Math.random() * 10 - 5;
    
    return Math.max(20, Math.min(80, baseValue + aqiVariation + randomFactor));
  }
  
  /**
   * Add realistic navigation instructions to route points
   */
  private static addNavigationInstructions(points: RoutePoint[], transportMode: string): RoutePoint[] {
    if (points.length < 3) return points;
    
    // First point is always "Start"
    points[0].instruction = `Start ${transportMode} route`;
    
    const result = [...points];
    
    // Add instructions at specific points (not every point needs an instruction)
    const directions = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];
    const actions = ['Continue', 'Turn right', 'Turn left', 'Slight right', 'Slight left', 'Sharp right', 'Sharp left'];
    
    // Add a turn instruction near 1/4 of the way
    const quarterIdx = Math.floor(points.length * 0.25);
    result[quarterIdx].instruction = `${actions[1]} and continue ${directions[Math.floor(Math.random() * directions.length)]}`;
    
    // Add an instruction near halfway
    const halfwayIdx = Math.floor(points.length * 0.5);
    result[halfwayIdx].instruction = `${actions[2]} onto the path and continue ${directions[Math.floor(Math.random() * directions.length)]}`;
    
    // Add an instruction near 3/4 of the way
    const threeQuarterIdx = Math.floor(points.length * 0.75);
    result[threeQuarterIdx].instruction = `${actions[4]} and continue ${directions[Math.floor(Math.random() * directions.length)]}`;
    
    // Last point is always the destination
    result[result.length - 1].instruction = "You've reached your destination";
    
    // Calculate cumulative distance and time for each point
    let cumulativeDistance = 0;
    for (let i = 1; i < result.length; i++) {
      const prevPoint = result[i - 1];
      const currentPoint = result[i];
      
      const segmentDistance = this.calculateDistance(prevPoint, currentPoint);
      cumulativeDistance += segmentDistance;
      
      currentPoint.distance = cumulativeDistance;
      currentPoint.time = this.calculateDuration(cumulativeDistance, transportMode);
    }
    
    return result;
  }
  
  /**
   * Calculate the approximate distance between two coordinates in meters
   */
  private static calculateDistance(origin: Coordinate, destination: Coordinate): number {
    // Haversine formula to calculate distance between two points
    const R = 6371e3; // Earth's radius in meters
    const φ1 = this.toRadians(origin.latitude);
    const φ2 = this.toRadians(destination.latitude);
    const Δφ = this.toRadians(destination.latitude - origin.latitude);
    const Δλ = this.toRadians(destination.longitude - origin.longitude);

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }
  
  /**
   * Calculate total distance of a route in meters
   */
  private static calculateTotalDistance(points: RoutePoint[]): number {
    let totalDistance = 0;
    
    for (let i = 1; i < points.length; i++) {
      totalDistance += this.calculateDistance(points[i-1], points[i]);
    }
    
    return totalDistance;
  }
  
  /**
   * Calculate duration based on distance and transport mode
   */
  private static calculateDuration(meters: number, mode: string): number {
    let speedMetersPerSecond = 1.4; // Default walking speed (5 km/h)
    
    if (mode === 'jogging') {
      speedMetersPerSecond = 2.8; // Jogging speed (10 km/h)
    } else if (mode === 'cycling') {
      speedMetersPerSecond = 4.2; // Cycling speed (15 km/h)
    }
    
    return meters / speedMetersPerSecond;
  }
  
  /**
   * Create route segments from route points
   */
  private static createRouteSegments(points: RoutePoint[]): RouteSegment[] {
    const segments: RouteSegment[] = [];
    let currentSegmentPoints: RoutePoint[] = [points[0]];
    let currentInstruction = points[0].instruction || 'Start route';
    
    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      
      if (point.instruction && point.instruction !== currentInstruction) {
        // When we reach a point with a new instruction, finish the current segment
        const distance = this.calculateTotalDistance(currentSegmentPoints);
        const time = this.calculateDuration(distance, 'walking'); // Default to walking
        
        // Calculate average AQI for the segment
        const aqiSum = currentSegmentPoints.reduce((sum, pt) => sum + (pt.aqi || 0), 0);
        const avgAqi = aqiSum / currentSegmentPoints.length;
        
        segments.push({
          instruction: currentInstruction,
          points: [...currentSegmentPoints],
          distance,
          time,
          aqi: avgAqi
        });
        
        // Start a new segment
        currentSegmentPoints = [point];
        currentInstruction = point.instruction || currentInstruction;
      } else {
        // Add point to current segment
        currentSegmentPoints.push(point);
      }
    }
    
    // Add the final segment if there are points
    if (currentSegmentPoints.length > 0) {
      const distance = this.calculateTotalDistance(currentSegmentPoints);
      const time = this.calculateDuration(distance, 'walking');
      
      const aqiSum = currentSegmentPoints.reduce((sum, pt) => sum + (pt.aqi || 0), 0);
      const avgAqi = aqiSum / currentSegmentPoints.length;
      
      segments.push({
        instruction: currentInstruction,
        points: [...currentSegmentPoints],
        distance,
        time,
        aqi: avgAqi
      });
    }
    
    return segments;
  }
  
  private static toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }
  
  /**
   * Format distance in a human-readable format
   */
  private static formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }
  
  /**
   * Format duration in a human-readable format
   */
  private static formatDuration(seconds: number): string {
    const minutes = Math.ceil(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} h ${remainingMinutes} min`;
  }
  
  /**
   * Get the AQI category based on the value
   */
  private static getAQICategory(aqi: number): string {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  }
} 