import { supabase } from '../config/supabase';
import { Project, Bid, Message, Notification, Opportunity, Escrow, Transaction, BankAccount } from '../types';

// Project Management
export const createProject = async (
  projectData: Omit<Project, "id" | "created_at">
): Promise<Project> => {
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
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if ((error as any).code === 'PGRST116') {
        return null; // Project not found
      }
      throw new Error(`Failed to fetch project: ${error.message}`);
    }

    return data as Project;
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
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
  try {
    const { data, error } = await supabase
      .from('bids')
      .insert([bidData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create bid: ${error.message}`);
    }

    // Update project bids count (best-effort)
    try {
      await supabase.rpc('increment_bids_count', { project_id: bidData.project_id });
    } catch (rpcErr) {
      console.warn('increment_bids_count failed (non-fatal):', rpcErr);
    }

    return data as Bid;
  } catch (error) {
    console.error('Error creating bid:', error);
    throw error;
  }
};

export const getBidsByProject = async (projectId: string): Promise<Bid[]> => {
  try {
    const { data, error } = await supabase
      .from('bids')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch bids: ${error.message}`);
    }

    return data as Bid[];
  } catch (error) {
    console.error('Error fetching bids:', error);
    throw error;
  }
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
  try {
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
  } catch (error) {
    console.error('Error updating bid:', error);
    throw error;
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
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }

    return data as Notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
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
  try {
    const { data, error } = await supabase
      .from('escrows')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch escrows: ${error.message}`);
    }

    return data as Escrow[];
  } catch (error) {
    console.error('Error fetching escrows:', error);
    throw error;
  }
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
  // Check if userId is a valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    console.warn('Non-UUID user ID detected, using localStorage transaction service');
    // Import and use localStorage service
    const { getTransactionsByUserId: getTransactionsLocal } = await import('./localStorageService');
    return await getTransactionsLocal(userId);
  }

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
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if ((error as any).code === 'PGRST116') {
        return null; // User not found
      }
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const getConversationsByUser = async (userId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch conversations: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

export const getMessagesByConversation = async (conversationId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }

    return data as Message[];
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const markMessagesAsRead = async (conversationId: string, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .eq('receiver_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Failed to mark messages as read:', error);
    }
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};

export const createMessage = async (messageData: Omit<Message, "id" | "timestamp"> | Omit<Message, "id" | "created_at">): Promise<Message> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create message: ${error.message}`);
    }

    // Ensure a conversation row exists and update last message
    try {
      const m = data as any;
      const convId: string = m.conversation_id || [m.sender_id, m.receiver_id].sort().join('_');
      const user1 = [m.sender_id, m.receiver_id].sort()[0];
      const user2 = [m.sender_id, m.receiver_id].sort()[1];

      await supabase
        .from('conversations')
        .upsert({
          id: convId,
          user1_id: user1,
          user2_id: user2,
          last_message: m.content,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
    } catch (convErr) {
      console.warn('Failed to upsert conversation metadata:', convErr);
    }

    return data as Message;
  } catch (error) {
    console.error('Error creating message:', error);
    throw error;
  }
};

// Ensure conversation exists utility (can be used by other features)
export const ensureConversation = async (userA: string, userB: string, projectTitle?: string, userAName?: string, userBName?: string): Promise<string> => {
  const convId = [userA, userB].sort().join('_');
  try {
    // Fetch user names if not provided
    let nameA = userAName;
    let nameB = userBName;

    if (!nameA || !nameB) {
      try {
        const [profileA, profileB] = await Promise.all([
          getUserById(userA),
          getUserById(userB)
        ]);
        nameA = nameA || profileA?.name || 'User';
        nameB = nameB || profileB?.name || 'User';
      } catch (err) {
        console.warn('Failed to fetch user names:', err);
      }
    }
    
    await supabase
      .from('conversations')
      .upsert({
        id: convId,
        user1_id: [userA, userB].sort()[0],
        user2_id: [userA, userB].sort()[1],
        user1_name: [userA, userB].sort()[0] === userA ? nameA : nameB,
        user2_name: [userA, userB].sort()[0] === userA ? nameB : nameA,
        project_title: projectTitle,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
  } catch (e) {
    console.warn('ensureConversation failed:', e);
  }
  return convId;
};

export const getWalletByUserId = async (userId: string): Promise<any> => {
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

export const updateEscrowStatus = async (escrowId: string, status: string, updates: Record<string, any> = {}): Promise<void> => {
  const { error } = await supabase
    .from('escrows')
    .update({ status, ...updates })
    .eq('id', escrowId);

  if (error) {
    throw new Error(`Failed to update escrow status: ${error.message}`);
  }
};

export const updateUser = async (userId: string, updates: any): Promise<any> => {
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

export const createWallet = async (userId: string): Promise<any> => {
  try {
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
  } catch (error) {
    console.error('Error creating wallet:', error);
    throw error;
  }
};

export const depositFunds = async (userId: string, amount: number, description: string = 'Wallet deposit'): Promise<any> => {
  if (amount <= 0) {
    throw new Error('Deposit amount must be greater than 0');
  }

  try {
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
  } catch (error) {
    console.error('Error depositing funds:', error);
    throw error;
  }
};

export const assignEscrowToProject = async (companyId: string, projectId: string, amount: number, description: string = 'Project escrow assignment'): Promise<any> => {
  if (amount <= 0) {
    throw new Error('Escrow amount must be greater than 0');
  }

  try {
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

    // Create escrow (Supabase schema uses 'pending' before release)
    const { data: escrow, error: escrowError } = await supabase
      .from('escrows')
      .insert([{
        project_id: projectId,
        company_id: companyId,
        student_id: studentId === 'unassigned' ? null : studentId,
        amount: amount,
        status: 'assigned',
        description: description,
        assigned_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (escrowError) {
      throw new Error(`Failed to create escrow: ${escrowError.message}`);
    }

    // Create transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert([{
        from_user_id: companyId,
        to_user_id: studentId === 'unassigned' ? null : studentId,
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
  } catch (error) {
    console.error('Error assigning escrow:', error);
    throw error;
  }
};

export const releaseFunds = async (escrowId: string, companyId: string, studentId: string, amount: number, description: string = 'Funds released to student'): Promise<any> => {
  // Check if companyId is a valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(companyId)) {
    console.warn('Non-UUID company ID detected, using localStorage release funds service');
    const { releaseFunds: releaseFundsLocal } = await import('./walletService');
    return await releaseFundsLocal(escrowId, companyId, studentId, amount, description);
  }

  if (amount <= 0) {
    throw new Error('Release amount must be greater than 0');
  }

  try {
    // Get escrow to verify it exists and has sufficient funds
    const { data: escrow, error: escrowError } = await supabase
      .from('escrows')
      .select('*')
      .eq('id', escrowId)
      .eq('company_id', companyId)
      .single();

    if (escrowError || !escrow) {
      console.warn('Supabase escrow fetch failed, using localStorage fallback:', escrowError);
      const { releaseFunds: releaseFundsLocal } = await import('./walletService');
      return await releaseFundsLocal(escrowId, companyId, studentId, amount, description);
    }

    if (escrow.amount < amount) {
      throw new Error('Insufficient escrow balance');
    }

    // Get or create student wallet
    let studentWallet = await getWalletByUserId(studentId);
    if (!studentWallet) {
      studentWallet = await createWallet(studentId);
    }

    // Update escrow status to released
    const { data: updatedEscrow, error: escrowUpdateError } = await supabase
      .from('escrows')
      .update({
        status: 'released',
        released_at: new Date().toISOString()
      })
      .eq('id', escrowId)
      .select()
      .single();

    if (escrowUpdateError) {
      console.warn('Supabase escrow update failed, using localStorage fallback:', escrowUpdateError);
      const { releaseFunds: releaseFundsLocal } = await import('./walletService');
      return await releaseFundsLocal(escrowId, companyId, studentId, amount, description);
    }

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert([{
        from_user_id: companyId,
        to_user_id: studentId,
        amount: amount,
        type: 'escrow_release',
        description: description,
        wallet_id: studentWallet.id,
        escrow_id: escrowId,
        status: 'completed',
        completed_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (transactionError) {
      console.warn('Supabase transaction creation failed, using localStorage fallback:', transactionError);
      const { releaseFunds: releaseFundsLocal } = await import('./walletService');
      return await releaseFundsLocal(escrowId, companyId, studentId, amount, description);
    }

    // Update student wallet balance
    const { data: updatedWallet, error: walletError } = await supabase
      .from('wallets')
      .update({
        balance: studentWallet.balance + amount,
        total_deposited: studentWallet.total_deposited + amount
      })
      .eq('id', studentWallet.id)
      .select()
      .single();

    if (walletError) {
      console.warn('Supabase wallet update failed, using localStorage fallback:', walletError);
      const { releaseFunds: releaseFundsLocal } = await import('./walletService');
      return await releaseFundsLocal(escrowId, companyId, studentId, amount, description);
    }

    // Create rating opportunities for both parties
    try {
      const { createRatingOpportunities } = await import('./projectRatingService');
      await createRatingOpportunities(escrow.project_id, companyId, studentId);
      console.log('Rating opportunities created after fund release');
    } catch (error) {
      console.error('Error creating rating opportunities:', error);
    }

    // Update student skill stats on successful project completion
    try {
      const { updateSkillStatsOnProjectCompletion } = await import('./skillRatingService');
      await updateSkillStatsOnProjectCompletion(studentId, escrow.project_id, true);
      console.log('Skill stats updated for student after fund release');
    } catch (error) {
      console.error('Error updating skill stats:', error);
    }

    return { 
      escrow: updatedEscrow, 
      transaction, 
      studentWallet: updatedWallet 
    };
  } catch (error) {
    console.warn('Error with funds release, using localStorage fallback:', error);
    const { releaseFunds: releaseFundsLocal } = await import('./walletService');
    return await releaseFundsLocal(escrowId, companyId, studentId, amount, description);
  }
};

export const getEscrowsByCompanyId = async (companyId: string): Promise<Escrow[]> => {
  try {
    const { data, error } = await supabase
      .from('escrows')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch company escrows: ${error.message}`);
    }

    return data as Escrow[];
  } catch (error) {
    console.error('Error fetching company escrows:', error);
    return [];
  }
};

// Bank Account Management
export const createBankAccount = async (bankAccountData: Omit<BankAccount, "id" | "created_at">): Promise<BankAccount> => {
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