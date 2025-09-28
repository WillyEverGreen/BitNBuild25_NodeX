import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getWalletByUserId, 
  createWallet, 
  depositFunds, 
  getTransactionsByUserId,
  assignEscrowToProject,
  getProjectsByCompany,
  getEscrowsByCompanyId
} from '../../services/supabaseService';
import { Wallet, Transaction, Project, Escrow } from '../../types';
import { 
  DollarSign, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Shield,
  CreditCard,
  History,
  Lock
} from 'lucide-react';
import BackButton from '../common/BackButton';

const CompanyWallet: React.FC = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Deposit modal state
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('credit_card');
  
  // Escrow modal state
  const [showEscrowModal, setShowEscrowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [escrowAmount, setEscrowAmount] = useState('');
  const [escrowDescription, setEscrowDescription] = useState('');

  useEffect(() => {
    if (user) {
      loadWalletData();
    }
  }, [user]);

  const loadWalletData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get or create wallet
      let userWallet = await getWalletByUserId(user.id);
      if (!userWallet) {
        userWallet = await createWallet(user.id);
      }
      setWallet(userWallet);

      // Load transactions
      const userTransactions = await getTransactionsByUserId(user.id);
      setTransactions(userTransactions);

      // Load company projects
      const companyProjects = await getProjectsByCompany(user.id);
      setProjects(companyProjects);

      // Load escrows
      const companyEscrows = await getEscrowsByCompanyId(user.id);
      setEscrows(companyEscrows);

    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !depositAmount) return;

    const amount = parseFloat(depositAmount);
    if (amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      const result = await depositFunds(
        user.id, 
        amount, 
        `Deposit via ${depositMethod.replace('_', ' ')}`
      );
      
      setWallet(result.wallet);
      await loadWalletData(); // Refresh all data
      setShowDepositModal(false);
      setDepositAmount('');
      alert(`Successfully deposited $${amount.toFixed(2)} to your wallet!`);
    } catch (error) {
      console.error('Error depositing funds:', error);
      alert('Failed to deposit funds. Please try again.');
    }
  };

  const handleAssignEscrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedProject || !escrowAmount) return;

    const amount = parseFloat(escrowAmount);
    if (amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!wallet || wallet.balance < amount) {
      alert('Insufficient wallet balance');
      return;
    }

    try {
      const project = projects.find(p => p.id === selectedProject);
      const description = escrowDescription || `Escrow for ${project?.title}`;
      
      await assignEscrowToProject(user.id, selectedProject, amount, description);
      await loadWalletData(); // Refresh all data
      setShowEscrowModal(false);
      setSelectedProject('');
      setEscrowAmount('');
      setEscrowDescription('');
      alert(`Successfully assigned $${amount.toFixed(2)} to escrow for ${project?.title}!`);
    } catch (error) {
      console.error('Error assigning escrow:', error);
      alert('Failed to assign escrow. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case 'escrow_assignment':
        return <Lock className="h-4 w-4 text-orange-600" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEscrowStatusColor = (status: Escrow['status']) => {
    switch (status) {
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'locked':
        return 'bg-orange-100 text-orange-800';
      case 'released':
        return 'bg-green-100 text-green-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || user.type !== 'company') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600">This page is only available to companies.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const totalEscrowAmount = escrows
    .filter(escrow => escrow.status === 'assigned' || escrow.status === 'locked')
    .reduce((sum, escrow) => sum + escrow.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <BackButton to="/company-dashboard" />
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Company Wallet</h1>
        <p className="text-gray-600 mt-2">Manage your funds, deposits, and escrow assignments</p>
      </div>

      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Available Balance</p>
              <p className="text-2xl font-bold">{formatCurrency(wallet?.balance || 0)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Deposited</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatCurrency(wallet?.total_deposited || 0)}
              </p>
            </div>
            <ArrowDownLeft className="h-6 w-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">In Escrow</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatCurrency(totalEscrowAmount)}
              </p>
            </div>
            <Shield className="h-6 w-6 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Escrows</p>
              <p className="text-xl font-semibold text-gray-900">
                {escrows.filter(e => e.status === 'assigned' || e.status === 'locked').length}
              </p>
            </div>
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setShowDepositModal(true)}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Deposit Funds
        </button>
        
        <button
          onClick={() => setShowEscrowModal(true)}
          disabled={!wallet || wallet.balance <= 0 || projects.length === 0}
          className="flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Shield className="h-5 w-5 mr-2" />
          Assign Escrow
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
              <History className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="p-6">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No transactions yet</p>
                <p className="text-sm">Start by depositing funds to your wallet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(transaction.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${
                        transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Escrows */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Active Escrows</h2>
              <Shield className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="p-6">
            {escrows.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Lock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No escrows assigned</p>
                <p className="text-sm">Assign funds to projects to secure payments</p>
              </div>
            ) : (
              <div className="space-y-4">
                {escrows.map((escrow) => {
                  const project = projects.find(p => p.id === escrow.project_id);
                  return (
                    <div key={escrow.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-900">
                          {project?.title || 'Unknown Project'}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEscrowStatusColor(escrow.status)}`}>
                          {escrow.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(escrow.amount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(escrow.assigned_at)}
                        </p>
                      </div>
                      {escrow.description && (
                        <p className="text-xs text-gray-600 mt-1">{escrow.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Deposit Funds</h3>
            
            <form onSubmit={handleDeposit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount ($)
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={depositMethod}
                  onChange={(e) => setDepositMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="credit_card">Credit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Escrow Assignment Modal */}
      {showEscrowModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Escrow to Project</h3>
            
            <form onSubmit={handleAssignEscrow}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Project
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a project...</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title} - {formatCurrency(project.budget)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escrow Amount ($)
                </label>
                <input
                  type="number"
                  value={escrowAmount}
                  onChange={(e) => setEscrowAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                  max={wallet?.balance || 0}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available balance: {formatCurrency(wallet?.balance || 0)}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={escrowDescription}
                  onChange={(e) => setEscrowDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Purpose of this escrow..."
                  rows={3}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEscrowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Assign Escrow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyWallet;
