import { NavigationContainerRef } from '@react-navigation/native';
import { MainStackParamList } from '@/navigation/types';

class NavigationService {
  private navigator: NavigationContainerRef<MainStackParamList> | null = null;

  setNavigator(navigator: NavigationContainerRef<MainStackParamList>) {
    this.navigator = navigator;
  }

  navigateToStory(storyId: string, pageNumber: number = 1) {
    if (this.navigator) {
      this.navigator.navigate('StoryReader', {
        storyId,
        pageNumber
      });
    }
  }

  navigateToCatalog(sortBy?: 'newest' | 'most_liked') {
    if (this.navigator) {
      this.navigator.navigate('Catalog', { sortBy });
    }
  }

  navigateToBookshelf() {
    if (this.navigator) {
      this.navigator.navigate('Bookshelf');
    }
  }

  navigateToProfile() {
    if (this.navigator) {
      this.navigator.navigate('Profile');
    }
  }

  navigateToArchive() {
    if (this.navigator) {
      this.navigator.navigate('Archive');
    }
  }

  navigateToNewStory() {
    if (this.navigator) {
      this.navigator.navigate('NewStory');
    }
  }
}

export const navigationService = new NavigationService(); 