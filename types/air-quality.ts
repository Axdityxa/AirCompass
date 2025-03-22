export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  coordinates: Coordinates;
}

export interface Pollutants {
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
}

export interface AirQualityData {
  aqi: number;
  pollutants: Pollutants;
  location: Location;
  timestamp: string;
}

export interface SearchLocation {
  name: string;
  city: string;
  state: string;
  coordinates: Coordinates;
}

export enum AqiCategory {
  Good = 'Good',
  Moderate = 'Moderate',
  UnhealthyForSensitiveGroups = 'Unhealthy for Sensitive Groups',
  Unhealthy = 'Unhealthy',
  VeryUnhealthy = 'Very Unhealthy',
  Hazardous = 'Hazardous'
}

export const getAqiCategory = (aqi: number): AqiCategory => {
  if (aqi <= 50) return AqiCategory.Good;
  if (aqi <= 100) return AqiCategory.Moderate;
  if (aqi <= 150) return AqiCategory.UnhealthyForSensitiveGroups;
  if (aqi <= 200) return AqiCategory.Unhealthy;
  if (aqi <= 300) return AqiCategory.VeryUnhealthy;
  return AqiCategory.Hazardous;
};

export const getAqiColor = (aqi: number): string => {
  if (aqi <= 50) return '#4CAF50'; // Good - Green
  if (aqi <= 100) return '#FFEB3B'; // Moderate - Yellow
  if (aqi <= 150) return '#FF9800'; // Unhealthy for Sensitive Groups - Orange
  if (aqi <= 200) return '#F44336'; // Unhealthy - Red
  if (aqi <= 300) return '#9C27B0'; // Very Unhealthy - Purple
  return '#7D0023'; // Hazardous - Maroon
};

export const getHealthImplications = (aqi: number): string => {
  if (aqi <= 50) {
    return 'Air quality is satisfactory, and air pollution poses little or no risk.';
  } else if (aqi <= 100) {
    return 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.';
  } else if (aqi <= 150) {
    return 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.';
  } else if (aqi <= 200) {
    return 'Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.';
  } else if (aqi <= 300) {
    return 'Health alert: The risk of health effects is increased for everyone.';
  } else {
    return 'Health warning of emergency conditions: everyone is more likely to be affected.';
  }
};

export const getPollutantInfo = (pollutantType: keyof Pollutants): {
  name: string;
  fullName: string;
  unit: string;
  description: string;
  icon: string;
} => {
  const pollutantInfo = {
    pm25: {
      name: 'PM2.5',
      fullName: 'Fine Particulate Matter',
      unit: 'μg/m³',
      description: 'Fine particulate matter less than 2.5 microns in diameter',
      icon: 'leaf'
    },
    pm10: {
      name: 'PM10',
      fullName: 'Particulate Matter',
      unit: 'μg/m³',
      description: 'Particulate matter less than 10 microns in diameter',
      icon: 'nuclear'
    },
    o3: {
      name: 'O₃',
      fullName: 'Ozone',
      unit: 'ppb',
      description: 'Ground-level ozone',
      icon: 'sunny'
    },
    no2: {
      name: 'NO₂',
      fullName: 'Nitrogen Dioxide',
      unit: 'ppb',
      description: 'Nitrogen dioxide',
      icon: 'car'
    },
    so2: {
      name: 'SO₂',
      fullName: 'Sulfur Dioxide',
      unit: 'ppb',
      description: 'Sulfur dioxide',
      icon: 'flame'
    },
    co: {
      name: 'CO',
      fullName: 'Carbon Monoxide',
      unit: 'ppm',
      description: 'Carbon monoxide',
      icon: 'speedometer'
    }
  };
  
  return pollutantInfo[pollutantType];
}; 