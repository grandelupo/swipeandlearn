# OAuth Setup Guide

This guide explains how to set up Google and Facebook OAuth authentication in your React Native app using the official libraries.

## Overview

The app uses:
- **Google Sign-In**: `@react-native-google-signin/google-signin` - Official Google Sign-In library
- **Facebook SDK**: `react-native-fbsdk-next` - Official Facebook SDK for React Native
- **Supabase**: For backend authentication and user management

## Prerequisites

1. **Google Cloud Console** account
2. **Facebook Developer** account
3. **Supabase** project with OAuth providers configured
4. **App uploaded to Play Store** (for production Facebook authentication on Android)

## Google Sign-In Setup

### 1. Google Cloud Console Configuration

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** and **Google Identity API**
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client IDs**

Create the following OAuth 2.0 client IDs:

#### For Android:
- **Application type**: Android
- **Package name**: `com.latovi.swipeandlearn` (from your app.config.js)
- **SHA-1 certificate fingerprint**: 
  - For development: Get from `expo start` output or `keytool -list -v -keystore ~/.android/debug.keystore`
  - For production: Get from Play Console > App Integrity > App signing key certificate

#### For iOS:
- **Application type**: iOS
- **Bundle ID**: `com.latovi.swipeandlearn` (from your app.config.js)

#### For Web (Required for ID token):
- **Application type**: Web application
- **Authorized redirect URIs**: Add your Supabase auth callback URL

### 2. Firebase Setup (Optional but Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Add Android and iOS apps to your project
4. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
5. Configure OAuth in Firebase Authentication

### 3. App Configuration

Update your `app.config.js` to include the Google Sign-In plugin:

```javascript
plugins: [
  'expo-router',
  '@react-native-google-signin/google-signin',
  'react-native-fbsdk-next',
  // ... other plugins
],
```

### 4. Code Configuration

In your OAuth service, configure Google Sign-In:

```javascript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID_HERE', // From Google Cloud Console (Web OAuth client)
  offlineAccess: true,
  scopes: ['email', 'profile'],
});
```

## Facebook Authentication Setup

### 1. Facebook Developer Console

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select existing
3. Add the Facebook Login product
4. Configure OAuth redirect URIs

### 2. Platform Configuration

#### For Android:
1. Add Android platform in Facebook app settings
2. **Package Name**: `com.latovi.swipeandlearn`
3. **Key Hash**: Convert SHA-1 certificate to Base64
   - Get SHA-1 from Play Console > App Integrity > App signing key certificate
   - Convert to Base64 and add to Facebook settings

#### For iOS:
1. Add iOS platform in Facebook app settings
2. **Bundle ID**: `com.latovi.swipeandlearn`

### 3. App Configuration

The Facebook SDK plugin is already configured in `app.config.js`. Make sure your Android app is published to Play Store for production use.

## Supabase Configuration

### 1. Enable OAuth Providers

In your Supabase dashboard:
1. Go to **Authentication** > **Providers**
2. Enable **Google** and **Facebook**
3. Add the respective client IDs and secrets

### 2. Configure Redirect URLs

Add redirect URLs for your OAuth providers:
- Google: `https://your-project.supabase.co/auth/v1/callback`
- Facebook: `https://your-project.supabase.co/auth/v1/callback`

## Implementation

### OAuth Service

The OAuth service (`src/services/oauth.ts`) provides:

- `signInWithGoogle()`: Google Sign-In flow
- `signInWithFacebook()`: Facebook Login flow
- `signOut()`: Sign out from all providers
- `getCurrentUser()`: Get current authenticated user

### Usage Example

```javascript
import { OAuthService } from '../services/oauth';

// Google Sign-In
try {
  const result = await OAuthService.signInWithGoogle();
  if (result === null) {
    // User cancelled
  } else {
    // Success - user is logged in
  }
} catch (error) {
  // Handle error
}

// Facebook Login
try {
  const result = await OAuthService.signInWithFacebook();
  if (result === null) {
    // User cancelled
  } else {
    // Success - user is logged in
  }
} catch (error) {
  // Handle error
}
```

## Build Configuration

### Android Build

For Android builds, ensure you have:
1. `google-services.json` in your project (if using Firebase)
2. Correct SHA-1 certificate fingerprints configured
3. App uploaded to Play Store for Facebook authentication

### iOS Build

For iOS builds, ensure you have:
1. `GoogleService-Info.plist` in your project (if using Firebase)
2. Correct bundle identifier configured
3. URL schemes configured for deep linking

## Testing

### Development Testing

1. **Google Sign-In**: Works in development with debug certificates
2. **Facebook Login**: Requires app to be in Facebook app review or live for production testing

### Production Testing

1. **Google Sign-In**: Requires production certificates and Play Store upload
2. **Facebook Login**: Requires app to be published and approved

## Troubleshooting

### Common Google Sign-In Issues

1. **"Developer Error" or "Invalid Client"**
   - Check that the SHA-1 certificate fingerprint is correct
   - Verify the package name matches your app configuration
   - Ensure the webClientId is correctly configured

2. **"Play Services Not Available"**
   - Ensure Google Play Services is installed and updated
   - Test on a physical device rather than emulator

3. **"Sign-In Cancelled"**
   - User cancelled the sign-in flow
   - Handle this gracefully in your app

### Common Facebook Login Issues

1. **"App Not Setup"**
   - Ensure your app is published to Play Store
   - Check that the key hash is correctly configured
   - Verify the package name matches

2. **"Login Failed"**
   - Check Facebook app configuration
   - Ensure proper permissions are requested
   - Verify the app is in the correct mode (development/live)

### Supabase Issues

1. **"Invalid Grant" or "OAuth Error"**
   - Check that redirect URLs are correctly configured
   - Verify OAuth provider settings in Supabase dashboard
   - Ensure client IDs and secrets are correct

## Security Considerations

1. **Never commit sensitive keys** to version control
2. **Use environment variables** for production configurations
3. **Configure proper redirect URIs** to prevent OAuth hijacking
4. **Validate tokens** on the server side
5. **Use HTTPS** for all OAuth redirect URIs

## Support

For additional help:
- [Google Sign-In Documentation](https://docs.expo.dev/guides/google-authentication/)
- [Facebook Login Documentation](https://docs.expo.dev/guides/facebook-authentication/)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [React Native Google Sign-In Docs](https://react-native-google-signin.github.io/docs/install)
- [React Native Facebook SDK Docs](https://github.com/thebergamo/react-native-fbsdk-next)

## Next Steps

1. Configure your OAuth providers in Google Cloud Console and Facebook Developer Console
2. Set up Supabase authentication with the provider credentials
3. Test the authentication flow in development
4. Upload your app to Play Store for production Facebook authentication
5. Test the production authentication flow 