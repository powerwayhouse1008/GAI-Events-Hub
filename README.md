# Global AI Industry Alliance - Next.js + Supabase

Luma-style AI event community platform.

## Main features

- Google OAuth login
- Email/password login
- Member registration
- Organizer registration request
- Admin organizer approval
- Event creation
- Event approval by admin
- Featured events
- Event list/search/category/region
- Event detail and registration
- Organizer dashboard
- Registration approve/reject
- My registrations page
- Supabase RLS security
- Public event cover upload storage

## Pages

```txt
/events
/events/new
/events/[id]
/login
/register
/me
/organizer-dashboard
/organizer-pending
/admin/organizers
/admin/events
/calendar
/search
```

## Setup

### 1. Install

```bash
npm install
```

### 2. Create Supabase project

Create a Supabase project, then open SQL Editor and run the full idempotent setup script:

```txt
supabase/schema.sql
```

If your deployed site shows a generic server error after database actions, re-run this full SQL file. It recreates the missing RLS policies, helper functions, storage buckets, and admin update permissions without deleting existing data.

### 3. Environment variables

Copy:

```bash
cp .env.example .env.local
```

Fill:

```txt
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Use `http://localhost:3000` only when you are developing locally and `npm run dev` is running. In production/Vercel, this must be your real deployed URL or confirmation emails can redirect to localhost.

### 4. Enable Google OAuth in Supabase

Supabase Dashboard:

```txt
Authentication
Providers
Google
Enable
```

Set Google Client ID / Secret.

Google Cloud OAuth redirect URL must be:

```txt
https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback
```

Supabase handles OAuth/email callback, then redirects to the app callback:

```txt
http://localhost:3000/auth/callback
```

Add this to Supabase Auth URL Configuration:

```txt
Site URL: https://your-domain.com
Redirect URLs:
http://localhost:3000/auth/callback
https://your-vercel-domain.vercel.app/auth/callback
https://your-domain.com/auth/callback
```

If the email confirmation opens `localhost` and shows `ERR_CONNECTION_REFUSED`, change the Site URL and Redirect URLs above, update `NEXT_PUBLIC_SITE_URL`, redeploy/restart the app, then send a new confirmation email. Old emails keep the old localhost link.

### 5. Run

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

### 6. Make yourself admin

After registering your account, run in Supabase SQL Editor:

```sql
update public.profiles
set role = 'admin', organizer_status = 'approved'
where email = 'YOUR_EMAIL@gmail.com';
```

## Deploy to Vercel

1. Push this folder to GitHub.
2. Import to Vercel.
3. Add Environment Variables.
4. Deploy.
5. Add this Redirect URL to Supabase:

```txt
https://your-domain.com/auth/callback
```

## Notes

Organizer flow:

```txt
Register as Organizer
↓
profile role = member, organizer_status = pending
↓
Admin opens /admin/organizers
↓
Approve
↓
role = organizer, organizer_status = approved
↓
Can create events
```

Event flow:

```txt
Organizer creates event
↓
status = pending
↓
Admin opens /admin/events
↓
Approve
↓
status = published
↓
Visible on /events
```
