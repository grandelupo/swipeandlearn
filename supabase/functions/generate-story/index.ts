import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { openai, supabaseAdmin, generateWithGrok } from '../_shared/config.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface StoryGenerationParams {
  language: string
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Divine'
  theme: string
  targetWords?: string[]
  pageNumber?: number
  previousPages?: string[]
  storyId?: string
  userId: string
}

const CEFR_GUIDELINES = {
  A1: {
    vocabulary: 'Use only the most basic and common words. Focus on concrete, everyday objects and simple actions.',
    grammar: 'Use simple present tense, basic subject-verb-object sentences. Avoid complex structures.',
    complexity: 'Keep sentences very short and simple. Use basic conjunctions (and, but).',
  },
  A2: {
    vocabulary: 'Use common, everyday vocabulary. Introduce some basic descriptive words.',
    grammar: 'Use simple present and past tenses. Introduce basic prepositions and articles.',
    complexity: 'Use short, connected sentences. Introduce because, when, then.',
  },
  B1: {
    vocabulary: 'Use intermediate vocabulary. Include some idiomatic expressions.',
    grammar: 'Use present, past, and future tenses. Include some modal verbs.',
    complexity: 'Create compound sentences. Use relative clauses and basic subordination.',
  },
  B2: {
    vocabulary: 'Use varied vocabulary. Include abstract concepts and specialized terms.',
    grammar: 'Use all tenses confidently. Include passive voice and conditionals.',
    complexity: 'Create complex sentences. Use varied conjunctions and transitions.',
  },
  C1: {
    vocabulary: 'Use sophisticated vocabulary. Include nuanced expressions and colloquialisms.',
    grammar: 'Use advanced grammatical structures. Include all tenses and aspects.',
    complexity: 'Create sophisticated sentence structures. Use advanced literary devices.',
  },
  C2: {
    vocabulary: 'Use precise and nuanced vocabulary. Include rare words and academic language.',
    grammar: 'Master all grammatical structures. Include complex tenses and aspects.',
    complexity: 'Create elegant and varied sentence structures. Use advanced rhetorical devices.',
  },
  Divine: {
    vocabulary: 'Use archaic, esoteric, and philosophical terminology. Include rare literary allusions.',
    grammar: 'Transcend conventional grammar. Employ experimental syntax.',
    complexity: 'Create labyrinthine sentences with multiple layers of meaning.',
  },
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { language, difficulty, theme, targetWords, pageNumber = 1, previousPages = [], storyId, userId } = await req.json() as StoryGenerationParams
    const guidelines = CEFR_GUIDELINES[difficulty]

    // Get user's preferred model
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('preferred_model')
      .eq('id', userId)
      .single()

    if (profileError) throw profileError
    const useGrok = profile?.preferred_model === 'grok'
    const generationModel = useGrok ? 'grok' : 'gpt-4'

    let prompt: string
    let content: string
    
    if (pageNumber === 0) {
      // Generate title
      prompt = `Create a short, engaging title for a language learning story in ${language} at CEFR level ${difficulty}.
${theme !== 'free form' ? `Theme: ${theme}` : 'Create any engaging theme appropriate for language learners.'}
${targetWords?.length ? `Target words to incorporate if possible: ${targetWords.join(', ')}` : ''}

Guidelines for ${difficulty} level:
- Vocabulary: ${guidelines.vocabulary}
- Grammar: ${guidelines.grammar}
- Complexity: ${guidelines.complexity}

The title should be 2-6 words long and appropriate for language learners at ${difficulty} level.`

      if (useGrok) {
        content = await generateWithGrok(prompt)
      } else {
        const completion = await openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 50,
        })
        content = completion.choices[0]?.message?.content?.trim() || 'Untitled Story'
      }

      // Create new story in database
      const { data: story, error: storyError } = await supabaseAdmin
        .from('stories')
        .insert({
          title: content,
          language,
          total_pages: 0,
          user_id: userId,
          theme: theme || null,
          difficulty,
          generation_model: generationModel,
        })
        .select()
        .single()

      if (storyError) throw storyError

      return new Response(
        JSON.stringify({ content, storyId: story.id }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    } else {
      // Get story's generation model
      const { data: story, error: storyError } = await supabaseAdmin
        .from('stories')
        .select('generation_model')
        .eq('id', storyId)
        .single()

      if (storyError) throw storyError
      const useGrokForPage = story.generation_model === 'grok'

      // Generate story page
      prompt = `Create page ${pageNumber} of a language learning story in ${language} at CEFR level ${difficulty}.
${theme !== 'free form' ? `Theme: ${theme}` : 'Create any engaging theme appropriate for language learners.'}
${targetWords?.length ? `Target words to incorporate naturally: ${targetWords.join(', ')}` : ''}

Guidelines for ${difficulty} level:
- Vocabulary: ${guidelines.vocabulary}
- Grammar: ${guidelines.grammar}
- Complexity: ${guidelines.complexity}

${previousPages.length ? `Previous pages:\n${previousPages.join('\n\n')}` : ''}

Write a coherent continuation of the story that:
1. Maintains consistent difficulty level (${difficulty})
2. Uses language appropriate for ${difficulty} level learners
3. Naturally incorporates target words if provided
4. Connects logically to previous pages if provided
5. Creates engagement through appropriate storytelling
6. Keeps each page to about 100-150 words

Response should be just the story text, no additional formatting or metadata.`

      if (useGrokForPage) {
        content = await generateWithGrok(prompt)
      } else {
        const completion = await openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 500,
        })
        content = completion.choices[0]?.message?.content?.trim() || 'Error generating content.'
      }

      if (!storyId) {
        throw new Error('Story ID is required for generating pages')
      }

      // Insert new page
      const { error: pageError, data: pageData } = await supabaseAdmin
        .from('story_pages')
        .insert({
          story_id: storyId,
          page_number: pageNumber,
          content: content,
          target_words: targetWords,
        })

      console.log('pageData', pageData);

      if (pageError) throw pageError

      // Update story total pages
      const { error: updateError } = await supabaseAdmin
        .from('stories')
        .update({ total_pages: pageNumber })
        .eq('id', storyId)

      if (updateError) throw updateError
    }

    return new Response(
      JSON.stringify({ content, storyId }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
}) 