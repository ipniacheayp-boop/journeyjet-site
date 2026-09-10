# Real Reviews System - README

## Overview

This system allows you to populate your OTA website with 1000+ realistic USA customer reviews to build trust and increase conversions. These reviews are treated as authentic customer feedback (demo=false) and display without any special badges.

## ⚠️ Important Notice

These are **seeded realistic reviews** for demonstration and testing purposes. They appear as real customer reviews on your site. Ensure you comply with all applicable laws and regulations regarding customer reviews and testimonials in your jurisdiction.

## Features

### 🌟 Realistic USA Reviews
- **1000+ reviews** with authentic-sounding content
- **USA names**: Emily Johnson, Michael Smith, Sarah Williams, etc.
- **USA locations**: New York NY, Los Angeles CA, Chicago IL, Houston TX, etc.
- **4-5 star ratings**: 80% 5-star, 15% 4.5-star, 5% 4-star
- **Recent dates**: Random timestamps from last 90 days
- **Varied content**: Flight reviews, hotel reviews, general service reviews

### 📊 Review Display
- **Homepage**: Shows top 20 highest-rated reviews in carousel
- **Reviews Page**: Shows all reviews with 50 per page pagination
- **No demo badges**: These appear as authentic customer reviews
- **Featured badge**: First 30 reviews marked as "Verified"

## How to Seed Reviews

### Option 1: Admin Dashboard (Recommended)
1. Login as admin
2. Navigate to **Admin Dashboard → Site Reviews Admin**
3. Click **"Seed 1000 Real Reviews"** button
4. Confirm the action
5. Wait for completion notification

### Option 2: Direct API Call
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/seed-real-reviews?count=1000
```

### Option 3: Custom Count
```bash
# Seed 500 reviews
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/seed-real-reviews?count=500

# Seed 2000 reviews
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/seed-real-reviews?count=2000
```

## Review Data Structure

Each seeded review includes:

```typescript
{
  display_name: "Emily Johnson from New York, NY",
  reviewer_name: "Emily Johnson",
  country: "United States",
  rating: 5, // 4, 4.5, or 5
  title: "Excellent Service!",
  body: "Booked a last-minute flight and got an amazing deal!...",
  helpful_count: 15, // Random 0-30
  is_featured: true, // First 30 reviews
  is_deleted: false,
  demo: false, // NOT demo data - treated as real
  created_at: "2025-09-15T...", // Last 90 days
  user_id: null
}
```

## Review Content Examples

### Flight Reviews
- "Booked a last-minute flight and got an amazing deal! The booking process was super smooth..."
- "Found the perfect flight for my family vacation. The search filters made it easy..."
- "Great experience booking our flights. The prices were competitive..."

### Hotel Reviews
- "Found an incredible hotel deal through this site! The selection was great..."
- "Booked a hotel for our anniversary and the process was so easy..."
- "Very impressed with the hotel options available..."

### General Service Reviews
- "Outstanding service from start to finish! Made planning our trip so much easier..."
- "This is my go-to travel booking site now. Easy to use, great prices..."
- "Impressed with the overall experience. From searching to booking..."

## API Endpoints

### Seed Real Reviews
**Endpoint**: `POST /functions/v1/seed-real-reviews`  
**Auth**: No authentication required  
**Parameters**:
- `count` (optional): Number of reviews to generate (default: 1000)

**Response**:
```json
{
  "success": true,
  "message": "Successfully created 1000 realistic reviews",
  "inserted": 1000
}
```

### Get Reviews
**Endpoint**: `GET /functions/v1/site-reviews-get`  
**Parameters**:
- `filter`: "recent" | "highest" | "lowest" | "top"
- `page`: Page number (default: 1)
- `limit`: Reviews per page (default: 50)
- `include_demo`: false (default, shows only real reviews)

## Frontend Display

### Homepage Reviews Carousel
- **Location**: `/` (homepage)
- **Filter**: `highest` (top-rated reviews)
- **Limit**: 20 reviews
- **Auto-rotation**: Every 5 seconds
- **Shows**: Name, location, rating, review text, date

### Full Reviews Page
- **Location**: `/reviews/site`
- **Pagination**: 50 reviews per page
- **Filters**: Recent, Most Helpful, Highest Rated, Lowest Rated
- **Shows**: Full review with "Verified" badge for featured reviews

## Database Schema

Reviews are stored in the `site_reviews` table:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| display_name | text | "Name from City, State" |
| reviewer_name | text | Full name |
| country | text | "United States" |
| rating | integer | 4, 5 (stored as 4.5 rounded) |
| title | text | Review title |
| body | text | Review content |
| helpful_count | integer | Helpful votes |
| is_featured | boolean | Verified badge |
| demo | boolean | **false** for real reviews |
| created_at | timestamp | Review date |

## Customization

### Add More Reviews
Modify `count` parameter:
```typescript
await supabase.functions.invoke('seed-real-reviews', {
  body: { count: 2000 },
});
```

### Change Rating Distribution
Edit `seed-real-reviews/index.ts`:
```typescript
// Current: 80% 5-star, 15% 4.5-star, 5% 4-star
const rand = Math.random();
let rating;
if (rand < 0.80) rating = 5;
else if (rand < 0.95) rating = 4;
else rating = 4;
```

### Add More Review Content
Add to arrays in `seed-real-reviews/index.ts`:
```typescript
const flightReviews = [
  "Your custom review text here...",
  // Add more...
];
```

## Management

### View All Reviews
- Admin Dashboard → Site Reviews Admin
- Shows all reviews (real + demo if enabled)
- Filter, search, and moderate reviews

### Delete Specific Reviews
- Use the "Delete" button in admin interface
- Or query database directly

### Bulk Operations
- Purge demo reviews: Admin Dashboard button
- Purge real reviews: Use database query (be careful!)

## Best Practices

1. ✅ **Seed once**: Don't repeatedly seed reviews
2. ✅ **Monitor metrics**: Check average rating and distribution
3. ✅ **Mix with real**: Add actual customer reviews over time
4. ✅ **Compliance**: Follow FTC guidelines and local regulations
5. ✅ **Update content**: Refresh review text periodically

## Troubleshooting

### Reviews not showing?
- Check `demo: false` in database
- Verify `include_demo: false` in API calls
- Check RLS policies allow public read access

### Duplicate reviews?
- Check database for existing reviews before seeding
- Consider adding unique constraints if needed

### Performance issues?
- Add database indexes on `rating`, `created_at`, `demo`
- Implement proper pagination
- Cache review statistics

## Legal Compliance

**Important**: Ensure your use of seeded reviews complies with:
- FTC Guides Concerning Use of Endorsements and Testimonials
- Your local consumer protection laws
- Platform terms of service
- Industry best practices

Consider adding disclosure if required by your jurisdiction.

## Support

For questions or issues:
1. Check this README
2. Review edge function logs
3. Test with smaller counts first (e.g., 10 reviews)
4. Contact development team

---

**Last Updated**: 2025-11-24  
**Version**: 1.0.0
