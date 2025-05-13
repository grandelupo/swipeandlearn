import React, { useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text } from '@rneui/themed';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { supabase } from '@/services/supabase';
import { COLORS } from '@/constants/colors';
import { useFeedbackButton } from '@/contexts/FeedbackButtonContext';
import { t } from '@/i18n/translations';

interface FeedbackButtonProps {
  isEnabled?: boolean;
}

export default function FeedbackButton({ isEnabled = true }: FeedbackButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { feedbackButtonRef } = useFeedbackButton();

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      Alert.alert(t('error'), t('enterFeedback'));
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: user?.id || null,
          content: feedback.trim(),
          created_at: new Date().toISOString(),
        });

      if (error) throw error;

      Alert.alert(t('success'), t('feedbackSuccess'));
      setFeedback('');
      setIsVisible(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert(t('error'), t('feedbackError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isEnabled) return null;

  return (
    <>
      <TouchableOpacity
        ref={feedbackButtonRef}
        style={styles.button}
        onPressIn={() => setIsVisible(true)}
      >
        <Icon name="feedback" size={24} color={COLORS.accent} />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('sendFeedback')}</Text>
              <TouchableOpacity onPress={() => setIsVisible(false)}>
                <Icon name="close" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              {t('feedbackDescription')}
            </Text>

            <TextInput
              style={styles.input}
              multiline
              numberOfLines={6}
              placeholder={t('feedbackPlaceholder')}
              value={feedback}
              onChangeText={setFeedback}
              placeholderTextColor={COLORS.primary}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? t('submitting') : t('submitFeedback')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: 'Poppins-Bold',
  },
  modalDescription: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 16,
    fontFamily: 'Poppins-Regular',
  },
  input: {
    backgroundColor: COLORS.brighter,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.primary,
    fontFamily: 'Poppins-Regular',
    marginBottom: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  submitButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: COLORS.card,
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
}); 