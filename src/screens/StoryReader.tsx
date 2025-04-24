import React, { useState, useEffect } from 'react';
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
import { Text, Button, Input } from 'react-native-elements';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';
import { supabase } from '@/services/supabase';
import { generateStoryPage, translateText, StoryGenerationParams } from '@/services/ai';
import { generateSpeech, uploadAudioToStorage, VoiceId } from '@/services/elevenlabs';
import AudioPlayer from '@/components/AudioPlayer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Dictionary, { Definition } from '@/components/Dictionary';
import { fetchDefinitions } from '@/services/dictionary';

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

  const fetchStoryAndPage = async () => {
    try {
      // Fetch story details
      const { data: storyData, error: storyError } = await supabase
        .from('stories')
        .select('*')
        .eq('id', storyId)
        .single();

      if (storyError) throw storyError;
      setStory(storyData);

      // Fetch current page
      const { data: pageData, error: pageError } = await supabase
        .from('story_pages')
        .select('*')
        .eq('story_id', storyId)
        .eq('page_number', pageNumber)
        .single();

      if (pageError) {
        if (pageError.code === 'PGRST116') { // No results found
          if (pageNumber > (storyData?.total_pages || 0)) {
            // If trying to access a page beyond the total, navigate to the last available page
            navigation.setParams({ pageNumber: storyData.total_pages });
            return;
          }
        } else {
          throw pageError;
        }
      }
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

    } catch (error) {
      console.error('Error fetching story:', error);
      Alert.alert('Error', 'Failed to load story');
    } finally {
      setLoading(false);
    }
  };

  const handleSentencePress = async (sentence: string) => {
    setSelectedSentence(sentence);
    setTranslationLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if translation exists in cache
      const { data: cachedTranslation, error: cacheError } = await supabase
        .from('translations')
        .select('translated_text')
        .eq('user_id', user.id)
        .eq('original_text', sentence)
        .eq('target_language', translationLanguage)
        .single();

      if (cacheError && cacheError.code !== 'PGRST116') {
        throw cacheError;
      }

      if (cachedTranslation) {
        setTranslation(cachedTranslation.translated_text);
      } else {
        // Generate new translation
        const translatedText = await translateText(sentence, translationLanguage);
        
        // Cache the translation
        const { error: insertError } = await supabase
          .from('translations')
          .insert({
            user_id: user.id,
            original_text: sentence,
            target_language: translationLanguage,
            translated_text: translatedText,
          });

        if (insertError) throw insertError;
        setTranslation(translatedText);
      }
    } catch (error) {
      console.error('Error translating sentence:', error);
      Alert.alert('Error', 'Failed to translate sentence');
    } finally {
      setTranslationLoading(false);
    }
  };

  const generateNewPage = async (customTargetWords?: string[]) => {
    if (!story) return;
    
    setGenerating(true);
    try {
      const params: StoryGenerationParams = {
        language: story.language,
        difficulty: story.difficulty,
        theme: story.theme,
        targetWords: customTargetWords || currentPage?.target_words || [],
      };

      // Generate new page content
      const newPageContent = await generateStoryPage(
        params,
        (story.total_pages || 0) + 1,
        previousPages
      );

      // Insert new page
      const newPageNumber = (story.total_pages || 0) + 1;
      const { error: pageError } = await supabase
        .from('story_pages')
        .insert({
          story_id: storyId,
          page_number: newPageNumber,
          content: newPageContent,
          target_words: customTargetWords || currentPage?.target_words || [],
        });

      if (pageError) throw pageError;

      // Update story total pages
      const { error: storyError } = await supabase
        .from('stories')
        .update({ total_pages: newPageNumber })
        .eq('id', storyId);

      if (storyError) throw storyError;

      // Navigate to the new page
      navigation.setParams({ pageNumber: newPageNumber });
      
      // Reset personalization state
      setPersonalizedTargetWords([]);
      setShowPersonalizeModal(false);

    } catch (error) {
      console.error('Error generating new page:', error);
      Alert.alert('Error', 'Failed to generate new page');
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

      // Generate new audio with selected voice
      generatePageAudio(voiceId);
    } catch (error) {
      console.error('Error updating voice preference:', error);
    }
  };

  const generatePageAudio = async (voiceId: VoiceId = selectedVoice) => {
    if (!currentPage || !story) return;

    setAudioLoading(true);
    try {
      // Check if audio already exists - get the most recent recording
      const { data: existingAudio, error: fetchError } = await supabase
        .from('audio_recordings')
        .select('audio_url')
        .eq('story_id', storyId)
        .eq('page_number', pageNumber)
        .eq('voice_id', voiceId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingAudio) {
        setAudioUrl(existingAudio.audio_url);
        return;
      }

      // Generate new audio
      const audioBuffer = await generateSpeech(currentPage.content, voiceId);
      const audioUrl = await uploadAudioToStorage(audioBuffer);

      // Save to database
      const { error: insertError } = await supabase
        .from('audio_recordings')
        .insert({
          story_id: storyId,
          page_number: pageNumber,
          voice_id: voiceId,
          audio_url: audioUrl,
          created_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      setAudioUrl(audioUrl);
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
    setDefinitions(null);

    try {
      const defs = await fetchDefinitions(word);
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

    const sentences = currentPage.content
      .split(/([.!?]+\s+)/)
      .filter(Boolean)
      .map((part, i, arr) => {
        if (i % 2 === 0 && i + 1 < arr.length) {
          return part + arr[i + 1];
        }
        return i % 2 === 0 ? part : '';
      })
      .filter(Boolean);

    return (
      <View style={styles.textContainer}>
        {sentences.map((sentence, index) => {
          const words = sentence.trim().split(/\s+/);
          return (
            <View key={index} style={styles.sentenceWrapper}>
              <View
                style={[
                  styles.sentenceContainer,
                  selectedSentence === sentence.trim() && styles.highlightedSentence
                ]}
              >
                {words.map((word, wordIndex) => (
                  <Pressable
                    key={wordIndex}
                    onLongPress={() => handleWordLongPress(word.replace(/[.,!?]$/, ''))}
                    onPress={() => handleSentencePress(sentence.trim())}
                    delayLongPress={500}
                    style={styles.wordWrapper}
                  >
                    <Text style={styles.word}>{word}</Text>
                  </Pressable>
                ))}
              </View>
              {selectedSentence === sentence.trim() && (
                <View style={styles.inlineTranslationContainer}>
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

      <ScrollView style={styles.content}>
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
        <Button
          title="Previous"
          onPress={() => navigateToPage(pageNumber - 1)}
          disabled={pageNumber <= 1}
          type="outline"
        />
        {isLastPage ? (
          <View style={styles.lastPageButtons}>
            <Button
              title="Personalize"
              onPress={() => setShowPersonalizeModal(true)}
              type="outline"
              buttonStyle={styles.personalizeButton}
            />
            <Button
              title="Continue Story"
              onPress={() => generateNewPage()}
              type="solid"
            />
          </View>
        ) : (
          <Button
            title="Next"
            onPress={() => navigateToPage(pageNumber + 1)}
            type="outline"
          />
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
  wordWrapper: {
    marginRight: 4,
  },
  word: {
    fontSize: 19,
    lineHeight: 24,
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
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
  },
  lastPageButtons: {
    flexDirection: 'row',
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
  sentenceText: {
    fontSize: 16,
    lineHeight: 24,
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
  translationText: {
    fontSize: 16,
    color: '#0066cc',
  },
}); 