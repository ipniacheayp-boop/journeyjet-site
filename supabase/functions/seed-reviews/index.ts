import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const names = [
  "John Smith", "Emma Johnson", "Michael Williams", "Sarah Brown", "David Jones",
  "Maria Garcia", "James Miller", "Patricia Davis", "Robert Rodriguez", "Jennifer Martinez",
  "William Anderson", "Lisa Taylor", "Richard Thomas", "Nancy Hernandez", "Joseph Moore",
  "Margaret Martin", "Charles Jackson", "Betty Thompson", "Thomas White", "Sandra Lopez",
  "Christopher Lee", "Helen Gonzalez", "Daniel Harris", "Ashley Clark", "Paul Lewis",
  "Karen Robinson", "Mark Walker", "Laura Hall", "Donald Allen", "Emily Young",
  "Steven King", "Michelle Wright", "Andrew Scott", "Kimberly Green", "Kenneth Adams",
  "Jessica Baker", "Brian Nelson", "Amanda Hill", "George Ramirez", "Stephanie Campbell",
  "Edward Mitchell", "Rebecca Roberts", "Ronald Carter", "Melissa Phillips", "Anthony Evans",
  "Deborah Turner", "Kevin Collins", "Elizabeth Edwards", "Jason Stewart", "Dorothy Morris"
];

const countries = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Spain", "Italy", "Mexico", "India",
  "Brazil", "Netherlands", "Sweden", "Switzerland", "Ireland"
];

const routes = [
  "New York → Los Angeles", "Miami → Chicago", "San Francisco → Seattle",
  "London → Paris", "Madrid → Barcelona", "Tokyo → Osaka",
  "Sydney → Melbourne", "Toronto → Vancouver", "Berlin → Munich",
  "Rome → Venice", "Dubai → Mumbai", "Singapore → Bangkok"
];

const comments5Star = [
  "Absolutely fantastic service! Found the perfect flight at an amazing price. Booking was smooth and easy.",
  "Best travel booking experience ever. The customer support team was incredibly helpful throughout.",
  "Saved over $300 on my international flight! The deals are real and the service is top-notch.",
  "Highly recommend! Quick booking process and excellent customer service. Will definitely use again.",
  "Amazing platform for finding great flight deals. The interface is user-friendly and prices are unbeatable.",
  "Couldn't be happier with my booking experience. Everything was seamless from search to confirmation.",
  "Outstanding service! The team went above and beyond to help me find the best routes and prices.",
  "This is now my go-to site for booking flights. Fast, reliable, and always competitive prices.",
  "Exceptional experience! Saved a ton of money and the booking process was incredibly straightforward.",
  "Five stars all the way! Great deals, easy booking, and responsive customer support.",
  "Wonderful service from start to finish. Found exactly what I needed at a price I could afford.",
  "The best flight booking site I've used. Clean interface, great prices, and reliable service.",
  "Impressed with the variety of options and competitive pricing. Booking was quick and hassle-free.",
  "Superb experience! The platform made it easy to compare options and choose the best deal.",
  "Can't say enough good things about this service. Saved money and time on my recent booking.",
  "Excellent platform with genuine deals. Customer service was prompt and very helpful.",
  "Fantastic service! Found a last-minute deal that saved me hundreds. Highly recommended!",
  "Very pleased with the entire experience. Great prices and smooth booking process.",
  "This site made planning my trip so much easier. Found perfect flights at great prices.",
  "Outstanding value and service. The booking process was simple and customer support was excellent.",
];

const comments45Star = [
  "Great service overall. Found a good deal though the search took a bit of time.",
  "Very satisfied with my booking. Minor delays in customer service response but otherwise excellent.",
  "Good experience booking through this site. Would use again with confidence.",
  "Solid platform with competitive prices. Navigation could be slightly improved but overall great.",
  "Happy with my purchase. The booking process was mostly smooth with just a few minor hiccups.",
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const url = new URL(req.url);
    const count = parseInt(url.searchParams.get('count') || '1000');
    
    console.log(`Generating ${count} seed reviews...`);

    const reviews = [];
    const now = new Date();
    
    for (let i = 0; i < count; i++) {
      // 80% 5-star, 20% 4.5-star
      const rating = Math.random() < 0.8 ? 5 : 4.5;
      const name = names[Math.floor(Math.random() * names.length)];
      const country = countries[Math.floor(Math.random() * countries.length)];
      
      // Random date within last 24 months
      const daysAgo = Math.floor(Math.random() * 730);
      const createdAt = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      
      const comments = rating === 5 ? comments5Star : comments45Star;
      const body = comments[Math.floor(Math.random() * comments.length)];
      
      const route = Math.random() < 0.3 ? routes[Math.floor(Math.random() * routes.length)] : '';
      const title = route ? `Great flight on ${route}` : 'Excellent Service';
      
      reviews.push({
        display_name: `${name} (${country})`,
        rating: Math.floor(rating), // Store as integer (5 or 4)
        title,
        body,
        helpful_count: Math.floor(Math.random() * 50),
        is_featured: i < 20, // First 20 are featured
        is_deleted: false,
        created_at: createdAt.toISOString(),
        updated_at: createdAt.toISOString(),
      });
    }

    // Insert in batches of 100
    const batchSize = 100;
    let inserted = 0;
    
    for (let i = 0; i < reviews.length; i += batchSize) {
      const batch = reviews.slice(i, i + batchSize);
      const { error } = await supabaseClient
        .from('site_reviews')
        .insert(batch);
      
      if (error) {
        console.error('Error inserting batch:', error);
        throw error;
      }
      
      inserted += batch.length;
      console.log(`Inserted ${inserted}/${reviews.length} reviews`);
    }

    console.log(`Successfully seeded ${inserted} reviews`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully created ${inserted} reviews`,
        inserted 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error seeding reviews:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});