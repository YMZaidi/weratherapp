import React, { useState, useEffect } from 'react';
import { StatusBar, TouchableOpacity, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { Ionicons } from '@expo/vector-icons';
import { ref, onValue } from 'firebase/database';
import { database } from '../config/firebase';

// Import your screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import CurrentForecast from '../screens/CurrentForecast';
import DailyForecast from '../screens/DailyForecast';
import ForecastSearch from '../screens/ForecastSearch';
import CameraPage from '../screens/CameraPage';
import FavoritesScreen from '../screens/FavoritesScreen';
import JournalScreen from '../screens/JournalScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const userId = auth.currentUser.uid;
    const favoritesRef = ref(database, `users/${userId}/favorites`);
    
    const unsubscribe = onValue(favoritesRef, (snapshot) => {
      const data = snapshot.val();
      if (data && JSON.stringify(data) !== JSON.stringify(favorites)) {
        setFavorites(data || []);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSetFavorites = (newFavorites) => {
    if (JSON.stringify(newFavorites) !== JSON.stringify(favorites)) {
      setFavorites(newFavorites);
    }
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#000' },
        headerTintColor: '#fff',
        tabBarStyle: { backgroundColor: '#000' },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#d1d1d1',
        headerRight: () => (
          <TouchableOpacity
            style={{ marginRight: 15 }}
            onPress={() => {
              Alert.alert(
                'Logout',
                'Are you sure you want to logout?',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await signOut(auth);
                      } catch (error) {
                        console.error('Error logging out:', error);
                        Alert.alert('Error', 'Failed to logout');
                      }
                    },
                  },
                ],
              );
            }}
          >
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        ),
      }}
    >
      <Tab.Screen 
        name="Current"
        component={CurrentForecast}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="sunny" color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="Daily"
        component={DailyForecast}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Search"
        component={ForecastSearch}
        initialParams={{ favorites, setFavorites: handleSetFavorites }}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="search" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={() => (
          <FavoritesScreen 
            favorites={favorites} 
            setFavorites={handleSetFavorites}
          />
        )}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="heart" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Camera"
        component={CameraPage}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="camera" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Journal"
        component={JournalScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="journal" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return null;
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <Stack.Screen name="MainApp" component={TabNavigator} />
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
