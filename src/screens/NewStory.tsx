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
  NativeModules,
} from 'react-native';
import { Input, Button, Text, Chip } from '@rneui/themed';
import { Icon } from '@rneui/base';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';
import { supabase } from '@/services/supabase';
import { generateStoryContent, generateBookCover, generateFullStory } from '@/services/edgeFunctions';
import { useCoins as useCoinContext } from '../contexts/CoinContext';
import { FUNCTION_COSTS } from '@/services/revenuecat';
import { COLORS } from '@/constants/colors';
import Modal from 'react-native-modal';
import TutorialOverlay from '@/components/TutorialOverlay';
import AnimatedBackground from '@/components/AnimatedBackground';
import { t } from '@/i18n/translations';
import CoinCounter, { CoinCounterRef } from '@/components/CoinCounter';

type NewStoryScreenNavigationProp = NativeStackNavigationProp<MainStackParamList>;

type Difficulty = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Divine';

const SUPPORTED_LANGUAGES = [
  { label: t('english'), value: 'English' },
  { label: t('spanish'), value: 'Spanish' },
  { label: t('french'), value: 'French' },
  { label: t('german'), value: 'German' },
  { label: t('italian'), value: 'Italian' },
  { label: t('portuguese'), value: 'Portuguese' },
  { label: t('chinese'), value: 'Chinese' },
  { label: t('japanese'), value: 'Japanese' },
  { label: t('korean'), value: 'Korean' },
  { label: t('russian'), value: 'Russian' },
  { label: t('arabic'), value: 'Arabic' },
  { label: t('polish'), value: 'Polish' },
];

const DIFFICULTY_LEVELS: Array<{ label: string; value: Difficulty; description: string }> = [
  { 
    label: `A1 - ${t('beginner')}`,
    value: 'A1',
    description: t('beginnerDesc')
  },
  { 
    label: `A2 - ${t('elementary')}`,
    value: 'A2',
    description: t('elementaryDesc')
  },
  { 
    label: `B1 - ${t('intermediate')}`,
    value: 'B1',
    description: t('intermediateDesc')
  },
  { 
    label: `B2 - ${t('upperIntermediate')}`,
    value: 'B2',
    description: t('upperIntermediateDesc')
  },
  { 
    label: `C1 - ${t('advanced')}`,
    value: 'C1',
    description: t('advancedDesc')
  },
  { 
    label: `C2 - ${t('mastery')}`,
    value: 'C2',
    description: t('masteryDesc')
  },
  {
    label: t('divine'),
    value: 'Divine',
    description: t('divineDesc')
  }
];

const TARGET_WORD_PACKAGES = [
  {
    id: 'administration',
    name: t('administrationPackage'),
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

interface NewStoryScreenProps extends NativeStackScreenProps<MainStackParamList, 'NewStory'> {
  coinCounterRef: React.RefObject<CoinCounterRef>;
}

export default function NewStoryScreen({ coinCounterRef }: NewStoryScreenProps) {
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
    const additionalCost = generateCover ? FUNCTION_COSTS.GENERATE_COVER : 0;
    const hasEnoughCoins = await useCoins('GENERATE_STORY', additionalCost);
    
    if (!hasEnoughCoins) {
      showInsufficientCoinsAlert('GENERATE_STORY', () => {
        coinCounterRef.current?.openModal();
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      setProgress(t('generatingStory'));

      console.log('Generate cover:', generateCover);
      
      const result = await generateFullStory({
        language,
        theme: theme.trim() || 'free form',
        targetWords,
        difficulty,
        title: title.trim(),
        userId: user.id,
        generateCover
      });

      setTitle('');
      setTheme('');
      setTargetWords([]);
      navigation.navigate('StoryReader', { storyId: result.storyId, pageNumber: 1 });
    } catch (error: any) {
      console.error('Full error object:', error);
      Alert.alert(
        t('errorCreatingStory'),
        `${t('errorUnknown')}: ${error.message || t('errorCheckConsole')}`
      );
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const newStoryTutorialSteps = [
    {
      id: 'target_words',
      message: t('newStoryTutorialTargetWords'),
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
        <Text style={styles.headerText}>{t('createNewStory')}</Text>
        <View style={styles.formBox}>
          <View style={styles.modelSelector}>
            <View style={styles.switchContainer}>
              <Text>{t('allowInappropriateLanguage')}</Text>
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
              placeholder={t('storyTitlePlaceholder')}
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
              placeholder={t('storyThemePlaceholder')}
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
              <Text style={styles.addTargetWordsButtonText}>{t('addTargetWords')}</Text>
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
              <Text style={styles.coverSwitchLabel}>{t('generateCoverImage')}</Text>
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
              {loading ? t('creatingStory') : t('createStory')}
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
          <Text style={styles.targetWordModalTitle}>{t('addTargetWords')}</Text>
          
          <View style={styles.packageSelector}>
            <Text style={styles.packageSelectorTitle}>{t('chooseWordPackage')}</Text>
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
                ]}>{t('customWords')}</Text>
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
                placeholder={t('enterWord')}
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
            <Text style={styles.targetWordModalDoneText}>{t('done')}</Text>
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