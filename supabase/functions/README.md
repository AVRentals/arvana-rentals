# Supabase Edge Functions — Stripe integration

These replace what Fleetwire would otherwise charge you monthly for: real
payments, security deposit holds, and ID verification. You still pay Stripe's
own per-transaction fees (same as any card processor) and ~$1.50 per Identity
check — but no separate platform subscription.

## Functions

- `create-rent-checkout` — normal Stripe Checkout, auto-captured. Called once you've approved a request.
- `create-deposit-checkout` — manual-capture Checkout Session, holds a deposit without charging it.
- `deposit-action` — release or capture a held deposit (called from the Fleet Manager admin page).
- `create-identity-session` — Stripe Identity document + selfie verification.
- `stripe-webhook` — single endpoint Stripe calls back to update booking status.
- `issue-refund` — refunds part or all of a rent charge (Fleet Manager > Booking Requests > "Issue refund").
- `create-payment-link` — one-off Checkout Session for a partial/down payment or extra charge (Fleet Manager > "Send payment link").
- `invite-staff` — creates + email-invites a staff login (Fleet Manager > Staff tab). Requires no extra secret beyond what's already set.
- `revoke-staff` — deletes a staff account's login entirely.
- `send-notification` — sends the automated email for a booking event using your saved template (Fleet Manager > Messaging tab). Requires `RESEND_API_KEY` — without it, this no-ops safely and the booking flow still works, it just won't email the renter.

## One-time setup

1. Install the Supabase CLI if you don't have it: `npm install -g supabase`
2. From the `driveshare` folder: `supabase login`, then `supabase link --project-ref <your-project-ref>` (find this in your Supabase project URL).
3. Create a Stripe account at stripe.com if you haven't (free, no monthly fee — pay-per-transaction only). Enable **Identity** in the Stripe Dashboard under Identity > Get started.
4. Get your Stripe **secret key** (Developers > API keys — use the test key first, switch to live once you're ready to take real payments).
5. Set the function secrets:
   ```
   supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
   supabase secrets set SITE_URL=https://arvanarentals.com
   ```
6. Deploy all functions:
   ```
   supabase functions deploy create-rent-checkout
   supabase functions deploy create-deposit-checkout
   supabase functions deploy deposit-action
   supabase functions deploy create-identity-session
   supabase functions deploy stripe-webhook --no-verify-jwt
   supabase functions deploy issue-refund
   supabase functions deploy create-payment-link
   supabase functions deploy invite-staff
   supabase functions deploy revoke-staff
   supabase functions deploy send-notification
   ```
   Optional, only if you want automated emails (Messaging tab) to actually send:
   ```
   supabase secrets set RESEND_API_KEY=re_xxx
   supabase secrets set RESEND_FROM_EMAIL="Arvana Rentals <bookings@arvanarentals.com>"
   ```
7. In the Stripe Dashboard, go to Developers > Webhooks > Add endpoint. URL is:
   `https://<your-project-ref>.supabase.co/functions/v1/stripe-webhook`
   Events to send: `checkout.session.completed`, `identity.verification_session.verified`, `identity.verification_session.requires_input`.
   Copy the signing secret it gives you and run:
   ```
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```

## Testing

Use Stripe test mode first (test card `4242 4242 4242 4242`, any future expiry/CVC) before switching `STRIPE_SECRET_KEY` to your live key.
