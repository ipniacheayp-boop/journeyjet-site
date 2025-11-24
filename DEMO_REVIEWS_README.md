# Demo Reviews System - README

## Overview

The Demo Reviews system allows for adding test reviews to the application for UI testing and development purposes. **These are NOT real customer reviews and should NEVER be enabled on a live production site.**

## Safety & Security Warning

⚠️ **CRITICAL**: Demo reviews are for internal development and testing ONLY.
- Adding fake public reviews is fraudulent and violates platform policies
- Do NOT enable demo reviews on the live public site
- Do NOT post fake reviews on third-party platforms (Google, Yelp, Trustpilot, etc.)
- Only use these for internal QA and UI testing

## Features

1. **Seed 1000+ Demo Reviews**: Generate realistic test reviews with varied ratings and comments
2. **Admin Toggle**: Control visibility of demo reviews on the public site (default: OFF)
3. **Visual Labeling**: Demo reviews are clearly marked with a red badge "DEMO — Not a real customer review"
4. **Demo Warning Banner**: When enabled, a warning banner displays at the top of the reviews page
5. **Purge Function**: Easily remove all demo reviews from the database

## Database Schema

The `site_reviews` table includes the following demo-related columns:
- `demo` (boolean): Marks whether the review is a demo/test review (default: false)
- `reviewer_name` (text): Name of the reviewer for demo reviews
- `country` (text): Country of the reviewer
- `booking_type` (text): Type of booking (Flight/Hotel/Car)
- `travel_route` (text): Travel route (optional, e.g., "NYC → LAX")

## How to Use

### 1. Seed Demo Reviews

To generate and insert 1000 demo reviews into the database, call the seed edge function:

```bash
# Default: 1000 reviews
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/seed-reviews

# Custom count: 500 reviews
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/seed-reviews?count=500
```

Or from the frontend:
```typescript
import { supabase } from '@/integrations/supabase/client';

const seedReviews = async (count = 1000) => {
  const { data, error } = await supabase.functions.invoke('seed-reviews', {
    body: { count },
  });
  
  if (error) {
    console.error('Error seeding reviews:', error);
  } else {
    console.log(`Successfully seeded ${data.inserted} reviews`);
  }
};
```

### 2. Enable/Disable Demo Reviews (Admin Only)

Demo reviews are **hidden by default**. To make them visible on the public site:

1. Login as an admin user
2. Navigate to the Admin Dashboard → Site Reviews Admin
3. Toggle "Show demo reviews on site" to ON

Or programmatically:
```typescript
import { supabase } from '@/integrations/supabase/client';

const toggleDemoReviews = async (enabled: boolean) => {
  const { data, error } = await supabase.functions.invoke('admin-settings-update', {
    body: {
      key: 'show_demo_reviews',
      value: { enabled },
    },
  });
};
```

### 3. Purge Demo Reviews (Admin Only)

To permanently delete all demo reviews:

1. Login as an admin user
2. Navigate to the Admin Dashboard → Site Reviews Admin
3. Click "Purge Demo Reviews" button
4. Confirm the action

Or programmatically:
```typescript
import { supabase } from '@/integrations/supabase/client';

const purgeDemoReviews = async () => {
  const { data, error } = await supabase.functions.invoke('admin-reviews-purge-demo');
  
  if (error) {
    console.error('Error purging reviews:', error);
  } else {
    console.log(`Purged ${data.count} demo reviews`);
  }
};
```

## Edge Functions

### 1. `seed-reviews`
- **Purpose**: Generate and insert demo reviews
- **Auth Required**: No (verify_jwt = false)
- **Parameters**: `count` (optional, default: 1000)
- **Returns**: Number of inserted reviews

### 2. `site-reviews-get`
- **Purpose**: Fetch reviews with optional demo filtering
- **Auth Required**: No (verify_jwt = false)
- **Behavior**: 
  - By default, filters OUT demo reviews
  - Includes demo reviews if `show_demo_reviews` setting is enabled
  - Admin can override with `include_demo=true` query param

### 3. `admin-settings-get`
- **Purpose**: Fetch admin settings
- **Auth Required**: Yes (admin only)
- **Parameters**: `key` (optional, returns all if not provided)

### 4. `admin-settings-update`
- **Purpose**: Update admin settings
- **Auth Required**: Yes (admin only)
- **Parameters**: `key`, `value`

### 5. `admin-reviews-purge-demo`
- **Purpose**: Delete all demo reviews
- **Auth Required**: Yes (admin only)
- **Returns**: Count of deleted reviews

## UI Components

### Admin Components
- **SiteReviewsAdmin**: Includes demo controls, toggle, and purge button
- **Admin Warning**: Red alert box warning about demo review misuse

### Public Components
- **SiteReviewCard**: Shows red "DEMO" badge for demo reviews
- **SiteReviews Page**: Shows demo warning banner when enabled

## Demo Review Data

Demo reviews are generated with:
- **80% 5-star ratings** / **20% 4.5-star ratings**
- Realistic US-style names from a pool of 50 names
- "United States" as country
- Random booking types (Flight, Hotel, Car)
- Sample travel routes (NYC → LAX, SFO → LAS, MIA → ORD, etc.)
- Varied positive comments from a pool of review templates
- Random creation dates within the last 24 months
- First 20 reviews are marked as "featured"

## API Endpoints Summary

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/functions/v1/seed-reviews` | POST | No | Seed demo reviews |
| `/functions/v1/site-reviews-get` | GET/POST | No | Fetch reviews (filters demo by default) |
| `/functions/v1/admin-settings-get` | GET | Admin | Get admin settings |
| `/functions/v1/admin-settings-update` | POST | Admin | Update admin settings |
| `/functions/v1/admin-reviews-purge-demo` | POST | Admin | Purge all demo reviews |

## Migration Results

✅ Added `demo` column to `site_reviews` table (boolean, default: false)
✅ Added `reviewer_name`, `country`, `booking_type`, `travel_route` columns
✅ Created `admin_settings` table with RLS policies
✅ Inserted default setting: `show_demo_reviews` = { enabled: false }

## Testing Checklist

- [ ] Seed 1000 demo reviews successfully
- [ ] Demo reviews are hidden by default on public site
- [ ] Admin can toggle demo reviews visibility
- [ ] Demo badge appears on all demo reviews
- [ ] Warning banner shows when demo mode is active
- [ ] Admin can purge all demo reviews
- [ ] Non-demo reviews remain unaffected by demo operations
- [ ] Average rating excludes demo reviews when disabled

## Important Notes

1. **Default State**: Demo reviews are HIDDEN by default
2. **Security**: Only admin users can manage demo settings
3. **Visual Marking**: All demo reviews have a clear red badge
4. **Database Separation**: Demo reviews use a boolean flag, not a separate table
5. **Production Safety**: Clear warnings in admin UI about misuse

## Support

For questions or issues, refer to the main project documentation or contact the development team.
