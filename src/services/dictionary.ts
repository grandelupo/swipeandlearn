import { Definition } from '@/components/Dictionary';

const DICTIONARY_API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';

export async function fetchDefinitions(word: string): Promise<Definition[]> {
  try {
    const response = await fetch(`${DICTIONARY_API_URL}/${encodeURIComponent(word)}`);
    
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
    console.error('Error fetching definitions:', error);
    return [];
  }
} 