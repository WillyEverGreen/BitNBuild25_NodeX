import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getBidsByStudent } from '../../services/supabaseService';
import { Bid } from '../../types';
import BackButton from '../common/BackButton';
import { DollarSign, Clock, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const MyBids: React.FC = () => {
  const { user } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.type === 'student') {
      loadBids();
    }
  }, [user]);

  const loadBids = async () => {
    try {
      setLoading(true);
      const studentBids = await getBidsByStudent(user!.id);
      setBids(studentBids);
    } catch (error) {
      console.error('Error loading bids:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (user?.type !== 'student') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600">Only students can view bids.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <BackButton to="/dashboard" />
        <h1 className="text-3xl font-bold text-gray-900 mt-4">My Bids</h1>
        <p className="text-gray-600 mt-2">Track all your project bids and their status</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : bids.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No bids yet</h3>
          <p className="text-gray-600 mb-4">Start bidding on projects to see them here</p>
          <a
            href="/projects"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Projects
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {bids.map((bid) => (
            <div key={bid.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {bid.student_name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Bid on project: <span className="font-medium">{bid.project_id}</span>
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(bid.status)}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(bid.status)}`}>
                    {bid.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <span className="font-semibold">${bid.amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{bid.delivery_time} days</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{new Date(bid.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Proposal</h4>
                <p className="text-sm text-gray-700">{bid.proposal}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBids;
