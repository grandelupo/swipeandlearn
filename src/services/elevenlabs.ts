import { EXPO_PUBLIC_ELEVENLABS_API_KEY } from '@env';
import { supabase } from './supabase';
import { Buffer } from 'buffer';

export type VoiceId = string;

export interface Voice {
  id: VoiceId;
  name: string;
  description: string;
}

export const AVAILABLE_VOICES: Voice[] = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Warm and neutral voice' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', description: 'Deep and authoritative voice' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', description: 'Well-rounded and balanced voice' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', description: 'Young and friendly voice' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', description: 'Emotional and expressive voice' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', description: 'Soft and soothing voice' },
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