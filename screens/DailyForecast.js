import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, FlatList, Image, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';

const API_KEY = 'e15e566cd5b47304a5bbe28c05e39b3a';

export default function DailyForecast() {
  const [forecast, setForecast] = useState(null);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

      const { latitude, longitude } = loc.coords;
      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&cnt=5&appid=${API_KEY}`
      )
        .then((response) => response.json())
        .then((data) => setForecast(data.list))
        .catch(console.error);
    })();
  }, []);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  };

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>{errorMsg}</Text>
      </View>
    );
  }

  if (!forecast) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  const renderForecastItem = ({ item }) => (
    <LinearGradient
      colors={['#2575fc', '#000000']}
      style={styles.forecastItem}
    >
      <Text style={styles.date}>{formatDate(item.dt)}</Text>
      <View style={styles.weatherInfo}>
        <Image
          source={{
            uri: `http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
          }}
          style={styles.weatherIcon}
        />
        <Text style={styles.temp}>{Math.round(item.main.temp)}°C</Text>
      </View>
      <Text style={styles.condition}>{item.weather[0].description}</Text>
      <View style={styles.details}>
        <Text style={styles.humidity}>Humidity: {item.main.humidity}%</Text>
        <Text style={styles.windSpeed}>Wind Speed: {item.wind.speed} m/s</Text>
      </View>
    </LinearGradient>
  );

  return (
    <LinearGradient
      colors={['#000000', '#000000']}
      style={styles.container}
    >
      <Text style={styles.title}>5-Day Weather Forecast</Text>
      <FlatList
        data={forecast}
        renderItem={renderForecastItem}
        keyExtractor={(item) => item.dt.toString()}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    marginBottom: 20,
  },
  forecastItem: {
    backgroundColor: 'transparent',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  date: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  weatherIcon: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  temp: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
  },
  condition: {
    fontSize: 16,
    color: 'white',
    marginBottom: 10,
  },
  details: {
    marginTop: 10,
  },
  humidity: {
    fontSize: 16,
    color: 'white',
  },
  windSpeed: {
    fontSize: 16,
    color: 'white',
  },
  text: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
});
