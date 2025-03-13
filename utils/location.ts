import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

/**
 * Get the current location of the device
 * @returns Promise with location data or null if permission is not granted
 */
export async function getCurrentLocation(): Promise<LocationData | null> {
  try {
    // Check if we have permission
    const { status } = await Location.getForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('Location permission not granted');
      return null;
    }
    
    // Get the current location
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
}

/**
 * Get the address from coordinates
 * @param latitude Latitude coordinate
 * @param longitude Longitude coordinate
 * @returns Promise with address information or null if geocoding fails
 */
export async function getAddressFromCoordinates(
  latitude: number, 
  longitude: number
): Promise<Location.LocationGeocodedAddress | null> {
  try {
    const geocode = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });
    
    if (geocode && geocode.length > 0) {
      return geocode[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error geocoding location:', error);
    return null;
  }
}

/**
 * Get a formatted address string from coordinates
 * @param latitude Latitude coordinate
 * @param longitude Longitude coordinate
 * @returns Promise with formatted address string or empty string if geocoding fails
 */
export async function getFormattedAddress(
  latitude: number, 
  longitude: number
): Promise<string> {
  try {
    const address = await getAddressFromCoordinates(latitude, longitude);
    
    if (!address) {
      return '';
    }
    
    // Format the address based on available information
    const parts = [];
    
    if (address.name) {
      parts.push(address.name);
    }
    
    if (address.street) {
      parts.push(address.street);
    }
    
    if (address.city) {
      parts.push(address.city);
    }
    
    if (address.region) {
      parts.push(address.region);
    }
    
    if (address.postalCode) {
      parts.push(address.postalCode);
    }
    
    return parts.join(', ');
  } catch (error) {
    console.error('Error getting formatted address:', error);
    return '';
  }
} 