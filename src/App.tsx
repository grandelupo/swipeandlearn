import { StoryCacheProvider } from './contexts/StoryCacheContext';
import { AuthProvider } from './contexts/AuthContext';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <StoryCacheProvider>
        <NavigationContainer>
          <Stack.Navigator>
            // ... existing code ...
          </Stack.Navigator>
        </NavigationContainer>
      </StoryCacheProvider>
    </AuthProvider>
  );
} 