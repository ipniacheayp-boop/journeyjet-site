import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  console.log(`[PROVIDER-FINALIZE] ${step}`, details ? JSON.stringify(details) : '');
};

// Exponential backoff delay
const getRetryDelay = (attempt: number): number => {
  return Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30 seconds
};

// Generate provider booking reference
const generateProviderRef = (type: string): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let prefix = type === 'flight' ? 'PNR' : type === 'hotel' ? 'HTL' : 'CAR';
  let result = `${prefix}-`;
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Simulate Amadeus flight order creation (in production, this would call actual API)
async function finalizeFlightBooking(booking: any): Promise<{ success: boolean; pnr?: string; orderId?: string; error?: string }> {
  logStep('Finalizing flight booking with provider', { bookingId: booking.id });
  
  try {
    // In production, this would call Amadeus Flight Orders API
    // POST https://api.amadeus.com/v1/booking/flight-orders
    // For now, simulate with success
    
    const bookingDetails = booking.booking_details;
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate 95% success rate for demo purposes
    if (Math.random() < 0.05) {
      throw new Error('Provider temporarily unavailable');
    }
    
    const pnr = generateProviderRef('flight');
    const orderId = `ORD-${Date.now()}`;
    
    logStep('Flight booking finalized', { pnr, orderId });
    
    return { success: true, pnr, orderId };
  } catch (error) {
    logStep('Flight finalization failed', { error: error instanceof Error ? error.message : 'Unknown' });
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Simulate hotel booking confirmation
async function finalizeHotelBooking(booking: any): Promise<{ success: boolean; confirmationId?: string; error?: string }> {
  logStep('Finalizing hotel booking with provider', { bookingId: booking.id });
  
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (Math.random() < 0.05) {
      throw new Error('Hotel provider temporarily unavailable');
    }
    
    const confirmationId = generateProviderRef('hotel');
    
    logStep('Hotel booking finalized', { confirmationId });
    
    return { success: true, confirmationId };
  } catch (error) {
    logStep('Hotel finalization failed', { error: error instanceof Error ? error.message : 'Unknown' });
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Simulate car rental confirmation
async function finalizeCarBooking(booking: any): Promise<{ success: boolean; confirmationId?: string; error?: string }> {
  logStep('Finalizing car booking with provider', { bookingId: booking.id });
  
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (Math.random() < 0.05) {
      throw new Error('Car rental provider temporarily unavailable');
    }
    
    // Car bookings already have confirmation number in booking_details
    const confirmationId = booking.booking_details?.confirmationNumber || generateProviderRef('car');
    
    logStep('Car booking finalized', { confirmationId });
    
    return { success: true, confirmationId };
  } catch (error) {
    logStep('Car finalization failed', { error: error instanceof Error ? error.message : 'Unknown' });
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Main finalization function with retry logic
async function finalizeBookingWithRetry(
  supabaseClient: any,
  bookingId: string,
  maxRetries: number = 3
): Promise<{ success: boolean; providerBookingId?: string; error?: string }> {
  
  // Fetch booking details
  const { data: booking, error: fetchError } = await supabaseClient
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();
  
  if (fetchError || !booking) {
    logStep('ERROR: Booking not found', { bookingId, error: fetchError });
    return { success: false, error: 'Booking not found' };
  }
  
  // Skip if already finalized
  if (booking.amadeus_pnr || booking.amadeus_order_id) {
    logStep('Booking already finalized', { bookingId, pnr: booking.amadeus_pnr });
    return { success: true, providerBookingId: booking.amadeus_pnr || booking.amadeus_order_id };
  }
  
  const bookingType = booking.booking_type;
  let lastError: string = '';
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    logStep(`Attempt ${attempt + 1}/${maxRetries}`, { bookingId, bookingType });
    
    let result: { success: boolean; pnr?: string; orderId?: string; confirmationId?: string; error?: string };
    
    switch (bookingType) {
      case 'flight':
        result = await finalizeFlightBooking(booking);
        break;
      case 'hotel':
        result = await finalizeHotelBooking(booking);
        break;
      case 'car':
        result = await finalizeCarBooking(booking);
        break;
      default:
        logStep('Unknown booking type', { bookingType });
        return { success: false, error: `Unknown booking type: ${bookingType}` };
    }
    
    if (result.success) {
      const providerBookingId = result.pnr || result.confirmationId || result.orderId;
      
      // Update booking with provider reference
      const updateData: any = {
        ticket_issued_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      if (bookingType === 'flight') {
        updateData.amadeus_pnr = result.pnr;
        updateData.amadeus_order_id = result.orderId;
      } else {
        // Store in booking_details for hotels and cars
        const updatedDetails = {
          ...booking.booking_details,
          providerConfirmationId: providerBookingId,
          providerConfirmedAt: new Date().toISOString(),
        };
        updateData.booking_details = updatedDetails;
      }
      
      await supabaseClient
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId);
      
      logStep('Booking finalized successfully', { bookingId, providerBookingId });
      
      return { success: true, providerBookingId };
    }
    
    lastError = result.error || 'Unknown error';
    
    if (attempt < maxRetries - 1) {
      const delay = getRetryDelay(attempt);
      logStep(`Retrying in ${delay}ms`, { attempt, error: lastError });
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // All retries failed - mark booking for admin review
  logStep('All retries exhausted, marking for admin review', { bookingId });
  
  await supabaseClient
    .from('bookings')
    .update({
      payment_status: 'provider_pending',
      updated_at: new Date().toISOString(),
      booking_details: {
        ...booking.booking_details,
        providerError: lastError,
        providerFailedAt: new Date().toISOString(),
        requiresAdminReview: true,
      },
    })
    .eq('id', bookingId);
  
  return { success: false, error: lastError };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId, maxRetries } = await req.json();

    if (!bookingId) {
      return new Response(
        JSON.stringify({ error: 'bookingId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logStep('Provider finalization requested', { bookingId });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const result = await finalizeBookingWithRetry(
      supabaseClient,
      bookingId,
      maxRetries || 3
    );

    if (result.success) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          providerBookingId: result.providerBookingId,
          message: 'Booking finalized with provider'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: result.error,
          message: 'Provider finalization failed after retries'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    logStep('ERROR', { error: error instanceof Error ? error.message : 'Unknown error' });
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
