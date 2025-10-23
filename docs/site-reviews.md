# Site Reviews System Documentation

## Overview
The Site Reviews system allows users to leave reviews and ratings about the overall website experience, separate from booking-specific reviews. This feature includes both frontend components and backend APIs for managing reviews.

---

## Frontend Components

### 1. **SiteReviews Page** (`src/pages/SiteReviews.tsx`)
- **Route**: `/reviews/site`
- **Purpose**: Public-facing page for viewing and submitting site reviews
- **Features**:
  - Average rating display with star visualization
  - Total review count and rating distribution
  - Filter options (Recent, Top, Highest Rated, Lowest Rated)
  - Review submission form (authenticated users only)
  - Edit/delete functionality for own reviews
  - "Helpful" button to mark reviews as helpful
  - SEO-optimized content columns for discoverability

### 2. **SiteReviewCard Component** (`src/components/SiteReviewCard.tsx`)
- Displays individual review with:
  - User display name and avatar
  - Star rating (1-5)
  - Review title (optional) and body
  - Helpful count with interactive button
  - Edit/Delete buttons (for review owner)
  - Featured badge (admin-controlled)

### 3. **SiteReviewsAdmin Component** (`src/components/SiteReviewsAdmin.tsx`)
- Admin-only moderation panel with:
  - Metrics dashboard (average rating, reviews per day, total reviews)
  - Rating distribution chart
  - Search functionality
  - Filter controls
  - Feature/unfeature reviews
  - Soft-delete reviews

### 4. **StarRating Component** (`src/components/StarRating.tsx`)
- Reusable star rating component
- Interactive mode for selection
- Read-only mode for display
- Size variants (sm, md, lg)

---

## Backend API

### Database Schema

#### Table: `site_reviews`
```sql
CREATE TABLE site_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users (nullable for anonymous),
  display_name TEXT NOT NULL,
  title TEXT (optional),
  body TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  helpful_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### Table: `site_review_helpful`
```sql
CREATE TABLE site_review_helpful (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES site_reviews NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(review_id, user_id)
);
```

### Edge Functions

#### 1. `site-reviews-get`
**Endpoint**: `GET /functions/v1/site-reviews-get`

**Query Parameters**:
- `filter`: "recent" | "top" | "highest" | "lowest" (default: "recent")
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "display_name": "John",
      "title": "Great service!",
      "body": "Had an amazing experience...",
      "rating": 5,
      "helpful_count": 12,
      "is_featured": false,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "count": 100,
  "averageRating": 4.5,
  "ratingDistribution": {
    "5": 50,
    "4": 30,
    "3": 15,
    "2": 3,
    "1": 2
  },
  "totalReviews": 100
}
```

#### 2. `site-reviews-create`
**Endpoint**: `POST /functions/v1/site-reviews-create`

**Authentication**: Required

**Request Body**:
```json
{
  "rating": 5,
  "title": "Great experience",
  "body": "I really enjoyed using this service...",
  "displayName": "John",
  "allowAnonymous": false
}
```

**Validation**:
- Rating: 1-5 (required)
- Body: 20-1000 characters (required)
- Title: Max 100 characters (optional)
- Rate limit: 1 review per user per 24 hours

**Response**:
```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "display_name": "John",
    "rating": 5,
    "title": "Great experience",
    "body": "I really enjoyed...",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

#### 3. `site-reviews-update`
**Endpoint**: `PATCH /functions/v1/site-reviews-update/:id`

**Authentication**: Required (owner or admin)

**Request Body** (all optional):
```json
{
  "rating": 4,
  "title": "Updated title",
  "body": "Updated review text",
  "isFeatured": true,
  "isDeleted": false
}
```

**Response**:
```json
{
  "data": {
    "id": "uuid",
    "rating": 4,
    "title": "Updated title",
    "updated_at": "2025-01-01T00:00:00Z"
  }
}
```

#### 4. `site-reviews-helpful`
**Endpoint**: `POST /functions/v1/site-reviews-helpful/:id/helpful`

**Authentication**: Required

**Purpose**: Mark a review as helpful (one per user per review)

**Response**:
```json
{
  "data": {
    "helpful_count": 13
  }
}
```

---

## Admin Usage

### Accessing Admin Panel
1. Navigate to `/admin` (requires admin role)
2. Click on the "Site Reviews" tab
3. View metrics, search, filter, and moderate reviews

### Moderation Actions

#### Feature a Review
1. Find the review in the admin panel
2. Click "Feature" button
3. Featured reviews appear at the top of the list with a badge

#### Delete a Review
1. Find the review to delete
2. Click "Delete" button
3. Confirm deletion
4. Review is soft-deleted (not permanently removed from database)

#### Search Reviews
- Use the search bar to find reviews by user name or content
- Search is case-insensitive

#### Filter Reviews
- **Recent**: Newest reviews first
- **Top**: Most helpful reviews first
- **Highest**: 5-star reviews first
- **Lowest**: 1-star reviews first

### Metrics Dashboard
The admin panel displays:
- **Average Rating**: Overall site rating (out of 5.0)
- **Reviews per Day**: Average reviews per day over last 30 days
- **Total Reviews**: All-time review count
- **Rating Distribution**: Visual breakdown of ratings (5★, 4★, 3★, 2★, 1★)

---

## Stripe Health Check

### Overview
The Stripe Health Check runs automated diagnostics on the Stripe payment integration to ensure proper functionality.

### Edge Function: `stripe-health-check`
**Endpoint**: `GET /functions/v1/stripe-health-check`

**Authentication**: Admin only

**Health Checks Performed**:
1. **Environment Variables**: Validates `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` exist
2. **API Connectivity**: Tests connection to Stripe API by listing recent payment intents
3. **Webhook Status**: Checks if webhook events are being received
4. **Recent Events**: Verifies `checkout.session.completed` events processed successfully
5. **Refund Capability**: Validates refund endpoint functionality

**Response**:
```json
{
  "status": "healthy",
  "checks": {
    "environment": {
      "status": "pass",
      "hasSecretKey": true,
      "hasWebhookSecret": true
    },
    "apiConnectivity": {
      "status": "pass",
      "message": "Successfully connected to Stripe API",
      "lastPaymentIntent": "pi_xxx"
    },
    "webhooks": {
      "status": "pass",
      "recentEvents": 15,
      "lastEventDate": "2025-01-01T00:00:00Z"
    },
    "refunds": {
      "status": "pass",
      "message": "Refund endpoint operational"
    }
  },
  "recommendations": []
}
```

### Viewing Health Check Results
1. Navigate to Admin Dashboard
2. Click "Reports" tab
3. Health check results displayed in "System Health" section
4. Review any recommendations or warnings

### Common Issues and Fixes

#### Missing Stripe Keys
**Error**: "STRIPE_SECRET_KEY not configured"

**Fix**: Add Stripe secret key to environment variables

#### Webhook Failures
**Error**: "No recent webhook events"

**Fix**: 
1. Verify webhook endpoint URL in Stripe Dashboard
2. Check webhook signing secret is correct
3. Review edge function logs for errors

#### API Connectivity Issues
**Error**: "Failed to connect to Stripe API"

**Fix**:
1. Verify Stripe secret key is valid
2. Check network connectivity
3. Ensure Stripe account is active

---

## Security Considerations

### Row Level Security (RLS)
- Users can only edit/delete their own reviews
- Admins can moderate any review
- Anonymous reviews still require authentication to prevent spam

### Rate Limiting
- 1 review per user per 24 hours to prevent spam
- Enforced at database and application level

### Input Validation
- Rating: Must be 1-5
- Body: 20-1000 characters (prevents empty or excessively long reviews)
- Title: Max 100 characters
- SQL injection protection via parameterized queries

### Admin Actions
- All admin actions logged
- Require `admin` role in `user_roles` table
- Cannot be bypassed via client-side manipulation

---

## Testing

### Manual Testing Checklist

#### User Flows
- [ ] User can view reviews on `/reviews/site`
- [ ] Logged-in user can submit review
- [ ] User can edit their own review
- [ ] User can delete their own review
- [ ] User can mark reviews as helpful (once per review)
- [ ] Anonymous users cannot submit reviews

#### Admin Flows
- [ ] Admin can access site reviews panel
- [ ] Admin can feature/unfeature reviews
- [ ] Admin can delete any review
- [ ] Admin can search reviews
- [ ] Admin can filter reviews
- [ ] Metrics update in real-time

#### Edge Cases
- [ ] Prevent duplicate reviews within 24 hours
- [ ] Handle very long review bodies (truncation)
- [ ] Handle special characters in reviews
- [ ] Validate star rating range (1-5)

### Integration Tests
```typescript
// Example test cases
describe('Site Reviews', () => {
  it('should create a review', async () => {
    const response = await supabase.functions.invoke('site-reviews-create', {
      body: {
        rating: 5,
        body: 'Great service! Highly recommend.',
        title: 'Amazing experience'
      }
    });
    expect(response.data).toBeDefined();
  });

  it('should prevent duplicate reviews within 24 hours', async () => {
    // First review succeeds
    await createReview();
    
    // Second review should fail
    const response = await createReview();
    expect(response.error).toContain('24 hours');
  });

  it('should increment helpful count', async () => {
    const reviewId = 'test-uuid';
    const response = await supabase.functions.invoke('site-reviews-helpful', {
      body: { reviewId }
    });
    expect(response.data.helpful_count).toBeGreaterThan(0);
  });
});
```

---

## Maintenance

### Database Maintenance
- **Soft Deletes**: Reviews marked as deleted remain in database for audit purposes
- **Hard Deletes**: Use SQL query to permanently remove old deleted reviews if needed
- **Indexing**: Ensure indexes on `created_at`, `rating`, and `helpful_count` for performance

### Monitoring
- Track average rating trends over time
- Monitor review submission rates
- Alert on sudden drops in ratings
- Log all admin moderation actions

### Backup and Recovery
- Regular database backups include review data
- Review images/attachments (if added in future) should be backed up separately
- Test restore procedures periodically

---

## Future Enhancements
- [ ] Image attachments for reviews
- [ ] Review response by site owner
- [ ] Review verification (verified purchaser badge)
- [ ] Review templates/prompts
- [ ] Export reviews to CSV
- [ ] Email notifications for new reviews
- [ ] Review sentiment analysis
- [ ] Multi-language support

---

## Support
For issues or questions:
1. Check edge function logs in Lovable Cloud backend panel
2. Review database RLS policies
3. Test API endpoints using admin panel
4. Check browser console for frontend errors

---

**Last Updated**: 2025-10-23  
**Version**: 1.0.0
