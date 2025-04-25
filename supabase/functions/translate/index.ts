import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { openai, supabaseAdmin, generateWithGrok } from '../_shared/config.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface TranslationParams {
  text: string
  targetLanguage: string
  userId: string
  storyId: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, targetLanguage, userId, storyId } = await req.json() as TranslationParams

    console.log('text', text);
    console.log('targetLanguage', targetLanguage);
    console.log('userId', userId);
    console.log('storyId', storyId);

    // Get story's generation model
    const { data: story, error: storyError } = await supabaseAdmin
      .from('stories')
      .select('generation_model')
      .eq('id', storyId)
      .single()

    if (storyError) throw storyError
    const useGrok = story.generation_model === 'grok'

    // Check if translation exists in cache
    const { data: cachedTranslation, error: cacheError } = await supabaseAdmin
      .from('translations')
      .select('translated_text')
      .eq('user_id', userId)
      .eq('original_text', text)
      .eq('target_language', targetLanguage)
      .single()

    console.log('cachedTranslation', cachedTranslation);

    if (!cacheError && cachedTranslation) {
      console.log('cachedTranslation found');

      return new Response(
        JSON.stringify({ translation: cachedTranslation.translated_text }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Generate translation using the same model as the story
    const prompt = `Translate the following text to ${targetLanguage}. Maintain the same tone and style. Only return the translation, no explanations:

${text}`

    console.log('prompt', prompt);

    let translation: string;

    if (useGrok) {
      translation = await generateWithGrok(prompt)
    } else {
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
      })
      translation = completion.choices[0]?.message?.content?.trim() || ''
    }

    console.log('translation', translation);

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

    console.log('insertError', insertError);

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