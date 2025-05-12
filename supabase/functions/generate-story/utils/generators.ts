import { openai, generateWithGrok } from '../../_shared/config.ts'
import { generateTitlePrompt, generateOutlinePrompt, generatePagePrompt } from '../prompts/templates.ts'
import { CEFR_GUIDELINES } from './constants.ts'

export async function generateTitle(
  language: string,
  difficulty: keyof typeof CEFR_GUIDELINES,
  useGrok: boolean
): Promise<string> {
  const guidelines = CEFR_GUIDELINES[difficulty]
  const prompt = generateTitlePrompt(language, difficulty, guidelines)

  if (useGrok) {
    return await generateWithGrok(prompt)
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 50,
  })
  return completion.choices[0]?.message?.content?.trim() || 'Untitled Story'
}

export async function generateOutline(
  language: string,
  difficulty: keyof typeof CEFR_GUIDELINES,
  useGrok: boolean,
  startPage: number,
  previousOutlines?: { start_page: number; end_page: number; outline: string }[]
): Promise<string> {
  const guidelines = CEFR_GUIDELINES[difficulty]
  const prompt = generateOutlinePrompt(language, difficulty, guidelines, startPage, previousOutlines)

  if (useGrok) {
    return await generateWithGrok(prompt)
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 500,
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
  previousPages?: string[]
): Promise<string> {
  const guidelines = CEFR_GUIDELINES[difficulty]
  const prompt = generatePagePrompt(
    language,
    difficulty,
    guidelines,
    pageNumber,
    storyOutline,
    targetWords,
    previousPages
  )

  if (useGrok) {
    return await generateWithGrok(prompt)
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 500,
  })
  return completion.choices[0]?.message?.content?.trim() || 'Error generating content.'
} 