import { Platform } from 'react-native';
import { EXPO_PUBLIC_REVENUECAT_API_KEY } from '@env';
import { supabase } from './supabase';
import Purchases, { PurchasesPackage, CustomerInfo } from 'react-native-purchases';

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
  package: PurchasesPackage;
}

// Coin package definitions
export const COIN_PACKAGES: Omit<PackageDetails, 'package' | 'price' | 'rawPrice'>[] = [
  {
    id: CoinPackage.SMALL,
    name: '100 Coins',
    coins: 100,
  },
  {
    id: CoinPackage.MEDIUM,
    name: '300 Coins',
    coins: 300,
  },
  {
    id: CoinPackage.LARGE,
    name: '1000 Coins',
    coins: 1000,
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
  await Purchases.configure({
    apiKey: EXPO_PUBLIC_REVENUECAT_API_KEY,
  });
  console.log('RevenueCat initialized with API key:', EXPO_PUBLIC_REVENUECAT_API_KEY ? 'present' : 'missing');
}

// Get available packages
export async function getAvailablePackages(): Promise<PackageDetails[]> {
  try {
    const offerings = await Purchases.getOfferings();
    const currentOffering = offerings.current;
    
    if (!currentOffering) {
      console.warn('No current offering available');
      return [];
    }

    const packages = currentOffering.availablePackages.map((pkg: PurchasesPackage) => {
      const packageId = pkg.identifier as CoinPackage;
      const basePackage = COIN_PACKAGES.find(p => p.id === packageId);
      
      if (!basePackage) {
        console.warn(`No matching package found for ${packageId}`);
        return null;
      }

      const packageDetails: PackageDetails = {
        ...basePackage,
        package: pkg,
        price: pkg.product.priceString,
        rawPrice: pkg.product.price,
      };

      return packageDetails;
    }).filter((pkg): pkg is PackageDetails => pkg !== null);

    return packages;
  } catch (error) {
    console.error('Error fetching packages:', error);
    return [];
  }
}

// Purchase a package
export async function purchasePackage(packageId: CoinPackage): Promise<boolean> {
  try {
    const packages = await getAvailablePackages();
    const packageToPurchase = packages.find(p => p.id === packageId);
    
    if (!packageToPurchase?.package) {
      throw new Error('Package not found');
    }

    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase.package);
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Update coins in database
    const newCoinBalance = (await getCoinBalance()) + packageToPurchase.coins;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ coins: newCoinBalance })
      .eq('id', user.id);
      
    if (updateError) {
      throw updateError;
    }
    
    console.log(`Added ${packageToPurchase.coins} coins. New balance: ${newCoinBalance}`);
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