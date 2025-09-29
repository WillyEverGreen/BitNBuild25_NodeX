# 🚀 GigCampus Deployment Guide

This guide will help you deploy GigCampus to production with full Supabase integration.

## ✅ Pre-Deployment Checklist

### 1. Supabase Setup
- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] Environment variables configured
- [ ] Storage bucket created (optional)
- [ ] Email templates configured

### 2. Code Preparation
- [ ] All features tested locally
- [ ] Environment variables set
- [ ] Build process verified
- [ ] Error handling implemented

## 🔧 Supabase Configuration

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and enter project details
4. Wait for project to be ready

### Step 2: Deploy Database Schema
1. Go to SQL Editor in your Supabase dashboard
2. Copy the entire contents of `supabase/migrations/create_complete_schema.sql`
3. Paste and execute the SQL
4. Verify all tables are created successfully

### Step 3: Configure Authentication
1. Go to Authentication → Settings
2. Configure email templates (optional)
3. Set up custom SMTP (optional)
4. Enable email confirmations if desired

### Step 4: Set Up Storage (Optional)
1. Go to Storage
2. Create bucket named `chat-files`
3. Make it public
4. Configure upload policies

## 🌍 Environment Variables

### Development (.env.local)
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Production
Set the same variables in your deployment platform:

**Vercel:**
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

**Netlify:**
- Go to Site Settings → Environment Variables
- Add both variables

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### Option 2: Netlify
```bash
# Build the project
npm run build

# Deploy to Netlify
# Upload the dist/ folder or connect your Git repository
```

### Option 3: Static Hosting
```bash
# Build for production
npm run build

# Upload dist/ folder to your hosting provider
```

## 🧪 Post-Deployment Testing

### 1. Authentication Flow
- [ ] User registration works
- [ ] Email verification works (if enabled)
- [ ] Login/logout functions properly
- [ ] Password reset works

### 2. Core Features
- [ ] Project creation and browsing
- [ ] Bid submission and management
- [ ] Real-time messaging
- [ ] File upload in chat
- [ ] Wallet and escrow operations

### 3. Database Operations
- [ ] Data persistence across sessions
- [ ] Real-time updates work
- [ ] All CRUD operations function
- [ ] RLS policies enforce security

## 🔍 Troubleshooting

### Common Issues

**1. White Screen / App Won't Load**
- Check browser console for errors
- Verify environment variables are set
- Ensure Supabase URL and key are correct

**2. Database Connection Errors**
- Verify Supabase project is active
- Check if database schema is deployed
- Ensure RLS policies are properly configured

**3. Authentication Issues**
- Check Supabase Auth settings
- Verify email confirmation settings
- Test with different browsers/incognito mode

**4. File Upload Errors**
- Ensure storage bucket exists and is public
- Check storage policies
- Verify file size limits

### Debug Steps

1. **Check Environment Variables**
```javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
```

2. **Test Database Connection**
```javascript
import { supabase } from './src/config/supabase';
const { data, error } = await supabase.from('projects').select('*').limit(1);
console.log('DB Test:', { data, error });
```

3. **Check Browser Console**
- Look for network errors
- Check for JavaScript errors
- Verify API responses

## 📊 Monitoring

### Key Metrics to Monitor
- User registration rates
- Project posting frequency
- Bid submission rates
- Message volume
- Payment processing
- Error rates

### Supabase Dashboard
- Monitor database usage
- Check API request volume
- Review authentication metrics
- Track storage usage

## 🔐 Security Considerations

### Production Security
- [ ] RLS policies properly configured
- [ ] API keys secured (never expose service role key)
- [ ] File upload restrictions in place
- [ ] Rate limiting configured
- [ ] HTTPS enforced

### Data Protection
- [ ] User data encrypted at rest
- [ ] Secure password handling
- [ ] PII protection measures
- [ ] GDPR compliance (if applicable)

## 📈 Performance Optimization

### Frontend Optimization
- [ ] Code splitting implemented
- [ ] Images optimized
- [ ] Bundle size minimized
- [ ] Caching strategies in place

### Database Optimization
- [ ] Proper indexing on frequently queried columns
- [ ] Query optimization
- [ ] Connection pooling
- [ ] Regular maintenance

## 🔄 Maintenance

### Regular Tasks
- Monitor Supabase usage and billing
- Review error logs and fix issues
- Update dependencies regularly
- Backup important data
- Monitor performance metrics

### Updates
- Test new features in staging environment
- Deploy during low-traffic periods
- Monitor for issues after deployment
- Have rollback plan ready

## 📞 Support

### Getting Help
- Check Supabase documentation
- Review application logs
- Test in development environment first
- Contact support if needed

### Useful Resources
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

🎉 **Congratulations!** Your GigCampus platform is now ready for production use!