import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getCoinBalance, spendCoins, purchasePackage, CoinPackage } from '@/services/revenuecat';
import { Alert } from 'react-native';
import { supabase } from '@/services/supabase';

interface CoinContextType {
  coins: number;
  isLoading: boolean;
  refreshBalance: () => Promise<void>;
  purchaseCoins: (packageId: CoinPackage) => Promise<boolean>;
  useCoins: (functionType: 'GENERATE_STORY' | 'GENERATE_COVER' | 'GENERATE_AUDIO' | 'GENERATE_NEW_PAGE') => Promise<boolean>;
  showInsufficientCoinsAlert: (
    functionType: 'GENERATE_STORY' | 'GENERATE_COVER' | 'GENERATE_AUDIO' | 'GENERATE_NEW_PAGE',
    onPurchase: () => void
  ) => void;
}

const CoinContext = createContext<CoinContextType>({
  coins: 0,
  isLoading: true,
  refreshBalance: async () => {},
  purchaseCoins: async () => false,
  useCoins: async () => false,
  showInsufficientCoinsAlert: () => {},
});

export const useCoins = () => useContext(CoinContext);

interface CoinProviderProps {
  children: ReactNode;
}

const FUNCTION_NAMES = {
  GENERATE_STORY: 'generating a story',
  GENERATE_COVER: 'generating a cover image',
  GENERATE_AUDIO: 'generating audio',
  GENERATE_NEW_PAGE: 'generating a new page',
};

const FUNCTION_COSTS = {
  GENERATE_STORY: 10,
  GENERATE_COVER: 20,
  GENERATE_AUDIO: 7,
  GENERATE_NEW_PAGE: 2,
};

export const CoinProvider = ({ children }: CoinProviderProps) => {
  const [coins, setCoins] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshBalance = async () => {
    try {
      setIsLoading(true);
      const balance = await getCoinBalance();
      setCoins(balance);
    } catch (error) {
      console.error('Error refreshing coin balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const purchaseCoins = async (packageId: CoinPackage): Promise<boolean> => {
    const success = await purchasePackage(packageId);
    if (success) {
      await refreshBalance();
    }
    return success;
  };

  const useCoins = async (
    functionType: 'GENERATE_STORY' | 'GENERATE_COVER' | 'GENERATE_AUDIO' | 'GENERATE_NEW_PAGE'
  ): Promise<boolean> => {
    const success = await spendCoins(functionType);
    if (success) {
      // Update the local state immediately to avoid delay
      setCoins(prevCoins => prevCoins - FUNCTION_COSTS[functionType]);
    }
    return success;
  };

  const showInsufficientCoinsAlert = (
    functionType: 'GENERATE_STORY' | 'GENERATE_COVER' | 'GENERATE_AUDIO' | 'GENERATE_NEW_PAGE',
    onPurchase: () => void
  ) => {
    Alert.alert(
      'Insufficient Coins',
      `You need ${FUNCTION_COSTS[functionType]} coins for ${FUNCTION_NAMES[functionType]}. Would you like to purchase more coins?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Get Coins', onPress: onPurchase }
      ]
    );
  };

  useEffect(() => {
    refreshBalance();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        refreshBalance();
      } else {
        setCoins(0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <CoinContext.Provider value={{
      coins,
      isLoading,
      refreshBalance,
      purchaseCoins,
      useCoins,
      showInsufficientCoinsAlert
    }}>
      {children}
    </CoinContext.Provider>
  );
}; 