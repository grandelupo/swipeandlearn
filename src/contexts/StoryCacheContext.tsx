import React, { createContext, useContext, useState, useCallback } from 'react';

interface StoryPage {
  content: string;
  page_number: number;
  target_words: string[];
}

interface Story {
  id: string;
  title: string;
  language: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  theme: string;
  total_pages: number;
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