import React, { useState } from 'react';
import { Star, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { RatingFormData } from '../../types';

interface ProjectRatingFormProps {
  rateeType: 'student' | 'company';
  rateeName: string;
  projectTitle: string;
  onSubmit: (ratingData: RatingFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const ProjectRatingForm: React.FC<ProjectRatingFormProps> = ({
  rateeType,
  rateeName,
  projectTitle,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState<RatingFormData>({
    overall_rating: 0,
    communication_rating: 0,
    quality_rating: 0,
    timeliness_rating: 0,
    professionalism_rating: 0,
    review_text: '',
    would_work_again: false,
    is_public: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const ratingCategories = [
    {
      key: 'overall_rating' as keyof RatingFormData,
      label: 'Overall Rating',
      description: 'Your overall experience working together'
    },
    {
      key: 'communication_rating' as keyof RatingFormData,
      label: 'Communication',
      description: rateeType === 'student' 
        ? 'How well did they communicate throughout the project?'
        : 'How clear and responsive were they with project requirements?'
    },
    {
      key: 'quality_rating' as keyof RatingFormData,
      label: 'Quality of Work',
      description: rateeType === 'student'
        ? 'Quality of deliverables and attention to detail'
        : 'Quality of project requirements and feedback'
    },
    {
      key: 'timeliness_rating' as keyof RatingFormData,
      label: 'Timeliness',
      description: rateeType === 'student'
        ? 'Did they meet deadlines and deliver on time?'
        : 'Were payments and responses made in a timely manner?'
    },
    {
      key: 'professionalism_rating' as keyof RatingFormData,
      label: 'Professionalism',
      description: 'Overall professional conduct and work ethic'
    }
  ];

  const handleRatingChange = (category: keyof RatingFormData, rating: number) => {
    setFormData(prev => ({ ...prev, [category]: rating }));
    if (errors[category]) {
      setErrors(prev => ({ ...prev, [category]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    ratingCategories.forEach(category => {
      if (formData[category.key] === 0) {
        newErrors[category.key] = 'Please provide a rating';
      }
    });
    
    if (formData.review_text.trim().length < 10) {
      newErrors.review_text = 'Please provide at least 10 characters in your review';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const renderStarRating = (category: keyof RatingFormData, currentRating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(category, star)}
            className={`p-1 rounded transition-colors ${
              star <= currentRating
                ? 'text-yellow-400 hover:text-yellow-500'
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          >
            <Star
              className="h-6 w-6"
              fill={star <= currentRating ? 'currentColor' : 'none'}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {currentRating > 0 ? `${currentRating}/5` : 'Not rated'}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">
          Rate Your Experience
        </h2>
        <p className="text-gray-600 mt-2">
          How was working with <span className="font-semibold">{rateeName}</span> on "{projectTitle}"?
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Rating Categories */}
        {ratingCategories.map((category) => (
          <div key={category.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">
                  {category.label}
                </label>
                <p className="text-xs text-gray-500">{category.description}</p>
              </div>
              {renderStarRating(category.key, formData[category.key] as number)}
            </div>
            {errors[category.key] && (
              <p className="text-red-500 text-xs">{errors[category.key]}</p>
            )}
          </div>
        ))}

        {/* Review Text */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">
            Written Review
          </label>
          <textarea
            value={formData.review_text}
            onChange={(e) => setFormData(prev => ({ ...prev, review_text: e.target.value }))}
            placeholder={`Share your experience working with ${rateeName}...`}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Minimum 10 characters ({formData.review_text.length}/10)
            </p>
            {errors.review_text && (
              <p className="text-red-500 text-xs">{errors.review_text}</p>
            )}
          </div>
        </div>

        {/* Would Work Again */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-900">
            Would you work with {rateeName} again?
          </label>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, would_work_again: true }))}
              className={`flex items-center px-4 py-2 rounded-lg border-2 transition-colors ${
                formData.would_work_again
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 text-gray-600 hover:border-green-300'
              }`}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Yes, definitely
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, would_work_again: false }))}
              className={`flex items-center px-4 py-2 rounded-lg border-2 transition-colors ${
                !formData.would_work_again
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-300 text-gray-600 hover:border-red-300'
              }`}
            >
              <XCircle className="h-4 w-4 mr-2" />
              No, probably not
            </button>
          </div>
        </div>

        {/* Public Rating */}
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_public"
              checked={formData.is_public}
              onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_public" className="ml-2 text-sm text-gray-900">
              Make this rating public
            </label>
          </div>
          <p className="text-xs text-gray-500">
            Public ratings help other users make informed decisions
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4 mr-2" />
                Submit Rating
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectRatingForm;
