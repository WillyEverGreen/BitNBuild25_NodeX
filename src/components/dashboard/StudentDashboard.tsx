import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Student } from '../../types';
import { mockProjects, mockBids } from '../../data/mockData';
import { Star, DollarSign, Clock, TrendingUp, Award, Briefcase, List, Hand, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const student = user as Student;

  const recommendedProjects = mockProjects.slice(0, 3);
  const recentBids = mockBids.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Dashboard</h1>
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
      {!student.resumeUploaded && (
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

      {/* Recommended Projects Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendedProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {project.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-gray-900">${project.budget}</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-gray-600">{project.company}</span>
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
                  <span>{project.duration} left</span>
                </div>
                <Link
                  to={`/projects/${project.id}`}
                  className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Bid Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default StudentDashboard;