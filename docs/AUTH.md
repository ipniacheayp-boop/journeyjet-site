# Authentication

Tripile uses Supabase Auth with email/password and Google OAuth. The implementation is React + TypeScript, styled with Tailwind and shadcn/ui, and integrated through `AuthContext`.

## Folder structure

```
src/
  contexts/
    AuthContext.tsx          # Session, role, signIn/signUp/Google/reset helpers
  components/auth/
    AuthLayout.tsx           # Shared modern auth UI shell
    GoogleButton.tsx         # Google OAuth button
    ProtectedRoute.tsx       # Route guard (with admin support)
  pages/auth/
    SignIn.tsx
    SignUp.tsx
    ForgotPassword.tsx
    ResetPassword.tsx
    AuthCallback.tsx         # Handles OAuth + magic link redirects
supabase/migrations/
  20260507_auth_profiles.sql # profiles table, RLS, and auth.users trigger
```

## Routes

| Path                       | Description                              |
|----------------------------|------------------------------------------|
| `/auth/signin`             | Email/password + Google sign in          |
| `/auth/signup`             | Create account                           |
| `/auth/forgot-password`    | Send reset email                         |
| `/auth/reset-password`     | Set a new password (from email link)     |
| `/auth/callback`           | Finalizes Google + magic link sessions   |
| `/login`, `/signup`        | Legacy redirects (preserved)             |

Protected routes use `ProtectedRoute`:

```tsx
<Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
```

## Environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` — must be the **JWT anon public key** (starts with `eyJ`). New publishable keys (`sb_publishable_…`) break Edge Functions.

## Database

Run the migration `supabase/migrations/20260507_auth_profiles.sql`. It will:

- Create `public.profiles` keyed off `auth.users.id`.
- Enable RLS so users only read/update their own profile.
- Add a trigger on `auth.users` so new signups (email or Google) automatically create a profile row, including `name` and `profile_image` fetched from Google metadata.
- Keep `updated_at` fresh on every change.

You can run it via the Supabase SQL editor or:

```bash
supabase db push
```

## Supabase dashboard configuration

1. Authentication → Providers → enable **Email** and **Google**.
2. Authentication → URL configuration:
   - **Site URL**: `https://your-app.com`
   - **Redirect URLs**: include `https://your-app.com/auth/callback` (and `http://localhost:8080/auth/callback` for dev)
3. Authentication → Email templates: optional, but recommended for branded reset/confirmation emails.
4. Google OAuth client (Cloud Console):
   - Authorized redirect URI = `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
   - Add the client id/secret in Supabase → Providers → Google.

## Auth context API

```ts
const {
  user, session, loading, isAdmin, userRole,
  signIn, signUp, signInWithGoogle,
  sendPasswordReset, updatePassword,
  signOut, refreshAdminStatus,
} = useAuth();
```

- `signUp` returns `{ requiresEmailConfirmation }` so the UI can prompt for email verification.
- `signIn` accepts `rememberMe` (persists a flag in `localStorage`; Supabase already persists the session).
- `signInWithGoogle(redirectTo?)` performs the OAuth redirect; sessions are finalized on `/auth/callback`.

## Best practices applied

- Email/password validation with a strong-password policy on sign up and reset.
- Friendly, copy-only error messages for known Supabase errors.
- Google avatars (`avatar_url`) and names are stored automatically in `profiles`.
- Sessions persist via `localStorage` with `autoRefreshToken`.
- Session-aware redirects (`?next=/path`) on protected routes.
- Logout clears local state and routes home.
- Toasts using `sonner` for both success and error states.
- Loading states on every async button.
- Mobile-first responsive layout with dark mode out of the box.

## Manual smoke test

1. `/auth/signup` → create an account with a strong password.
2. Verify email (if confirmation is enabled).
3. `/auth/signin` with the same credentials → should redirect to `/account`.
4. `/auth/forgot-password` → request reset email → click link → set a new password on `/auth/reset-password`.
5. Try Google sign in → completes via `/auth/callback`.
6. Visit `/account` while logged out → should redirect to `/auth/signin?next=/account`.
7. Click `Sign Out` from the header → should return to home and clear the session.
