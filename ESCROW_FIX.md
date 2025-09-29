# 🔧 Escrow Assignment Not Working - Quick Fix

## 🐛 Common Issues & Solutions

### Issue 1: Missing Database Columns
**Error**: "Could not find the 'assigned_at' column"

**Solution**: Run this in Supabase Dashboard → SQL Editor:
```sql
ALTER TABLE public.escrows
  ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ;
```

---

### Issue 2: Insufficient Wallet Balance
**Error**: "Insufficient wallet balance"

**Solution**: 
1. Go to Company Wallet
2. Click "Deposit Funds"
3. Add money to wallet first
4. Then assign escrow

---

### Issue 3: RLS Policy Blocking
**Error**: "new row violates row-level security policy"

**Solution**: Run QUICK_FIX.sql or this:
```sql
-- Allow authenticated users to insert escrows
DROP POLICY IF EXISTS "Companies can create escrows" ON public.escrows;
CREATE POLICY "Companies can create escrows" ON public.escrows
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = company_id);

-- Allow users to view their escrows
DROP POLICY IF EXISTS "Users can view their escrows" ON public.escrows;
CREATE POLICY "Users can view their escrows" ON public.escrows
  FOR SELECT USING (auth.uid() = company_id OR auth.uid() = student_id);
```

---

### Issue 4: Project Not Found
**Error**: "Project not found"

**Solution**:
- Make sure you posted a project first
- Go to "Post Project" and create one
- Then try assigning escrow

---

## 🚀 Complete Fix - Run This SQL

**Copy and paste this entire block into Supabase Dashboard → SQL Editor:**

```sql
-- 1. Add missing escrow columns
ALTER TABLE public.escrows
  ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ;

-- 2. Fix escrow policies
DROP POLICY IF EXISTS "Companies can create escrows" ON public.escrows;
DROP POLICY IF EXISTS "Users can view their escrows" ON public.escrows;
DROP POLICY IF EXISTS "Companies can update their escrows" ON public.escrows;

CREATE POLICY "Companies can create escrows" ON public.escrows
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = company_id);

CREATE POLICY "Users can view their escrows" ON public.escrows
  FOR SELECT USING (auth.uid() = company_id OR auth.uid() = student_id);

CREATE POLICY "Companies can update their escrows" ON public.escrows
  FOR UPDATE USING (auth.uid() = company_id);

-- 3. Verify setup
SELECT 'Escrow table columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'escrows' AND table_schema = 'public';

SELECT 'Escrow policies:' as info;
SELECT * FROM pg_policies WHERE tablename = 'escrows';
```

---

## 📋 Step-by-Step Test

### 1. Check Wallet Balance
```
Go to: Company Wallet
Look for: "Available Balance"
Should be: > $0
If not: Click "Deposit Funds"
```

### 2. Check Project Exists
```
Go to: My Projects
Should see: At least one project
If not: Click "Post New Project"
```

### 3. Assign Escrow
```
Go to: Company Wallet
Click: "Assign to Project"
Select: Your project
Enter: Amount (less than wallet balance)
Click: "Assign Escrow"
```

### 4. Check Console for Errors
```
Press: F12 (open browser console)
Look for: Red error messages
Copy: The error message
```

---

## 🔍 Debug Checklist

Check these in order:

1. ✅ **Logged in as company?**
   - Check top right corner shows company name
   - If student, logout and login as company

2. ✅ **Wallet has funds?**
   - Go to Company Wallet
   - Balance should be > $0
   - If $0, deposit funds first

3. ✅ **Project exists?**
   - Go to My Projects
   - Should see at least one project
   - If none, post a project first

4. ✅ **Database columns exist?**
   - Run the SQL fix above
   - Check for "assigned_at" column

5. ✅ **RLS policies correct?**
   - Run the SQL fix above
   - Check policies allow INSERT

---

## 💡 Quick Test

Try this minimal test:

1. **Login as company**
2. **Deposit $1000 to wallet**
3. **Post a project** (any project)
4. **Assign $500 escrow** to that project
5. **Check console** (F12) for errors

If it fails, copy the exact error message and I'll fix it!

---

## 🎯 Most Common Error Messages

### "Could not find the 'assigned_at' column"
→ Run SQL fix above (adds columns)

### "Insufficient wallet balance"
→ Deposit funds to wallet first

### "new row violates row-level security policy"
→ Run SQL fix above (fixes policies)

### "Project not found"
→ Post a project first

### "Failed to create escrow: [error]"
→ Check browser console (F12) for detailed error

---

## ✅ After Running SQL Fix

1. **Refresh your app** (Ctrl+R or F5)
2. **Try assigning escrow again**
3. **Should work now!**

If still not working:
- Open browser console (F12)
- Try assigning escrow
- Copy the exact error message
- Tell me the error and I'll fix it immediately!

---

## 📞 Need Help?

**Tell me:**
1. What error message you see
2. Your wallet balance
3. Whether you have projects
4. Screenshot of console errors (F12)

I'll fix it right away! 🚀
