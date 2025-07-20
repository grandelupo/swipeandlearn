import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, ScrollView, Animated, Easing } from 'react-native';
import { Text, Button, ListItem, Input, Switch } from '@rneui/themed';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';
import { supabase } from '@/services/supabase';
import { COLORS } from '@/constants/colors';
import { t } from '@/i18n/translations';
import { clearStoredGuestMigrationData, isGuestUser } from '@/services/guestAuth';

const TRANSLATION_LANGUAGES = [
  { label: 'English', value: 'English' },
  { label: 'Spanish', value: 'Spanish' },
  { label: 'French', value: 'French' },
  { label: 'German', value: 'German' },
  { label: 'Italian', value: 'Italian' },
  { label: 'Portuguese', value: 'Portuguese' },
  { label: 'Chinese', value: 'Chinese' },
  { label: 'Japanese', value: 'Japanese' },
  { label: 'Korean', value: 'Korean' },
  { label: 'Russian', value: 'Russian' },
  { label: 'Arabic', value: 'Arabic' },
  { label: 'Polish', value: 'Polish' },
  { label: 'Ukrainian', value: 'Ukrainian' },
];

export default function ProfileScreen() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [totalStories, setTotalStories] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [translationLanguage, setTranslationLanguage] = useState<string>('English');
  const [useGrok, setUseGrok] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  // Animated accent circles
  const circle1 = useRef(new Animated.ValueXY({ x: -80, y: -60 })).current;
  const circle2 = useRef(new Animated.ValueXY({ x: 120, y: 200 })).current;
  const circle3 = useRef(new Animated.ValueXY({ x: 40, y: 600 })).current;

  useEffect(() => {
    fetchUserData();
    fetchProfile();
    Animated.loop(
      Animated.sequence([
        Animated.timing(circle1, { toValue: { x: -60, y: -40 }, duration: 12000, useNativeDriver: false, easing: Easing.inOut(Easing.quad) }),
        Animated.timing(circle1, { toValue: { x: -80, y: -60 }, duration: 12000, useNativeDriver: false, easing: Easing.inOut(Easing.quad) })
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(circle2, { toValue: { x: 140, y: 220 }, duration: 15000, useNativeDriver: false, easing: Easing.inOut(Easing.quad) }),
        Animated.timing(circle2, { toValue: { x: 120, y: 200 }, duration: 15000, useNativeDriver: false, easing: Easing.inOut(Easing.quad) })
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(circle3, { toValue: { x: 60, y: 620 }, duration: 18000, useNativeDriver: false, easing: Easing.inOut(Easing.quad) }),
        Animated.timing(circle3, { toValue: { x: 40, y: 600 }, duration: 18000, useNativeDriver: false, easing: Easing.inOut(Easing.quad) })
      ])
    ).start();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);

      const { count, error } = await supabase
        .from('stories')
        .select('*', { count: 'exact' });

      if (error) throw error;
      setTotalStories(count || 0);
    } catch (error) {
      console.error(t('errorUnknown'), error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(t('notAuthenticated'));

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      if (data?.preferred_translation_language) {
        setTranslationLanguage(data.preferred_translation_language);
      }
      setUseGrok(data?.preferred_model === 'grok');
    } catch (error) {
      console.error(t('errorLoadingProfile'), error);
      Alert.alert(t('errorUnknown'), t('errorLoadingProfile'));
    }
  };

  const handleLogout = async () => {
    try {
      // Check if current user is a guest before signing out
      const { data: { user } } = await supabase.auth.getUser();
      const isGuest = user && isGuestUser(user.email);
      
      // Sign out the user
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // If the user was NOT a guest, clear any stored migration data
      // This prevents data from being copied to new accounts when regular users sign out
      if (!isGuest) {
        await clearStoredGuestMigrationData();
        console.log('Cleared stored migration data for regular user logout');
      }
    } catch (error) {
      console.error(t('errorSigningOut'), error);
      Alert.alert(t('errorUnknown'), t('errorSigningOut'));
    }
  };

  const updateTranslationLanguage = async (language: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(t('notAuthenticated'));

      const { error } = await supabase
        .from('profiles')
        .update({ preferred_translation_language: language })
        .eq('id', user.id);

      if (error) throw error;
      setTranslationLanguage(language);
    } catch (error) {
      console.error(t('errorUpdatingTranslationLanguage'), error);
      Alert.alert(t('errorUnknown'), t('errorUpdatingTranslationLanguage'));
    } finally {
      setLoading(false);
    }
  };

  const updateModelPreference = async (useGrok: boolean) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(t('notAuthenticated'));

      const { error } = await supabase
        .from('profiles')
        .update({ preferred_model: useGrok ? 'grok' : 'gpt4' })
        .eq('id', user.id);

      if (error) throw error;
      setUseGrok(useGrok);
    } catch (error) {
      console.error(t('errorUpdatingModelPreference'), error);
      Alert.alert(t('errorUnknown'), t('errorUpdatingModelPreference'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.outerContainer}>
        <Text style={styles.loadingText}>{t('loadingProfile')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <View style={styles.backgroundContainer}>
        <Animated.View style={[styles.circle, circle1.getLayout(), { backgroundColor: COLORS.accent, opacity: 0.18 }]} />
        <Animated.View style={[styles.circle, circle2.getLayout(), { backgroundColor: COLORS.bright, opacity: 0.13 }]} />
        <Animated.View style={[styles.circle, circle3.getLayout(), { backgroundColor: COLORS.brighter, opacity: 0.10 }]} />
      </View>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.headerText}>{t('profileSettings')}</Text>
        <View style={styles.profileBox}>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>{t('email')}</Text>
            <Text style={styles.profileValue}>{userEmail}</Text>
          </View>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>{t('totalStoriesCreated')}</Text>
            <Text style={styles.profileValue}>{totalStories}</Text>
          </View>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>{t('allowInappropriateLanguage')}</Text>
            <Switch
              value={useGrok}
              onValueChange={updateModelPreference}
              trackColor={{ false: COLORS.brighter, true: COLORS.accent }}
              thumbColor={useGrok ? COLORS.accent : COLORS.card}
              disabled={loading}
            />
          </View>
          <View style={styles.profileColumn}>
            <Text style={styles.profileLabel}>{t('preferredTranslationLanguage')}</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={translationLanguage}
                onValueChange={updateTranslationLanguage}
                style={styles.picker}
                enabled={!loading}
              >
                {TRANSLATION_LANGUAGES.map((lang) => (
                  <Picker.Item
                    key={lang.value}
                    label={lang.label}
                    value={lang.value}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>
        <Button
          title={t('viewArchivedStories')}
          onPress={() => navigation.navigate('Archive')}
          containerStyle={styles.archiveButton}
          buttonStyle={{ backgroundColor: COLORS.accent, borderRadius: 16 }}
          titleStyle={{ color: COLORS.card, fontFamily: 'Poppins-Bold' }}
          type="solid"
        />
        <Button
          title={t('logout')}
          onPress={handleLogout}
          buttonStyle={styles.logoutButton}
          titleStyle={{ fontFamily: 'Poppins-Bold' }}
          containerStyle={styles.logoutButtonContainer}
        />
      </ScrollView>
    </View>
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
  circle: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  container: {
    flex: 1,
    zIndex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    backgroundColor: 'transparent',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: 'Poppins-Bold',
    marginBottom: 24,
  },
  profileBox: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 24,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingVertical: 10,
  },
  profileColumn: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 14,
    paddingVertical: 10,
  },
  profileLabel: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    marginRight: 8,
    marginBottom: 0,
  },
  profileValue: {
    fontSize: 16,
    color: COLORS.accent,
    fontFamily: 'Poppins-Regular',
    flex: 1,
    textAlign: 'right',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 4,
    marginBottom: 0,
    marginHorizontal: 0,
    width: '100%',
    backgroundColor: COLORS.card,
  },
  picker: {
    color: COLORS.primary,
    fontFamily: 'Poppins-Regular',
  },
  archiveButton: {
    marginTop: 20,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
  },
  logoutButtonContainer: {
    marginTop: 10,
    marginHorizontal: 10,
    marginBottom: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
    color: COLORS.primary,
    fontFamily: 'Poppins-Bold',
  },
}); 