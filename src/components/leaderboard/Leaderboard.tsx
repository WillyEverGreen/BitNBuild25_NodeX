import React, { useState, useEffect } from 'react';
import { Student } from '../../types';
import { getStudentLeaderboard } from '../../services/localStorageService';
import { Trophy, Medal, Award, Star, Filter, Users, TrendingUp, BookOpen, Briefcase } from 'lucide-react';

interface LeaderboardProps {
  className?: string;
}

type SortCriteria = 'overall' | 'skills' | 'experience' | 'education';
type SkillFilter = string | 'all';

const Leaderboard: React.FC<LeaderboardProps> = ({ className = '' }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortCriteria>('overall');
  const [skillFilter, setSkillFilter] = useState<SkillFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique skills from all students
  const getAllSkills = (students: Student[]): string[] => {
    const skillsSet = new Set<string>();
    students.forEach(student => {
      if (student.resume_analysis?.skills) {
        student.resume_analysis.skills.forEach(skill => skillsSet.add(skill));
      }
      if (student.skills) {
        student.skills.forEach(skill => skillsSet.add(skill));
      }
    });
    return Array.from(skillsSet).sort();
  };

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      let leaderboardData = await getStudentLeaderboard(sortBy);
      
      // Apply skill filter
      if (skillFilter !== 'all') {
        leaderboardData = leaderboardData.filter(student => {
          const hasSkillInResume = student.resume_analysis?.skills?.some(skill => 
            skill.toLowerCase().includes(skillFilter.toLowerCase())
          );
          const hasSkillInProfile = student.skills?.some(skill => 
            skill.toLowerCase().includes(skillFilter.toLowerCase())
          );
          return hasSkillInResume || hasSkillInProfile;
        });
      }
      
      setStudents(leaderboardData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [sortBy, skillFilter]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getScoreByCategory = (student: Student, category: SortCriteria): number => {
    const analysis = student.resume_analysis;
    if (!analysis) return 0;
    
    switch (category) {
      case 'overall':
        return analysis.overallRating || 0;
      case 'skills':
        return analysis.skillRating || 0;
      case 'experience':
        return analysis.experienceRating || 0;
      case 'education':
        return analysis.educationRating || 0;
      default:
        return 0;
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 2400) return 'text-green-600';
    if (score >= 1800) return 'text-blue-600';
    if (score >= 1200) return 'text-yellow-600';
    if (score >= 600) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLevel = (score: number): string => {
    if (score >= 2400) return 'Expert';
    if (score >= 1800) return 'Advanced';
    if (score >= 1200) return 'Intermediate';
    if (score >= 600) return 'Beginner';
    return 'Entry Level';
  };

  const allSkills = getAllSkills(students);

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Student Leaderboard</h2>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort by Category
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { key: 'overall', label: 'Overall Score', icon: Trophy },
                  { key: 'skills', label: 'Skills', icon: Star },
                  { key: 'experience', label: 'Experience', icon: Briefcase },
                  { key: 'education', label: 'Education', icon: BookOpen }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setSortBy(key as SortCriteria)}
                    className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                      sortBy === key
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Skill
              </label>
              <select
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Skills</option>
                {allSkills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard */}
      <div className="p-6">
        {students.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No students found with resume analysis.</p>
            <p className="text-sm text-gray-500 mt-1">
              Students need to upload their resumes to appear on the leaderboard.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {students.map((student, index) => {
              const rank = index + 1;
              const score = getScoreByCategory(student, sortBy);
              const analysis = student.resume_analysis;
              
              return (
                <div
                  key={student.id}
                  className={`flex items-center space-x-4 p-4 rounded-lg border transition-colors ${
                    rank <= 3
                      ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-12 flex justify-center">
                    {getRankIcon(rank)}
                  </div>

                  {/* Student Info */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {student.name}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {student.university}
                      </span>
                    </div>
                    
                    {/* Skills Preview */}
                    {analysis?.skills && analysis.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {analysis.skills.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {analysis.skills.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            +{analysis.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Score */}
                  <div className="flex-shrink-0 text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
                      {score.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getScoreLevel(score)}
                    </div>
                    <div className="text-xs text-gray-400">
                      / 3000
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
