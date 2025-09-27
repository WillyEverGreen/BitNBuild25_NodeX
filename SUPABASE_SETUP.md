# Supabase Setup Guide

## 🚀 Complete Supabase Integration

Your app has been successfully migrated from Firebase to Supabase! Here's what you need to do to get it running:

### 1. **Create Environment Variables**

Create a `.env` file in your project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Note**: Since you're using Vite, use `VITE_` prefix instead of `REACT_APP_`.

### 2. **Set Up Your Supabase Project**

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Create a new project** or use existing one
3. **Get your credentials**:
   - Go to Settings → API
   - Copy your Project URL and anon public key
   - Add them to your `.env` file

### 3. **Run the Database Schema**

Execute the SQL schema you provided in your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Paste and run your complete SQL schema
4. This will create all tables, indexes, RLS policies, and triggers

### 4. **Test the Integration**

1. **Start your development server**: `npm run dev`
2. **Visit**: `http://localhost:5173/supabase-test`
3. **Check the status**: Should show "Supabase connection successful! ✅"
4. **Test user creation**: Click "Test User Creation"

### 5. **Features Available**

✅ **Authentication**: User registration and login
✅ **User Management**: Student and company profiles
✅ **Project Management**: Create and manage opportunities
✅ **Bid System**: Students can bid on projects
✅ **Real-time Updates**: Live data synchronization
✅ **Row Level Security**: Secure data access
✅ **Database Triggers**: Automatic stats updates

### 6. **Database Schema Features**

Your SQL schema includes:
- **Users table**: Student and company profiles
- **Projects table**: Posted opportunities
- **Bids table**: Student bids on projects
- **Messages table**: User communication
- **Notifications table**: User notifications
- **Portfolio items**: Student work showcase
- **Badges**: Achievement system
- **Transactions**: Payment tracking

### 7. **Security Features**

- **Row Level Security (RLS)**: Enabled on all tables
- **Authentication**: Supabase Auth integration
- **Data Validation**: Database constraints
- **Automatic Triggers**: Update counters and stats

### 8. **Real-time Features**

- **Live project updates**: New projects appear instantly
- **Real-time notifications**: Instant notification delivery
- **Live bid updates**: Bid counts update automatically
- **Message synchronization**: Real-time chat

### 9. **Testing Your Setup**

1. **Register a company**: Go to `/register` and create a company account
2. **Post an opportunity**: Use the company dashboard to create a project
3. **Register a student**: Create a student account
4. **Browse opportunities**: View and bid on projects
5. **Test real-time updates**: Open multiple browser tabs

### 10. **Production Deployment**

When ready for production:
1. **Update environment variables** with production Supabase credentials
2. **Configure RLS policies** for your specific needs
3. **Set up email templates** in Supabase Auth settings
4. **Configure storage** for file uploads if needed

### 🔧 **Troubleshooting**

**Connection Issues**:
- Check your `.env` file has correct credentials
- Verify Supabase project is active
- Check browser console for errors

**Database Issues**:
- Ensure SQL schema was executed successfully
- Check RLS policies are properly configured
- Verify table permissions

**Authentication Issues**:
- Check Supabase Auth settings
- Verify email confirmation settings
- Check user permissions

### 📊 **Database Performance**

Your schema includes optimized indexes for:
- User lookups by email and type
- Project filtering by status and category
- Bid queries by project and student
- Message and notification queries

### 🎯 **Next Steps**

1. **Customize the UI**: Update colors, fonts, and styling
2. **Add file uploads**: Implement resume and portfolio uploads
3. **Payment integration**: Add Stripe or other payment methods
4. **Email notifications**: Set up email templates
5. **Advanced features**: Add search, filtering, and sorting

Your app is now fully integrated with Supabase and ready for development and production use!
