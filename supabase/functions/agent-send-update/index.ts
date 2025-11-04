import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendUpdateRequest {
  agentId: string;
  clientEmail: string;
  bookingRef?: string;
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[agent-send-update] Request received");

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
      console.error("[agent-send-update] Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("[agent-send-update] Authenticated user:", user.id);

    // Parse request body
    const { agentId, clientEmail, bookingRef, message }: SendUpdateRequest = await req.json();

    console.log("[agent-send-update] Params:", { agentId, clientEmail, bookingRef, messageLength: message?.length });

    // Validate input
    if (!agentId || !clientEmail || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: agentId, clientEmail, or message" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify agent profile exists and belongs to user
    const { data: agentProfile, error: profileError } = await supabaseClient
      .from("agent_profiles")
      .select("id, company_name, agent_code")
      .eq("id", agentId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError || !agentProfile) {
      console.error("[agent-send-update] Agent profile error:", profileError);
      return new Response(
        JSON.stringify({ error: "Agent profile not found or unauthorized" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("[agent-send-update] Agent verified:", agentProfile.agent_code);

    // Initialize Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("[agent-send-update] RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const resend = new Resend(resendApiKey);

    // Compose email
    const subject = bookingRef 
      ? `Booking Update: ${bookingRef}` 
      : "Update from Your Travel Agent";

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Travel Update</h2>
        ${bookingRef ? `<p style="color: #666;"><strong>Booking Reference:</strong> ${bookingRef}</p>` : ''}
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #333; white-space: pre-wrap;">${message}</p>
        </div>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">
          This message was sent by ${agentProfile.company_name} (Agent Code: ${agentProfile.agent_code})<br/>
          If you have any questions, please reply to this email.
        </p>
      </div>
    `;

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "JourneyJet Travel <onboarding@resend.dev>",
      to: [clientEmail],
      subject: subject,
      html: htmlContent,
    });

    console.log("[agent-send-update] Email sent:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: emailResponse.id 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error("[agent-send-update] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
