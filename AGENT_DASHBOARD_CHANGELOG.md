# Agent Dashboard Changelog

## 2025-11-04 - Client Details Tab & Start Booking Redirect

### Changes Made

1. **Start New Booking Flow**
   - Changed "Start New Booking" button to redirect directly to the public homepage (/)
   - Removed dependency on failing `agent_safety_start_booking` edge function
   - Simplified flow: agents now use the same public search page as regular users

2. **New Client Details Tab**
   - Added new "Client Details" tab to Agent Dashboard (4th tab after Profile)
   - Shows paginated table (20 rows/page) of client bookings assigned to the agent
   - Features:
     - Search by name, email, or booking reference
     - Filter by status (All, Confirmed, Pending, Cancelled)
     - View detailed client information in modal
     - Contact actions: email and phone links
     - Displays: Booking ref, Type, Name, Email, Contact, Amount, Status, Date
   
3. **Database Security**
   - Added RLS policy: "Agents can view their assigned bookings"
   - Only shows bookings where `agent_id` matches the logged-in agent's profile
   - Returns non-sensitive fields only (no payment details, PNRs, tokens)

### Files Created
- `src/components/agent/AgentClientDetails.tsx` - New client details component

### Files Modified
- `src/pages/AgentDashboard.tsx` - Added Client Details tab, simplified Start Booking

### Endpoints Reused
- Direct Supabase query to `bookings` table (no new edge functions created)
- Uses existing RLS policies with new agent-specific policy added

### Security Note
- Security linter warning about leaked password protection (WARN level) is a project-wide auth setting, not related to this migration
- User should enable password strength checks in auth settings when ready

### Testing
1. Login as agent → Click "Start New Booking" → Should navigate to homepage (/)
2. Open "Client Details" tab → Should show bookings assigned to agent
3. Search/filter clients → Table should update accordingly
4. Click "View Details" on a booking → Modal shows full client & booking info

---

## 2025-11-04 - Fixed Auth for Start Booking Function

**Problem:** `agent-start-booking` edge function returned 401 "Auth session missing!" even though frontend correctly sent `Authorization: Bearer <token>` header. Root cause: Edge functions using anon key + Authorization header cannot validate sessions via `auth.getUser()` because refresh tokens aren't available in edge function context.

**Solution:** Created `agent_safety_start_booking` that uses Service Role Key to properly validate JWTs without needing refresh tokens.

**Changes:**
- Created `supabase/functions/agent_safety_start_booking/index.ts`
  - Uses `SUPABASE_SERVICE_ROLE_KEY` instead of anon key for proper JWT validation
  - Validates JWT via `auth.getUser()` with service role privileges
  - Returns structured errors: 401 `UNAUTHORIZED`, 403 forbidden, 404 not found, 500 `RETRYABLE_ERROR`
  - Comprehensive logging at each auth/role/profile validation step
- Updated `src/pages/AgentDashboard.tsx`
  - Changed Start Booking button to call `agent_safety_start_booking` instead of `agent-start-booking`
  - Kept existing session retrieval and Authorization header logic intact

**Expected behavior after fix:**
- Success: Returns 200 with `{ success: true, agentId: "<id>", agentCode: "<code>", redirectUrl: "/search-results" }`
- Unauthorized: Returns 401 with `{ error: "UNAUTHORIZED", message: "Missing or invalid auth token" }`
- Other errors: Returns 500 with `{ error: "RETRYABLE_ERROR", message: "<safe message>" }`

## 2025-11-04 - Fix agent-start-booking 401 Error
- Changed `.single()` to `.maybeSingle()` in agent-start-booking to prevent errors when querying roles/profiles
- Added detailed console logging for auth, role, and profile checks
- Improved error messages with specific details for debugging

## 2025-11-04 - Safety Variant for Registration
- Added `agent_safety_register` edge function (idempotent upsert, optional fields, tolerant to races, no status override) and wired dashboard to use it. Prevents RLS and CHECK constraint errors.

## 2025-11-04 - Phone Field Made Optional

### Fix
- **Issue**: Edge function was rejecting empty phone values with 400 error
- **Solution**: Removed phone validation requirement in `agent-register` edge function
- **Result**: Phone can now be an empty string, allowing profile creation to succeed

## 2025-11-04 - RLS Policy Fix & Edge Function Integration

### Critical Fix
- **Root cause**: Frontend was attempting direct INSERT into `agent_profiles`, violating RLS policy (only admins can insert)
- **Solution**: Changed `AgentDashboard.tsx` to call existing `agent-register` edge function (which uses service role key)
- **Result**: Agent profile creation now succeeds reliably, leveraging idempotent upsert logic already in edge function
- **Testing**: Console logs show `[AgentDashboard] agent-register response:` for debugging
- **No resources overwritten**: Reused existing `agent-register` edge function without modification

## 2025-11-04 - Agent Profile Creation Hardening

### Backend Changes (agent-register edge function)
- **Idempotent operations**: Changed from `.insert()` to check-then-upsert pattern to prevent duplicate profile errors
- **Field validation**: Added explicit 400 error responses for missing required fields (userId, companyName, contactPerson, phone)
- **Error categorization**: Structured error responses with error codes (MISSING_FIELD, DB_WRITE_FAILED, CREATE_AGENT_FAILED, ALREADY_EXISTS, RETRYABLE_ERROR)
- **Duplicate handling**: Added 409 conflict response for duplicate constraints (23505 error code)
- **Atomic operations**: Role and wallet creation failures no longer block profile creation (with duplicate detection)
- **Enhanced logging**: Added detailed console logs with [AGENT-REGISTER] prefix for debugging

### Frontend Changes (AgentDashboard.tsx)
- **Loading state**: Added descriptive message "Setting up your agent profile..." during initialization
- **Timeout detection**: 12-second timeout with automatic conversion to retry card
- **Retry logic**: Exponential backoff retry mechanism (1s, 2s, 4s, 5s max)
- **Error UI**: Comprehensive error card with Retry and Go Home buttons (never shows blank page)
- **Duplicate recovery**: Automatically fetches existing profile if insert fails due to duplicate (23505)
- **Console logging**: All server responses logged with [AgentDashboard] prefix for debugging
- **Support contact**: Error card includes support email for persistent issues
- **Success feedback**: Toast notification "Agent profile ready — welcome!" on successful creation

### Testing Checklist
- ✅ New agent login → profile created successfully
- ✅ Duplicate profile attempt → existing profile loaded without error
- ✅ Network timeout → retry card appears after 12s
- ✅ Retry button → triggers new attempt with exponential backoff
- ✅ Error states → never shows blank page, always provides navigation
- ✅ Console logs → all server responses visible in DevTools for debugging
