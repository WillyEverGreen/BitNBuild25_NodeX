# 🚀 Complete Setup Guide for BitNBuild

## 📋 Table of Contents
1. [Initial Setup](#initial-setup)
2. [Database Configuration](#database-configuration)
3. [Known Issues & Fixes](#known-issues--fixes)
4. [Testing Workflow](#testing-workflow)
5. [Troubleshooting](#troubleshooting)

---

## 🎯 Initial Setup

### Prerequisites
- Node.js 18+ installed
- Supabase account created
- Git installed

### Step 1: Clone and Install
```bash
git clone <repository-url>
cd BitNBuild25_NodeX
npm install
```

### Step 2: Environment Configuration
Create `.env.local` in the root directory:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from: Supabase Dashboard → Settings → API

---

## 🗄️ Database Configuration

### Critical: Run Database Fix First!

**This is the MOST IMPORTANT step. Without this, the app won't work properly.**

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Copy entire contents of `FINAL_DATABASE_FIX.sql`
4. Paste and click **"Run"**
5. Wait for "✅ Database setup complete!"

This SQL file fixes:
- ✅ All RLS (Row Level Security) policies
- ✅ Missing database columns
- ✅ UUID type casting issues
- ✅ Storage bucket and policies
- ✅ All permission issues

### What Gets Fixed:
- User profile policies (signup, view, update)
- Project policies (create, view, update)
- Bid policies (create, view, update)
- Escrow policies (create, view, update)
- Wallet policies (create, view, update)
- Transaction policies (view, create)
- Message policies (view, create, update)
- Conversation policies (view, create, update)
- Notification policies (view, create, update)
- Storage policies (upload, view files)

---

## ⚠️ Known Issues & Fixes

### Issue 1: "Failed" Alerts But Operations Succeed
**Symptom**: You click "Release Funds" or "Send Message", get a "failed" alert, but when you check the dashboard, it actually worked.

**Cause**: Secondary operations (like sending notifications) fail due to policy issues, but main operation succeeds.

**Fix**: 
1. Run `PROFILE_UPDATE_FIX.sql` in Supabase SQL Editor
2. Code already updated to handle this gracefully
3. Now shows success if main operation worked

**Status**: ✅ FIXED

### Issue 2: Student Names Show as "Unknown User"
**Symptom**: In bids list, student names appear as "Unknown User" instead of actual names.

**Cause**: RLS policy blocking profile views.

**Fix**: Already included in `FINAL_DATABASE_FIX.sql`

**Status**: ✅ FIXED

### Issue 3: Cannot Assign Escrow
**Symptom**: Error when trying to assign escrow to project.

**Causes**:
- Missing `assigned_at` column
- Missing RLS policies
- UUID type mismatch

**Fix**: Already included in `FINAL_DATABASE_FIX.sql`

**Status**: ✅ FIXED

### Issue 4: Cannot View Bids
**Symptom**: Bids page is empty or shows errors.

**Cause**: Missing bid view policy.

**Fix**: Already included in `FINAL_DATABASE_FIX.sql`

**Status**: ✅ FIXED

### Issue 5: Chat Doesn't Work
**Symptom**: Messages don't send or conversations don't load.

**Cause**: Missing message/conversation policies.

**Fix**: Already included in `FINAL_DATABASE_FIX.sql`

**Status**: ✅ FIXED

### Issue 6: File Upload Fails
**Symptom**: Cannot upload files in chat.

**Cause**: Storage bucket or policies missing.

**Fix**: Already included in `FINAL_DATABASE_FIX.sql`

**Status**: ✅ FIXED

### Issue 7: Dashboard Stats Don't Update
**Symptom**: After completing project, dashboard still shows old numbers.

**Cause**: Active projects calculation was counting all accepted bids.

**Fix**: Code updated to only count in-progress projects.

**Status**: ✅ FIXED

### Issue 8: Student Profile Not Updating After Completion
**Symptom**: Student's earnings and rating don't increase after project completion.

**Cause**: Missing update policy for system operations.

**Fix**: Run `PROFILE_UPDATE_FIX.sql`

**Status**: ✅ FIXED

---

## 🧪 Complete Testing Workflow

### Phase 1: Company Setup (5 minutes)
1. **Register as Company**
   - Use any email (no .edu required)
   - Fill in company details
   - Login

2. **Deposit Funds**
   - Go to Company Wallet
   - Click "Deposit Funds"
   - Add $5000
   - Verify balance shows $5000

3. **Post Project**
   - Click "Post Project"
   - Title: "Build E-commerce Website"
   - Budget: $2500
   - Duration: 30 days
   - Skills: React, Node.js, MongoDB
   - Submit
   - Verify appears in "My Projects"

4. **Assign Escrow**
   - Go to Company Wallet
   - Click "Assign to Project"
   - Select your project
   - Amount: $2500
   - Click "Assign Escrow"
   - Verify: Balance = $2500, Escrow created

### Phase 2: Student Setup (5 minutes)
1. **Register as Student**
   - **IMPORTANT**: Must use .edu email
   - Example: john@stanford.edu
   - Fill in student details
   - Login

2. **Browse Projects**
   - Go to "Projects"
   - See the posted project
   - Click to view details

3. **Submit Bid**
   - Click "Place Bid"
   - Amount: $2000
   - Proposal: "I have 3 years experience..."
   - Delivery: 20 days
   - Submit
   - Verify appears in "My Bids"

### Phase 3: Company Reviews Bid (3 minutes)
1. **View Bids**
   - Login as company
   - Go to "My Projects"
   - Click "View Bids"
   - **Verify**: See student's REAL NAME (not "Unknown User")

2. **Message Student (Optional)**
   - Click "Message" button
   - Send a message
   - Verify chat opens
   - **Verify**: See student's real name in chat

3. **Accept Bid**
   - Click "Accept Bid"
   - Confirm
   - **Verify**:
     - Bid status: "accepted"
     - Project status: "in-progress"
     - Chat message sent to student
     - Other bids rejected

### Phase 4: Chat & Files (2 minutes)
1. **Test Chat**
   - Go to Messages
   - Open conversation with student
   - Send messages back and forth
   - **Verify**: Real names show (not "Unknown User")

2. **Test File Upload**
   - In chat, click upload button
   - Select a file (image, PDF, etc.)
   - Upload
   - **Verify**: File appears in chat
   - Other user can download

### Phase 5: Complete Project (3 minutes)
1. **Release Funds**
   - Login as company
   - Go to project bids page
   - Click "Release Funds"
   - Amount: $2000
   - Optional message: "Great work!"
   - Click "Release Funds"
   - **Verify**: Success alert (not "failed")

2. **Check Company Dashboard**
   - Active Projects: 0 (decreased from 1)
   - Posted Projects: 1 (unchanged)
   - Go to "My Projects" → "Completed" tab
   - **Verify**: Project visible

3. **Check Student Dashboard**
   - Logout, login as student
   - **Verify**:
     - Active Projects: 0 (decreased from 1)
     - Total Earnings: $2000 (increased)
     - Pending Earnings: $0 (decreased from $2000)
     - Rating: 5.05 (increased by 0.05)
     - Completed Projects: 1 (increased)

4. **Check Student Wallet**
   - Go to Student Wallet
   - **Verify**: Balance = $2000

5. **Check Messages**
   - Go to Messages
   - **Verify**: See congratulations message from company

### Phase 6: Change Bidder (Optional - 2 minutes)
1. **Accept a New Bid**
   - Post another project
   - Get a bid
   - Accept it

2. **Change Mind**
   - Go to project bids page
   - See "Change Bidder" button
   - Click it
   - Confirm
   - **Verify**:
     - Project status: "open"
     - All bids: "pending"
     - Can accept different bid

---

## 🐛 Troubleshooting

### Problem: "Operator does not exist: uuid = text"
**Solution**: Run `FINAL_DATABASE_FIX.sql` - it has proper UUID casting (::text)

### Problem: "Could not find the 'assigned_at' column"
**Solution**: Run `FINAL_DATABASE_FIX.sql` - it adds missing columns

### Problem: "new row violates row-level security policy"
**Solution**: Run `FINAL_DATABASE_FIX.sql` - it fixes all RLS policies

### Problem: "Insufficient wallet balance"
**Solution**: Deposit funds to wallet first before assigning escrow

### Problem: Student registration fails
**Solution**: Make sure email ends with .edu (e.g., john@stanford.edu)

### Problem: False "failed" alerts
**Solution**: 
1. Run `PROFILE_UPDATE_FIX.sql`
2. Check browser console (F12) for actual status
3. Check dashboard - operation likely succeeded

### Problem: Dashboard not updating
**Solution**: 
1. Refresh page (F5)
2. Logout and login again
3. Check console for errors

### Problem: Chat shows "Unknown User"
**Solution**: Run `FINAL_DATABASE_FIX.sql` - fixes profile view policy

### Problem: File upload fails
**Solution**: 
1. Run `FINAL_DATABASE_FIX.sql` - creates storage bucket
2. Check Supabase Dashboard → Storage → Verify 'chat-files' bucket exists

---

## 📊 Expected Results Summary

### After Complete Workflow:

**Company:**
- Wallet Balance: $2500 (started $5000, assigned $2500)
- Active Projects: 0
- Posted Projects: 1
- Completed Projects: 1

**Student:**
- Wallet Balance: $2000
- Active Projects: 0
- Completed Projects: 1
- Total Earnings: $2000
- Rating: 5.05 (or current + 0.05)

**Chat:**
- Messages sent successfully
- Files uploaded and downloadable
- Real names visible

**All Features Working:**
- ✅ Registration & Login
- ✅ Wallet Operations
- ✅ Project Posting
- ✅ Bid Submission
- ✅ Bid Viewing (with names)
- ✅ Bid Acceptance
- ✅ Escrow Assignment
- ✅ Chat (before & after acceptance)
- ✅ File Uploads
- ✅ Fund Release
- ✅ Dashboard Updates
- ✅ Rating Updates
- ✅ Project History
- ✅ Change Bidder

---

## 🎯 Quick Checklist

Before reporting issues, verify:
- [ ] Ran `FINAL_DATABASE_FIX.sql` in Supabase
- [ ] Environment variables set correctly
- [ ] Using .edu email for student registration
- [ ] Wallet has sufficient balance
- [ ] Refreshed app after database changes
- [ ] Checked browser console (F12) for errors
- [ ] Tried logout/login

---

## 📞 Still Having Issues?

1. **Check browser console** (F12) for detailed errors
2. **Check Supabase logs** in dashboard
3. **Verify database policies** using `CHECK_ESCROW_SETUP.sql`
4. **Review documentation** in project root:
   - `COMPLETE_FIX_GUIDE.md` - Complete testing guide
   - `FALSE_ALERT_FIX.md` - False alert issues
   - `ESCROW_FIX.md` - Escrow troubleshooting
   - `DASHBOARD_LOGIC_COMPLETE.md` - Dashboard logic

---

**Everything should work perfectly after following this guide! 🎉**
