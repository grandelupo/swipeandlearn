import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

export const OAuthService = {
  async signInWithGoogle() {
    try {
      const redirectUrl = makeRedirectUri({
        scheme: 'swipeandlearn',
        path: 'auth/callback',
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        throw error;
      }

      if (data.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        
        if (result.type === 'success') {
          // Parse the URL to get the auth tokens
          const url = result.url;
          const urlParts = url.split('#');
          if (urlParts.length > 1) {
            const params = new URLSearchParams(urlParts[1]);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            
            if (accessToken && refreshToken) {
              const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              
              if (sessionError) {
                throw sessionError;
              }
              
              return { success: true, data: sessionData };
            }
          }
        }
      }
      
      return { success: false, error: 'Authentication cancelled or failed' };
    } catch (error: any) {
      console.error('Google OAuth error:', error);
      return { success: false, error: error.message || 'Google authentication failed' };
    }
  },

  async signInWithFacebook() {
    try {
      const redirectUrl = makeRedirectUri({
        scheme: 'swipeandlearn',
        path: 'auth/callback',
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        throw error;
      }

      if (data.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        
        if (result.type === 'success') {
          // Parse the URL to get the auth tokens
          const url = result.url;
          const urlParts = url.split('#');
          if (urlParts.length > 1) {
            const params = new URLSearchParams(urlParts[1]);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            
            if (accessToken && refreshToken) {
              const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              
              if (sessionError) {
                throw sessionError;
              }
              
              return { success: true, data: sessionData };
            }
          }
        }
      }
      
      return { success: false, error: 'Authentication cancelled or failed' };
    } catch (error: any) {
      console.error('Facebook OAuth error:', error);
      return { success: false, error: error.message || 'Facebook authentication failed' };
    }
  },
}; 