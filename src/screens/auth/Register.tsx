import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Input, Button, Text } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { supabase } from '@/services/supabase';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  async function handleRegister() {
    if (loading) return;
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        // User is automatically signed in (email confirmation is disabled)
        return;
      }

      // Email confirmation is enabled
      Alert.alert(
        'Registration Successful',
        'Please check your email for verification.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text h3 style={styles.title}>Create Account</Text>
        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />
        <Input
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
        />
        <Button
          title={loading ? 'Creating Account...' : 'Create Account'}
          onPress={handleRegister}
          loading={loading}
          containerStyle={styles.buttonContainer}
        />
        <Button
          title="Already have an account? Login"
          type="clear"
          onPress={() => navigation.navigate('Login')}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    marginVertical: 10,
  },
}); 