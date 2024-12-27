import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const SplashScreen = () => (
  <LinearGradient colors={['#2575fc', '#000000']} style={styles.container}>
    <Text style={styles.title}>Aervion Weather App</Text>
  </LinearGradient>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
});
