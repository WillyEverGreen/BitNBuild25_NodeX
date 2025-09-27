import { Project, Bid, Notification, Message } from '../types';

export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'E-commerce Website Development',
    description: 'Looking for a skilled web developer to create a modern e-commerce website with React and Node.js. The project includes user authentication, payment integration, and admin dashboard.',
    budget: 1200,
    deadline: '2024-02-15',
    duration: '4 weeks',
    skills: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    category: 'Web Development',
    client_id: '2',
    client_name: 'TechCorp Solutions',
    client_rating: 4.9,
    status: 'open',
    bids_count: 8,
    created_at: '2024-01-20'
  },
  {
    id: '2',
    title: 'Mobile App UI/UX Design',
    description: 'Need a creative designer to design a mobile app interface for a fitness tracking application. Should include wireframes, mockups, and prototypes.',
    budget: 800,
    deadline: '2024-02-10',
    duration: '3 weeks',
    skills: ['UI/UX Design', 'Figma', 'Adobe XD', 'Prototyping'],
    category: 'Design',
    client_id: '2',
    client_name: 'TechCorp Solutions',
    client_rating: 4.9,
    status: 'open',
    bids_count: 12,
    created_at: '2024-01-18'
  },
  {
    id: '3',
    title: 'Data Analysis for Marketing Campaign',
    description: 'Analyze marketing data to provide insights on customer behavior and campaign performance. Experience with Python, pandas, and visualization tools required.',
    budget: 600,
    deadline: '2024-02-08',
    duration: '2 weeks',
    skills: ['Python', 'Data Analysis', 'Pandas', 'Matplotlib'],
    category: 'Data Science',
    client_id: '2',
    client_name: 'TechCorp Solutions',
    client_rating: 4.9,
    status: 'open',
    bids_count: 5,
    created_at: '2024-01-22'
  },
  {
    id: '4',
    title: 'Content Writing for Tech Blog',
    description: 'Write engaging technical blog posts about emerging technologies. Need 10 articles, 1000-1500 words each.',
    budget: 400,
    deadline: '2024-02-20',
    duration: '3 weeks',
    skills: ['Technical Writing', 'SEO', 'Content Marketing'],
    category: 'Writing',
    client_id: '2',
    client_name: 'TechCorp Solutions',
    client_rating: 4.9,
    status: 'open',
    bids_count: 15,
    created_at: '2024-01-19'
  }
];

export const mockBids: Bid[] = [
  {
    id: '1',
    project_id: '1',
    student_id: '1',
    student_name: 'John Smith',
    student_rating: 4.8,
    amount: 1150,
    proposal: 'I have extensive experience building e-commerce websites with React and Node.js. I can deliver a high-quality, responsive website with all the requested features.',
    delivery_time: 25,
    status: 'pending',
    created_at: '2024-01-21'
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    user_id: '1',
    type: 'bid',
    title: 'New Project Match',
    message: 'A new project matching your skills is available: "E-commerce Website Development"',
    read: false,
    created_at: '2024-01-23',
    action_url: '/projects/1'
  },
  {
    id: '2',
    user_id: '1',
    type: 'message',
    title: 'New Message',
    message: 'You have a new message from TechCorp Solutions',
    read: false,
    created_at: '2024-01-22'
  }
];

export const mockMessages: Message[] = [
  {
    id: '1',
    sender_id: '2',
    receiver_id: '1',
    content: 'Hi John, I saw your bid on the e-commerce project. Can we discuss the timeline?',
    timestamp: '2024-01-23T10:30:00Z',
    read: false
  },
  {
    id: '2',
    sender_id: '1',
    receiver_id: '2',
    content: 'Hello! Yes, I can definitely deliver within 25 days. Would you like to schedule a call?',
    timestamp: '2024-01-23T11:45:00Z',
    read: true
  }
];