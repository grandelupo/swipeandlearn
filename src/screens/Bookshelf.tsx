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
import { t } from '@/i18n/translations';
import { Story } from '@/types/story';

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
        .select('id, title, language, cover_image_url, total_pages, theme, last_accessed, difficulty, last_viewed_page')
        .eq('archived', false)
        .order('last_accessed', { ascending: false });

      if (error) throw error;
      setStories(stories || []);
    } catch (error) {
      console.error(t('errorFetchingStories'), error);
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
      console.error(t('errorArchivingStory'), error);
      Alert.alert(t('errorUnknown'), t('errorArchivingStory'));
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
      if (!user) throw new Error(t('notAuthenticated'));

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

      setShowModal(false);
      setSelectedStory(null);
    } catch (error) {
      console.error('Error generating cover:', error);
      Alert.alert(t('errorUnknown'), t('errorTryAgain'));
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedStory) return;

    const options = {
      title: t('selectImage'),
      takePhotoButtonTitle: t('takePhoto'),
      chooseFromLibraryButtonTitle: t('chooseFromLibrary'),
      cancelButtonTitle: t('cancel'),
      mediaType: 'photo',
      quality: 1,
    };

    try {
      // Request permissions
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (libraryStatus !== 'granted') {
        Alert.alert(t('permissionDenied'), t('imagePermissionRequired'));
        return;
      }

      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus !== 'granted') {
        Alert.alert(t('permissionDenied'), t('cameraPermissionRequired'));
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
      Alert.alert(t('errorUnknown'), t('errorUploadingImage'));
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
          pageNumber: item.last_viewed_page || 1
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
        <View style={styles.metaContainer}>
          <Text style={styles.storyMeta}>{t(item.language.toLowerCase())}</Text>
          <View style={styles.cefrBadge}>
            <Text style={styles.cefrText}>{item.difficulty || '?'}</Text>
          </View>
        </View>
        <Text style={styles.pageCount}>{item.total_pages} {t('pages')}</Text>
      </View>
    </TouchableOpacity>
  );

  const bookshelfTutorialSteps = [
    {
      id: 'feedback_button',
      message: t('bookshelfTutorialFeedback'),
      targetRef: feedbackButtonRef,
    },
    {
      id: 'add_story',
      message: t('bookshelfTutorialAddStory'),
      targetRef: addStoryButtonRef,
    },
  ];

  if (loading) {
    return (
      <View style={styles.outerContainer}>
        <Text style={styles.loadingText}>{t('loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <AnimatedBackground />
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{t('myStories')}</Text>
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
          <Text style={styles.emptyStateText}>{t('noStoriesMessage')}</Text>
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
        <View style={styles.modalOverlay}>
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
              <View style={styles.coinCostContainer}>
                <Text style={styles.generateButtonPrice}>{FUNCTION_COSTS.GENERATE_COVER}</Text>
                <Icon name="monetization-on" size={16} color={COLORS.card} style={styles.generateButtonIcon} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleUploadImage}
              style={[styles.modalButton, styles.uploadButton]}
              disabled={uploadingImage || generatingImage}
            >
              <Text style={styles.uploadButtonText}>
                {uploadingImage ? "Uploading..." : "Upload custom cover"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleArchive(selectedStory!)}
              style={[styles.modalButton, styles.archiveButton]}
            >
              <Text style={styles.archiveButtonText}>Archive Story</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              style={[styles.modalButton, styles.cancelButton]}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    marginBottom: 16,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  generateButtonText: {
    color: COLORS.card,
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    marginRight: 8,
  },
  generateButtonPrice: {
    color: COLORS.card,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
    fontFamily: 'Poppins-Bold',
  },
  generateButtonIcon: {
    marginLeft: -4,
  },
  modalButton: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButton: {
    backgroundColor: COLORS.bright,
    shadowColor: COLORS.bright,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  uploadButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  archiveButton: {
    backgroundColor: COLORS.bright,
    shadowColor: COLORS.bright,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  archiveButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  cancelButtonText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  coinCostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  cefrBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cefrText: {
    color: COLORS.card,
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  pageCount: {
    fontSize: 13,
    color: COLORS.accent,
    fontFamily: 'Poppins-Regular',
  },
});