import React, { useState } from 'react';
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
import { Text, Button } from 'react-native-elements';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainStackParamList, MainTabParamList } from '@/navigation/types';
import { supabase } from '@/services/supabase';
import { generateBookCover } from '@/services/ai';

interface Story {
  id: string;
  title: string;
  language: string;
  cover_image_url: string;
  total_pages: number;
  theme?: string;
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
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
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
        .select('id, title, language, cover_image_url, total_pages, theme')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(stories || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleLongPress = (story: Story) => {
    setSelectedStory(story);
    setShowModal(true);
  };

  const handleGenerateImage = async () => {
    if (!selectedStory) return;
    
    setGeneratingImage(true);
    try {
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Not authenticated');

      // Generate image using DALL-E
      console.log('Generating image with DALL-E...');
      const dallEImageUrl = await generateBookCover(selectedStory.theme || 'general', selectedStory.title);
      console.log('DALL-E URL received:', dallEImageUrl);
      
      if (!dallEImageUrl) {
        throw new Error('No image URL received from DALL-E');
      }

      // Download the image from DALL-E URL using XMLHttpRequest
      console.log('Fetching image from DALL-E URL...');
      const imageData = await new Promise<ArrayBuffer>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', dallEImageUrl);
        xhr.responseType = 'arraybuffer';
        xhr.onerror = () => {
          console.error('XHR error:', xhr.statusText);
          reject(new Error('Failed to download image: ' + xhr.statusText));
        };
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(xhr.response);
          } else {
            console.error('XHR status:', xhr.status, xhr.statusText);
            reject(new Error('Failed to download image: ' + xhr.statusText));
          }
        };
        xhr.send();
      });

      console.log('Image data received, size:', imageData.byteLength);
      
      if (imageData.byteLength === 0) {
        throw new Error('Received empty image data');
      }

      // Convert ArrayBuffer to Uint8Array for Supabase upload
      const uint8Array = new Uint8Array(imageData);

      // Generate a unique filename with timestamp only
      const timestamp = Date.now();
      const filename = `${selectedStory.id}-${timestamp}.png`;
      const filePath = filename; // Store directly in the bucket root
      
      // Upload to Supabase Storage
      console.log('Uploading to Supabase Storage...', {
        bucket: 'book-covers',
        filePath,
        contentType: 'image/png',
        size: uint8Array.length
      });
      const { error: uploadError, data } = await supabase.storage
        .from('book-covers')
        .upload(filePath, uint8Array, {
          contentType: 'image/png',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get the public URL for the uploaded image
      console.log('Getting public URL...');
      const { data: { publicUrl } } = supabase.storage
        .from('book-covers')
        .getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error('Failed to get public URL for uploaded image');
      }

      // Update the story with new cover image URL
      console.log('Updating story record...');
      const { error: updateError } = await supabase
        .from('stories')
        .update({ cover_image_url: publicUrl })
        .eq('id', selectedStory.id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      // Update local state
      setStories(stories.map(story => 
        story.id === selectedStory.id 
          ? { ...story, cover_image_url: publicUrl }
          : story
      ));

      Alert.alert('Success', 'New cover image generated successfully!');
    } catch (error: any) {
      console.error('Error generating new image:', {
        error,
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      Alert.alert(
        'Error',
        `Failed to generate new cover image: ${error.message || 'Unknown error'}`
      );
    } finally {
      setGeneratingImage(false);
      setShowModal(false);
      setSelectedStory(null);
    }
  };

  const renderStoryItem = ({ item }: { item: Story }) => (
    <TouchableOpacity
      style={styles.storyItem}
      onPress={() => {
        navigation.navigate('StoryReader', {
          storyId: item.id,
          pageNumber: 1
        });
      }}
      onLongPress={() => handleLongPress(item)}
      delayLongPress={500}
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
              title={generatingImage ? "Generating..." : "Generate New Cover Image"}
              onPress={handleGenerateImage}
              loading={generatingImage}
              disabled={generatingImage}
              containerStyle={styles.modalButton}
            />
            <Button
              title="Cancel"
              type="outline"
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
    padding: 20,
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
}); 