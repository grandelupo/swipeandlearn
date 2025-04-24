import { Definition } from '@/components/Dictionary';

// API URLs
const ENGLISH_DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en';

// Language codes mapping for Wiktionary
const WIKTIONARY_LANG_CODES: Record<string, string> = {
  English: 'en',
  Spanish: 'es',
  French: 'fr',
  German: 'de',
  Italian: 'it',
  Portuguese: 'pt'
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
      definitions: meaning.definitions.map((def: any) => def.definition),
      examples: meaning.definitions
        .filter((def: any) => def.example)
        .map((def: any) => def.example),
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
      definitions: entry.definitions.map(def => cleanWiktionaryText(def.definition)),
      examples: entry.definitions
        .map(def => (def.parsedExamples || []).map(ex => cleanWiktionaryText(ex.example)))
        .flat()
    }));
  } catch (error) {
    console.error('Error fetching Wiktionary definitions:', error);
    throw error;
  }
}

export async function fetchDefinitions(word: string, language: string = 'English'): Promise<Definition[]> {
  try {
    // Use English dictionary API for English words
    if (language === 'English') {
      return await fetchEnglishDefinitions(word);
    }
    
    // Use Wiktionary for other languages
    return await fetchWiktionaryDefinitions(word, language);
  } catch (error: any) {
    console.error('Error fetching definitions:', {
      error,
      word,
      language
    });
    
    if (error.message === 'Word not found' || error.message === 'No definitions found for this language') {
      return [{
        partOfSpeech: 'error',
        definitions: ['Word not found in dictionary'],
        examples: []
      }];
    }
    
    return [{
      partOfSpeech: 'error',
      definitions: [`Failed to fetch definition: ${error.message}`],
      examples: []
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