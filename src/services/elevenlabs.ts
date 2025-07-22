import { EXPO_PUBLIC_ELEVENLABS_API_KEY } from '@env';
import { supabase } from './supabase';
import { Buffer } from 'buffer';

export type VoiceId = string;

export interface Voice {
  id: VoiceId;
  name: string;
  description: string;
  flag: string;
  requiresVip: boolean;
  language: string; // ISO code, e.g., 'en', 'de', 'it', 'es', 'pl', 'uk'
}

export const AVAILABLE_VOICES: Voice[] = [
  { id: 'KoVIHoyLDrQyd4pGalbs', name: 'Autumn', description: 'Soft, clear narrative female', flag: '🇺🇸', requiresVip: false, language: 'en' },
  { id: 'j05EIz3iI3JmBTWC3CsA', name: 'Laura', description: 'ASMR soothing female', flag: '🇺🇸', requiresVip: false, language: 'en' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', description: 'Deep and authoritative', flag: '🇺🇸', requiresVip: false, language: 'en' },
  { id: 'KStQ5J0QpMyuoKkTnbDO', name: 'Bill', description: 'Calm and soothing male', flag: '🇺🇸', requiresVip: false, language: 'en' },
  { id: 'NFG5qt843uXKj4pFvR7C', name: 'Adam', description: 'Deep British male', flag: '🇬🇧', requiresVip: false, language: 'en' },
  { id: 'xctasy8XvGp2cVO9HL9k', name: 'Allisson', description: 'Emotional and expressive millennial female', flag: '🇺🇸', requiresVip: false, language: 'en' },
  { id: 'P7x743VjyZEOihNNygQ9', name: 'Dakota', description: 'Middle-aged African-American female', flag: '🇺🇸 🇿🇦', requiresVip: false, language: 'en' },
  { id: 'c51VqUTljshmftbhJEGm', name: 'Emily', description: 'Young friendly female', flag: '🇺🇸', requiresVip: false, language: 'en' },
  { id: 'j9jfwdrw7BRfcR43Qohk', name: 'Frederick', description: 'Professional, well-spoken British male', flag: '🇬🇧', requiresVip: false, language: 'en' },
  { id: 'EiNlNiXeDU1pqqOPrYMO', name: 'John', description: 'Narrative middle-aged male', flag: '🇺🇸', requiresVip: false, language: 'en' },
  { id: 'D9oXHIyU6iZzDJNymrTO', name: 'Jason', description: 'Neutral, clear Australian male', flag: '🇦🇺', requiresVip: false, language: 'en' },
  { id: 'BfBBfKwsELqRpyPHjugT', name: 'Agatka', description: 'Polish bright and cheerful female with clear voice', flag: '🇵🇱', requiresVip: true, language: 'pl' },

  { id: 'mN2MS5qHVRhNpqcfTpaV', name: 'Karl', description: 'Deep and clear narrative male', flag: '🇩🇪', requiresVip: false, language: 'de' },
  { id: 'uvysWDLbKpA4XvpD3GI6', name: 'Leonie', description: 'Clear and professional female', flag: '🇩🇪', requiresVip: false, language: 'de' },
  { id: 'FTNCalFNG5bRnkkaP5Ug', name: 'Otto', description: 'Young and outgoing male', flag: '🇩🇪', requiresVip: false, language: 'de' },
  { id: 'VD1if7jDVYtAKs4P0FIY', name: 'Lena', description: 'Young and very friendly female', flag: '🇩🇪', requiresVip: false, language: 'de' },
  { id: 'rAmra0SCIYOxYmRNDSm3', name: 'Lana', description: 'Meditative soft female', flag: '🇩🇪', requiresVip: false, language: 'de' },
  { id: 'dCnu06FiOZma2KVNUoPZ', name: 'Mila', description: 'Young female', flag: '🇩🇪', requiresVip: false, language: 'de' },
  
  { id: 'F9w7aaEjfT09qV89OdY8', name: 'Mario', description: 'Soft male voice', flag: '🇮🇹', requiresVip: false, language: 'it' },
  { id: '13Cuh3NuYvWOVQtLbRN8', name: 'Marco', description: 'Mature and pensive male', flag: '🇮🇹', requiresVip: false, language: 'it' },
  { id: 'fzDFBB4mgvMlL36gPXcz', name: 'Giovanni', description: 'Young and friendly male', flag: '🇮🇹', requiresVip: false, language: 'it' },
  { id: 'ByVILX2H5wPAwDiNVKAR', name: 'Giuseppe', description: 'Senior expressive male', flag: '🇮🇹', requiresVip: false, language: 'it' },
  { id: 'kAzI34nYjizE0zON6rXv', name: 'Samanta', description: 'Young and friendly middle-aged female', flag: '🇮🇹', requiresVip: false, language: 'it' },

  { id: 'Vpv1YgvVd6CHIzOTiTt8', name: 'Martin', description: 'Very deep and slow Spanish male', flag: '🇪🇸', requiresVip: false, language: 'es' },
  { id: 'SKjgN71N3MeGl4r2JbRt', name: 'Bruno', description: 'Fast and neutral male', flag: '🇪🇸', requiresVip: false, language: 'es' },
  { id: '7UB6WMKyZDj19XRGC8Sb', name: 'Roberto', description: 'Middle-aged interested narrative male', flag: '🇪🇸', requiresVip: false, language: 'es' },
  { id: 'eBthAb30UYbt2nojGXeA', name: 'Regina', description: 'Elderly and composed female', flag: '🇪🇸', requiresVip: false, language: 'es' },
  { id: 'g10k86KeEUyBqW9lcKYg', name: 'Rosa', description: 'Young and friendly female', flag: '🇪🇸', requiresVip: false, language: 'es' },
  { id: '9EU0h6CVtEDS6vriwwq5', name: 'Sofia', description: 'Young and seductive female', flag: '🇪🇸', requiresVip: false, language: 'es' },

  { id: 'nCqaTnIbLdME87OuQaZY', name: 'Vira', description: 'Ukrainian middle-aged female', flag: '🇺🇦', requiresVip: false, language: 'uk' },
  { id: 'Ntd0iVwICtUtA6Fvx27M', name: 'Oleksandr', description: 'Ukrainian middle-aged composed male', flag: '🇺🇦', requiresVip: false, language: 'uk' },
  { id: 'GVRiwBELe0czFUAJj0nX', name: 'Anton', description: 'Energetic male', flag: '🇺🇦', requiresVip: false, language: 'uk' },
];

export async function generateSpeech(text: string, voiceId: VoiceId): Promise<string> {
  console.log('Generating speech for text:', text.substring(0, 50) + '...');
  console.log('Using voice:', voiceId);
  console.log('API Key:', EXPO_PUBLIC_ELEVENLABS_API_KEY ? 'Present' : 'Missing');

  if (!EXPO_PUBLIC_ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key is not configured');
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': EXPO_PUBLIC_ELEVENLABS_API_KEY,
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
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('ElevenLabs API error:', errorText);
    throw new Error(`Failed to generate speech: ${response.status} ${response.statusText}`);
  }

  // Get the audio data as an array buffer
  const arrayBuffer = await response.arrayBuffer();
  // Convert to base64
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  return base64;
}

export async function uploadAudioToStorage(base64Audio: string): Promise<string> {
  // Generate a unique filename
  const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.mp3`;
  
  // Convert base64 to Uint8Array
  const binaryData = Buffer.from(base64Audio, 'base64');
  
  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('audio-recordings')
    .upload(filename, binaryData, {
      contentType: 'audio/mpeg'
    });

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('audio-recordings')
    .getPublicUrl(filename);

  return publicUrl;
} 