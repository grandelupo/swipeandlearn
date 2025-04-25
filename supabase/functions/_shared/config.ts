import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
})

// Initialize Grok API key
const grokApiKey = Deno.env.get('XAI_API_KEY')

// Initialize ElevenLabs API key
const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')

// Initialize Supabase admin client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

// Function to generate content with Grok
async function generateWithGrok(prompt: string): Promise<string> {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${grokApiKey}`,
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
      model: 'grok-3-beta',
    }),
  })

  console.log('response', response)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Grok API error: ${response.status} ${response.statusText}\n${errorText}`)
  }

  const data = await response.json()
  console.log('data', data)
  return data.choices[0]?.message?.content?.trim() || 'Error generating content.'
}

export { openai, elevenLabsApiKey, supabaseAdmin, generateWithGrok } 