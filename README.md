# BNBB - Student-Company Project Platform

A React-based platform connecting students with companies for project opportunities, built with localStorage for data persistence.

## Features

- **User Authentication**: Student and company registration/login
- **Project Management**: Companies can post projects, students can browse and bid
- **Dashboard**: Separate dashboards for students and companies
- **Real-time Updates**: Simulated real-time functionality with localStorage
- **Responsive Design**: Modern UI built with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### First Time Setup

1. Visit `/setup` to initialize the app with sample data
2. Use the test credentials to login:
   - **Student**: `student@test.edu` / `password123`
   - **Company**: `company@test.com` / `password123`

## Available Routes

### Public Routes
- `/` - Home page
- `/setup` - Initial setup page
- `/login` - Student/company login
- `/register` - User registration
- `/test` - Test localStorage functionality

### Protected Routes (with navbar)
- `/dashboard` - Student dashboard
- `/company-dashboard` - Company dashboard
- `/projects` - Browse all projects
- `/projects/:id` - Project details
- `/my-bids` - Student's submitted bids
- `/my-projects` - Company's posted projects
- `/post-project` - Create new project (companies only)
- `/profile` - User profile settings
- `/messages` - Messaging system
- `/chat` - Chat interface

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Data Storage**: localStorage (client-side)

## Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard components
│   ├── opportunities/  # Project/opportunity components
│   └── projects/       # Project-related components
├── contexts/           # React contexts
├── services/           # Data services
├── types/              # TypeScript type definitions
└── data/               # Mock data
```

## Features in Detail

### For Students
- Browse available projects
- Submit bids with proposals
- View project details and requirements
- Track bid status
- Manage profile and skills

### For Companies
- Post new project opportunities
- Review student bids
- Manage project listings
- Track project progress
- Communicate with students

## Data Storage

This application uses localStorage for data persistence, which means:
- Data is stored locally in the browser
- No external database required
- Data persists between sessions
- Perfect for development and testing

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint

### Adding New Features

1. Create components in the appropriate directory
2. Add routes in `src/App.tsx`
3. Update types in `src/types/index.ts`
4. Add data services in `src/services/localStorageService.ts`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.