import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  Animated,
  Easing,
  Text as RNText,
} from 'react-native';
import { Text, Button } from '@rneui/themed';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';
import { supabase } from '@/services/supabase';
import { catalogService, CatalogFilters } from '@/services/catalog';
import { useCoins } from '@/contexts/CoinContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '@/constants/colors';
import TutorialOverlay from '@/components/TutorialOverlay';
import { useFeedbackButton } from '@/contexts/FeedbackButtonContext';
import { t } from '@/i18n/translations';
import { Story } from '@/types/story';
import CoinCounter, { CoinCounterRef } from '@/components/CoinCounter';
import AnimatedBackground from '@/components/AnimatedBackground';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const GRID_PADDING = 16;
const ITEM_SPACING = 16;
const ITEM_WIDTH = (width - (GRID_PADDING * 2) - (ITEM_SPACING * (COLUMN_COUNT - 1))) / COLUMN_COUNT;

interface CatalogScreenProps extends NativeStackScreenProps<MainStackParamList, 'Catalog'> {
  feedbackButtonRef: React.RefObject<View>;
  coinCounterRef: React.RefObject<CoinCounterRef>;
}

type CatalogScreenRouteProp = RouteProp<MainStackParamList, 'Catalog'>;

const AnimatedBackgroundComponent = React.memo(() => {
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

export default function CatalogScreen({ coinCounterRef }: CatalogScreenProps) {
  const route = useRoute<CatalogScreenRouteProp>();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'most_liked'>(route.params?.sortBy || 'newest');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { feedbackButtonRef } = useFeedbackButton();

  // Add refs for tutorial targets
  const sortButtonRef = useRef<View>(null);

  // Available languages and difficulties
  const languages = [
    { value: '', label: t('allLanguages') },
    { value: 'English', label: t('english') },
    { value: 'Spanish', label: t('spanish') },
    { value: 'French', label: t('french') },
    { value: 'German', label: t('german') },
    { value: 'Italian', label: t('italian') },
    { value: 'Polish', label: t('polish') },
    { value: 'Ukrainian', label: t('ukrainian') },
  ];

  const difficulties = [
    { value: '', label: t('allDifficulties') },
    { value: 'A1', label: 'A1' },
    { value: 'A2', label: 'A2' },
    { value: 'B1', label: 'B1' },
    { value: 'B2', label: 'B2' },
    { value: 'C1', label: 'C1' },
    { value: 'C2', label: 'C2' },
    { value: 'Divine', label: 'Divine' },
  ];

  useFocusEffect(
    React.useCallback(() => {
      fetchStories();
      fetchUserLikes();
    }, [sortBy, selectedLanguage, selectedDifficulty])
  );

  const fetchStories = async () => {
    try {
      setLoading(true);
      const filters: CatalogFilters = {
        sortBy,
        language: selectedLanguage || undefined,
        difficulty: selectedDifficulty || undefined,
        limit: 50
      };
      console.log('Fetching stories with filters:', filters);
      const publishedStories = await catalogService.getPublishedStories(filters);
      console.log('Fetched stories:', publishedStories.length);
      setStories(publishedStories);
    } catch (error) {
      console.error('Error fetching catalog:', error);
      Alert.alert(t('error'), t('errorFetchingCatalog'));
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLikes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: likes, error } = await supabase
        .from('story_likes')
        .select('story_id')
        .eq('user_id', user.id);

      if (error) throw error;
      const likedStoryIds = new Set(likes?.map(like => like.story_id) || []);
      setUserLikes(likedStoryIds);
    } catch (error) {
      console.error('Error fetching user likes:', error);
    }
  };

  const handleLikeStory = async (storyId: string) => {
    try {
      const isLiked = userLikes.has(storyId);
      
      if (isLiked) {
        await catalogService.unlikeStory(storyId);
        setUserLikes(prev => {
          const newSet = new Set(prev);
          newSet.delete(storyId);
          return newSet;
        });
      } else {
        await catalogService.likeStory(storyId);
        setUserLikes(prev => new Set(prev).add(storyId));
      }

      // Update the story's like count in local state
      setStories(prev => prev.map(story => 
        story.id === storyId 
          ? { ...story, like_count: (story.like_count || 0) + (isLiked ? -1 : 1) }
          : story
      ));
    } catch (error) {
      console.error(t('errorLikingStory'), error);
      Alert.alert(t('error'), t('errorLikingStory'));
    }
  };

  const handleSortChange = (newSortBy: 'newest' | 'most_liked') => {
    setSortBy(newSortBy);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStories(), fetchUserLikes()]);
    setRefreshing(false);
  };

  const renderStoryItem = ({ item }: { item: Story }) => {
    const isLiked = userLikes.has(item.id);
    const publishedDate = item.published_at ? new Date(item.published_at).toLocaleDateString() : '';

    return (
      <TouchableOpacity
        style={styles.storyCard}
        onPress={() => {
          navigation.navigate('StoryReader', {
            storyId: item.id,
            pageNumber: 1
          });
        }}
      >
        <View style={styles.coverContainer}>
          <Image
            source={item.cover_image_url ? { uri: item.cover_image_url } : require('../../assets/images/default-cover.jpg')}
            style={styles.coverImage}
          />
          <TouchableOpacity
            style={styles.likeButton}
            onPress={(e) => {
              e.stopPropagation();
              handleLikeStory(item.id);
            }}
          >
            <Icon 
              name={isLiked ? "favorite" : "favorite-border"} 
              color={isLiked ? COLORS.accent : COLORS.primary} 
              size={20} 
            />
          </TouchableOpacity>
        </View>
        <View style={styles.storyInfo}>
          <Text style={styles.storyTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.metaContainer}>
            <Text style={styles.storyMeta}>{t(item.language.toLowerCase())}</Text>
            <View style={styles.cefrBadge}>
              <Text style={styles.cefrText}>{item.difficulty || '?'}</Text>
            </View>
          </View>
          {publishedDate && (
            <Text style={styles.publishedDate}>{t('publishedOn')} {publishedDate}</Text>
          )}
          <View style={styles.likesContainer}>
            <Icon name="favorite" color={COLORS.accent} size={14} />
            <Text style={styles.likesText}>{item.like_count || 0} {t('likes')}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const catalogTutorialSteps = [
    {
      id: 'sort_stories',
      message: t('tutorialCatalog'),
      targetRef: sortButtonRef,
    },
  ];

  if (loading) {
    return (
      <View style={styles.outerContainer}>
        <Text style={styles.loadingText}>{t('loadingCatalog')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <AnimatedBackgroundComponent />
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{t('publishedStories')}</Text>
        <View style={styles.sortContainer}>
          <TouchableOpacity
            ref={sortButtonRef}
            style={[styles.sortButton, sortBy === 'newest' && styles.sortButtonActive]}
            onPress={() => handleSortChange('newest')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'newest' && styles.sortButtonTextActive]}>
              {t('sortByNewest')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'most_liked' && styles.sortButtonActive]}
            onPress={() => handleSortChange('most_liked')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'most_liked' && styles.sortButtonTextActive]}>
              {t('sortByMostLiked')}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Filter Toggle Button */}
        <TouchableOpacity
          style={styles.filterToggleButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Icon name="filter-list" size={20} color={COLORS.primary} />
          <Text style={styles.filterToggleText}>{t('filters')}</Text>
          <Icon 
            name={showFilters ? "expand-less" : "expand-more"} 
            size={20} 
            color={COLORS.primary} 
          />
        </TouchableOpacity>

        {/* Filter Controls */}
        {showFilters && (
          <View style={styles.filterContainer}>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>{t('language')}</Text>
              <View style={styles.filterOptions}>
                {languages.map((lang) => (
                  <TouchableOpacity
                    key={lang.value}
                    style={[
                      styles.filterOption,
                      selectedLanguage === lang.value && styles.filterOptionActive
                    ]}
                    onPress={() => setSelectedLanguage(lang.value)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      selectedLanguage === lang.value && styles.filterOptionTextActive
                    ]}>
                      {lang.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>{t('difficulty')}</Text>
              <View style={styles.filterOptions}>
                {difficulties.map((diff) => (
                  <TouchableOpacity
                    key={diff.value}
                    style={[
                      styles.filterOption,
                      selectedDifficulty === diff.value && styles.filterOptionActive
                    ]}
                    onPress={() => setSelectedDifficulty(diff.value)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      selectedDifficulty === diff.value && styles.filterOptionTextActive
                    ]}>
                      {diff.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Clear Filters Button */}
            {(selectedLanguage || selectedDifficulty) && (
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => {
                  setSelectedLanguage('');
                  setSelectedDifficulty('');
                }}
              >
                <Text style={styles.clearFiltersText}>{t('clearFilters')}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      {stories.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>{t('noPublishedStories')}</Text>
        </View>
      ) : (
        <FlatList
          data={stories}
          renderItem={renderStoryItem}
          keyExtractor={(item) => item.id}
          numColumns={COLUMN_COUNT}
          contentContainerStyle={styles.grid}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
      <TutorialOverlay
        screenName="catalog"
        steps={catalogTutorialSteps}
      />
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
    padding: 24,
    paddingBottom: 8,
    zIndex: 1,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: 'Poppins-Bold',
    marginBottom: 16,
  },
  sortContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.bright,
    borderRadius: 12,
    padding: 4,
    marginBottom: 8,
  },
  sortButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  sortButtonActive: {
    backgroundColor: COLORS.accent,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    fontFamily: 'Poppins-SemiBold',
  },
  sortButtonTextActive: {
    color: COLORS.card,
  },
  filterToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bright,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  filterToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    fontFamily: 'Poppins-SemiBold',
    flex: 1,
    marginLeft: 8,
  },
  filterContainer: {
    backgroundColor: COLORS.bright,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.bright,
  },
  filterOptionActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  filterOptionText: {
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: 'Poppins-Regular',
  },
  filterOptionTextActive: {
    color: COLORS.card,
    fontFamily: 'Poppins-SemiBold',
  },
  clearFiltersButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  clearFiltersText: {
    fontSize: 14,
    color: COLORS.accent,
    fontFamily: 'Poppins-SemiBold',
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
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  likeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 6,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  storyInfo: {
    padding: 12,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: 'Poppins-Bold',
    marginBottom: 4,
  },
  storyMeta: {
    fontSize: 13,
    color: COLORS.accent,
    fontFamily: 'Poppins-Regular',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
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
  authorText: {
    fontSize: 12,
    color: COLORS.primary,
    fontFamily: 'Poppins-Regular',
    marginBottom: 2,
  },
  publishedDate: {
    fontSize: 12,
    color: COLORS.accent,
    fontFamily: 'Poppins-Regular',
    marginBottom: 4,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likesText: {
    fontSize: 12,
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
}); 