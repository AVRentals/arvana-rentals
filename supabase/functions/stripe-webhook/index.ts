// Single webhook endpoint for all Stripe events used by this app:
//   - checkout.session.completed (rent paid OR deposit held, check metadata.type)
//   - identity.verification_session.verified / requires_input
//
// After deploying, register this URL in the Stripe Dashboard:
//   Developers > Webhooks > Add endpoint
//   URL: https://<your-project-ref>.supabase.co/functions/v1/stripe-webhook
//   Events to send: checkout.session.completed, identity.verification_session.verified,
//                    identity.verification_session.requires_input
// Copy the "Signing secret" it gives you into STRIPE_WEBHOOK_SECRET below.
//
// Deploy: supabase functions deploy stripe-webhook --no-verify-jwt
// Requires secrets: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
import Stripe from 'npm:stripe@16';
import { createClient } from 'npm:@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature!, webhookSecret);
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${(err as Error).message}`, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;
      const type = session.metadata?.type;
      // Any money actually collected (rent checkout or an ad-hoc payment link)
      // adds to amount_paid, which is what drives the Payment Status board.
      // Deposits are excluded — a held deposit isn't rental income.
      if (bookingId && (type === 'rent' || type === 'payment_link')) {
        const paidNow = (session.amount_total ?? 0) / 100;
        const { data: booking } = await supabase
          .from('bookings')
          .select('amount_paid, total_amount')
          .eq('id', bookingId)
          .single();
        const newPaid = Number(booking?.amount_paid ?? 0) + paidNow;
        const update: Record<string, unknown> = {
          amount_paid: newPaid,
          balance_due: Math.max(0, Number(booking?.total_amount ?? 0) - newPaid),
        };
        if (type === 'rent') {
          // Rent paid — this is the point where status moves from 'pending'
          // to 'confirmed', since by now ID + payment are both done.
          update.status = 'confirmed';
        }
        await supabase.from('bookings').update(update).eq('id', bookingId);
      }
      // Deposit sessions already get their status set to 'held' at creation time
      // (see create-deposit-checkout) — nothing further needed here for those.
      break;
    }
    case 'identity.verification_session.verified': {
      const vs = event.data.object as Stripe.Identity.VerificationSession;
      const bookingId = vs.metadata?.booking_id;
      if (bookingId) {
        await supabase.from('bookings').update({ identity_verification_status: 'verified' }).eq('id', bookingId);
      }
      break;
    }
    case 'identity.verification_session.requires_input': {
      const vs = event.data.object as Stripe.Identity.VerificationSession;
      const bookingId = vs.metadata?.booking_id;
      if (bookingId) {
        await supabase.from('bookings').update({ identity_verification_status: 'failed' }).eq('id', bookingId);
      }
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } });
});
