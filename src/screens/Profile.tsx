import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, ListItem } from 'react-native-elements';
import { supabase } from '@/services/supabase';

export default function ProfileScreen() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [totalStories, setTotalStories] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
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

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Profile</Text>
      </View>

      <View style={styles.content}>
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
    </View>
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
    flex: 1,
  },
  buttonContainer: {
    padding: 20,
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: '#ff6b6b',
  },
}); 