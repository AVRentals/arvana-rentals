// Creates a one-off Stripe Checkout Session for an arbitrary amount — used
// for down payments / partial payments / "send a payment request" the way
// Fleetwire lets you send a payment link for an outstanding balance.
//
// Deploy: supabase functions deploy create-payment-link
// Requires secrets: STRIPE_SECRET_KEY, SITE_URL
import Stripe from 'npm:stripe@16';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });
const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:5173';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { bookingId, amount, description } = await req.json();
    if (!bookingId || !amount) throw new Error('bookingId and amount are required');

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
          product_data: { name: description || 'Payment request' },
        },
        quantity: 1,
      }],
      metadata: { booking_id: bookingId, type: 'payment_link' },
      success_url: `${siteUrl}/bookings/${bookingId}?payment=1`,
      cancel_url: `${siteUrl}/bookings/${bookingId}?payment=0`,
    });

    // Track the outstanding balance so the admin page can show it's been sent.
    await supabase.from('bookings').update({ balance_due: amount }).eq('id', bookingId);

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
