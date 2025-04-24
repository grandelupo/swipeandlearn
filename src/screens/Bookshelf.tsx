import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Text } from 'react-native-elements';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainStackParamList, MainTabParamList } from '@/navigation/types';
import { supabase } from '@/services/supabase';

interface Story {
  id: string;
  title: string;
  language: string;
  cover_image_url: string;
  total_pages: number;
}

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const GRID_PADDING = 16;
const ITEM_SPACING = 10;
const ITEM_WIDTH = (width - (GRID_PADDING * 2) - (ITEM_SPACING * (COLUMN_COUNT - 1))) / COLUMN_COUNT;

type BookshelfScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Bookshelf'>,
  NativeStackNavigationProp<MainStackParamList>
>;

export default function BookshelfScreen() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<BookshelfScreenNavigationProp>();

  useFocusEffect(
    React.useCallback(() => {
      fetchStories();
    }, [])
  );

  async function fetchStories() {
    try {
      const { data: stories, error } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(stories || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  }

  const renderStoryItem = ({ item }: { item: Story }) => (
    <TouchableOpacity
      style={styles.storyItem}
      onPress={() => {
        navigation.navigate('StoryReader', {
          storyId: item.id,
          pageNumber: 1
        });
      }}
    >
      <Image
        source={item.cover_image_url ? { uri: item.cover_image_url } : require('../../assets/default-cover.jpg')}
        style={styles.coverImage}
      />
      <View style={styles.storyInfo}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.language}>{item.language}</Text>
        <Text style={styles.pages}>{item.total_pages} pages</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading stories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>My Stories</Text>
      {stories.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            You haven't created any stories yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={stories}
          renderItem={renderStoryItem}
          keyExtractor={(item) => item.id}
          numColumns={COLUMN_COUNT}
          contentContainerStyle={styles.grid}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
  },
  grid: {
    padding: GRID_PADDING,
  },
  storyItem: {
    width: ITEM_WIDTH,
    marginBottom: 20,
    marginRight: ITEM_SPACING,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  coverImage: {
    width: '100%',
    height: ITEM_WIDTH * 1.5,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  storyInfo: {
    padding: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  language: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  pages: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 