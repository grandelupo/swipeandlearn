import { CEFR_GUIDELINES } from '../utils/constants.ts'

export const generateTitlePrompt = (language: string, difficulty: string, guidelines: typeof CEFR_GUIDELINES[keyof typeof CEFR_GUIDELINES]) => `
Create a short, captivating title for a story in ${language} at CEFR level ${difficulty}. The title should be evocative and hint at the story's core conflict or theme.

Guidelines for ${difficulty} level:
- Vocabulary: ${guidelines.vocabulary}
- Grammar: ${guidelines.grammar}
- Complexity: ${guidelines.complexity}

Style: Write in a Hemingway-inspired style - use short, declarative sentences, focus on concrete details, and emphasize action and dialogue. Avoid flowery language and excessive description.

The title should be 2-6 words long and make readers curious to discover what happens in the story. Only respond with the title, no additional formatting or metadata. Make sure the title is less than 50 characters.`

export const generateOutlinePrompt = (
  language: string,
  difficulty: string,
  guidelines: typeof CEFR_GUIDELINES[keyof typeof CEFR_GUIDELINES],
  startPage: number,
  previousOutlines?: { start_page: number; end_page: number; outline: string }[]
) => `
Create a detailed outline for a ${difficulty}-level story in ${language}. The story should be engaging, with clear plot progression and character development.

${previousOutlines?.length ? `Previous story outlines:
${previousOutlines.map(outline => `Pages ${outline.start_page}-${outline.end_page}:
${outline.outline}`).join('\n\n')}

Continue the story from where the previous outline ended, maintaining consistency with the established plot and characters.` : ''}

Guidelines for ${difficulty} level:
- Vocabulary: ${guidelines.vocabulary}
- Grammar: ${guidelines.grammar}
- Complexity: ${guidelines.complexity}

Style: Write in a Hemingway-inspired style - use short, declarative sentences, focus on concrete details, and emphasize action and dialogue. Avoid flowery language and excessive description.

Create an outline with 5-7 key scenes/events, each corresponding to a page. For each scene:
1. Specify the main action or event
2. Note key character interactions
3. Include any important plot developments
4. Indicate the emotional tone
5. Specify how it connects to the next scene

Format the response as a numbered list of scenes, with each scene clearly marked for its page number.`

export const generatePagePrompt = (
  language: string,
  difficulty: string,
  guidelines: typeof CEFR_GUIDELINES[keyof typeof CEFR_GUIDELINES],
  pageNumber: number,
  storyOutline: string,
  targetWords?: string[],
  previousPages?: string[]
) => `
Write page ${pageNumber} of a story in ${language} at CEFR level ${difficulty}. Follow the story outline provided and maintain a Hemingway-inspired style.

Story Outline:
${storyOutline}

Guidelines for ${difficulty} level:
- Vocabulary: ${guidelines.vocabulary}
- Grammar: ${guidelines.grammar}
- Complexity: ${guidelines.complexity}

Style Guidelines:
- Use short, declarative sentences
- Focus on concrete details and actions
- Emphasize dialogue and character interactions
- Avoid flowery language and excessive description
- Show, don't tell
- Use the "iceberg theory" - imply deeper meanings through surface details

${targetWords?.length ? `Target words to incorporate naturally: ${targetWords.join(', ')}` : ''}

${previousPages?.length ? `Previous pages:\n${previousPages.join('\n\n')}` : ''}

Write a compelling continuation that:
1. Follows the outline for this page
2. Maintains consistent difficulty level (${difficulty})
3. Uses language appropriate for ${difficulty} level
4. Naturally incorporates target words if provided
5. Connects logically to previous pages if provided
6. Creates strong emotional engagement through:
   - Clear character actions and reactions
   - Meaningful dialogue
   - Concrete sensory details
   - Tension and conflict
7. Ends with a hook that makes readers eager to continue
8. Keeps each page to about 100-150 words

Response should be just the story text, no additional formatting or metadata.` 