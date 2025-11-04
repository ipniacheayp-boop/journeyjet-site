import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TravellerDetails {
  name: string;
  gender?: string;
  dob?: string;
}

interface FlightDetails {
  airline: string;
  flightNo: string;
  departureCity: string;
  arrivalCity: string;
  departureTime: string;
  arrivalTime?: string;
}

interface ConfirmationRequest {
  agentId: string;
  clientEmail: string;
  bookingRef: string;
  travellers: TravellerDetails[];
  flightDetails: FlightDetails[];
  totalFare: number;
  currency: string;
  paymentMethod: string;
  agentPhone: string;
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[agent-send-confirmation] Request received");

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error("[agent-send-confirmation] Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("[agent-send-confirmation] Authenticated user:", user.id);

    // Parse request body
    const requestData: ConfirmationRequest = await req.json();

    console.log("[agent-send-confirmation] Processing confirmation for:", requestData.clientEmail);

    // Validate required fields
    const requiredFields = ['clientEmail', 'bookingRef', 'travellers', 'flightDetails', 'totalFare', 'agentPhone'];
    for (const field of requiredFields) {
      if (!requestData[field as keyof ConfirmationRequest]) {
        return new Response(
          JSON.stringify({ success: false, error: `Missing required field: ${field}` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Verify agent profile exists and belongs to user
    const { data: agentProfile, error: profileError } = await supabaseClient
      .from("agent_profiles")
      .select("id, company_name, agent_code, phone")
      .eq("id", requestData.agentId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError || !agentProfile) {
      console.error("[agent-send-confirmation] Agent profile error:", profileError);
      return new Response(
        JSON.stringify({ error: "Agent profile not found or unauthorized" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("[agent-send-confirmation] Agent verified:", agentProfile.agent_code);

    // Initialize Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("[agent-send-confirmation] RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const resend = new Resend(resendApiKey);

    // Generate detailed HTML email (PDF-style layout)
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background: linear-gradient(135deg, #0b69ff 0%, #1e3a8a 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
    .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px; }
    .content { padding: 30px; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 18px; font-weight: bold; color: #212121; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #0b69ff; }
    .booking-ref { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
    .booking-ref .label { color: #666; font-size: 14px; margin-bottom: 8px; }
    .booking-ref .value { color: #0b69ff; font-size: 32px; font-weight: bold; letter-spacing: 1px; }
    .booking-ref .date { color: #999; font-size: 12px; margin-top: 10px; }
    .info-card { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 15px; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .info-label { color: #666; font-size: 14px; }
    .info-value { color: #212121; font-size: 14px; font-weight: 500; }
    .flight-card { background: linear-gradient(135deg, #f8f9fa 0%, #e8eaf0 100%); padding: 25px; border-radius: 10px; margin-bottom: 15px; border-left: 4px solid #0b69ff; }
    .flight-card .airline { color: #0b69ff; font-size: 18px; font-weight: bold; margin-bottom: 15px; }
    .flight-card .route { color: #212121; font-size: 16px; margin: 8px 0; }
    .flight-card .route-arrow { color: #0b69ff; font-weight: bold; margin: 0 8px; }
    .flight-card .time { color: #666; font-size: 14px; margin-top: 10px; }
    .payment-summary { background: linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%); padding: 25px; border-radius: 10px; border-left: 4px solid #ff6b6b; }
    .payment-summary .total { color: #ff6b6b; font-size: 24px; font-weight: bold; margin-top: 10px; }
    .message-box { background: #fffbf0; border-left: 4px solid #ffc107; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .message-box p { color: #333; margin: 0; line-height: 1.6; font-style: italic; }
    .contact-info { text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; margin-top: 30px; }
    .contact-info p { color: #666; margin: 5px 0; font-size: 14px; }
    .footer { background: #0b69ff; padding: 30px; text-align: center; color: white; }
    .footer p { margin: 5px 0; font-size: 14px; }
    @media only screen and (max-width: 600px) {
      .content { padding: 20px; }
      .header { padding: 30px 20px; }
      .booking-ref .value { font-size: 24px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>✈️ Your Booking is Confirmed!</h1>
      <p>FlyWithAnurag</p>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Booking Reference -->
      <div class="booking-ref">
        <div class="label">Booking Reference</div>
        <div class="value">${requestData.bookingRef}</div>
        <div class="date">Booking Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>

      <!-- Traveler Details -->
      <div class="section">
        <div class="section-title">Traveler Details</div>
        ${requestData.travellers.map((traveller, index) => `
          <div class="info-card">
            <div class="info-row">
              <span class="info-label">Passenger ${index + 1}</span>
              <span class="info-value">${traveller.name}</span>
            </div>
            ${traveller.gender ? `
              <div class="info-row">
                <span class="info-label">Gender</span>
                <span class="info-value">${traveller.gender}</span>
              </div>
            ` : ''}
            ${traveller.dob ? `
              <div class="info-row">
                <span class="info-label">Date of Birth</span>
                <span class="info-value">${new Date(traveller.dob).toLocaleDateString('en-US')}</span>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>

      <!-- Flight Details -->
      <div class="section">
        <div class="section-title">Flight Details</div>
        ${requestData.flightDetails.map((flight, index) => {
          const depTime = new Date(flight.departureTime);
          return `
            <div class="flight-card">
              <div class="airline">${flight.airline} - ${flight.flightNo}</div>
              <div class="route">
                ${flight.departureCity}
                <span class="route-arrow">→</span>
                ${flight.arrivalCity}
              </div>
              <div class="time">
                <strong>Departure:</strong> ${depTime.toLocaleString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric',
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              ${flight.arrivalTime ? `
                <div class="time">
                  <strong>Arrival:</strong> ${new Date(flight.arrivalTime).toLocaleString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric',
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>

      <!-- Payment Summary -->
      <div class="section">
        <div class="section-title">Payment Summary</div>
        <div class="payment-summary">
          <div class="info-row">
            <span class="info-label">Payment Method</span>
            <span class="info-value">${requestData.paymentMethod}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status</span>
            <span class="info-value" style="color: #22c55e;">✓ Paid</span>
          </div>
          <div class="total">${requestData.currency} ${requestData.totalFare.toFixed(2)}</div>
        </div>
      </div>

      <!-- Custom Message -->
      ${requestData.message ? `
        <div class="message-box">
          <p>${requestData.message}</p>
        </div>
      ` : ''}

      <!-- Contact Information -->
      <div class="contact-info">
        <p><strong>Need Assistance?</strong></p>
        <p>Contact your agent at: <strong>${requestData.agentPhone}</strong></p>
        <p>Agent Code: <strong>${agentProfile.agent_code}</strong></p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Thank you for booking with FlyWithAnurag. Safe travels!</strong></p>
      <p>© FlyWithAnurag LLC | 815 Superior Ave, Cleveland, OH 44114</p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email
    console.log("[agent-send-confirmation] Sending booking confirmation email...");
    const emailResponse = await resend.emails.send({
      from: "FlyWithAnurag <onboarding@resend.dev>",
      to: [requestData.clientEmail],
      subject: `✈️ Booking Confirmation - ${requestData.bookingRef}`,
      html: htmlContent,
    });

    console.log("[agent-send-confirmation] Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Booking confirmation sent successfully',
        messageId: emailResponse.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error("[agent-send-confirmation] Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An unexpected error occurred'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
