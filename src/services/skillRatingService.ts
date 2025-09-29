import { SkillRating, StudentSkillStats, Project } from '../types';
import { getFromStorage, saveToStorage, generateId } from './localStorageService';
import { getRatingsForUser } from './projectRatingService';

// Storage keys
const STORAGE_KEYS = {
  SKILL_STATS: 'gigcampus_skill_stats'
};

// Get skill stats for a student
export const getStudentSkillStats = (studentId: string): StudentSkillStats | null => {
  const allStats = getFromStorage<StudentSkillStats>(STORAGE_KEYS.SKILL_STATS);
  return allStats.find(stats => stats.student_id === studentId) || null;
};

// Calculate skill level based on overall rating and project count
const calculateSkillLevel = (overallRating: number, totalProjects: number): 'Novice' | 'Intermediate' | 'Advanced' | 'Expert' => {
  if (totalProjects === 0 || overallRating < 2) return 'Novice';
  if (totalProjects < 5 || overallRating < 3) return 'Intermediate';
  if (totalProjects < 15 || overallRating < 4) return 'Advanced';
  return 'Expert';
};

// Update skill stats based on project completion
export const updateSkillStatsOnProjectCompletion = async (
  studentId: string, 
  projectId: string, 
  isSuccessful: boolean = true
): Promise<StudentSkillStats> => {
  try {
    // Get project details to extract skills
    const projects = getFromStorage<Project>('gigcampus_projects');
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      console.warn('Project not found for skill update:', projectId);
      return getStudentSkillStats(studentId) || createEmptySkillStats(studentId);
    }

    // Get current skill stats or create new ones
    let skillStats = getStudentSkillStats(studentId) || createEmptySkillStats(studentId);
    
    // Update overall project counts
    if (isSuccessful) {
      skillStats.total_projects_completed += 1;
    } else {
      skillStats.total_projects_failed += 1;
    }

    // Calculate success rate
    const totalProjects = skillStats.total_projects_completed + skillStats.total_projects_failed;
    skillStats.success_rate = totalProjects > 0 ? (skillStats.total_projects_completed / totalProjects) * 100 : 0;

    // Update individual skill ratings based on project skills
    if (project.skills && project.skills.length > 0) {
      project.skills.forEach(skillName => {
        updateIndividualSkillRating(skillStats, skillName, isSuccessful);
      });
    }

    // Get project ratings to calculate overall skill rating
    const projectRatings = getRatingsForUser(studentId);
    if (projectRatings.length > 0) {
      // Calculate weighted average based on quality and overall ratings
      const qualityAvg = projectRatings.reduce((sum, r) => sum + r.quality_rating, 0) / projectRatings.length;
      const overallAvg = projectRatings.reduce((sum, r) => sum + r.overall_rating, 0) / projectRatings.length;
      skillStats.overall_skill_rating = Math.round(((qualityAvg + overallAvg) / 2) * 10) / 10;
    } else {
      // Base rating on success rate if no ratings yet
      skillStats.overall_skill_rating = Math.min(5, (skillStats.success_rate / 100) * 5);
    }

    // Update skill level
    skillStats.skill_level = calculateSkillLevel(skillStats.overall_skill_rating, skillStats.total_projects_completed);
    
    // Update total skills count
    skillStats.total_skills = skillStats.skill_ratings.length;
    skillStats.last_updated = new Date().toISOString();

    // Save updated stats
    saveSkillStats(skillStats);
    
    console.log('Skill stats updated for student:', studentId, skillStats);
    return skillStats;
    
  } catch (error) {
    console.error('Error updating skill stats:', error);
    return getStudentSkillStats(studentId) || createEmptySkillStats(studentId);
  }
};

// Update individual skill rating
const updateIndividualSkillRating = (skillStats: StudentSkillStats, skillName: string, isSuccessful: boolean) => {
  let skillRating = skillStats.skill_ratings.find(sr => sr.skill_name === skillName);
  
  if (!skillRating) {
    // Create new skill rating
    skillRating = {
      skill_name: skillName,
      rating: 0,
      projects_completed: 0,
      total_projects: 0,
      success_rate: 0,
      last_updated: new Date().toISOString()
    };
    skillStats.skill_ratings.push(skillRating);
  }

  // Update skill project counts
  skillRating.total_projects += 1;
  if (isSuccessful) {
    skillRating.projects_completed += 1;
  }

  // Calculate skill success rate
  skillRating.success_rate = (skillRating.projects_completed / skillRating.total_projects) * 100;

  // Calculate skill rating (0-5 stars) based on success rate and project count
  // More projects and higher success rate = higher rating
  const projectBonus = Math.min(1, skillRating.projects_completed / 10); // Bonus for experience
  const successBonus = skillRating.success_rate / 100 * 4; // Up to 4 stars from success rate
  skillRating.rating = Math.min(5, Math.round((successBonus + projectBonus) * 10) / 10);
  
  skillRating.last_updated = new Date().toISOString();
};

// Create empty skill stats for new student
const createEmptySkillStats = (studentId: string): StudentSkillStats => {
  return {
    student_id: studentId,
    overall_skill_rating: 0,
    skill_level: 'Novice',
    total_projects_completed: 0,
    total_projects_failed: 0,
    success_rate: 0,
    skill_ratings: [],
    total_skills: 0,
    last_updated: new Date().toISOString()
  };
};

// Save skill stats to storage
const saveSkillStats = (skillStats: StudentSkillStats) => {
  const allStats = getFromStorage<StudentSkillStats>(STORAGE_KEYS.SKILL_STATS);
  const existingIndex = allStats.findIndex(stats => stats.student_id === skillStats.student_id);
  
  if (existingIndex >= 0) {
    allStats[existingIndex] = skillStats;
  } else {
    allStats.push(skillStats);
  }
  
  saveToStorage(STORAGE_KEYS.SKILL_STATS, allStats);
};

// Initialize sample skill stats for testing
export const initializeSampleSkillStats = (): void => {
  const existingStats = getFromStorage<StudentSkillStats>(STORAGE_KEYS.SKILL_STATS);
  if (existingStats.length > 0) {
    return; // Already initialized
  }

  const sampleStats: StudentSkillStats[] = [
    {
      student_id: 'student1',
      overall_skill_rating: 4.2,
      skill_level: 'Advanced',
      total_projects_completed: 8,
      total_projects_failed: 1,
      success_rate: 88.9,
      skill_ratings: [
        {
          skill_name: 'React',
          rating: 4.5,
          projects_completed: 5,
          total_projects: 5,
          success_rate: 100,
          last_updated: new Date().toISOString()
        },
        {
          skill_name: 'Node.js',
          rating: 4.0,
          projects_completed: 4,
          total_projects: 4,
          success_rate: 100,
          last_updated: new Date().toISOString()
        },
        {
          skill_name: 'Python',
          rating: 3.8,
          projects_completed: 3,
          total_projects: 4,
          success_rate: 75,
          last_updated: new Date().toISOString()
        },
        {
          skill_name: 'JavaScript',
          rating: 4.3,
          projects_completed: 6,
          total_projects: 6,
          success_rate: 100,
          last_updated: new Date().toISOString()
        }
      ],
      total_skills: 4,
      last_updated: new Date().toISOString()
    },
    {
      student_id: 'student2',
      overall_skill_rating: 3.5,
      skill_level: 'Intermediate',
      total_projects_completed: 4,
      total_projects_failed: 2,
      success_rate: 66.7,
      skill_ratings: [
        {
          skill_name: 'Python',
          rating: 3.8,
          projects_completed: 3,
          total_projects: 4,
          success_rate: 75,
          last_updated: new Date().toISOString()
        },
        {
          skill_name: 'Java',
          rating: 3.2,
          projects_completed: 2,
          total_projects: 3,
          success_rate: 66.7,
          last_updated: new Date().toISOString()
        },
        {
          skill_name: 'JavaScript',
          rating: 3.5,
          projects_completed: 2,
          total_projects: 2,
          success_rate: 100,
          last_updated: new Date().toISOString()
        }
      ],
      total_skills: 3,
      last_updated: new Date().toISOString()
    }
  ];

  saveToStorage(STORAGE_KEYS.SKILL_STATS, sampleStats);
  console.log('Sample skill stats initialized');
};

// Get all students skill stats (for leaderboards, etc.)
export const getAllStudentSkillStats = (): StudentSkillStats[] => {
  return getFromStorage<StudentSkillStats>(STORAGE_KEYS.SKILL_STATS);
};

// Update skill stats when a rating is received
export const updateSkillStatsOnRating = async (studentId: string): Promise<void> => {
  try {
    const skillStats = getStudentSkillStats(studentId);
    if (!skillStats) return;

    // Get updated project ratings
    const projectRatings = getRatingsForUser(studentId);
    if (projectRatings.length > 0) {
      // Recalculate overall skill rating based on quality and overall ratings
      const qualityAvg = projectRatings.reduce((sum, r) => sum + r.quality_rating, 0) / projectRatings.length;
      const overallAvg = projectRatings.reduce((sum, r) => sum + r.overall_rating, 0) / projectRatings.length;
      skillStats.overall_skill_rating = Math.round(((qualityAvg + overallAvg) / 2) * 10) / 10;
      
      // Update skill level
      skillStats.skill_level = calculateSkillLevel(skillStats.overall_skill_rating, skillStats.total_projects_completed);
      skillStats.last_updated = new Date().toISOString();
      
      saveSkillStats(skillStats);
      console.log('Skill stats updated based on new rating for student:', studentId);
    }
  } catch (error) {
    console.error('Error updating skill stats on rating:', error);
  }
};

export {
  createEmptySkillStats,
  saveSkillStats
};
