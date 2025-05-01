import React, { useState, useRef, useEffect } from 'react';
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
  Text as RNText,
} from 'react-native';
import { Input, Button, Text, Chip } from '@rneui/themed';
import { Icon } from '@rneui/base';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';
import { supabase } from '@/services/supabase';
import { generateStoryContent, generateBookCover } from '@/services/edgeFunctions';
import { useCoins as useCoinContext } from '../contexts/CoinContext';
import { FUNCTION_COSTS } from '@/services/revenuecat';
import { COLORS } from '@/constants/colors';
import Modal from 'react-native-modal';
import TutorialOverlay from '@/components/TutorialOverlay';
import AnimatedBackground from '@/components/AnimatedBackground';

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

const TARGET_WORD_PACKAGES = [
  {
    id: 'administration',
    name: 'Administration & Taxes',
    words: [
      'invoice', 'audit', 'taxation', 'deadline', 'budget',
      'compliance', 'regulation', 'payroll', 'revenue', 'expenditure',
      'fiscal', 'bureaucracy', 'documentation', 'protocol', 'amendment',
      'deduction', 'assessment', 'liability', 'exemption', 'declaration',
      'withholding', 'reconciliation', 'disbursement', 'procurement', 'allocation'
    ]
  },
  {
    id: 'medicine',
    name: 'Medicine & Healthcare',
    words: [
      'diagnosis', 'treatment', 'prescription', 'symptoms', 'prognosis',
      'antibiotics', 'vaccination', 'immunity', 'infection', 'surgery',
      'anesthesia', 'recovery', 'therapy', 'medication', 'consultation',
      'pathology', 'oncology', 'cardiology', 'neurology', 'pediatrics',
      'radiology', 'orthopedics', 'immunology', 'endocrinology', 'physiology',
      'anatomy', 'biopsy', 'remission', 'rehabilitation', 'epidemiology'
    ]
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    words: [
      'reaction', 'molecule', 'compound', 'solution', 'catalyst',
      'element', 'acid', 'base', 'oxidation', 'reduction',
      'precipitation', 'titration', 'solvent', 'isotope', 'equilibrium',
      'polymer', 'electron', 'proton', 'neutron', 'valence',
      'hydrolysis', 'synthesis', 'distillation', 'crystallization', 'sublimation',
      'entropy', 'molarity', 'concentration', 'stoichiometry', 'spectroscopy'
    ]
  },
  {
    id: 'business',
    name: 'Business & Finance',
    words: [
      'investment', 'portfolio', 'dividend', 'equity', 'assets',
      'liability', 'merger', 'acquisition', 'stakeholder', 'profit',
      'revenue', 'margin', 'strategy', 'marketing', 'operations',
      'depreciation', 'amortization', 'liquidity', 'solvency', 'collateral',
      'diversification', 'valuation', 'leverage', 'capitalization', 'derivatives',
      'hedge', 'arbitrage', 'volatility', 'benchmark', 'yield'
    ]
  },
  {
    id: 'technology',
    name: 'Technology & IT',
    words: [
      'algorithm', 'database', 'encryption', 'interface', 'protocol',
      'bandwidth', 'server', 'network', 'software', 'hardware',
      'cloud', 'security', 'backup', 'deployment', 'integration',
      'virtualization', 'middleware', 'framework', 'repository', 'authentication',
      'microservices', 'scalability', 'containerization', 'orchestration', 'latency',
      'throughput', 'redundancy', 'optimization', 'debugging', 'refactoring'
    ]
  },
  {
    id: 'law',
    name: 'Law & Legal',
    words: [
      'jurisdiction', 'litigation', 'statute', 'precedent', 'testimony',
      'deposition', 'plaintiff', 'defendant', 'verdict', 'injunction',
      'subpoena', 'affidavit', 'arbitration', 'mediation', 'prosecution',
      'indictment', 'tort', 'negligence', 'liability', 'contract',
      'covenant', 'stipulation', 'damages', 'settlement', 'appeal',
      'jurisprudence', 'legislation', 'regulation', 'compliance', 'enforcement'
    ]
  },
  {
    id: 'engineering',
    name: 'Engineering',
    words: [
      'mechanics', 'dynamics', 'statics', 'thermodynamics', 'kinematics',
      'stress', 'strain', 'torque', 'friction', 'momentum',
      'velocity', 'acceleration', 'force', 'pressure', 'elasticity',
      'conductivity', 'resistance', 'inductance', 'capacitance', 'resonance',
      'amplitude', 'frequency', 'wavelength', 'voltage', 'current',
      'efficiency', 'tolerance', 'calibration', 'optimization', 'simulation'
    ]
  },
  {
    id: 'psychology',
    name: 'Psychology',
    words: [
      'behavior', 'perception', 'emotion', 'motivation',
      'personality', 'consciousness', 'anxiety', 'depression', 'therapy',
      'trauma', 'resilience', 'attachment', 'development', 'conditioning',
      'reinforcement', 'stimulus', 'response', 'memory', 'learning',
      'neurotransmitter', 'psychotherapy', 'diagnosis', 'assessment', 'intervention',
      'mindfulness', 'empathy', 'attribution', 'cognition', 'schema'
    ]
  },
  {
    id: 'economics',
    name: 'Economics',
    words: [
      'supply', 'demand', 'inflation', 'deflation', 'recession',
      'GDP', 'monetary', 'fiscal', 'equilibrium', 'elasticity',
      'microeconomics', 'macroeconomics', 'scarcity', 'utility', 'externality',
      'competition', 'monopoly', 'oligopoly', 'subsidy', 'tariff',
      'exchange', 'interest', 'depreciation', 'appreciation', 'commodity',
      'liquidity', 'productivity', 'consumption', 'investment', 'trade'
    ]
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
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const navigation = useNavigation<NewStoryScreenNavigationProp>();
  const { useCoins, showInsufficientCoinsAlert } = useCoinContext();
  const [targetWordModalVisible, setTargetWordModalVisible] = useState(false);
  const [newTargetWordInput, setNewTargetWordInput] = useState('');

  // Remove circle refs and animations
  const addStoryButtonRef = useRef<View>(null);

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

  const addTargetWordModal = () => {
    if (newTargetWordInput.trim() && !targetWords.includes(newTargetWordInput.trim())) {
      setTargetWords([...targetWords, newTargetWordInput.trim()]);
      setNewTargetWordInput('');
    }
  };

  const removeTargetWordModal = (word: string) => {
    setTargetWords(targetWords.filter(w => w !== word));
  };

  const handlePackageSelect = (packageId: string) => {
    const wordPackage = TARGET_WORD_PACKAGES.find(p => p.id === packageId);
    if (wordPackage) {
      setTargetWords(wordPackage.words);
      setSelectedPackage(packageId);
    }
  };

  const clearPackageSelection = () => {
    setSelectedPackage(null);
    setTargetWords([]);
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

  const newStoryTutorialSteps = [
    {
      id: 'target_words',
      message: 'Click on "Add Target Words" to add words that will be used in the story.',
      targetRef: addStoryButtonRef,
    },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.outerContainer}
    >
      <AnimatedBackground />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
        <Text style={styles.headerText}>Create New Story</Text>
        <View style={styles.formBox}>
          <View style={styles.modelSelector}>
            <View style={styles.switchContainer}>
              <Text>Allow inappropriate language</Text>
              <Switch
                value={useGrok}
                onValueChange={handleModelToggle}
                trackColor={{ false: COLORS.brighter, true: COLORS.accent }}
                thumbColor={useGrok ? COLORS.accent : COLORS.card }
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <Input
              inputContainerStyle={styles.inputContainer}
              inputStyle={styles.input}
              containerStyle={styles.inputFlex}
              placeholder="Story title (optional)"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={COLORS.accent}
            />
          </View>

          <View style={styles.inputRow}>
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
          </View>

          <View style={styles.inputRow}>
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
          </View>
          <Text style={styles.difficultyDescription}>
            {DIFFICULTY_LEVELS.find(level => level.value === difficulty)?.description}
          </Text>

          <View style={styles.inputRow}>
            <Input
              inputContainerStyle={styles.inputContainer}
              inputStyle={styles.input}
              containerStyle={styles.inputFlex}
              placeholder="Story theme (optional, e.g. Adventure, Mystery)"
              value={theme}
              onChangeText={setTheme}
              placeholderTextColor={COLORS.accent}
            />
          </View>

          <View style={styles.inputRow}>
            <TouchableOpacity 
              ref={addStoryButtonRef}
              style={styles.addTargetWordsButton} 
              onPress={() => setTargetWordModalVisible(true)}
            >
              <Text style={styles.addTargetWordsButtonText}>Add Target Words</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.targetWordsList}>
            {targetWords.map((word) => (
              <Chip
                key={word}
                title={word}
                onPress={() => removeTargetWordModal(word)}
                containerStyle={styles.chip}
                buttonStyle={{ backgroundColor: COLORS.bright }}
                titleStyle={{ color: COLORS.primary, fontFamily: 'Poppins-SemiBold' }}
                icon={{ name: 'close', type: 'ionicon', color: COLORS.primary, size: 16 }}
                iconRight
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
              trackColor={{ false: COLORS.brighter, true: COLORS.accent }}
              thumbColor={generateCover ? COLORS.accent : COLORS.card }
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
            <View style={styles.coinCostContainer}>
              <Text style={styles.coinCostTextButton}>
                {generateCover ? FUNCTION_COSTS.GENERATE_STORY + FUNCTION_COSTS.GENERATE_COVER : FUNCTION_COSTS.GENERATE_STORY}
              </Text>
              <Icon name="monetization-on" size={16} color={COLORS.card} style={styles.coinIcon} />
            </View>
            <Icon name="arrow-forward" type="ionicon" color={COLORS.card} size={24} containerStyle={styles.arrowIcon} />
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal
        isVisible={targetWordModalVisible}
        onBackdropPress={() => setTargetWordModalVisible(false)}
        style={styles.targetWordModal}
        backdropColor={COLORS.background}
        backdropOpacity={0.7}
      >
        <View style={styles.targetWordModalBox}>
          <Text style={styles.targetWordModalTitle}>Add Target Words</Text>
          
          <View style={styles.packageSelector}>
            <Text style={styles.packageSelectorTitle}>Choose a Word Package:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.packageScrollView}>
              <TouchableOpacity
                style={[
                  styles.packageChip,
                  selectedPackage === null && styles.packageChipSelected
                ]}
                onPress={clearPackageSelection}
              >
                <Text style={[
                  styles.packageChipText,
                  selectedPackage === null && styles.packageChipTextSelected
                ]}>Custom Words</Text>
              </TouchableOpacity>
              {TARGET_WORD_PACKAGES.map((pkg) => (
                <TouchableOpacity
                  key={pkg.id}
                  style={[
                    styles.packageChip,
                    selectedPackage === pkg.id && styles.packageChipSelected
                  ]}
                  onPress={() => handlePackageSelect(pkg.id)}
                >
                  <Text style={[
                    styles.packageChipText,
                    selectedPackage === pkg.id && styles.packageChipTextSelected
                  ]}>{pkg.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {selectedPackage === null && (
            <View style={styles.targetWordModalInputRow}>
              <Input
                inputContainerStyle={styles.inputContainer}
                inputStyle={styles.input}
                containerStyle={styles.inputFlex}
                placeholder="Enter a word"
                value={newTargetWordInput}
                onChangeText={setNewTargetWordInput}
                placeholderTextColor={COLORS.accent}
                onSubmitEditing={addTargetWordModal}
                returnKeyType="done"
              />
              <TouchableOpacity 
                style={styles.targetWordModalAddButton} 
                onPress={addTargetWordModal} 
                disabled={!newTargetWordInput.trim()}
              >
                <Icon name="add" type="ionicon" color={COLORS.card} size={24} containerStyle={{ backgroundColor: COLORS.accent, borderRadius: 16, padding: 6 }} />
              </TouchableOpacity>
            </View>
          )}

          <ScrollView style={styles.targetWordsScrollView}>
            <View style={styles.targetWordsList}>
              {targetWords.map((word) => (
                <Chip
                  key={word}
                  title={word}
                  onPress={() => selectedPackage === null && removeTargetWordModal(word)}
                  containerStyle={styles.chip}
                  buttonStyle={{ backgroundColor: COLORS.bright }}
                  titleStyle={{ color: COLORS.primary, fontFamily: 'Poppins-SemiBold' }}
                  icon={selectedPackage === null ? { name: 'close', type: 'ionicon', color: COLORS.primary, size: 16 } : undefined}
                  iconRight
                />
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.targetWordModalDoneButton} onPress={() => setTargetWordModalVisible(false)}>
            <Text style={styles.targetWordModalDoneText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <TutorialOverlay
        screenName="new_story"
        steps={newStoryTutorialSteps}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    zIndex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    backgroundColor: 'transparent',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: 'Poppins-Bold',
    marginBottom: 24,
  },
  formBox: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 24,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    width: 80,
    marginRight: 8,
    marginBottom: 0,
  },
  inputFlex: {
    flex: 1,
    marginLeft: 0,
    marginRight: 0,
    paddingRight: 0,
    paddingLeft: 0,
  },
  inputContainer: {
    borderBottomWidth: 2,
    borderColor: COLORS.accent,
    backgroundColor: 'transparent',
    marginBottom: -8,
  },
  input: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
    fontFamily: 'Poppins-Regular',
    paddingLeft: 0,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 8,
    marginHorizontal: 10,
    width: '90%',
    borderColor: COLORS.accent
  },
  picker: {
    height: 50,
  },
  difficultyDescription: {
    fontSize: 14,
    color: COLORS.bright,
    marginHorizontal: 10,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  targetWordsInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetWordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 4,
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
    alignSelf: 'flex-end',
    marginTop: 24,
    backgroundColor: COLORS.accent,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 24,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.card,
    fontFamily: 'Poppins-Bold',
    marginRight: 12,
  },
  arrowIcon: {
    backgroundColor: 'transparent',
    borderRadius: 24,
    padding: 0,
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
  coinCostTextButton: {
    color: COLORS.card,
    fontSize: 16,
    fontWeight: 'bold',
  },
  coinIcon: {
    marginLeft: -4,
  },
  addTargetWordsButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTargetWordsButtonText: {
    color: COLORS.card,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
  },
  targetWordModal: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  targetWordModalBox: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
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
  targetWordModalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  targetWordsScrollView: {
    maxHeight: '60%',
    marginBottom: 16,
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
  packageSelector: {
    marginBottom: 20,
  },
  packageSelectorTitle: {
    fontSize: 16,
    color: COLORS.primary,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 12,
    marginLeft: 4,
  },
  packageScrollView: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  packageChip: {
    backgroundColor: COLORS.bright,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  packageChipSelected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  packageChipText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.primary,
  },
  packageChipTextSelected: {
    color: COLORS.card,
  },
}); 