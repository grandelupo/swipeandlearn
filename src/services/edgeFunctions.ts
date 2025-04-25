import { supabase } from './supabase'

export interface StoryGenerationParams {
  language: string
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Divine'
  theme: string
  targetWords?: string[]
  pageNumber?: number
  previousPages?: string[]
  storyId?: string
  userId: string
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
}

export const generateStoryContent = async (params: StoryGenerationParams): Promise<StoryGenerationResponse> => {
  const { data, error } = await supabase.functions.invoke('generate-story', {
    body: params,
  })

  if (error) throw error
  return data
}

export const generateBookCover = async (params: ImageGenerationParams): Promise<string> => {
  const { data, error } = await supabase.functions.invoke('generate-image', {
    body: params,
  })

  if (error) throw error
  return data.imageUrl
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

export const createStoryPage = async (params: CreatePageParams): Promise<CreatePageResponse> => {
  const { data, error } = await supabase.functions.invoke('create-story-page', {
    body: params,
  })

  if (error) {
    console.error('Edge function error:', error)
    // Try to parse the error message from the response if available
    let errorMessage = 'Failed to create story page'
    let errorDetails = null
    try {
      const responseData = JSON.parse(error.message)
      errorMessage = responseData.error || errorMessage
      errorDetails = responseData.details
      if (errorDetails) {
        console.error('Error details:', errorDetails)
      }
      if (responseData.stack) {
        console.error('Error stack:', responseData.stack)
      }
    } catch (parseError) {
      // If we can't parse the error message, just use the original error
      console.error('Error parsing error response:', parseError)
      errorMessage = error.message
    }
    throw new Error(errorMessage)
  }

  return data
} 