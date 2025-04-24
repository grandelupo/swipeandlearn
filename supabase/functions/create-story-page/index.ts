import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabaseAdmin } from '../_shared/config.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface CreatePageParams {
  storyId: string
  pageNumber: number
  content: string
  targetWords: string[]
  userId: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse and validate request body
    let body: CreatePageParams
    try {
      body = await req.json()
      console.log('Received request body:', {
        storyId: body.storyId,
        pageNumber: body.pageNumber,
        contentLength: body.content?.length,
        targetWordsCount: body.targetWords?.length,
        userId: body.userId,
      })
    } catch (e) {
      console.error('Error parsing request body:', e)
      return new Response(
        JSON.stringify({ error: 'Invalid request body', details: e instanceof Error ? e.message : String(e) }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    const { storyId, content, targetWords, userId } = body

    // Validate required fields
    if (!storyId || !content || !userId) {
      const missingFields = {
        storyId: !storyId,
        content: !content,
        userId: !userId
      }
      console.error('Missing required fields:', missingFields)
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          details: missingFields
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    console.log('Checking story ownership for:', { storyId, userId })

    // Verify user owns the story
    const { data: story, error: storyCheckError } = await supabaseAdmin
      .from('stories')
      .select('user_id')
      .eq('id', storyId)
      .single()

    if (storyCheckError) {
      console.error('Error checking story ownership:', storyCheckError)
      return new Response(
        JSON.stringify({ error: 'Failed to verify story ownership', details: storyCheckError }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      )
    }

    if (!story) {
      console.error('Story not found:', storyId)
      return new Response(
        JSON.stringify({ error: 'Story not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        },
      )
    }

    if (story.user_id !== userId) {
      console.error('Unauthorized: User does not own story', { storyUserId: story.user_id, requestUserId: userId })
      return new Response(
        JSON.stringify({ error: 'Unauthorized: User does not own this story' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        },
      )
    }

    // Get the current max page number
    const { data: maxPageData, error: maxPageError } = await supabaseAdmin
      .from('story_pages')
      .select('page_number')
      .eq('story_id', storyId)
      .order('page_number', { ascending: false })
      .limit(1)
      .single()

    if (maxPageError && maxPageError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error getting max page number:', maxPageError)
      return new Response(
        JSON.stringify({ error: 'Failed to get max page number', details: maxPageError }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      )
    }

    const newPageNumber = maxPageData ? maxPageData.page_number + 1 : 1

    console.log('Creating new page:', { 
      storyId, 
      newPageNumber,
      contentPreview: content.substring(0, 50) + '...',
      targetWordsCount: targetWords?.length || 0
    })

    // Insert new page
    const { data: insertedPage, error: pageError } = await supabaseAdmin
      .from('story_pages')
      .insert({
        story_id: storyId,
        page_number: newPageNumber,
        content,
        target_words: targetWords || [],
      })
      .select()
      .single()

    if (pageError) {
      console.error('Error inserting page:', pageError)
      return new Response(
        JSON.stringify({ error: 'Failed to create new page', details: pageError }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      )
    }

    console.log('Successfully inserted page:', { 
      pageId: insertedPage?.id,
      storyId,
      newPageNumber
    })

    console.log('Updating story total pages:', { storyId, newPageNumber })

    // Update story total pages
    const { data: updatedStory, error: storyError } = await supabaseAdmin
      .from('stories')
      .update({ total_pages: newPageNumber })
      .eq('id', storyId)
      .select()
      .single()

    if (storyError) {
      console.error('Error updating story total pages:', storyError)
      return new Response(
        JSON.stringify({ error: 'Failed to update story total pages', details: storyError }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      )
    }

    console.log('Successfully updated story:', { 
      storyId,
      newTotalPages: updatedStory?.total_pages
    })

    return new Response(
      JSON.stringify({ 
        success: true,
        page: insertedPage,
        story: updatedStory
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Unexpected error in create-story-page:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
}) 