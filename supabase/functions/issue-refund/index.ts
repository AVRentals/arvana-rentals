// Issues a Stripe refund against the rent charge for a booking, called from
// the Fleet Manager admin page (Booking Requests / Orders tab).
//
// Deploy: supabase functions deploy issue-refund
// Requires secrets: STRIPE_SECRET_KEY
import Stripe from 'npm:stripe@16';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { bookingId, amount } = await req.json();
    if (!bookingId || !amount) throw new Error('bookingId and amount are required');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: booking, error } = await supabase.from('bookings').select('*').eq('id', bookingId).single();
    if (error || !booking?.stripe_payment_intent_id) throw new Error('No rent payment found for this booking to refund');

    const refund = await stripe.refunds.create({
      payment_intent: booking.stripe_payment_intent_id,
      amount: Math.round(amount * 100),
    });

    await supabase.from('bookings').update({
      refund_amount: amount,
      refund_status: 'issued',
      refunded_at: new Date().toISOString(),
    }).eq('id', bookingId);

    return new Response(JSON.stringify({ ok: true, refund_id: refund.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
