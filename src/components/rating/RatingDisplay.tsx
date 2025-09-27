import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, TrendingDown, Award, Target, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import { getRatingStats, getTopSkills, UserRatingData } from '../../services/ratingService';

interface RatingDisplayProps {
  userId: string;
  className?: string;
  showDetails?: boolean;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({ 
  userId, 
  className = '', 
  showDetails = false 
}) => {
  const [ratingStats, setRatingStats] = useState({
    overall_rating: 0,
    total_skills: 0,
    total_projects_completed: 0,
    total_projects_failed: 0,
    success_rate: 0,
    top_skills: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRatingData();
  }, [userId]);

  const loadRatingData = () => {
    try {
      const stats = getRatingStats(userId);
      setRatingStats(stats);
    } catch (error) {
      console.error('Error loading rating data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
        }`}
        fill={i < Math.floor(rating) ? 'currentColor' : 'none'}
      />
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-yellow-600';
    if (rating >= 1.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return 'Expert';
    if (rating >= 3.5) return 'Advanced';
    if (rating >= 2.5) return 'Intermediate';
    if (rating >= 1.5) return 'Beginner';
    return 'Novice';
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 rounded-lg h-32"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Award className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">Skill Rating</h3>
        </div>
        <div className="flex items-center space-x-1">
          {renderStars(ratingStats.overall_rating)}
          <span className={`text-lg font-bold ml-2 ${getRatingColor(ratingStats.overall_rating)}`}>
            {ratingStats.overall_rating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Rating Level */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Skill Level</span>
          <span className={`text-sm font-medium ${getRatingColor(ratingStats.overall_rating)}`}>
            {getRatingLabel(ratingStats.overall_rating)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              ratingStats.overall_rating >= 4.5 ? 'bg-green-500' :
              ratingStats.overall_rating >= 3.5 ? 'bg-blue-500' :
              ratingStats.overall_rating >= 2.5 ? 'bg-yellow-500' :
              ratingStats.overall_rating >= 1.5 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${(ratingStats.overall_rating / 5) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{ratingStats.total_projects_completed}</span>
          </div>
          <p className="text-xs text-gray-600">Completed</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-red-600">
            <XCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{ratingStats.total_projects_failed}</span>
          </div>
          <p className="text-xs text-gray-600">Failed</p>
        </div>
      </div>

      {/* Success Rate */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Success Rate</span>
          <span className="text-sm font-medium text-gray-900">{ratingStats.success_rate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${ratingStats.success_rate}%` }}
          ></div>
        </div>
      </div>

      {/* Top Skills */}
      {showDetails && ratingStats.top_skills.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center space-x-2 mb-3">
            <BarChart3 className="h-4 w-4 text-gray-500" />
            <h4 className="text-sm font-medium text-gray-900">Top Skills</h4>
          </div>
          <div className="space-y-2">
            {ratingStats.top_skills.map((skill, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{skill.skill}</span>
                <div className="flex items-center space-x-1">
                  {renderStars(skill.rating)}
                  <span className="text-xs text-gray-500 ml-1">
                    {skill.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Total Skills Count */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total Skills</span>
          <span className="text-sm font-medium text-gray-900">{ratingStats.total_skills}</span>
        </div>
      </div>
    </div>
  );
};

export default RatingDisplay;
