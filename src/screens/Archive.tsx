import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import { Text, Button } from '@rneui/themed';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';
import { supabase } from '@/services/supabase';
import { Icon } from '@rneui/base';

interface Story {
  id: string;
  title: string;
  language: string;
  cover_image_url: string;
  total_pages: number;
  theme?: string;
  last_accessed: string;
}

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const GRID_PADDING = 16;
const ITEM_SPACING = 10;
const ITEM_WIDTH = (width - (GRID_PADDING * 2) - (ITEM_SPACING * (COLUMN_COUNT - 1))) / COLUMN_COUNT;

type ArchiveScreenNavigationProp = NativeStackNavigationProp<MainStackParamList>;

export default function ArchiveScreen() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showModal, setShowModal] = useState(false);
  const navigation = useNavigation<ArchiveScreenNavigationProp>();

  useFocusEffect(
    React.useCallback(() => {
      fetchStories();
    }, [])
  );

  async function fetchStories() {
    try {
      const { data: stories, error } = await supabase
        .from('stories')
        .select('id, title, language, cover_image_url, total_pages, theme, last_accessed')
        .eq('archived', true)
        .order('last_accessed', { ascending: false });

      if (error) throw error;
      setStories(stories || []);
    } catch (error) {
      console.error('Error fetching archived stories:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleUnarchive = async (story: Story) => {
    try {
      const { error } = await supabase
        .from('stories')
        .update({ archived: false })
        .eq('id', story.id);

      if (error) throw error;
      
      // Update local state
      setStories(stories.filter(s => s.id !== story.id));
      setShowModal(false);
      setSelectedStory(null);
      
    } catch (error) {
      console.error('Error unarchiving story:', error);
      Alert.alert('Error', 'Failed to unarchive story');
    }
  };

  const handleLongPress = (story: Story) => {
    setSelectedStory(story);
    setShowModal(true);
  };

  const renderStoryItem = ({ item }: { item: Story }) => (
    <TouchableOpacity
      style={styles.storyItem}
      onPress={() => {
        navigation.navigate('StoryReader', {
          storyId: item.id,
          pageNumber: item.total_pages
        });
      }}
      onLongPress={() => handleLongPress(item)}
      delayLongPress={500}
    >
      <Image
        source={item.cover_image_url ? { uri: item.cover_image_url } : require('../../assets/images/default-cover.jpg')}
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
        <Text style={styles.loadingText}>Loading archived stories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Archived Stories</Text>
      </View>
      {stories.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            You haven't archived any stories yet.
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

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedStory?.title}</Text>
            <Button
              title="Unarchive Story"
              onPress={() => handleUnarchive(selectedStory!)}
              containerStyle={styles.modalButton}
              type="outline"
              buttonStyle={{ borderColor: '#0066cc' }}
              titleStyle={{ color: '#0066cc' }}
            />
            <Button
              title="Cancel"
              type="clear"
              onPress={() => setShowModal(false)}
              containerStyle={styles.modalButton}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    width: '100%',
    marginVertical: 5,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
}); 