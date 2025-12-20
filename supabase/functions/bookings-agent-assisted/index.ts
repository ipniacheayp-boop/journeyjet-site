import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const safeDetails = details ? { ...details } : undefined;
  if (safeDetails?.email) safeDetails.email = '***@***';
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

    // Send confirmation email
    let emailSent = false;
    let emailError = null;
    
    try {
      const emailResult = await sendConfirmationEmail(
        booking,
        userDetails,
        bookingType,
        validatedOffer || offer
      );
      emailSent = emailResult.success;
      emailError = emailResult.error;
      logStep('Confirmation email result', { success: emailSent, error: emailError });
    } catch (err) {
      emailError = String(err);
      logStep('Failed to send confirmation email', { error: emailError });
      // Don't fail the booking if email fails
    }

    return new Response(
      JSON.stringify({
        ok: true,
        bookingId: booking.id,
        bookingReference: booking.id.slice(0, 8).toUpperCase(),
        status: 'confirmed_pending_payment',
        emailSent,
        emailError: emailSent ? null : 'Email may be delayed. Check your inbox shortly.',
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
): Promise<{ success: boolean; error?: string }> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  const SMTP_FROM_NAME = Deno.env.get('SMTP_FROM_NAME') || 'CheapFlights';
  const SMTP_FROM_EMAIL = Deno.env.get('SMTP_FROM_EMAIL') || 'onboarding@resend.dev';

  console.log('[EMAIL] Starting email send process');
  console.log('[EMAIL] Config:', { 
    hasResendKey: !!RESEND_API_KEY, 
    hasLovableKey: !!LOVABLE_API_KEY,
    fromEmail: SMTP_FROM_EMAIL,
    fromName: SMTP_FROM_NAME,
    toEmail: userDetails.email?.substring(0, 3) + '***'
  });

  if (!RESEND_API_KEY) {
    console.log('[EMAIL] No RESEND_API_KEY configured');
    return { success: false, error: 'Email service not configured' };
  }

  // Build booking details for email
  let bookingDetails = '';
  if (bookingType === 'flight') {
    const firstSeg = offer?.itineraries?.[0]?.segments?.[0];
    const lastSeg = offer?.itineraries?.[0]?.segments?.slice(-1)[0];
    bookingDetails = `Flight from ${firstSeg?.departure?.iataCode || 'Origin'} to ${lastSeg?.arrival?.iataCode || 'Destination'}`;
    if (firstSeg?.departure?.at) {
      bookingDetails += `\nDeparture: ${new Date(firstSeg.departure.at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
    }
    if (firstSeg?.carrierCode) {
      bookingDetails += `\nAirline: ${firstSeg.carrierCode} ${firstSeg.number || ''}`;
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

  const customerName = `${userDetails.firstName || ''} ${userDetails.lastName || ''}`.trim() || 'Valued Customer';
  const bookingReference = booking.id.slice(0, 8).toUpperCase();

  // Generate email content using Gemini AI via Lovable AI Gateway
  let emailBody = '';
  let emailSubject = `Booking Confirmed - Reference: ${bookingReference}`;
  
  if (LOVABLE_API_KEY) {
    try {
      console.log('[EMAIL] Generating content with Gemini AI...');
      const prompt = `Generate a professional travel booking confirmation email for a US customer.

Booking Details:
- Reference: ${bookingReference}
- Type: ${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)}
- ${bookingDetails}
- Amount: $${booking.amount} ${booking.currency}
- Customer Name: ${customerName}

Requirements:
- Tone: polite, reassuring, US-market professional
- Include a warm greeting and thank you
- Clearly show the booking reference prominently
- Include all booking details provided
- Add this important message: "Your booking is confirmed. Our travel agent will contact you shortly to assist with payment."
- Include support contact info: Phone +1 (800) 555-0123, Email support@cheapflights.travel
- Keep it concise but friendly
- Do NOT use any HTML tags or markdown, just plain text with line breaks
- Start with "Dear ${customerName}," greeting`;

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
        console.log('[EMAIL] Generated email with Gemini AI successfully');
      } else {
        const errorText = await aiResponse.text();
        console.log('[EMAIL] AI response not ok:', aiResponse.status, errorText);
      }
    } catch (e) {
      console.log('[EMAIL] AI generation failed:', e);
    }
  }

  // Fallback template if AI fails
  if (!emailBody) {
    console.log('[EMAIL] Using fallback template');
    emailBody = `Dear ${customerName},

Thank you for booking with CheapFlights!

Your booking has been confirmed.

========================================
BOOKING REFERENCE: ${bookingReference}
========================================

Booking Details:
- Type: ${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)}
- ${bookingDetails}
- Amount: $${booking.amount} ${booking.currency}

IMPORTANT - NEXT STEPS:
Your booking is confirmed. Our travel agent will contact you shortly to assist with payment. No action is needed from your side right now.

If you have any questions, please contact us:
Phone: +1 (800) 555-0123
Email: support@cheapflights.travel

Thank you for choosing CheapFlights!

Best regards,
The CheapFlights Team`;
  }

  // Send email using Resend API
  console.log('[EMAIL] Sending via Resend API...');
  
  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${SMTP_FROM_NAME} <${SMTP_FROM_EMAIL}>`,
        to: [userDetails.email],
        subject: emailSubject,
        text: emailBody,
      }),
    });

    if (resendResponse.ok) {
      const resendData = await resendResponse.json();
      console.log('[EMAIL] Sent via Resend successfully:', resendData.id);
      return { success: true };
    } else {
      const errorText = await resendResponse.text();
      console.log('[EMAIL] Resend API failed:', resendResponse.status, errorText);
      
      // Retry once
      console.log('[EMAIL] Retrying...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const retryResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${SMTP_FROM_NAME} <${SMTP_FROM_EMAIL}>`,
          to: [userDetails.email],
          subject: emailSubject,
          text: emailBody,
        }),
      });
      
      if (retryResponse.ok) {
        const retryData = await retryResponse.json();
        console.log('[EMAIL] Sent via Resend on retry:', retryData.id);
        return { success: true };
      }
      
      const retryError = await retryResponse.text();
      return { success: false, error: `Resend API error: ${retryError}` };
    }
  } catch (e) {
    console.log('[EMAIL] Resend API error:', e);
    return { success: false, error: String(e) };
  }
}
