import React from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Text } from '@rneui/themed';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '@/constants/colors';

export interface Definition {
  partOfSpeech: string;
  definitions: string[];
  examples: string[];
}

interface DictionaryProps {
  word: string;
  language: string;
  isVisible: boolean;
  onClose: () => void;
  definitions: Definition[] | null;
  isLoading: boolean;
}

export default function Dictionary({
  word,
  language,
  isVisible,
  onClose,
  definitions,
  isLoading,
}: DictionaryProps) {
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
              <Text style={styles.languageText}>({language})</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0066cc" />
              <Text style={styles.loadingText}>Loading definition...</Text>
            </View>
          ) : definitions && definitions.length > 0 ? (
            <ScrollView style={styles.definitionsContainer}>
              {definitions.map((def, index) => (
                <View key={index} style={styles.definitionGroup}>
                  {def.partOfSpeech !== 'error' && (
                    <Text style={styles.partOfSpeech}>{def.partOfSpeech}</Text>
                  )}
                  {def.definitions.map((definition, defIndex) => (
                    <View key={defIndex} style={styles.definition}>
                      {def.partOfSpeech !== 'error' && (
                        <Text style={styles.definitionNumber}>{defIndex + 1}.</Text>
                      )}
                      <Text style={styles.definitionText}>{definition}</Text>
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
}); 