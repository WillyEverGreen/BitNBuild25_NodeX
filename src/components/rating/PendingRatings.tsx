import React, { useState, useEffect } from 'react';
import { Star, Clock, User, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserById } from '../../services/supabaseService';
import { canRateUser, createProjectRating, initializeSampleRatings } from '../../services/projectRatingService';
import ProjectRatingForm from './ProjectRatingForm';
import { RatingFormData } from '../../types';

interface PendingRating {
  projectId: string;
  projectTitle: string;
  rateeId: string;
  rateeName: string;
  rateeType: 'student' | 'company';
  completedDate: string;
}

const PendingRatings: React.FC = () => {
  const { user } = useAuth();
  const [pendingRatings, setPendingRatings] = useState<PendingRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState<PendingRating | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadPendingRatings();
      // Initialize sample ratings for demo
      initializeSampleRatings();
    }
  }, [user]);

  const loadPendingRatings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // For demo purposes, we'll create some mock pending ratings
      // In a real app, this would fetch completed projects where ratings are pending
      
      const mockPendingRatings: PendingRating[] = [];
      
      if (user.type === 'company') {
        // Company can rate students from completed projects
        try {
          const student1 = await getUserById('student1');
          const student2 = await getUserById('student2');
          
          if (student1 && canRateUser('project3', user.id, 'student1')) {
            mockPendingRatings.push({
              projectId: 'project3',
              projectTitle: 'Mobile App Development',
              rateeId: 'student1',
              rateeName: student1.name,
              rateeType: 'student',
              completedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            });
          }
          
          if (student2 && canRateUser('project4', user.id, 'student2')) {
            mockPendingRatings.push({
              projectId: 'project4',
              projectTitle: 'Data Analysis Dashboard',
              rateeId: 'student2',
              rateeName: student2.name,
              rateeType: 'student',
              completedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            });
          }
        } catch (error) {
          console.error('Error loading students for pending ratings:', error);
        }
      } else if (user.type === 'student') {
        // Student can rate companies from completed projects
        try {
          const company1 = await getUserById('company1');
          
          if (company1 && canRateUser('project5', user.id, 'company1')) {
            mockPendingRatings.push({
              projectId: 'project5',
              projectTitle: 'E-commerce Website',
              rateeId: 'company1',
              rateeName: company1.name,
              rateeType: 'company',
              completedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            });
          }
        } catch (error) {
          console.error('Error loading companies for pending ratings:', error);
        }
      }
      
      setPendingRatings(mockPendingRatings);
    } catch (error) {
      console.error('Error loading pending ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async (ratingData: RatingFormData) => {
    if (!selectedRating || !user) return;

    try {
      setIsSubmitting(true);
      
      await createProjectRating(
        selectedRating.projectId,
        user.id,
        selectedRating.rateeId,
        user.type,
        ratingData
      );

      // Remove from pending ratings
      setPendingRatings(prev => 
        prev.filter(r => 
          !(r.projectId === selectedRating.projectId && r.rateeId === selectedRating.rateeId)
        )
      );

      setSelectedRating(null);
      
      // Show success message
      alert(`✅ Rating submitted successfully!\n\nThank you for rating ${selectedRating.rateeName}. Your feedback helps build trust in our community.`);
      
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Error submitting rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDaysAgo = (dateString: string) => {
    const days = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
    return days === 0 ? 'Today' : days === 1 ? '1 day ago' : `${days} days ago`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedRating) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <ProjectRatingForm
            rateeType={selectedRating.rateeType}
            rateeName={selectedRating.rateeName}
            projectTitle={selectedRating.projectTitle}
            onSubmit={handleSubmitRating}
            onCancel={() => setSelectedRating(null)}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Pending Ratings
            </h3>
          </div>
          {pendingRatings.length > 0 && (
            <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {pendingRatings.length} pending
            </span>
          )}
        </div>
        <p className="text-gray-600 text-sm mt-1">
          Rate your recent collaborators to help build trust in our community
        </p>
      </div>

      <div className="p-6">
        {pendingRatings.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Star className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h4>
            <p className="text-gray-600">
              You don't have any pending ratings at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRatings.map((rating) => (
              <div
                key={`${rating.projectId}-${rating.rateeId}`}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        Rate {rating.rateeName}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Project: {rating.projectTitle}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span>Completed {getDaysAgo(rating.completedDate)}</span>
                        <span>•</span>
                        <span className="capitalize">{rating.rateeType}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedRating(rating)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Rate Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingRatings;
