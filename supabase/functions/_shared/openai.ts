import OpenAI from 'openai'
import { StoryPage } from './types'

const openai = new OpenAI()

const SYSTEM_PROMPT = `You are a creative storyteller who creates engaging, educational stories for children. 
Your task is to create a story that naturally incorporates specific target words to help children learn vocabulary.
The story should be divided into pages, with each page containing 2-3 sentences.
The difficulty level affects the complexity of the language and story structure.
Each page should use 1-2 target words naturally within the context.
The story should be engaging, age-appropriate, and educational.`

interface StoryResponse {
  title: string
  pages: StoryPage[]
}

export async function generateWithOpenAI(
  prompt: string,
  targetWords: string[],
  difficulty: string
): Promise<StoryResponse> {
  // First, generate the story title
  const titleResponse = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      { role: "system", content: "Create a short, engaging title for a children's story based on the given prompt and target words." },
      { role: "user", content: `Prompt: ${prompt}\nTarget words: ${targetWords.join(', ')}\nDifficulty: ${difficulty}` }
    ],
    temperature: 0.7,
    max_tokens: 50
  })

  const title = titleResponse.choices[0].message.content?.trim() || "Untitled Story"

  // Then, generate the story content
  const storyResponse = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { 
        role: "user", 
        content: `Create a story with the following parameters:
Title: ${title}
Prompt: ${prompt}
Target Words: ${targetWords.join(', ')}
Difficulty Level: ${difficulty}

Format the response as a JSON array of pages, where each page has:
- text: The content of the page (2-3 sentences)
- targetWords: Array of target words used on this page
- imagePrompt: A detailed prompt for generating an illustration for this page

Example format:
[
  {
    "text": "Page content here",
    "targetWords": ["word1", "word2"],
    "imagePrompt": "Detailed scene description for illustration"
  }
]`
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 1500
  })

  const storyContent = JSON.parse(storyResponse.choices[0].message.content || '{"pages": []}')
  
  return {
    title,
    pages: storyContent.pages
  }
} 