import { NativeModules, Platform } from 'react-native';
import { en } from './en';
import { pl } from './pl';
import { de } from './de';
import { it } from './it';
import { es } from './es';
import { uk } from './uk';

type TranslationKeys = {
  [key: string]: string;
};

type Translations = {
  [locale: string]: TranslationKeys;
};

const translations: Translations = {
  en,
  pl,
  de,
  it,
  es,
  uk,
};

// Get the device language
const getDeviceLanguage = (): string => {
  try {
    if (Platform.OS === 'ios') {
      const locale = 
        NativeModules.SettingsManager?.settings?.AppleLocale ||
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
        'pl';
      const languageCode = locale.substring(0, 2);
      
      // Check if the detected language is supported, otherwise fall back to Polish
      if (['en', 'pl', 'de', 'it', 'es', 'uk'].includes(languageCode)) {
        return languageCode;
      }
      return 'pl';
    }
    
    if (Platform.OS === 'android') {
      const locale = NativeModules.I18nManager?.localeIdentifier || 'pl';
      const languageCode = locale.substring(0, 2);
      
      // Check if the detected language is supported, otherwise fall back to Polish
      if (['en', 'pl', 'de', 'it', 'es', 'uk'].includes(languageCode)) {
        return languageCode;
      }
      return 'pl';
    }
    
    return 'pl';
  } catch (error) {
    console.warn('Error getting device language:', error);
    return 'pl';
  }
};

const currentLanguage = getDeviceLanguage();

export const t = (key: string, ...args: any[]): string => {
  try {
    let value = translations[currentLanguage]?.[key] || translations.pl[key] || key;
    
    // Handle parameter replacement if any
    if (args.length > 0) {
      args.forEach((arg, index) => {
        value = value.replace(`{${index}}`, arg.toString());
      });
    }

    return value;
  } catch (error) {
    console.warn('Translation error:', error);
    return key;
  }
};

export const getCurrentLanguage = () => currentLanguage;

export default { t, getCurrentLanguage }; 