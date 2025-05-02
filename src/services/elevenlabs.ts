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
}

export const AVAILABLE_VOICES: Voice[] = [
  { id: 'KoVIHoyLDrQyd4pGalbs', name: 'Autumn', description: 'Soft, clear narrative female', flag: '🇺🇸', requiresVip: false },
  { id: 'j05EIz3iI3JmBTWC3CsA', name: 'Laura', description: 'ASMR soothing female', flag: '🇺🇸', requiresVip: false },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', description: 'Deep and authoritative', flag: '🇺🇸', requiresVip: false },
  { id: 'KStQ5J0QpMyuoKkTnbDO', name: 'Bill', description: 'Calm and soothing male', flag: '🇺🇸', requiresVip: false },
  { id: 'NFG5qt843uXKj4pFvR7C', name: 'Adam', description: 'Deep British male', flag: '🇬🇧', requiresVip: false },
  { id: 'xctasy8XvGp2cVO9HL9k', name: 'Allisson', description: 'Emotional and expressive millennial female', flag: '🇺🇸', requiresVip: false },
  { id: 'P7x743VjyZEOihNNygQ9', name: 'Dakota', description: 'Middle-aged African-American female', flag: '🇺🇸 🇿🇦', requiresVip: false },
  { id: 'c51VqUTljshmftbhJEGm', name: 'Emily', description: 'Young friendly female', flag: '🇺🇸', requiresVip: false },
  { id: 'j9jfwdrw7BRfcR43Qohk', name: 'Frederick', description: 'Professional, well-spoken British male', flag: '🇬🇧', requiresVip: false },
  { id: 'EiNlNiXeDU1pqqOPrYMO', name: 'John', description: 'Narrative middle-aged male', flag: '🇺🇸', requiresVip: false },
  { id: 'D9oXHIyU6iZzDJNymrTO', name: 'Jason', description: 'Neutral, clear Australian male', flag: '🇦🇺', requiresVip: false },
  { id: 'BfBBfKwsELqRpyPHjugT', name: 'Agatka', description: 'Polish bright and cheerful female with clear voice', flag: '🇵🇱', requiresVip: true },
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