import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const usaNames = [
  "Emily Johnson", "Michael Smith", "Sarah Williams", "David Brown", "Jessica Davis",
  "Christopher Miller", "Ashley Wilson", "Matthew Moore", "Amanda Taylor", "Joshua Anderson",
  "Jennifer Thomas", "Daniel Jackson", "Melissa White", "Andrew Harris", "Stephanie Martin",
  "James Thompson", "Elizabeth Garcia", "Ryan Martinez", "Nicole Robinson", "Brandon Clark",
  "Rebecca Rodriguez", "Justin Lewis", "Laura Lee", "Kevin Walker", "Rachel Hall",
  "Tyler Allen", "Samantha Young", "Jason King", "Heather Wright", "Brian Lopez",
  "Michelle Hill", "Aaron Scott", "Kimberly Green", "Jacob Adams", "Lauren Baker",
  "Nicholas Nelson", "Christina Carter", "Eric Mitchell", "Amber Perez", "Jonathan Roberts",
  "Megan Turner", "Alexander Phillips", "Kayla Campbell", "Benjamin Parker", "Hannah Evans",
  "Zachary Edwards", "Brittany Collins", "Nathan Stewart", "Victoria Morris", "Ethan Rogers",
  "Alexis Reed", "Kyle Cook", "Madison Morgan", "Connor Bell", "Taylor Murphy",
  "Jordan Bailey", "Courtney Rivera", "Cameron Cooper", "Danielle Richardson", "Austin Cox",
  "Jasmine Howard", "Dylan Ward", "Olivia Torres", "Luke Peterson", "Grace Gray",
  "Gabriel Ramirez", "Sophia James", "Isaac Watson", "Emma Brooks", "Owen Kelly",
  "Ava Sanders", "Mason Price", "Isabella Bennett", "Logan Wood", "Chloe Barnes",
  "Jackson Ross", "Lily Henderson", "Aiden Coleman", "Ella Jenkins", "Carter Perry",
  "Natalie Powell", "Wyatt Long", "Zoe Patterson", "Hunter Hughes", "Addison Flores",
  "Landon Washington", "Brooklyn Butler", "Caleb Simmons", "Savannah Foster", "Noah Gonzales",
  "Audrey Bryant", "Levi Alexander", "Claire Russell", "Christian Griffin", "Anna Diaz",
  "Jonathan Hayes", "Allison Myers", "Elijah Ford", "Julia Hamilton", "Thomas Graham",
  "Hailey Sullivan", "Jack Wallace", "Mackenzie Woods", "Samuel Cole", "Morgan West",
];

const usaCities = [
  "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Phoenix, AZ",
  "Philadelphia, PA", "San Antonio, TX", "San Diego, CA", "Dallas, TX", "San Jose, CA",
  "Austin, TX", "Jacksonville, FL", "Fort Worth, TX", "Columbus, OH", "Charlotte, NC",
  "San Francisco, CA", "Indianapolis, IN", "Seattle, WA", "Denver, CO", "Washington, DC",
  "Boston, MA", "Nashville, TN", "Detroit, MI", "Portland, OR", "Las Vegas, NV",
  "Memphis, TN", "Louisville, KY", "Baltimore, MD", "Milwaukee, WI", "Albuquerque, NM",
  "Tucson, AZ", "Fresno, CA", "Sacramento, CA", "Kansas City, MO", "Mesa, AZ",
  "Atlanta, GA", "Omaha, NE", "Colorado Springs, CO", "Raleigh, NC", "Miami, FL",
  "Oakland, CA", "Minneapolis, MN", "Tulsa, OK", "Cleveland, OH", "Wichita, KS",
  "Arlington, TX", "New Orleans, LA", "Bakersfield, CA", "Tampa, FL", "Honolulu, HI",
];

const flightReviews = [
  "Booked a last-minute flight and got an amazing deal! The booking process was super smooth and customer service was helpful when I had questions.",
  "Found the perfect flight for my family vacation. The search filters made it easy to find exactly what we needed. Highly recommend!",
  "Great experience booking our flights. The prices were competitive and the confirmation came through immediately. Will definitely use again.",
  "Saved over $400 on our round-trip tickets! The website was easy to navigate and checkout was seamless. Very satisfied with the service.",
  "Excellent service! Found multiple flight options and was able to compare prices easily. The booking process was straightforward.",
  "Used this site for my business trip and was impressed. Quick booking, good prices, and reliable confirmation. No issues at all.",
  "Best flight booking experience I've had. The interface is clean, prices are transparent, and I found exactly what I was looking for.",
  "Booked flights for our honeymoon and couldn't be happier! Great deals and the customer support team was amazing when we needed to make changes.",
  "Very reliable service. I've booked several flights now and every time it's been smooth sailing. Prices are always competitive.",
  "The search functionality is fantastic. Found connecting flights that saved me both time and money. Will use this for all future bookings.",
];

const hotelReviews = [
  "Found an incredible hotel deal through this site! The selection was great and booking was effortless. The hotel exceeded our expectations.",
  "Booked a hotel for our anniversary and the process was so easy. Great prices and plenty of options to choose from.",
  "Very impressed with the hotel options available. Found a perfect location at a great price. The booking confirmation was instant.",
  "Used this for my work trip and found excellent business hotels at reasonable rates. The filters helped narrow down exactly what I needed.",
  "Fantastic experience! Booked a resort for our family and everyone loved it. The site made it easy to compare amenities and prices.",
  "Hotel booking was seamless. Great variety of properties and the reviews helped us make the right choice. Very satisfied!",
  "Found our dream vacation hotel through this platform. Excellent prices and the booking process was quick and secure.",
  "Regularly use this site for hotel bookings. Never had any issues and always find competitive rates. Highly recommend!",
];

const generalReviews = [
  "Outstanding service from start to finish! Made planning our trip so much easier. Everything went smoothly and we saved money too.",
  "This is my go-to travel booking site now. Easy to use, great prices, and reliable service every time.",
  "Impressed with the overall experience. From searching to booking to confirmation, everything was professional and efficient.",
  "Can't say enough good things about this service. Saved time, saved money, and had zero issues. Will definitely use again!",
  "Fantastic platform for all travel needs. The customer service is responsive and helpful. Booking is always hassle-free.",
  "Been using this site for over a year now and it never disappoints. Best prices and most reliable service I've found.",
  "Great experience every single time. Whether it's flights, hotels, or both, this site delivers. Highly recommended!",
  "Simple, fast, and affordable. What more could you ask for? This is hands down the best travel booking site.",
  "Professional service, competitive pricing, and easy booking. Check all the boxes for me. Very satisfied customer!",
  "Love this platform! Makes travel planning stress-free. Always find what I need at prices I can afford.",
];

const allReviews = [...flightReviews, ...hotelReviews, ...generalReviews];

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
    
    console.log(`Generating ${count} realistic USA reviews...`);

    const reviews = [];
    const now = new Date();
    
    for (let i = 0; i < count; i++) {
      // Random rating: 80% 5-star, 15% 4.5-star, 5% 4-star
      const rand = Math.random();
      let rating;
      if (rand < 0.80) {
        rating = 5;
      } else if (rand < 0.95) {
        rating = 4;
      } else {
        rating = 4;
      }
      
      const name = usaNames[Math.floor(Math.random() * usaNames.length)];
      const city = usaCities[Math.floor(Math.random() * usaCities.length)];
      
      // Random date within last 90 days
      const daysAgo = Math.floor(Math.random() * 90);
      const createdAt = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      
      const body = allReviews[Math.floor(Math.random() * allReviews.length)];
      
      // Generate titles based on rating
      let title;
      if (rating === 5) {
        const titles = [
          "Excellent Service!",
          "Highly Recommend",
          "Best Travel Site",
          "Outstanding Experience",
          "Will Use Again!",
          "Amazing Deals",
          "Perfect Trip Planning",
          "Five Stars All Around",
        ];
        title = titles[Math.floor(Math.random() * titles.length)];
      } else {
        const titles = [
          "Great Experience",
          "Very Good Service",
          "Solid Choice",
          "Reliable Platform",
          "Good Value",
          "Satisfied Customer",
        ];
        title = titles[Math.floor(Math.random() * titles.length)];
      }
      
      reviews.push({
        display_name: `${name} from ${city}`,
        reviewer_name: name,
        country: "United States",
        rating,
        title,
        body,
        helpful_count: Math.floor(Math.random() * 30),
        is_featured: i < 30, // First 30 are featured
        is_deleted: false,
        demo: false, // IMPORTANT: These are treated as REAL reviews
        booking_type: null,
        travel_route: null,
        created_at: createdAt.toISOString(),
        updated_at: createdAt.toISOString(),
        user_id: null, // No user association for seeded reviews
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

    console.log(`Successfully seeded ${inserted} realistic USA reviews`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully created ${inserted} realistic reviews`,
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
