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
  Platform,
} from 'react-native';
import { Text, Button } from 'react-native-elements';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';
import { supabase } from '@/services/supabase';
import { generateBookCover } from '@/services/edgeFunctions';
import * as ImagePicker from 'expo-image-picker';
import { toByteArray } from 'base64-js';
import { useCoins } from '@/contexts/CoinContext';
import { FUNCTION_COSTS } from '@/services/revenuecat';
import { Icon } from 'react-native-elements';

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

type BookshelfScreenNavigationProp = NativeStackNavigationProp<MainStackParamList>;

export default function BookshelfScreen() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const navigation = useNavigation<BookshelfScreenNavigationProp>();
  const { useCoins: useCoinContext, showInsufficientCoinsAlert } = useCoins();

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
    
    // Check if user has enough coins
    const hasCoins = await useCoinContext('GENERATE_COVER');
    if (!hasCoins) {
      showInsufficientCoinsAlert('GENERATE_COVER', () => {});
      setShowModal(false);
      setSelectedStory(null);
      return;
    }
    
    setGeneratingImage(true);
    try {
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Not authenticated');

      // Generate image using Edge Function
      const imageUrl = await generateBookCover({
        theme: selectedStory.theme || 'general',
        title: selectedStory.title,
        storyId: selectedStory.id,
      });

      // Update local state
      setStories(stories.map(story => 
        story.id === selectedStory.id 
          ? { ...story, cover_image_url: imageUrl }
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
        `Check if the content of the story is appropriate. If it is, please try again.`
      );
    } finally {
      setGeneratingImage(false);
      setShowModal(false);
      setSelectedStory(null);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedStory) return;

    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload images.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [2, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingImage(true);
        const asset = result.assets[0];

        // Convert base64 to Uint8Array if base64 is available
        if (!asset.base64) {
          throw new Error('No base64 data available from selected image');
        }

        const imageData = toByteArray(asset.base64);
        const fileExt = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
        const filePath = `book-covers/${selectedStory.id}/cover.${fileExt}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('book-covers')
          .upload(filePath, imageData, {
            contentType: `image/${fileExt}`,
            upsert: true
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('book-covers')
          .getPublicUrl(filePath);

        // Update story record with new cover image URL
        const { error: updateError } = await supabase
          .from('stories')
          .update({ cover_image_url: publicUrl })
          .eq('id', selectedStory.id);

        if (updateError) throw updateError;

        // Update local state
        setStories(stories.map(story =>
          story.id === selectedStory.id
            ? { ...story, cover_image_url: publicUrl }
            : story
        ));

        Alert.alert('Success', 'Cover image uploaded successfully!');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
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
          pageNumber: item.total_pages
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
        <Text style={styles.loadingText}>Loading stories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>My Stories</Text>
        <Button
          title="+ New"
          onPress={() => navigation.navigate('NewStory')}
          type="clear"
          titleStyle={styles.newStoryButtonText}
        />
      </View>
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
            <TouchableOpacity
              onPress={handleGenerateImage}
              style={styles.generateButton}
              disabled={generatingImage}
            >
              <Text style={styles.generateButtonText}>
                {generatingImage ? "Generating..." : "Generate new cover image"}
              </Text>
              <Text style={styles.generateButtonPrice}>{FUNCTION_COSTS.GENERATE_COVER}</Text>
              <Icon name="monetization-on" size={16} color="#FFD700" style={styles.generateButtonIcon} />
            </TouchableOpacity>
            <Button
              title={uploadingImage ? "Uploading..." : "Upload custom cover"}
              onPress={handleUploadImage}
              loading={uploadingImage}
              disabled={uploadingImage || generatingImage}
              containerStyle={styles.modalButton}
              type="outline"
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
  newStoryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066cc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  generateButtonPrice: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  generateButtonIcon: {
    marginLeft: -4,
  },
}); 