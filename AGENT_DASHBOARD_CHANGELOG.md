# Agent Dashboard Changelog

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
