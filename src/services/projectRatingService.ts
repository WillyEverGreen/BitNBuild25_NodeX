import { ProjectRating, RatingStats, RatingFormData } from '../types';
import { getFromStorage, saveToStorage, generateId } from './localStorageService';

// Storage keys
const STORAGE_KEYS = {
  PROJECT_RATINGS: 'gigcampus_project_ratings',
  RATING_STATS: 'gigcampus_rating_stats'
};

// Get all project ratings from localStorage
const getProjectRatings = (): ProjectRating[] => {
  return getFromStorage<ProjectRating>(STORAGE_KEYS.PROJECT_RATINGS);
};

// Save project ratings to localStorage
const saveProjectRatings = (ratings: ProjectRating[]): void => {
  saveToStorage(STORAGE_KEYS.PROJECT_RATINGS, ratings);
};

// Create a new project rating
export const createProjectRating = async (
  projectId: string,
  raterId: string,
  rateeId: string,
  raterType: 'company' | 'student',
  ratingData: RatingFormData
): Promise<ProjectRating> => {
  const ratings = getProjectRatings();
  
  // Check if rating already exists
  const existingRating = ratings.find(r => 
    r.project_id === projectId && 
    r.rater_id === raterId && 
    r.ratee_id === rateeId
  );
  
  if (existingRating) {
    throw new Error('You have already rated this user for this project');
  }
  
  const newRating: ProjectRating = {
    id: generateId(),
    project_id: projectId,
    rater_id: raterId,
    ratee_id: rateeId,
    rater_type: raterType,
    ratee_type: raterType === 'company' ? 'student' : 'company',
    overall_rating: ratingData.overall_rating,
    communication_rating: ratingData.communication_rating,
    quality_rating: ratingData.quality_rating,
    timeliness_rating: ratingData.timeliness_rating,
    professionalism_rating: ratingData.professionalism_rating,
    review_text: ratingData.review_text,
    would_work_again: ratingData.would_work_again,
    is_public: ratingData.is_public,
    created_at: new Date().toISOString()
  };
  
  ratings.push(newRating);
  saveProjectRatings(ratings);
  
  // Update rating stats for the ratee
  await updateRatingStats(rateeId, raterType === 'company' ? 'student' : 'company');
  
  // Update skill stats if rating a student
  if (raterType === 'company') {
    try {
      const { updateSkillStatsOnRating } = await import('./skillRatingService');
      await updateSkillStatsOnRating(rateeId);
      console.log('Skill stats updated based on new rating');
    } catch (error) {
      console.error('Error updating skill stats on rating:', error);
    }
  }
  
  console.log('Project rating created:', newRating);
  return newRating;
};

// Get ratings for a specific user (as ratee)
export const getRatingsForUser = (userId: string): ProjectRating[] => {
  const ratings = getProjectRatings();
  return ratings.filter(r => r.ratee_id === userId);
};

// Get ratings by a specific user (as rater)
export const getRatingsByUser = (userId: string): ProjectRating[] => {
  const ratings = getProjectRatings();
  return ratings.filter(r => r.rater_id === userId);
};

// Get rating for a specific project between two users
export const getProjectRating = (projectId: string, raterId: string, rateeId: string): ProjectRating | null => {
  const ratings = getProjectRatings();
  return ratings.find(r => 
    r.project_id === projectId && 
    r.rater_id === raterId && 
    r.ratee_id === rateeId
  ) || null;
};

// Check if user can rate another user for a project
export const canRateUser = (projectId: string, raterId: string, rateeId: string): boolean => {
  const existingRating = getProjectRating(projectId, raterId, rateeId);
  return !existingRating;
};

// Calculate and update rating stats for a user
export const updateRatingStats = async (userId: string, userType: 'student' | 'company'): Promise<RatingStats> => {
  const ratings = getRatingsForUser(userId);
  
  if (ratings.length === 0) {
    const emptyStats: RatingStats = {
      user_id: userId,
      user_type: userType,
      overall_rating: 0,
      total_ratings: 0,
      communication_avg: 0,
      quality_avg: 0,
      timeliness_avg: 0,
      professionalism_avg: 0,
      would_work_again_percentage: 0,
      recent_ratings: [],
      rating_breakdown: {
        five_star: 0,
        four_star: 0,
        three_star: 0,
        two_star: 0,
        one_star: 0
      }
    };
    
    const allStats = getFromStorage<RatingStats>(STORAGE_KEYS.RATING_STATS);
    const existingIndex = allStats.findIndex(s => s.user_id === userId);
    
    if (existingIndex >= 0) {
      allStats[existingIndex] = emptyStats;
    } else {
      allStats.push(emptyStats);
    }
    
    saveToStorage(STORAGE_KEYS.RATING_STATS, allStats);
    return emptyStats;
  }
  
  // Calculate averages
  const totalRatings = ratings.length;
  const overallAvg = ratings.reduce((sum, r) => sum + r.overall_rating, 0) / totalRatings;
  const communicationAvg = ratings.reduce((sum, r) => sum + r.communication_rating, 0) / totalRatings;
  const qualityAvg = ratings.reduce((sum, r) => sum + r.quality_rating, 0) / totalRatings;
  const timelinessAvg = ratings.reduce((sum, r) => sum + r.timeliness_rating, 0) / totalRatings;
  const professionalismAvg = ratings.reduce((sum, r) => sum + r.professionalism_rating, 0) / totalRatings;
  
  // Calculate would work again percentage
  const wouldWorkAgainCount = ratings.filter(r => r.would_work_again).length;
  const wouldWorkAgainPercentage = (wouldWorkAgainCount / totalRatings) * 100;
  
  // Calculate rating breakdown
  const ratingBreakdown = {
    five_star: ratings.filter(r => r.overall_rating === 5).length,
    four_star: ratings.filter(r => r.overall_rating === 4).length,
    three_star: ratings.filter(r => r.overall_rating === 3).length,
    two_star: ratings.filter(r => r.overall_rating === 2).length,
    one_star: ratings.filter(r => r.overall_rating === 1).length
  };
  
  // Get recent ratings (last 5)
  const recentRatings = ratings
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);
  
  const stats: RatingStats = {
    user_id: userId,
    user_type: userType,
    overall_rating: Math.round(overallAvg * 10) / 10,
    total_ratings: totalRatings,
    communication_avg: Math.round(communicationAvg * 10) / 10,
    quality_avg: Math.round(qualityAvg * 10) / 10,
    timeliness_avg: Math.round(timelinessAvg * 10) / 10,
    professionalism_avg: Math.round(professionalismAvg * 10) / 10,
    would_work_again_percentage: Math.round(wouldWorkAgainPercentage * 10) / 10,
    recent_ratings: recentRatings,
    rating_breakdown: ratingBreakdown
  };
  
  // Save stats
  const allStats = getFromStorage<RatingStats>(STORAGE_KEYS.RATING_STATS);
  const existingIndex = allStats.findIndex(s => s.user_id === userId);
  
  if (existingIndex >= 0) {
    allStats[existingIndex] = stats;
  } else {
    allStats.push(stats);
  }
  
  saveToStorage(STORAGE_KEYS.RATING_STATS, allStats);
  return stats;
};

// Get rating stats for a user
export const getRatingStats = (userId: string): RatingStats | null => {
  const allStats = getFromStorage<RatingStats>(STORAGE_KEYS.RATING_STATS);
  return allStats.find(s => s.user_id === userId) || null;
};

// Get all users who need to be rated for a project
export const getPendingRatings = (projectId: string, userId: string, userType: 'student' | 'company'): any[] => {
  // This would typically fetch from a database
  // For demo purposes, we'll return some sample data
  const projects = getFromStorage<any>('gigcampus_projects');
  const project = projects.find((p: any) => p.id === projectId);
  
  if (!project) return [];
  
  const pendingRatings = [];
  
  if (userType === 'student' && project.company_id && !canRateUser(projectId, userId, project.company_id)) {
    pendingRatings.push({
      projectId,
      projectTitle: project.title,
      userToRateId: project.company_id,
      userToRateName: 'Company Name', // Would fetch from users table
      userToRateType: 'company'
    });
  }
  
  if (userType === 'company' && project.assigned_to && !canRateUser(projectId, userId, project.assigned_to)) {
    pendingRatings.push({
      projectId,
      projectTitle: project.title,
      userToRateId: project.assigned_to,
      userToRateName: 'Student Name', // Would fetch from users table
      userToRateType: 'student'
    });
  }
  
  return pendingRatings;
};

// Create rating opportunities after fund release
export const createRatingOpportunities = async (projectId: string, companyId: string, studentId: string): Promise<void> => {
  try {
    // Get project details
    const projects = getFromStorage<any>('gigcampus_projects');
    const project = projects.find((p: any) => p.id === projectId);
    
    if (!project) {
      console.warn('Project not found for rating opportunities:', projectId);
      return;
    }

    // Get user details
    const users = getFromStorage<any>('gigcampus_users');
    const company = users.find((u: any) => u.id === companyId);
    const student = users.find((u: any) => u.id === studentId);

    if (!company || !student) {
      console.warn('Company or student not found for rating opportunities');
      return;
    }

    // Create notifications for both parties to rate each other
    const notifications = getFromStorage<any>('gigcampus_notifications');
    
    // Notification for company to rate student
    const companyNotification = {
      id: generateId(),
      user_id: companyId,
      type: 'rating_request',
      title: '⭐ Rate Your Student',
      message: `Please rate ${student.name} for their work on "${project.title}". Your feedback helps build trust in our community.`,
      read: false,
      action_url: `/rate-user?projectId=${projectId}&userId=${studentId}&userType=student`,
      metadata: {
        projectId,
        userToRateId: studentId,
        userToRateType: 'student',
        projectTitle: project.title
      },
      created_at: new Date().toISOString()
    };

    // Notification for student to rate company
    const studentNotification = {
      id: generateId(),
      user_id: studentId,
      type: 'rating_request',
      title: '⭐ Rate Your Experience',
      message: `Please rate your experience working with ${company.name} on "${project.title}". Your feedback is valuable!`,
      read: false,
      action_url: `/rate-user?projectId=${projectId}&userId=${companyId}&userType=company`,
      metadata: {
        projectId,
        userToRateId: companyId,
        userToRateType: 'company',
        projectTitle: project.title
      },
      created_at: new Date().toISOString()
    };

    notifications.push(companyNotification, studentNotification);
    saveToStorage('gigcampus_notifications', notifications);

    console.log('Rating opportunities created for project:', projectId);
  } catch (error) {
    console.error('Error creating rating opportunities:', error);
  }
};

// Delete a rating (admin function)
export const deleteRating = (ratingId: string): boolean => {
  const ratings = getProjectRatings();
  const initialLength = ratings.length;
  const filteredRatings = ratings.filter(r => r.id !== ratingId);
  
  if (filteredRatings.length < initialLength) {
    saveProjectRatings(filteredRatings);
    return true;
  }
  
  return false;
};

// Get top rated users
export const getTopRatedUsers = (userType: 'student' | 'company', limit: number = 10): RatingStats[] => {
  const allStats = getFromStorage<RatingStats>(STORAGE_KEYS.RATING_STATS);
  return allStats
    .filter(s => s.user_type === userType && s.total_ratings > 0)
    .sort((a, b) => {
      // Sort by overall rating, then by number of ratings
      if (b.overall_rating !== a.overall_rating) {
        return b.overall_rating - a.overall_rating;
      }
      return b.total_ratings - a.total_ratings;
    })
    .slice(0, limit);
};

// Initialize sample ratings for testing
export const initializeSampleRatings = (): void => {
  const existingRatings = getProjectRatings();
  if (existingRatings.length > 0) {
    return; // Already initialized
  }
  
  const sampleRatings: ProjectRating[] = [
    {
      id: generateId(),
      project_id: 'project1',
      rater_id: 'company1',
      ratee_id: 'student1',
      rater_type: 'company',
      ratee_type: 'student',
      overall_rating: 5,
      communication_rating: 5,
      quality_rating: 5,
      timeliness_rating: 4,
      professionalism_rating: 5,
      review_text: 'Excellent work! Alice delivered high-quality code on time and was very professional throughout the project.',
      would_work_again: true,
      is_public: true,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: generateId(),
      project_id: 'project1',
      rater_id: 'student1',
      ratee_id: 'company1',
      rater_type: 'student',
      ratee_type: 'company',
      overall_rating: 4,
      communication_rating: 4,
      quality_rating: 4,
      timeliness_rating: 5,
      professionalism_rating: 4,
      review_text: 'Great company to work with. Clear requirements and prompt payments. Would definitely work with them again.',
      would_work_again: true,
      is_public: true,
      created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: generateId(),
      project_id: 'project2',
      rater_id: 'company1',
      ratee_id: 'student2',
      rater_type: 'company',
      ratee_type: 'student',
      overall_rating: 4,
      communication_rating: 4,
      quality_rating: 4,
      timeliness_rating: 3,
      professionalism_rating: 4,
      review_text: 'Good work overall. Bob delivered quality results but was a bit behind schedule. Still recommended.',
      would_work_again: true,
      is_public: true,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  
  saveProjectRatings(sampleRatings);
  
  // Update stats for all rated users
  updateRatingStats('student1', 'student');
  updateRatingStats('student2', 'student');
  updateRatingStats('company1', 'company');
  
  console.log('Sample project ratings initialized');
  console.log('✅ Rating System Ready:');
  console.log('- Sample ratings created for testing');
  console.log('- Companies can rate students after releasing funds');
  console.log('- Students can rate companies after receiving payments');
  console.log('- Rating stats automatically calculated');
  console.log('- Pending ratings shown in dashboards');
};

// Export for use in other services
export {
  getProjectRatings,
  saveProjectRatings
};
