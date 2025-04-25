import { Platform } from 'react-native';
import { EXPO_PUBLIC_REVENUECAT_API_KEY } from '@env';
import { supabase } from './supabase';

// Mock implementation for development/testing
// In production, replace with actual RevenueCat imports
// import { Purchases, PurchasesPackage, CustomerInfo } from 'react-native-purchases';

export enum CoinPackage {
  SMALL = 'small_coin_pack',
  MEDIUM = 'medium_coin_pack',
  LARGE = 'large_coin_pack',
}

export interface PackageDetails {
  id: CoinPackage;
  name: string;
  coins: number;
  price: string;
  rawPrice: number;
}

// Coin package definitions
export const COIN_PACKAGES: PackageDetails[] = [
  {
    id: CoinPackage.SMALL,
    name: '100 Coins',
    coins: 100,
    price: '$2.99',
    rawPrice: 2.99,
  },
  {
    id: CoinPackage.MEDIUM,
    name: '300 Coins',
    coins: 300,
    price: '$6.99',
    rawPrice: 6.99,
  },
  {
    id: CoinPackage.LARGE,
    name: '1000 Coins',
    coins: 1000,
    price: '$14.99',
    rawPrice: 14.99,
  },
];

// Function costs
export const FUNCTION_COSTS = {
  GENERATE_STORY: 10,
  GENERATE_COVER: 20,
  GENERATE_AUDIO: 7,
  GENERATE_NEW_PAGE: 2,
};

// Initialize RevenueCat
export async function initializeRevenueCat() {
  // In a real implementation, this would initialize RevenueCat
  // For example:
  // await Purchases.configure({
  //   apiKey: Platform.OS === 'ios' 
  //     ? EXPO_PUBLIC_REVENUECAT_API_KEY 
  //     : EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
  // });
  console.log('RevenueCat initialized with API key:', EXPO_PUBLIC_REVENUECAT_API_KEY ? 'present' : 'missing');
}

// Get available packages
export async function getAvailablePackages(): Promise<PackageDetails[]> {
  // In a real implementation, this would fetch packages from RevenueCat
  // For example:
  // const offerings = await Purchases.getOfferings();
  // return offerings.current?.availablePackages || [];
  return COIN_PACKAGES;
}

// Purchase a package
export async function purchasePackage(packageId: CoinPackage): Promise<boolean> {
  try {
    // In a real implementation, this would process the purchase via RevenueCat
    // For example:
    // const packages = await getAvailablePackages();
    // const packageToPurchase = packages.find(p => p.identifier === packageId);
    // if (!packageToPurchase) throw new Error('Package not found');
    // const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    
    // For our mock implementation, we'll just add coins directly
    const selectedPackage = COIN_PACKAGES.find(p => p.id === packageId);
    if (!selectedPackage) {
      throw new Error('Package not found');
    }
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Get current coins
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('coins')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      throw profileError;
    }
    
    // Update coins in database
    const newCoinBalance = (profile.coins || 0) + selectedPackage.coins;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ coins: newCoinBalance })
      .eq('id', user.id);
      
    if (updateError) {
      throw updateError;
    }
    
    console.log(`Added ${selectedPackage.coins} coins. New balance: ${newCoinBalance}`);
    return true;
  } catch (error) {
    console.error('Purchase error:', error);
    return false;
  }
}

// Check if user has enough coins for a function
export async function hasEnoughCoins(functionType: keyof typeof FUNCTION_COSTS): Promise<boolean> {
  try {
    const cost = FUNCTION_COSTS[functionType];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('coins')
      .eq('id', user.id)
      .single();
      
    if (error) {
      throw error;
    }
    
    return (data.coins || 0) >= cost;
  } catch (error) {
    console.error('Error checking coins:', error);
    return false;
  }
}

// Spend coins for a function
export async function spendCoins(functionType: keyof typeof FUNCTION_COSTS): Promise<boolean> {
  try {
    const cost = FUNCTION_COSTS[functionType];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Get current coins
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('coins')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      throw profileError;
    }
    
    if ((profile.coins || 0) < cost) {
      return false;
    }
    
    // Update coins in database
    const newCoinBalance = profile.coins - cost;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ coins: newCoinBalance })
      .eq('id', user.id);
      
    if (updateError) {
      throw updateError;
    }
    
    console.log(`Spent ${cost} coins. New balance: ${newCoinBalance}`);
    return true;
  } catch (error) {
    console.error('Error spending coins:', error);
    return false;
  }
}

// Get current user's coin balance
export async function getCoinBalance(): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return 0;
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('coins')
      .eq('id', user.id)
      .single();
      
    if (error) {
      throw error;
    }
    
    return data.coins || 0;
  } catch (error) {
    console.error('Error getting coin balance:', error);
    return 0;
  }
} 