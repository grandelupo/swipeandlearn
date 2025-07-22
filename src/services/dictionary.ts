import { Definition } from '@/components/Dictionary';
import { fetchDikiDefinitions } from './dikiDictionary';
import { t } from '@/i18n/translations';

// API URLs
const ENGLISH_DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en';

// Dictionary types
export type DictionaryType =
  | 'defaultDictionary'
  | 'wiktionary'
  | 'wiktionary-pl'
  | 'diki' // English-Polish
  | 'diki-de-pl'
  | 'diki-it-pl'
  | 'diki-es-pl'
  | 'diki-fr-pl';

// Language codes mapping for Wiktionary
const WIKTIONARY_LANG_CODES: Record<string, string> = {
  English: 'en',
  Spanish: 'es',
  French: 'fr',
  German: 'de',
  Italian: 'it',
  Portuguese: 'pt',
  Chinese: 'zh',
  Japanese: 'ja',
  Korean: 'ko',
  Russian: 'ru',
  Arabic: 'ar',
  Polish: 'pl',
  
};

// Helper function to clean up Wiktionary HTML content
function cleanWiktionaryText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\{[^}]*\}/g, '') // Remove template markers
    .replace(/\[[^\]]*\]/g, '') // Remove reference markers
    .replace(/&lt;/g, '<') // Fix HTML entities
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
}

async function fetchEnglishDefinitions(word: string): Promise<Definition[]> {
  try {
    const response = await fetch(`${ENGLISH_DICTIONARY_API}/${encodeURIComponent(word)}`);
    
    if (!response.ok) {
      throw new Error('Word not found');
    }

    const data = await response.json();
    
    return data[0].meanings.map((meaning: any) => ({
      partOfSpeech: meaning.partOfSpeech,
      definitions: meaning.definitions.map((def: any) => ({
        text: def.definition,
        example: def.example
      })),
      examples: undefined // We now use per-definition examples
    }));
  } catch (error) {
    console.error('Error fetching English definitions:', error);
    throw error;
  }
}

interface WiktionaryDefinition {
  definition: string;
  examples?: string[];
  parsedExamples?: Array<{ example: string }>;
}

interface WiktionaryEntry {
  partOfSpeech: string;
  language: string;
  definitions: WiktionaryDefinition[];
}

async function fetchWiktionaryDefinitions(word: string, language: string): Promise<Definition[]> {
  try {
    const langCode = WIKTIONARY_LANG_CODES[language];
    if (!langCode) {
      throw new Error(`Language not supported: ${language}`);
    }

    // Use English Wiktionary for all languages as it has the most comprehensive coverage
    const response = await fetch(
      `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SwipeAndLearn/1.0 (karol@example.com)' // Replace with your contact
        }
      }
    );

    if (!response.ok) {
      throw new Error('Word not found');
    }

    const data = await response.json();
    
    // Find entries for the requested language
    const entries = data[langCode] as WiktionaryEntry[] || [];
    
    if (entries.length === 0) {
      throw new Error('No definitions found for this language');
    }

    return entries.map(entry => ({
      partOfSpeech: entry.partOfSpeech,
      definitions: entry.definitions.map(def => {
        const examples = (def.parsedExamples || []).map(ex => cleanWiktionaryText(ex.example));
        return {
          text: cleanWiktionaryText(def.definition),
          example: examples.length > 0 ? examples[0] : undefined
        };
      }),
      examples: undefined // We now use per-definition examples
    }));
  } catch (error) {
    console.error('Error fetching Wiktionary definitions:', error);
    throw error;
  }
}

export async function fetchDefinitions(
  word: string, 
  language: string = 'English',
  dictionaryType: DictionaryType = 'defaultDictionary'
): Promise<Definition[]> {
  try {
    // Use Diki.pl for Polish translations and bilingual dictionaries
    if (dictionaryType.startsWith('diki')) {
      return await fetchDikiDefinitions(word, dictionaryType);
    }
    // Use English dictionary API for English words with default dictionary
    if (language === 'English' && dictionaryType === 'defaultDictionary') {
      return await fetchEnglishDefinitions(word);
    }
    // Use Wiktionary for other languages or when explicitly selected
    if (dictionaryType === 'wiktionary' || (language !== 'English' && dictionaryType !== 'wiktionary-pl')) {
      return await fetchWiktionaryDefinitions(word, language);
    }
    // Use Polish Wiktionary if selected
    if (dictionaryType === 'wiktionary-pl') {
      return await fetchWiktionaryDefinitions(word, 'Polish');
    }
    throw new Error('Unsupported dictionary type and language combination');
  } catch (error: any) {
    console.error('Error fetching definitions:', {
      error,
      word,
      language,
      dictionaryType
    });
    
    if (error.message === 'Word not found' || error.message === 'No definitions found for this language') {
      return [{
        partOfSpeech: 'error',
        definitions: [{ text: t('wordNotFoundInDictionary') }],
        examples: undefined
      }];
    }
    
    return [{
      partOfSpeech: 'error',
      definitions: [{ text: `Failed to fetch definition: ${error.message}` }],
      examples: undefined
    }];
  }
}

// Helper function to get available languages
export function getAvailableDictionaryLanguages(): string[] {
  return Object.keys(WIKTIONARY_LANG_CODES);
}

// Helper function to check if dictionary is available for a language
export function isDictionaryAvailable(language: string): boolean {
  return language in WIKTIONARY_LANG_CODES;
}

// Helper function to get available dictionary types for a language
export function getAvailableDictionaryTypes(language: string): DictionaryType[] {
  const types: DictionaryType[] = [];
  
  if (language === 'English') {
    types.push('defaultDictionary');
    types.push('diki');
  }
  
  if (language in WIKTIONARY_LANG_CODES) {
    types.push('wiktionary');
  }
  // For Polish, add more options
  if (language === 'Polish') {
    types.push('wiktionary-pl');
    types.push('diki');
    types.push('diki-de-pl');
    types.push('diki-it-pl');
    types.push('diki-es-pl');
    types.push('diki-fr-pl');
  }
  
  return types;
} 

// Helper to get Diki URL for a given dictionary type
export function getDikiUrl(word: string, dictionaryType: DictionaryType): string {
  switch (dictionaryType) {
    case 'diki':
      return `https://www.diki.pl/slownik-angielskiego?q=${encodeURIComponent(word)}`;
    case 'diki-de-pl':
      return `https://www.diki.pl/slownik-niemieckiego?q=${encodeURIComponent(word)}`;
    case 'diki-it-pl':
      return `https://www.diki.pl/slownik-wloskiego?q=${encodeURIComponent(word)}`;
    case 'diki-es-pl':
      return `https://www.diki.pl/slownik-hiszpanskiego?q=${encodeURIComponent(word)}`;
    case 'diki-fr-pl':
      return `https://www.diki.pl/slownik-francuskiego?q=${encodeURIComponent(word)}`;
    default:
      return `https://www.diki.pl/slownik-angielskiego?q=${encodeURIComponent(word)}`;
  }
} 