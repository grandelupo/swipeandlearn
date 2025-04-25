import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { openai, supabaseAdmin, generateWithGrok } from '../_shared/config.ts'
import { corsHeaders } from '../_shared/cors.ts'
import OpenAI from 'https://esm.sh/openai@4'

// Create a separate client for xAI
const xai = new OpenAI({
  apiKey: Deno.env.get('XAI_API_KEY'),
  baseURL: 'https://api.x.ai/v1'
})

interface ImageGenerationParams {
  theme: string
  title: string
  storyId: string
}

serve(async (req) => {
  console.log('Received request:', req.method)
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Parsing request body')
    const { theme, title, storyId } = await req.json() as ImageGenerationParams
    console.log('Request params:', { theme, title, storyId })

    // Get story's generation model
    const { data: story, error: storyError } = await supabaseAdmin
      .from('stories')
      .select('generation_model')
      .eq('id', storyId)
      .single()

    if (storyError) throw storyError
    const useGrok = story.generation_model === 'grok'

    // Generate the image prompt using the same model as the story
    const basePrompt = `Create a beautiful, appropriate book cover for a language learning story titled "${title}" with theme "${theme}". The style should be engaging and suitable for all ages. Make sure no to include any text, words or letters on the cover.`
    
    let imagePrompt: string
    if (useGrok) {
      console.log('Generating image prompt with Grok')
      imagePrompt = await generateWithGrok(
        `You are a professional book cover designer. Create a detailed prompt for an AI image generator to create a book cover. Base prompt: ${basePrompt}\nMake the prompt more specific and artistic, but keep the core requirements. Return only the prompt text. Make sure the prompt is no longer than 1024 characters.`
      )
      imagePrompt = imagePrompt.slice(0, 1024)
    } else {
      imagePrompt = basePrompt
    }
    console.log('Final image prompt:', imagePrompt)

    // Generate image with either xAI or DALL-E based on the story's model
    console.log(`Generating image with ${useGrok ? 'xAI' : 'DALL-E'}`)
    const response = await (useGrok ? xai : openai).images.generate({
      model: useGrok ? "grok-2-image" : "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      ...(useGrok ? {} : { size: "1024x1024" }),
    })
    console.log('Image generation response received:', response)

    if (!response.data?.[0]?.url) {
      console.error('No image URL in response')
      throw new Error('No image URL in response')
    }

    console.log('Downloading image from URL:', response.data[0].url)
    const imageResponse = await fetch(response.data[0].url)
    const imageArrayBuffer = await imageResponse.arrayBuffer()
    console.log('Image downloaded successfully')

    const timestamp = Date.now()
    const filename = `${storyId}-${timestamp}.png`
    console.log('Generated filename:', filename)

    console.log('Uploading to Supabase Storage')
    const { error: uploadError } = await supabaseAdmin.storage
      .from('book-covers')
      .upload(filename, imageArrayBuffer, {
        contentType: 'image/png',
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw uploadError
    }
    console.log('Upload successful')

    console.log('Getting public URL for uploaded image')
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('book-covers')
      .getPublicUrl(filename)
    console.log('Public URL:', publicUrl)

    console.log('Updating story with new cover image URL')
    const { error: updateError } = await supabaseAdmin
      .from('stories')
      .update({ cover_image_url: publicUrl })
      .eq('id', storyId)

    if (updateError) {
      console.error('Update error:', updateError)
      throw updateError
    }
    console.log('Story updated successfully')

    console.log('Returning success response')
    return new Response(
      JSON.stringify({ imageUrl: publicUrl }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in image generation process:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})