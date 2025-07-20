import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import { supabase } from './supabase';
import { statusCodes } from '@react-native-google-signin/google-signin';
import { clearStoredGuestMigrationData, isGuestUser } from './guestAuth';

// Initialize Google Sign-In
GoogleSignin.configure({
  webClientId: '766945742721-4oqhajk9miu7bloevl781rjob4svi038.apps.googleusercontent.com',
  offlineAccess: true,
  scopes: ['email', 'profile'],
});

export const OAuthService = {
  async signInWithGoogle() {
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices();

      if (GoogleSignin.hasPreviousSignIn()) {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
      }
      
      // Sign in with Google
      let userInfo;
      try {
        userInfo = await GoogleSignin.signIn();
      } catch (error: any) {
        // If user cancels the sign-in, return null
        if (error.code === statusCodes.SIGN_IN_CANCELLED || error.code === '-5') {
          console.log('Google OAuth cancelled by user');
          return null;
        }
        throw error;
      }
      
      // If no user is signed in, return null
      if (!userInfo.data) {
        return null;
      }
      
      // Get the ID token after successful sign-in
      const tokens = await GoogleSignin.getTokens();
      
      if (!tokens.idToken) {
        throw new Error('No ID token received from Google');
      }
      
      // Sign in with Supabase using the ID token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: tokens.idToken,
      });

      if (error) {
        console.error('Supabase Google OAuth error:', error);
        return null;
      }

      console.log('Google OAuth successful');
      return data;
    } catch (error: any) {
      console.error('Google OAuth error:', error);
      throw error;
    }
  },

  async signInWithFacebook() {
    try {
      // Request permissions
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      
      if (result.isCancelled) {
        console.log('Facebook OAuth cancelled by user');
        return null;
      }
      
      // Get the access token
      const accessTokenData = await AccessToken.getCurrentAccessToken();
      
      if (!accessTokenData) {
        throw new Error('Failed to get Facebook access token');
      }

      // Sign in with Supabase using the access token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'facebook',
        token: accessTokenData.accessToken,
      });

      if (error) {
        console.error('Supabase Facebook OAuth error:', error);
        throw error;
      }

      console.log('Facebook OAuth successful');
      return data;
    } catch (error: any) {
      console.error('Facebook OAuth error:', error);
      throw error;
    }
  },

  async signOut() {
    try {
      // Check if current user is a guest before signing out
      const { data: { user } } = await supabase.auth.getUser();
      const isGuest = user && isGuestUser(user.email);
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Sign out from Google
      try {
        await GoogleSignin.signOut();
      } catch (error) {
        console.log('Google sign out error:', error);
      }
      
      // Sign out from Facebook
      try {
        LoginManager.logOut();
      } catch (error) {
        console.log('Facebook sign out error:', error);
      }
      
      // If the user was NOT a guest, clear any stored migration data
      // This prevents data from being copied to new accounts when regular users sign out
      if (!isGuest) {
        await clearStoredGuestMigrationData();
        console.log('Cleared stored migration data for regular user OAuth logout');
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },
}; 