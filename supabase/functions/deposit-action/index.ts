// Called from the Fleet Manager admin page after a rental ends:
//   action: "release"       -> cancels the held PaymentIntent, no charge to renter
//   action: "capture_full"  -> captures the entire deposit hold (e.g. serious damage)
//   action: "capture_partial" with amount -> captures part of it (e.g. a cleaning fee)
//
// Deploy: supabase functions deploy deposit-action
// Requires secrets: STRIPE_SECRET_KEY
import Stripe from 'npm:stripe@16';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { bookingId, action, amount } = await req.json();
    if (!bookingId || !action) throw new Error('bookingId and action are required');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: booking, error } = await supabase.from('bookings').select('*').eq('id', bookingId).single();
    if (error || !booking?.deposit_stripe_intent_id) throw new Error('No deposit hold found for this booking');

    let newStatus = booking.deposit_status;

    if (action === 'release') {
      await stripe.paymentIntents.cancel(booking.deposit_stripe_intent_id);
      newStatus = 'released';
    } else if (action === 'capture_full') {
      await stripe.paymentIntents.capture(booking.deposit_stripe_intent_id);
      newStatus = 'captured';
    } else if (action === 'capture_partial') {
      if (!amount) throw new Error('amount is required for a partial capture');
      await stripe.paymentIntents.capture(booking.deposit_stripe_intent_id, {
        amount_to_capture: Math.round(amount * 100),
      });
      newStatus = 'captured';
    } else {
      throw new Error('Unknown action');
    }

    await supabase.from('bookings').update({ deposit_status: newStatus }).eq('id', bookingId);

    return new Response(JSON.stringify({ ok: true, deposit_status: newStatus }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
