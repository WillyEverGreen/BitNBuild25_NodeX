import React from 'react';
import { Star, ThumbsUp, ThumbsDown, Calendar, User } from 'lucide-react';
import { ProjectRating, RatingStats } from '../../types';

interface ProjectRatingDisplayProps {
  ratings: ProjectRating[];
  stats: RatingStats | null;
  userType: 'student' | 'company';
  userName: string;
  showReviews?: boolean;
  maxReviews?: number;
}

const ProjectRatingDisplay: React.FC<ProjectRatingDisplayProps> = ({
  ratings,
  stats,
  userName,
  showReviews = true,
  maxReviews = 5
}) => {
  if (!stats || stats.total_ratings === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Star className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Ratings Yet</h3>
          <p className="text-gray-600">
            {userName} hasn't received any ratings yet.
          </p>
        </div>
      </div>
    );
  }

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const starSize = size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill={star <= Math.floor(rating) ? 'currentColor' : 'none'}
          />
        ))}
        <span className={`ml-2 ${size === 'lg' ? 'text-lg' : 'text-sm'} font-medium text-gray-700`}>
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const renderRatingBar = (count: number, total: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="flex items-center space-x-2">
        <div className="w-24 bg-gray-200 rounded-full h-2">
          <div
            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="text-sm text-gray-600 w-8">{count}</span>
      </div>
    );
  };

  const displayedRatings = showReviews ? ratings.slice(0, maxReviews) : [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Rating Summary */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {userName}'s Ratings
            </h3>
            <div className="flex items-center space-x-4">
              {renderStars(stats.overall_rating, 'lg')}
              <span className="text-gray-600">
                ({stats.total_ratings} {stats.total_ratings === 1 ? 'rating' : 'ratings'})
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center text-green-600 mb-1">
              <ThumbsUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">
                {stats.would_work_again_percentage.toFixed(0)}% would work again
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Based on {stats.total_ratings} {stats.total_ratings === 1 ? 'review' : 'reviews'}
            </p>
          </div>
        </div>

        {/* Rating Breakdown */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Rating Distribution</h4>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 w-6">{star}</span>
                  <Star className="h-3 w-3 text-yellow-400" fill="currentColor" />
                  {renderRatingBar(
                    stats.rating_breakdown[`${star === 5 ? 'five' : star === 4 ? 'four' : star === 3 ? 'three' : star === 2 ? 'two' : 'one'}_star` as keyof typeof stats.rating_breakdown],
                    stats.total_ratings
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Category Averages</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Communication</span>
                {renderStars(stats.communication_avg)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Quality</span>
                {renderStars(stats.quality_avg)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Timeliness</span>
                {renderStars(stats.timeliness_avg)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Professionalism</span>
                {renderStars(stats.professionalism_avg)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reviews */}
      {showReviews && displayedRatings.length > 0 && (
        <div className="p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Reviews</h4>
          <div className="space-y-4">
            {displayedRatings.map((rating) => (
              <div key={rating.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {rating.rater_type === 'company' ? 'Company' : 'Student'} Review
                      </p>
                      <div className="flex items-center space-x-2">
                        {renderStars(rating.overall_rating)}
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {new Date(rating.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {rating.would_work_again ? (
                      <div className="flex items-center text-green-600">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        <span className="text-xs">Would work again</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        <span className="text-xs">Would not work again</span>
                      </div>
                    )}
                  </div>
                </div>

                {rating.review_text && (
                  <p className="text-gray-700 text-sm mb-3">"{rating.review_text}"</p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Communication:</span>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-400 mr-1" fill="currentColor" />
                      <span>{rating.communication_rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Quality:</span>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-400 mr-1" fill="currentColor" />
                      <span>{rating.quality_rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Timeliness:</span>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-400 mr-1" fill="currentColor" />
                      <span>{rating.timeliness_rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Professional:</span>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-400 mr-1" fill="currentColor" />
                      <span>{rating.professionalism_rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {ratings.length > maxReviews && (
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Showing {maxReviews} of {ratings.length} reviews
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectRatingDisplay;
