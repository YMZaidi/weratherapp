import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';

const API_KEY = 'e15e566cd5b47304a5bbe28c05e39b3a';

export default function CurrentForecast() {
  const [weather, setWeather] = useState(null);
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
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&APPID=${API_KEY}`
      )
        .then((response) => response.json())
        .then((data) => setWeather(data))
        .catch(console.error);
    })();
  }, []);

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>{errorMsg}</Text>
      </View>
    );
  }

  if (!weather) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#2575fc', '#000000']}
      style={styles.gradientContainer}
    >
      <View style={styles.container}>
        <Text style={styles.timezone}>{weather.name}</Text>
        
        <View style={styles.mainInfoContainer}>
          <Image
            source={{
              uri: `http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`,
            }}
            style={styles.weatherIcon}
          />
          <Text style={styles.currentDegrees}>{Math.round(weather.main.temp)}°C</Text>
        </View>

        <Text style={styles.description}>{weather.weather[0].description}</Text>

        <View style={styles.secondaryInfoContainer}>
          <View style={styles.row}>
            <View style={styles.detailsBox}>
              <Text style={styles.label}>Feels Like</Text>
              <Text style={styles.details}>{Math.round(weather.main.feels_like)}°C</Text>
            </View>
            <View style={styles.detailsBox}>
              <Text style={styles.label}>Humidity</Text>
              <Text style={styles.details}>{weather.main.humidity}%</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.detailsBox}>
              <Text style={styles.label}>Wind</Text>
              <Text style={styles.details}>{weather.wind.speed} m/s</Text>
            </View>
            <View style={styles.detailsBox}>
              <Text style={styles.label}>Pressure</Text>
              <Text style={styles.details}>{weather.main.pressure} hPa</Text>
            </View>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  timezone: {
    color: 'white',
    fontSize: 20,
    marginTop: 10,
  },
  mainInfoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherIcon: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  currentDegrees: {
    color: 'white',
    fontSize: 60,
    fontWeight: 'bold',
  },
  description: {
    color: 'white',
    fontSize: 18,
    textTransform: 'capitalize',
    marginBottom: 20,
  },
  secondaryInfoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    width: '90%',
    padding: 15,
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  detailsBox: {
    alignItems: 'center',
  },
  label: {
    color: 'white',
    fontSize: 16,
  },
  details: {
    color: 'white',
    fontSize: 18,
  },
});
