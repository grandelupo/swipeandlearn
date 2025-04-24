import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { openai, supabaseAdmin } from '../_shared/config.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface ImageGenerationParams {
  theme: string
  title: string
  storyId: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { theme, title, storyId } = await req.json() as ImageGenerationParams

    // Generate image using DALL-E
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a beautiful, appropriate book cover for a language learning story titled "${title}" with theme "${theme}". The style should be engaging and suitable for all ages. Make sure no to include any text, words or letters on the cover.`,
      n: 1,
      size: "1024x1024",
    })

    if (!response.data?.[0]?.url) {
      throw new Error('No image URL in DALL-E response')
    }

    // Download the image from DALL-E
    const imageResponse = await fetch(response.data[0].url)
    const imageArrayBuffer = await imageResponse.arrayBuffer()

    // Generate a unique filename
    const timestamp = Date.now()
    const filename = `${storyId}-${timestamp}.png`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('book-covers')
      .upload(filename, imageArrayBuffer, {
        contentType: 'image/png',
        upsert: true
      })

    if (uploadError) {
      throw uploadError
    }

    // Get the public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('book-covers')
      .getPublicUrl(filename)

    // Update the story with new cover image URL
    const { error: updateError } = await supabaseAdmin
      .from('stories')
      .update({ cover_image_url: publicUrl })
      .eq('id', storyId)

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({ imageUrl: publicUrl }),
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