# GigCampus - Student Freelance Marketplace

A modern platform connecting talented students with companies seeking fresh perspectives and innovative solutions.

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
cd gigcampus
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

### 3. Set Up Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and run the contents of `supabase/migrations/create_complete_schema.sql`

This will create all necessary tables, indexes, and security policies.

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

## 🧪 Testing

### Test Accounts
The database migration includes sample test accounts:

**Student Account:**
- Email: `student@test.com`
- Password: `password123`

**Company Account:**
- Email: `company@test.com`
- Password: `password123`

### Test Features
1. **Registration/Login**: Create new accounts or use test accounts
2. **Project Management**: Post projects as company, browse as student
3. **Bidding System**: Submit bids and manage proposals
4. **Messaging**: Real-time chat with file sharing
5. **Escrow System**: Deposit funds, assign to projects, release payments
6. **Rating System**: Rate collaborators after project completion

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
- **Email Verification**: Required for account activation
- **Secure Authentication**: Powered by Supabase Auth
- **Escrow Protection**: Funds held securely until project completion
- **File Upload Security**: Secure file handling with size limits

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

### Real-time Features
- Live chat with file sharing
- Instant notifications
- Real-time bid updates
- Live project status changes

### Rating System
- Multi-dimensional ratings (communication, quality, timeliness, professionalism)
- Public/private review options
- Skill-specific ratings for students
- Trust building through verified reviews

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
- ✅ Database schema deployed
- ✅ RLS policies enabled
- ✅ Storage bucket created (optional)
- ✅ Environment variables set

### Email Configuration
- Configure SMTP settings in Supabase Auth
- Customize email templates
- Set up custom domain (optional)

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
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review Supabase logs for errors
- Ensure all environment variables are set correctly
- Verify database schema is properly deployed

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Advanced search and filtering
- [ ] Video call integration
- [ ] Payment gateway integration
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

---

Built with ❤️ for connecting students with opportunities.