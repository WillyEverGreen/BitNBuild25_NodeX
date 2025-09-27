# Fix Row Level Security (RLS) Policies for User Registration

## The Problem
The error "new row violates row-level security policy for table 'users'" occurs because the RLS policies are too restrictive and don't allow new user registration.

## Quick Fix (Recommended)

### Step 1: Run this SQL in your Supabase SQL Editor

```sql
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Public profiles viewable" ON users;

-- Create new policies that allow registration
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (id = auth.uid()::uuid);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (id = auth.uid()::uuid);
CREATE POLICY "Allow user registration" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public profiles viewable" ON users FOR SELECT USING (true);
```

### Step 2: Test Registration
1. Go to your app at `http://localhost:5173/register`
2. Try registering a new user (student or company)
3. The registration should now work without RLS errors

## Complete Fix (If you want to fix all RLS policies)

### Step 1: Run the complete SQL script
Copy and paste the contents of `fix-rls-policies.sql` into your Supabase SQL editor and run it.

### Step 2: Test all functionality
1. User registration (students and companies)
2. Project creation
3. Bidding on projects
4. Viewing projects and bids

## Why This Happens

1. **RLS is enabled** on the users table
2. **Original policies** only allowed users to access their own data
3. **During registration**, there's no authenticated user yet, so `auth.uid()` returns null
4. **The policies fail** because they check `id = auth.uid()::uuid` but `auth.uid()` is null

## The Solution

The key fix is adding this policy:
```sql
CREATE POLICY "Allow user registration" ON users FOR INSERT WITH CHECK (true);
```

This allows anyone to insert a new user record during registration, which is exactly what we need.

## Additional Policies Fixed

The complete fix also addresses:
- ✅ Project viewing (students can see projects to bid on)
- ✅ Bid creation (students can create bids)
- ✅ Bid viewing (project owners can see bids)
- ✅ Message sending/receiving
- ✅ Portfolio management
- ✅ Notification management

## Testing Checklist

After applying the fix, test:
- [ ] Student registration with .edu email
- [ ] Company registration with regular email
- [ ] Login with registered credentials
- [ ] Creating a project (as company)
- [ ] Viewing projects (as student)
- [ ] Submitting a bid (as student)
- [ ] Viewing bids (as company)

## If You Still Have Issues

1. **Check Supabase logs** in the dashboard for detailed error messages
2. **Verify RLS is enabled** but policies are correct
3. **Test with a simple user** first (minimal fields)
4. **Check if email confirmation** is required in Supabase settings

## Alternative: Disable RLS (Not Recommended for Production)

If you want to disable RLS temporarily for testing:
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

**Note**: This is not recommended for production as it removes all security.
