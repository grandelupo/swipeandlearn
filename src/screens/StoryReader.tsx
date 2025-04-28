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
} from 'react-native';
import { Text, Button, Input } from '@rneui/themed';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';
import { supabase } from '@/services/supabase';
import { generateStoryContent, generateSpeech, translateText } from '@/services/edgeFunctions';
import AudioPlayer from '@/components/AudioPlayer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Dictionary, { Definition } from '@/components/Dictionary';
import { fetchDefinitions } from '@/services/dictionary';
import { VoiceId } from '@/services/elevenlabs';
import { useStoryCache } from '../contexts/StoryCacheContext';
import { useCoins as useCoinContext } from '../contexts/CoinContext';
import { FUNCTION_COSTS } from '@/services/revenuecat';

interface StoryPage {
  content: string;
  page_number: number;
  target_words: string[];
}

interface Story {
  id: string;
  title: string;
  language: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  theme: string;
  total_pages: number;
}

type StoryReaderScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'StoryReader'>;
type StoryReaderScreenRouteProp = RouteProp<MainStackParamList, 'StoryReader'>;

export default function StoryReader() {
  const route = useRoute<StoryReaderScreenRouteProp>();
  const navigation = useNavigation<StoryReaderScreenNavigationProp>();
  const { storyId, pageNumber = 1 } = route.params;
  const scrollViewRef = useRef<ScrollView>(null);
  const { getCachedPage, getCachedStory, cachePage } = useStoryCache();
  const { useCoins, showInsufficientCoinsAlert } = useCoinContext();

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
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [showDictionary, setShowDictionary] = useState(false);
  const [definitions, setDefinitions] = useState<Definition[] | null>(null);
  const [isDictionaryLoading, setIsDictionaryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStoryAndPage();
    fetchTranslationLanguage();
    fetchUserVoicePreference();
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

      // Update last accessed timestamp
      await supabase
        .from('stories')
        .update({ last_accessed: new Date().toISOString() })
        .eq('id', storyId);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [storyId, pageNumber, getCachedStory, getCachedPage, cachePage]);

  const handleSentencePress = async (sentence: string) => {
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
      Alert.alert('Error', 'Failed to translate sentence');
    } finally {
      setTranslationLoading(false);
    }
  };

  const generateNewPage = async (customTargetWords?: string[]) => {
    if (!story) return;
    
    // Check if the user has enough coins
    const hasCoins = await useCoins('GENERATE_NEW_PAGE');
    if (!hasCoins) {
      showInsufficientCoinsAlert('GENERATE_NEW_PAGE', () => 
        setShowPersonalizeModal(false) // Close the personalize modal if open
      );
      return;
    }
    
    setGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { content: newContent } = await generateStoryContent({
        language: story.language,
        difficulty: story.difficulty,
        theme: story.theme || 'free form',
        targetWords: customTargetWords || [],
        pageNumber: (story.total_pages || 0) + 1,
        previousPages,
        storyId,
        userId: user.id,
      });

      // Navigate to the new page
      navigation.setParams({ pageNumber: (story.total_pages || 0) + 1 });
      
      // Reset personalization state
      setPersonalizedTargetWords([]);
      setShowPersonalizeModal(false);

    } catch (error) {
      console.error('Error generating new page:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert(
        'Error',
        `Failed to generate new page: ${errorMessage}. Please try again.`
      );
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

  const navigateToPage = (newPage: number) => {
    if (story && newPage > 0 && newPage <= story.total_pages) {
      navigation.setParams({ pageNumber: newPage });
    }
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  };

  const handleVoiceChange = async (voiceId: VoiceId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setSelectedVoice(voiceId);
      
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
    if (!currentPage || !story) return;

    // Check if we already have audio for this page and voice
    if (audioUrl && selectedVoice === voiceId) {
      setShowAudioPlayer(true);
      return;
    }

    // Check if the audio exists in the database
    try {
      const { data: existingAudio, error: audioError } = await supabase
        .from('story_audio')
        .select('audio_url')
        .eq('story_id', storyId)
        .eq('page_number', pageNumber)
        .eq('voice_id', voiceId)
        .single();

      if (!audioError && existingAudio?.audio_url) {
        setAudioUrl(existingAudio.audio_url);
        setShowAudioPlayer(true);
        return;
      }
    } catch (error) {
      console.error('Error checking for existing audio:', error);
    }

    // If we get here, we need to generate new audio
    // Check if the user has enough coins
    const hasCoins = await useCoins('GENERATE_AUDIO');
    if (!hasCoins) {
      showInsufficientCoinsAlert('GENERATE_AUDIO', () => {});
      return;
    }

    setAudioLoading(true);
    try {
      const audioUrl = await generateSpeech({
        text: currentPage.content,
        voiceId,
        storyId,
        pageNumber: pageNumber,
      });

      setAudioUrl(audioUrl);
      setShowAudioPlayer(true);
    } catch (error) {
      console.error('Error generating audio:', error);
      Alert.alert('Error', 'Failed to generate audio');
    } finally {
      setAudioLoading(false);
    }
  };

  const handleWordLongPress = async (word: string) => {
    setSelectedWord(word);
    setShowDictionary(true);
    setIsDictionaryLoading(true);

    try {
      const defs = await fetchDefinitions(word, story?.language || 'English');
      setDefinitions(defs);
    } catch (error) {
      console.error('Error fetching definitions:', error);
      Alert.alert('Error', 'Failed to fetch word definition');
    } finally {
      setIsDictionaryLoading(false);
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
            // For Chinese and Japanese, split by individual characters
            words = sentence.trim().split('');
          } else {
            words = sentence.trim().split(/\s+/);
          }
          
          return (
            <View key={index} style={styles.sentenceWrapper}>
              <View
                style={[
                  styles.sentenceContainer,
                  selectedSentence === sentence.trim() && styles.highlightedSentence,
                  isArabic && styles.arabicSentenceContainer
                ]}
              >
                {words.map((word, wordIndex) => (
                  <Pressable
                    key={wordIndex}
                    onLongPress={() => handleWordLongPress(word.replace(/[.,!?。！？]$/, ''))}
                    onPress={() => handleSentencePress(sentence.trim())}
                    delayLongPress={500}
                    style={styles.wordWrapper}
                  >
                    <Text style={[
                      styles.word,
                      isArabic && styles.arabicWord,
                      isCJK && styles.cjkWord
                    ]}>{word}</Text>
                  </Pressable>
                ))}
              </View>
              {selectedSentence === sentence.trim() && (
                <View style={[
                  styles.inlineTranslationContainer,
                  isArabic && styles.arabicTranslationContainer
                ]}>
                  {translationLoading ? (
                    <ActivityIndicator size="small" color="#0066cc" />
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

  if (loading || generating) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          {generating ? 'Generating new page...' : 'Loading...'}
        </Text>
      </View>
    );
  }

  if (!story) {
    return (
      <View style={styles.errorContainer}>
        <Text>Story not found</Text>
      </View>
    );
  }

  if (!currentPage) {
    if (pageNumber > story.total_pages) {
      return (
        <View style={styles.errorContainer}>
          <Text>Page {pageNumber} not found</Text>
          <Button
            title="Go to last page"
            onPress={() => navigation.setParams({ pageNumber: story.total_pages })}
            type="outline"
            containerStyle={{ marginTop: 16 }}
          />
        </View>
      );
    }
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading page...</Text>
      </View>
    );
  }

  const isLastPage = pageNumber >= story.total_pages;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text h4>{story.title}</Text>
        <View style={styles.headerInfo}>
          <Text>Page {pageNumber} of {story.total_pages || 1}</Text>
          <Text style={styles.difficultyBadge}>CEFR {story.difficulty}</Text>
          <TouchableOpacity
            style={styles.audioIconButton}
            onPress={() => setShowAudioPlayer(!showAudioPlayer)}
          >
            <Icon 
              name={showAudioPlayer ? "cancel" : "headphones"} 
              size={20} 
              color="#0066cc"
            />
          </TouchableOpacity>
        </View>
      </View>

      {showAudioPlayer && (
        <AudioPlayer
          audioUrl={audioUrl}
          isLoading={audioLoading}
          onVoiceChange={handleVoiceChange}
          selectedVoice={selectedVoice}
          onPlay={generatePageAudio}
        />
      )}

      <ScrollView ref={scrollViewRef} style={styles.content}>
        <View style={styles.textContainer}>
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

      <View style={styles.navigation}>
        <TouchableOpacity
          onPress={() => navigateToPage(pageNumber - 1)}
          disabled={pageNumber <= 1}
          style={[styles.navButton, pageNumber <= 1 && styles.disabledButton]}
        >
          <Icon name="arrow-back" size={24} color={pageNumber <= 1 ? '#ccc' : '#0066cc'} />
        </TouchableOpacity>
        {isLastPage ? (
          <View style={styles.lastPageButtons}>
            <Button
              title="Personalize"
              onPress={() => setShowPersonalizeModal(true)}
              type="outline"
              buttonStyle={styles.personalizeButton}
            />
            <TouchableOpacity
              onPress={() => generateNewPage()}
              style={styles.continueButton}
            >
              <Text style={styles.continueButtonText}>
                Continue Story 
              </Text>
              <Text style={styles.continueButtonPrice}>{FUNCTION_COSTS.GENERATE_NEW_PAGE}</Text>
              <Icon name="monetization-on" size={16} color="#FFD700" style={styles.continueButtonIcon} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => navigateToPage(pageNumber + 1)}
            style={[styles.navButton, pageNumber >= story.total_pages && styles.disabledButton]}
          >
            <Icon name="arrow-forward" size={24} color={pageNumber >= story.total_pages ? '#ccc' : '#0066cc'} />
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={showPersonalizeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPersonalizeModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text h4 style={styles.modalTitle}>Personalize Next Page</Text>
            <Text style={styles.modalSubtitle}>Add target words for the next page:</Text>
            
            <View style={styles.inputContainer}>
              <Input
                value={newTargetWord}
                onChangeText={setNewTargetWord}
                placeholder="Enter a target word"
                onSubmitEditing={addTargetWord}
                returnKeyType="done"
              />
              <Button
                title="Add"
                onPress={addTargetWord}
                disabled={!newTargetWord.trim()}
              />
            </View>

            <View style={styles.targetWordsList}>
              {personalizedTargetWords.map((word, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.targetWordChip}
                  onPress={() => removeTargetWord(word)}
                >
                  <Text style={styles.targetWordText}>{word} ✕</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => {
                  setShowPersonalizeModal(false);
                  setPersonalizedTargetWords([]);
                }}
                type="outline"
              />
              <Button
                title="Generate"
                onPress={() => generateNewPage(personalizedTargetWords)}
                disabled={personalizedTargetWords.length === 0}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Dictionary
        word={selectedWord || ''}
        language={story?.language || 'English'}
        isVisible={showDictionary}
        onClose={() => {
          setShowDictionary(false);
          setSelectedWord(null);
          setDefinitions(null);
        }}
        definitions={definitions}
        isLoading={isDictionaryLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    alignItems: 'center',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  difficultyBadge: {
    backgroundColor: '#e1e8ed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  audioIconButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  textContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
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
    backgroundColor: '#e1e8ed',
  },
  targetWordsContainer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    marginTop: 16,
  },
  targetWordsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  targetWordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  targetWordChip: {
    backgroundColor: '#e1e8ed',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  targetWordText: {
    fontSize: 14,
    color: '#444',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
  },
  lastPageButtons: {
    flexDirection: 'row',
    padding: 14,
  },
  personalizeButton: {
    marginRight: 8,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  sentenceWrapper: {
    marginBottom: 8,
    width: '100%',
  },
  sentenceContainer: {
    marginBottom: 4,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  arabicSentenceContainer: {
    flexDirection: 'row-reverse',
  },
  highlightedSentence: {
    backgroundColor: '#e1e8ed',
    borderRadius: 4,
  },
  inlineTranslationContainer: {
    marginTop: 4,
    marginLeft: 16,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#0066cc',
  },
  arabicTranslationContainer: {
    marginLeft: 0,
    marginRight: 16,
    paddingLeft: 0,
    paddingRight: 8,
    borderLeftWidth: 0,
    borderRightWidth: 2,
    borderRightColor: '#0066cc',
  },
  translationText: {
    fontSize: 16,
    color: '#0066cc',
  },
  navButton: {
    borderRadius: 16,
    padding: 14,
  },
  disabledButton: {
    opacity: 0.5,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066cc',
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  continueButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  continueButtonPrice: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  continueButtonIcon: {
  },
}); 
