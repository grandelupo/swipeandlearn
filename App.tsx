import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Session } from '@supabase/supabase-js';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { supabase } from './src/services/supabase';
import { RootStackParamList, AuthStackParamList } from './src/navigation/types';
import MainStack from './src/navigation/MainStack';
import LoginScreen from './src/screens/auth/Login';
import RegisterScreen from './src/screens/auth/Register';
import { StoryCacheProvider } from './src/contexts/StoryCacheContext';
import { CoinProvider } from './src/contexts/CoinContext';
import { initializeRevenueCat } from './src/services/revenuecat';
import { FeedbackButtonProvider } from '@/contexts/FeedbackButtonContext';

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Initialize RevenueCat
    initializeRevenueCat();

    // Set up Supabase auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <StoryCacheProvider>
        <CoinProvider>
          <FeedbackButtonProvider>
            <NavigationContainer>
              <Stack.Navigator screenOptions={{ headerShown: false }}>
                {session ? (
                  <Stack.Screen name="Main" component={MainStack} />
                ) : (
                  <Stack.Screen name="Auth" component={AuthNavigator} />
                )}
              </Stack.Navigator>
            </NavigationContainer>
          </FeedbackButtonProvider>
        </CoinProvider>
      </StoryCacheProvider>
    </SafeAreaProvider>
  );
}