import OpenAI from 'openai';
import { EXPO_PUBLIC_OPENAI_API_KEY } from '@env';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Required for React Native
});

export interface StoryGenerationParams {
  language: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Divine';
  theme: string;
  targetWords?: string[];
}

interface TranslationParams {
  text: string;
  fromLanguage: string;
  toLanguage: string;
  context?: string;
}

const CEFR_GUIDELINES = {
  A1: {
    vocabulary: 'Use only basic, everyday vocabulary. Focus on concrete nouns and simple verbs.',
    grammar: 'Use simple present tense, basic pronouns, and simple sentences. Avoid complex structures.',
    complexity: 'Keep sentences very short (5-7 words). Use repetition to reinforce learning.',
  },
  A2: {
    vocabulary: 'Use high-frequency vocabulary related to daily life. Introduce some basic descriptive adjectives.',
    grammar: 'Use simple present and past tenses. Include basic conjunctions (and, but, because).',
    complexity: 'Keep sentences short (7-10 words). Use simple compound sentences occasionally.',
  },
  B1: {
    vocabulary: 'Use common vocabulary with some idiomatic expressions. Include topic-specific terms.',
    grammar: 'Use all basic tenses. Include some modal verbs and conditional sentences.',
    complexity: 'Mix short and medium-length sentences. Use compound and some complex sentences.',
  },
  B2: {
    vocabulary: 'Use varied vocabulary including abstract concepts. Include common idioms and collocations.',
    grammar: 'Use all tenses confidently. Include passive voice and reported speech.',
    complexity: 'Use varied sentence structures. Include complex sentences and transitions.',
  },
  C1: {
    vocabulary: 'Use sophisticated vocabulary including nuanced meanings. Include idioms naturally.',
    grammar: 'Use advanced structures including perfect and continuous aspects.',
    complexity: 'Use complex sentence structures. Include subordinate clauses and advanced transitions.',
  },
  C2: {
    vocabulary: 'Use precise and nuanced vocabulary. Include sophisticated idioms and cultural references.',
    grammar: 'Use all grammatical structures with complete flexibility.',
    complexity: 'Use sophisticated sentence structures. Include complex rhetorical devices.',
  },
  Divine: {
    vocabulary: 'Use archaic, esoteric, and philosophical terminology. Include rare literary allusions and metaphysical concepts.',
    grammar: 'Transcend conventional grammar. Employ experimental syntax and innovative linguistic structures.',
    complexity: 'Create labyrinthine sentences with multiple layers of meaning. Weave complex metaphors and abstract symbolism.',
  }
};

export async function generateStoryTitle(params: StoryGenerationParams): Promise<string> {
  const { language, difficulty, theme, targetWords } = params;
  const guidelines = CEFR_GUIDELINES[difficulty];
  
  const prompt = `Create a short, engaging title for a language learning story in ${language} at CEFR level ${difficulty}.
${theme !== 'free form' ? `Theme: ${theme}` : 'Create any engaging theme appropriate for language learners.'}
${targetWords?.length ? `Target words to incorporate if possible: ${targetWords.join(', ')}` : ''}

Guidelines for ${difficulty} level:
- Vocabulary: ${guidelines.vocabulary}
- Grammar: ${guidelines.grammar}
- Complexity: ${guidelines.complexity}

The title should be 2-6 words long and appropriate for language learners at ${difficulty} level.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 50,
    });

    return completion.choices[0]?.message?.content?.trim() || 'Untitled Story';
  } catch (error) {
    console.error('Error generating story title:', error);
    return 'Untitled Story';
  }
}

export async function generateStoryPage(params: StoryGenerationParams, pageNumber: number, previousPages?: string[]): Promise<string> {
  const { language, difficulty, theme, targetWords } = params;
  const guidelines = CEFR_GUIDELINES[difficulty];
  
  const prompt = `Create page ${pageNumber} of a language learning story in ${language} at CEFR level ${difficulty}.
${theme !== 'free form' ? `Theme: ${theme}` : 'Create any engaging theme appropriate for language learners.'}
${targetWords?.length ? `Target words to incorporate naturally: ${targetWords.join(', ')}` : ''}

Guidelines for ${difficulty} level:
- Vocabulary: ${guidelines.vocabulary}
- Grammar: ${guidelines.grammar}
- Complexity: ${guidelines.complexity}

${previousPages ? `Previous pages:\n${previousPages.join('\n\n')}` : ''}

Write a coherent continuation of the story that:
1. Maintains consistent difficulty level (${difficulty})
2. Uses language appropriate for ${difficulty} level learners
3. Naturally incorporates target words if provided
4. Connects logically to previous pages if provided
5. Creates engagement through appropriate storytelling
6. Keeps each page to about 100-150 words

Response should be just the story text, no additional formatting or metadata.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion.choices[0]?.message?.content?.trim() || 'Error generating story page.';
  } catch (error) {
    console.error('Error generating story page:', error);
    return 'Error generating story page.';
  }
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  try {
    const prompt = `Translate the following text to ${targetLanguage}. Provide only the translation, no additional explanations:

${text}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 200,
    });

    return completion.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('Error translating text:', error);
    throw new Error('Failed to translate text');
  }
}

export const generateBookCover = async (
  theme: string,
  title: string
): Promise<string> => {
  try {
    console.log('Generating book cover with params:', { theme, title });
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a beautiful, appropriate book cover for a language learning story titled "${title}" with theme "${theme}". The style should be engaging and suitable for all ages. Make sure no to include any text, words or letters on the cover.`,
      n: 1,
      size: "1024x1024",
    });

    console.log('DALL-E response:', JSON.stringify(response, null, 2));

    if (!response.data?.[0]?.url) {
      throw new Error('No image URL in DALL-E response');
    }

    return response.data[0].url;
  } catch (error: any) {
    console.error('Error generating book cover:', {
      error,
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    throw error; // Throw the original error to preserve error details
  }
}; 