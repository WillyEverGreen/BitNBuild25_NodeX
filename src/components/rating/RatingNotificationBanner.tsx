import React, { useState, useEffect } from 'react';
import { Star, X, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getFromStorage, saveToStorage } from '../../services/localStorageService';

interface RatingNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  action_url?: string;
  metadata?: {
    projectId: string;
    userToRateId: string;
    userToRateType: 'student' | 'company';
    projectTitle: string;
  };
  created_at: string;
}

interface RatingNotificationBannerProps {
  onRateClick?: (projectId: string, userToRateId: string, userToRateType: 'student' | 'company') => void;
}

const RatingNotificationBanner: React.FC<RatingNotificationBannerProps> = ({ onRateClick }) => {
  const { user } = useAuth();
  const [ratingNotifications, setRatingNotifications] = useState<RatingNotification[]>([]);

  useEffect(() => {
    if (user) {
      loadRatingNotifications();
    }
  }, [user]);

  const loadRatingNotifications = () => {
    if (!user) return;

    const notifications = getFromStorage<RatingNotification>('gigcampus_notifications');
    const ratingNotifs = notifications.filter(n => 
      n.user_id === user.id && 
      n.type === 'rating_request' && 
      !n.read
    );

    setRatingNotifications(ratingNotifs);
  };

  const dismissNotification = (notificationId: string) => {
    const notifications = getFromStorage<RatingNotification>('gigcampus_notifications');
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    saveToStorage('gigcampus_notifications', updatedNotifications);
    
    setRatingNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleRateClick = (notification: RatingNotification) => {
    if (notification.metadata && onRateClick) {
      onRateClick(
        notification.metadata.projectId,
        notification.metadata.userToRateId,
        notification.metadata.userToRateType
      );
    }
    dismissNotification(notification.id);
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (ratingNotifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {ratingNotifications.map((notification) => (
        <div key={notification.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-yellow-800">
                  {notification.title}
                </h4>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center text-xs text-yellow-600">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTimeAgo(notification.created_at)}
                  </div>
                  <button
                    onClick={() => dismissNotification(notification.id)}
                    className="text-yellow-600 hover:text-yellow-800 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-yellow-700 mb-3">
                {notification.message}
              </p>
              
              {notification.metadata && (
                <div className="flex items-center justify-between">
                  <div className="text-xs text-yellow-600">
                    <strong>Project:</strong> {notification.metadata.projectTitle}
                  </div>
                  <button
                    onClick={() => handleRateClick(notification)}
                    className="inline-flex items-center px-3 py-1.5 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 transition-colors"
                  >
                    <Star className="h-3 w-3 mr-1" />
                    Rate Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RatingNotificationBanner;
