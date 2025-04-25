import { StoryPage } from './types'

export async function generateWithGrok(
  prompt: string,
  targetWords: string[],
  difficulty: string
): Promise<{ title: string; pages: StoryPage[] }> {
  // TODO: Implement Grok API integration
  throw new Error('Grok integration not implemented yet')
} 