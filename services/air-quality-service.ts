import axios from 'axios';
import { AirQualityData, Coordinates, Location, SearchLocation } from '../types/air-quality';

// This is a mock service that would be replaced with actual API calls
const mockAirQualityData: Record<string, AirQualityData> = {
  'Delhi': {
    aqi: 162,
    pollutants: {
      pm25: 58,
      pm10: 92,
      o3: 32,
      no2: 25,
      so2: 8,
      co: 12.5
    },
    location: {
      id: 'city-delhi',
      name: 'Delhi',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      coordinates: { latitude: 28.6139, longitude: 77.2090 }
    },
    timestamp: new Date().toISOString()
  },
  'Mumbai': {
    aqi: 86,
    pollutants: {
      pm25: 28,
      pm10: 46,
      o3: 18,
      no2: 16,
      so2: 5,
      co: 7.2
    },
    location: {
      id: 'city-mumbai',
      name: 'Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      coordinates: { latitude: 19.0760, longitude: 72.8777 }
    },
    timestamp: new Date().toISOString()
  },
  'Bangalore': {
    aqi: 89,
    pollutants: {
      pm25: 28,
      pm10: 45,
      o3: 30,
      no2: 18,
      so2: 4,
      co: 7.2
    },
    location: {
      id: 'city-bangalore',
      name: 'Bangalore',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      coordinates: { latitude: 12.9716, longitude: 77.5946 }
    },
    timestamp: new Date().toISOString()
  },
  'Chennai': {
    aqi: 52,
    pollutants: {
      pm25: 18,
      pm10: 32,
      o3: 24,
      no2: 12,
      so2: 2,
      co: 4.5
    },
    location: {
      id: 'city-chennai',
      name: 'Chennai',
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      coordinates: { latitude: 13.0827, longitude: 80.2707 }
    },
    timestamp: new Date().toISOString()
  },
  'Kolkata': {
    aqi: 104,
    pollutants: {
      pm25: 36,
      pm10: 62,
      o3: 28,
      no2: 18,
      so2: 6,
      co: 8.2
    },
    location: {
      id: 'city-kolkata',
      name: 'Kolkata',
      city: 'Kolkata',
      state: 'West Bengal',
      country: 'India',
      coordinates: { latitude: 22.5726, longitude: 88.3639 }
    },
    timestamp: new Date().toISOString()
  },
  'Hyderabad': {
    aqi: 79,
    pollutants: {
      pm25: 26,
      pm10: 42,
      o3: 22,
      no2: 15,
      so2: 4,
      co: 6.8
    },
    location: {
      id: 'city-hyderabad',
      name: 'Hyderabad',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      coordinates: { latitude: 17.3850, longitude: 78.4867 }
    },
    timestamp: new Date().toISOString()
  },
};

// Add more cities to our mock data
const additionalCities = [
  { name: 'Pune', coordinates: { latitude: 18.5204, longitude: 73.8567 }, aqi: 72 },
  { name: 'Jaipur', coordinates: { latitude: 26.9124, longitude: 75.7873 }, aqi: 95 },
  { name: 'Ahmedabad', coordinates: { latitude: 23.0225, longitude: 72.5714 }, aqi: 88 },
  { name: 'Lucknow', coordinates: { latitude: 26.8467, longitude: 80.9462 }, aqi: 118 },
  { name: 'Kanpur', coordinates: { latitude: 26.4499, longitude: 80.3319 }, aqi: 132 },
  { name: 'Nagpur', coordinates: { latitude: 21.1458, longitude: 79.0882 }, aqi: 76 },
  { name: 'Indore', coordinates: { latitude: 22.7196, longitude: 75.8577 }, aqi: 82 },
  { name: 'Thane', coordinates: { latitude: 19.2183, longitude: 72.9781 }, aqi: 81 },
  { name: 'Bhopal', coordinates: { latitude: 23.2599, longitude: 77.4126 }, aqi: 78 },
  { name: 'Visakhapatnam', coordinates: { latitude: 17.6868, longitude: 83.2185 }, aqi: 69 },
  // Additional cities across different regions of India
  { name: 'Surat', coordinates: { latitude: 21.1702, longitude: 72.8311 }, aqi: 91 },
  { name: 'Coimbatore', coordinates: { latitude: 11.0168, longitude: 76.9558 }, aqi: 63 },
  { name: 'Kochi', coordinates: { latitude: 9.9312, longitude: 76.2673 }, aqi: 58 },
  { name: 'Guwahati', coordinates: { latitude: 26.1445, longitude: 91.7362 }, aqi: 82 },
  { name: 'Chandigarh', coordinates: { latitude: 30.7333, longitude: 76.7794 }, aqi: 93 },
  { name: 'Patna', coordinates: { latitude: 25.5941, longitude: 85.1376 }, aqi: 125 },
  { name: 'Varanasi', coordinates: { latitude: 25.3176, longitude: 82.9739 }, aqi: 116 },
  { name: 'Amritsar', coordinates: { latitude: 31.6340, longitude: 74.8723 }, aqi: 108 },
  { name: 'Jodhpur', coordinates: { latitude: 26.2389, longitude: 73.0243 }, aqi: 94 },
  { name: 'Thiruvananthapuram', coordinates: { latitude: 8.5241, longitude: 76.9366 }, aqi: 56 },
  { name: 'Dehradun', coordinates: { latitude: 30.3165, longitude: 78.0322 }, aqi: 87 },
  { name: 'Jammu', coordinates: { latitude: 32.7266, longitude: 74.8570 }, aqi: 96 },
  { name: 'Srinagar', coordinates: { latitude: 34.0837, longitude: 74.7973 }, aqi: 83 },
  { name: 'Bhubaneswar', coordinates: { latitude: 20.2961, longitude: 85.8245 }, aqi: 79 },
  { name: 'Raipur', coordinates: { latitude: 21.2514, longitude: 81.6296 }, aqi: 88 },
  { name: 'Ranchi', coordinates: { latitude: 23.3441, longitude: 85.3096 }, aqi: 92 },
  { name: 'Agra', coordinates: { latitude: 27.1767, longitude: 78.0081 }, aqi: 114 },
  { name: 'Allahabad', coordinates: { latitude: 25.4358, longitude: 81.8463 }, aqi: 109 },
  { name: 'Vadodara', coordinates: { latitude: 22.3072, longitude: 73.1812 }, aqi: 85 },
  { name: 'Rajkot', coordinates: { latitude: 22.3039, longitude: 70.8022 }, aqi: 83 },
  { name: 'Mangalore', coordinates: { latitude: 12.9141, longitude: 74.8560 }, aqi: 64 },
  { name: 'Mysore', coordinates: { latitude: 12.2958, longitude: 76.6394 }, aqi: 67 },
  { name: 'Madurai', coordinates: { latitude: 9.9252, longitude: 78.1198 }, aqi: 71 },
  { name: 'Tiruchirappalli', coordinates: { latitude: 10.7905, longitude: 78.7047 }, aqi: 68 },
  { name: 'Tirupati', coordinates: { latitude: 13.6288, longitude: 79.4192 }, aqi: 65 },
  { name: 'Warangal', coordinates: { latitude: 18.0000, longitude: 79.5800 }, aqi: 77 },
  { name: 'Vijayawada', coordinates: { latitude: 16.5062, longitude: 80.6480 }, aqi: 74 },
  { name: 'Nashik', coordinates: { latitude: 19.9975, longitude: 73.7898 }, aqi: 73 },
  { name: 'Aurangabad', coordinates: { latitude: 19.8762, longitude: 75.3433 }, aqi: 76 },
  { name: 'Solapur', coordinates: { latitude: 17.6599, longitude: 75.9064 }, aqi: 79 },
].forEach(city => {
  mockAirQualityData[city.name] = {
    aqi: city.aqi,
    pollutants: {
      pm25: Math.round(city.aqi * 0.35),
      pm10: Math.round(city.aqi * 0.65),
      o3: Math.round(10 + Math.random() * 30),
      no2: Math.round(8 + Math.random() * 20),
      so2: Math.round(2 + Math.random() * 8),
      co: Math.round((4 + Math.random() * 10) * 10) / 10
    },
    location: {
      id: `city-${city.name.toLowerCase().replace(/\s+/g, '-')}`, // Add unique ID for each location
      name: city.name,
      city: city.name,
      state: '', // Would be filled with actual data
      country: 'India',
      coordinates: city.coordinates
    },
    timestamp: new Date().toISOString()
  };
});

export async function getAirQualityData(city: string): Promise<AirQualityData | null> {
  // In a real application, this would make an API call
  // For now, we'll use mock data
  const normalizedCity = city.trim().toLowerCase();
  
  const match = Object.keys(mockAirQualityData).find(
    key => key.toLowerCase() === normalizedCity
  );
  
  return match ? mockAirQualityData[match] : null;
}

export async function getAirQualityByCoordinates(
  latitude: number, 
  longitude: number
): Promise<AirQualityData | null> {
  // In a real application, this would query an API with the coordinates
  // For this mock implementation, we'll find the closest city in our mock data
  
  const cities = Object.values(mockAirQualityData);
  
  // Find the closest city based on coordinates
  let closestCity = null;
  let smallestDistance = Infinity;
  
  for (const city of cities) {
    const distance = calculateDistance(
      latitude, 
      longitude,
      city.location.coordinates.latitude,
      city.location.coordinates.longitude
    );
    
    if (distance < smallestDistance) {
      smallestDistance = distance;
      closestCity = city;
    }
  }
  
  // If we found a city and it's within 50km, return its data
  if (closestCity && smallestDistance < 50) {
    return closestCity;
  }
  
  // Generate random data for this location
  const aqi = Math.floor(40 + Math.random() * 120);
  const locationId = `loc-${latitude.toFixed(4)}-${longitude.toFixed(4)}`;
  
  return {
    aqi,
    pollutants: {
      pm25: Math.round(aqi * 0.35),
      pm10: Math.round(aqi * 0.65),
      o3: Math.round(10 + Math.random() * 30),
      no2: Math.round(8 + Math.random() * 20),
      so2: Math.round(2 + Math.random() * 8),
      co: Math.round((4 + Math.random() * 10) * 10) / 10
    },
    location: {
      id: locationId,
      name: 'Unknown Location',
      city: 'Unknown City',
      state: 'Unknown State',
      country: 'India',
      coordinates: { latitude, longitude }
    },
    timestamp: new Date().toISOString()
  };
}

export async function searchLocations(query: string): Promise<SearchLocation[]> {
  if (!query || query.length < 2) return [];
  
  // In a real application, this would query a geocoding API
  // For now, return filtered results from our mock data
  const normalizedQuery = query.toLowerCase().trim();
  
  // Add special handling for Bengaluru/Bangalore
  if (normalizedQuery === 'bengaluru') {
    const bangalore = Object.values(mockAirQualityData).find(
      data => data.location.name.toLowerCase() === 'bangalore'
    );
    
    if (bangalore) {
      return [{
        name: 'Bengaluru (Bangalore)',
        city: 'Bengaluru',
        state: 'Karnataka',
        coordinates: bangalore.location.coordinates
      }];
    }
  }
  
  return Object.values(mockAirQualityData)
    .filter(data => 
      data.location.name.toLowerCase().includes(normalizedQuery) ||
      data.location.city.toLowerCase().includes(normalizedQuery) ||
      data.location.state.toLowerCase().includes(normalizedQuery) ||
      // Handle Bengaluru/Bangalore alternate spelling
      (data.location.name.toLowerCase() === 'bangalore' && normalizedQuery === 'bengaluru') ||
      (data.location.name.toLowerCase() === 'bangalore' && normalizedQuery.includes('bengaluru'))
    )
    .map(data => ({
      name: data.location.name === 'Bangalore' && normalizedQuery.includes('bengaluru') 
        ? 'Bengaluru (Bangalore)' 
        : data.location.name,
      city: data.location.city,
      state: data.location.state,
      coordinates: data.location.coordinates
    }));
}

export function getAllAirQualityData(): AirQualityData[] {
  return Object.values(mockAirQualityData);
}

// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
} 