# Referral Code System

A simple referral code system for Swipe and Learn that allows influencers to earn 10% commission on their referrals' transactions.

## Features

- **Referral Code Generation**: Each influencer gets a unique 6-character referral code
- **Registration Integration**: Users can enter referral codes during registration
- **Commission Tracking**: 10% commission on all transactions from referred users
- **Influencer Dashboard**: Web panel for influencers to track earnings
- **Transaction Recording**: Automatic tracking of purchases and subscriptions

## Database Schema

### Tables

1. **referral_codes**: Stores influencer referral codes
   - `id`: UUID primary key
   - `code`: Unique 6-character code
   - `influencer_user_id`: User who owns the code
   - `is_active`: Whether the code is active
   - `commission_rate`: Commission percentage (default 10%)

2. **user_referrals**: Tracks which users used which codes
   - `id`: UUID primary key
   - `user_id`: User who used the referral code
   - `referral_code_id`: The referral code used
   - `referred_at`: When the referral was made

3. **referral_earnings**: Records commission earnings
   - `id`: UUID primary key
   - `referral_code_id`: The referral code that earned
   - `referred_user_id`: User who made the transaction
   - `transaction_amount`: Amount of the transaction
   - `commission_amount`: Commission earned (10%)
   - `transaction_type`: Type of transaction (purchase, subscription, etc.)

## App Integration

### Registration

Users can enter a referral code during registration in `src/screens/auth/Register.tsx`:

```typescript
// Referral code input field
<Input
  placeholder="Optional referral code"
  value={referralCode}
  onChangeText={setReferralCode}
  autoCapitalize="characters"
/>

// Applied during registration
if (referralCode.trim()) {
  const { data: referralResult } = await supabase.rpc('use_referral_code', {
    code: referralCode.trim().toUpperCase(),
    user_id: data.user.id
  });
}
```

### Transaction Tracking

Referral earnings are automatically recorded when users make purchases:

```typescript
// In revenuecat.ts - purchasePackage function
await ReferralService.recordTransaction(
  user.id,
  packageToPurchase.rawPrice,
  'coin_purchase'
);
```

## Web Dashboard

### Access

Influencers can access their dashboard at: `/web/influencer-login.php`

### Features

- **Login**: Uses same credentials as the app
- **Dashboard**: Shows total earnings, referrals, and commission rate
- **Referral Code**: Displays and allows copying of referral code
- **Recent Earnings**: Table of recent commission earnings
- **Statistics**: Total earnings and referral count

### Files

- `web/influencer-login.php`: Login page
- `web/influencer-dashboard.php`: Main dashboard
- `web/config.php`: Supabase configuration

## API Functions

### Database Functions

1. **generate_referral_code()**: Creates unique 6-character codes
2. **create_referral_code_for_user(user_id)**: Creates code for specific user
3. **use_referral_code(code, user_id)**: Validates and applies referral code
4. **record_referral_earning(user_id, amount, type)**: Records transaction and commission
5. **get_influencer_earnings(user_id)**: Gets earnings summary for influencer

### Service Functions

```typescript
// ReferralService class methods
ReferralService.recordTransaction(userId, amount, type)
ReferralService.getInfluencerStats(userId)
ReferralService.getRecentEarnings(userId, limit)
ReferralService.createReferralCode(userId)
ReferralService.getUserReferralCode(userId)
ReferralService.validateReferralCode(code)
```

## Security

- **Row Level Security (RLS)**: All tables have appropriate policies
- **Authentication**: Web dashboard uses Supabase Auth
- **Validation**: Referral codes are validated before use
- **Prevention**: Users cannot use their own referral codes

## Commission Structure

- **Rate**: 10% of transaction amount
- **Transaction Types**: 
  - `coin_purchase`: Coin package purchases
  - `subscription`: Subscription payments
  - `purchase`: Other purchases

## Setup Instructions

1. **Run Migration**: Execute `supabase/migrations/20250117000000_create_referral_system.sql`
2. **Configure Web**: Set up Supabase credentials in `web/config.php`
3. **Test Registration**: Try registering with a referral code
4. **Test Dashboard**: Login to influencer dashboard

## Usage Flow

1. **Influencer Registration**: User registers normally in the app
2. **Code Generation**: System automatically creates referral code
3. **Code Sharing**: Influencer shares their code with others
4. **User Registration**: New user enters referral code during registration
5. **Transaction Tracking**: When referred user makes purchases, commission is recorded
6. **Earnings View**: Influencer can view earnings in web dashboard

## Future Enhancements

- **Payout System**: Automated payments to influencers
- **Analytics**: Detailed referral analytics and reporting
- **Tiered Commissions**: Different rates based on performance
- **Referral Links**: Direct links instead of just codes
- **Social Sharing**: Built-in social media sharing 