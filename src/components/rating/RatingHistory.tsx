import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Upload, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import { getRatingData, UserRatingData, deleteRatingHistory } from '../../services/ratingService';

interface RatingHistoryProps {
  userId: string;
  className?: string;
}

const RatingHistory: React.FC<RatingHistoryProps> = ({ userId, className = '' }) => {
  const [ratingData, setRatingData] = useState<UserRatingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRatingData();
  }, [userId]);

  const loadRatingData = () => {
    try {
      const data = getRatingData(userId);
      setRatingData(data);
    } catch (error) {
      console.error('Error loading rating data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistory = () => {
    if (window.confirm('Are you sure you want to delete your rating history? This action cannot be undone.')) {
      try {
        deleteRatingHistory(userId);
        loadRatingData(); // Reload data
        alert('Rating history deleted successfully!');
      } catch (error) {
        console.error('Error deleting rating history:', error);
        alert('Failed to delete rating history. Please try again.');
      }
    }
  };

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'project_completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'project_failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'resume_upload':
        return <Upload className="h-4 w-4 text-blue-500" />;
      case 'skill_improvement':
        return <TrendingUp className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'project_completed':
        return 'text-green-600';
      case 'project_failed':
        return 'text-red-600';
      case 'resume_upload':
        return 'text-blue-600';
      case 'skill_improvement':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 rounded-lg h-32"></div>
      </div>
    );
  }

  if (!ratingData || ratingData.rating_history.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating History</h3>
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No rating history yet</p>
          <p className="text-sm text-gray-400 mt-1">Complete projects to see your rating changes</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Rating History</h3>
        {ratingData && ratingData.rating_history.length > 0 && (
          <button
            onClick={handleDeleteHistory}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete History</span>
          </button>
        )}
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {ratingData.rating_history
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .map((entry) => (
            <div key={entry.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 mt-0.5">
                {getReasonIcon(entry.reason)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${getReasonColor(entry.reason)}`}>
                    {entry.reason === 'project_completed' && 'Project Completed'}
                    {entry.reason === 'project_failed' && 'Project Failed'}
                    {entry.reason === 'resume_upload' && 'Resume Uploaded'}
                    {entry.reason === 'skill_improvement' && 'Skill Improved'}
                  </p>
                  <div className="flex items-center space-x-2">
                    {entry.change > 0 ? (
                      <div className="flex items-center text-green-600">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        <span className="text-sm font-medium">+{entry.change.toFixed(1)}</span>
                      </div>
                    ) : entry.change < 0 ? (
                      <div className="flex items-center text-red-600">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        <span className="text-sm font-medium">{entry.change.toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No change</span>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mt-1">{entry.description}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDate(entry.timestamp)}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default RatingHistory;
