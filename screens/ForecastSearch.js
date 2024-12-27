import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Button, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { ref, set } from 'firebase/database';
import { database, auth } from '../config/firebase';

const API_KEY = 'e15e566cd5b47304a5bbe28c05e39b3a';

export default function ForecastSearch({ route }) {
  const { favorites, setFavorites } = route.params || {}; // Access favorites and setFavorites from route.params

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [city, setCity] = useState('');

  // Get the user's current location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
    })();
  }, []);

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    setWeather(null); // Reset weather data when selecting a new location
    setErrorMsg(null);
  };

  const fetchWeather = async () => {
    setLoading(true);
    setErrorMsg(null);

    if (city) {
      // If the city is entered, fetch weather for the city
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
        );
        const data = await response.json();
        if (data.cod === 200) {
          setWeather(data);
          setSelectedLocation({ latitude: data.coord.lat, longitude: data.coord.lon }); // Set location based on city
        } else {
          setErrorMsg('No weather data found for this city.');
        }
      } catch (error) {
        setErrorMsg('Failed to fetch weather data. Please try again.');
      }
    } else if (selectedLocation) {
      // If no city is entered, fetch weather for the selected location on the map
      try {
        const { latitude, longitude } = selectedLocation;
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
        );
        const data = await response.json();
        if (data.cod === 200) {
          setWeather(data);
        } else {
          setErrorMsg('No weather data found for this location.');
        }
      } catch (error) {
        setErrorMsg('Failed to fetch weather data. Please try again.');
      }
    } else {
      setErrorMsg('Please select a location on the map or enter a city.');
    }
    setLoading(false);
  };

  const addFavorite = async () => {
    if (weather && !favorites.includes(weather.name)) {
      try {
        const userId = auth.currentUser.uid;
        const newFavorites = [...favorites, weather.name];
        
        // Save to Firebase
        await set(ref(database, `users/${userId}/favorites`), newFavorites);
        
        setFavorites(newFavorites);
        Alert.alert(
          'Success',
          `${weather.name} has been added to your favorites!`,
          [{ text: 'OK' }]
        );
      } catch (error) {
        console.error('Error saving favorite:', error);
        Alert.alert('Error', 'Failed to save favorite location');
      }
    } else if (favorites.includes(weather.name)) {
      Alert.alert(
        'Already in Favorites',
        'This location is already in your favorites list.',
        [{ text: 'OK' }]
      );
    }
  };

  const clearSelection = () => {
    setSelectedLocation(null);
    setWeather(null);
    setErrorMsg(null);
    setCity(''); // Clear the search input
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {userLocation ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
            onPress={handleMapPress}
          >
            {selectedLocation && <Marker coordinate={selectedLocation} />}
          </MapView>
        ) : (
          <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
        )}

        <View style={styles.infoContainer}>
          <LinearGradient colors={['#6a11cb', '#2575fc']} style={styles.gradient}>
            <TextInput
              style={styles.searchBar}
              placeholder="Search for a city"
              value={city}
              onChangeText={(text) => setCity(text)}
            />
            <Button title="Get Weather" onPress={fetchWeather} color="#000" />
          </LinearGradient>

          {loading && <ActivityIndicator size="large" color="#ffffff" style={styles.loader} />}
          {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
          {weather && (
            <View style={styles.weatherContainer}>
              <Text style={styles.text}>Location: {weather.name || 'Unknown'}</Text>
              <Text style={styles.tempText}>{Math.round(weather.main.temp)}°C</Text>
              <Text style={styles.text}>Weather: {weather.weather[0].description}</Text>
              <Text style={styles.text}>Humidity: {weather.main.humidity}%</Text>
              <Text style={styles.text}>Wind Speed: {weather.wind.speed} m/s</Text>
              <Button title="Add to Favorites" onPress={addFavorite} color="#00b300" />
            </View>
          )}

          {selectedLocation && (
            <TouchableOpacity onPress={clearSelection} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear Selection</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: { flex: 1 },
  map: { flex: 1 },
  infoContainer: {
    padding: 10,
    backgroundColor: '#000',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: 8,
    marginBottom: 20,
  },
  loader: { marginVertical: 10 },
  errorText: { color: 'red', marginTop: 10, textAlign: 'center' },
  weatherContainer: { marginTop: 10 },
  text: { fontSize: 16, color: '#fff', marginBottom: 5 },
  tempText: { fontSize: 24, fontWeight: 'bold', color: '#FF5733' },
  clearButton: {
    backgroundColor: '#FF5733',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
});
