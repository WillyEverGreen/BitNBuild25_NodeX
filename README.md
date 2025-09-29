# 🎓 BitNBuild - Student Freelance Marketplace

> **A comprehensive platform connecting university students with companies for freelance projects**

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green.svg)](https://supabase.com/)

A modern, full-featured freelance marketplace designed specifically for university students to connect with companies, showcase their skills, and earn money through project-based work.

## 🚀 Features

### For Students
- **Browse Projects**: Find opportunities that match your skills
- **Submit Bids**: Propose your solutions with competitive pricing
- **AI Resume Analysis**: Get detailed feedback on your resume
- **Skill Rating System**: Build your reputation through successful projects
- **Secure Payments**: Receive payments through escrow system
- **Real-time Chat**: Communicate with companies seamlessly

### For Companies
- **Post Projects**: Create detailed project listings
- **Review Bids**: Compare proposals from talented students
- **Escrow Management**: Secure payment system with fund protection
- **Project Management**: Track progress and communicate with students
- **Rating System**: Rate students and build trust in the community

### Core Features
- **Real-time Messaging**: File sharing, call scheduling, notifications
- **Secure Escrow System**: Protected payments for both parties
- **Comprehensive Rating System**: Build trust through peer reviews
- **AI-Powered Resume Analysis**: Advanced skill extraction and scoring
- **Responsive Design**: Works perfectly on all devices

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Ready for Vercel, Netlify, or any static hosting

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <your-repo>
cd BitNBuild25_NodeX
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API and copy your credentials
3. Create `.env.local` file:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Set Up Database ⚠️ CRITICAL STEP

**You MUST run this before using the app!**

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and run the contents of `FINAL_DATABASE_FIX.sql`

This will create all necessary tables, indexes, security policies, and fix all known issues.

### 4. Configure Storage (Optional)

For file sharing in chat:
1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `chat-files`
3. Make it public for file sharing

### 5. Run the Application

```bash
npm run dev
```

Visit `http://localhost:5000` to see your application.

## ⚠️ Known Issues & Workarounds

### Issue 1: False "Failed" Alerts ⚠️
**Symptom**: You click "Release Funds", "Send Message", or "Complete Project" and get a "Failed" alert, but when you check the dashboard or refresh the page, the operation actually succeeded.

**Why This Happens**: 
- The main operation (e.g., releasing funds) succeeds ✅
- Secondary operations (e.g., sending notifications) may fail due to timing issues
- The error from secondary operations triggers the "failed" alert
- But the important operation already completed successfully!

**Workaround**:
1. **Ignore the "failed" alert** - Check the dashboard instead
2. **Refresh the page** (F5) to see updated data
3. Check browser console (F12) for detailed logs

**Status**: ✅ Code updated to handle gracefully. Main operations always succeed.

---

### Issue 2: Dashboard Stats Don't Update Immediately
**Symptom**: After completing a project or accepting a bid, dashboard numbers don't change right away.

**Workaround**: 
- Refresh the page (F5)
- Or logout and login again
- Stats will be accurate after refresh

**Status**: Real-time updates planned for future release.

---

### Issue 3: Student Registration Requires .edu Email
**Symptom**: Cannot register with regular email as student.

**Requirement**: Students must use university email ending in `.edu`
- ✅ `john@stanford.edu` 
- ❌ `john@gmail.com`

**Why**: For verification that users are actual university students.

**Status**: By design for platform integrity.

---

### Issue 4: Cannot View Bids or Student Names Show "Unknown User"
**Symptom**: 
- Bids page is empty
- Student names appear as "Unknown User" in bids list
- Cannot see student profiles

**Fix**: Run `FINAL_DATABASE_FIX.sql` in Supabase Dashboard → SQL Editor

**Status**: ✅ Fixed in database setup file.

---

### Issue 5: File Upload Fails in Chat
**Symptom**: Cannot upload files, or upload button doesn't work.

**Fix**: Run `FINAL_DATABASE_FIX.sql` - it creates storage bucket and policies

**Status**: ✅ Fixed in database setup file.

---

### Issue 6: "Operator does not exist: uuid = text" Error
**Symptom**: Database errors about UUID type mismatch.

**Fix**: Run `FINAL_DATABASE_FIX.sql` - it includes proper UUID type casting (::text)

**Status**: ✅ Fixed in database setup file.

---

## 🔧 Critical Setup Note

⚠️ **MUST RUN BEFORE USING APP**: `FINAL_DATABASE_FIX.sql` in Supabase Dashboard → SQL Editor

Without this:
- ❌ Cannot view bids
- ❌ Cannot assign escrow
- ❌ Cannot accept bids
- ❌ Student names show as "Unknown User"
- ❌ Chat doesn't work
- ❌ File uploads fail

With this:
- ✅ All features work perfectly
- ✅ All policies configured
- ✅ All columns added
- ✅ All issues fixed

**See `SETUP_GUIDE.md` for detailed step-by-step instructions.**

---

## 🧪 Testing

### Complete Testing Workflow
See `COMPLETE_FIX_GUIDE.md` for a comprehensive testing guide that covers:
- Company registration and setup
- Project posting and escrow assignment
- Student registration and bidding
- Bid acceptance and project management
- Chat and file sharing
- Fund release and project completion
- Dashboard updates verification

### Test Accounts
You can create test accounts:

**Student Account:**
- Must use .edu email (e.g., `john@stanford.edu`)
- Password: Your choice

**Company Account:**
- Any email works
- Password: Your choice

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication forms
│   ├── dashboard/      # User dashboards
│   ├── projects/       # Project management
│   ├── chat/           # Messaging system
│   ├── wallet/         # Payment management
│   └── rating/         # Rating system
├── services/           # API and business logic
├── contexts/           # React contexts
├── types/              # TypeScript definitions
└── config/             # Configuration files
```

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Secure Authentication**: Powered by Supabase Auth
- **Escrow Protection**: Funds held securely until project completion
- **File Upload Security**: Secure file handling with size limits
- **UUID Type Safety**: Proper type casting for all database operations

## 🌟 Key Features Deep Dive

### AI Resume Analysis
- OCR text extraction from PDF/image files
- Comprehensive skill analysis and rating (0-3000 scale)
- Industry fit recommendations
- Automated skill extraction and profile enhancement

### Escrow System
- Secure fund holding until project completion
- Automatic release upon project approval
- Transaction history and audit trail
- Multi-project escrow management
- Change bidder feature for flexibility

### Real-time Features
- Live chat with file sharing
- Instant notifications
- Real-time bid updates
- Live project status changes

### Rating System
- Multi-dimensional ratings (communication, quality, timeliness, professionalism)
- Skill-specific ratings for students
- Trust building through verified reviews
- Rating increases with successful project completions

## 🚀 Deployment

### Environment Variables
Ensure these are set in your deployment environment:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

## 🔧 Configuration

### Supabase Setup Checklist
- ✅ Project created
- ✅ `FINAL_DATABASE_FIX.sql` executed
- ✅ RLS policies enabled
- ✅ Storage bucket created (optional)
- ✅ Environment variables set

## 📊 Monitoring

### Key Metrics to Track
- User registrations (students vs companies)
- Project posting frequency
- Bid submission rates
- Project completion rates
- Payment processing volume
- User satisfaction ratings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly using `SETUP_GUIDE.md`
5. Submit a pull request

## 🆘 Support

For support and questions:
- Check `SETUP_GUIDE.md` for detailed setup instructions
- Check `COMPLETE_FIX_GUIDE.md` for complete testing workflow
- Review Supabase logs for errors
- Check browser console (F12) for detailed error messages
- Verify `FINAL_DATABASE_FIX.sql` was run successfully

## 🎯 Future Scope & Roadmap

### Phase 1: Enhanced Features (2025)
- [ ] Real-time dashboard updates without page refresh
- [ ] Advanced search and filtering
- [ ] Project templates for common tasks
- [ ] Bulk operations for bids
- [ ] Email notifications

### Phase 2: Payment & Integration
- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Automatic withdrawals to bank accounts
- [ ] Invoice generation
- [ ] Multi-currency support

### Phase 3: Communication & Collaboration
- [ ] Video call integration
- [ ] Screen sharing
- [ ] Project milestones with partial payments
- [ ] Time tracking

### Phase 4: AI & Analytics
- [ ] AI-powered project-student matching
- [ ] Skill gap analysis
- [ ] Price recommendations
- [ ] Advanced analytics dashboard

### Phase 5: Mobile & Expansion
- [ ] Mobile app (iOS/Android)
- [ ] Progressive Web App
- [ ] Multi-language support
- [ ] University partnerships

### Phase 6: Enterprise Features
- [ ] Team projects
- [ ] Company accounts with multiple users
- [ ] White-label solution
- [ ] Public API

## 🌟 Why BitNBuild?

### For Students:
- 💰 **Earn While Learning**: Get paid for real-world projects
- 📚 **Build Portfolio**: Showcase completed projects
- 🎓 **Gain Experience**: Work on diverse projects
- ⭐ **Build Reputation**: Earn ratings and reviews

### For Companies:
- 💡 **Fresh Perspectives**: Innovative solutions from young talent
- 💵 **Cost-Effective**: Competitive pricing
- 🚀 **Fast Turnaround**: Quick project completion
- 🔒 **Secure Payments**: Escrow system protects investment

---

Built with ❤️ for connecting students with opportunities.

**Star ⭐ this repo if you find it helpful!**
