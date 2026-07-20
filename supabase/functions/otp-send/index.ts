import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON = Deno.env.get('SUPABASE_ANON_KEY')!;

const OTP_TTL_MIN = 5;
const RESEND_COOLDOWN_SEC = 30;

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function genCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendEmail(to: string, code: string, purpose: string) {
  const subject =
    purpose === 'password_reset' ? 'Your Tripile password reset code'
    : purpose === 'login' ? 'Your Tripile sign-in code'
    : 'Verify your Tripile email';

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;color:#0f172a">
      <h2 style="margin:0 0 12px;font-size:20px">${subject}</h2>
      <p style="color:#475569;margin:0 0 24px">Use the code below to continue. It expires in ${OTP_TTL_MIN} minutes.</p>
      <div style="font-size:32px;font-weight:700;letter-spacing:8px;background:#f1f5f9;padding:16px;text-align:center;border-radius:12px">${code}</div>
      <p style="color:#94a3b8;font-size:12px;margin-top:24px">If you did not request this, ignore this email.</p>
    </div>`;

  if (RESEND_API_KEY) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Tripile <onboarding@resend.dev>',
        to: [to],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error('resend send failed', res.status, body);
      throw new Error('email_send_failed');
    }
  } else {
    console.warn('RESEND_API_KEY missing; OTP not emailed. Code:', code);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const purpose: string = body.purpose ?? 'email_verify';
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

    // Cooldown check: last OTP for this email+purpose
    const { data: last } = await admin
      .from('otp_codes')
      .select('created_at')
      .eq('email', email)
      .eq('purpose', purpose)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (last) {
      const elapsed = (Date.now() - new Date(last.created_at).getTime()) / 1000;
      if (elapsed < RESEND_COOLDOWN_SEC) {
        return new Response(JSON.stringify({ error: 'cooldown', retryAfter: Math.ceil(RESEND_COOLDOWN_SEC - elapsed) }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const code = genCode();
    const code_hash = await sha256(code);
    const expires_at = new Date(Date.now() + OTP_TTL_MIN * 60_000).toISOString();

    const { error: insErr } = await admin.from('otp_codes').insert({
      user_id: userId, email, purpose, code_hash, expires_at,
    });
    if (insErr) throw insErr;

    if (userId) {
      await admin.from('profiles').update({ last_otp_sent_at: new Date().toISOString() }).eq('id', userId);
    }

    await sendEmail(email, code, purpose);

    return new Response(JSON.stringify({ ok: true, expiresInMinutes: OTP_TTL_MIN }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('otp-send error', err);
    return new Response(JSON.stringify({ error: 'send_failed' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
