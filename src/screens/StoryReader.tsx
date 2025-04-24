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
} from 'react-native';
import { Text, Button, Input } from 'react-native-elements';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';
import { supabase } from '@/services/supabase';
import { generateStoryPage, StoryGenerationParams } from '@/services/ai';

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
  const [showPersonalizeModal, setShowPersonalizeModal] = useState(false);
  const [newTargetWord, setNewTargetWord] = useState('');
  const [personalizedTargetWords, setPersonalizedTargetWords] = useState<string[]>([]);
  const [previousPages, setPreviousPages] = useState<string[]>([]);

  useEffect(() => {
    fetchStoryAndPage();
  }, [storyId, pageNumber]);

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
    // TODO: Implement translation logic using OpenAI
    setTranslation('Translation will be implemented here');
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
  const sentences = currentPage.content.split(/(?<=[.!?])\s+/);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text h4>{story.title}</Text>
        <View style={styles.headerInfo}>
          <Text>Page {pageNumber} of {story.total_pages || 1}</Text>
          <Text style={styles.difficultyBadge}>CEFR {story.difficulty}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.pageContent}>
          {sentences.map((sentence, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleSentencePress(sentence)}
              style={[
                styles.sentence,
                selectedSentence === sentence && styles.selectedSentence
              ]}
            >
              <Text style={styles.sentenceText}>{sentence}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedSentence && translation && (
          <View style={styles.translationBox}>
            <Text style={styles.translationText}>{translation}</Text>
          </View>
        )}

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
  },
  difficultyBadge: {
    marginLeft: 8,
    backgroundColor: '#e1e8ed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  pageContent: {
    padding: 16,
  },
  sentence: {
    paddingVertical: 4,
  },
  selectedSentence: {
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  sentenceText: {
    fontSize: 18,
    lineHeight: 28,
  },
  translationBox: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  translationText: {
    fontSize: 16,
    color: '#666',
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
}); 