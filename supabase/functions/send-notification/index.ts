// Sends an automated email using the host's saved message_templates row for
// the given event (booking_confirmed / pickup_reminder / return_reminder /
// booking_requested). Uses Resend (https://resend.com) — pick a free-tier
// account and set RESEND_API_KEY, or swap this out for any other email API.
//
// Deploy: supabase functions deploy send-notification
// Requires secrets: RESEND_API_KEY, RESEND_FROM_EMAIL (e.g. "Arvana Rentals <bookings@yourdomain.com>")
//
// NOTE: this function does not run itself — call it from the client (or a
// DB webhook) whenever a booking event happens. See src/lib/supabase.ts ->
// sendBookingNotification(), wired into Book.tsx / FleetManager.tsx.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'Arvana Rentals <onboarding@resend.dev>';

function fillTemplate(text: string, vars: Record<string, string>) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { bookingId, eventType } = await req.json();
    if (!bookingId || !eventType) throw new Error('bookingId and eventType are required');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, car:cars(*), renter:profiles!renter_id(*)')
      .eq('id', bookingId)
      .single();
    if (error || !booking) throw new Error('Booking not found');

    const { data: template } = await supabase
      .from('message_templates')
      .select('*')
      .eq('host_id', booking.host_id)
      .eq('event_type', eventType)
      .eq('channel', 'email')
      .eq('is_active', true)
      .maybeSingle();

    if (!template) {
      return new Response(JSON.stringify({ ok: false, reason: 'No active template for this event' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const vars = {
      renter_name: booking.renter?.full_name || 'there',
      car: `${booking.car?.year} ${booking.car?.make} ${booking.car?.model}`,
      start_date: booking.start_date,
      end_date: booking.end_date,
      total_amount: String(booking.total_amount),
      pickup_location: booking.pickup_location,
    };

    const subject = fillTemplate(template.subject || 'Update on your rental', vars);
    const body = fillTemplate(template.body, vars);

    if (!RESEND_API_KEY) {
      // No email provider configured yet — don't fail the booking flow,
      // just report that the send was skipped so the UI can show a hint.
      return new Response(JSON.stringify({ ok: false, reason: 'RESEND_API_KEY not set — email not sent' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const renterEmail = booking.renter?.email; // Note: add email to profiles or pass separately if needed
    if (!renterEmail) {
      return new Response(JSON.stringify({ ok: false, reason: 'No renter email on file' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: renterEmail,
        subject,
        text: body,
      }),
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
