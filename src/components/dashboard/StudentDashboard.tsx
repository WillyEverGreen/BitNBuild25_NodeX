import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Student, Project, Bid } from '../../types';
import { getProjects, getBidsByStudent } from '../../services/localStorageService';
import { Star, DollarSign, Clock, TrendingUp, Briefcase, List, Hand, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import OpportunityList from '../opportunities/OpportunityList';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const student = user as Student;
  const [recommendedProjects, setRecommendedProjects] = useState<Project[]>([]);
  const [, setRecentBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOpportunities, setShowOpportunities] = useState(false);

  useEffect(() => {
    loadData();
  }, [student?.id]);

  const loadData = async () => {
    if (!student?.id) return;
    
    try {
      setLoading(true);
      const projects = await getProjects();
      setRecommendedProjects(projects.slice(0, 3));
      
      const bids = await getBidsByStudent(student.id);
      setRecentBids(bids.slice(0, 3));
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
              <p className="text-3xl font-bold text-gray-900">3</p>
              <p className="text-sm text-gray-500">2 due this week</p>
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
              <p className="text-3xl font-bold text-gray-900">5</p>
              <p className="text-sm text-gray-500">Awaiting response</p>
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
              <p className="text-3xl font-bold text-gray-900">$1,250</p>
              <p className="text-sm text-gray-500">$450 pending approval</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Profile Completion */}
      {!student.resume_uploaded && (
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
            onClick={() => setShowOpportunities(true)}
            className="flex items-center px-6 py-3 bg-white text-purple-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Briefcase className="h-5 w-5 mr-2" />
            Browse Opportunities
          </button>
        </div>
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