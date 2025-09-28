import { supabase } from '../config/supabase';
import { Project, Bid, Message, Notification, Opportunity, Escrow, Transaction, BankAccount } from '../types';

// Utility function to generate UUID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  return import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
};

// Mock data for when Supabase is not configured
const mockProjects: Project[] = [
  {
    id: 'mock1',
    title: 'Sample E-commerce Website',
    description: 'A modern e-commerce website with payment integration',
    budget: 2500,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    duration: '4 weeks',
    skills: ['React', 'Node.js', 'MongoDB'],
    category: 'Web Development',
    client_id: 'company1',
    client_name: 'Tech Solutions Inc',
    client_rating: 5.0,
    status: 'open',
    bids_count: 0,
    created_at: new Date().toISOString()
  }
];

// Project Management
export const createProject = async (
  projectData: Omit<Project, "id" | "created_at">
): Promise<Project> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, using mock data');
    const mockProject: Project = {
      ...projectData,
      id: generateId(),
      created_at: new Date().toISOString(),
      bids_count: 0,
    };
    mockProjects.push(mockProject);
    return mockProject;
  }

  const { data, error } = await supabase
    .from('projects')
    .insert([{
      ...projectData,
      bids_count: 0,
    }])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create project: ${error.message}`);
  }

  return data as Project;
};

export const getProjects = async (): Promise<Project[]> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, using mock data');
    return mockProjects;
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }

  return data as Project[];
};

export const getProjectById = async (id: string): Promise<Project | null> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Project not found
    }
    throw new Error(`Failed to fetch project: ${error.message}`);
  }

  return data as Project;
};

export const getProjectsByCompany = async (companyId: string): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch company projects: ${error.message}`);
  }

  return data as Project[];
};

export const updateProject = async (id: string, updates: Partial<Project>): Promise<Project> => {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update project: ${error.message}`);
  }

  return data as Project;
};

export const deleteProject = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete project: ${error.message}`);
  }
};

// Bid Management
export const createBid = async (bidData: Omit<Bid, "id" | "created_at">): Promise<Bid> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, using mock bid');
    const mockBid: Bid = {
      ...bidData,
      id: generateId(),
      created_at: new Date().toISOString(),
      status: "pending",
    };
    return mockBid;
  }

  const { data, error } = await supabase
    .from('bids')
    .insert([bidData])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create bid: ${error.message}`);
  }

  // Update project bids count
  await supabase.rpc('increment_bids_count', { project_id: bidData.project_id });

  return data as Bid;
};

export const getBidsByProject = async (projectId: string): Promise<Bid[]> => {
  const { data, error } = await supabase
    .from('bids')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch project bids: ${error.message}`);
  }

  return data as Bid[];
};

export const getBidsByStudent = async (studentId: string): Promise<Bid[]> => {
  const { data, error } = await supabase
    .from('bids')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch student bids: ${error.message}`);
  }

  return data as Bid[];
};

export const updateBid = async (id: string, updates: Partial<Bid>): Promise<Bid> => {
  const { data, error } = await supabase
    .from('bids')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update bid: ${error.message}`);
  }

  return data as Bid;
};

export const acceptBid = async (bidId: string, projectId: string): Promise<void> => {
  // Start a transaction-like operation
  const { error: bidError } = await supabase
    .from('bids')
    .update({ status: 'accepted' })
    .eq('id', bidId);

  if (bidError) {
    throw new Error(`Failed to accept bid: ${bidError.message}`);
  }

  // Get the accepted bid to get student_id
  const { data: bid, error: fetchError } = await supabase
    .from('bids')
    .select('student_id')
    .eq('id', bidId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch bid details: ${fetchError.message}`);
  }

  // Update project status and assign to student
  const { error: projectError } = await supabase
    .from('projects')
    .update({ 
      status: 'in-progress',
      assigned_to: bid.student_id
    })
    .eq('id', projectId);

  if (projectError) {
    throw new Error(`Failed to update project: ${projectError.message}`);
  }

  // Reject all other bids for this project
  const { error: rejectError } = await supabase
    .from('bids')
    .update({ status: 'rejected' })
    .eq('project_id', projectId)
    .neq('id', bidId);

  if (rejectError) {
    throw new Error(`Failed to reject other bids: ${rejectError.message}`);
  }
};

// Message Management
export const sendMessage = async (messageData: Omit<Message, "id" | "created_at">): Promise<Message> => {
  const { data, error } = await supabase
    .from('messages')
    .insert([messageData])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to send message: ${error.message}`);
  }

  return data as Message;
};

export const getMessages = async (userId: string, otherUserId?: string, projectId?: string): Promise<Message[]> => {
  let query = supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: true });

  if (otherUserId) {
    query = query.or(`sender_id.eq.${userId},receiver_id.eq.${otherUserId}`);
  }

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch messages: ${error.message}`);
  }

  return data as Message[];
};

export const markMessageAsRead = async (messageId: string): Promise<void> => {
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('id', messageId);

  if (error) {
    throw new Error(`Failed to mark message as read: ${error.message}`);
  }
};

// Notification Management
export const createNotification = async (notificationData: Omit<Notification, "id" | "created_at">): Promise<Notification> => {
  const { data, error } = await supabase
    .from('notifications')
    .insert([notificationData])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create notification: ${error.message}`);
  }

  return data as Notification;
};

export const getNotifications = async (userId: string): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch notifications: ${error.message}`);
  }

  return data as Notification[];
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) {
    throw new Error(`Failed to mark notification as read: ${error.message}`);
  }
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    throw new Error(`Failed to mark all notifications as read: ${error.message}`);
  }
};

// Opportunity Management
export const createOpportunity = async (opportunityData: Omit<Opportunity, "id" | "created_at">): Promise<Opportunity> => {
  const { data, error } = await supabase
    .from('opportunities')
    .insert([opportunityData])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create opportunity: ${error.message}`);
  }

  return data as Opportunity;
};

export const getOpportunities = async (): Promise<Opportunity[]> => {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch opportunities: ${error.message}`);
  }

  return data as Opportunity[];
};

export const getOpportunitiesByCompany = async (companyId: string): Promise<Opportunity[]> => {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch company opportunities: ${error.message}`);
  }

  return data as Opportunity[];
};

export const updateOpportunity = async (id: string, updates: Partial<Opportunity>): Promise<Opportunity> => {
  const { data, error } = await supabase
    .from('opportunities')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update opportunity: ${error.message}`);
  }

  return data as Opportunity;
};

export const deleteOpportunity = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('opportunities')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete opportunity: ${error.message}`);
  }
};

// Escrow Management
export const createEscrow = async (escrowData: Omit<Escrow, "id" | "created_at">): Promise<Escrow> => {
  const { data, error } = await supabase
    .from('escrows')
    .insert([escrowData])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create escrow: ${error.message}`);
  }

  return data as Escrow;
};

export const getEscrowsByProjectId = async (projectId: string): Promise<Escrow[]> => {
  const { data, error } = await supabase
    .from('escrows')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch project escrows: ${error.message}`);
  }

  return data as Escrow[];
};

export const releaseEscrowToStudent = async (escrowId: string): Promise<void> => {
  const { error } = await supabase
    .from('escrows')
    .update({ 
      status: 'released',
      released_at: new Date().toISOString()
    })
    .eq('id', escrowId);

  if (error) {
    throw new Error(`Failed to release escrow: ${error.message}`);
  }
};

// Transaction Management
export const createTransaction = async (transactionData: Omit<Transaction, "id" | "created_at">): Promise<Transaction> => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transactionData])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create transaction: ${error.message}`);
  }

  return data as Transaction;
};

export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }

  return data as Transaction[];
};

// Real-time subscriptions
export const subscribeToProjects = (callback: (payload: any) => void) => {
  return supabase
    .channel('projects')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, callback)
    .subscribe();
};

export const subscribeToBids = (projectId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`bids-${projectId}`)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'bids',
      filter: `project_id=eq.${projectId}`
    }, callback)
    .subscribe();
};

export const subscribeToMessages = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`messages-${userId}`)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'messages',
      filter: `or(sender_id.eq.${userId},receiver_id.eq.${userId})`
    }, callback)
    .subscribe();
};

export const subscribeToNotifications = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`notifications-${userId}`)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    }, callback)
    .subscribe();
};

// Initialize sample data (for development/testing)
export const initializeSampleData = async (): Promise<void> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, skipping sample data initialization');
    return;
  }

  try {
    // Check if we already have projects
    const { data: existingProjects } = await supabase
      .from('projects')
      .select('id')
      .limit(1);

    if (existingProjects && existingProjects.length > 0) {
      return; // Sample data already exists
    }

    // Create sample projects
    const sampleProjects = [
      {
        title: "E-commerce Website Development",
        description: "Looking for a skilled developer to create a modern e-commerce website with payment integration and admin dashboard.",
        budget: 2500,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        duration: "4 weeks",
        skills: ["React", "Node.js", "MongoDB", "Stripe"],
        category: "Web Development",
        client_id: "company1",
        client_name: "Tech Solutions Inc",
        client_rating: 5.0,
        status: "open" as const,
        bids_count: 0
      },
      {
        title: "Mobile App UI/UX Design",
        description: "Need a creative designer to design a mobile app interface for a fitness tracking application.",
        budget: 1200,
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        duration: "3 weeks",
        skills: ["Figma", "Adobe XD", "UI/UX Design", "Prototyping"],
        category: "UI/UX Design",
        client_id: "company2",
        client_name: "Fitness Plus",
        client_rating: 4.8,
        status: "open" as const,
        bids_count: 0
      }
    ];

    const { error } = await supabase
      .from('projects')
      .insert(sampleProjects);

    if (error) {
      console.error('Error creating sample projects:', error);
    } else {
      console.log('Sample data initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
};

// Additional functions needed for compatibility
export const getUserById = async (userId: string): Promise<any> => {
  // This function is used for compatibility but we don't store users in Supabase
  // Return a mock user object for now
  return {
    id: userId,
    name: "Mock User",
    email: "mock@example.com",
    type: "student",
    rating: 4.5,
    skills: ["React", "Node.js"]
  };
};

export const getConversationsByUser = async (userId: string): Promise<any[]> => {
  // Mock implementation for conversations
  return [];
};

export const getMessagesByConversation = async (conversationId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('project_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch messages: ${error.message}`);
  }

  return data as Message[];
};

export const markMessagesAsRead = async (conversationId: string, userId: string): Promise<void> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, skipping mark messages as read');
    return;
  }

  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('project_id', conversationId)
    .eq('receiver_id', userId)
    .eq('read', false);

  if (error) {
    throw new Error(`Failed to mark messages as read: ${error.message}`);
  }
};

export const createMessage = async (messageData: Omit<Message, "id" | "created_at">): Promise<Message> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, using mock message');
    const mockMessage: Message = {
      ...messageData,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    return mockMessage;
  }

  const { data, error } = await supabase
    .from('messages')
    .insert([messageData])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to send message: ${error.message}`);
  }

  return data as Message;
};

export const getWalletByUserId = async (userId: string): Promise<any> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, using mock wallet');
    return {
      id: generateId(),
      user_id: userId,
      balance: 0,
      currency: "USD",
      total_deposited: 0,
      total_withdrawn: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Wallet not found
    }
    throw new Error(`Failed to fetch wallet: ${error.message}`);
  }

  return data;
};

export const getTransactionsByUserId = async (userId: string): Promise<Transaction[]> => {
  return await getTransactions(userId);
};

export const saveResumeAnalysis = async (userId: string, analysis: any): Promise<void> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, resume analysis not saved');
    return;
  }

  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        resume_analysis: analysis,
        resume_uploaded: true,
        skills: analysis.skills || []
      })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to save resume analysis: ${error.message}`);
    }

    console.log('Resume analysis saved successfully for user:', userId);
  } catch (error) {
    console.error('Error saving resume analysis:', error);
    throw error;
  }
};

export const updateEscrowStatus = async (escrowId: string, status: string): Promise<void> => {
  const { error } = await supabase
    .from('escrows')
    .update({ status })
    .eq('id', escrowId);

  if (error) {
    throw new Error(`Failed to update escrow status: ${error.message}`);
  }
};

export const updateUser = async (userId: string, updates: any): Promise<any> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, user update not saved');
    return { id: userId, ...updates };
  }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    console.log('User updated successfully:', userId);
    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Wallet functions (proper implementations)
export const createWallet = async (userId: string): Promise<any> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, using mock wallet');
    return {
      id: generateId(),
      user_id: userId,
      balance: 0,
      currency: "USD",
      total_deposited: 0,
      total_withdrawn: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  const { data, error } = await supabase
    .from('wallets')
    .insert([{
      user_id: userId,
      balance: 0,
      currency: 'USD',
      total_deposited: 0,
      total_withdrawn: 0
    }])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create wallet: ${error.message}`);
  }

  return data;
};

export const depositFunds = async (userId: string, amount: number, description: string = 'Wallet deposit'): Promise<any> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, using mock deposit');
    return { 
      wallet: { id: userId, balance: amount, currency: "USD" },
      transaction: { id: generateId(), amount, type: 'deposit', status: 'completed' }
    };
  }

  if (amount <= 0) {
    throw new Error('Deposit amount must be greater than 0');
  }

  // Get or create wallet
  let wallet = await getWalletByUserId(userId);
  if (!wallet) {
    wallet = await createWallet(userId);
  }

  // Create transaction
  const { data: transaction, error: transactionError } = await supabase
    .from('transactions')
    .insert([{
      from_user_id: userId,
      to_user_id: userId,
      amount: amount,
      type: 'deposit',
      description: description,
      wallet_id: wallet.id,
      status: 'completed',
      completed_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (transactionError) {
    throw new Error(`Failed to create transaction: ${transactionError.message}`);
  }

  // Update wallet balance
  const { data: updatedWallet, error: walletError } = await supabase
    .from('wallets')
    .update({
      balance: wallet.balance + amount,
      total_deposited: wallet.total_deposited + amount
    })
    .eq('id', wallet.id)
    .select()
    .single();

  if (walletError) {
    throw new Error(`Failed to update wallet: ${walletError.message}`);
  }

  return { wallet: updatedWallet, transaction };
};

export const assignEscrowToProject = async (companyId: string, projectId: string, amount: number, description: string = 'Project escrow assignment'): Promise<any> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, using mock escrow');
    return { 
      escrow: { id: generateId(), project_id: projectId, amount, status: 'pending' },
      transaction: { id: generateId(), amount, type: 'escrow_assignment', status: 'completed' }
    };
  }

  if (amount <= 0) {
    throw new Error('Escrow amount must be greater than 0');
  }

  // Check wallet balance
  const wallet = await getWalletByUserId(companyId);
  if (!wallet || wallet.balance < amount) {
    throw new Error('Insufficient wallet balance');
  }

  // Get project to find assigned student
  const project = await getProjectById(projectId);
  if (!project) {
    throw new Error('Project not found');
  }

  const studentId = project.assigned_to || 'unassigned';

  // Create escrow
  const escrow = await createEscrow({
    project_id: projectId,
    company_id: companyId,
    student_id: studentId,
    amount: amount,
    status: 'pending'
  });

  // Create transaction
  const { data: transaction, error: transactionError } = await supabase
    .from('transactions')
    .insert([{
      from_user_id: companyId,
      to_user_id: studentId,
      amount: amount,
      type: 'escrow_assignment',
      description: description,
      wallet_id: wallet.id,
      project_id: projectId,
      escrow_id: escrow.id,
      status: 'completed',
      completed_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (transactionError) {
    throw new Error(`Failed to create transaction: ${transactionError.message}`);
  }

  // Update wallet balance
  const { data: updatedWallet, error: walletError } = await supabase
    .from('wallets')
    .update({
      balance: wallet.balance - amount
    })
    .eq('id', wallet.id)
    .select()
    .single();

  if (walletError) {
    throw new Error(`Failed to update wallet: ${walletError.message}`);
  }

  return { escrow, transaction, wallet: updatedWallet };
};

export const getEscrowsByCompanyId = async (companyId: string): Promise<Escrow[]> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, using mock escrows');
    return [];
  }

  const { data, error } = await supabase
    .from('escrows')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch company escrows: ${error.message}`);
  }

  return data as Escrow[];
};

// Bank Account Management
export const createBankAccount = async (bankAccountData: Omit<BankAccount, "id" | "created_at">): Promise<BankAccount> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, using mock bank account');
    const mockBankAccount: BankAccount = {
      ...bankAccountData,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    return mockBankAccount;
  }

  const { data, error } = await supabase
    .from('bank_accounts')
    .insert([bankAccountData])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create bank account: ${error.message}`);
  }

  return data as BankAccount;
};

export const getBankAccountsByUserId = async (userId: string): Promise<BankAccount[]> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, using mock bank accounts');
    return [];
  }

  const { data, error } = await supabase
    .from('bank_accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch bank accounts: ${error.message}`);
  }

  return data as BankAccount[];
};