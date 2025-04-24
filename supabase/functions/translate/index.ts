import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { openai, supabaseAdmin } from '../_shared/config.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface TranslationParams {
  text: string
  targetLanguage: string
  userId: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, targetLanguage, userId } = await req.json() as TranslationParams

    // Check if translation exists in cache
    const { data: cachedTranslation, error: cacheError } = await supabaseAdmin
      .from('translations')
      .select('translated_text')
      .eq('user_id', userId)
      .eq('original_text', text)
      .eq('target_language', targetLanguage)
      .single()

    if (!cacheError && cachedTranslation) {
      return new Response(
        JSON.stringify({ translation: cachedTranslation.translated_text }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Generate translation using OpenAI
    const prompt = `Translate the following text to ${targetLanguage}. Maintain the same tone and style. Only return the translation, no explanations:

${text}`

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    })

    const translation = completion.choices[0]?.message?.content?.trim()

    if (!translation) {
      throw new Error('Failed to generate translation')
    }

    // Cache the translation
    const { error: insertError } = await supabaseAdmin
      .from('translations')
      .insert({
        user_id: userId,
        original_text: text,
        target_language: targetLanguage,
        translated_text: translation,
      })

    if (insertError) {
      throw insertError
    }

    return new Response(
      JSON.stringify({ translation }),
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