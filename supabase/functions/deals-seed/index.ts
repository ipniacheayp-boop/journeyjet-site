import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Demo deals based on CheapFlightsFares structure
const generateDemoDeals = (count: number) => {
  const origins = [
    { city: 'New York', code: 'JFK' },
    { city: 'Los Angeles', code: 'LAX' },
    { city: 'Chicago', code: 'ORD' },
    { city: 'Miami', code: 'MIA' },
    { city: 'San Francisco', code: 'SFO' },
    { city: 'Seattle', code: 'SEA' },
    { city: 'Boston', code: 'BOS' },
    { city: 'Denver', code: 'DEN' },
  ];

  const destinations = [
    { city: 'Las Vegas', code: 'LAS' },
    { city: 'Orlando', code: 'MCO' },
    { city: 'Cancun', code: 'CUN' },
    { city: 'London', code: 'LHR' },
    { city: 'Paris', code: 'CDG' },
    { city: 'Tokyo', code: 'NRT' },
    { city: 'Dubai', code: 'DXB' },
    { city: 'Sydney', code: 'SYD' },
    { city: 'Barcelona', code: 'BCN' },
    { city: 'Rome', code: 'FCO' },
  ];

  const airlines = ['Spirit', 'Frontier', 'United', 'American', 'Delta', 'JetBlue', 'Southwest'];
  const classes = ['Economy', 'Business'];
  const tags = ['last-minute', 'under-99', 'under-299', 'under-499', 'weekend-special', 'senior-discount', 'student-deal', 'business-class'];

  const deals = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const origin = origins[Math.floor(Math.random() * origins.length)];
    const destination = destinations[Math.floor(Math.random() * destinations.length)];
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const cabinClass = classes[Math.floor(Math.random() * classes.length)];
    
    const daysAhead = Math.floor(Math.random() * 90) + 7; // 7-97 days ahead
    const dateFrom = new Date(now);
    dateFrom.setDate(dateFrom.getDate() + daysAhead);
    
    const tripDuration = Math.floor(Math.random() * 10) + 3; // 3-12 days
    const dateTo = new Date(dateFrom);
    dateTo.setDate(dateTo.getDate() + tripDuration);

    const basePrice = cabinClass === 'Economy' 
      ? Math.floor(Math.random() * 500) + 50
      : Math.floor(Math.random() * 1500) + 500;
    
    const discount = Math.random() * 0.4 + 0.1; // 10-50% discount
    const price = Math.round(basePrice * (1 - discount));
    
    const dealTags = [];
    if (price < 99) dealTags.push('under-99');
    else if (price < 299) dealTags.push('under-299');
    else if (price < 499) dealTags.push('under-499');
    
    if (daysAhead < 14) dealTags.push('last-minute');
    if (Math.random() > 0.7) dealTags.push('weekend-special');
    if (cabinClass === 'Business') dealTags.push('business-class');

    const slug = `${origin.city.toLowerCase().replace(/ /g, '-')}-${destination.city.toLowerCase().replace(/ /g, '-')}-${dateFrom.toISOString().split('T')[0]}`;

    deals.push({
      slug,
      title: `${origin.city} → ${destination.city}`,
      origin_city: origin.city,
      origin_code: origin.code,
      dest_city: destination.city,
      dest_code: destination.code,
      airline,
      airline_code: airline.substring(0, 2).toUpperCase(),
      class: cabinClass,
      date_from: dateFrom.toISOString().split('T')[0],
      date_to: dateTo.toISOString().split('T')[0],
      price_usd: price,
      original_price_usd: basePrice,
      currency: 'USD',
      images: ['/deal-beach.jpg', '/deal-paris.jpg', '/deal-nyc.jpg', '/deal-tokyo.jpg'][Math.floor(Math.random() * 4)],
      tags: dealTags,
      featured: Math.random() > 0.8,
      published: true,
      short_description: `Roundtrip from ${origin.code} to ${destination.code}. Starting from $${price} per person.`,
      description: `Amazing deal! Fly from ${origin.city} to ${destination.city} with ${airline}. This ${cabinClass.toLowerCase()} class deal includes roundtrip flights departing ${dateFrom.toLocaleDateString()} and returning ${dateTo.toLocaleDateString()}. Book now for only $${price} per person!`,
      source: 'seed',
    });
  }

  return deals;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const count = parseInt(url.searchParams.get('count') || '50');

    if (count > 1000) {
      return new Response(
        JSON.stringify({ error: 'Maximum count is 1000' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating ${count} demo deals...`);
    const deals = generateDemoDeals(count);

    console.log('Inserting deals into database...');
    const { data, error } = await supabase
      .from('deals')
      .upsert(deals, { onConflict: 'slug' })
      .select();

    if (error) {
      console.error('Error seeding deals:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully seeded ${data?.length || 0} deals`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully seeded ${data?.length || 0} deals`,
        count: data?.length || 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});