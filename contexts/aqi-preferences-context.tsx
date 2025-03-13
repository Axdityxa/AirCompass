import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './auth-context';

// Define the AQI category type
export interface AqiCategory {
  id: number;
  range: string;
  label: string;
  color: string;
  description: string;
}

// Define the AQI categories
export const AQI_CATEGORIES: AqiCategory[] = [
  { id: 1, range: '0-50', label: 'GOOD', color: '#00E400', description: 'Air quality is satisfactory, and air pollution poses little or no risk.' },
  { id: 2, range: '51-100', label: 'SATISFACTORY', color: '#92D050', description: 'Air quality is acceptable. However, there may be a risk for some people.' },
  { id: 3, range: '101-200', label: 'MODERATE', color: '#FFFF00', description: 'Members of sensitive groups may experience health effects.' },
  { id: 4, range: '201-300', label: 'POOR', color: '#FF7E00', description: 'Everyone may begin to experience health effects.' },
  { id: 5, range: '301-400', label: 'VERY POOR', color: '#FF0000', description: 'Health warnings of emergency conditions. The entire population is likely to be affected.' },
  { id: 6, range: '401-500', label: 'SEVERE', color: '#99004C', description: 'Health alert: everyone may experience more serious health effects.' },
];

interface AqiPreferencesContextProps {
  preferredAqiCategory: AqiCategory | null;
  isLoading: boolean;
  savePreference: (categoryId: number) => Promise<void>;
  hasSetPreference: boolean;
}

const AqiPreferencesContext = createContext<AqiPreferencesContextProps | undefined>(undefined);

export function AqiPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferredAqiCategory, setPreferredAqiCategory] = useState<AqiCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSetPreference, setHasSetPreference] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchUserPreferences = async () => {
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('aqi_preference')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user preferences:', error);
          setHasSetPreference(false);
        } else if (data) {
          const category = AQI_CATEGORIES.find(c => c.id === data.aqi_preference) || null;
          setPreferredAqiCategory(category);
          setHasSetPreference(true);
        } else {
          setHasSetPreference(false);
        }
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPreferences();
  }, [user]);

  const savePreference = async (categoryId: number) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          aqi_preference: categoryId,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
        
      if (error) {
        console.error('Error saving preference:', error);
      } else {
        const category = AQI_CATEGORIES.find(c => c.id === categoryId) || null;
        setPreferredAqiCategory(category);
        setHasSetPreference(true);
      }
    } catch (error) {
      console.error('Error saving preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    preferredAqiCategory,
    isLoading,
    savePreference,
    hasSetPreference,
  };

  return <AqiPreferencesContext.Provider value={value}>{children}</AqiPreferencesContext.Provider>;
}

export function useAqiPreferences() {
  const context = useContext(AqiPreferencesContext);
  if (context === undefined) {
    throw new Error('useAqiPreferences must be used within an AqiPreferencesProvider');
  }
  return context;
} 