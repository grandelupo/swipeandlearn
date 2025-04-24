import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from './types';
import BookshelfScreen from '../screens/Bookshelf';
import NewStoryScreen from '../screens/NewStory';
import ProfileScreen from '../screens/Profile';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Bookshelf') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'NewStory') {
            iconName = focused ? 'create' : 'create-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Bookshelf" component={BookshelfScreen} />
      <Tab.Screen name="NewStory" component={NewStoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
} 