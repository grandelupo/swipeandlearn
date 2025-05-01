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
  const [dictionaryTypes, setDictionaryTypes] = useState<DictionaryType[]>([]);
  const [selectedType, setSelectedType] = useState<DictionaryType>('default');

  useEffect(() => {
    const loadDictionaryTypes = async () => {
      const types = await getAvailableDictionaryTypes(language);
      setDictionaryTypes(types);
    };
    loadDictionaryTypes();
  }, [language]);

  const handleTypeChange = (type: DictionaryType) => {
    setSelectedType(type);
    onDictionaryTypeChange?.(type);
  };

  const renderDefinitions = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      );
    }

    if (!definitions || definitions.length === 0) {
      return (
        <Text style={styles.noDefinitionsText}>{t('noDefinitionsFound')}</Text>
      );
    }

    return definitions.map((def, index) => (
      <View key={index} style={styles.definitionBlock}>
        <Text style={styles.partOfSpeech}>{def.partOfSpeech}</Text>
        {def.definitions.map((d, i) => (
          <View key={i} style={styles.definition}>
            <Text style={styles.definitionText}>{d.text}</Text>
            {d.example && (
              <View style={styles.exampleContainer}>
                <Text style={styles.exampleLabel}>{t('examples')}:</Text>
                <Text style={styles.exampleText}>{d.example}</Text>
              </View>
            )}
          </View>
        ))}
        {def.relatedWord && (
          <View style={styles.relatedWordsContainer}>
            <Text style={styles.relatedWordsLabel}>{t('relatedWords')}:</Text>
            <Text style={styles.relatedWordsText}>{def.relatedWord}</Text>
          </View>
        )}
      </View>
    ));
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.word}>{word}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={COLORS.accent} />
            </TouchableOpacity>
          </View>

          <View style={styles.dictionaryTypeContainer}>
            <Picker
              selectedValue={selectedType}
              onValueChange={handleTypeChange}
              style={styles.dictionaryTypePicker}
            >
              <Picker.Item label={t('defaultDictionary')} value="default" />
              <Picker.Item label={t('learnerDictionary')} value="learner" />
              <Picker.Item label={t('thesaurus')} value="thesaurus" />
            </Picker>
          </View>

          <ScrollView style={styles.definitionsContainer}>
            {renderDefinitions()}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
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
  dictionaryTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
    backgroundColor: COLORS.bright,
    borderRadius: 12,
  },
  dictionaryTypePicker: {
    flex: 1,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noDefinitionsText: {
    padding: 20,
    alignItems: 'center',
  },
  definitionBlock: {
    marginBottom: 24,
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
  definitionText: {
    flex: 1,
    color: COLORS.primary,
    fontFamily: 'Poppins-Regular',
  },
  exampleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exampleLabel: {
    marginRight: 8,
    color: COLORS.primary,
    fontFamily: 'Poppins-SemiBold',
  },
  exampleText: {
    color: COLORS.primary,
    fontStyle: 'italic',
    marginBottom: 4,
    fontFamily: 'Poppins-Regular',
    opacity: 0.7,
  },
  relatedWordsContainer: {
    marginTop: 8,
    paddingLeft: 24,
  },
  relatedWordsLabel: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: COLORS.primary,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.accent + '40',
  },
  relatedWordsText: {
    color: COLORS.primary,
    fontFamily: 'Poppins-Regular',
  },
  definitionsContainer: {
    maxHeight: '90%',
  },
}); 