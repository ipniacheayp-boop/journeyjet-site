# Payment System Setup Guide

## Overview
This OTA website supports **3 payment methods**:
1. **Card Payments** (Stripe)
2. **UPI Payments** (Razorpay)
3. **QR Code Payments** (Simulated)

## Required API Keys & Secrets

### 1. Stripe (For Card Payments)

You need to add these secrets to your Lovable Cloud environment:

- `STRIPE_SECRET_KEY` - Your Stripe secret key (starts with `sk_live_` or `sk_test_`)
- `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key (starts with `pk_live_` or `pk_test_`)
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook signing secret (starts with `whsec_`)

**Where to get them:**
1. Go to https://dashboard.stripe.com/apikeys
2. Copy your publishable and secret keys
3. For webhook secret:
   - Go to https://dashboard.stripe.com/webhooks
   - Click "Add endpoint"
   - Set URL to: `https://qgmhqhejoilexhgwdujl.supabase.co/functions/v1/stripe-webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy the signing secret

### 2. Razorpay (For UPI Payments)

You need to add these secrets:

- `RAZORPAY_KEY_ID` - Your Razorpay key ID
- `RAZORPAY_KEY_SECRET` - Your Razorpay key secret

**Where to get them:**
1. Sign up at https://razorpay.com
2. Go to Settings → API Keys
3. Generate keys for Live or Test mode
4. Copy both Key ID and Key Secret

**IMPORTANT FOR INDIA:**
- Razorpay is only available for businesses registered in India
- You need to complete KYC verification
- UPI payments require activation on your Razorpay account

## Payment Flow

### Card Payment (Stripe)
```
User → Select Card → Stripe Elements Form → Enter Card Details → 
Stripe Payment Intent → Webhook Confirmation → Booking Confirmed
```

### UPI Payment (Razorpay)
```
User → Select UPI → Currency Conversion (USD→INR) → 
Razorpay Order → UPI App → Payment → Verification → Booking Confirmed
```

### QR Code Payment (Simulated)
```
User → Select QR → Generate QR Code → Display QR → 
User Scans → Auto-confirm after 20s → Booking Confirmed
```

## Currency Conversion

The system automatically converts USD to INR for UPI/QR payments using the free exchangerate-api.com API.

**Fallback Rate:** If API fails, uses 1 USD = 83 INR

## Testing Payment Methods

### Test Stripe Card Payment
Use these test card numbers:
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **3D Secure:** 4000 0025 0000 3155
- Expiry: Any future date
- CVV: Any 3 digits
- ZIP: Any 5 digits

### Test Razorpay UPI
In test mode:
- Use any UPI ID format (e.g., test@paytm)
- Payment will auto-succeed

### Test QR Code
- QR code is auto-confirmed after 20 seconds
- 95% success rate simulation

## Edge Functions

### Payment Functions Created:
1. `payments-stripe-create-intent` - Creates Stripe payment intent
2. `payments-stripe-publishable-key` - Returns Stripe public key
3. `payments-razorpay-create-order` - Creates Razorpay order
4. `payments-razorpay-verify` - Verifies Razorpay payment
5. `payments-qr-generate` - Generates QR code
6. `payments-qr-status` - Checks QR payment status
7. `payments-upi-confirm` - Confirms UPI payment
8. `payments-convert` - Converts USD to INR
9. `payments-confirm` - Final booking confirmation
10. `payments-check-status` - Check any payment status
11. `stripe-webhook` - Handles Stripe webhooks

## Database Schema

The `bookings` table includes these payment-related fields:
- `payment_status` - pending/succeeded/failed
- `payment_method` - card/upi/qr
- `transaction_id` - Unique transaction reference
- `stripe_payment_intent_id` - For Stripe payments
- `amount` - Original amount in USD
- `currency` - USD or INR
- `confirmed_at` - Timestamp when payment confirmed

## Security Features

✅ **Never store card details** - Handled by Stripe  
✅ **Webhook signature verification** - Prevents fake payment confirmations  
✅ **HTTPS only** - All communication encrypted  
✅ **Payment intent confirmation** - Client-side + server-side verification  
✅ **Transaction deduplication** - Prevents double charges  

## Troubleshooting

### Card form not showing
- Check browser console for errors
- Verify `STRIPE_PUBLISHABLE_KEY` is set correctly
- Check that `payments-stripe-publishable-key` function is working

### UPI payment not opening
- Check that Razorpay script loaded
- Verify `RAZORPAY_KEY_ID` is correct
- Check browser console for errors
- Ensure you're using INR currency

### Webhook not working
- Verify webhook URL is correct in Stripe dashboard
- Check that `STRIPE_WEBHOOK_SECRET` matches
- View webhook logs in Stripe dashboard
- Check Supabase edge function logs

### Currency conversion failing
- Check network connection to exchangerate-api.com
- System will use fallback rate (83) if API fails

## Production Checklist

Before going live:

- [ ] Switch all keys from test mode to live mode
- [ ] Verify webhook endpoint is working
- [ ] Test real card payments
- [ ] Test real UPI payments (India only)
- [ ] Enable Stripe radar for fraud protection
- [ ] Set up proper error monitoring
- [ ] Configure email receipts
- [ ] Test refund flow
- [ ] Verify booking confirmation emails

## Support

For payment-related issues:
- Stripe: https://support.stripe.com
- Razorpay: https://razorpay.com/support

For technical issues, check:
- Browser console logs
- Supabase edge function logs
- Stripe dashboard webhook logs
