import { generateWithGrok } from './grok'
import { generateWithOpenAI } from './openai'
import { StoryPage } from './types'

export type AIProvider = 'grok' | 'openai'

export async function generateStory(
  prompt: string,
  targetWords: string[],
  difficulty: string,
  provider: AIProvider = 'openai'
): Promise<{ title: string; pages: StoryPage[] }> {
  switch (provider) {
    case 'grok':
      return generateWithGrok(prompt, targetWords, difficulty)
    case 'openai':
      return generateWithOpenAI(prompt, targetWords, difficulty)
    default:
      throw new Error(`Unsupported AI provider: ${provider}`)
  }
} 