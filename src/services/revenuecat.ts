import { EXPO_PUBLIC_REVENUECAT_API_KEY } from '@env';
import { supabase } from './supabase';
import Purchases, { PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import { t } from '@/i18n/translations';

export enum CoinPackage {
  SMALL = '5_coins',
  MEDIUM = '15_coins',
  LARGE = '50_coins',
  XLARGE = '200_coins',
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
    name: '5 ' + t('coins'),
    coins: 5,
  },
  {
    id: CoinPackage.MEDIUM,
    name: '15 ' + t('coins'),
    coins: 15,
  },
  {
    id: CoinPackage.LARGE,
    name: '50 ' + t('coins'),
    coins: 50,
  },
  {
    id: CoinPackage.XLARGE,
    name: '200 ' + t('coins'),
    coins: 200,
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

    console.log('Package to purchase:', packageToPurchase);
    
    if (!packageToPurchase?.package) {
      throw new Error('Package not found');
    }

    console.log('Purchasing package:', packageToPurchase.package);

    const purchaseResult = await Purchases.purchasePackage(packageToPurchase.package);
    console.log('Purchase result:', purchaseResult);
    
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
export const spendCoins = async (functionType: 'GENERATE_STORY' | 'GENERATE_COVER' | 'GENERATE_AUDIO' | 'GENERATE_NEW_PAGE', additionalCost?: number): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('coins')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    const totalCost = FUNCTION_COSTS[functionType] + (additionalCost || 0);
    if (profile.coins < totalCost) return false;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ coins: profile.coins - totalCost })
      .eq('id', user.id);

    if (updateError) throw updateError;
    return true;
  } catch (error) {
    console.error('Error spending coins:', error);
    return false;
  }
};

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