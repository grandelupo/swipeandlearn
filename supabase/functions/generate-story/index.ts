import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { openai, supabaseAdmin } from '../_shared/config.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { generateTitle, generateOutline, generatePage } from './utils/generators.ts'
import { CEFR_GUIDELINES } from './utils/constants.ts'

interface StoryGenerationParams {
  language: string
  difficulty: keyof typeof CEFR_GUIDELINES
  theme: string
  targetWords?: string[]
  pageNumber?: number
  previousPages?: string[]
  storyId?: string
  userId: string
  generateCache?: boolean
  authorStyle?: string
}

interface FullStoryGenerationParams {
  language: string
  difficulty: keyof typeof CEFR_GUIDELINES
  theme: string
  targetWords?: string[]
  title?: string
  userId: string
  generateCover?: boolean
  authorStyle?: string
}

const OUTLINE_PAGE_RANGE = 7

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const path = new URL(req.url).pathname
    const isFullStory = path.endsWith('/generate-full-story')
    const params = await req.json()

    // Get user's preferred model
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('preferred_model')
      .eq('id', params.userId)
      .single()

    if (profileError) throw profileError
    const useGrok = profile?.preferred_model === 'grok'
    const generationModel = useGrok ? 'grok' : 'gpt-4'

    if (isFullStory) {
      const { 
        language, 
        difficulty, 
        theme, 
        targetWords, 
        title, 
        userId, 
        generateCover,
        authorStyle
      } = params as FullStoryGenerationParams

      // Generate or use provided title
      const storyTitle = title || await generateTitle(
        language, 
        difficulty, 
        useGrok,
        theme,
        targetWords,
        authorStyle || 'Default'
      )

      // Create new story in database
      const { data: story, error: storyError } = await supabaseAdmin
        .from('stories')
        .insert({
          title: storyTitle,
          language,
          total_pages: 0,
          user_id: userId,
          theme: theme || null,
          difficulty,
          generation_model: generationModel,
          author_style: authorStyle || 'Default'
        })
        .select()
        .single()

      if (storyError) throw storyError

      // Generate cover image if requested
      let coverUrl = null
      if (generateCover) {
        try {
          const { data: coverData, error: coverError } = await supabaseAdmin.functions.invoke('generate-image', {
            body: { theme: theme || 'fantasy story', title: storyTitle, storyId: story.id }
          })
          if (!coverError && coverData) {
            coverUrl = coverData.imageUrl
            await supabaseAdmin
              .from('stories')
              .update({ cover_image_url: coverUrl })
              .eq('id', story.id)
          }
        } catch (coverError) {
          console.error('Error generating cover:', coverError)
        }
      }

      // Generate initial outline
      const initialOutline = await generateOutline(
        language,
        difficulty,
        useGrok,
        1,
        theme,
        targetWords,
        authorStyle || 'Default',
        []
      )

      // Store the initial outline
      const { error: outlineError } = await supabaseAdmin
        .from('story_outlines')
        .insert({
          story_id: story.id,
          start_page: 1,
          end_page: OUTLINE_PAGE_RANGE,
          outline: initialOutline
        })

      if (outlineError) throw outlineError

      // Generate first page
      const firstPageContent = await generatePage(
        language,
        difficulty,
        1,
        initialOutline,
        useGrok,
        targetWords,
        [],
        authorStyle || 'Default'
      )

      // Insert first page
      const { error: pageError } = await supabaseAdmin
        .from('story_pages')
        .insert({
          story_id: story.id,
          page_number: 1,
          content: firstPageContent,
          target_words: targetWords
        })

      if (pageError) throw pageError

      // Update total pages
      const { error: updateError } = await supabaseAdmin
        .from('stories')
        .update({ total_pages: 1 })
        .eq('id', story.id)

      if (updateError) throw updateError

      return new Response(
        JSON.stringify({
          storyId: story.id,
          title: storyTitle,
          coverUrl,
          firstPage: firstPageContent
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } else {
      // Original story generation logic
      const { language, difficulty, theme, targetWords, pageNumber = 1, previousPages = [], storyId, userId, generateCache, authorStyle } = params as StoryGenerationParams

      if (pageNumber === 0) {
        // Generate title
        const content = await generateTitle(language, difficulty, useGrok)

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
            author_style: authorStyle || 'Default'
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

        // Calculate the outline range for the current page
        const outlineStartPage = Math.floor((pageNumber - 1) / OUTLINE_PAGE_RANGE) * OUTLINE_PAGE_RANGE + 1
        const outlineEndPage = outlineStartPage + OUTLINE_PAGE_RANGE - 1

        // Get existing outlines for this story
        const { data: existingOutlines, error: outlinesError } = await supabaseAdmin
          .from('story_outlines')
          .select('*')
          .eq('story_id', storyId)
          .order('start_page', { ascending: true })

        if (outlinesError) throw outlinesError

        // Find the outline for the current page range
        let currentOutline = existingOutlines?.find(outline => 
          outline.start_page === outlineStartPage && outline.end_page === outlineEndPage
        )

        // If no outline exists for this range, generate a new one
        if (!currentOutline) {
          const previousOutlines = existingOutlines?.filter(outline => 
            outline.start_page < outlineStartPage
          ) || []

          const newOutline = await generateOutline(
            language,
            difficulty,
            useGrokForPage,
            outlineStartPage,
            theme,
            targetWords,
            authorStyle || 'Default',
            previousOutlines
          )

          // Store the new outline
          const { data: savedOutline, error: saveError } = await supabaseAdmin
            .from('story_outlines')
            .insert({
              story_id: storyId,
              start_page: outlineStartPage,
              end_page: outlineEndPage,
              outline: newOutline
            })
            .select()
            .single()

          if (saveError) throw saveError
          currentOutline = savedOutline
        }

        console.log('generation params', {
          language,
          difficulty,
          pageNumber,
          currentOutline,
          useGrokForPage,
          targetWords,
          authorStyle
        })

        // Generate story page
        const content = await generatePage(
          language,
          difficulty,
          pageNumber,
          currentOutline.outline,
          useGrokForPage,
          targetWords,
          previousPages,
          authorStyle || 'Default'
        )

        if (!storyId) {
          throw new Error('Story ID is required for generating pages')
        }

        // Check if page already exists
        const { data: existingPage, error: existingPageError } = await supabaseAdmin
          .from('story_pages')
          .select('*')
          .eq('story_id', storyId)
          .eq('page_number', pageNumber)
          .single()

        if (existingPageError && existingPageError.code !== 'PGRST116') { // PGRST116 is "not found" error
          throw existingPageError
        }

        // If page exists, return existing page
        if (existingPage) {
          // Make sure the page is marked as not cached
          const { error: updateError } = await supabaseAdmin
            .from('story_pages')
            .update({ is_cached: false })
            .eq('story_id', storyId)
            .eq('page_number', pageNumber)

          if (updateError) throw updateError

          return new Response(
            JSON.stringify({
              content: existingPage.content,
              target_words: existingPage.target_words,
              page_number: existingPage.page_number,
              is_cached: existingPage.is_cached
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        }

        // Insert new page
        const { error: pageError, data: pageData } = await supabaseAdmin
          .from('story_pages')
          .insert({
            story_id: storyId,
            page_number: pageNumber,
            content: content,
            target_words: targetWords,
            is_cached: generateCache || false
          })
          .select()
          .single()

        if (pageError) throw pageError

        // Only update total_pages if this is not a cached page
        if (!generateCache) {
          const { error: storyError } = await supabaseAdmin
            .from('stories')
            .update({ total_pages: pageNumber })
            .eq('id', storyId)

          if (storyError) throw storyError
        }

        return new Response(
          JSON.stringify({
            content,
            target_words: targetWords,
            page_number: pageNumber,
            is_cached: generateCache || false
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }
    }
  } catch (error) {
    console.error('error', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}) 