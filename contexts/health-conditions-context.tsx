import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './auth-context';
import { ensureUserExists } from '@/utils/user-helper';
import { useAqiPreferences } from './aqi-preferences-context';

export interface HealthConditions {
  hasRespiratoryIssues: boolean;
  hasCardiovascularDisease: boolean;
  hasCancerRisk: boolean;
  otherConditions: string | null;
}

interface HealthConditionsContextProps {
  healthConditions: HealthConditions | null;
  isLoading: boolean;
  saveHealthConditions: (conditions: HealthConditions, hasExplicitlySet?: boolean) => Promise<void>;
  hasSetHealthConditions: boolean;
  hasExplicitlySetConditions: boolean;
}

const HealthConditionsContext = createContext<HealthConditionsContextProps | undefined>(undefined);

export function HealthConditionsProvider({ children }: { children: React.ReactNode }) {
  const [healthConditions, setHealthConditions] = useState<HealthConditions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSetHealthConditions, setHasSetHealthConditions] = useState(false);
  const [hasExplicitlySetConditions, setHasExplicitlySetConditions] = useState(false);
  const { user } = useAuth();
  const { preferredAqiCategory } = useAqiPreferences();

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchHealthConditions = async () => {
      try {
        // Ensure user exists in the users table before fetching preferences
        await ensureUserExists();
        
        const { data, error } = await supabase
          .from('user_preferences')
          .select('has_respiratory_issues, has_cardiovascular_disease, has_cancer_risk, other_health_conditions, has_explicitly_set_conditions')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching health conditions:', error);
          setHasSetHealthConditions(false);
          setHasExplicitlySetConditions(false);
        } else if (data) {
          const conditions: HealthConditions = {
            hasRespiratoryIssues: data.has_respiratory_issues || false,
            hasCardiovascularDisease: data.has_cardiovascular_disease || false,
            hasCancerRisk: data.has_cancer_risk || false,
            otherConditions: data.other_health_conditions || null
          };
          
          setHealthConditions(conditions);
          
          // Check if user has explicitly set conditions
          setHasExplicitlySetConditions(data.has_explicitly_set_conditions || false);
          
          // Check if any health condition has been set
          const hasAnyCondition = Object.values({
            hasRespiratoryIssues: conditions.hasRespiratoryIssues,
            hasCardiovascularDisease: conditions.hasCardiovascularDisease,
            hasCancerRisk: conditions.hasCancerRisk
          }).some(value => value === true) || !!conditions.otherConditions;
          
          setHasSetHealthConditions(hasAnyCondition);
        } else {
          setHasSetHealthConditions(false);
          setHasExplicitlySetConditions(false);
        }
      } catch (error) {
        console.error('Error fetching health conditions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHealthConditions();
  }, [user]);

  const saveHealthConditions = async (conditions: HealthConditions, hasExplicitlySet: boolean = true) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Ensure user exists in the users table before saving preferences
      await ensureUserExists();
      
      // First, get the current user preferences to ensure we have the preferred_aqi_category
      const { data: existingPrefs, error: fetchError } = await supabase
        .from('user_preferences')
        .select('preferred_aqi_category')
        .eq('user_id', user.id)
        .single();
        
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is fine
        console.error('Error fetching existing preferences:', fetchError);
        throw fetchError;
      }
      
      // Use the fetched preferred_aqi_category, fall back to the context value, or use a default value (1)
      const preferredAqiCategoryId = existingPrefs?.preferred_aqi_category || 
                                     (preferredAqiCategory ? preferredAqiCategory.id : 1);
      
      // Make sure we're explicitly setting the hasExplicitlySetConditions flag
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preferred_aqi_category: preferredAqiCategoryId,
          has_respiratory_issues: conditions.hasRespiratoryIssues,
          has_cardiovascular_disease: conditions.hasCardiovascularDisease,
          has_cancer_risk: conditions.hasCancerRisk,
          other_health_conditions: conditions.otherConditions,
          has_explicitly_set_conditions: hasExplicitlySet, // This is critical for proper navigation
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
        
      if (error) {
        console.error('Error saving health conditions:', error);
      } else {
        // Update the local state
        setHealthConditions(conditions);
        
        // Make sure we update this flag to match what we just saved
        setHasExplicitlySetConditions(hasExplicitlySet);
        
        // Check if any condition is set
        const hasAnyCondition = conditions.hasRespiratoryIssues || 
                               conditions.hasCardiovascularDisease || 
                               conditions.hasCancerRisk || 
                               !!conditions.otherConditions;
        
        setHasSetHealthConditions(hasAnyCondition);
        
        console.log('Successfully saved health conditions with explicitly set =', hasExplicitlySet);
      }
    } catch (error) {
      console.error('Error saving health conditions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    healthConditions,
    isLoading,
    saveHealthConditions,
    hasSetHealthConditions,
    hasExplicitlySetConditions,
  };

  return <HealthConditionsContext.Provider value={value}>{children}</HealthConditionsContext.Provider>;
}

export function useHealthConditions() {
  const context = useContext(HealthConditionsContext);
  if (context === undefined) {
    throw new Error('useHealthConditions must be used within a HealthConditionsProvider');
  }
  return context;
} 