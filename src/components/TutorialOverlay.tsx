import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  Animated,
  Dimensions,
  findNodeHandle,
  UIManager,
  LayoutRectangle,
} from 'react-native';
import { Icon } from '@rneui/base';
import { COLORS } from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/services/supabase';
import { t } from '@/i18n/translations';

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

interface TutorialStep {
  id: string;
  message: string;
  targetRef?: React.RefObject<View>;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface TutorialOverlayProps {
  screenName: string;
  steps: TutorialStep[];
  onComplete?: () => void;
  onLanguageSelect?: (language: string) => void;
}

interface ElementMeasurements {
  x: number;
  y: number;
  width: number;
  height: number;
}

const { width, height } = Dimensions.get('window');

export default function TutorialOverlay({ 
  screenName, 
  steps, 
  onComplete,
  onLanguageSelect 
}: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [position] = useState(new Animated.ValueXY({ x: 0, y: 0 }));
  const [spotlightSize] = useState(new Animated.Value(0));
  const [arrowAnim] = useState(new Animated.Value(0));
  const [targetMeasurements, setTargetMeasurements] = useState<ElementMeasurements | null>(null);
  const [modalMeasurements, setModalMeasurements] = useState<ElementMeasurements | null>(null);
  const contentRef = useRef<View>(null);

  const currentStepData = steps[currentStep];

  useEffect(() => {
    checkTutorialStatus();
  }, []);

  useEffect(() => {
    if (isVisible && currentStepData?.targetRef?.current) {
      measureTargetElement(currentStepData.targetRef.current);
    }
  }, [currentStep, isVisible]);

  const checkTutorialStatus = async () => {
    try {
      const tutorialKey = `tutorial_${screenName}`;
      const hasSeenTutorial = await AsyncStorage.getItem(tutorialKey);
      if (!hasSeenTutorial) {
        setIsVisible(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      console.error('Error checking tutorial status:', error);
    }
  };

  const measureTargetElement = (element: View) => {
    const handle = findNodeHandle(element);
    if (!handle) return;

    // First measure the modal's position
    const modalHandle = findNodeHandle(contentRef.current);
    if (!modalHandle) return;

    UIManager.measure(modalHandle, (modalX0, modalY0, modalWidth, modalHeight, modalPageX, modalPageY) => {
      setModalMeasurements({
        x: modalPageX,
        y: modalPageY,
        width: modalWidth,
        height: modalHeight,
      });

      // Then measure the target element's position
      UIManager.measure(handle, (x0, y0, width, height, pageX, pageY) => {
        setTargetMeasurements({
          x: pageX,
          y: pageY,
          width,
          height,
        });
        
        // Calculate position relative to window instead of modal
        position.setValue({
          x: pageX + width / 2 - 100, // Center spotlight (200px width / 2)
          y: pageY + height / 2 - 100, // Center spotlight (200px height / 2)
        });
        
        // Start animations
        animateSpotlight();
        animateArrow();
      });
    });
  };

  const animateSpotlight = () => {
    Animated.sequence([
      Animated.timing(spotlightSize, {
        toValue: 0,
        duration: 0,
        useNativeDriver: false,
      }),
      Animated.timing(spotlightSize, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const animateArrow = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(arrowAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        const tutorialKey = `tutorial_${screenName}`;
        await AsyncStorage.setItem(tutorialKey, 'true');
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setIsVisible(false);
          onComplete?.();
        });
      } catch (error) {
        console.error('Error saving tutorial status:', error);
      }
    }
  };

  const handleLanguageSelect = async (language: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ preferred_translation_language: language })
        .eq('id', user.id);

      if (error) throw error;
      onLanguageSelect?.(language);
      handleNext();
    } catch (error) {
      console.error('Error updating translation language:', error);
    }
  };

  const handleSkip = async () => {
    try {
      const tutorialKey = `tutorial_${screenName}`;
      await AsyncStorage.setItem(tutorialKey, 'true');
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsVisible(false);
        onComplete?.();
      });
    } catch (error) {
      console.error('Error saving tutorial status:', error);
    }
  };

  const renderLanguageSelector = () => {
    return (
      <View style={styles.languageSelectorContainer}>
        <Text style={styles.languageSelectorTitle}>{t('selectLanguage')}</Text>
        <View style={styles.languageButtonsContainer}>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.value}
              style={styles.languageButton}
              onPress={() => {
                onLanguageSelect?.(lang.value);
                handleNext();
              }}
            >
              <Text style={styles.languageButtonText}>{lang.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderNavigationButtons = () => {
    return (
      <View style={styles.navigationButtons}>
        {currentStep < steps.length - 1 ? (
          <>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
            >
              <Text style={styles.skipButtonText}>{t('skip')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>{t('next')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.finishButton}
            onPress={handleNext}
          >
            <Text style={styles.finishButtonText}>{t('finish')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (!isVisible) return null;

  const isLastStep = currentStep === steps.length - 1;

  const spotlightStyle: Animated.WithAnimatedValue<any> = {
    position: 'absolute',
    width: spotlightSize.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 200],
    }),
    height: spotlightSize.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 200],
    }),
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: [
      { translateX: position.x },
      { translateY: position.y },
    ],
  };

  const arrowStyle: Animated.WithAnimatedValue<any> = {
    position: 'absolute',
    transform: [
      { translateX: targetMeasurements ? targetMeasurements.x + targetMeasurements.width / 2 - 15 : 0 }, // Center arrow (30px width / 2)
      { translateY: targetMeasurements ? targetMeasurements.y - 40 : 0 }, // Position above target
      { translateY: arrowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 20],
      })},
    ],
  };

  return (
    <Modal
      transparent
      visible={isVisible}
      onRequestClose={() => setIsVisible(false)}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        {targetMeasurements && (
          <>
            <Animated.View style={spotlightStyle} />
            <Animated.View style={arrowStyle}>
              <Icon
                name="arrow-down"
                type="font-awesome"
                color={COLORS.accent}
                size={30}
              />
            </Animated.View>
          </>
        )}
        <View 
          ref={contentRef}
          style={styles.content}
          collapsable={false}
        >
          <Text style={styles.message}>{currentStepData.message}</Text>
          
          {currentStepData.id === 'language_select' ? (
            
            renderLanguageSelector()
          ) : (
            renderNavigationButtons()
          )}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  content: {
    position: 'absolute',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    width: width * 0.8,
    maxWidth: 400,
    alignItems: 'center',
    left: '50%',
    top: '50%',
    transform: [
      { translateX: -(width * 0.8) / 2 },
      { translateY: -100 }, // Approximate half height of content
    ],
  },
  message: {
    fontSize: 16,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Poppins-Regular',
  },
  nextButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  nextButtonText: {
    color: COLORS.card,
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  languageSelectorContainer: {
    marginBottom: 20,
  },
  languageSelectorTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 10,
  },
  languageButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    maxHeight: height * 0.4,
  },
  languageButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 5,
    marginVertical: 5,
  },
  languageButtonText: {
    color: COLORS.card,
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  skipButtonText: {
    color: COLORS.accent,
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  finishButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  finishButtonText: {
    color: COLORS.card,
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
}); 