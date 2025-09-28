# Supabase Integration Setup Guide

This guide will help you set up Supabase for your NodeX platform to enable data persistence across all users.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. Node.js and npm installed
3. Your NodeX project

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `nodex-platform` (or your preferred name)
   - Database Password: Choose a strong password
   - Region: Choose the closest region to your users
5. Click "Create new project"

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## Step 3: Configure Environment Variables

1. In your NodeX project root, create a `.env.local` file (if it doesn't exist)
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace `your-project-id` and `your-anon-key-here` with your actual values.

## Step 4: Set Up Database Schema

1. In your Supabase project dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-schema.sql` from your project root
3. Paste it into the SQL Editor
4. Click **Run** to execute the schema

This will create all necessary tables:
- `projects` - Store project information
- `bids` - Store student bids on projects
- `messages` - Store chat messages between users
- `notifications` - Store user notifications
- `opportunities` - Store job/internship opportunities
- `escrows` - Store escrow/payment information
- `transactions` - Store transaction history

## Step 5: Configure Row Level Security (RLS)

The schema includes RLS policies that allow:
- Anyone to read projects, bids, and opportunities
- Users to create and update their own data
- Proper access control for messages and notifications

## Step 6: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your app in the browser
3. Try creating a project as a company user
4. Switch to a student user and browse projects
5. Verify that data persists across different user sessions

## Step 7: Real-time Features

The integration includes real-time subscriptions for:
- New projects appearing instantly
- Bid updates in real-time
- Live chat messages
- Instant notifications

## Troubleshooting

### Common Issues:

1. **"Missing Supabase environment variables" error**
   - Make sure your `.env.local` file exists and has the correct values
   - Restart your development server after adding environment variables

2. **Database connection errors**
   - Verify your Supabase URL and API key are correct
   - Check if your Supabase project is active (not paused)

3. **Permission denied errors**
   - Ensure RLS policies are properly set up
   - Check if your database schema was created successfully

4. **Data not persisting**
   - Verify the database tables were created
   - Check browser console for any Supabase errors

### Getting Help:

- Check the [Supabase Documentation](https://supabase.com/docs)
- Visit the [Supabase Discord](https://discord.supabase.com) for community support
- Review the browser console for detailed error messages

## What's Changed

With Supabase integration:
- ✅ All project data is now shared across users
- ✅ Bids are visible to all users
- ✅ Messages persist between sessions
- ✅ Notifications work across users
- ✅ Real-time updates for better UX
- ✅ Scalable database backend
- ✅ Authentication still uses localStorage (as requested)

## Next Steps

Once everything is working:
1. Consider migrating authentication to Supabase Auth for better security
2. Add file upload capabilities using Supabase Storage
3. Implement advanced search and filtering
4. Add analytics and reporting features

Your NodeX platform now has a robust, scalable backend that will grow with your user base!
