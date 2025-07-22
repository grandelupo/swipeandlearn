import { supabase } from './supabase'
import { Story } from '@/types/story'

export interface StoryGenerationParams {
  language: string
  difficulty: string
  theme: string
  targetWords?: string[]
  pageNumber?: number
  previousPages?: string[]
  storyId?: string
  userId: string
  generateCache?: boolean
  authorStyle?: string
}

export interface FullStoryGenerationParams {
  language: string
  difficulty: string
  theme: string
  targetWords?: string[]
  title?: string
  userId: string
  generateCover?: boolean
  authorStyle?: string
}

export interface ImageGenerationParams {
  theme: string
  title: string
  storyId: string
}

export interface AudioGenerationParams {
  text: string
  voiceId: string
  storyId: string
  pageNumber: number
}

export interface TranslationParams {
  text: string
  targetLanguage: string
  userId: string
  storyId: string
  isWord?: boolean
  context?: string
  wordIndex?: number
}

export interface CreatePageParams {
  storyId: string
  content: string
  targetWords: string[]
  userId: string
}

interface CreatePageResponse {
  success: boolean
  page: {
    id: string
    story_id: string
    page_number: number
    content: string
    target_words: string[]
  }
  story: {
    id: string
    total_pages: number
  }
}

interface StoryGenerationResponse {
  content: string
  storyId?: string
  target_words?: string[]
  page_number?: number
  is_cached?: boolean
}

interface FullStoryGenerationResponse {
  storyId: string
  title: string
  coverUrl?: string
  firstPage: string
}

export async function generateStoryContent(params: StoryGenerationParams): Promise<StoryGenerationResponse> {
  const { data, error } = await supabase.functions.invoke('generate-story', {
    body: params,
  })

  if (error) throw error
  return data
}

export async function generateFullStory(params: FullStoryGenerationParams): Promise<FullStoryGenerationResponse> {
  const { data, error } = await supabase.functions.invoke('generate-story/generate-full-story', {
    body: params,
  })

  if (error) throw error
  return data
}

export async function generateBookCover(params: { theme: string; title: string; storyId: string }): Promise<string> {
  const { data, error } = await supabase.functions.invoke('generate-image', {
    body: params,
  })

  if (error) throw error
  return data.coverUrl
}

export const generateSpeech = async (params: AudioGenerationParams): Promise<string> => {
  const { data, error } = await supabase.functions.invoke('generate-audio', {
    body: params,
  })

  if (error) throw error
  return data.audioUrl
}

export const translateText = async (params: TranslationParams): Promise<string> => {
  const { data, error } = await supabase.functions.invoke('translate', {
    body: params,
  })

  if (error) throw error
  return data.translation
}