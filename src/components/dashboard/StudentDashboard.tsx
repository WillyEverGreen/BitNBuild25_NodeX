import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Student, Project, Bid } from '../../types';
import { getProjects, getBidsByStudent, getWalletByUserId, getTransactionsByUserId } from '../../services/supabaseService';
import { Star, DollarSign, Clock, TrendingUp, Briefcase, List, Hand, HelpCircle, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import OpportunityList from '../opportunities/OpportunityList';
import RatingDisplay from '../rating/RatingDisplay';
import RatingHistory from '../rating/RatingHistory';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const student = user as Student;
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeBids: 0,
    completedProjects: 0,
    totalEarnings: 0
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOpportunities, setShowOpportunities] = useState(false);
  const [recommendedProjects, setRecommendedProjects] = useState<Project[]>([]);
  const [recentBids, setRecentBids] = useState<Bid[]>([]);

  useEffect(() => {
    if (user && user.type === 'student') {
      loadData();
    }
  }, [user?.id]);

  // Early return if user is not loaded or not a student
  if (!user || user.type !== 'student') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h2>
          <p className="text-gray-600">Please wait while we load your dashboard.</p>
        </div>
      </div>
    );
  }

  const loadData = async () => {
    if (!student?.id) return;
    
    try {
      setLoading(true);
      
      // Get all projects and filter for recommended ones
      const allProjects = await getProjects();
      setRecommendedProjects(allProjects.slice(0, 3));
      
      // Get student's bids
      const bids = await getBidsByStudent(student.id);
      setRecentBids(bids.slice(0, 3));
      
      // Calculate real stats
      const pendingBids = bids.filter(bid => bid.status === 'pending').length;
      
      // Get wallet and transaction data for earnings
      const wallet = await getWalletByUserId(student.id);
      const transactions = await getTransactionsByUserId(student.id);
      
      // Calculate earnings from completed projects (escrow releases)
      const completedEarnings = transactions
        .filter(t => t.type === 'escrow_release' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      
      // Calculate pending earnings (accepted bids that haven't been paid yet)
      const acceptedBids = bids.filter(bid => bid.status === 'accepted');
      const pendingEarnings = acceptedBids.reduce((sum, bid) => sum + bid.amount, 0);
      
      // Count active projects (projects where student has accepted bids)
      const activeProjects = acceptedBids.length;
      
      setStats({
        activeProjects,
        pendingBids,
        totalEarnings: completedEarnings,
        pendingEarnings
      });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-lg font-semibold text-gray-900">{student.name}</span>
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(student.rating) ? 'text-yellow-400' : 'text-gray-300'
                }`}
                fill={i < Math.floor(student.rating) ? 'currentColor' : 'none'}
              />
            ))}
            <span className="text-sm text-gray-600 ml-1">{student.rating}</span>
          </div>
          <HelpCircle className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeProjects}</p>
              <p className="text-sm text-gray-500">
                {stats.activeProjects > 0 ? 'Currently working' : 'No active projects'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <List className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Bids</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pendingBids}</p>
              <p className="text-sm text-gray-500">
                {stats.pendingBids > 0 ? 'Awaiting response' : 'No pending bids'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <Hand className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Earnings</p>
              <p className="text-3xl font-bold text-gray-900">${stats.totalEarnings.toLocaleString()}</p>
              <p className="text-sm text-gray-500">
                {stats.pendingEarnings > 0 ? `$${stats.pendingEarnings.toLocaleString()} pending` : 'No pending payments'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Rating Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RatingDisplay userId={student.id} showDetails={true} />
        <RatingHistory userId={student.id} />
      </div>

      {/* Resume Analysis Display */}
      {student.resume_analysis && student.resume_uploaded && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Award className="h-6 w-6 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900">Resume Analysis Score</h3>
            </div>
            <span className="text-sm text-gray-500">AI-powered analysis</span>
          </div>
          
          {/* Overall Score */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold text-indigo-600">
                {student.resume_analysis.overallRating.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">/ 3000</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                {student.resume_analysis.overallRating >= 2400 ? 'Expert Level' :
                 student.resume_analysis.overallRating >= 1800 ? 'Advanced Level' :
                 student.resume_analysis.overallRating >= 1200 ? 'Intermediate Level' :
                 student.resume_analysis.overallRating >= 600 ? 'Beginner Level' : 'Entry Level'}
              </div>
              <div className="text-xs text-gray-500">
                {((student.resume_analysis.overallRating / 3000) * 100).toFixed(1)}% Complete
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                student.resume_analysis.overallRating >= 2400 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                student.resume_analysis.overallRating >= 1800 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                student.resume_analysis.overallRating >= 1200 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                student.resume_analysis.overallRating >= 600 ? 'bg-gradient-to-r from-orange-400 to-orange-600' : 
                'bg-gradient-to-r from-red-400 to-red-600'
              }`}
              style={{ width: `${(student.resume_analysis.overallRating / 3000) * 100}%` }}
            ></div>
          </div>

          {/* Extracted Skills */}
          {student.resume_analysis.skills && student.resume_analysis.skills.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Extracted Skills</h4>
              <div className="flex flex-wrap gap-2">
                {student.resume_analysis.skills.slice(0, 8).map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                {student.resume_analysis.skills.length > 8 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{student.resume_analysis.skills.length - 8} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Profile Completion */}
      {!student.resume_uploaded && !student.resume_analysis && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Complete Your Profile</h3>
              <p className="text-gray-600 mt-1">
                Upload your resume to get better project recommendations and increase your rating.
              </p>
              <Link
                to="/profile"
                className="inline-flex items-center mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Complete Profile
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Find Your Next Opportunity</h3>
            <p className="text-purple-100">Browse available projects and start earning</p>
          </div>
          <button
            className="flex items-center px-6 py-3 bg-white text-purple-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Briefcase className="h-5 w-5 mr-2" />
            Browse Opportunities
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Link
          to="/projects"
          className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
        >
          <Briefcase className="h-6 w-6 text-blue-600 mr-3" />
          <div>
            <p className="font-medium text-gray-900">Browse Projects</p>
            <p className="text-sm text-gray-600">Find opportunities</p>
          </div>
        </Link>
        
        <Link
          to="/my-bids"
          className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all"
        >
          <Hand className="h-6 w-6 text-purple-600 mr-3" />
          <div>
            <p className="font-medium text-gray-900">My Bids</p>
            <p className="text-sm text-gray-600">Track applications</p>
          </div>
        </Link>
        
        <Link
          to="/messages"
          className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all"
        >
          <List className="h-6 w-6 text-green-600 mr-3" />
          <div>
            <p className="font-medium text-gray-900">Messages</p>
            <p className="text-sm text-gray-600">Chat with clients</p>
          </div>
        </Link>
        
        <Link
          to="/wallet"
          className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-yellow-300 hover:shadow-md transition-all"
        >
          <DollarSign className="h-6 w-6 text-yellow-600 mr-3" />
          <div>
            <p className="font-medium text-gray-900">Wallet</p>
            <p className="text-sm text-gray-600">Manage earnings</p>
          </div>
        </Link>
      </div>

      {/* Recommended Projects Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recommended Projects</h2>
          <button
            onClick={() => setShowOpportunities(true)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : recommendedProjects.length > 0 ? (
            recommendedProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {project.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-900">${project.budget}</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-gray-600">{project.client_name}</span>
                        <HelpCircle className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{project.duration}</span>
                  </div>
                  <Link
                    to={`/projects/${project.id}`}
                    className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Bid Now
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects available</h3>
              <p className="text-gray-600">Check back later for new opportunities!</p>
            </div>
          )}
        </div>
      </div>

      {/* Opportunities Modal */}
      {showOpportunities && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Available Opportunities</h2>
              <button
                onClick={() => setShowOpportunities(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <OpportunityList />
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentDashboard;