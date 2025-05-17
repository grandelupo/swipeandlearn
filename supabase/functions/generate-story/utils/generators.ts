import { openai, generateWithGrok } from '../../_shared/config.ts'
import { generateTitlePrompt, generateOutlinePrompt, generatePagePrompt } from '../prompts/templates.ts'
import { CEFR_GUIDELINES } from './constants.ts'

export async function generateTitle(
  language: string,
  difficulty: keyof typeof CEFR_GUIDELINES,
  useGrok: boolean,
  theme: string,
  targetWords?: string[],
  authorStyle: string = 'Default'
): Promise<string> {
  const guidelines = CEFR_GUIDELINES[difficulty]
  const prompt = generateTitlePrompt(language, difficulty, guidelines, theme, targetWords, authorStyle)

  if (useGrok) {
    return await generateWithGrok(prompt)
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 200,
  })
  return completion.choices[0]?.message?.content?.trim() || 'Untitled Story'
}

export async function generateOutline(
  language: string,
  difficulty: keyof typeof CEFR_GUIDELINES,
  useGrok: boolean,
  startPage: number,
  theme: string,
  targetWords?: string[],
  authorStyle: string = 'Default',
  previousOutlines?: { start_page: number; end_page: number; outline: string }[],
  recentStoryOutlines?: { title: string; outline: string }[]
): Promise<string> {
  const guidelines = CEFR_GUIDELINES[difficulty]
  const prompt = generateOutlinePrompt(
    language, 
    difficulty, 
    guidelines, 
    startPage, 
    theme, 
    targetWords, 
    authorStyle, 
    previousOutlines,
    recentStoryOutlines
  )

  if (useGrok) {
    return await generateWithGrok(prompt)
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    // unlimited tokens, i.e. 4096
  })
  return completion.choices[0]?.message?.content?.trim() || ''
}

export async function generatePage(
  language: string,
  difficulty: keyof typeof CEFR_GUIDELINES,
  pageNumber: number,
  storyOutline: string,
  useGrok: boolean,
  targetWords?: string[],
  previousPages?: string[],
  authorStyle: string = 'Default'
): Promise<string> {
  const guidelines = CEFR_GUIDELINES[difficulty]
  const prompt = generatePagePrompt(
    language,
    difficulty,
    guidelines,
    pageNumber,
    storyOutline,
    targetWords,
    previousPages,
    authorStyle
  )

  if (useGrok) {
    return await generateWithGrok(prompt)
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 1500,
  })
  return completion.choices[0]?.message?.content?.trim() || 'Error generating content.'
} 