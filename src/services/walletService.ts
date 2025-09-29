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

// Storage keys
const STORAGE_KEYS = {
  USERS: 'gigcampus_users',
  PROJECTS: 'gigcampus_projects',
  BIDS: 'gigcampus_bids',
  NOTIFICATIONS: 'gigcampus_notifications',
  MESSAGES: 'gigcampus_messages',
  WALLETS: 'gigcampus_wallets',
  TRANSACTIONS: 'gigcampus_transactions',
  ESCROWS: 'gigcampus_escrows',
  BANK_ACCOUNTS: 'gigcampus_bank_accounts',
  CURRENT_USER: 'gigcampus_current_user'
};

// Generate unique ID
const generateId = (): string => {
  return Math.random().toString(36).substr(2, 16);
};

// Get wallet by user ID
export const getWalletByUserId = async (userId: string): Promise<any> => {
  const wallets = getFromStorage<any>(STORAGE_KEYS.WALLETS);
  return wallets.find((w: any) => w.user_id === userId) || null;
};

// Create wallet
export const createWallet = async (userId: string): Promise<any> => {
  const wallets = getFromStorage<any>(STORAGE_KEYS.WALLETS);
  
  // Check if wallet already exists
  const existingWallet = wallets.find((w: any) => w.user_id === userId);
  if (existingWallet) {
    return existingWallet;
  }

  const newWallet = {
    id: generateId(),
    user_id: userId,
    balance: 0,
    currency: "USD",
    total_deposited: 0,
    total_withdrawn: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  wallets.push(newWallet);
  saveToStorage(STORAGE_KEYS.WALLETS, wallets);
  return newWallet;
};

// Deposit funds
export const depositFunds = async (userId: string, amount: number, description: string = 'Wallet deposit'): Promise<any> => {
  if (amount <= 0) {
    throw new Error('Deposit amount must be greater than 0');
  }

  // Get or create wallet
  let wallet = await getWalletByUserId(userId);
  if (!wallet) {
    wallet = await createWallet(userId);
  }

  // Create transaction
  const transaction = {
    id: generateId(),
    from_user_id: userId,
    to_user_id: userId,
    amount: amount,
    type: 'deposit',
    description: description,
    wallet_id: wallet.id,
    status: 'completed',
    completed_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  };

  const transactions = getFromStorage<any>(STORAGE_KEYS.TRANSACTIONS);
  transactions.push(transaction);
  saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);

  // Update wallet balance
  const wallets = getFromStorage<any>(STORAGE_KEYS.WALLETS);
  const walletIndex = wallets.findIndex((w: any) => w.id === wallet.id);
  if (walletIndex !== -1) {
    wallets[walletIndex].balance += amount;
    wallets[walletIndex].total_deposited += amount;
    wallets[walletIndex].updated_at = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.WALLETS, wallets);
    wallet = wallets[walletIndex];
  }

  return { wallet, transaction };
};

// Assign escrow to project
export const assignEscrowToProject = async (companyId: string, projectId: string, amount: number, description: string = 'Project escrow assignment'): Promise<any> => {
  if (amount <= 0) {
    throw new Error('Escrow amount must be greater than 0');
  }

  // Check wallet balance
  let wallet = await getWalletByUserId(companyId);
  console.log('Company wallet:', wallet);
  console.log('Requested amount:', amount);
  
  if (!wallet) {
    console.log('No wallet found for company, creating one...');
    // Auto-create wallet for company if it doesn't exist
    wallet = await createWallet(companyId);
    console.log('Created new wallet:', wallet);
    
    // For testing purposes, add some initial balance
    if (wallet.balance === 0) {
      console.log('Adding initial balance for testing...');
      await depositFunds(companyId, 10000, 'Initial balance for testing');
      wallet = await getWalletByUserId(companyId);
      console.log('Wallet after initial deposit:', wallet);
    }
  }
  
  if (!wallet || wallet.balance < amount) {
    throw new Error(`Insufficient wallet balance. Available: $${wallet?.balance || 0}, Required: $${amount}`);
  }

  // Get project to find assigned student
  const projects = getFromStorage<any>(STORAGE_KEYS.PROJECTS);
  console.log('Available projects in localStorage:', projects.map(p => ({ id: p.id, title: p.title })));
  console.log('Looking for project ID:', projectId);
  
  const project = projects.find((p: any) => p.id === projectId);
  
  // If project not found, we can still create escrow with unassigned student
  // This allows escrow creation even if project data isn't synced to localStorage
  let studentId = 'unassigned';
  if (project) {
    studentId = project.assigned_to || 'unassigned';
    console.log('Found project:', project.title, 'assigned to:', studentId);
  } else {
    console.warn(`Project ${projectId} not found in localStorage, creating escrow with unassigned student`);
    console.log('Available project IDs:', projects.map(p => p.id));
  }

  // Create escrow
  const escrow = {
    id: generateId(),
    project_id: projectId,
    company_id: companyId,
    student_id: studentId,
    amount: amount,
    status: 'assigned',
    description: description,
    assigned_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  };

  const escrows = getFromStorage<any>(STORAGE_KEYS.ESCROWS);
  escrows.push(escrow);
  saveToStorage(STORAGE_KEYS.ESCROWS, escrows);
  console.log('Created escrow:', escrow);
  console.log('Total escrows now:', escrows.length);

  // Create transaction
  const transaction = {
    id: generateId(),
    from_user_id: companyId,
    to_user_id: studentId,
    amount: amount,
    type: 'escrow_assignment',
    description: description,
    wallet_id: wallet.id,
    project_id: projectId,
    escrow_id: escrow.id,
    status: 'completed',
    completed_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  };

  const transactions = getFromStorage<any>(STORAGE_KEYS.TRANSACTIONS);
  transactions.push(transaction);
  saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
  console.log('Created escrow assignment transaction:', transaction);
  console.log('Total transactions now:', transactions.length);

  // Update wallet balance
  const wallets = getFromStorage<any>(STORAGE_KEYS.WALLETS);
  const walletIndex = wallets.findIndex((w: any) => w.id === wallet.id);
  if (walletIndex !== -1) {
    wallets[walletIndex].balance -= amount;
    wallets[walletIndex].updated_at = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.WALLETS, wallets);
  }

  console.log('Final result - escrow assignment completed:');
  console.log('- Escrow:', escrow);
  console.log('- Transaction:', transaction);
  console.log('- Updated wallet:', wallets[walletIndex]);
  
  return { escrow, transaction, wallet: wallets[walletIndex] };
};

// Release funds from escrow to student wallet
export const releaseFunds = async (escrowId: string, companyId: string, studentId: string, amount: number, description: string = 'Funds released to student'): Promise<any> => {
  if (amount <= 0) {
    throw new Error('Release amount must be greater than 0');
  }

  // Get escrow to verify it exists and has sufficient funds
  const escrows = getFromStorage<any>(STORAGE_KEYS.ESCROWS);
  const escrowIndex = escrows.findIndex((e: any) => e.id === escrowId && e.company_id === companyId);
  
  if (escrowIndex === -1) {
    throw new Error('Escrow not found');
  }

  const escrow = escrows[escrowIndex];
  if (escrow.amount < amount) {
    throw new Error('Insufficient escrow balance');
  }

  if (escrow.status === 'released') {
    throw new Error('Escrow funds have already been released');
  }

  // Get or create student wallet
  let studentWallet = await getWalletByUserId(studentId);
  if (!studentWallet) {
    studentWallet = await createWallet(studentId);
  }

  // Update escrow status to released
  escrows[escrowIndex].status = 'released';
  escrows[escrowIndex].released_at = new Date().toISOString();
  escrows[escrowIndex].updated_at = new Date().toISOString();
  saveToStorage(STORAGE_KEYS.ESCROWS, escrows);

  // Create transaction record
  const transaction = {
    id: generateId(),
    from_user_id: companyId,
    to_user_id: studentId,
    amount: amount,
    type: 'escrow_release',
    description: description,
    wallet_id: studentWallet.id,
    escrow_id: escrowId,
    status: 'completed',
    completed_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  };

  const transactions = getFromStorage<any>(STORAGE_KEYS.TRANSACTIONS);
  transactions.push(transaction);
  saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);

  // Update student wallet balance
  const wallets = getFromStorage<any>(STORAGE_KEYS.WALLETS);
  const walletIndex = wallets.findIndex((w: any) => w.id === studentWallet.id);
  if (walletIndex !== -1) {
    wallets[walletIndex].balance += amount;
    wallets[walletIndex].total_deposited += amount;
    wallets[walletIndex].updated_at = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.WALLETS, wallets);
    studentWallet = wallets[walletIndex];
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
    escrow: escrows[escrowIndex], 
    transaction, 
    studentWallet 
  };
};

// Get escrows by company ID
export const getEscrowsByCompanyId = async (companyId: string): Promise<any[]> => {
  const escrows = getFromStorage<any>(STORAGE_KEYS.ESCROWS);
  return escrows.filter((e: any) => e.company_id === companyId);
};

// Get escrows by project ID
export const getEscrowsByProjectId = async (projectId: string): Promise<any[]> => {
  const escrows = getFromStorage<any>(STORAGE_KEYS.ESCROWS);
  console.log('All escrows in localStorage:', escrows);
  console.log('All escrow project IDs:', escrows.map(e => e.project_id));
  console.log('Looking for project ID:', projectId);
  console.log('Project ID type:', typeof projectId);
  
  // Try multiple matching strategies
  const projectEscrows = escrows.filter((e: any) => {
    console.log(`Comparing escrow project_id "${e.project_id}" with search "${projectId}"`);
    
    // Direct match
    if (e.project_id === projectId) {
      console.log('Direct match found');
      return true;
    }
    
    // Check if the escrow's project_id is contained in the search projectId or vice versa
    if (e.project_id && projectId) {
      if (e.project_id.includes(projectId) || projectId.includes(e.project_id)) {
        console.log('Partial match found');
        return true;
      }
    }
    
    console.log('No match');
    return false;
  });
  
  console.log('Found escrows for project:', projectEscrows);
  
  // If no matches found, let's also check if we can find escrows by looking at all projects
  if (projectEscrows.length === 0) {
    console.log('No escrows found with direct matching, checking all projects...');
    const allProjects = getFromStorage<any>('gigcampus_projects');
    console.log('All projects:', allProjects.map((p: any) => ({ id: p.id, title: p.title })));
    
    // Find the project to get more info
    const project = allProjects.find((p: any) => p.id === projectId);
    if (project) {
      console.log('Found project:', project);
      console.log('Project assigned_to:', project.assigned_to);
      
      // Try to find escrows by company and student combination
      const alternativeEscrows = escrows.filter((e: any) => {
        return e.student_id === project.assigned_to || e.company_id === project.company_id;
      });
      console.log('Alternative escrows found:', alternativeEscrows);
      
      if (alternativeEscrows.length > 0) {
        return alternativeEscrows;
      }
    }
  }
  
  return projectEscrows;
};
