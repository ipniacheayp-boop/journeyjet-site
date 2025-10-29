# Unified Role-Based Authentication System

## Overview
This system provides a single, unified login experience for all user types (User, Agent, Admin) with role-based access control and Google OAuth integration.

## Changes Made

### 1. Unified Login Page (`/login`)
- **Single endpoint** for all user types
- **Role detection** via URL query parameter: `?role=admin`, `?role=agent`, or default `user`
- **Google OAuth** integration for seamless sign-in
- **Email verification** handled automatically by Supabase
- **Separate registration flows** for agents (requires additional company info)

### 2. Route Protection
- New `ProtectedRoute` component ensures only authorized users can access protected routes
- Admin routes require `role='admin'`
- Agent routes require `role='agent'`
- Admins have access to all routes

### 3. Deleted Files
- ❌ `src/pages/AdminLogin.tsx` (replaced by unified login)
- ❌ `src/pages/AgentLogin.tsx` (replaced by unified login)
- ❌ `src/pages/UserLogin.tsx` (replaced by unified login)

### 4. New Files
- ✅ `src/pages/Login.tsx` - Unified login page
- ✅ `src/components/ProtectedRoute.tsx` - Route guard component
- ✅ `src/pages/AuthCallback.tsx` - OAuth callback handler

### 5. Updated Files
- `src/App.tsx` - Updated routes with protection
- `src/components/Header.tsx` - Updated login links
- `src/components/Footer.tsx` - Added Partner portal links
- `src/pages/AgentDashboard.tsx` - Updated navigation
- `src/pages/MyBookings.tsx` - Updated navigation

## Usage

### For Regular Users
```
Navigate to: /login
or
Navigate to: / and click "Sign In"
```

### For Agents
```
Navigate to: /login?role=agent
or
Footer link: "Agent Portal"
```

### For Admins
```
Navigate to: /login?role=admin
or
Footer link: "Admin Portal"
```

## Google OAuth Setup

To enable Google sign-in, you need to configure OAuth credentials:

### Step 1: Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth Client ID**
5. Choose **Web application**
6. Add authorized JavaScript origins:
   - `https://your-domain.lovable.app`
   - `http://localhost:5173` (for local dev)
7. Add authorized redirect URIs:
   - `https://your-domain.lovable.app/auth/callback`
   - `https://qgmhqhejoilexhgwdujl.supabase.co/auth/v1/callback`
8. Save and copy your **Client ID** and **Client Secret**

### Step 2: Configure in Lovable Cloud
1. Open your backend settings (click link below)
2. Go to **Users → Auth Settings → Google Settings**
3. Enable Google OAuth
4. Enter your Client ID and Client Secret
5. Save settings

## Role-Based Redirects

After successful login, users are automatically redirected based on their role:

| Role    | Redirect To          |
|---------|----------------------|
| admin   | `/admin`             |
| agent   | `/agent/dashboard`   |
| user    | `/`                  |

## Session Management

- **JWT tokens** are managed automatically by Supabase
- **Session persistence** via localStorage
- **Auto token refresh** handled by Supabase client
- **Email verification** required for new signups (configurable)

## Security Features

1. ✅ **Row Level Security (RLS)** on all database tables
2. ✅ **Role-based access control** at route level
3. ✅ **JWT token verification** by Supabase
4. ✅ **Password hashing** by Supabase Auth
5. ✅ **Protected routes** with automatic redirects
6. ✅ **Session validation** on every request

## Testing

### Test Admin Access
1. Go to `/login?role=admin`
2. Login with admin credentials
3. Should redirect to `/admin` dashboard

### Test Agent Access
1. Go to `/login?role=agent`
2. Register as new agent (requires admin verification)
3. Admin verifies agent in Admin panel
4. Agent can now login and access `/agent/dashboard`

### Test Google OAuth
1. Click "Continue with Google" on login page
2. Select Google account
3. Should redirect based on assigned role
4. New users get `user` role by default

## Troubleshooting

### "Invalid role access" error
- User trying to access admin/agent portal without proper role
- Solution: Ensure user has correct role in `user_roles` table

### Google OAuth not working
- Check that redirect URIs are correctly configured
- Verify Client ID and Secret are correctly entered
- Ensure Google OAuth is enabled in Lovable Cloud

### Email verification issues
- For development: Disable email confirmation in Auth settings
- For production: Ensure SMTP is configured (handled by Lovable Cloud)

## Migration Notes

All existing users maintain their current roles. The system is backward compatible:
- Existing admin sessions continue to work
- Existing agent sessions continue to work
- No data migration required
- All existing features remain functional
