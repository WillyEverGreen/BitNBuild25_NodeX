import React, { useState, useEffect } from 'react';
import { getRatingStats, getRatingData, initializeRatingData } from '../../services/ratingService';

interface RatingDebugProps {
  userId: string;
}

const RatingDebug: React.FC<RatingDebugProps> = ({ userId }) => {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    loadDebugInfo();
  }, [userId]);

  const loadDebugInfo = () => {
    try {
      const ratingData = getRatingData(userId);
      const stats = getRatingStats(userId);
      
      setDebugInfo({
        hasRatingData: !!ratingData,
        ratingData,
        stats,
        userId
      });
    } catch (error) {
      console.error('Debug error:', error);
      setDebugInfo({ error: error.message, userId });
    }
  };

  const initializeRating = () => {
    try {
      initializeRatingData(userId);
      loadDebugInfo();
    } catch (error) {
      console.error('Initialize error:', error);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">Rating Debug Info</h3>
      <div className="text-sm text-yellow-700 space-y-1">
        <p><strong>User ID:</strong> {userId}</p>
        <p><strong>Has Rating Data:</strong> {debugInfo?.hasRatingData ? 'Yes' : 'No'}</p>
        <p><strong>Overall Rating:</strong> {debugInfo?.stats?.overall_rating || 'N/A'}</p>
        <p><strong>Total Skills:</strong> {debugInfo?.stats?.total_skills || 'N/A'}</p>
        {!debugInfo?.hasRatingData && (
          <button
            onClick={initializeRating}
            className="mt-2 px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
          >
            Initialize Rating Data
          </button>
        )}
      </div>
    </div>
  );
};

export default RatingDebug;
