import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import { Text, Button, Input, Chip } from '@rneui/themed';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';
import { supabase } from '@/services/supabase';
import { generateStoryContent, generateSpeech, translateText } from '@/services/edgeFunctions';
import AudioPlayer from '@/components/AudioPlayer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Dictionary, { Definition } from '@/components/Dictionary';
import { fetchDefinitions, DictionaryType } from '@/services/dictionary';
import { VoiceId } from '@/services/elevenlabs';
import { useStoryCache } from '../contexts/StoryCacheContext';
import { useCoins as useCoinContext } from '../contexts/CoinContext';
import { FUNCTION_COSTS } from '@/services/revenuecat';
import { COLORS } from '@/constants/colors';
import TutorialOverlay from '@/components/TutorialOverlay';
import AnimatedBackground from '@/components/AnimatedBackground';
import { t } from '@/i18n/translations';
import { Story } from '@/types/story';
import CoinCounter, { CoinCounterRef } from '@/components/CoinCounter';

interface StoryPage {
  content: string;
  page_number: number;
  target_words: string[];
}

type StoryReaderScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'StoryReader'>;
type StoryReaderScreenRouteProp = RouteProp<MainStackParamList, 'StoryReader'>;

interface StoryGenerationParams {
  language: string;
  difficulty: string;
  theme: string;
  userId: string;
  storyId: string;
  pageNumber: number;
  previousPages: string[];
  targetWords: string[];
}

interface TranslationParams {
  text: string;
  targetLanguage: string;
  userId: string;
  storyId: string;
  isWord?: boolean;
  context?: string;
  wordIndex?: number;
}

interface StoryReaderScreenProps extends NativeStackScreenProps<MainStackParamList, 'StoryReader'> {
  coinCounterRef: React.RefObject<CoinCounterRef>;
}

export default function StoryReaderScreen({ route, coinCounterRef }: StoryReaderScreenProps) {
  const navigation = useNavigation<StoryReaderScreenNavigationProp>();
  const { storyId, pageNumber: initialPageNumber = 1 } = route.params;
  const [pageNumber, setPageNumber] = useState(initialPageNumber);
  const scrollViewRef = useRef<ScrollView>(null);
  const { getCachedPage, getCachedStory, cachePage } = useStoryCache();
  const { useCoins, showInsufficientCoinsAlert } = useCoinContext();
  const [preferredLanguage, setPreferredLanguage] = useState('en');

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [story, setStory] = useState<Story | null>(null);
  const [currentPage, setCurrentPage] = useState<StoryPage | null>(null);
  const [selectedSentence, setSelectedSentence] = useState<string | null>(null);
  const [translation, setTranslation] = useState<string | null>(null);
  const [translationLoading, setTranslationLoading] = useState(false);
  const [translationLanguage, setTranslationLanguage] = useState<string>('English');
  const [showPersonalizeModal, setShowPersonalizeModal] = useState(false);
  const [newTargetWord, setNewTargetWord] = useState('');
  const [personalizedTargetWords, setPersonalizedTargetWords] = useState<string[]>([]);
  const [previousPages, setPreviousPages] = useState<string[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<VoiceId>('21m00Tcm4TlvDq8ikWAM');
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [selectedWord, setSelectedWord] = useState<{ text: string; sentenceIndex: number; wordIndex: number } | null>(null);
  const [selectedWordTranslation, setSelectedWordTranslation] = useState<string | null>(null);
  const [wordTranslationLoading, setWordTranslationLoading] = useState(false);
  const [showDictionary, setShowDictionary] = useState(false);
  const [definitions, setDefinitions] = useState<Definition[] | null>(null);
  const [isDictionaryLoading, setIsDictionaryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<VoiceId[]>([]);
  const [selectedDictionaryType, setSelectedDictionaryType] = useState<DictionaryType>('defaultDictionary');
  const [lastTapTimestamp, setLastTapTimestamp] = useState(0);
  const DOUBLE_TAP_DELAY = 300; // milliseconds

  // Add refs for tutorial targets
  const contentRef = useRef<View>(null);
  const audioButtonRef = useRef<View>(null);
  const lastTapRef = useRef<number>(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchStoryAndPage();
    fetchTranslationLanguage();
    fetchUserVoicePreference();
    checkAvailableAudioRecordings();
  }, [storyId, pageNumber]);

  const fetchTranslationLanguage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('preferred_translation_language')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data?.preferred_translation_language) {
        setTranslationLanguage(data.preferred_translation_language);
      }
    } catch (error) {
      console.error('Error fetching translation language:', error);
    }
  };

  const fetchUserVoicePreference = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('preferred_voice_id')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data?.preferred_voice_id) {
        setSelectedVoice(data.preferred_voice_id);
      }
    } catch (error) {
      console.error('Error fetching voice preference:', error);
    }
  };

  const fetchStoryAndPage = useCallback(async () => {

    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cachedStory = getCachedStory(storyId);
      const cachedPage = getCachedPage(storyId, pageNumber);

      if (cachedStory && cachedPage) {
        setStory(cachedStory);
        setCurrentPage(cachedPage);
        setLoading(false);
        return;
      }

      // If not in cache, fetch from Supabase
      const { data: storyData, error: storyError } = await supabase
        .from('stories')
        .select('*')
        .eq('id', storyId)
        .single();

      if (storyError) throw storyError;

      const { data: pageData, error: pageError } = await supabase
        .from('story_pages')
        .select('*')
        .eq('story_id', storyId)
        .eq('page_number', pageNumber)
        .single();

      if (pageError) throw pageError;

      // Cache the fetched data
      cachePage(storyId, storyData, pageData);

      setStory(storyData);
      setCurrentPage(pageData);

      // Fetch previous pages for context
      if (pageNumber > 1) {
        const { data: prevPages, error: prevPagesError } = await supabase
          .from('story_pages')
          .select('content')
          .eq('story_id', storyId)
          .lt('page_number', pageNumber)
          .order('page_number');

        if (!prevPagesError && prevPages) {
          setPreviousPages(prevPages.map(page => page.content));
        }
      } else {
        setPreviousPages([]);
      }


      console.log('pageNumber', pageNumber);
      // Update last accessed timestamp and last viewed page
      var result = await supabase
        .from('stories')
        .update({ 
          last_accessed: new Date().toISOString(),
          last_viewed_page: pageNumber
        })
        .eq('id', storyId);

      console.log('result', result);

      // Generate cache when reaching the last page
      if (pageNumber === storyData.total_pages) {
        console.log('Generating page cache for last page');
        generatePageCache(pageNumber + 1);
      }

    } catch (err) {
      console.error(t('errorLoadingStory'), err);
      setError(err instanceof Error ? err.message : t('errorUnknown'));
    } finally {
      setLoading(false);
    }
  }, [storyId, pageNumber, getCachedStory, getCachedPage, cachePage]);

  const checkAvailableAudioRecordings = async () => {
    if (!storyId || !pageNumber) return;

    try {
      const { data: recordings, error } = await supabase
        .from('audio_recordings')
        .select('voice_id, audio_url')
        .eq('story_id', storyId)
        .eq('page_number', pageNumber);

      if (error) throw error;

      if (recordings && recordings.length > 0) {
        // Set available voices
        const voices = recordings.map(r => r.voice_id as VoiceId);
        setAvailableVoices(voices);

        // If current voice is not available but there are recordings, use the first available voice
        if (!voices.includes(selectedVoice) && voices.length > 0) {
          setSelectedVoice(voices[0]);
          const recording = recordings.find(r => r.voice_id === voices[0]);
          if (recording) {
            setAudioUrl(recording.audio_url);
          }
        } else if (voices.includes(selectedVoice)) {
          // If current voice is available, load its audio
          const recording = recordings.find(r => r.voice_id === selectedVoice);
          if (recording) {
            setAudioUrl(recording.audio_url);
          }
        }
      } else {
        setAvailableVoices([]);
        setAudioUrl(null);
      }
    } catch (error) {
      console.error('Error checking available audio recordings:', error);
    }
  };

  const handleSentencePress = async (sentence: string) => {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastTapTimestamp;

    if (timeDiff < DOUBLE_TAP_DELAY) {
      // Double tap detected
      setSelectedSentence(sentence);
      setTranslationLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const translation = await translateText({
          text: sentence,
          targetLanguage: translationLanguage,
          userId: user.id,
          storyId,
        });

        setTranslation(translation);
      } catch (error) {
        console.error('Error translating sentence:', error);
        Alert.alert(t('error'), t('errorTranslatingSentence'));
      } finally {
        setTranslationLoading(false);
      }
    }

    setLastTapTimestamp(currentTime);
  };

  const generateNewPage = async (customTargetWords?: string[]) => {
    try {
      setGenerating(true);
      setError(null);

      // Skip coin check for first 4 pages
      if (pageNumber >= 4) {
        const hasEnoughCoins = await useCoins('GENERATE_NEW_PAGE');
        if (!hasEnoughCoins) {
          showInsufficientCoinsAlert('GENERATE_NEW_PAGE', () => {
            console.log('coinCounterRef', coinCounterRef.current);
            coinCounterRef.current?.openModal();
          });
          return;
        }
      }

      const targetWordsToUse = customTargetWords || personalizedTargetWords;

      // First, check if we have a cached page
      const { data: cachedPage, error: cacheError } = await supabase
        .from('story_pages')
        .select('*')
        .eq('story_id', storyId)
        .eq('page_number', pageNumber + 1)
        .eq('is_cached', true)
        .single();

      console.log('cachedPage', cachedPage);

      if (cacheError) {
        console.error('Error checking cached page:', cacheError);
      }

      // Check if cache exists and matches target words
      const cacheMatchesTargetWords = cachedPage && 
        (!targetWordsToUse.length || // No target words specified
          (cachedPage.target_words && // Cache has target words
           targetWordsToUse.length === cachedPage.target_words.length && // Same length
           targetWordsToUse.every(word => cachedPage.target_words.includes(word)))); // Same words

      if (cachedPage && cacheMatchesTargetWords) {
        console.log('pageNumber', pageNumber);
        // Update the cached page to be a regular page
        const { error: updateError } = await supabase
          .from('story_pages')
          .update({ is_cached: false })
          .eq('story_id', storyId)
          .eq('page_number', pageNumber + 1);

        if (updateError) throw updateError;

        // Update story's total pages
        const { error: storyUpdateError } = await supabase
          .from('stories')
          .update({ total_pages: pageNumber + 1 })
          .eq('id', storyId);

        if (storyUpdateError) throw storyUpdateError;

        // Navigate to the next page
        navigation.setParams({ pageNumber: pageNumber + 1 });
        setPageNumber(pageNumber + 1);
        setPersonalizedTargetWords([]);
        setShowPersonalizeModal(false);

        return;
      }

      // If cache doesn't exist or doesn't match target words, generate new page

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(t('notAuthenticated'));

      // Generate the page content
      const response = await generateStoryContent({
        language: story?.language || 'English',
        difficulty: story?.difficulty || 'A1',
        theme: story?.theme || 'general',
        userId: user.id,
        storyId,
        pageNumber: pageNumber + 1,
        previousPages,
        targetWords: targetWordsToUse,
        generateCache: false
      });

      // Update story's total pages
      const { error: storyUpdateError } = await supabase
        .from('stories')
        .update({ total_pages: pageNumber + 1 })
        .eq('id', storyId);

      if (storyUpdateError) throw storyUpdateError;

      // Navigate to the next page
      navigation.setParams({ pageNumber: pageNumber + 1 });
      setPageNumber(pageNumber + 1);
      setPersonalizedTargetWords([]);
      setShowPersonalizeModal(false);

      // Generate cache for the next page
      generatePageCache(pageNumber + 2);

    } catch (err) {
      console.error(t('errorGeneratingPage'), err);
      setError(err instanceof Error ? err.message : t('errorUnknown'));
    } finally {
      setGenerating(false);
    }
  };

  const addTargetWord = () => {
    if (newTargetWord.trim()) {
      setPersonalizedTargetWords([...personalizedTargetWords, newTargetWord.trim()]);
      setNewTargetWord('');
    }
  };

  const removeTargetWord = (word: string) => {
    setPersonalizedTargetWords(personalizedTargetWords.filter(w => w !== word));
  };

  const navigateToPage = async (newPage: number) => {
    if (story && newPage > 0 && newPage <= story.total_pages) {
      // Update last_viewed_page in the database
      try {
        const { error } = await supabase
          .from('stories')
          .update({ 
            last_viewed_page: newPage,
            last_accessed: new Date().toISOString()
          })
          .eq('id', storyId);

        if (error) {
          console.error('Error updating last viewed page:', error);
        }
      } catch (err) {
        console.error('Error updating last viewed page:', err);
      }

      navigation.setParams({ pageNumber: newPage });
      setPageNumber(newPage);
    }
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  };

  const handleVoiceChange = async (voiceId: VoiceId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if we have a recording for this voice
      const { data: existingRecording } = await supabase
        .from('audio_recordings')
        .select('audio_url')
        .eq('story_id', storyId)
        .eq('page_number', pageNumber)
        .eq('voice_id', voiceId)
        .single();

      setSelectedVoice(voiceId);
      
      if (existingRecording?.audio_url) {
        setAudioUrl(existingRecording.audio_url);
      } else {
        setAudioUrl(null);
      }
      
      // Update user preference
      const { error } = await supabase
        .from('profiles')
        .update({ preferred_voice_id: voiceId })
        .eq('id', user.id);

      if (error) throw error;

    } catch (error) {
      console.error('Error updating voice preference:', error);
    }
  };

  const generatePageAudio = async (voiceId: VoiceId = selectedVoice) => {
    try {
      // Check if we already have this audio cached
      const { data: existingRecording, error: recordingError } = await supabase
        .from('audio_recordings')
        .select('audio_url')
        .eq('story_id', storyId)
        .eq('page_number', pageNumber)
        .eq('voice_id', voiceId)
        .single();

      if (recordingError) {
        console.error('Error checking audio recording:', recordingError);
      }

      console.log('Checking audio recording:', { storyId, pageNumber, voiceId, existingRecording });

      if (existingRecording?.audio_url) {
        setAudioUrl(existingRecording.audio_url);
        setShowAudioPlayer(true);
        return;
      }

      setAudioLoading(true);
      setError(null);

      // Check if user has enough coins
      const hasCoins = await useCoins('GENERATE_AUDIO');
      if (!hasCoins) {
        showInsufficientCoinsAlert('GENERATE_AUDIO', () => {});
        return;
      }

      // Generate audio
      const audioUrl = await generateSpeech({
        text: currentPage?.content || '',
        voiceId,
        storyId,
        pageNumber,
      });

      setAudioUrl(audioUrl);
      setShowAudioPlayer(true);

    } catch (err) {
      console.error(t('errorGeneratingAudio'), err);
      setError(err instanceof Error ? err.message : t('errorUnknown'));
    } finally {
      setAudioLoading(false);
    }
  };

  const handleWordPress = async (word: string, sentence: string, sentenceIndex: number, wordIndex: number) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (lastTapRef.current && (now - lastTapRef.current) < DOUBLE_TAP_DELAY) {
      // Double tap detected - translate sentence
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
      setSelectedWord(null);
      setSelectedWordTranslation(null);
      setSelectedSentence(sentence);
      setTranslationLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error(t('notAuthenticated'));

        const translation = await translateText({
          text: sentence,
          targetLanguage: translationLanguage,
          userId: user.id,
          storyId,
        });

        setTranslation(translation);
      } catch (error) {
        console.error('Error translating sentence:', error);
        Alert.alert(t('error'), t('errorTranslatingSentence'));
      } finally {
        setTranslationLoading(false);
      }
    } else {
      // Single tap - wait to see if it's a double tap
      lastTapRef.current = now;
      
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }

      tapTimeoutRef.current = setTimeout(async () => {
        // Single tap confirmed - translate word
        setSelectedWord({ text: word, sentenceIndex, wordIndex });
        setWordTranslationLoading(true);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error(t('notAuthenticated'));

          const translation = await translateText({
            text: word,
            targetLanguage: translationLanguage,
            userId: user.id,
            storyId,
            isWord: true,
            context: sentence,
            wordIndex,
          });

          setSelectedWordTranslation(translation);
        } catch (error) {
          console.error(t('errorUnknown'), error);
        } finally {
          setWordTranslationLoading(false);
        }
      }, DOUBLE_TAP_DELAY);
    }
  };

  const handleWordLongPress = async (word: string, sentenceIndex: number, wordIndex: number) => {
    try {
      setIsDictionaryLoading(true);
      setSelectedWord({ text: word, sentenceIndex, wordIndex });
      setShowDictionary(true);

      const defs = await fetchDefinitions(word, story?.language || 'English', selectedDictionaryType);
      setDefinitions(defs);
    } catch (error) {
      console.error(t('errorFetchingDefinitions'), error);
      setDefinitions(null);
    } finally {
      setIsDictionaryLoading(false);
    }
  };

  const handleDictionaryTypeChange = async (type: DictionaryType) => {
    setSelectedDictionaryType(type);
    if (selectedWord) {
      setIsDictionaryLoading(true);
      try {
        const defs = await fetchDefinitions(selectedWord.text, story?.language || 'English', type);
        setDefinitions(defs);
      } catch (error) {
        console.error('Error fetching definitions:', error);
        Alert.alert(t('error'), t('errorFetchingDefinitions'));
      } finally {
        setIsDictionaryLoading(false);
      }
    }
  };

  const renderContent = () => {
    if (!currentPage?.content) return null;

    // Check if the language is Arabic
    const isArabic = story?.language.toLowerCase() === 'arabic';
    
    // Check if the language is Chinese or Japanese
    const isCJK = ['chinese', 'japanese'].includes(story?.language.toLowerCase() || '');

    let sentences;
    if (isCJK) {
      // For Chinese and Japanese, split by CJK punctuation marks
      sentences = currentPage.content
        .split(/([。！？]+)/)
        .filter(Boolean)
        .map((part, i, arr) => {
          if (i % 2 === 0 && i + 1 < arr.length) {
            return part + arr[i + 1];
          }
          return i % 2 === 0 ? part : '';
        })
        .filter(Boolean);
    } else {
      // For other languages, use standard punctuation
      sentences = currentPage.content
        .split(/([.!?]+\s+)/)
        .filter(Boolean)
        .map((part, i, arr) => {
          if (i % 2 === 0 && i + 1 < arr.length) {
            return part + arr[i + 1];
          }
          return i % 2 === 0 ? part : '';
        })
        .filter(Boolean);
    }

    return (
      <View style={[
        styles.textContainer,
        isArabic && styles.arabicTextContainer
      ]}>
        {sentences.map((sentence, index) => {
          let words;
          if (isCJK) {
            words = sentence.trim().split('');
          } else {
            words = sentence.trim().split(/\s+/);
          }
          
          return (
            <View key={index} style={styles.sentenceWrapper} ref={index === 0 ? contentRef : undefined}>
              <View
                style={[
                  styles.sentenceContainer,
                  selectedSentence === sentence.trim() && styles.highlightedSentence,
                  isArabic && styles.arabicSentenceContainer
                ]}
              >
                {words.map((word, wordIndex) => {
                  const cleanWord = word.replace(/[.,!?。！？]$/, '');
                  const isSelected = selectedWord?.text === cleanWord && 
                                 selectedWord?.sentenceIndex === index && 
                                 selectedWord?.wordIndex === wordIndex;
                  return (
                    <Pressable
                      key={wordIndex}
                      onPress={() => handleWordPress(cleanWord, sentence.trim(), index, wordIndex)}
                      onLongPress={() => handleWordLongPress(cleanWord, index, wordIndex)}
                      delayLongPress={500}
                      style={styles.wordWrapper}
                    >
                      <Text style={[
                        styles.word,
                        isArabic && styles.arabicWord,
                        isCJK && styles.cjkWord,
                        isSelected && styles.highlightedWord
                      ]}>{word}</Text>
                      {isSelected && selectedWordTranslation && (
                        <View style={styles.wordTranslationContainer}>
                          {wordTranslationLoading ? (
                            <ActivityIndicator size="small" color={COLORS.card} />
                          ) : (
                            <Text style={styles.wordTranslationText}>{selectedWordTranslation}</Text>
                          )}
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
              {selectedSentence === sentence.trim() && (
                <View style={[
                  styles.inlineTranslationContainer,
                  isArabic && styles.arabicTranslationContainer
                ]}>
                  {translationLoading ? (
                    <ActivityIndicator size="small" color={COLORS.accent} />
                  ) : (
                    translation && <Text style={styles.translationText}>{translation}</Text>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const preloadPages = useCallback(async () => {
    if (!story || !currentPage) return;
    
    const currentPageNumber = currentPage.page_number;
    const pagesToPreload = [];

    // Add pages before current page
    for (let i = Math.max(1, currentPageNumber - 5); i < currentPageNumber; i++) {
      pagesToPreload.push(i);
    }

    // Add pages after current page
    for (let i = currentPageNumber + 1; i <= Math.min(story.total_pages, currentPageNumber + 5); i++) {
      pagesToPreload.push(i);
    }

    // Preload each page
    for (const pageNumber of pagesToPreload) {
      // Skip if already cached
      if (getCachedPage(storyId, pageNumber)) continue;

      try {
        const { data: pageData, error: pageError } = await supabase
          .from('story_pages')
          .select('*')
          .eq('story_id', storyId)
          .eq('page_number', pageNumber)
          .single();

        if (pageError) continue;

        // Cache the page
        cachePage(storyId, story, pageData);
      } catch (err) {
        console.error(`Error preloading page ${pageNumber}:`, err);
      }
    }
  }, [story, currentPage, storyId, getCachedPage, cachePage]);

  useEffect(() => {
    if (currentPage) {
      preloadPages();
    }
  }, [currentPage, preloadPages]);

  const handleLanguageSelect = async (language: string) => {
    setPreferredLanguage(language);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .update({ preferred_translation_language: language })
        .eq('id', user.id);
    }
  };

  const storyReaderTutorialSteps = [
    {
      id: 'translation',
      message: t('storyReaderTutorialTranslation'),
      targetRef: contentRef,
    },
    {
      id: 'dictionary',
      message: t('storyReaderTutorialDictionary'),
      targetRef: contentRef,
    },
    {
      id: 'language_select',
      message: t('storyReaderTutorialLanguageSelect'),
    },
    {
      id: 'audiobook',
      message: t('storyReaderTutorialAudiobook'),
      targetRef: audioButtonRef,
    },
  ];

  const generatePageCache = async (pageNumber: number) => {
    console.log('Generating page cache');
    try {
      // Check if we already have a cached page
      const { data: existingCache, error: cacheError } = await supabase
        .from('story_pages')
        .select('*')
        .eq('story_id', storyId)
        .eq('page_number', pageNumber)
        .eq('is_cached', true)
        .maybeSingle();

      if (cacheError) {
        console.error('Error checking cache:', cacheError);
      }

      // If cache exists, don't generate new one
      if (existingCache) {
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Generate the next page for cache
      await generateStoryContent({
        language: story?.language || 'English',
        difficulty: story?.difficulty || 'A1',
        theme: story?.theme || 'general',
        userId: user.id,
        storyId,
        pageNumber: pageNumber,
        previousPages: [...previousPages, currentPage?.content || ''],
        targetWords: currentPage?.target_words || [],
        generateCache: true
      });

      console.log('Page cache generated');

    } catch (error) {
      console.error('Error generating cache:', error);
    }
  };

  if (loading || generating) {
    return (
      <View style={styles.outerContainer}>
        <Text style={styles.loadingText}>
          {generating ? t('generatingPage') : t('loadingStory')}
        </Text>
      </View>
    );
  }

  if (!story) {
    return (
      <View style={styles.outerContainer}>
        <Text style={styles.loadingText}>{t('storyNotFound')}</Text>
      </View>
    );
  }

  if (!currentPage) {
    if (pageNumber > story.total_pages) {
      return (
        <View style={styles.outerContainer}>
          <Text style={styles.loadingText}>{t('pageNotFound', { pageNumber })}</Text>
          <Button
            title={t('goToLastPage')}
            onPress={() => navigateToPage(story.total_pages)}
            type="outline"
            containerStyle={{ marginTop: 16 }}
            buttonStyle={{ borderColor: COLORS.accent, borderRadius: 16 }}
            titleStyle={{ color: COLORS.accent, fontFamily: 'Poppins-Bold' }}
          />
        </View>
      );
    }
    return (
      <View style={styles.outerContainer}>
        <Text style={styles.loadingText}>Loading page...</Text>
      </View>
    );
  }

  const isLastPage = pageNumber >= story.total_pages;

  return (
    <View style={styles.outerContainer}>
      <AnimatedBackground />
      <ScrollView ref={scrollViewRef} style={styles.content} contentContainerStyle={{ paddingBottom: 120 }}>

        <View style={styles.header}>
          <Text style={styles.headerText}>{story.title}</Text>
          <View style={styles.headerInfo}>
            <Text style={styles.headerMeta}>Page {pageNumber} of {story.total_pages || 1}</Text>
            <Text style={styles.difficultyBadge}>CEFR {story.difficulty}</Text>
            <TouchableOpacity
              ref={audioButtonRef}
              style={styles.audioIconButton}
              onPress={() => setShowAudioPlayer(!showAudioPlayer)}
            >
              <Icon 
                name={showAudioPlayer ? "cancel" : "headphones"} 
                size={20} 
                color={COLORS.accent}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.storyBox}>
          {renderContent()}
        </View>
        {currentPage.target_words.length > 0 && (
          <View style={styles.targetWordsContainer}>
            <Text style={styles.targetWordsTitle}>Target Words:</Text>
            <View style={styles.targetWordsList}>
              {currentPage.target_words.map((word, index) => (
                <View key={index} style={styles.targetWordChip}>
                  <Text style={styles.targetWordText}>{word}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
      </ScrollView>
      {/* Floating Action Buttons */}
      {isLastPage && (
        <View style={styles.fabContainer} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.fabWordsButton}
            onPress={() => setShowPersonalizeModal(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.fabWordsButtonText}>{t('words')}</Text>
            <Icon name="edit" size={20} color={COLORS.card} style={{ marginLeft: 8 }} />
            {personalizedTargetWords.length > 0 && (
              <View style={styles.wordsCountBubble}>
                <Text style={styles.wordsCountBubbleText}>{personalizedTargetWords.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.fabContinueButton}
            onPress={() => generateNewPage()}
            activeOpacity={0.85}
          >
            <Text style={styles.fabContinueButtonText}>{t('continueReading')}</Text>
            {pageNumber >= 4 && (
              <>
                <Text style={styles.fabContinueButtonPrice}>{FUNCTION_COSTS.GENERATE_NEW_PAGE}</Text>
                <Icon name="monetization-on" size={16} color={COLORS.card} style={styles.fabContinueButtonIcon} />
              </>
            )}
            <Icon name="arrow-forward" size={24} color={COLORS.card} style={styles.fabArrowIcon} />
          </TouchableOpacity>
        </View>
      )}
      {/* Navigation arrows (keep floating left/right) */}
      <TouchableOpacity
        onPress={() => navigateToPage(pageNumber - 1)}
        disabled={pageNumber <= 1}
        style={[styles.fabNavButton, { left: 16, bottom: isLastPage ? 96 : 32 }, pageNumber <= 1 && styles.disabledButton]}
      >
        <Icon name="arrow-back" size={24} color={pageNumber <= 1 ? COLORS.bright : COLORS.background} />
      </TouchableOpacity>
      {!isLastPage && (
        <TouchableOpacity
          onPress={() => navigateToPage(pageNumber + 1)}
          style={[styles.fabNavButton, { right: 16, bottom: 32 }, pageNumber >= story.total_pages && styles.disabledButton]}
        >
          <Icon name="arrow-forward" size={24} color={pageNumber >= story.total_pages ? COLORS.bright : COLORS.background} />
        </TouchableOpacity>
      )}
      <Modal
        visible={showPersonalizeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPersonalizeModal(false)}
      >
        <View style={styles.targetWordModal}>
          <View style={styles.targetWordModalBox}>
            <Text style={styles.targetWordModalTitle}>{t('addTargetWordsTitle')}</Text>
            <Text style={styles.targetWordModalDescription}>{t('addTargetWordsDescription')}</Text>
            <View style={styles.targetWordModalInputRow}>
              <Input
                inputContainerStyle={styles.inputContainer}
                inputStyle={styles.input}
                containerStyle={styles.inputFlex}
                placeholder={t('wordInputPlaceholder')}
                value={newTargetWord}
                onChangeText={setNewTargetWord}
                placeholderTextColor={COLORS.accent}
                onSubmitEditing={addTargetWord}
                returnKeyType="done"
              />
              <TouchableOpacity style={styles.targetWordModalAddButton} onPress={addTargetWord} disabled={!newTargetWord.trim()}>
                <Icon name="add" color={COLORS.card} size={24} style={{ backgroundColor: COLORS.accent, borderRadius: 16, padding: 6 }} />
              </TouchableOpacity>
            </View>
            <View style={styles.targetWordsList}>
              {personalizedTargetWords.map((word, index) => (
                <Chip
                  key={word}
                  title={word}
                  onPress={() => removeTargetWord(word)}
                  containerStyle={styles.chip}
                  buttonStyle={{ backgroundColor: COLORS.bright }}
                  titleStyle={{ color: COLORS.primary, fontFamily: 'Poppins-SemiBold' }}
                  icon={{ name: 'close', type: 'ionicon', color: COLORS.primary, size: 16 }}
                  iconRight
                />
              ))}
            </View>
            <TouchableOpacity style={styles.targetWordModalDoneButton} onPress={() => setShowPersonalizeModal(false)}>
              <Text style={styles.targetWordModalDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Dictionary
        word={selectedWord?.text || ''}
        language={story?.language || 'English'}
        isVisible={showDictionary}
        onClose={() => {
          setShowDictionary(false);
          setSelectedWord(null);
          setDefinitions(null);
        }}
        definitions={definitions}
        isLoading={isDictionaryLoading}
        onDictionaryTypeChange={handleDictionaryTypeChange}
      />
      {/* Audio Player Overlay */}
      {showAudioPlayer && (
        <View style={styles.audioPlayerOverlay} pointerEvents="box-none">
            <TouchableOpacity style={styles.audioPlayerClose} onPress={() => setShowAudioPlayer(false)}>
              <Icon name="close" size={24} color={COLORS.accent} />
            </TouchableOpacity>
            <AudioPlayer
              audioUrl={audioUrl}
              isLoading={audioLoading}
              onVoiceChange={handleVoiceChange}
              selectedVoice={selectedVoice}
              onPlay={generatePageAudio}
              availableVoices={availableVoices}
            />
        </View>
      )}
      <TutorialOverlay
        screenName="story_reader"
        steps={storyReaderTutorialSteps}
        onLanguageSelect={handleLanguageSelect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 24,
    borderBottomWidth: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  headerText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: 'Poppins-Bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  headerMeta: {
    color: COLORS.accent,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    marginRight: 8,
  },
  difficultyBadge: {
    backgroundColor: COLORS.bright,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: 'Poppins-Bold',
  },
  audioIconButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  storyBox: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 18,
    margin: 16,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
    color: COLORS.primary,
    fontFamily: 'Poppins-Bold',
  },
  targetWordsContainer: {
    padding: 16,
    backgroundColor: COLORS.brighter,
    marginTop: 16,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  targetWordsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.primary,
    fontFamily: 'Poppins-Bold',
  },
  targetWordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  targetWordChip: {
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  targetWordText: {
    fontSize: 14,
    color: COLORS.card,
    fontFamily: 'Poppins-SemiBold',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0,
    backgroundColor: 'transparent',
    padding: 16,
  },
  lastPageButtons: {
    flexDirection: 'row',
    padding: 14,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  continueButtonText: {
    color: COLORS.card,
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  continueButtonPrice: {
    color: COLORS.card,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
    fontFamily: 'Poppins-Bold',
  },
  continueButtonIcon: {},
  navButton: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: COLORS.bright,
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  sentenceWrapper: {
    width: '100%',
  },
  sentenceContainer: {
    marginBottom: 4,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: 6,
  },
  arabicSentenceContainer: {
    flexDirection: 'row-reverse',
  },
  highlightedSentence: {
    backgroundColor: COLORS.brighter,
    borderRadius: 4,
  },
  inlineTranslationContainer: {
    marginTop: 4,
    marginLeft: 16,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.accent,
  },
  arabicTranslationContainer: {
    marginLeft: 0,
    marginRight: 16,
    paddingLeft: 0,
    paddingRight: 8,
    borderLeftWidth: 0,
    borderRightWidth: 2,
    borderRightColor: COLORS.accent,
  },
  translationText: {
    fontSize: 16,
    color: COLORS.accent,
  },
  textContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 2,
  },
  arabicTextContainer: {
    flexDirection: 'row-reverse',
  },
  wordWrapper: {
    marginRight: 4,
  },
  word: {
    fontSize: 19,
    lineHeight: 24,
  },
  arabicWord: {
    fontSize: 22,
    lineHeight: 28,
  },
  cjkWord: {
    fontSize: 20,
    lineHeight: 26,
  },
  highlightedWord: {
    backgroundColor: COLORS.brighter,
    borderRadius: 4,
  },
  fabContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    right: 16,
    bottom: 32,
    zIndex: 10,
    left: 16,
  },
  fabContinueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    borderRadius: 24,
    height: 48,
    paddingHorizontal: 20,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginLeft: 8,
  },
  fabContinueButtonText: {
    color: COLORS.card,
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    marginRight: 8,
  },
  fabContinueButtonPrice: {
    color: COLORS.card,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
    fontFamily: 'Poppins-Bold',
  },
  fabContinueButtonIcon: {
    marginRight: 4,
  },
  fabArrowIcon: {
    backgroundColor: 'transparent',
    borderRadius: 24,
    padding: 0,
  },
  fabWordsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    borderRadius: 24,
    height: 48,
    paddingHorizontal: 20,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  fabWordsButtonText: {
    color: COLORS.card,
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    marginRight: 8,
  },
  fabNavButton: {
    position: 'absolute',
    borderRadius: 24,
    width: 48,
    height: 48,
    backgroundColor: COLORS.bright,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  targetWordModal: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  targetWordModalBox: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 24,
    width: '90%',
    alignSelf: 'center',
    shadowColor: COLORS.accent,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  targetWordModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: 'Poppins-Bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  targetWordModalDescription: {
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: 'Poppins-Regular',
    marginBottom: 16,
    textAlign: 'center',
  },
  targetWordModalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputContainer: {
    borderBottomWidth: 2,
    borderColor: COLORS.accent,
    backgroundColor: 'transparent',
    paddingVertical: 20,
    color: COLORS.primary,
    flex: 1,
  },
  input: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
    fontFamily: 'Poppins-Regular',
    paddingLeft: 0,
    flex: 1,
  },
  inputFlex: {
    flex: 1,
    marginLeft: 0,
    marginRight: 0,
    paddingRight: 0,
    paddingLeft: 0,
  },
  chip: {
    margin: 4,
  },
  targetWordModalAddButton: {
    marginLeft: 8,
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    padding: 2,
  },
  targetWordModalDoneButton: {
    marginTop: 18,
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignSelf: 'center',
  },
  targetWordModalDoneText: {
    color: COLORS.card,
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },
  wordsCountBubble: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    borderWidth: 2,
    borderColor: COLORS.card,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.18,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  wordsCountBubbleText: {
    color: COLORS.card,
    fontFamily: 'Poppins-Bold',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  audioPlayerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
    pointerEvents: 'box-none',
  },
  audioPlayerBox: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 0,
    width: '90%',
    maxWidth: 400,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  audioPlayerClose: {
    position: 'absolute',
    top: 10,
    right: 15,
    zIndex: 10,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 4,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  wordTranslationContainer: {
    backgroundColor: COLORS.accent,
    borderRadius: 4,
    padding: 4,
    marginTop: 4,
    zIndex: 1000,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.18,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  wordTranslationText: {
    color: COLORS.card,
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  sentenceTouchable: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
});
