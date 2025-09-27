import { Student } from '../types';

export interface SkillRating {
  skill: string;
  rating: number;
  projects_completed: number;
  projects_failed: number;
  last_updated: string;
}

export interface RatingHistory {
  id: string;
  user_id: string;
  change: number;
  reason: 'project_completed' | 'project_failed' | 'skill_improvement' | 'resume_upload';
  description: string;
  timestamp: string;
}

export interface UserRatingData {
  overall_rating: number;
  skills: SkillRating[];
  rating_history: RatingHistory[];
  total_projects_completed: number;
  total_projects_failed: number;
  last_updated: string;
}

// Storage keys for rating data
const RATING_STORAGE_KEY = 'gigcampus_rating_data';

// Get rating data from localStorage
export const getRatingData = (userId: string): UserRatingData | null => {
  try {
    const data = localStorage.getItem(`${RATING_STORAGE_KEY}_${userId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading rating data from localStorage:', error);
    return null;
  }
};

// Save rating data to localStorage
export const saveRatingData = (userId: string, data: UserRatingData): void => {
  try {
    localStorage.setItem(`${RATING_STORAGE_KEY}_${userId}`, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving rating data to localStorage:', error);
  }
};

// Initialize rating data for a new user
export const initializeRatingData = (userId: string): UserRatingData => {
  const initialData: UserRatingData = {
    overall_rating: 0,
    skills: [],
    rating_history: [],
    total_projects_completed: 0,
    total_projects_failed: 0,
    last_updated: new Date().toISOString(),
  };
  
  saveRatingData(userId, initialData);
  return initialData;
};

// Extract skills from resume analysis and update rating data
export const updateSkillsFromResume = (userId: string, skills: string[]): UserRatingData => {
  let ratingData = getRatingData(userId);
  
  if (!ratingData) {
    ratingData = initializeRatingData(userId);
  }

  // Add new skills or update existing ones
  skills.forEach(skill => {
    const existingSkill = ratingData.skills.find(s => s.skill.toLowerCase() === skill.toLowerCase());
    
    if (existingSkill) {
      // Skill already exists, no change needed
      return;
    }
    
    // Add new skill with initial rating
    ratingData.skills.push({
      skill,
      rating: 0,
      projects_completed: 0,
      projects_failed: 0,
      last_updated: new Date().toISOString(),
    });
  });

  // Update overall rating based on skills
  ratingData.overall_rating = calculateOverallRating(ratingData.skills);
  ratingData.last_updated = new Date().toISOString();

  // Add to rating history
  ratingData.rating_history.push({
    id: generateId(),
    user_id: userId,
    change: 0,
    reason: 'resume_upload',
    description: `Skills extracted from resume: ${skills.join(', ')}`,
    timestamp: new Date().toISOString(),
  });

  saveRatingData(userId, ratingData);
  return ratingData;
};

// Update rating when project is completed successfully
export const updateRatingOnProjectSuccess = (userId: string, projectSkills: string[]): UserRatingData => {
  let ratingData = getRatingData(userId);
  
  if (!ratingData) {
    ratingData = initializeRatingData(userId);
  }

  let totalRatingIncrease = 0;

  // Update skills based on project completion
  projectSkills.forEach(skill => {
    const skillIndex = ratingData.skills.findIndex(s => s.skill.toLowerCase() === skill.toLowerCase());
    
    if (skillIndex !== -1) {
      // Skill exists, increase rating
      const ratingIncrease = Math.min(0.5, 5 - ratingData.skills[skillIndex].rating); // Cap at 5.0
      ratingData.skills[skillIndex].rating += ratingIncrease;
      ratingData.skills[skillIndex].projects_completed += 1;
      ratingData.skills[skillIndex].last_updated = new Date().toISOString();
      totalRatingIncrease += ratingIncrease;
    } else {
      // New skill from project
      ratingData.skills.push({
        skill,
        rating: 1.0, // Start with 1.0 for new skills
        projects_completed: 1,
        projects_failed: 0,
        last_updated: new Date().toISOString(),
      });
      totalRatingIncrease += 1.0;
    }
  });

  // Update overall stats
  ratingData.total_projects_completed += 1;
  ratingData.overall_rating = calculateOverallRating(ratingData.skills);
  ratingData.last_updated = new Date().toISOString();

  // Add to rating history
  ratingData.rating_history.push({
    id: generateId(),
    user_id: userId,
    change: totalRatingIncrease,
    reason: 'project_completed',
    description: `Project completed successfully. Skills: ${projectSkills.join(', ')}`,
    timestamp: new Date().toISOString(),
  });

  saveRatingData(userId, ratingData);
  return ratingData;
};

// Update rating when project fails
export const updateRatingOnProjectFailure = (userId: string, projectSkills: string[]): UserRatingData => {
  let ratingData = getRatingData(userId);
  
  if (!ratingData) {
    ratingData = initializeRatingData(userId);
  }

  let totalRatingDecrease = 0;

  // Update skills based on project failure
  projectSkills.forEach(skill => {
    const skillIndex = ratingData.skills.findIndex(s => s.skill.toLowerCase() === skill.toLowerCase());
    
    if (skillIndex !== -1) {
      // Skill exists, decrease rating
      const ratingDecrease = Math.min(0.3, ratingData.skills[skillIndex].rating); // Don't go below 0
      ratingData.skills[skillIndex].rating -= ratingDecrease;
      ratingData.skills[skillIndex].projects_failed += 1;
      ratingData.skills[skillIndex].last_updated = new Date().toISOString();
      totalRatingDecrease += ratingDecrease;
    }
  });

  // Update overall stats
  ratingData.total_projects_failed += 1;
  ratingData.overall_rating = calculateOverallRating(ratingData.skills);
  ratingData.last_updated = new Date().toISOString();

  // Add to rating history
  ratingData.rating_history.push({
    id: generateId(),
    user_id: userId,
    change: -totalRatingDecrease,
    reason: 'project_failed',
    description: `Project failed. Skills: ${projectSkills.join(', ')}`,
    timestamp: new Date().toISOString(),
  });

  saveRatingData(userId, ratingData);
  return ratingData;
};

// Update rating when project is cancelled
export const updateRatingOnProjectCancellation = (userId: string, projectSkills: string[]): UserRatingData => {
  let ratingData = getRatingData(userId);
  
  if (!ratingData) {
    ratingData = initializeRatingData(userId);
  }

  let totalRatingDecrease = 0;

  // Update skills based on project cancellation
  projectSkills.forEach(skill => {
    const skillIndex = ratingData.skills.findIndex(s => s.skill.toLowerCase() === skill.toLowerCase());
    
    if (skillIndex !== -1) {
      // Skill exists, decrease rating slightly for cancellation
      const ratingDecrease = Math.min(0.2, ratingData.skills[skillIndex].rating); // Smaller decrease for cancellation
      ratingData.skills[skillIndex].rating -= ratingDecrease;
      ratingData.skills[skillIndex].projects_failed += 1;
      ratingData.skills[skillIndex].last_updated = new Date().toISOString();
      totalRatingDecrease += ratingDecrease;
    }
  });

  // Update overall stats
  ratingData.total_projects_failed += 1;
  ratingData.overall_rating = calculateOverallRating(ratingData.skills);
  ratingData.last_updated = new Date().toISOString();

  // Add to rating history
  ratingData.rating_history.push({
    id: generateId(),
    user_id: userId,
    change: -totalRatingDecrease,
    reason: 'project_failed',
    description: `Project cancelled. Skills: ${projectSkills.join(', ')}`,
    timestamp: new Date().toISOString(),
  });

  saveRatingData(userId, ratingData);
  return ratingData;
};

// Calculate overall rating from skills
const calculateOverallRating = (skills: SkillRating[]): number => {
  if (skills.length === 0) return 0;
  
  const totalRating = skills.reduce((sum, skill) => sum + skill.rating, 0);
  return Math.round((totalRating / skills.length) * 10) / 10; // Round to 1 decimal place
};

// Get top skills by rating
export const getTopSkills = (userId: string, limit: number = 5): SkillRating[] => {
  const ratingData = getRatingData(userId);
  
  if (!ratingData) return [];
  
  return ratingData.skills
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};

// Get rating statistics
export const getRatingStats = (userId: string) => {
  const ratingData = getRatingData(userId);
  
  if (!ratingData) {
    return {
      overall_rating: 0,
      total_skills: 0,
      total_projects_completed: 0,
      total_projects_failed: 0,
      success_rate: 0,
      top_skills: [],
    };
  }

  const totalProjects = ratingData.total_projects_completed + ratingData.total_projects_failed;
  const successRate = totalProjects > 0 ? (ratingData.total_projects_completed / totalProjects) * 100 : 0;

  return {
    overall_rating: ratingData.overall_rating,
    total_skills: ratingData.skills.length,
    total_projects_completed: ratingData.total_projects_completed,
    total_projects_failed: ratingData.total_projects_failed,
    success_rate: Math.round(successRate * 10) / 10,
    top_skills: getTopSkills(userId, 3),
  };
};

// Delete all rating data for a user
export const deleteRatingData = (userId: string): void => {
  try {
    localStorage.removeItem(`${RATING_STORAGE_KEY}_${userId}`);
    console.log('Rating data deleted for user:', userId);
  } catch (error) {
    console.error('Error deleting rating data:', error);
  }
};

// Delete only rating history (keep skills and stats)
export const deleteRatingHistory = (userId: string): UserRatingData | null => {
  let ratingData = getRatingData(userId);
  
  if (!ratingData) {
    return null;
  }

  // Clear rating history but keep skills and stats
  ratingData.rating_history = [];
  ratingData.last_updated = new Date().toISOString();

  saveRatingData(userId, ratingData);
  return ratingData;
};

// Generate unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
