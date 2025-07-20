import { Linking } from 'react-native';
import { catalogService } from './catalog';
import { t } from '@/i18n/translations';

export interface DeepLinkConfig {
  scheme: string;
  host: string;
  pathPrefix: string;
  webDomain: string;
}

export class DeepLinkingService {
  private static config: DeepLinkConfig = {
    scheme: 'swipeandlearn',
    host: 'story',
    pathPrefix: '/story',
    webDomain: 'https://swipe.karolkrakowski.pl'
  };

  /**
   * Generate a web link for sharing (landing page)
   */
  static generateWebLink(shareCode: string): string {
    return `${this.config.webDomain}/story.php?code=${shareCode}`;
  }

  /**
   * Share a story with web link that redirects to app
   */
  static async shareStory(storyId: string, storyTitle: string): Promise<void> {
    try {
      // Create a share code for the story
      const shareData = await catalogService.createStoryShare(storyId);
      const shareCode = shareData.share_code;
      
      // Generate web link (which will redirect to app if installed)
      const webLink = this.generateWebLink(shareCode);
      
      // Create share message
      const shareMessage = `${t('deepLinkShareMessage', storyTitle)}\n\n${webLink}`;
      
      // Share using React Native's Share API
      const { Share } = require('react-native');
      await Share.share({
        message: shareMessage,
        title: t('deepLinkShareTitle'),
        url: webLink, // iOS will use this for deep linking
      });
    } catch (error) {
      console.error('Error sharing story:', error);
      throw error;
    }
  }

  /**
   * Handle incoming deep links
   */
  static async handleIncomingLink(url: string): Promise<{ storyId: string; pageNumber?: number } | null> {
    try {
      const urlObj = new URL(url);
      
      // Check if it's our app's deep link
      if (urlObj.protocol === `${this.config.scheme}:` && urlObj.host === this.config.host) {
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        
        if (pathParts[0] === 'story' && pathParts[1]) {
          const shareCode = pathParts[1];
          const pageNumber = pathParts[2] ? parseInt(pathParts[2]) : 1;
          
          // Get story by share code
          const story = await catalogService.getStoryByShareCode(shareCode);
          
          if (story) {
            return {
              storyId: story.id,
              pageNumber: pageNumber
            };
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error handling incoming link:', error);
      return null;
    }
  }

  /**
   * Set up deep link listeners
   */
  static setupDeepLinkListeners(
    onStoryLink: (storyId: string, pageNumber?: number) => void
  ): () => void {
    // Handle initial URL if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        this.handleIncomingLink(url).then((result) => {
          if (result) {
            onStoryLink(result.storyId, result.pageNumber);
          }
        });
      }
    });

    // Handle deep links when app is already running
    const subscription = Linking.addEventListener('url', (event) => {
      this.handleIncomingLink(event.url).then((result) => {
        if (result) {
          onStoryLink(result.storyId, result.pageNumber);
        }
      });
    });

    // Return cleanup function
    return () => {
      subscription?.remove();
    };
  }

  /**
   * Check if deep linking is supported
   */
  static async canOpenDeepLinks(): Promise<boolean> {
    try {
      const testUrl = `${this.config.scheme}://${this.config.host}${this.config.pathPrefix}/test`;
      return await Linking.canOpenURL(testUrl);
    } catch (error) {
      console.error('Error checking deep link support:', error);
      return false;
    }
  }
} 