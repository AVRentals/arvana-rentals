// Creates a Stripe Identity VerificationSession — Stripe's hosted flow for
// scanning a driver's license + matching a selfie. Costs ~$1.50 per verification,
// billed by Stripe directly (no extra fee from this code). Requires Identity to
// be enabled on your Stripe account (Stripe Dashboard > Identity > Get started).
//
// Deploy: supabase functions deploy create-identity-session
// Requires secrets: STRIPE_SECRET_KEY, SITE_URL
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

    const verificationSession = await stripe.identity.verificationSessions.create({
      type: 'document',
      metadata: { booking_id: bookingId },
      options: { document: { require_matching_selfie: true } },
      return_url: `${siteUrl}/bookings/${bookingId}?idcheck=1`,
    });

    await supabase.from('bookings').update({
      stripe_identity_session_id: verificationSession.id,
      identity_verification_status: 'pending',
    }).eq('id', bookingId);

    return new Response(JSON.stringify({ url: verificationSession.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
