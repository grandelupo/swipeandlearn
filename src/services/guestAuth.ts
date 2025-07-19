import { supabase } from './supabase';
import * as SecureStore from 'expo-secure-store';
import { Session } from '@supabase/supabase-js';

const GUEST_TOKEN_KEY = 'guest_session_token';

// Generate a unique guest email
function generateGuestEmail(): string {
  const uuid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return `guest-${uuid}@guest.swipeandlearn`;
}

// Generate a random password for guest accounts
function generateGuestPassword(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Check if user is a guest based on email pattern
export function isGuestUser(email?: string): boolean {
  if (!email) return false;
  return email.includes('@guest.swipeandlearn');
}

// Create a new guest account
export async function createGuestAccount(): Promise<Session | null> {
  try {
    const email = generateGuestEmail();
    const password = generateGuestPassword();

    console.log('Creating guest account with email:', email);

    // Sign up the guest user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Error creating guest account:', error);
      throw error;
    }

    if (data.session) {
      // Store guest credentials securely for future use
      await SecureStore.setItemAsync(`${GUEST_TOKEN_KEY}_email`, email);
      await SecureStore.setItemAsync(`${GUEST_TOKEN_KEY}_password`, password);
      console.log('Guest account created successfully');
      return data.session;
    }

    return null;
  } catch (error) {
    console.error('Failed to create guest account:', error);
    return null;
  }
}

// Sign in with existing guest credentials
export async function signInAsGuest(): Promise<Session | null> {
  try {
    const email = await SecureStore.getItemAsync(`${GUEST_TOKEN_KEY}_email`);
    const password = await SecureStore.getItemAsync(`${GUEST_TOKEN_KEY}_password`);

    if (!email || !password) {
      console.log('No guest credentials found');
      return null;
    }

    console.log('Signing in as guest with email:', email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error signing in as guest:', error);
      // If guest credentials are invalid, clear them
      await clearGuestCredentials();
      return null;
    }

    return data.session;
  } catch (error) {
    console.error('Failed to sign in as guest:', error);
    return null;
  }
}

// Clear guest credentials
export async function clearGuestCredentials(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(`${GUEST_TOKEN_KEY}_email`);
    await SecureStore.deleteItemAsync(`${GUEST_TOKEN_KEY}_password`);
    console.log('Guest credentials cleared');
  } catch (error) {
    console.error('Error clearing guest credentials:', error);
  }
}

// Sign out guest user and prepare for registration with data preservation
export async function signOutGuestForRegistration(): Promise<void> {
  try {
    // Get current guest user data before signing out
    const { data: { user: guestUser } } = await supabase.auth.getUser();
    
    if (guestUser && isGuestUser(guestUser.email)) {
      // Store guest user information for migration
      await SecureStore.setItemAsync('guest_migration_user_id', guestUser.id);
      await SecureStore.setItemAsync('guest_migration_email', guestUser.email || '');
      
      // Get guest data preview for later use
      const preview = await getGuestMigrationPreview();
      if (preview) {
        await SecureStore.setItemAsync('guest_migration_data', JSON.stringify(preview));
      }
      
      console.log('Stored guest data for migration:', guestUser.id);
    }
    
    // Store a flag to indicate user wants to register
    await SecureStore.setItemAsync('show_register_screen', 'true');
    // Sign out the guest user
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Error signing out guest for registration:', error);
  }
}

// Check if user should be shown register screen
export async function shouldShowRegisterScreen(): Promise<boolean> {
  try {
    const showRegister = await SecureStore.getItemAsync('show_register_screen');
    if (showRegister === 'true') {
      // Clear the flag after checking
      await SecureStore.deleteItemAsync('show_register_screen');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error checking register screen flag:', error);
    return false;
  }
}

// Get or create guest session
export async function getOrCreateGuestSession(): Promise<Session | null> {
  try {
    // First try to sign in with existing guest credentials
    let session = await signInAsGuest();
    
    if (!session) {
      // If no existing guest session, create a new one
      session = await createGuestAccount();
    }

    return session;
  } catch (error) {
    console.error('Error getting or creating guest session:', error);
    return null;
  }
}

// Convert guest account to registered account with data migration
export async function convertGuestToRegistered(newEmail: string, newPassword: string): Promise<boolean> {
  try {
    // Get stored guest migration data
    const storedData = await getStoredGuestMigrationData();
    
    if (!storedData.guestUserId) {
      console.log('No stored guest data found, checking current user...');
      
      // Fallback: check if current user is a guest
      const { data: { user: currentUser } } = await supabase.auth.getUser();
             if (currentUser && isGuestUser(currentUser.email)) {
         storedData.guestUserId = currentUser.id;
         storedData.guestEmail = currentUser.email || null;
        console.log('Using current guest user:', currentUser.id);
      } else {
        throw new Error('No guest user found for migration');
      }
    }

    console.log('Converting guest user:', storedData.guestUserId, 'to registered user with email:', newEmail);

    // Create new registered user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: newEmail,
      password: newPassword,
    });

    if (signUpError) {
      throw signUpError;
    }

    if (!signUpData.user) {
      throw new Error('Failed to create new user');
    }

    const newUser = signUpData.user;
    console.log('Created new user:', newUser.id);

    // Wait a bit for the new user profile to be created
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Migrate all data from guest to new user
    const { data: migrationResult, error: migrationError } = await supabase.rpc(
      'convert_guest_to_registered_with_migration',
      {
        guest_user_id: storedData.guestUserId,
        new_user_id: newUser.id,
        new_email: newEmail,
      }
    );

    if (migrationError) {
      console.error('Migration error:', migrationError);
      throw migrationError;
    }

    console.log('Migration completed:', migrationResult);

    // Clear guest credentials and stored migration data
    await clearGuestCredentials();
    await clearStoredGuestMigrationData();

    console.log('Successfully converted guest to registered user with data migration');
    return true;
  } catch (error) {
    console.error('Error converting guest to registered user:', error);
    return false;
  }
}

// Convert guest account to registered account via OAuth with data migration
export async function convertGuestToRegisteredOAuth(newUser: any): Promise<boolean> {
  try {
    // Get the current guest user before OAuth
    const { data: { user: guestUser } } = await supabase.auth.getUser();
    if (!guestUser || !isGuestUser(guestUser.email)) {
      console.log('No guest user found or user is not a guest');
      return false;
    }

    console.log('Converting guest user via OAuth:', guestUser.id, 'to new user:', newUser.id);

    // The OAuth flow has already created the new user and signed them in
    // We need to migrate the data from the guest account
    const { data: migrationResult, error: migrationError } = await supabase.rpc(
      'convert_guest_to_registered_with_migration',
      {
        guest_user_id: guestUser.id,
        new_user_id: newUser.id,
        new_email: newUser.email,
      }
    );

    if (migrationError) {
      console.error('OAuth migration error:', migrationError);
      throw migrationError;
    }

    console.log('OAuth migration completed:', migrationResult);

    // Clear guest credentials
    await clearGuestCredentials();

    console.log('Successfully converted guest to registered user via OAuth with data migration');
    return true;
  } catch (error) {
    console.error('Error converting guest to registered user via OAuth:', error);
    return false;
  }
}

// Get migration preview for debugging
export async function getGuestMigrationPreview(): Promise<any> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !isGuestUser(user.email)) {
      return null;
    }

    const { data: preview, error } = await supabase.rpc('get_guest_migration_preview', {
      guest_user_id: user.id,
    });

    if (error) {
      throw error;
    }

    return preview;
  } catch (error) {
    console.error('Error getting migration preview:', error);
    return null;
  }
}

// Get stored guest migration data
export async function getStoredGuestMigrationData(): Promise<{
  guestUserId: string | null;
  guestEmail: string | null;
  migrationData: any | null;
}> {
  try {
    const guestUserId = await SecureStore.getItemAsync('guest_migration_user_id');
    const guestEmail = await SecureStore.getItemAsync('guest_migration_email');
    const migrationDataStr = await SecureStore.getItemAsync('guest_migration_data');
    
    let migrationData = null;
    if (migrationDataStr) {
      try {
        migrationData = JSON.parse(migrationDataStr);
      } catch (e) {
        console.error('Error parsing stored migration data:', e);
      }
    }

    return {
      guestUserId,
      guestEmail,
      migrationData
    };
  } catch (error) {
    console.error('Error getting stored guest migration data:', error);
    return {
      guestUserId: null,
      guestEmail: null,
      migrationData: null
    };
  }
}

// Clear stored guest migration data
export async function clearStoredGuestMigrationData(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync('guest_migration_user_id');
    await SecureStore.deleteItemAsync('guest_migration_email');
    await SecureStore.deleteItemAsync('guest_migration_data');
    console.log('Cleared stored guest migration data');
  } catch (error) {
    console.error('Error clearing stored guest migration data:', error);
  }
} 