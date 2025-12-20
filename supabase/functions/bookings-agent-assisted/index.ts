import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

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

    // Create booking with confirmed status (payment will be handled by agent)
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .insert({
        user_id: userId,
        agent_id: agentId || null,
        booking_type: bookingType,
        status: 'confirmed',
        payment_status: null, // Agent will update after collecting payment
        booking_details: validatedOffer || offer,
        amount: price,
        currency: currency || 'USD',
        contact_email: userDetails.email,
        contact_name: `${userDetails.firstName || ''} ${userDetails.lastName || ''}`.trim() || userDetails.name,
        contact_phone: userDetails.phone,
        transaction_id: clientRequestId,
        hold_expiry: expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        fare_validated_at: new Date().toISOString(),
        confirmed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (bookingError) {
      logStep('Failed to create booking', { error: bookingError.message });
      throw new Error('Failed to create booking');
    }

    logStep('Agent-assisted booking created', { bookingId: booking.id });

    // Send confirmation email using Gemini AI + SMTP
    try {
      const emailResult = await sendConfirmationEmail(
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
  booking: any,
  userDetails: any,
  bookingType: string,
  offer: any
): Promise<boolean> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  const SMTP_HOST = Deno.env.get('SMTP_HOST');
  const SMTP_PORT = Deno.env.get('SMTP_PORT');
  const SMTP_USERNAME = Deno.env.get('SMTP_USERNAME');
  const SMTP_PASSWORD = Deno.env.get('SMTP_PASSWORD');
  const SMTP_FROM_NAME = Deno.env.get('SMTP_FROM_NAME') || 'CheapFlights';
  const SMTP_FROM_EMAIL = Deno.env.get('SMTP_FROM_EMAIL');

  // Build booking details for email
  let bookingDetails = '';
  if (bookingType === 'flight') {
    const firstSeg = offer?.itineraries?.[0]?.segments?.[0];
    const lastSeg = offer?.itineraries?.[0]?.segments?.slice(-1)[0];
    bookingDetails = `Flight from ${firstSeg?.departure?.iataCode || 'Origin'} to ${lastSeg?.arrival?.iataCode || 'Destination'}`;
    if (firstSeg?.departure?.at) {
      bookingDetails += `\nDeparture: ${new Date(firstSeg.departure.at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
    }
  } else if (bookingType === 'hotel') {
    bookingDetails = `Hotel: ${offer?.hotel?.name || 'Hotel Booking'}`;
    if (offer?.hotel?.address?.cityName) {
      bookingDetails += `\nLocation: ${offer.hotel.address.cityName}`;
    }
  } else if (bookingType === 'car') {
    bookingDetails = `Car Rental: ${offer?.vehicle?.make || ''} ${offer?.vehicle?.model || offer?.vehicle?.category || 'Vehicle'}`;
    if (offer?.provider?.name) {
      bookingDetails += `\nProvider: ${offer.provider.name}`;
    }
  }

  // Generate email content using Gemini AI via Lovable AI Gateway
  let emailBody = '';
  if (LOVABLE_API_KEY) {
    try {
      const prompt = `Generate a professional travel booking confirmation email for a US customer.

Booking Details:
- Reference: ${booking.id.slice(0, 8).toUpperCase()}
- Type: ${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)}
- ${bookingDetails}
- Amount: $${booking.amount} ${booking.currency}
- Customer Name: ${userDetails.firstName} ${userDetails.lastName}

Requirements:
- Tone: polite, reassuring, US-market professional
- Include a warm greeting and thank you
- Clearly show the booking reference prominently
- Include all booking details
- Add this important message: "Your booking is confirmed. Our travel agent will contact you shortly to assist with payment."
- Include support contact info: Phone +1 (800) 555-0123, Email support@cheapflights.travel
- Keep it concise but friendly
- Do NOT use HTML tags, just plain text with line breaks`;

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
        console.log('[EMAIL] Generated email with Gemini AI');
      }
    } catch (e) {
      console.log('[EMAIL] AI generation failed, using template', e);
    }
  }

  // Fallback template if AI fails
  if (!emailBody) {
    emailBody = `Dear ${userDetails.firstName},

Thank you for booking with CheapFlights!

Your booking has been confirmed.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BOOKING REFERENCE: ${booking.id.slice(0, 8).toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Booking Details:
- Type: ${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)}
- ${bookingDetails}
- Amount: $${booking.amount} ${booking.currency}

IMPORTANT - PAYMENT PENDING:
Your booking is confirmed. Our travel agent will contact you shortly to assist with payment. No action is needed from your side right now.

If you have any questions, please contact us:
📞 Phone: +1 (800) 555-0123
✉️ Email: support@cheapflights.travel

Thank you for choosing CheapFlights!

Best regards,
The CheapFlights Team`;
  }

  // Send email using SMTP if configured
  if (SMTP_HOST && SMTP_PORT && SMTP_USERNAME && SMTP_PASSWORD && SMTP_FROM_EMAIL) {
    try {
      const client = new SMTPClient({
        connection: {
          hostname: SMTP_HOST,
          port: parseInt(SMTP_PORT),
          tls: true,
          auth: {
            username: SMTP_USERNAME,
            password: SMTP_PASSWORD,
          },
        },
      });

      await client.send({
        from: `${SMTP_FROM_NAME} <${SMTP_FROM_EMAIL}>`,
        to: userDetails.email,
        subject: `✈️ Booking Confirmed - Reference: ${booking.id.slice(0, 8).toUpperCase()}`,
        content: emailBody,
      });

      await client.close();
      console.log('[EMAIL] Sent via SMTP successfully');
      return true;
    } catch (e) {
      console.log('[EMAIL] SMTP failed:', e);
    }
  } else {
    console.log('[EMAIL] SMTP not fully configured, missing credentials');
  }

  // Log the email content for debugging
  console.log('[EMAIL] Would send email to:', userDetails.email);
  console.log('[EMAIL] Subject: Booking Confirmed');
  console.log('[EMAIL] Body preview:', emailBody.substring(0, 300) + '...');

  return false;
}