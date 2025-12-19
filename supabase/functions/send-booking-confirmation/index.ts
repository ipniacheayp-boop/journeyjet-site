import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const safeDetails = details ? { ...details } : undefined;
  if (safeDetails?.email) safeDetails.email = '***@***';
  console.log(`[SEND-BOOKING-CONFIRMATION] ${step}`, safeDetails ? JSON.stringify(safeDetails) : '');
};

interface BookingEmailRequest {
  bookingId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Request received");

    const { bookingId } = await req.json() as BookingEmailRequest;

    if (!bookingId) {
      return new Response(
        JSON.stringify({ success: false, error: "bookingId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Processing booking", { bookingId });

    // Initialize Supabase with service role (called from webhook)
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch booking details
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      logStep("Booking not found", { error: bookingError?.message });
      return new Response(
        JSON.stringify({ success: false, error: "Booking not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!booking.contact_email) {
      logStep("No contact email for booking");
      return new Response(
        JSON.stringify({ success: false, error: "No contact email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      logStep("RESEND_API_KEY not configured - logging email instead");
      // Log email payload safely instead of failing
      console.log("[SEND-BOOKING-CONFIRMATION] Email would be sent:", {
        to: '***',
        subject: `Booking Confirmed - ${booking.id.slice(0, 8).toUpperCase()}`,
        bookingType: booking.booking_type,
        amount: booking.amount,
        currency: booking.currency,
      });
      return new Response(
        JSON.stringify({ success: true, message: "Email logged (RESEND_API_KEY not configured)" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(resendApiKey);

    // Format booking details for email
    const bookingRef = booking.id.slice(0, 8).toUpperCase();
    const bookingDetails = booking.booking_details || {};
    const amount = parseFloat(booking.amount || 0);
    const currency = booking.currency || 'USD';
    const bookingType = booking.booking_type;
    const providerRef = booking.amadeus_pnr || booking.amadeus_order_id || bookingDetails.providerConfirmationId || '';

    // Build booking summary based on type
    let tripSummary = '';
    let tripDetails = '';
    
    if (bookingType === 'flight') {
      const firstSeg = bookingDetails.itineraries?.[0]?.segments?.[0];
      const lastSeg = bookingDetails.itineraries?.[0]?.segments?.slice(-1)[0];
      if (firstSeg && lastSeg) {
        tripSummary = `${firstSeg.departure?.iataCode || 'DEP'} → ${lastSeg.arrival?.iataCode || 'ARR'}`;
        tripDetails = `
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <h3 style="margin: 0 0 15px 0; color: #333;">✈️ Flight Details</h3>
            <p style="margin: 5px 0;"><strong>Route:</strong> ${tripSummary}</p>
            <p style="margin: 5px 0;"><strong>Departure:</strong> ${firstSeg.departure?.at ? new Date(firstSeg.departure.at).toLocaleString() : 'TBD'}</p>
            ${firstSeg.carrierCode ? `<p style="margin: 5px 0;"><strong>Airline:</strong> ${firstSeg.carrierCode} ${firstSeg.number || ''}</p>` : ''}
          </div>
        `;
      }
    } else if (bookingType === 'hotel') {
      const hotelName = bookingDetails.hotel?.name || bookingDetails.name || 'Hotel';
      tripSummary = hotelName;
      tripDetails = `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0;">
          <h3 style="margin: 0 0 15px 0; color: #333;">🏨 Hotel Details</h3>
          <p style="margin: 5px 0;"><strong>Hotel:</strong> ${hotelName}</p>
          ${bookingDetails.hotel?.address?.cityName ? `<p style="margin: 5px 0;"><strong>Location:</strong> ${bookingDetails.hotel.address.cityName}</p>` : ''}
        </div>
      `;
    } else if (bookingType === 'car') {
      const vehicle = bookingDetails.vehicle || {};
      tripSummary = `${vehicle.make || ''} ${vehicle.model || vehicle.category || 'Car Rental'}`.trim();
      tripDetails = `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0;">
          <h3 style="margin: 0 0 15px 0; color: #333;">🚗 Car Rental Details</h3>
          <p style="margin: 5px 0;"><strong>Vehicle:</strong> ${tripSummary}</p>
          ${bookingDetails.provider?.name ? `<p style="margin: 5px 0;"><strong>Provider:</strong> ${bookingDetails.provider.name}</p>` : ''}
        </div>
      `;
    }

    // Generate HTML email
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0b69ff 0%, #1e3a8a 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">✅ Booking Confirmed!</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your payment was successful</p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <!-- Greeting -->
      <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
        Hi ${booking.contact_name || 'Traveler'},
      </p>
      <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
        Thank you for your booking! Your ${bookingType} reservation has been confirmed and paid.
      </p>

      <!-- Booking Reference -->
      <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
        <p style="color: #666; font-size: 14px; margin: 0 0 8px 0;">Booking Reference</p>
        <p style="color: #0b69ff; font-size: 32px; font-weight: bold; letter-spacing: 2px; margin: 0;">${bookingRef}</p>
        ${providerRef ? `<p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">Confirmation: ${providerRef}</p>` : ''}
      </div>

      <!-- Trip Details -->
      ${tripDetails}

      <!-- Payment Summary -->
      <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 25px; border-radius: 8px; border-left: 4px solid #4caf50; margin-bottom: 30px;">
        <h3 style="margin: 0 0 15px 0; color: #333;">💳 Payment Summary</h3>
        <div style="display: flex; justify-content: space-between; padding: 8px 0;">
          <span style="color: #666;">Status</span>
          <span style="color: #4caf50; font-weight: bold;">✓ Paid</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-top: 1px solid rgba(0,0,0,0.1); margin-top: 10px;">
          <span style="color: #333; font-weight: bold;">Total Amount</span>
          <span style="color: #333; font-size: 24px; font-weight: bold;">$${amount.toFixed(2)} ${currency}</span>
        </div>
      </div>

      <!-- Traveler Info -->
      <div style="background: #fff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 30px;">
        <h3 style="margin: 0 0 15px 0; color: #333;">👤 Traveler Information</h3>
        <p style="margin: 5px 0; color: #666;"><strong>Name:</strong> ${booking.contact_name || 'N/A'}</p>
        <p style="margin: 5px 0; color: #666;"><strong>Email:</strong> ${booking.contact_email}</p>
        ${booking.contact_phone ? `<p style="margin: 5px 0; color: #666;"><strong>Phone:</strong> ${booking.contact_phone}</p>` : ''}
      </div>

      <!-- Support Info -->
      <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
        <p style="color: #666; margin: 5px 0;"><strong>Need Help?</strong></p>
        <p style="color: #666; margin: 5px 0;">Contact our support team at support@cheapflights.com</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #333; padding: 30px; text-align: center; color: white;">
      <p style="margin: 5px 0; font-size: 14px;"><strong>Thank you for choosing CheapFlights!</strong></p>
      <p style="margin: 5px 0; font-size: 12px; color: #999;">Safe travels! ✈️</p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email
    logStep("Sending confirmation email...");
    const emailResponse = await resend.emails.send({
      from: "CheapFlights <onboarding@resend.dev>",
      to: [booking.contact_email],
      subject: `✅ Booking Confirmed - ${bookingRef} | CheapFlights`,
      html: htmlContent,
    });

    logStep("Email sent successfully", { messageId: emailResponse.data?.id });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Confirmation email sent",
        messageId: emailResponse.data?.id 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    logStep("Error sending email", { error: error.message });
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send confirmation email" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
