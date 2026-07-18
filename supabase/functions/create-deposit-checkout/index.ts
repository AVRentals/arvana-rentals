// Creates a MANUAL-CAPTURE Stripe Checkout Session — this places a card-authorization
// hold for the security deposit without charging it. You (the host) later either:
//   - release it (cancel the PaymentIntent) if the car comes back with no issues, or
//   - capture some/all of it (capture the PaymentIntent) if there's damage/cleaning fees.
// See deposit-action/index.ts for the release/capture endpoint.
//
// Deploy: supabase functions deploy create-deposit-checkout
// Requires secrets: STRIPE_SECRET_KEY, SITE_URL
import Stripe from 'npm:stripe@16';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });
const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:5173';

// Flat deposit amount in dollars — adjust to whatever you want to hold per rental.
const DEFAULT_DEPOSIT_AMOUNT = 250;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { bookingId, depositAmount } = await req.json();
    if (!bookingId) throw new Error('bookingId is required');
    const amount = depositAmount || DEFAULT_DEPOSIT_AMOUNT;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(amount * 100),
          product_data: { name: 'Refundable security deposit hold' },
        },
        quantity: 1,
      }],
      payment_intent_data: { capture_method: 'manual' },
      metadata: { booking_id: bookingId, type: 'deposit' },
      success_url: `${siteUrl}/bookings/${bookingId}?deposit=1`,
      cancel_url: `${siteUrl}/bookings/${bookingId}?deposit=0`,
    });

    await supabase.from('bookings').update({
      deposit_amount: amount,
      deposit_stripe_intent_id: session.payment_intent as string,
      deposit_status: 'held',
    }).eq('id', bookingId);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
