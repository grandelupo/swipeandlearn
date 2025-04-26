import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, Button, ListItem, Input, Switch } from '@rneui/themed';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '@/services/supabase';

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
];

export default function ProfileScreen() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [totalStories, setTotalStories] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [translationLanguage, setTranslationLanguage] = useState<string>('English');
  const [useGrok, setUseGrok] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchProfile();
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
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

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
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const updateTranslationLanguage = async (language: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ preferred_translation_language: language })
        .eq('id', user.id);

      if (error) throw error;
      setTranslationLanguage(language);
    } catch (error) {
      console.error('Error updating translation language:', error);
      Alert.alert('Error', 'Failed to update translation language');
    } finally {
      setLoading(false);
    }
  };

  const updateModelPreference = async (useGrok: boolean) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ preferred_model: useGrok ? 'grok' : 'gpt4' })
        .eq('id', user.id);

      if (error) throw error;
      setUseGrok(useGrok);
    } catch (error) {
      console.error('Error updating AI model preference:', error);
      Alert.alert('Error', 'Failed to update AI model preference');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Profile settings</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.modelPreference}>
          <Text style={styles.modelPreferenceText}>Allow inappropriate language in story generation</Text>
          <Switch
            value={useGrok}
            onValueChange={updateModelPreference}
            style={styles.switch}
            disabled={loading}
          />
        </View>

        <Text style={styles.label}>Preferred Translation Language</Text>
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

        <ListItem bottomDivider>
          <ListItem.Content>
            <ListItem.Title>Email</ListItem.Title>
            <ListItem.Subtitle>{userEmail}</ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>

        <ListItem bottomDivider>
          <ListItem.Content>
            <ListItem.Title>Total Stories</ListItem.Title>
            <ListItem.Subtitle>{totalStories}</ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>

        <View style={styles.buttonContainer}>
          <Button
            title="Logout"
            onPress={handleLogout}
            buttonStyle={styles.logoutButton}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginLeft: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#86939e',
    borderRadius: 4,
    marginBottom: 20,
    marginHorizontal: 10,
  },
  picker: {
    height: 50,
  },
  buttonContainer: {
    padding: 20,
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: '#ff6b6b',
  },
  modelPreference: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 20,
    marginLeft: 10,
    marginRight: 50,
  },
  switch: {
    marginHorizontal: 8,
  },
  modelPreferenceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
}); 