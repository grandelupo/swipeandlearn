import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BookshelfScreen from '../screens/Bookshelf';
import StoryReader from '../screens/StoryReader';
import NewStoryScreen from '../screens/NewStory';
import ProfileScreen from '../screens/Profile';
import { MainStackParamList } from './types';
import CoinCounter from '@/components/CoinCounter';

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Bookshelf" 
        component={BookshelfScreen}
        options={({ navigation }) => ({
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              <CoinCounter />
              <TouchableOpacity
                style={styles.profileButton}
                onPressIn={() => navigation.navigate('Profile')}
              >
                <Ionicons name="person-circle-outline" size={28} color="#000" />
              </TouchableOpacity>
            </View>
          ),
        })}
      />
      <Stack.Screen 
        name="NewStory" 
        component={NewStoryScreen}
        options={{ 
          title: 'Create Story',
          headerRight: () => <CoinCounter />
        }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          headerRight: () => <CoinCounter />
        }}
      />
      <Stack.Screen 
        name="StoryReader" 
        component={StoryReader}
        options={{ 
          headerShown: true,
          headerBackTitle: "Back",
          title: "Story",
          headerRight: () => <CoinCounter />
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    marginLeft: 10,
  }
}); 