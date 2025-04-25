import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BookshelfScreen from '../screens/Bookshelf';
import StoryReader from '../screens/StoryReader';
import NewStoryScreen from '../screens/NewStory';
import ProfileScreen from '../screens/Profile';
import { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Bookshelf" 
        component={BookshelfScreen}
        options={({ navigation }) => ({
          headerRight: () => (
            <TouchableOpacity
              style={{ marginRight: 15 }}
              onPressIn={() => navigation.navigate('Profile')}
            >
              <Ionicons name="person-circle-outline" size={28} color="#000" />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen 
        name="NewStory" 
        component={NewStoryScreen}
        options={{ title: 'Create Story' }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
      />
      <Stack.Screen 
        name="StoryReader" 
        component={StoryReader}
        options={{ 
          headerShown: true,
          headerBackTitle: "Back",
          title: "Story"
        }}
      />
    </Stack.Navigator>
  );
} 