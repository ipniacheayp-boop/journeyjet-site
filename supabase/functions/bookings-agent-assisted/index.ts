import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const safeDetails = details ? { ...details } : undefined;
  if (safeDetails?.email) safeDetails.email = '***';
  if (safeDetails?.phone) safeDetails.phone = '***';
  console.log(`[BOOKINGS-AGENT-ASSISTED] ${step}`, safeDetails ? JSON.stringify(safeDetails) : '');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    const {
      productType,
      offer,
      validatedOffer,
      price,
      currency,
      clientRequestId,
      userDetails,
      agentId,
      expiresAt,
    } = await req.json();

    // Validate required fields
    if (!productType || !offer || !price || !clientRequestId) {
      return new Response(
        JSON.stringify({ ok: false, code: 'INVALID_REQUEST', message: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!userDetails?.email) {
      return new Response(
        JSON.stringify({ ok: false, code: 'EMAIL_REQUIRED', message: 'Email is required for booking' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!userDetails?.acceptedTerms) {
      return new Response(
        JSON.stringify({ ok: false, code: 'TERMS_NOT_ACCEPTED', message: 'You must accept the Terms & Conditions' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logStep('Creating agent-assisted booking', { productType, clientRequestId, price, currency });

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get authenticated user if available (optional for guest checkout)
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseClient.auth.getUser(token);
      userId = user?.id || null;
    }

    // Check for existing booking with this clientRequestId (idempotency)
    const { data: existingBooking } = await supabaseClient
      .from('bookings')
      .select('id, status')
      .eq('transaction_id', clientRequestId)
      .maybeSingle();

    if (existingBooking) {
      logStep('Found existing booking', { bookingId: existingBooking.id, status: existingBooking.status });
      return new Response(
        JSON.stringify({
          ok: true,
          bookingId: existingBooking.id,
          bookingReference: existingBooking.id.slice(0, 8).toUpperCase(),
          existingBooking: true,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map productType to booking_type enum
    const bookingTypeMap: Record<string, string> = {
      'flight': 'flight',
      'flights': 'flight',
      'hotel': 'hotel',
      'hotels': 'hotel',
      'car': 'car',
      'cars': 'car',
    };
    const bookingType = bookingTypeMap[productType] || productType;

    // Create booking with confirmed status but payment pending
    // Using "confirmed" status with payment_status = "pending_agent" to indicate agent-assisted payment
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .insert({
        user_id: userId,
        agent_id: agentId || null,
        booking_type: bookingType,
        status: 'confirmed', // Booking is confirmed, payment is pending via agent
        payment_status: 'pending_agent', // Custom status for agent-assisted payment
        booking_details: validatedOffer || offer,
        amount: price,
        currency: currency || 'USD',
        contact_email: userDetails.email,
        contact_name: `${userDetails.firstName || ''} ${userDetails.lastName || ''}`.trim() || userDetails.name,
        contact_phone: userDetails.phone,
        transaction_id: clientRequestId,
        hold_expiry: expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hour hold
        fare_validated_at: new Date().toISOString(),
        confirmed_at: new Date().toISOString(), // Mark as confirmed immediately
      })
      .select()
      .single();

    if (bookingError) {
      logStep('Failed to create booking', { error: bookingError.message });
      throw new Error('Failed to create booking');
    }

    logStep('Agent-assisted booking created', { bookingId: booking.id });

    // Send confirmation email using Gemini AI
    try {
      const emailResult = await sendConfirmationEmail(
        supabaseUrl,
        booking,
        userDetails,
        bookingType,
        validatedOffer || offer
      );
      logStep('Confirmation email sent', { success: emailResult });
    } catch (emailError) {
      logStep('Failed to send confirmation email', { error: String(emailError) });
      // Don't fail the booking if email fails
    }

    return new Response(
      JSON.stringify({
        ok: true,
        bookingId: booking.id,
        bookingReference: booking.id.slice(0, 8).toUpperCase(),
        status: 'confirmed_pending_payment',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logStep('ERROR', { message: errorMessage });
    
    return new Response(
      JSON.stringify({
        ok: false,
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred while creating your booking',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function sendConfirmationEmail(
  supabaseUrl: string,
  booking: any,
  userDetails: any,
  bookingType: string,
  offer: any
): Promise<boolean> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

  if (!LOVABLE_API_KEY) {
    console.log('[EMAIL] LOVABLE_API_KEY not configured, skipping AI email generation');
    return false;
  }

  // Generate email content using Gemini AI via Lovable AI Gateway
  let emailBody = '';
  try {
    const prompt = `You are a professional travel company called CheapFlights.
Write a booking confirmation email for a US customer.

Booking Details:
- Reference: ${booking.id.slice(0, 8).toUpperCase()}
- Type: ${bookingType}
- Amount: $${booking.amount} ${booking.currency}
- Customer: ${userDetails.firstName} ${userDetails.lastName}

Tone: friendly, professional, trustworthy.
Important: Mention that payment will be completed via our agent who will contact them shortly. No action needed right now.
Keep the email concise but warm. Include a thank you message.
Do NOT include any HTML tags, just plain text with line breaks.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      emailBody = aiData.choices?.[0]?.message?.content || '';
    }
  } catch (e) {
    console.log('[EMAIL] AI generation failed, using template', e);
  }

  // Fallback template if AI fails
  if (!emailBody) {
    emailBody = `Dear ${userDetails.firstName},

Thank you for booking with CheapFlights!

Your booking has been confirmed and your reference number is: ${booking.id.slice(0, 8).toUpperCase()}

Booking Details:
- Type: ${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)}
- Amount: $${booking.amount} ${booking.currency}

IMPORTANT: Payment Pending
One of our friendly travel agents will contact you shortly to complete your payment securely over the phone. No action is needed from your side right now.

If you have any questions, please don't hesitate to contact us:
- Phone: +1 (800) 555-0123
- Email: support@cheapflights.travel

Thank you for choosing CheapFlights!

Best regards,
The CheapFlights Team`;
  }

  // Send email using Resend if configured
  if (RESEND_API_KEY) {
    try {
      const resend = new Resend(RESEND_API_KEY);

      await resend.emails.send({
        from: 'CheapFlights <onboarding@resend.dev>',
        to: [userDetails.email],
        subject: `Booking Confirmed - Reference: ${booking.id.slice(0, 8).toUpperCase()}`,
        text: emailBody,
      });

      console.log('[EMAIL] Sent via Resend');
      return true;
    } catch (e) {
      console.log('[EMAIL] Resend failed', e);
    }
  }

  // Log the email content for debugging
  console.log('[EMAIL] Would send email to:', userDetails.email);
  console.log('[EMAIL] Subject: Booking Confirmed');
  console.log('[EMAIL] Body:', emailBody.substring(0, 200) + '...');

  return false;
}