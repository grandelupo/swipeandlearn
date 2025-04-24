import React from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '100%',
    maxHeight: '80%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  word: {
    flex: 1,
    marginRight: 16,
  },
  languageText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
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
    color: '#0066cc',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  definition: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingRight: 16,
  },
  definitionNumber: {
    width: 24,
    color: '#666',
  },
  definitionText: {
    flex: 1,
  },
  examples: {
    marginTop: 8,
    paddingLeft: 24,
  },
  example: {
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  noDefinitions: {
    padding: 20,
    alignItems: 'center',
  },
}); 