import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  Alert,
  Animated,
  Easing,
  Text as RNText,
} from 'react-native';
import { Text, Button } from '@rneui/themed';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';
import { supabase } from '@/services/supabase';
import { generateBookCover } from '@/services/edgeFunctions';
import * as ImagePicker from 'expo-image-picker';
import { toByteArray } from 'base64-js';
import { useCoins } from '@/contexts/CoinContext';
import { FUNCTION_COSTS } from '@/services/revenuecat';
import { Icon } from '@rneui/base';
import { COLORS } from '@/constants/colors';
import TutorialOverlay from '@/components/TutorialOverlay';
import { useFeedbackButton } from '@/contexts/FeedbackButtonContext';

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
const ITEM_SPACING = 16;
const ITEM_WIDTH = (width - (GRID_PADDING * 2) - (ITEM_SPACING * (COLUMN_COUNT - 1))) / COLUMN_COUNT;

interface BookshelfScreenProps extends NativeStackScreenProps<MainStackParamList, 'Bookshelf'> {
  feedbackButtonRef: React.RefObject<View>;
}

const AnimatedBackground = React.memo(() => {
  const circle1 = useRef(new Animated.ValueXY({ x: -80, y: -60 })).current;
  const circle2 = useRef(new Animated.ValueXY({ x: width * 0.4, y: width * 0.2 })).current;
  const circle3 = useRef(new Animated.ValueXY({ x: width * 0.1, y: width * 0.9 })).current;

  const createAnimation = useCallback((
    animatedValue: Animated.ValueXY,
    start: { x: number; y: number },
    end: { x: number; y: number },
    duration: number
  ) => {
    return Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: end,
        duration,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.quad)
      }),
      Animated.timing(animatedValue, {
        toValue: start,
        duration,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.quad)
      })
    ]);
  }, []);

  useEffect(() => {
    const animations = [
      Animated.loop(
        createAnimation(
          circle1,
          { x: -80, y: -60 },
          { x: -60, y: -40 },
          12000
        )
      ),
      Animated.loop(
        createAnimation(
          circle2,
          { x: width * 0.4, y: width * 0.2 },
          { x: width * 0.45, y: width * 0.25 },
          15000
        )
      ),
      Animated.loop(
        createAnimation(
          circle3,
          { x: width * 0.1, y: width * 0.9 },
          { x: width * 0.12, y: width * 0.92 },
          18000
        )
      )
    ];

    animations.forEach(animation => animation.start());

    return () => {
      animations.forEach(animation => animation.stop());
    };
  }, [createAnimation]);

  return (
    <View style={styles.backgroundContainer}>
      <Animated.View
        style={[
          styles.circle,
          {
            transform: [
              { translateX: circle1.x },
              { translateY: circle1.y }
            ],
            backgroundColor: COLORS.accent,
            opacity: 0.18
          }
        ]}
      />
      <Animated.View
        style={[
          styles.circle,
          {
            transform: [
              { translateX: circle2.x },
              { translateY: circle2.y }
            ],
            backgroundColor: COLORS.bright,
            opacity: 0.13
          }
        ]}
      />
      <Animated.View
        style={[
          styles.circle,
          {
            transform: [
              { translateX: circle3.x },
              { translateY: circle3.y }
            ],
            backgroundColor: COLORS.bright,
            opacity: 0.10
          }
        ]}
      />
    </View>
  );
});

export default function BookshelfScreen() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { useCoins: useCoinContext, showInsufficientCoinsAlert } = useCoins();
  const { feedbackButtonRef } = useFeedbackButton();

  // Add refs for tutorial targets
  const addStoryButtonRef = useRef<View>(null);

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
        .eq('archived', false)
        .order('last_accessed', { ascending: false });

      if (error) throw error;
      setStories(stories || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleArchive = async (story: Story) => {
    try {
      const { error } = await supabase
        .from('stories')
        .update({ archived: true })
        .eq('id', story.id);

      if (error) throw error;
      
      // Update local state
      setStories(stories.filter(s => s.id !== story.id));
      setShowModal(false);
      setSelectedStory(null);
      
    } catch (error) {
      console.error('Error archiving story:', error);
      Alert.alert('Error', 'Failed to archive story');
    }
  };

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
      style={styles.storyCard}
      onPress={() => {
        navigation.navigate('StoryReader', {
          storyId: item.id,
          pageNumber: item.total_pages
        });
      }}
      onLongPress={() => handleLongPress(item)}
      delayLongPress={500}
    >
      <View style={styles.coverContainer}>
        <Image
          source={item.cover_image_url ? { uri: item.cover_image_url } : require('../../assets/images/default-cover.jpg')}
          style={styles.coverImage}
        />
      </View>
      <View style={styles.storyInfo}>
        <Text style={styles.storyTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.storyMeta}>{item.language} • {item.total_pages} pages</Text>
      </View>
    </TouchableOpacity>
  );

  const bookshelfTutorialSteps = [
    {
      id: 'feedback_button',
      message: 'You can send feedback to the developer by clicking the button in the top right corner. Thank you!',
      targetRef: feedbackButtonRef,
    },
    {
      id: 'add_story',
      message: 'Click the + button to create a new story.',
      targetRef: addStoryButtonRef,
    },
  ];

  if (loading) {
    return (
      <View style={styles.outerContainer}>
        <Text style={styles.loadingText}>Loading stories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <AnimatedBackground />
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>My Stories</Text>
        <TouchableOpacity
          ref={addStoryButtonRef}
          style={styles.newButton}
          onPress={() => navigation.navigate('NewStory')}
        >
          <Icon name="add" type="ionicon" color={COLORS.card} size={28} containerStyle={{ backgroundColor: COLORS.accent, borderRadius: 24, padding: 8 }} />
        </TouchableOpacity>
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
      <TutorialOverlay
        screenName="bookshelf"
        steps={bookshelfTutorialSteps}
      />

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
              title="Archive Story"
              onPress={() => handleArchive(selectedStory!)}
              containerStyle={styles.modalButton}
              type="outline"
              buttonStyle={{ borderColor: '#ff6b6b' }}
              titleStyle={{ color: '#ff6b6b' }}
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 8,
    zIndex: 1,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: 'Poppins-Bold',
  },
  newButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 24,
    padding: 4,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  grid: {
    padding: GRID_PADDING,
    zIndex: 1,
  },
  storyCard: {
    width: ITEM_WIDTH,
    marginBottom: 20,
    marginRight: ITEM_SPACING,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  coverContainer: {
    width: '100%',
    height: ITEM_WIDTH * 1.4,
    backgroundColor: COLORS.bright,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  storyInfo: {
    padding: 12,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: 'Poppins-Bold',
    marginBottom: 2,
  },
  storyMeta: {
    fontSize: 13,
    color: COLORS.accent,
    fontFamily: 'Poppins-Regular',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.bright,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    color: COLORS.primary,
    fontFamily: 'Poppins-Bold',
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