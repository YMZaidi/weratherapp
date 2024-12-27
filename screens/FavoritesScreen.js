import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from 'react-native-vector-icons';
import { ref, onValue, set } from 'firebase/database';
import { database, auth } from '../config/firebase';

const API_KEY = 'e15e566cd5b47304a5bbe28c05e39b3a';

export default function FavoritesScreen({ favorites, setFavorites }) {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch weather data when favorites change
  useEffect(() => {
    if (favorites && favorites.length > 0) {
      fetchWeatherData();
    } else {
      setWeatherData([]);
    }
  }, [favorites]);

  // Listen to Firebase favorites
  useEffect(() => {
    const userId = auth.currentUser.uid;
    const favoritesRef = ref(database, `users/${userId}/favorites`);
    
    const unsubscribe = onValue(favoritesRef, (snapshot) => {
      const data = snapshot.val();
      if (data && JSON.stringify(data) !== JSON.stringify(favorites)) {
        setFavorites(data);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchWeatherData = async () => {
    setLoading(true);
    const weatherResponses = [];

    for (let city of favorites) {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
        );
        const data = await response.json();
        if (data.cod === 200) {
          weatherResponses.push(data);
        }
      } catch (error) {
        console.error(`Error fetching weather for ${city}:`, error);
      }
    }

    setWeatherData(weatherResponses);
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchWeatherData();
  }, [favorites]);

  const removeFromFavorites = (cityName) => {
    Alert.alert(
      'Remove Location',
      `Are you sure you want to remove ${cityName} from favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const userId = auth.currentUser.uid;
              const newFavorites = favorites.filter(city => city !== cityName);
              
              // Save to Firebase
              await set(ref(database, `users/${userId}/favorites`), newFavorites);
              
              setFavorites(newFavorites);
            } catch (error) {
              console.error('Error removing favorite:', error);
              Alert.alert('Error', 'Failed to remove favorite location');
            }
          }
        }
      ]
    );
  };

  if (favorites.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.emptyText}>No favorite locations added yet.</Text>
          <Text style={styles.emptySubText}>Search for a location and add it to favorites!</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          data={weatherData}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor="#fff"
            />
          }
          ListHeaderComponent={
            <Text style={styles.headerText}>Your Favorite Locations</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.weatherCard}
              onLongPress={() => removeFromFavorites(item.name)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cityName}>{item.name}</Text>
                <Text style={styles.temperature}>{Math.round(item.main.temp)}°C</Text>
              </View>
              <View style={styles.weatherInfo}>
                <Text style={styles.weatherText}>
                  {item.weather[0].description}
                </Text>
                <View style={styles.weatherDetails}>
                  <Text style={styles.detailText}>
                    Humidity: {item.main.humidity}%
                  </Text>
                  <Text style={styles.detailText}>
                    Wind: {Math.round(item.wind.speed)} m/s
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#000',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  weatherCard: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cityName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  temperature: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF5733',
  },
  weatherInfo: {
    borderTopWidth: 1,
    borderTopColor: '#444',
    paddingTop: 8,
  },
  weatherText: {
    fontSize: 16,
    color: '#fff',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#ccc',
  },
  emptyText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginTop: 40,
  },
  emptySubText: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 8,
  },
});
