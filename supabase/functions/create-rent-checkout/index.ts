// Creates a normal (auto-capture) Stripe Checkout Session for the rent + service fee.
// This is charged immediately once the renter completes checkout — separate from
// the security deposit, which is a manual-capture hold created by
// create-deposit-checkout instead.
//
// Deploy: supabase functions deploy create-rent-checkout
// Requires secrets: STRIPE_SECRET_KEY, SITE_URL (e.g. https://arvanarentals.com)
import Stripe from 'npm:stripe@16';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });
const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:5173';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { bookingId } = await req.json();
    if (!bookingId) throw new Error('bookingId is required');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, car:cars(*)')
      .eq('id', bookingId)
      .single();
    if (error || !booking) throw new Error('Booking not found');

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(booking.total_amount * 100),
          product_data: {
            name: `${booking.car.year} ${booking.car.make} ${booking.car.model} rental`,
            description: `${booking.start_date} to ${booking.end_date}`,
          },
        },
        quantity: 1,
      }],
      metadata: { booking_id: bookingId, type: 'rent' },
      success_url: `${siteUrl}/bookings/${bookingId}?paid=1`,
      cancel_url: `${siteUrl}/bookings/${bookingId}?paid=0`,
    });

    await supabase.from('bookings').update({ stripe_payment_intent_id: session.payment_intent as string }).eq('id', bookingId);

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
