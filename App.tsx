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
import { getOrCreateGuestSession, shouldShowRegisterScreen } from './src/services/guestAuth';
import { DeepLinkingService } from './src/services/deepLinking';
import { navigationService } from './src/services/navigationService';

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

function AuthNavigator({ initialRoute = 'Login' }: { initialRoute?: 'Login' | 'Register' }) {
  return (
    <AuthStack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRoute}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    // Set up deep link listeners
    const cleanup = DeepLinkingService.setupDeepLinkListeners((storyId, pageNumber) => {
      // Navigate to the story when a deep link is opened
      if (session) {
        navigationService.navigateToStory(storyId, pageNumber);
      }
    });

    return cleanup;
  }, [session]);

  const initializeApp = async () => {
    try {
      // Initialize RevenueCat
      initializeRevenueCat();

      // Check for existing session first
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log('Existing session found');
        setSession(session);
      } else {
        console.log('No existing session, checking register flag');
        // Check if user should see register screen
        const shouldRegister = await shouldShowRegisterScreen();
        setShowRegister(shouldRegister);
        
        if (!shouldRegister) {
          // No existing session and no register flag, create/get guest session
          console.log('Creating guest session');
          const guestSession = await getOrCreateGuestSession();
          if (guestSession) {
            setSession(guestSession);
          }
        }
      }

      // Set up auth state change listener
      supabase.auth.onAuthStateChange((_event, session) => {
        console.log('Auth state changed:', _event, session?.user?.email);
        setSession(session);
      });
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <SafeAreaProvider>
      <StoryCacheProvider>
        <CoinProvider>
          <FeedbackButtonProvider>
            <NavigationContainer ref={(navigator) => navigationService.setNavigator(navigator)}>
              <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isInitializing ? (
                  // Show loading screen while initializing
                  <Stack.Screen name="Loading" component={() => null} />
                ) : session ? (
                  <Stack.Screen name="Main" component={MainStack} />
                ) : (
                  <Stack.Screen name="Auth">
                    {() => <AuthNavigator initialRoute='Register' />}
                  </Stack.Screen>
                )}
              </Stack.Navigator>
            </NavigationContainer>
          </FeedbackButtonProvider>
        </CoinProvider>
      </StoryCacheProvider>
    </SafeAreaProvider>
  );
}