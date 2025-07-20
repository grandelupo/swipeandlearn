import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text as RNText,
  ScrollView,
} from 'react-native';
import { Input, Text } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { supabase } from '@/services/supabase';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import AnimatedBackground from '@/components/AnimatedBackground';
import { t } from '@/i18n/translations';
import { isGuestUser, convertGuestToRegistered, convertGuestToRegisteredOAuth, getGuestMigrationPreview, getStoredGuestMigrationData, clearStoredGuestMigrationData } from '@/services/guestAuth';
import { OAuthService } from '@/services/oauth';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [guestData, setGuestData] = useState<any>(null);
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  useEffect(() => {
    checkForGuestData();
  }, []);

  const checkForGuestData = async () => {
    try {
      // First check for stored guest migration data
      const storedData = await getStoredGuestMigrationData();
      if (storedData.migrationData) {
        setGuestData(storedData.migrationData);
        console.log('Stored guest data found:', storedData.migrationData);
        return;
      }

      // Fallback: check current user for guest data
      const preview = await getGuestMigrationPreview();
      if (preview) {
        setGuestData(preview);
        console.log('Current guest data found:', preview);
      }
    } catch (error) {
      console.error('Error checking for guest data:', error);
    }
  };

  async function handleRegister() {
    if (loading || isConverting) return;
    if (password !== confirmPassword) {
      Alert.alert(t('error'), t('passwordsDontMatch'));
      return;
    }
    
    setLoading(true);
    try {
      // Check if we have stored guest data for migration
      const storedData = await getStoredGuestMigrationData();
      
      if (storedData.guestUserId) {
        // Convert guest account to registered account with data migration
        setIsConverting(true);
        
        // Show user what will be migrated
        const migrationMessage = guestData ? 
          `${t('accountConverted')}\n\nData to be transferred:\n• ${guestData.stories_to_migrate} stories\n• ${guestData.guest_coins} coins + 50 bonus coins\n• Your preferences and settings` :
          t('accountConverted');
        
        const success = await convertGuestToRegistered(email, password);
        
        if (success) {
          Alert.alert(
            t('register'),
            migrationMessage,
            [{ text: 'OK' }]
          );
          // User will be automatically navigated to main app
          return;
        } else {
          throw new Error(t('errorConvertingAccount'));
        }
              } else {
          // Regular registration for non-guest users
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });
          
          if (error) throw error;
          
          if (data.session && data.user) {
            // Apply referral code if provided
            if (referralCode.trim()) {
              try {
                const { data: referralResult, error: referralError } = await supabase.rpc(
                  'use_referral_code',
                  {
                    referral_code: referralCode.trim().toUpperCase(),
                    new_user_id: data.user.id
                  }
                );
                
                if (referralError) {
                  console.error('Referral code error:', referralError);
                } else if (referralResult) {
                  console.log('Referral code applied successfully');
                } else {
                  console.log('Invalid referral code');
                }
              } catch (referralError) {
                console.error('Error applying referral code:', referralError);
              }
            }
            
            // User is immediately signed in
            return;
          }
          
          Alert.alert(
            t('register'),
            t('registrationSuccess'),
            [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
          );
        }
    } catch (error: any) {
      Alert.alert(t('error'), error.message || t('errorUnknown'));
    } finally {
      setLoading(false);
      setIsConverting(false);
    }
  }

  async function handleGoogleRegister() {
    if (oauthLoading || isConverting) return;
    setOauthLoading('google');
    
    let guestUserId: string | null = null;
    let wasGuest = false;
    
    try {
      // Check if we have stored guest data for migration
      const storedData = await getStoredGuestMigrationData();
      
      if (storedData.guestUserId) {
        wasGuest = true;
        guestUserId = storedData.guestUserId;
        setIsConverting(true);
        
        console.log('Starting OAuth conversion for guest user:', guestUserId);
        
        // For guest users, we need to temporarily store guest data
        // The OAuth flow will create a new user, and we'll migrate afterward
      }
      
      const result = await OAuthService.signInWithGoogle();
      if (result === null) {
        // User cancelled the OAuth flow
        console.log('User cancelled Google registration');
        
        // If user was a guest and cancelled, clear the stored data since they're staying as guest
        if (wasGuest && guestUserId) {
          console.log('OAuth cancelled, clearing stored guest migration data');
          await clearStoredGuestMigrationData();
        }
      } else {
        // OAuth success - get the new user
        const { data: { user: newUser } } = await supabase.auth.getUser();
        
        if (wasGuest && guestUserId && newUser) {
          console.log('OAuth successful, migrating guest data from', guestUserId, 'to', newUser.id);
          
          // Migrate guest data to the new OAuth user
          const { data: migrationResult, error: migrationError } = await supabase.rpc(
            'convert_guest_to_registered_with_migration',
            {
              guest_user_id: guestUserId,
              new_user_id: newUser.id,
              new_email: newUser.email,
            }
          );

          if (migrationError) {
            console.error('OAuth migration error:', migrationError);
            throw migrationError;
          }

          console.log('OAuth migration completed:', migrationResult);

          // Clear stored migration data
          await clearStoredGuestMigrationData();

          // Show migration success message
          const migrationMessage = guestData ? 
            `${t('accountConverted')}\n\nData transferred:\n• ${guestData.stories_to_migrate} stories\n• ${guestData.guest_coins} coins + 50 bonus coins\n• Your preferences and settings` :
            t('accountConverted');

          Alert.alert(
            t('register'),
            migrationMessage,
            [{ text: 'OK' }]
          );
        } else if (newUser) {
          // Apply referral code for new OAuth users
          if (referralCode.trim()) {
            try {
              const { data: referralResult, error: referralError } = await supabase.rpc(
                'use_referral_code',
                {
                  referral_code: referralCode.trim().toUpperCase(),
                  new_user_id: newUser.id
                }
              );
              
              if (referralError) {
                console.error('Referral code error:', referralError);
              } else if (referralResult) {
                console.log('Referral code applied successfully');
              } else {
                console.log('Invalid referral code');
              }
            } catch (referralError) {
              console.error('Error applying referral code:', referralError);
            }
          }
        }
        
        console.log('Google registration successful');
      }
    } catch (error: any) {
      console.error('Google OAuth registration error:', error);
      Alert.alert(t('error'), error.message || 'Google registration failed');
    } finally {
      setOauthLoading(null);
      setIsConverting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.outerContainer}
    >
      <AnimatedBackground variant="auth" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.title} h3>{t('register')}</Text>
          <View style={{ height: 16 }} />
          <View style={styles.inputBox}>
            {/* Email Row */}
            <View style={styles.inputRow}>
              <RNText style={styles.label}>{t('email')}</RNText>
              <Input
                inputContainerStyle={styles.inputContainer}
                inputStyle={styles.input}
                containerStyle={styles.inputFlex}
                placeholder="brzeczyski@gmail.com"
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
            {/* Confirm Password Row */}
            <View style={styles.inputRow}>
              <RNText style={styles.label}>{t('confirmPassword')}</RNText>
              <Input
                inputContainerStyle={styles.inputContainer}
                inputStyle={styles.input}
                containerStyle={styles.inputFlex}
                placeholder={t('confirmPassword')}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                placeholderTextColor={COLORS.bright}
              />
            </View>
            {/* Referral Code Row */}
            <View style={styles.inputRow}>
              <RNText style={styles.label}>{t('referral')}</RNText>
              <Input
                inputContainerStyle={styles.inputContainer}
                inputStyle={styles.input}
                containerStyle={styles.inputFlex}
                placeholder={t('referralCodePlaceholder')}
                value={referralCode}
                onChangeText={setReferralCode}
                autoCapitalize="characters"
                placeholderTextColor={COLORS.bright}
              />
            </View>
          </View>
          <View style={{ height: 16 }} />
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={handleRegister}
            disabled={loading || isConverting}
          >
            <Text style={styles.signUpText}>
              {isConverting ? t('convertingAccount') : t('signUp')}
            </Text>
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
              onPress={handleGoogleRegister}
              disabled={oauthLoading === 'google' || isConverting}
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
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <RNText style={styles.linkText}>{t('alreadyHaveAccount')}</RNText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    zIndex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  inputBox: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    width: 70,
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
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    fontFamily: 'Poppins-Regular',
    paddingLeft: 0,
  },
  signUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 12,
    backgroundColor: 'transparent',
  },
  signUpText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: 12,
    fontFamily: 'Poppins-Bold',
  },
  arrowCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    justifyContent: 'center',
    marginTop: 24,
    marginHorizontal: 4,
  },
  linkText: {
    color: COLORS.accent,
    textDecorationLine: 'underline',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.bright,
    opacity: 0.4,
  },
  dividerText: {
    color: COLORS.bright,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginHorizontal: 12,
  },
  oauthContainer: {
    gap: 8,
    marginBottom: 16,
  },
  oauthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.bright,
    backgroundColor: COLORS.card,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  googleButton: {
    borderColor: COLORS.accent,
  },
  oauthIcon: {
    marginRight: 10,
  },
  oauthButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    fontFamily: 'Poppins-SemiBold',
  },
}); 