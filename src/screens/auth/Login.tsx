import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text as RNText,
  Animated,
  Easing,
} from 'react-native';
import { Input, Text } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { supabase } from '@/services/supabase';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<LoginScreenNavigationProp>();

  // Animated bubble positions
  const bubble1 = useRef(new Animated.ValueXY({ x: -60, y: -80 })).current;
  const bubble2 = useRef(new Animated.ValueXY({ x: 180, y: 0 })).current;
  const bubble3 = useRef(new Animated.ValueXY({ x: 120, y: 600 })).current;
  const bubble4 = useRef(new Animated.ValueXY({ x: 120, y: 300 })).current;

  useEffect(() => {
    // Animate bubbles in a loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(bubble1, {
          toValue: { x: -40, y: -60 }, duration: 8000, useNativeDriver: false, easing: Easing.inOut(Easing.quad)
        }),
        Animated.timing(bubble1, {
          toValue: { x: -60, y: -80 }, duration: 8000, useNativeDriver: false, easing: Easing.inOut(Easing.quad)
        })
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(bubble2, {
          toValue: { x: 200, y: 20 }, duration: 10000, useNativeDriver: false, easing: Easing.inOut(Easing.quad)
        }),
        Animated.timing(bubble2, {
          toValue: { x: 180, y: 0 }, duration: 10000, useNativeDriver: false, easing: Easing.inOut(Easing.quad)
        })
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(bubble3, {
          toValue: { x: 140, y: 620 }, duration: 12000, useNativeDriver: false, easing: Easing.inOut(Easing.quad)
        }),
        Animated.timing(bubble3, {
          toValue: { x: 120, y: 600 }, duration: 12000, useNativeDriver: false, easing: Easing.inOut(Easing.quad)
        })
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(bubble4, {
          toValue: { x: 100, y: 320 }, duration: 12000, useNativeDriver: false, easing: Easing.inOut(Easing.quad)
        }),
        Animated.timing(bubble4, {
          toValue: { x: 120, y: 300 }, duration: 12000, useNativeDriver: false, easing: Easing.inOut(Easing.quad)
        })
      ])
    ).start();
    
  }, []);

  async function handleLogin() {
    if (loading) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.outerContainer}
    >
      <View style={styles.backgroundContainer}>
        <Animated.View style={[styles.bgShape1, bubble1.getLayout(), { backgroundColor: COLORS.accent }]} />
        <Animated.View style={[styles.bgShape2, bubble2.getLayout(), { backgroundColor: COLORS.bright }]} />
        <Animated.View style={[styles.bgShape3, bubble3.getLayout(), { backgroundColor: COLORS.bright }]} />
        <Animated.View style={[styles.bgShape4, bubble4.getLayout(), { backgroundColor: COLORS.brighter }]} />
      </View>
      <View style={styles.container}>
        <Text style={styles.title} h3>Let's learn with stories!</Text>
        <View style={{ height: 32 }} />
        <View style={styles.inputBox}>
          {/* Email Row */}
          <View style={styles.inputRow}>
            <RNText style={styles.label}>Email</RNText>
            <Input
              inputContainerStyle={styles.inputContainer}
              inputStyle={styles.input}
              containerStyle={styles.inputFlex}
              placeholder="giga@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor={COLORS.bright}
            />
          </View>
          {/* Password Row */}
          <View style={styles.inputRow}>
            <RNText style={styles.label}>Password</RNText>
            <Input
              inputContainerStyle={styles.inputContainer}
              inputStyle={styles.input}
              containerStyle={styles.inputFlex}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholderTextColor={COLORS.bright}
            />
          </View>
        </View>
        <View style={{ height: 24 }} />
        <TouchableOpacity
          style={styles.signInButton}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.signInText}>Sign in</Text>
          <View style={styles.arrowCircle}>
            <Ionicons name="arrow-forward" size={24} color={COLORS.background} />
          </View>
        </TouchableOpacity>
        <View style={styles.bottomLinksContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <RNText style={styles.linkText}>Sign up instead</RNText>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  bgShape1: {
    position: 'absolute',
    width: 260,
    height: 180,
    borderBottomRightRadius: 180,
    borderBottomLeftRadius: 120,
    borderTopLeftRadius: 120,
    borderTopRightRadius: 80,
    opacity: 0.9,
  },
  bgShape2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 120,
    opacity: 0.9,
  },
  bgShape3: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.9,
  },
  bgShape4: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.9,
  },
  container: {
    flex: 1,
    zIndex: 1,
    paddingHorizontal: 32,
    paddingTop: 80,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
    fontFamily: 'Poppins-Bold', // You need to load this font in your app
  },
  inputBox: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    width: 80,
    marginRight: 8,
    marginBottom: 0,
  },
  inputFlex: {
    flex: 1,
    marginLeft: 0,
    marginRight: 0,
    paddingRight: 0,
    paddingLeft: 0,
  },
  inputContainer: {
    borderBottomWidth: 2,
    borderColor: COLORS.accent,
    backgroundColor: 'transparent',
    marginBottom: -8,
  },
  input: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
    fontFamily: 'Poppins-Regular',
    paddingLeft: 0,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 16,
    backgroundColor: 'transparent',
  },
  signInText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: 16,
    fontFamily: 'Poppins-Bold',
  },
  arrowCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  bottomLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 48,
    marginHorizontal: 4,
  },
  linkText: {
    color: COLORS.accent,
    textDecorationLine: 'underline',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
}); 