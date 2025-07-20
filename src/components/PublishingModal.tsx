import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import { Text, Button } from '@rneui/themed';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '@/constants/colors';
import { t } from '@/i18n/translations';
import { catalogService } from '@/services/catalog';
import { Story } from '@/types/story';
import { DeepLinkingService } from '@/services/deepLinking';

interface PublishingModalProps {
  isVisible: boolean;
  onClose: () => void;
  story: Story | null;
  onStoryPublished?: () => void;
  onStoryUnpublished?: () => void;
}

export default function PublishingModal({
  isVisible,
  onClose,
  story,
  onStoryPublished,
  onStoryUnpublished,
}: PublishingModalProps) {
  const [publishing, setPublishing] = useState(false);
  const [creatingShare, setCreatingShare] = useState(false);
  const [shareCode, setShareCode] = useState<string>('');
  const [showShareCode, setShowShareCode] = useState(false);

  const handlePublishToCatalog = async () => {
    if (!story) return;

    Alert.alert(
      t('publishStory'),
      t('publishConfirmation'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('publishStory'),
          onPress: async () => {
            try {
              setPublishing(true);
              await catalogService.publishStory(story.id);
              Alert.alert(t('success'), t('publishSuccess'));
              onStoryPublished?.();
              onClose();
            } catch (error) {
              console.error('Error publishing story:', error);
              Alert.alert(t('error'), t('errorPublishingStory'));
            } finally {
              setPublishing(false);
            }
          },
        },
      ]
    );
  };

  const handleUnpublishFromCatalog = async () => {
    if (!story) return;

    Alert.alert(
      t('unpublishStory'),
      t('unpublishConfirmation'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('unpublishStory'),
          onPress: async () => {
            try {
              setPublishing(true);
              await catalogService.unpublishStory(story.id);
              Alert.alert(t('success'), t('unpublishSuccess'));
              onStoryUnpublished?.();
              onClose();
            } catch (error) {
              console.error('Error unpublishing story:', error);
              Alert.alert(t('error'), t('errorUnpublishingStory'));
            } finally {
              setPublishing(false);
            }
          },
        },
      ]
    );
  };

  const handleCreateShareLink = async () => {
    if (!story) return;

    try {
      setCreatingShare(true);
      await DeepLinkingService.shareStory(story.id, story.title);
      // Don't show share code modal since we're using deep linking
      onClose();
    } catch (error) {
      console.error('Error creating share link:', error);
      Alert.alert(t('error'), t('errorCreatingShare'));
    } finally {
      setCreatingShare(false);
    }
  };

  const handleCopyShareCode = async () => {
    try {
      await Share.share({
        message: `Check out this story: ${shareCode}`,
        title: story?.title || 'Story',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleClose = () => {
    setShowShareCode(false);
    setShareCode('');
    onClose();
  };

  if (!story) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('publishStory')}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icon name="close" color={COLORS.primary} size={24} />
            </TouchableOpacity>
          </View>

          {!showShareCode ? (
            <>
              <Text style={styles.storyTitle}>{story.title}</Text>
              
              <View style={styles.optionContainer}>
                <View style={styles.optionHeader}>
                  <Icon name="public" color={COLORS.accent} size={24} />
                  <Text style={styles.optionTitle}>{t('publishToCatalog')}</Text>
                </View>
                <Text style={styles.optionDescription}>{t('publishDescription')}</Text>
                {story.is_published ? (
                  <Button
                    title={publishing ? t('loading') : t('unpublishStory')}
                    onPress={handleUnpublishFromCatalog}
                    disabled={publishing}
                    buttonStyle={styles.unpublishButton}
                    titleStyle={styles.unpublishButtonText}
                    loading={publishing}
                  />
                ) : (
                  <Button
                    title={publishing ? t('loading') : t('publishStory')}
                    onPress={handlePublishToCatalog}
                    disabled={publishing}
                    buttonStyle={styles.publishButton}
                    titleStyle={styles.publishButtonText}
                    loading={publishing}
                  />
                )}
              </View>

              <View style={styles.divider} />

              <View style={styles.optionContainer}>
                <View style={styles.optionHeader}>
                  <Icon name="share" color={COLORS.accent} size={24} />
                  <Text style={styles.optionTitle}>{t('createShareLink')}</Text>
                </View>
                <Text style={styles.optionDescription}>{t('shareCodeDescription')}</Text>
                <Button
                  title={creatingShare ? t('loading') : t('shareWithFriends')}
                  onPress={handleCreateShareLink}
                  disabled={creatingShare}
                  buttonStyle={styles.shareButton}
                  titleStyle={styles.shareButtonText}
                  loading={creatingShare}
                />
              </View>
            </>
          ) : (
            <View style={styles.shareCodeContainer}>
              <Icon name="check-circle" color={COLORS.accent} size={48} />
              <Text style={styles.shareCodeTitle}>{t('shareLinkCreated')}</Text>
              <Text style={styles.shareCodeLabel}>{t('shareCode')}</Text>
              <View style={styles.shareCodeBox}>
                <Text style={styles.shareCodeText}>{shareCode}</Text>
                <TouchableOpacity onPress={handleCopyShareCode} style={styles.copyButton}>
                  <Icon name="content-copy" color={COLORS.accent} size={20} />
                </TouchableOpacity>
              </View>
              <Text style={styles.shareCodeDescription}>{t('shareCodeDescription')}</Text>
              <Button
                title={t('done')}
                onPress={handleClose}
                buttonStyle={styles.doneButton}
                titleStyle={styles.doneButtonText}
              />
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
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: COLORS.accent,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: 'Poppins-Bold',
  },
  closeButton: {
    padding: 4,
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: 'Poppins-Bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionContainer: {
    marginBottom: 20,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: 'Poppins-Bold',
    marginLeft: 12,
  },
  optionDescription: {
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: 'Poppins-Regular',
    marginBottom: 12,
    lineHeight: 20,
  },
  publishButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 12,
  },
  publishButtonText: {
    color: COLORS.card,
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },
  unpublishButton: {
    backgroundColor: COLORS.bright,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  unpublishButtonText: {
    color: COLORS.accent,
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },
  shareButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 12,
  },
  shareButtonText: {
    color: COLORS.card,
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.bright,
    marginVertical: 20,
  },
  shareCodeContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  shareCodeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: 'Poppins-Bold',
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  shareCodeLabel: {
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
  },
  shareCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bright,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    minWidth: 200,
  },
  shareCodeText: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    letterSpacing: 2,
  },
  copyButton: {
    padding: 4,
  },
  shareCodeDescription: {
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  doneButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  doneButtonText: {
    color: COLORS.card,
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },
}); 