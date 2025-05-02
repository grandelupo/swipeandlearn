import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Text, Button } from '@rneui/themed';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DictionaryType, getAvailableDictionaryTypes } from '@/services/dictionary';
import { Picker } from '@react-native-picker/picker';
import { t } from '@/i18n/translations';

export interface Definition {
  partOfSpeech: string;
  definitions: Array<{
    text: string;
    example?: string;
  }>;
  examples?: string[]; // Keep this for backward compatibility
  relatedWord?: string;
}

interface DictionaryProps {
  word: string;
  language: string;
  isVisible: boolean;
  onClose: () => void;
  definitions: Definition[] | null;
  isLoading: boolean;
  onDictionaryTypeChange?: (type: DictionaryType) => void;
}

export default function Dictionary({
  word,
  language,
  isVisible,
  onClose,
  definitions,
  isLoading,
  onDictionaryTypeChange,
}: DictionaryProps) {
  const [selectedDictionaryType, setSelectedDictionaryType] = useState<DictionaryType>('defaultDictionary');
  const availableDictionaries = getAvailableDictionaryTypes(language);

  useEffect(() => {
    // Load the last used dictionary type from storage
    const loadSavedDictionaryType = async () => {
      try {
        const savedType = await AsyncStorage.getItem(`dictionary_type_${language}`);
        if (savedType && availableDictionaries.includes(savedType as DictionaryType)) {
          setSelectedDictionaryType(savedType as DictionaryType);
          onDictionaryTypeChange?.(savedType as DictionaryType);
        }
      } catch (error) {
        console.error('Error loading dictionary type:', error);
      }
    };

    loadSavedDictionaryType();
  }, [language]);

  const handleDictionaryTypeChange = async (type: DictionaryType) => {
    setSelectedDictionaryType(type);
    try {
      await AsyncStorage.setItem(`dictionary_type_${language}`, type);
      onDictionaryTypeChange?.(type);
    } catch (error) {
      console.error('Error saving dictionary type:', error);
    }
  };

  // Group definitions by relatedWord
  const groupedDefinitions = React.useMemo(() => {
    if (!definitions) return null;
    
    const groups: Record<string, Definition[]> = {};
    
    definitions.forEach(def => {
      const key = def.relatedWord || word;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(def);
    });
    
    return Object.entries(groups);
  }, [definitions, word]);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.word}>
              <Text h4>{word}</Text>
              <Text style={styles.languageText}>({t(language)})</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {availableDictionaries.length > 1 && (
            <View style={styles.dictionarySelector}>
              <Text style={styles.selectorLabel}>{t('dictionary')}:</Text>
              <Picker
                selectedValue={selectedDictionaryType}
                onValueChange={handleDictionaryTypeChange}
                style={styles.picker}
              >
                {availableDictionaries.map((type) => (
                  <Picker.Item
                    key={type}
                    label={t(type)}
                    value={type}
                  />
                ))}
              </Picker>
            </View>
          )}

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.accent} />
              <Text style={styles.loadingText}>Loading definition...</Text>
            </View>
          ) : groupedDefinitions ? (
            <ScrollView style={styles.definitionsContainer}>
              {groupedDefinitions.map(([relatedWord, defs], groupIndex) => (
                <View key={groupIndex} style={styles.wordGroup}>
                  {relatedWord !== word && (
                    <Text style={styles.relatedWordHeader}>{relatedWord}</Text>
                  )}
                  
                  {defs.map((def, index) => (
                    <View key={index} style={styles.definitionGroup}>
                      {def.partOfSpeech !== 'error' && (
                        <Text style={styles.partOfSpeech}>{def.partOfSpeech}</Text>
                      )}
                      {def.definitions.map((definition, defIndex) => (
                        <View key={defIndex} style={styles.definition}>
                          {def.partOfSpeech !== 'error' && (
                            <Text style={styles.definitionNumber}>{defIndex + 1}.</Text>
                          )}
                          <View style={styles.definitionContent}>
                            <Text style={styles.definitionText}>{definition.text}</Text>
                            {definition.example && (
                              <Text style={styles.definitionExample}>"{definition.example}"</Text>
                            )}
                          </View>
                        </View>
                      ))}
                      {def.examples && def.examples.length > 0 && (
                        <View style={styles.examples}>
                          {def.examples.map((example, exIndex) => (
                            <Text key={exIndex} style={styles.example}>
                              "{example}"
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.noDefinitions}>
              <Text>No definitions found.</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    width: '92%',
    maxHeight: '80%',
    padding: 28,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  word: {
    flex: 1,
    marginRight: 16,
  },
  languageText: {
    fontSize: 14,
    color: COLORS.accent,
    marginTop: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  closeButton: {
    padding: 6,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  dictionarySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
    backgroundColor: COLORS.bright,
    borderRadius: 12,
  },
  selectorLabel: {
    marginRight: 8,
    color: COLORS.primary,
    fontFamily: 'Poppins-SemiBold',
  },
  picker: {
    flex: 1,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: COLORS.primary,
    fontFamily: 'Poppins-Regular',
  },
  definitionsContainer: {
    maxHeight: '90%',
  },
  wordGroup: {
    marginBottom: 24,
  },
  relatedWordHeader: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: COLORS.primary,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.accent + '40',
  },
  definitionGroup: {
    marginBottom: 20,
  },
  partOfSpeech: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginBottom: 8,
    fontStyle: 'italic',
    fontFamily: 'Poppins-Bold',
  },
  definition: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingRight: 16,
  },
  definitionNumber: {
    width: 24,
    color: COLORS.primary,
    fontFamily: 'Poppins-SemiBold',
  },
  definitionText: {
    flex: 1,
    color: COLORS.primary,
    fontFamily: 'Poppins-Regular',
  },
  examples: {
    marginTop: 8,
    paddingLeft: 24,
  },
  example: {
    color: COLORS.primary,
    fontStyle: 'italic',
    marginBottom: 4,
    fontFamily: 'Poppins-Regular',
    opacity: 0.7,
  },
  noDefinitions: {
    padding: 20,
    alignItems: 'center',
  },
  definitionContent: {
    flex: 1,
  },
  definitionExample: {
    color: COLORS.accent,
    fontStyle: 'italic',
    marginTop: 4,
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    opacity: 0.8,
  },
}); 