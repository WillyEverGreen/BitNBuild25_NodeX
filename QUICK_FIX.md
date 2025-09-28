# Quick Fix for White Page Error

## The Issue
You're getting a white page because Supabase environment variables are missing.

## Quick Solution (Temporary)
The app will now work with mock data until you set up Supabase properly.

## To Set Up Supabase Properly:

1. **Create `.env.local` file** in your project root with:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

2. **Get Supabase credentials:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Go to Settings → API
   - Copy Project URL and anon public key

3. **Set up database:**
   - Go to SQL Editor in Supabase
   - Copy and run the contents of `supabase-schema.sql`

## For Now
The app should work with mock data. You'll see a warning in the console about Supabase not being configured, but the app will function normally.

## Test the App
Run `npm run dev` and the white page should be gone!
