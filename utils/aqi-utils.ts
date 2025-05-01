import { AqiCategory } from '@/types/aqi';

/**
 * Get the AQI category based on the AQI value
 * @param aqi The AQI value
 * @returns The AQI category object
 */
export function getAqiCategory(aqi: number): AqiCategory {
  if (aqi <= 50) {
    return {
      id: 1,
      name: 'Good',
      color: '#4CAF50',
      healthImplications: 'Air quality is satisfactory, and air pollution poses little or no risk.',
      range: '0-50',
      label: 'Good',
      description: 'Air quality is satisfactory, and air pollution poses little or no risk.'
    };
  } else if (aqi <= 100) {
    return {
      id: 2,
      name: 'Moderate',
      color: '#FFEB3B',
      healthImplications: 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.',
      range: '51-100',
      label: 'Moderate',
      description: 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.'
    };
  } else if (aqi <= 150) {
    return {
      id: 3,
      name: 'Unhealthy for Sensitive Groups',
      color: '#FF9800',
      healthImplications: 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.',
      range: '101-150',
      label: 'Unhealthy for Sensitive Groups',
      description: 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.'
    };
  } else if (aqi <= 200) {
    return {
      id: 4,
      name: 'Unhealthy',
      color: '#F44336',
      healthImplications: 'Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.',
      range: '151-200',
      label: 'Unhealthy',
      description: 'Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.'
    };
  } else if (aqi <= 300) {
    return {
      id: 5,
      name: 'Very Unhealthy',
      color: '#9C27B0',
      healthImplications: 'Health alert: The risk of health effects is increased for everyone.',
      range: '201-300',
      label: 'Very Unhealthy',
      description: 'Health alert: The risk of health effects is increased for everyone.'
    };
  } else {
    return {
      id: 6,
      name: 'Hazardous',
      color: '#7D0023',
      healthImplications: 'Health warning of emergency conditions: everyone is more likely to be affected.',
      range: '301+',
      label: 'Hazardous',
      description: 'Health warning of emergency conditions: everyone is more likely to be affected.'
    };
  }
}

/**
 * Get the color for an AQI value
 * @param aqi The AQI value
 * @returns The color corresponding to the AQI value
 */
export function getAqiColor(aqi: number): string {
  return getAqiCategory(aqi).color;
}

/**
 * Get the health implications for an AQI value
 * @param aqi The AQI value
 * @returns The health implications corresponding to the AQI value
 */
export function getHealthImplications(aqi: number): string {
  return getAqiCategory(aqi).healthImplications;
}

/**
 * Determine if an AQI value exceeds a user's preferred threshold
 * @param aqi The current AQI value
 * @param threshold The user's preferred AQI threshold
 * @returns True if the AQI exceeds the threshold, false otherwise
 */
export function isAqiExceedingThreshold(aqi: number, threshold: number): boolean {
  return aqi > threshold;
}

/**
 * Get a user-friendly description of an AQI value
 * @param aqi The AQI value
 * @returns A user-friendly description of the AQI value
 */
export function getAqiDescription(aqi: number): string {
  const category = getAqiCategory(aqi);
  return `${category.name} (${aqi})`;
} 