import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text as RNText,
} from 'react-native';
import { Input, Text } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { supabase } from '@/services/supabase';
import { OAuthService } from '@/services/oauth';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import AnimatedBackground from '@/components/AnimatedBackground';
import { t } from '@/i18n/translations';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | null>(null);
  const navigation = useNavigation<LoginScreenNavigationProp>();

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
      Alert.alert(t('error'), t('invalidCredentials'));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    if (oauthLoading) return;
    setOauthLoading('google');
    try {
      const result = await OAuthService.signInWithGoogle();
      if (result === null) {
        // User cancelled the OAuth flow
        console.log('User cancelled Google login');
      } else {
        // Success - user should be logged in now
        console.log('Google login successful');
      }
    } catch (error: any) {
      Alert.alert(t('error'), error.message || 'Google login failed');
    } finally {
      setOauthLoading(null);
    }
  }



  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.outerContainer}
    >
      <AnimatedBackground variant="auth" />
      <View style={styles.container}>
        <Text style={styles.title} h3>{t('login')}</Text>
        <View style={{ height: 32 }} />
        <View style={styles.inputBox}>
          {/* Email Row */}
          <View style={styles.inputRow}>
            <RNText style={styles.label}>{t('email')}</RNText>
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
            <RNText style={styles.label}>{t('password')}</RNText>
            <Input
              inputContainerStyle={styles.inputContainer}
              inputStyle={styles.input}
              containerStyle={styles.inputFlex}
              placeholder={t('password')}
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
          <Text style={styles.signInText}>{t('signIn')}</Text>
          <View style={styles.arrowCircle}>
            <Ionicons name="arrow-forward" size={24} color={COLORS.background} />
          </View>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <RNText style={styles.dividerText}>{t('or')}</RNText>
          <View style={styles.dividerLine} />
        </View>

        {/* OAuth Buttons */}
        <View style={styles.oauthContainer}>
          <TouchableOpacity
            style={[styles.oauthButton, styles.googleButton]}
            onPress={handleGoogleLogin}
            disabled={oauthLoading === 'google'}
          >
            <Ionicons 
              name="logo-google" 
              size={24} 
              color={COLORS.accent} 
              style={styles.oauthIcon} 
            />
            <RNText style={styles.oauthButtonText}>
              {oauthLoading === 'google' ? t('loading') : t('continueWithGoogle')}
            </RNText>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomLinksContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <RNText style={styles.linkText}>{t('dontHaveAccount')}</RNText>
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.bright,
    opacity: 0.3,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 16,
    color: COLORS.bright,
    fontFamily: 'Poppins-Regular',
  },
  oauthContainer: {
    gap: 16,
  },
  oauthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  googleButton: {
    borderWidth: 1,
    borderColor: COLORS.bright,
  },
  oauthIcon: {
    marginRight: 12,
  },
  oauthButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    fontFamily: 'Poppins-SemiBold',
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