import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import StoryReader from '../screens/StoryReader';
import { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MainTabs" 
        component={TabNavigator}
        options={{ headerShown: false }}
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