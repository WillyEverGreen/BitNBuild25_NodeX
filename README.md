# 🎓 GigCampus – Hyperlocal Student Freelancer Marketplace  

![React](https://img.shields.io/badge/Frontend-React-blue?logo=react)  
![Node.js](https://img.shields.io/badge/Backend-Node.js-green?logo=node.js)  
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen?logo=mongodb)  
![License](https://img.shields.io/badge/License-MIT-yellow.svg)  
![Contributions](https://img.shields.io/badge/Contributions-Welcome-orange)  

GigCampus is a modern, professional, and fully functional **student freelancer marketplace** that connects university students with companies and firms. It provides a **clean, responsive UI for both web and mobile**, with seamless navigation, secure payments, smart matching, and reputation systems.  

---

## 🚀 Features  

### 🔑 Authentication  
- Student login restricted to `.edu` emails.  
- Company login with standard email & password.  
- Single Sign-On (Google / University accounts).  
- Forgot password & verification flows.  

### 👤 Profile & Resume  
- Student resume upload + **rating system** (accuracy, skills, experience).  
- Ratings dynamically adjust based on performance.  
- Skill assessments for validation.  
- Company profiles with payment preferences.  

### 📊 Dashboards  
- **Students**: Personalized project suggestions, earnings, bids, ratings.  
- **Companies**: Active projects, received bids, payments, student ratings.  

### 🔍 Project Discovery  
- Advanced filters (skills, department, budget, deadline).  
- Smart recommendations based on resume, skills, rating, past performance.  
- Bid submission with proposal & price.  

### 📂 Project Management  
- Students: Track projects (In Progress → Feedback → Completed).  
- Companies: Monitor submissions, review, approve or reject.  
- Ratings updated automatically per project.  

### 💬 Chat & Messaging  
- Real-time messaging with file sharing.  
- Notifications for new messages.  
- Scheduled video/voice calls.  

### 👜 Wallet & Payments  
- **Escrow-based payment system** for secure transactions.  
- Students withdraw funds after approval.  
- Companies view invoices & release payments.  

### 🏆 Reputation & Badges  
- Ratings & reviews influence bidding success.  
- Earn badges: *Top Performer, Verified Skills, Project Milestones*.  

### 🔗 Integrations  
- Google Drive, Dropbox, Notion for file submissions.  
- GitHub for coding projects.  
- Calendar sync for deadlines & calls.  

### 📈 Advanced Features  
- **Leaderboards**: Highlight top-performing students.  
- **Analytics**:  
  - Students → Completion rate, earnings trends, in-demand skills.  
  - Companies → Spending analytics, student performance insights.  
- **Referral Program**: Rewards for referrals and early project completions.  
- **Reusable Project Templates** for companies.  

---

## 🎨 UI/UX Requirements  
- Modern, clean, and responsive for **web & mobile**.  
- Separate dashboards for **students vs. companies**.  
- Consistent **color scheme, typography, and icons**.  
- Onboarding flow prompting students to add resume & interests.  
- Prominent display of **student ratings**.  

---

## ⚙️ Tech Stack  

**Frontend:** React.js / Next.js, TailwindCSS  
**Backend:** Node.js + Express.js  
**Database:** MongoDB  
**Authentication:** OAuth (Google, University SSO), JWT  
**Payments:** Stripe / Razorpay (Escrow support)  
**Messaging:** WebSockets (Socket.io)  
**Hosting:** Vercel (Frontend) + AWS/Render (Backend)  

---

## 🛠️ Installation & Setup  

```bash
# Clone the repository
git clone https://github.com/your-username/GigCampus.git

# Navigate into the project
cd GigCampus

# Install dependencies for backend
cd server
npm install

# Install dependencies for frontend
cd ../client
npm install

# Run backend (default: http://localhost:5000)
npm start

# Run frontend (default: http://localhost:3000)
npm start
GigCampus/
│
├── client/            # Frontend (React + TailwindCSS)
│   ├── public/
│   ├── src/
│   └── package.json
│
├── server/            # Backend (Node.js + Express + MongoDB)
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── server.js
│   └── package.json
│
├── README.md
└── LICENSE

