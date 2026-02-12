# Supabase Setup Guide for SWIPESS-2.0

## Overview

SWIPESS-2.0 uses Supabase as the backend for:
- User authentication (email/password + GitHub OAuth)
- Database storage (listings, profiles, messages, interactions)
- Real-time features

## Prerequisites

1. **Supabase Account** - Create at https://supabase.com
2. **Access to Supabase Dashboard**
3. **SQL Migration File** - Located at `supabase/migrations/001_create_tables.sql`

## Step-by-Step Setup

### 1. Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **New Project**
3. Fill in:
   - **Project Name**: `SWIPESS-2.0` (or your preference)
   - **Database Password**: Save this securely
   - **Region**: Choose closest to your users
4. Click **Create new project** (wait ~2 minutes for setup)

### 2. Get Your Credentials

Once the project is created:

1. Go to **Project Settings** → **API**
2. Copy the following values (you'll need them):
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Public Anon Key** (under "Project API keys")
   - **Service Role Key** (keep this secure!)

**Note**: The app already has these hardcoded in `services/supabaseClient.ts`, but if you're creating a new project, update them there.

### 3. Deploy the Database Schema

#### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

#### Option B: Using Supabase Dashboard (Manual)

1. Go to your Supabase Project Dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire contents of `supabase/migrations/001_create_tables.sql`
5. Click **Run**

### 4. Create Authentication Providers

#### Email/Password (Default)
- **Already enabled by default** in Supabase
- No action needed

#### GitHub OAuth (Optional)

If you want GitHub sign-in:

1. Go to **Authentication** → **Providers** in Supabase
2. Enable **GitHub**
3. Create GitHub OAuth App:
   - Go to GitHub Settings → Developer settings → OAuth Apps → New OAuth App
   - **Application name**: SWIPESS-2.0
   - **Homepage URL**: `http://localhost:3000` (dev) or your production URL
   - **Authorization callback URL**: `https://YOUR_SUPABASE_URL/auth/v1/callback`
   - Copy **Client ID** and **Client Secret**
4. Paste credentials into Supabase GitHub provider settings
5. Click **Save**

### 5. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY

# Google Gemini API
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

**Get Gemini API Key**:
1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Click **Create API Key**
3. Copy and paste into `.env.local`

### 6. Enable RLS (Row Level Security)

RLS is already enabled in the migration script. Verify in Supabase:

1. Go to **Authentication** → **Policies**
2. You should see policies for: `profiles`, `listings`, `messages`, `interactions`, `preferences`
3. Verify all policies are **enabled** (green toggle)

### 7. Test the Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Go to http://localhost:3000
# Try signing up with email or GitHub
# Try creating a listing
```

## Database Schema Overview

### Tables Created

1. **profiles** - User profiles (extends Supabase auth.users)
2. **listings** - All marketplace items (properties, vehicles, bikes, jobs)
3. **messages** - Chat history
4. **interactions** - User behavior tracking (likes, views, nopes)
5. **preferences** - ML recommendation profiles

### Security Features

- **Row Level Security (RLS)**: Users can only access their own data by default
- **Authentication**: All operations require a valid Supabase session
- **Indexes**: Created for common queries (owner_id, category, location, etc.)

## Troubleshooting

### Error: "Project not initialized"
- Make sure you ran the SQL migration via Dashboard or CLI

### Error: "Permission denied"
- Check that RLS policies are enabled
- Verify you're signed in with a valid user account

### Error: "Supabase API key not found"
- Update `.env.local` with correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Hard refresh the browser (Ctrl+Shift+R)

### GitHub OAuth not working
- Verify callback URL matches in GitHub app AND Supabase settings
- Check that GitHub provider is **enabled** in Supabase Dashboard

## Next Steps

1. Deploy to production (Vercel, Netlify, etc.)
2. Update environment variables in production
3. Enable CORS in Supabase for your production domain
4. Set up backups in Supabase Dashboard
5. Monitor usage in Supabase Analytics

## Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [PostgreSQL RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Google Gemini API Docs](https://ai.google.dev/docs)
