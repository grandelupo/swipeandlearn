import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { elevenLabsApiKey, supabaseAdmin } from '../_shared/config.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface AudioGenerationParams {
  text: string
  voiceId: string
  storyId: string
  pageNumber: number
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, voiceId, storyId, pageNumber } = await req.json() as AudioGenerationParams

    // Generate audio using ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsApiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`ElevenLabs API error: ${errorText}`)
    }

    // Get the audio data
    const audioArrayBuffer = await response.arrayBuffer()

    // Generate a unique filename
    const timestamp = Date.now()
    const filename = `${storyId}-${pageNumber}-${timestamp}.mp3`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('audio-recordings')
      .upload(filename, audioArrayBuffer, {
        contentType: 'audio/mpeg',
        upsert: true
      })

    if (uploadError) {
      throw uploadError
    }

    // Get the public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('audio-recordings')
      .getPublicUrl(filename)

    // Save the audio recording in the database
    const { error: insertError } = await supabaseAdmin
      .from('audio_recordings')
      .insert({
        story_id: storyId,
        page_number: pageNumber,
        voice_id: voiceId,
        audio_url: publicUrl,
        created_at: new Date().toISOString(),
      })

    if (insertError) {
      throw insertError
    }

    return new Response(
      JSON.stringify({ audioUrl: publicUrl }),
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