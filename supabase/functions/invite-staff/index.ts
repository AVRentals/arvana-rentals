// Invites a staff/dispatcher account. Uses the Supabase Admin API (service
// role key) to create + email-invite a user, then marks their profile role
// as 'staff' once the trigger creates it.
//
// Deploy: supabase functions deploy invite-staff
// Requires secrets: SITE_URL (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are
// already available to every Edge Function automatically)
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { email, fullName } = await req.json();
    if (!email) throw new Error('email is required');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: invited, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName || '', is_host: false },
      redirectTo: `${Deno.env.get('SITE_URL') || 'http://localhost:5173'}/auth/callback`,
    });
    if (inviteError) throw inviteError;

    // The handle_new_user trigger creates the profile row automatically;
    // flip its role to 'staff' once that's happened.
    if (invited.user?.id) {
      await supabase.from('profiles').update({ role: 'staff', full_name: fullName || null }).eq('id', invited.user.id);
    }

    return new Response(JSON.stringify({ ok: true, userId: invited.user?.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
