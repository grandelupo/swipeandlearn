# OAuth Setup Guide for Swipe and Learn

This guide explains how to set up Google and Facebook OAuth authentication in your Supabase project.

## Prerequisites

- Supabase project with authentication enabled
- Google Cloud Console account
- Facebook Developer account

## 1. Supabase Configuration

### Enable OAuth Providers

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers**
3. Enable **Google** and **Facebook** providers

### Configure Redirect URLs

Add these redirect URLs to your OAuth providers:
- `swipeandlearn://auth/callback` (for mobile)
- `http://localhost:3000/auth/callback` (for development)

## 2. Google OAuth Setup

### Create Google OAuth App

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API**
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure the consent screen
6. Create credentials for:
   - **Application type**: Web application
   - **Authorized redirect URIs**: Add your Supabase auth callback URL

### Configure in Supabase

1. In Supabase dashboard, go to **Authentication** > **Providers** > **Google**
2. Enable Google provider
3. Add your Google OAuth credentials:
   - **Client ID**: Your Google OAuth client ID
   - **Client Secret**: Your Google OAuth client secret

## 3. Facebook OAuth Setup

### Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add **Facebook Login** product
4. Configure OAuth settings:
   - **Valid OAuth Redirect URIs**: Add your Supabase auth callback URL

### Configure in Supabase

1. In Supabase dashboard, go to **Authentication** > **Providers** > **Facebook**
2. Enable Facebook provider
3. Add your Facebook app credentials:
   - **App ID**: Your Facebook app ID
   - **App Secret**: Your Facebook app secret

## 4. Test OAuth Flow

1. Build and run your app
2. Try logging in with Google and Facebook
3. Check Supabase dashboard for new user registrations

## Troubleshooting

### Common Issues

1. **OAuth redirect mismatch**: Ensure redirect URLs match exactly
2. **App not approved**: For production, submit your app for review
3. **Scope issues**: Ensure you have the necessary permissions

### Development vs Production

- For development: Use test credentials
- For production: Use production credentials and submit apps for review

## Security Notes

- Keep your client secrets secure
- Use environment variables for sensitive data
- Regularly rotate your OAuth credentials
- Monitor OAuth usage in your provider dashboards

## Next Steps

After setting up OAuth:
1. Test the authentication flow
2. Handle user profile data
3. Implement proper error handling
4. Add logout functionality
5. Consider adding more OAuth providers if needed 