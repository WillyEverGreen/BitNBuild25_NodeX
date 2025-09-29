import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, Award, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import { StudentSkillStats, SkillRating } from '../../types';
import { getStudentSkillStats, initializeSampleSkillStats } from '../../services/skillRatingService';

interface SkillRatingDisplayProps {
  studentId: string;
  showTitle?: boolean;
}

const SkillRatingDisplay: React.FC<SkillRatingDisplayProps> = ({ 
  studentId, 
  showTitle = true 
}) => {
  const [skillStats, setSkillStats] = useState<StudentSkillStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSkillStats();
  }, [studentId]);

  const loadSkillStats = async () => {
    try {
      setLoading(true);
      
      // Initialize sample data if needed
      initializeSampleSkillStats();
      
      // Get skill stats for the student
      const stats = getStudentSkillStats(studentId);
      setSkillStats(stats);
    } catch (error) {
      console.error('Error loading skill stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'sm') => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };

    return (
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= Math.floor(rating)
                ? 'text-yellow-400 fill-current'
                : star <= rating
                ? 'text-yellow-400 fill-current opacity-50'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'Expert': return 'text-purple-600 bg-purple-100';
      case 'Advanced': return 'text-blue-600 bg-blue-100';
      case 'Intermediate': return 'text-green-600 bg-green-100';
      case 'Novice': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!skillStats) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {showTitle && (
          <div className="flex items-center mb-4">
            <Award className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Skill Rating</h3>
          </div>
        )}
        <div className="text-center py-8 text-gray-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No skill data available</p>
          <p className="text-sm">Complete projects to build your skill profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {showTitle && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Award className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Skill Rating</h3>
          </div>
          <div className="flex items-center space-x-2">
            {renderStars(skillStats.overall_skill_rating, 'md')}
            <span className="text-2xl font-bold text-red-500">
              {skillStats.overall_skill_rating.toFixed(1)}
            </span>
          </div>
        </div>
      )}

      {/* Skill Level */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Skill Level</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(skillStats.skill_level)}`}>
            {skillStats.skill_level}
          </span>
        </div>
        
        {/* Progress bar based on overall rating */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(skillStats.overall_skill_rating / 5) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Project Statistics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <div>
            <span className="text-lg font-semibold text-green-600">
              {skillStats.total_projects_completed}
            </span>
            <p className="text-xs text-gray-600">Completed</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <XCircle className="h-4 w-4 text-red-600" />
          <div>
            <span className="text-lg font-semibold text-red-600">
              {skillStats.total_projects_failed}
            </span>
            <p className="text-xs text-gray-600">Failed</p>
          </div>
        </div>
      </div>

      {/* Success Rate */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Success Rate</span>
          <span className={`text-lg font-bold ${getSuccessRateColor(skillStats.success_rate)}`}>
            {skillStats.success_rate.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Top Skills */}
      <div>
        <div className="flex items-center mb-3">
          <TrendingUp className="h-4 w-4 text-gray-600 mr-2" />
          <h4 className="text-sm font-semibold text-gray-900">Top Skills</h4>
        </div>
        
        {skillStats.skill_ratings.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No skills tracked yet</p>
        ) : (
          <div className="space-y-3">
            {skillStats.skill_ratings
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 5)
              .map((skill) => (
                <div key={skill.skill_name} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {skill.skill_name}
                      </span>
                      <div className="flex items-center space-x-2">
                        {renderStars(skill.rating, 'sm')}
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <span>{skill.projects_completed}/{skill.total_projects} projects</span>
                      <span className="mx-2">•</span>
                      <span className={getSuccessRateColor(skill.success_rate)}>
                        {skill.success_rate.toFixed(0)}% success
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total Skills</span>
            <span className="font-semibold text-gray-900">{skillStats.total_skills}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillRatingDisplay;
