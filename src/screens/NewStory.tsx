import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Input, Button, Text, Chip } from 'react-native-elements';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '@/services/supabase';
import { generateStoryPage, generateStoryTitle } from '@/services/ai';

type Difficulty = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

const SUPPORTED_LANGUAGES = [
  { label: 'English', value: 'English' },
  { label: 'Spanish', value: 'Spanish' },
  { label: 'French', value: 'French' },
  { label: 'German', value: 'German' },
  { label: 'Italian', value: 'Italian' },
  { label: 'Portuguese', value: 'Portuguese' },
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
  const navigation = useNavigation();

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
    setLoading(true);
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      setProgress('Generating title...');
      // Generate title if not provided
      let storyTitle = title.trim();
      if (!storyTitle) {
        storyTitle = await generateStoryTitle({
          language,
          theme: theme.trim() || 'free form',
          targetWords,
          difficulty,
        });
      }

      // Create story in database first
      const storyData = {
        title: storyTitle,
        language,
        total_pages: 0, // Let the trigger handle the counting
        user_id: user.id,
        theme: theme.trim() || null, // Store null if no theme provided
      };

      const { data: story, error: storyError } = await supabase
        .from('stories')
        .insert(storyData)
        .select()
        .single();

      if (storyError) throw storyError;

      // Generate and insert pages one by one
      let previousPages: string[] = [];
      for (let pageNumber = 1; pageNumber <= 4; pageNumber++) {
        setProgress(`Generating page ${pageNumber} of 4...`);
        
        const pageContent = await generateStoryPage(
          {
            language,
            theme: theme.trim() || 'free form',
            targetWords,
            difficulty,
          },
          pageNumber,
          previousPages
        );

        const pageData = {
          story_id: story.id,
          page_number: pageNumber,
          content: pageContent,
          target_words: targetWords,
        };

        const { error: pageError } = await supabase
          .from('story_pages')
          .insert(pageData);

        if (pageError) throw pageError;

        // Update previous pages for context
        previousPages.push(pageContent);
      }

      Alert.alert('Success', 'Story created successfully with 4 pages!');
      // Reset form and navigate back to Bookshelf
      setTitle('');
      setTheme('');
      setTargetWords([]);
      setLanguage(SUPPORTED_LANGUAGES[0].value);
      setDifficulty(DIFFICULTY_LEVELS[0].value);
      navigation.goBack();
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

          {loading && (
            <View style={styles.progressContainer}>
              <ActivityIndicator size="small" />
              <Text style={styles.progressText}>{progress}</Text>
            </View>
          )}

          <Button
            title={loading ? 'Creating Story...' : 'Create Story'}
            onPress={handleCreateStory}
            loading={loading}
            containerStyle={styles.createButton}
          />
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
    marginTop: 20,
  },
}); 