import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("CheapFlights chat request:", { messageCount: messages?.length });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: `You are the official assistant for ChyeapFlights.

You must ONLY answer questions using information available on the ChyeapFlights website. Here is the website content you can reference:

ABOUT CHYEAPFLIGHTS:
- ChyeapFlights is a travel booking platform offering flights, hotels, cars, and cruise deals
- We help travelers find the best prices and deals for their trips
- Contact: +1-315-625-6865, support available 24/7

SERVICES OFFERED:
- Flight bookings (domestic and international)
- Hotel reservations
- Car rentals
- Cruise deals and packages
- Travel deals and promotions

BOOKING PROCESS:
1. Search for your destination and dates
2. Compare prices from multiple airlines/providers
3. Select your preferred option
4. Enter passenger details
5. Complete payment securely
6. Receive confirmation via email

TAXES & FEES:
- All prices include applicable taxes
- Service fees may apply for certain bookings
- Cancellation and refund policies vary by booking type
- See Taxes & Fees page for detailed breakdown

PAYMENT OPTIONS:
- Credit/Debit cards accepted
- Secure payment processing
- Multiple currency support

CUSTOMER SUPPORT:
- 24/7 phone support available
- Email support for non-urgent queries
- Live chat assistance on website
- Help with booking modifications, cancellations, and refunds

REFUND POLICY:
- Refund eligibility depends on fare type and airline policy
- Processing time varies (5-10 business days typically)
- Some bookings may have cancellation fees

PRIVACY & TERMS:
- We protect your personal information
- Secure data handling practices
- See Privacy Policy and Terms & Conditions for full details

If the answer is not found in the above website information, respond with:
"I can only answer based on information available on our website. Please contact our support team at +1-315-625-6865 for further assistance, or visit our Contact Us page."

Do not guess or add external knowledge. Do not provide information about destinations, travel tips, or general travel advice that is not specifically from ChyeapFlights website content.` 
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again in a moment." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(
          JSON.stringify({ error: "AI service unavailable. Please contact support." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to connect to AI service" }), 
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("CheapFlights chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
