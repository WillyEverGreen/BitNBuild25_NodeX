import {
  Student,
  Company,
  Project,
  Bid,
  Notification,
  Message,
} from "../types";

// Utility functions for local storage
const getFromStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return [];
  }
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Storage keys
const STORAGE_KEYS = {
  USERS: "bnbb_users",
  PROJECTS: "bnbb_projects",
  BIDS: "bnbb_bids",
  NOTIFICATIONS: "bnbb_notifications",
  MESSAGES: "bnbb_messages",
  CURRENT_USER: "bnbb_current_user",
  PORTFOLIO: "bnbb_portfolio",
  BADGES: "bnbb_badges",
};

// User Management
export const createUser = async (
  userData: Partial<Student | Company>,
  password: string
): Promise<Student | Company> => {
  const users = getFromStorage<Student | Company>(STORAGE_KEYS.USERS);

  // Check if user already exists
  const existingUser = users.find((user) => user.email === userData.email);
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const newUser: Student | Company = {
    id: generateId(),
    email: userData.email!,
    name: userData.name!,
    type: userData.type!,
    created_at: new Date().toISOString(),
    is_verified: true,
    avatar: userData.avatar,
    // Student fields
    ...(userData.type === "student" && {
      university: (userData as Student).university || "",
      year: (userData as Student).year || 1,
      major: (userData as Student).major || "",
      skills: (userData as Student).skills || [],
      interests: (userData as Student).interests || [],
      rating: 0,
      completed_projects: 0,
      total_earnings: 0,
      resume_uploaded: false,
      resume_url: (userData as Student).resume_url,
      available_hours: (userData as Student).available_hours || 0,
    }),
    // Company fields
    ...(userData.type === "company" && {
      company_name: (userData as Company).company_name || "",
      industry: (userData as Company).industry || "",
      website: (userData as Company).website,
      contact_person: (userData as Company).contact_person || "",
      posted_projects: 0,
      total_spent: 0,
      payment_method: (userData as Company).payment_method,
    }),
  } as Student | Company;

  // Store password separately (in real app, this should be hashed)
  const passwords = getFromStorage<{ email: string; password: string }>(
    "bnbb_passwords"
  );
  passwords.push({ email: userData.email!, password });
  saveToStorage("bnbb_passwords", passwords);

  users.push(newUser);
  saveToStorage(STORAGE_KEYS.USERS, users);

  return newUser;
};

export const signInUser = async (
  email: string,
  password: string
): Promise<Student | Company> => {
  const users = getFromStorage<Student | Company>(STORAGE_KEYS.USERS);
  const passwords = getFromStorage<{ email: string; password: string }>(
    "bnbb_passwords"
  );

  const user = users.find((u) => u.email === email);
  const userPassword = passwords.find((p) => p.email === email);

  if (!user || !userPassword || userPassword.password !== password) {
    throw new Error("Invalid email or password");
  }

  // Set current user
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));

  return user;
};

export const signOutUser = async (): Promise<void> => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

export const getCurrentUser = async (): Promise<Student | Company | null> => {
  try {
    const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

export const getUserById = async (
  userId: string
): Promise<Student | Company | null> => {
  const users = getFromStorage<Student | Company>(STORAGE_KEYS.USERS);
  return users.find((user) => user.id === userId) || null;
};

export const updateUser = async (
  userId: string,
  userData: Partial<Student | Company>
): Promise<Student | Company> => {
  const users = getFromStorage<Student | Company>(STORAGE_KEYS.USERS);
  const userIndex = users.findIndex((user) => user.id === userId);

  if (userIndex === -1) {
    throw new Error("User not found");
  }

  const updatedUser = { ...users[userIndex], ...userData } as Student | Company;
  users[userIndex] = updatedUser;
  saveToStorage(STORAGE_KEYS.USERS, users);

  // Update current user if it's the same user
  const currentUser = await getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    localStorage.setItem(
      STORAGE_KEYS.CURRENT_USER,
      JSON.stringify(updatedUser)
    );
  }

  return updatedUser;
};

// Project Management
export const createProject = async (
  projectData: Omit<Project, "id" | "created_at">
): Promise<Project> => {
  const projects = getFromStorage<Project>(STORAGE_KEYS.PROJECTS);

  const newProject: Project = {
    ...projectData,
    id: generateId(),
    created_at: new Date().toISOString(),
    bids_count: 0,
  };

  projects.push(newProject);
  saveToStorage(STORAGE_KEYS.PROJECTS, projects);

  return newProject;
};

export const getProjects = async (): Promise<Project[]> => {
  return getFromStorage<Project>(STORAGE_KEYS.PROJECTS);
};

export const getProjectById = async (
  projectId: string
): Promise<Project | null> => {
  const projects = getFromStorage<Project>(STORAGE_KEYS.PROJECTS);
  return projects.find((project) => project.id === projectId) || null;
};

export const getProjectsByCompany = async (
  companyId: string
): Promise<Project[]> => {
  const projects = getFromStorage<Project>(STORAGE_KEYS.PROJECTS);
  return projects.filter((project) => project.client_id === companyId);
};

export const updateProject = async (
  projectId: string,
  projectData: Partial<Project>
): Promise<Project> => {
  const projects = getFromStorage<Project>(STORAGE_KEYS.PROJECTS);
  const projectIndex = projects.findIndex(
    (project) => project.id === projectId
  );

  if (projectIndex === -1) {
    throw new Error("Project not found");
  }

  projects[projectIndex] = { ...projects[projectIndex], ...projectData };
  saveToStorage(STORAGE_KEYS.PROJECTS, projects);

  return projects[projectIndex];
};

// Bid Management
export const createBid = async (
  bidData: Omit<Bid, "id" | "created_at">
): Promise<Bid> => {
  const bids = getFromStorage<Bid>(STORAGE_KEYS.BIDS);

  // Check if user already bid on this project
  const existingBid = bids.find(
    (bid) =>
      bid.project_id === bidData.project_id &&
      bid.student_id === bidData.student_id
  );

  if (existingBid) {
    throw new Error("You have already placed a bid on this project");
  }

  const newBid: Bid = {
    ...bidData,
    id: generateId(),
    created_at: new Date().toISOString(),
    status: "pending",
  };

  bids.push(newBid);
  saveToStorage(STORAGE_KEYS.BIDS, bids);

  // Update project bid count
  const projects = getFromStorage<Project>(STORAGE_KEYS.PROJECTS);
  const projectIndex = projects.findIndex((p) => p.id === bidData.project_id);
  if (projectIndex !== -1) {
    projects[projectIndex].bids_count += 1;
    saveToStorage(STORAGE_KEYS.PROJECTS, projects);
  }

  return newBid;
};

export const getBidsByProject = async (projectId: string): Promise<Bid[]> => {
  const bids = getFromStorage<Bid>(STORAGE_KEYS.BIDS);
  return bids.filter((bid) => bid.project_id === projectId);
};

export const getBidsByStudent = async (studentId: string): Promise<Bid[]> => {
  const bids = getFromStorage<Bid>(STORAGE_KEYS.BIDS);
  return bids.filter((bid) => bid.student_id === studentId);
};

export const updateBid = async (
  bidId: string,
  bidData: Partial<Bid>
): Promise<Bid> => {
  const bids = getFromStorage<Bid>(STORAGE_KEYS.BIDS);
  const bidIndex = bids.findIndex((bid) => bid.id === bidId);

  if (bidIndex === -1) {
    throw new Error("Bid not found");
  }

  bids[bidIndex] = { ...bids[bidIndex], ...bidData };
  saveToStorage(STORAGE_KEYS.BIDS, bids);

  return bids[bidIndex];
};

// Notification Management
export const createNotification = async (
  notificationData: Omit<Notification, "id" | "created_at">
): Promise<Notification> => {
  const notifications = getFromStorage<Notification>(
    STORAGE_KEYS.NOTIFICATIONS
  );

  const newNotification: Notification = {
    ...notificationData,
    id: generateId(),
    created_at: new Date().toISOString(),
    read: false,
  };

  notifications.push(newNotification);
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);

  return newNotification;
};

export const getNotificationsByUser = async (
  userId: string
): Promise<Notification[]> => {
  const notifications = getFromStorage<Notification>(
    STORAGE_KEYS.NOTIFICATIONS
  );
  return notifications.filter(
    (notification) => notification.user_id === userId
  );
};

export const markNotificationAsRead = async (
  notificationId: string
): Promise<void> => {
  const notifications = getFromStorage<Notification>(
    STORAGE_KEYS.NOTIFICATIONS
  );
  const notificationIndex = notifications.findIndex(
    (n) => n.id === notificationId
  );

  if (notificationIndex !== -1) {
    notifications[notificationIndex].read = true;
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }
};

// Message Management
export const createMessage = async (
  messageData: Omit<Message, "id" | "timestamp">
): Promise<Message> => {
  const messages = getFromStorage<Message>(STORAGE_KEYS.MESSAGES);

  const newMessage: Message = {
    ...messageData,
    id: generateId(),
    timestamp: new Date().toISOString(),
    read: false,
  };

  messages.push(newMessage);
  saveToStorage(STORAGE_KEYS.MESSAGES, messages);

  return newMessage;
};

export const getMessagesByUsers = async (
  userId1: string,
  userId2: string
): Promise<Message[]> => {
  const messages = getFromStorage<Message>(STORAGE_KEYS.MESSAGES);
  return messages.filter(
    (message) =>
      (message.sender_id === userId1 && message.receiver_id === userId2) ||
      (message.sender_id === userId2 && message.receiver_id === userId1)
  );
};

// Mock subscription functions (for compatibility)
export const subscribeToProjects = (
  callback: (projects: Project[]) => void
) => {
  // Initial load
  callback(getFromStorage<Project>(STORAGE_KEYS.PROJECTS));

  // Return unsubscribe function
  return () => {};
};

export const subscribeToUserNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void
) => {
  // Initial load
  const notifications = getFromStorage<Notification>(
    STORAGE_KEYS.NOTIFICATIONS
  );
  callback(notifications.filter((n) => n.user_id === userId));

  // Return unsubscribe function
  return () => {};
};

// Initialize with some sample data
export const initializeSampleData = () => {
  const users = getFromStorage<Student | Company>(STORAGE_KEYS.USERS);
  const projects = getFromStorage<Project>(STORAGE_KEYS.PROJECTS);

  if (users.length === 0) {
    // Create sample users
    const sampleUsers: (Student | Company)[] = [
      {
        id: "student1",
        email: "student@test.edu",
        name: "John Student",
        type: "student",
        created_at: new Date().toISOString(),
        is_verified: true,
        university: "MIT",
        year: 3,
        major: "Computer Science",
        skills: ["React", "Node.js", "Python"],
        interests: ["Web Development", "AI"],
        rating: 4.5,
        completed_projects: 5,
        total_earnings: 2500,
        resume_uploaded: true,
        available_hours: 20,
      } as Student,
      {
        id: "company1",
        email: "company@test.com",
        name: "Tech Solutions Inc",
        type: "company",
        created_at: new Date().toISOString(),
        is_verified: true,
        company_name: "Tech Solutions Inc",
        industry: "Technology",
        contact_person: "Jane Manager",
        posted_projects: 3,
        total_spent: 5000,
      } as Company,
    ];

    saveToStorage(STORAGE_KEYS.USERS, sampleUsers);

    // Create sample passwords
    const passwords = [
      { email: "student@test.edu", password: "password123" },
      { email: "company@test.com", password: "password123" },
    ];
    saveToStorage("bnbb_passwords", passwords);
  }

  if (projects.length === 0) {
    // Create sample projects
    const sampleProjects: Project[] = [
      {
        id: "project1",
        title: "E-commerce Website Development",
        description:
          "Looking for a skilled web developer to create a modern e-commerce website with React and Node.js.",
        budget: 1200,
        deadline: "2024-03-15",
        duration: "4 weeks",
        skills: ["React", "Node.js", "MongoDB"],
        category: "Web Development",
        client_id: "company1",
        client_name: "Tech Solutions Inc",
        client_rating: 4.9,
        status: "open",
        bids_count: 0,
        created_at: new Date().toISOString(),
      },
      {
        id: "project2",
        title: "Mobile App UI/UX Design",
        description:
          "Need a creative designer to design a mobile app interface for a fitness tracking application.",
        budget: 800,
        deadline: "2024-03-10",
        duration: "3 weeks",
        skills: ["UI/UX Design", "Figma", "Adobe XD"],
        category: "Design",
        client_id: "company1",
        client_name: "Tech Solutions Inc",
        client_rating: 4.9,
        status: "open",
        bids_count: 0,
        created_at: new Date().toISOString(),
      },
    ];

    saveToStorage(STORAGE_KEYS.PROJECTS, sampleProjects);
  }
};
