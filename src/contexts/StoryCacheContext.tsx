import React, { createContext, useContext, useState, useCallback } from 'react';
import { Story } from '@/types/story';

interface StoryPage {
  content: string;
  page_number: number;
  target_words: string[];
}

interface StoryCache {
  [storyId: string]: {
    story: Story;
    pages: {
      [pageNumber: number]: StoryPage;
    };
  };
}

interface StoryCacheContextType {
  cache: StoryCache;
  getCachedPage: (storyId: string, pageNumber: number) => StoryPage | null;
  getCachedStory: (storyId: string) => Story | null;
  cachePage: (storyId: string, story: Story, page: StoryPage) => void;
  updateCachedStory: (storyId: string, story: Story) => void;
  clearCache: () => void;
}

const StoryCacheContext = createContext<StoryCacheContextType | undefined>(undefined);

export function StoryCacheProvider({ children }: { children: React.ReactNode }) {
  const [cache, setCache] = useState<StoryCache>({});

  const getCachedPage = useCallback((storyId: string, pageNumber: number) => {
    return cache[storyId]?.pages[pageNumber] || null;
  }, [cache]);

  const getCachedStory = useCallback((storyId: string) => {
    return cache[storyId]?.story || null;
  }, [cache]);

  const cachePage = useCallback((storyId: string, story: Story, page: StoryPage) => {
    setCache(prevCache => ({
      ...prevCache,
      [storyId]: {
        story,
        pages: {
          ...(prevCache[storyId]?.pages || {}),
          [page.page_number]: page,
        },
      },
    }));
  }, []);

  const updateCachedStory = useCallback((storyId: string, story: Story) => {
    setCache(prevCache => ({
      ...prevCache,
      [storyId]: {
        ...prevCache[storyId],
        story,
      },
    }));
  }, []);

  const clearCache = useCallback(() => {
    setCache({});
  }, []);

  return (
    <StoryCacheContext.Provider
      value={{
        cache,
        getCachedPage,
        getCachedStory,
        cachePage,
        updateCachedStory,
        clearCache,
      }}
    >
      {children}
    </StoryCacheContext.Provider>
  );
}

export function useStoryCache() {
  const context = useContext(StoryCacheContext);
  if (context === undefined) {
    throw new Error('useStoryCache must be used within a StoryCacheProvider');
  }
  return context;
} 