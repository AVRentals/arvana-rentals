// Emails an applicant when their rental application is approved or declined.
//
// Deploy: supabase functions deploy send-application-email
// Requires secrets:
//   RESEND_API_KEY      — from https://resend.com (free tier: 3,000 emails/mo)
//   RESEND_FROM_EMAIL   — e.g. "Arvana Rentals <info@arvanarentals.com>"
//                         The domain must be verified in Resend or mail will
//                         be rejected / land in spam.
//   SITE_URL            — e.g. "https://arvanarentals.com" (used for the
//                         signup link in the approval email)
//
// Called from the Fleet Manager when Daniel taps Approve or Decline —
// see src/lib/supabase.ts -> sendApplicationDecision().
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'Arvana Rentals <onboarding@resend.dev>';
const SITE_URL = Deno.env.get('SITE_URL') || 'https://arvanarentals.com';

const firstName = (fullName: string) => (fullName || '').trim().split(/\s+/)[0] || 'there';

const approvedEmail = (name: string, car?: string) => ({
  subject: 'You\'re approved — Arvana Rentals',
  html: `
    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:520px;color:#1a1a2e;line-height:1.6">
      <h2 style="margin:0 0 16px">You're approved, ${firstName(name)}.</h2>
      <p style="margin:0 0 14px">
        We reviewed your application${car ? ` for the <strong>${car}</strong>` : ''} and everything checks out.
      </p>
      <p style="margin:0 0 14px"><strong>Next step:</strong> create your account so we can finalize your rental.</p>
      <p style="margin:0 0 22px">
        <a href="${SITE_URL}/signup"
           style="background:#E8B54B;color:#1a1a2e;padding:12px 22px;border-radius:12px;
                  text-decoration:none;font-weight:700;display:inline-block">
          Create your account
        </a>
      </p>
      <p style="margin:0 0 14px">
        Use the same email you applied with (${'this address'}) so we can match you up.
      </p>
      <p style="margin:0 0 14px">
        Once you're in, we'll confirm your dates, go over the agreement, and set a pickup time.
        Reply to this email or text us with any questions in the meantime.
      </p>
      <p style="margin:24px 0 0;color:#666;font-size:13px">
        Arvana Rentals · Miami, FL<br>
        Locally owned. Every car personally inspected.
      </p>
    </div>`,
});

const declinedEmail = (name: string) => ({
  subject: 'About your Arvana Rentals application',
  html: `
    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:520px;color:#1a1a2e;line-height:1.6">
      <h2 style="margin:0 0 16px">Thanks for applying, ${firstName(name)}.</h2>
      <p style="margin:0 0 14px">
        We're not able to move forward with your rental application at this time.
      </p>
      <p style="margin:0 0 14px">
        If something has changed — new insurance, an updated license, more recent gig trips —
        you're welcome to apply again and we'll take another look.
      </p>
      <p style="margin:24px 0 0;color:#666;font-size:13px">
        Arvana Rentals · Miami, FL
      </p>
    </div>`,
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { quoteRequestId, decision } = await req.json();
    if (!quoteRequestId || !['approved', 'declined'].includes(decision)) {
      throw new Error('quoteRequestId and decision (approved|declined) are required');
    }

    if (!RESEND_API_KEY) {
      // No key configured yet — succeed quietly so approving still works.
      return new Response(JSON.stringify({ ok: false, reason: 'RESEND_API_KEY not set' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: application, error } = await supabase
      .from('quote_requests')
      .select('full_name, email, car_interest')
      .eq('id', quoteRequestId)
      .single();
    if (error || !application) throw new Error('Application not found');

    const body = decision === 'approved'
      ? approvedEmail(application.full_name, application.car_interest)
      : declinedEmail(application.full_name);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: application.email,
        subject: body.subject,
        html: body.html,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Resend rejected the email: ${detail}`);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
