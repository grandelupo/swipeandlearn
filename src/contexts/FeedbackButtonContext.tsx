import React, { createContext, useContext, useRef } from 'react';
import { View } from 'react-native';

interface FeedbackButtonContextType {
  feedbackButtonRef: React.RefObject<View>;
}

const FeedbackButtonContext = createContext<FeedbackButtonContextType | null>(null);

export function FeedbackButtonProvider({ children }: { children: React.ReactNode }) {
  const feedbackButtonRef = useRef<View>(null);

  return (
    <FeedbackButtonContext.Provider value={{ feedbackButtonRef }}>
      {children}
    </FeedbackButtonContext.Provider>
  );
}

export function useFeedbackButton() {
  const context = useContext(FeedbackButtonContext);
  if (!context) {
    throw new Error('useFeedbackButton must be used within a FeedbackButtonProvider');
  }
  return context;
} 