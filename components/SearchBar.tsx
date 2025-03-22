import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  TouchableOpacity,
  FlatList,
  Text,
  Keyboard,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchLocations } from '../services/air-quality-service';
import { SearchLocation } from '../types/air-quality';

interface SearchBarProps {
  onLocationSelect: (location: SearchLocation) => void;
}

export function SearchBar({ onLocationSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const resultsHeight = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const search = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        const locations = await searchLocations(query);
        setResults(locations);
      } catch (error) {
        console.error('Error searching locations:', error);
      } finally {
        setIsSearching(false);
      }
    };
    
    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);
  
  useEffect(() => {
    Animated.timing(resultsHeight, {
      toValue: isFocused && results.length > 0 ? 300 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [results.length, isFocused, resultsHeight]);
  
  const handleClear = () => {
    setQuery('');
    setResults([]);
  };
  
  const handleSelect = (location: SearchLocation) => {
    onLocationSelect(location);
    setQuery(location.name);
    setResults([]);
    Keyboard.dismiss();
    setIsFocused(false);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Search city, region in India..."
          value={query}
          onChangeText={setQuery}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
      
      <Animated.View style={[styles.resultsContainer, { height: resultsHeight }]}>
        {isSearching ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => `${item.name}-${item.coordinates.latitude}-${item.coordinates.longitude}`}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.resultItem} 
                onPress={() => handleSelect(item)}
              >
                <Ionicons name="location" size={16} color="#4F46E5" style={styles.locationIcon} />
                <View>
                  <Text style={styles.locationName}>
                    {item.name}
                  </Text>
                  {item.state && (
                    <Text style={styles.locationDetail}>
                      {item.city !== item.name ? `${item.city}, ` : ''}{item.state}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 10,
    width: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  clearButton: {
    padding: 4,
  },
  resultsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    maxHeight: 300,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  locationIcon: {
    marginRight: 12,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  locationDetail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 14,
  },
}); 