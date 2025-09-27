import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getWalletByUserId, 
  createWallet, 
  getTransactionsByUserId,
  createBankAccount,
  getBankAccountsByUserId
} from '../../services/localStorageService';
import { Wallet, Transaction, BankAccount } from '../../types';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard,
  History,
  Plus,
  Building2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import BackButton from '../common/BackButton';

const StudentWallet: React.FC = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Withdrawal modal state
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [selectedBankAccount, setSelectedBankAccount] = useState('');
  
  // Bank account modal state
  const [showBankAccountModal, setShowBankAccountModal] = useState(false);
  const [bankAccountForm, setBankAccountForm] = useState({
    account_holder_name: '',
    bank_name: '',
    account_number: '',
    routing_number: '',
    account_type: 'checking' as 'checking' | 'savings'
  });

  // UI state
  const [showAccountNumbers, setShowAccountNumbers] = useState(false);

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

      // Load bank accounts
      const userBankAccounts = await getBankAccountsByUserId(user.id);
      setBankAccounts(userBankAccounts);

    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await createBankAccount({
        user_id: user.id,
        ...bankAccountForm,
        is_verified: true // Auto-verify for demo
      });
      
      await loadWalletData(); // Refresh data
      setShowBankAccountModal(false);
      setBankAccountForm({
        account_holder_name: '',
        bank_name: '',
        account_number: '',
        routing_number: '',
        account_type: 'checking'
      });
      alert('Bank account added successfully!');
    } catch (error) {
      console.error('Error adding bank account:', error);
      alert('Failed to add bank account. Please try again.');
    }
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !withdrawalAmount || !selectedBankAccount) return;

    const amount = parseFloat(withdrawalAmount);
    if (amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!wallet || wallet.balance < amount) {
      alert('Insufficient wallet balance');
      return;
    }

    try {
      // In a real app, this would process the withdrawal
      // For demo, we'll simulate it
      alert(`Withdrawal request of $${amount.toFixed(2)} has been submitted. Funds will be transferred to your bank account within 1-3 business days.`);
      
      setShowWithdrawalModal(false);
      setWithdrawalAmount('');
      setSelectedBankAccount('');
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      alert('Failed to process withdrawal. Please try again.');
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

  const maskAccountNumber = (accountNumber: string) => {
    if (showAccountNumbers) return accountNumber;
    return '****' + accountNumber.slice(-4);
  };

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'escrow_release':
      case 'project_payment':
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!user || user.type !== 'student') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600">This page is only available to students.</p>
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

  const pendingWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending');
  const totalEarnings = transactions
    .filter(t => (t.type === 'escrow_release' || t.type === 'project_payment') && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <BackButton to="/student-dashboard" />
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Student Wallet</h1>
        <p className="text-gray-600 mt-2">Manage your earnings and withdrawals</p>
      </div>

      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Available Balance</p>
              <p className="text-2xl font-bold">{formatCurrency(wallet?.balance || 0)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Earnings</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatCurrency(totalEarnings)}
              </p>
            </div>
            <ArrowDownLeft className="h-6 w-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Withdrawn</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatCurrency(wallet?.total_withdrawn || 0)}
              </p>
            </div>
            <ArrowUpRight className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Withdrawals</p>
              <p className="text-xl font-semibold text-gray-900">
                {pendingWithdrawals.length}
              </p>
            </div>
            <AlertCircle className="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setShowWithdrawalModal(true)}
          disabled={!wallet || wallet.balance <= 0 || bankAccounts.length === 0}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowUpRight className="h-5 w-5 mr-2" />
          Withdraw Funds
        </button>
        
        <button
          onClick={() => setShowBankAccountModal(true)}
          className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Bank Account
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
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No transactions yet</p>
                <p className="text-sm">Complete projects to start earning</p>
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
                        transaction.type === 'escrow_release' || transaction.type === 'project_payment'
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {transaction.type === 'escrow_release' || transaction.type === 'project_payment' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
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

        {/* Bank Accounts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Bank Accounts</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAccountNumbers(!showAccountNumbers)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title={showAccountNumbers ? 'Hide account numbers' : 'Show account numbers'}
                >
                  {showAccountNumbers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <Building2 className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {bankAccounts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No bank accounts added</p>
                <p className="text-sm">Add a bank account to withdraw funds</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bankAccounts.map((account) => (
                  <div key={account.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900">
                        {account.bank_name}
                      </h3>
                      {account.is_verified ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Pending
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>{account.account_holder_name}</p>
                      <p className="font-mono">
                        {maskAccountNumber(account.account_number)} • {account.account_type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Withdraw Funds</h3>
            
            <form onSubmit={handleWithdrawal}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount ($)
                </label>
                <input
                  type="number"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
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
                  Bank Account
                </label>
                <select
                  value={selectedBankAccount}
                  onChange={(e) => setSelectedBankAccount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select bank account...</option>
                  {bankAccounts.filter(account => account.is_verified).map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.bank_name} - {maskAccountNumber(account.account_number)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Processing Time:</strong> Withdrawals typically take 1-3 business days to process.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowWithdrawalModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Withdraw
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bank Account Modal */}
      {showBankAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Bank Account</h3>
            
            <form onSubmit={handleAddBankAccount}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={bankAccountForm.account_holder_name}
                  onChange={(e) => setBankAccountForm({...bankAccountForm, account_holder_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Full name on account"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={bankAccountForm.bank_name}
                  onChange={(e) => setBankAccountForm({...bankAccountForm, bank_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Chase Bank"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={bankAccountForm.account_number}
                  onChange={(e) => setBankAccountForm({...bankAccountForm, account_number: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Account number"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Routing Number
                </label>
                <input
                  type="text"
                  value={bankAccountForm.routing_number}
                  onChange={(e) => setBankAccountForm({...bankAccountForm, routing_number: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="9-digit routing number"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <select
                  value={bankAccountForm.account_type}
                  onChange={(e) => setBankAccountForm({...bankAccountForm, account_type: e.target.value as 'checking' | 'savings'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowBankAccountModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentWallet;
