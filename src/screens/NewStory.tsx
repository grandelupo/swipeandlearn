import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { Input, Button, Text, Chip } from 'react-native-elements';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';
import { supabase } from '@/services/supabase';
import { generateStoryContent, generateBookCover } from '@/services/edgeFunctions';
import { useCoins as useCoinContext } from '../contexts/CoinContext';
import { FUNCTION_COSTS } from '@/services/revenuecat';
import { Icon } from 'react-native-elements';

type NewStoryScreenNavigationProp = NativeStackNavigationProp<MainStackParamList>;

type Difficulty = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Divine';

const SUPPORTED_LANGUAGES = [
  { label: 'English', value: 'English' },
  { label: 'Spanish', value: 'Spanish' },
  { label: 'French', value: 'French' },
  { label: 'German', value: 'German' },
  { label: 'Italian', value: 'Italian' },
  { label: 'Portuguese', value: 'Portuguese' },
  { label: 'Chinese', value: 'Chinese' },
  { label: 'Japanese', value: 'Japanese' },
  { label: 'Korean', value: 'Korean' },
  { label: 'Russian', value: 'Russian' },
  { label: 'Arabic', value: 'Arabic' },
  { label: 'Polish', value: 'Polish' },
];

const DIFFICULTY_LEVELS: Array<{ label: string; value: Difficulty; description: string }> = [
  { 
    label: 'A1 - Beginner',
    value: 'A1',
    description: 'Basic phrases and everyday expressions. Can introduce themselves and interact in a simple way.'
  },
  { 
    label: 'A2 - Elementary',
    value: 'A2',
    description: 'Familiar topics and routine matters. Can describe aspects of their background and immediate environment.'
  },
  { 
    label: 'B1 - Intermediate',
    value: 'B1',
    description: 'Main points on familiar matters. Can deal with most situations likely to arise while traveling.'
  },
  { 
    label: 'B2 - Upper Intermediate',
    value: 'B2',
    description: 'Complex texts and technical discussions. Can interact with fluency and spontaneity.'
  },
  { 
    label: 'C1 - Advanced',
    value: 'C1',
    description: 'Complex and demanding texts. Can use language flexibly for social, academic and professional purposes.'
  },
  { 
    label: 'C2 - Mastery',
    value: 'C2',
    description: 'Virtually everything heard or read. Can express themselves spontaneously, very fluently and precisely.'
  },
  {
    label: 'Divine - Beyond Mortal Understanding',
    value: 'Divine',
    description: 'Transcends conventional language mastery. Features archaic forms, complex metaphysical concepts, and intricate literary devices beyond classical epics. Challenges even educated native speakers.'
  }
];

export default function NewStoryScreen() {
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState(SUPPORTED_LANGUAGES[0].value);
  const [difficulty, setDifficulty] = useState<Difficulty>(DIFFICULTY_LEVELS[0].value);
  const [theme, setTheme] = useState('');
  const [targetWord, setTargetWord] = useState('');
  const [targetWords, setTargetWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [useGrok, setUseGrok] = useState(false);
  const [generateCover, setGenerateCover] = useState(false);
  const navigation = useNavigation<NewStoryScreenNavigationProp>();
  const { useCoins, showInsufficientCoinsAlert } = useCoinContext();

  useEffect(() => {
    fetchUserPreferences();
  }, []);

  const fetchUserPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('preferred_model')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUseGrok(data?.preferred_model === 'grok');
    } catch (error) {
      console.error('Error fetching user preferences:', error);
    }
  };

  const updateUserPreferences = async (useGrok: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ preferred_model: useGrok ? 'grok' : 'gpt4' })
        .eq('id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  };

  const handleModelToggle = (value: boolean) => {
    setUseGrok(value);
    updateUserPreferences(value);
  };

  const addTargetWord = () => {
    if (targetWord.trim() && !targetWords.includes(targetWord.trim())) {
      setTargetWords([...targetWords, targetWord.trim()]);
      setTargetWord('');
    }
  };

  const removeTargetWord = (word: string) => {
    setTargetWords(targetWords.filter(w => w !== word));
  };

  const handleCreateStory = async () => {
    // Check if user has enough coins for the story
    const hasStoryCoins = await useCoins('GENERATE_STORY');
    if (!hasStoryCoins) {
      showInsufficientCoinsAlert('GENERATE_STORY', () => {});
      return;
    }

    // If generating cover, check if user has enough coins for that too
    if (generateCover) {
      const hasCoverCoins = await useCoins('GENERATE_COVER');
      if (!hasCoverCoins) {
        // If they don't have enough coins for the cover, ask if they want to continue without it
        Alert.alert(
          'Insufficient Coins for Cover',
          `You don't have enough coins (${FUNCTION_COSTS.GENERATE_COVER}) to generate a cover image. Would you like to continue without a cover?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Continue without cover', 
              onPress: () => {
                setGenerateCover(false);
                // Re-attempt creation without cover
                setTimeout(() => handleCreateStory(), 500);
              }
            }
          ]
        );
        return;
      }
    }

    setLoading(true);
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      let storyId: string;
      let storyTitle: string;

      if (!title.trim()) {
        setProgress('Generating title...');
        // Generate title only if not provided
        const result = await generateStoryContent({
          language,
          theme: theme.trim() || 'free form',
          targetWords,
          difficulty,
          pageNumber: 0,
          userId: user.id,
        });
        
        storyTitle = result.content;
        storyId = result.storyId!;
      } else {
        // If title is provided, create story entry directly
        const { data: storyData, error: storyError } = await supabase
          .from('stories')
          .insert({
            title: title.trim(),
            language,
            difficulty,
            theme: theme.trim() || 'free form',
            generation_model: useGrok ? 'grok' : 'gpt-4',
            user_id: user.id
          })
          .select()
          .single();

        if (storyError) throw storyError;
        storyId = storyData.id;
        storyTitle = title.trim();
      }

      // Generate a cover image if requested
      if (generateCover) {
        setProgress('Generating cover image...');
        try {
          const coverUrl = await generateBookCover({
            theme: theme.trim() || 'fantasy story',
            title: storyTitle,
            storyId,
          });

          // Update the story with the cover URL
          await supabase
            .from('stories')
            .update({ cover_image_url: coverUrl })
            .eq('id', storyId);
        } catch (coverError) {
          console.error('Error generating cover:', coverError);
          // Continue without stopping the whole process
        }
      }

      // Generate and insert pages one by one
      let previousPages: string[] = [];
      for (let pageNumber = 1; pageNumber <= 4; pageNumber++) {
        setProgress(`Generating page ${pageNumber} of 4...`);
        
        const result = await generateStoryContent({
          language,
          theme: theme.trim() || 'free form',
          targetWords,
          difficulty,
          pageNumber,
          previousPages,
          storyId,
          userId: user.id,
        });

        // Update previous pages for context
        previousPages.push(result.content);
      }

      // Reset form and navigate to the story
      setTitle('');
      setTheme('');
      setTargetWords([]);
      setLanguage(SUPPORTED_LANGUAGES[0].value);
      setDifficulty(DIFFICULTY_LEVELS[0].value);
      // navigate to the story
      navigation.navigate('StoryReader', { storyId, pageNumber: 1 });
    } catch (error: any) {
      console.error('Full error object:', error);
      Alert.alert(
        'Error',
        `Failed to create story: ${error.message || 'Unknown error'}\n\nPlease check console for details.`
      );
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.headerText}>Create New Story</Text>
          
          <View style={styles.modelSelector}>
            <View style={styles.switchContainer}>
              <Text>Allow inappropriate language</Text>
              <Switch
                value={useGrok}
                onValueChange={handleModelToggle}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={useGrok ? '#2196F3' : '#f4f3f4'}
              />
            </View>
          </View>

          <Text style={styles.label}>Story Title (Optional)</Text>
          <Input
            placeholder="Leave blank for auto-generated title"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Language</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={language}
              onValueChange={setLanguage}
              style={styles.picker}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <Picker.Item
                  key={lang.value}
                  label={lang.label}
                  value={lang.value}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Difficulty Level (CEFR)</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={difficulty}
              onValueChange={setDifficulty}
              style={styles.picker}
            >
              {DIFFICULTY_LEVELS.map((level) => (
                <Picker.Item
                  key={level.value}
                  label={level.label}
                  value={level.value}
                />
              ))}
            </Picker>
          </View>
          <Text style={styles.difficultyDescription}>
            {DIFFICULTY_LEVELS.find(level => level.value === difficulty)?.description}
          </Text>

          <Text style={styles.label}>Theme (Optional)</Text>
          <Input
            placeholder="Enter story theme (e.g., Adventure, Mystery) or leave blank for free form"
            value={theme}
            onChangeText={setTheme}
          />

          <Text style={styles.label}>Target Words</Text>
          <View style={styles.targetWordsInput}>
            <Input
              placeholder="Add target words"
              value={targetWord}
              onChangeText={setTargetWord}
              onSubmitEditing={addTargetWord}
              returnKeyType="done"
              containerStyle={styles.targetWordInput}
            />
            <Button
              title="Add"
              onPress={addTargetWord}
              disabled={!targetWord.trim()}
            />
          </View>

          <View style={styles.targetWordsList}>
            {targetWords.map((word) => (
              <Chip
                key={word}
                title={word}
                onPress={() => removeTargetWord(word)}
                containerStyle={styles.chip}
              />
            ))}
          </View>

          <View style={styles.coverSwitchContainer}>
            <View style={styles.coverSwitchLabelContainer}>
              <Text style={styles.coverSwitchLabel}>Generate cover image</Text>
              <View style={styles.coinCostContainer}>
                <Text style={styles.coinCostText}>{FUNCTION_COSTS.GENERATE_COVER}</Text>
                <Icon name="monetization-on" size={16} color="#FFD700" style={styles.coinIcon} />
              </View>
            </View>
            <Switch
              value={generateCover}
              onValueChange={setGenerateCover}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={generateCover ? '#2196F3' : '#f4f3f4'}
            />
          </View>

          {loading && (
            <View style={styles.progressContainer}>
              <ActivityIndicator size="small" />
              <Text style={styles.progressText}>{progress}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleCreateStory}
            style={styles.createButton}
            disabled={loading}
          >
            <Text style={styles.createButtonText}>
              {loading ? 'Creating Story...' : 'Create Story'}
            </Text>
            <Text style={styles.createButtonPrice}>
              {FUNCTION_COSTS.GENERATE_STORY + (generateCover ? FUNCTION_COSTS.GENERATE_COVER : 0)}
            </Text>
            <Icon name="monetization-on" size={16} color="#FFD700" style={styles.createButtonIcon} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginLeft: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#86939e',
    borderRadius: 4,
    marginBottom: 8,
    marginHorizontal: 10,
  },
  picker: {
    height: 50,
  },
  difficultyDescription: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 10,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  targetWordsInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetWordInput: {
    flex: 1,
  },
  targetWordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    marginBottom: 20,
  },
  chip: {
    margin: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  progressText: {
    marginLeft: 10,
    color: '#666',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066cc',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  createButtonPrice: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  createButtonIcon: {
    marginLeft: -4,
  },
  modelSelector: {
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 8,
    marginLeft: 10,
    gap: 8,
  },
  coverSwitchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginVertical: 15,
  },
  coverSwitchLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coverSwitchLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  coinCostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinCostText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  coinIcon: {
    marginLeft: -4,
  },
}); 