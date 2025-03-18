import axios from 'axios';

// Get API keys directly from environment variables
const IQAIR_API_KEY = '9f322111-a798-4eaf-aade-fe81619c8ec7';
const WAQI_API_KEY = '5619ba27486964b2dfd255aa99bc29577a7d5ad5';

// Define API endpoints
const IQAIR_API_URL = 'https://api.airvisual.com/v2';
const WAQI_API_URL = 'https://api.waqi.info';

// Define types for the API responses
export interface AqiData {
  aqi: number;
  confidence: 'low' | 'medium' | 'high';
  recommendations: {
    jogging: { suitable: boolean };
    walking: { suitable: boolean };
    cycling: { suitable: boolean };
    bestTime: string;
    alternatives: string[];
  };
  nearestStation: string;
  sources: Array<{
    name: string;
    aqi: number;
    distance: number;
    station: string;
    pollutants: {
      pm25: number | null;
      pm10: number | null;
      o3: number | null;
      no2: number | null;
      so2: number | null;
      co: number | null;
    };
  }>;
}

export interface OutdoorSpot {
  location: { lat: number; lon: number };
  aqi: number;
  distance: number;
  bestTime: string;
  confidence: string;
  amenities: {
    jogging: number;
    walking: number;
    cycling: number;
  };
}

// Mock data for development
const mockAqiData: AqiData = {
  aqi: 85,
  confidence: 'high',
  recommendations: {
    jogging: { suitable: true },
    walking: { suitable: true },
    cycling: { suitable: true },
    bestTime: 'Morning (6-8 AM)',
    alternatives: ['Indoor gym', 'Swimming pool']
  },
  nearestStation: 'City Center Monitoring Station',
  sources: [
    {
      name: 'EPA',
      aqi: 85,
      distance: 1.2,
      station: 'City Center',
      pollutants: {
        pm25: 25,
        pm10: 45,
        o3: 35,
        no2: 15,
        so2: 5,
        co: 0.8
      }
    }
  ]
};

const mockOutdoorSpots: OutdoorSpot[] = [
  {
    location: { lat: 12.9716, lon: 77.5946 },
    aqi: 65,
    distance: 1.5,
    bestTime: 'Morning',
    confidence: 'high',
    amenities: {
      jogging: 4,
      walking: 5,
      cycling: 3
    }
  },
  {
    location: { lat: 12.9815, lon: 77.6037 },
    aqi: 72,
    distance: 2.3,
    bestTime: 'Evening',
    confidence: 'medium',
    amenities: {
      jogging: 3,
      walking: 4,
      cycling: 4
    }
  }
];

// Helper function to determine confidence level based on data sources
function determineConfidence(sources: any[]): 'low' | 'medium' | 'high' {
  if (!sources || sources.length === 0) return 'low';
  if (sources.length === 1) return 'medium';
  return 'high';
}

// Helper function to determine if an activity is suitable based on AQI
function isSuitable(aqi: number, activity: 'jogging' | 'walking' | 'cycling'): boolean {
  // Jogging is more strenuous, so we're more conservative
  if (activity === 'jogging') return aqi <= 100;
  // Walking is less strenuous
  if (activity === 'walking') return aqi <= 150;
  // Cycling is in between
  return aqi <= 125;
}

// Helper function to determine best time based on AQI
function determineBestTime(aqi: number): string {
  if (aqi <= 50) return 'Any time of day';
  if (aqi <= 100) return 'Morning (6-8 AM) or Evening (after 6 PM)';
  return 'Early Morning (before 7 AM)';
}

// Helper function to get alternative activities based on AQI
function getAlternatives(aqi: number): string[] {
  if (aqi <= 100) return ['All outdoor activities are suitable'];
  if (aqi <= 150) return ['Indoor gym', 'Swimming pool', 'Short outdoor activities'];
  return ['Indoor gym', 'Home workout', 'Avoid prolonged outdoor activities'];
}

/**
 * Fetches AQI data from both IQAir and WAQI APIs and combines the results
 */
export async function fetchAqiData(latitude: number, longitude: number): Promise<AqiData> {
  try {
    // Fetch data from both APIs in parallel
    const [iqAirResponse, waqiResponse] = await Promise.all([
      axios.get(`${IQAIR_API_URL}/nearest_city`, {
        params: {
          lat: latitude,
          lon: longitude,
          key: IQAIR_API_KEY
        }
      }),
      axios.get(`${WAQI_API_URL}/feed/geo:${latitude};${longitude}/`, {
        params: {
          token: WAQI_API_KEY
        }
      })
    ]);

    // Extract relevant data from IQAir response
    const iqAirData = iqAirResponse.data.data;
    const iqAirAqi = iqAirData.current.pollution.aqius;
    const iqAirStation = iqAirData.city || 'Unknown';
    
    // Extract relevant data from WAQI response
    const waqiData = waqiResponse.data.data;
    const waqiAqi = waqiData.aqi;
    const waqiStation = waqiData.city?.name || 'Unknown';

    // Create a combined pollutants object that prioritizes WAQI data
    const combinedPollutants = {
      pm25: (waqiData.iaqi?.pm25?.v !== undefined) ? waqiData.iaqi.pm25.v : (iqAirData.current.pollution.pm25 || null),
      pm10: (waqiData.iaqi?.pm10?.v !== undefined) ? waqiData.iaqi.pm10.v : (iqAirData.current.pollution.pm10 || null),
      o3: (waqiData.iaqi?.o3?.v !== undefined) ? waqiData.iaqi.o3.v : null,
      no2: (waqiData.iaqi?.no2?.v !== undefined) ? waqiData.iaqi.no2.v : null,
      so2: (waqiData.iaqi?.so2?.v !== undefined) ? waqiData.iaqi.so2.v : null,
      co: (waqiData.iaqi?.co?.v !== undefined) ? waqiData.iaqi.co.v : null
    };

    // For debugging
    console.log('Combined pollutants:', combinedPollutants);

    // Create sources array with both data sources
    const sources = [
      {
        name: 'WAQI',
        aqi: waqiAqi,
        distance: 0,
        station: waqiStation,
        pollutants: {
          pm25: waqiData.iaqi?.pm25?.v || null,
          pm10: waqiData.iaqi?.pm10?.v || null,
          o3: waqiData.iaqi?.o3?.v || null,
          no2: waqiData.iaqi?.no2?.v || null,
          so2: waqiData.iaqi?.so2?.v || null,
          co: waqiData.iaqi?.co?.v || null
        }
      },
      {
        name: 'IQAir',
        aqi: iqAirAqi,
        distance: 0,
        station: iqAirStation,
        pollutants: {
          pm25: iqAirData.current.pollution.pm25 || null,
          pm10: iqAirData.current.pollution.pm10 || null,
          o3: null,
          no2: null,
          so2: null,
          co: null
        }
      }
    ];

    // Calculate average AQI from all sources
    const totalAqi = sources.reduce((sum, source) => sum + source.aqi, 0);
    const averageAqi = Math.round(totalAqi / sources.length);

    // Determine confidence level based on available data
    const confidence = determineConfidence(sources);

    // Generate recommendations based on AQI
    const recommendations = {
      jogging: { suitable: isSuitable(averageAqi, 'jogging') },
      walking: { suitable: isSuitable(averageAqi, 'walking') },
      cycling: { suitable: isSuitable(averageAqi, 'cycling') },
      bestTime: determineBestTime(averageAqi),
      alternatives: getAlternatives(averageAqi)
    };

    // Create a main source with combined data
    const mainSource = {
      name: 'Combined',
      aqi: averageAqi,
      distance: 0,
      station: waqiStation || iqAirStation,
      pollutants: combinedPollutants
    };

    // Add the main source at the beginning of the sources array
    sources.unshift(mainSource);

    // Construct and return the combined AQI data
    return {
      aqi: averageAqi,
      confidence,
      recommendations,
      nearestStation: waqiStation || iqAirStation,
      sources
    };
  } catch (error) {
    console.error('Error fetching AQI data:', error);
    throw error;
  }
}

/**
 * Generates suitable outdoor spots for a specific activity based on AQI data
 */
export async function fetchOutdoorSpots(
  latitude: number, 
  longitude: number, 
  activity: 'jogging' | 'walking' | 'cycling'
): Promise<OutdoorSpot[]> {
  try {
    // First, get the current AQI data
    const aqiData = await fetchAqiData(latitude, longitude);
    
    // Generate nearby locations (simulated for now)
    // In a real app, you might use a places API to find actual parks or suitable locations
    const spots: OutdoorSpot[] = [];
    
    // Generate spots in different directions from the user's location
    const directions = [
      { lat: 0.01, lon: 0.01 },   // Northeast
      { lat: 0.01, lon: -0.01 },  // Northwest
      { lat: -0.01, lon: 0.01 },  // Southeast
      { lat: -0.01, lon: -0.01 }, // Southwest
    ];
    
    for (let i = 0; i < directions.length; i++) {
      const dir = directions[i];
      const spotLat = latitude + dir.lat;
      const spotLon = longitude + dir.lon;
      
      // Fetch AQI for this location
      try {
        const spotAqiData = await fetchAqiData(spotLat, spotLon);
        
        // Calculate a score for this activity (1-5)
        let activityScore = 5;
        if (spotAqiData.aqi > 50) activityScore--;
        if (spotAqiData.aqi > 100) activityScore--;
        if (spotAqiData.aqi > 150) activityScore--;
        if (!spotAqiData.recommendations[activity].suitable) activityScore--;
        
        // Ensure score is at least 1
        activityScore = Math.max(1, activityScore);
        
        // Calculate distance (approximate)
        const distance = Math.sqrt(
          Math.pow(dir.lat * 111, 2) + Math.pow(dir.lon * 111 * Math.cos(latitude * Math.PI / 180), 2)
        );
        
        // Create amenities object with scores for each activity
        const amenities = {
          jogging: activity === 'jogging' ? activityScore : Math.max(1, activityScore - 1),
          walking: activity === 'walking' ? activityScore : Math.max(1, activityScore - 1),
          cycling: activity === 'cycling' ? activityScore : Math.max(1, activityScore - 1)
        };
        
        // Add this spot to the list
        spots.push({
          location: { lat: spotLat, lon: spotLon },
          aqi: spotAqiData.aqi,
          distance,
          bestTime: spotAqiData.recommendations.bestTime,
          confidence: spotAqiData.confidence,
          amenities
        });
      } catch (error) {
        console.error(`Error fetching AQI for spot ${i}:`, error);
        // Continue with other spots
      }
    }
    
    // Sort spots by suitability for the requested activity
    return spots.sort((a, b) => {
      // First sort by activity score
      const scoreA = a.amenities[activity];
      const scoreB = b.amenities[activity];
      if (scoreB !== scoreA) return scoreB - scoreA;
      
      // Then by AQI (lower is better)
      return a.aqi - b.aqi;
    });
  } catch (error) {
    console.error('Error fetching outdoor spots:', error);
    throw error;
  }
} 