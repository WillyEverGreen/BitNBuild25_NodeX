import React, { useState } from 'react';
import { Star, TrendingUp, TrendingDown, Award, Target } from 'lucide-react';
import { 
  updateSkillsFromResume, 
  updateRatingOnProjectSuccess, 
  updateRatingOnProjectFailure,
  getRatingStats 
} from '../../services/ratingService';

interface RatingDemoProps {
  userId: string;
  className?: string;
}

const RatingDemo: React.FC<RatingDemoProps> = ({ userId, className = '' }) => {
  const [demoStep, setDemoStep] = useState(0);
  const [ratingStats, setRatingStats] = useState({
    overall_rating: 0,
    total_skills: 0,
    total_projects_completed: 0,
    total_projects_failed: 0,
    success_rate: 0,
    top_skills: [],
  });

  const demoSteps = [
    {
      title: "Upload Resume",
      description: "Extract skills from your resume",
      action: () => {
        updateSkillsFromResume(userId, ['JavaScript', 'React', 'Node.js', 'Python', 'SQL']);
        updateStats();
        setDemoStep(1);
      },
      icon: <Award className="h-5 w-5" />,
      color: "bg-blue-500"
    },
    {
      title: "Complete Project",
      description: "Successfully finish a project",
      action: () => {
        updateRatingOnProjectSuccess(userId, ['JavaScript', 'React']);
        updateStats();
        setDemoStep(2);
      },
      icon: <TrendingUp className="h-5 w-5" />,
      color: "bg-green-500"
    },
    {
      title: "Complete Another Project",
      description: "Build more experience",
      action: () => {
        updateRatingOnProjectSuccess(userId, ['Node.js', 'Python']);
        updateStats();
        setDemoStep(3);
      },
      icon: <TrendingUp className="h-5 w-5" />,
      color: "bg-green-500"
    },
    {
      title: "Project Failure",
      description: "Learn from mistakes",
      action: () => {
        updateRatingOnProjectFailure(userId, ['JavaScript']);
        updateStats();
        setDemoStep(4);
      },
      icon: <TrendingDown className="h-5 w-5" />,
      color: "bg-red-500"
    }
  ];

  const updateStats = () => {
    const stats = getRatingStats(userId);
    setRatingStats(stats);
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

  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return 'Expert';
    if (rating >= 3.5) return 'Advanced';
    if (rating >= 2.5) return 'Intermediate';
    if (rating >= 1.5) return 'Beginner';
    return 'Novice';
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <Target className="h-5 w-5 text-purple-500" />
        <h3 className="text-lg font-semibold text-gray-900">Rating System Demo</h3>
      </div>

      {/* Current Rating Display */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Current Rating</span>
          <div className="flex items-center space-x-1">
            {renderStars(ratingStats.overall_rating)}
            <span className="text-lg font-bold text-gray-900 ml-2">
              {ratingStats.overall_rating.toFixed(1)}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Level</span>
          <span className="text-sm font-medium text-gray-900">
            {getRatingLabel(ratingStats.overall_rating)}
          </span>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Projects: {ratingStats.total_projects_completed} completed, {ratingStats.total_projects_failed} failed
        </div>
      </div>

      {/* Demo Steps */}
      <div className="space-y-3">
        {demoSteps.map((step, index) => (
          <div
            key={index}
            className={`flex items-center space-x-3 p-3 rounded-lg border ${
              index <= demoStep 
                ? 'bg-green-50 border-green-200' 
                : index === demoStep + 1
                ? 'bg-blue-50 border-blue-200 cursor-pointer hover:bg-blue-100'
                : 'bg-gray-50 border-gray-200'
            }`}
            onClick={index === demoStep + 1 ? step.action : undefined}
          >
            <div className={`p-2 rounded-full ${step.color} text-white`}>
              {step.icon}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">{step.title}</h4>
              <p className="text-xs text-gray-600">{step.description}</p>
            </div>
            {index < demoStep && (
              <div className="text-green-600">
                <Star className="h-4 w-4" fill="currentColor" />
              </div>
            )}
            {index === demoStep + 1 && (
              <div className="text-blue-600 text-sm font-medium">
                Click to try
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        💡 Your rating increases with successful projects and decreases with failures. 
        Upload your resume to get started!
      </div>
    </div>
  );
};

export default RatingDemo;
