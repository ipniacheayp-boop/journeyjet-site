import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON = Deno.env.get('SUPABASE_ANON_KEY')!;

const MAX_ATTEMPTS = 5;

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const code: string = (body.code ?? '').toString().trim();
    const purpose: string = body.purpose ?? 'email_verify';

    if (!/^\d{6}$/.test(code)) {
      return new Response(JSON.stringify({ error: 'invalid_code_format' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!['email_verify', 'login', 'password_reset'].includes(purpose)) {
      return new Response(JSON.stringify({ error: 'invalid_purpose' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    let email = (body.email ?? '').toString().trim().toLowerCase();
    let userId: string | null = null;

    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: authHeader } } });
      const { data } = await userClient.auth.getClaims(authHeader.replace('Bearer ', ''));
      if (data?.claims) {
        userId = data.claims.sub as string;
        email = (data.claims.email as string ?? email).toLowerCase();
      }
    }
    if (!email) {
      return new Response(JSON.stringify({ error: 'email_required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: row } = await admin
      .from('otp_codes')
      .select('id, code_hash, expires_at, attempts, verified_at')
      .eq('email', email)
      .eq('purpose', purpose)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!row) {
      return new Response(JSON.stringify({ error: 'no_code' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (row.verified_at) {
      return new Response(JSON.stringify({ error: 'already_used' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (new Date(row.expires_at).getTime() < Date.now()) {
      return new Response(JSON.stringify({ error: 'expired' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (row.attempts >= MAX_ATTEMPTS) {
      return new Response(JSON.stringify({ error: 'too_many_attempts' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const hash = await sha256(code);
    if (hash !== row.code_hash) {
      await admin.from('otp_codes').update({ attempts: row.attempts + 1 }).eq('id', row.id);
      const remaining = MAX_ATTEMPTS - (row.attempts + 1);
      return new Response(JSON.stringify({ error: 'invalid_code', attemptsRemaining: Math.max(0, remaining) }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await admin.from('otp_codes').update({ verified_at: new Date().toISOString() }).eq('id', row.id);

    if (purpose === 'email_verify' && userId) {
      await admin.from('profiles').update({ is_email_verified: true }).eq('id', userId);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('otp-verify error', err);
    return new Response(JSON.stringify({ error: 'verify_failed' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
