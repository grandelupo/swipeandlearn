import { CEFR_GUIDELINES } from '../utils/constants.ts'

export const generateTitlePrompt = (
  language: string, 
  difficulty: string, 
  guidelines: typeof CEFR_GUIDELINES[keyof typeof CEFR_GUIDELINES],
  theme: string,
  targetWords?: string[],
  authorStyle: string = 'Default'
) => `
Create a short, captivating title for a story in ${language} at CEFR level ${difficulty}. The title should be evocative and hint at the story's core conflict or theme.

Theme: ${theme}
${targetWords?.length ? `Target words to incorporate naturally: ${targetWords.join(', ')}` : ''}
Author Style: ${authorStyle}

Guidelines for ${difficulty} level:
- Vocabulary: ${guidelines.vocabulary}
- Grammar: ${guidelines.grammar}
- Complexity: ${guidelines.complexity}

The title should be 2-6 words long and make readers curious to discover what happens in the story. Only respond with the title, no additional formatting or metadata. Make sure the title is less than 50 characters.`

export const generateOutlinePrompt = (
  language: string,
  difficulty: string,
  guidelines: typeof CEFR_GUIDELINES[keyof typeof CEFR_GUIDELINES],
  startPage: number,
  theme: string,
  targetWords?: string[],
  authorStyle: string = 'Default',
  previousOutlines?: { start_page: number; end_page: number; outline: string }[],
  recentStoryOutlines?: { title: string; outline: string }[]
) => `
Create a detailed outline for a ${difficulty}-level story in ${language}. The story should be engaging, with clear plot progression and character development.

Theme: ${theme}
${targetWords?.length ? `Target words to incorporate naturally: ${targetWords.join(', ')}` : ''}
Author Style: ${authorStyle}

${previousOutlines?.length ? `Previous story outlines:
${previousOutlines.map(outline => `Pages ${outline.start_page}-${outline.end_page}:
${outline.outline}`).join('\n\n')}

Continue the story from where the previous outline ended, maintaining consistency with the established plot and characters.` : ''}

${recentStoryOutlines?.length ? `Recent story outlines to avoid similar plots:
${recentStoryOutlines.map(story => `Title: ${story.title}
Outline: ${story.outline}`).join('\n\n')}` : ''}

Guidelines for ${difficulty} level:
- Vocabulary: ${guidelines.vocabulary}
- Grammar: ${guidelines.grammar}
- Complexity: ${guidelines.complexity}

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
  previousPages?: string[],
  authorStyle: string = 'Default'
) => {
  const styleGuidelines = {
    'Default': `
Style Guidelines:
- Use clear, straightforward language
- Focus on engaging storytelling
- Balance description with action
- Create natural dialogue
- Maintain consistent tone`,
    'Ernest Hemingway': `
Style Guidelines:
- Use short, declarative sentences
- Focus on concrete details and actions
- Emphasize dialogue and character interactions
- Avoid flowery language and excessive description
- Show, don't tell
- Use the "iceberg theory" - imply deeper meanings through surface details`,
    'Terry Pratchett': `
Style Guidelines:
- Use witty, satirical humor
- Include clever wordplay and puns
- Blend fantasy with social commentary
- Create memorable, quirky characters
- Use footnotes for humorous asides
- Maintain a warm, humanistic tone`,
    'Douglas Adams': `
Style Guidelines:
- Use absurdist humor and unexpected twists
- Include clever wordplay and witty observations
- Create bizarre but logical situations
- Use dry, British humor
- Include philosophical musings
- Maintain a detached, observational tone`,
    'George Orwell': `
Style Guidelines:
- Use clear, precise language
- Focus on political and social themes
- Create stark, vivid imagery
- Use allegory and symbolism
- Maintain a serious, critical tone
- Emphasize the impact of power and control`,
    'Joan Didion': `
Style Guidelines:
- Use precise, elegant prose
- Focus on psychological depth
- Create atmospheric descriptions
- Use fragmented narrative structure
- Maintain a cool, analytical tone
- Emphasize personal and cultural observations`,
    'Adam Mickiewicz': `
Style Guidelines:
- Use rich, poetic language
- Focus on national and romantic themes
- Create vivid, emotional imagery
- Use allegory and symbolism
- Maintain a passionate, lyrical tone
- Emphasize cultural and historical elements`,
    'Alexandre Dumas': `
Style Guidelines:
- Use dramatic, sweeping prose
- Focus on adventure and intrigue
- Create vivid character descriptions
- Use detailed historical settings
- Maintain an exciting, romantic tone
- Emphasize honor and revenge themes`,
    'Vladimir Nabokov': `
Style Guidelines:
- Use intricate, layered prose
- Focus on psychological complexity
- Create vivid sensory details
- Use wordplay and literary allusions
- Maintain a precise, intellectual tone
- Emphasize the unreliable narrator`,
    'Oscar Wilde': `
Style Guidelines:
- Use witty, epigrammatic prose
- Focus on social satire
- Create elegant dialogue
- Use clever wordplay and paradoxes
- Maintain a sophisticated, ironic tone
- Emphasize aesthetic and moral themes`,
    'F. Scott Fitzgerald': `
Style Guidelines:
- Use lyrical, descriptive prose
- Focus on the American Dream
- Create vivid imagery and symbolism
- Use elegant, flowing sentences
- Maintain a nostalgic, romantic tone
- Emphasize themes of wealth and aspiration`
  }[authorStyle] || styleGuidelines['Default']

  return `
Write page ${pageNumber} of a story in ${language} at CEFR level ${difficulty}. Follow the story outline provided and maintain the style of ${authorStyle}.

Story Outline:
${storyOutline}

Guidelines for ${difficulty} level:
- Vocabulary: ${guidelines.vocabulary}
- Grammar: ${guidelines.grammar}
- Complexity: ${guidelines.complexity}

${styleGuidelines}

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
} 