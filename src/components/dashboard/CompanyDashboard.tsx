import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Company, Project, Bid } from '../../types';
import { getProjectsByCompany, getBidsByProject, getTransactionsByUserId } from '../../services/supabaseService';
import { Plus, Users, DollarSign, Clock, TrendingUp, Eye, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import CreateOpportunity from '../opportunities/CreateOpportunity';
import PendingRatings from '../rating/PendingRatings';
import ProjectRatingDisplay from '../rating/ProjectRatingDisplay';
import { getRatingsForUser, getRatingStats } from '../../services/projectRatingService';

const CompanyDashboard: React.FC = () => {
  const { user } = useAuth();
  const company = user as Company;
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalSpent: 0,
    postedProjects: 0,
    pendingBids: 0
  });
  const [loading, setLoading] = useState(true);
  const [showCreateOpportunity, setShowCreateOpportunity] = useState(false);
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [recentBids, setRecentBids] = useState<Bid[]>([]);
  const [projectRatings, setProjectRatings] = useState<any[]>([]);
  const [ratingStats, setRatingStats] = useState<any>(null);

  // Early return if user is not loaded or not a company
  if (!user || user.type !== 'company') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h2>
          <p className="text-gray-600">Please wait while we load your dashboard.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadData();
  }, [company?.id]);

  const loadData = async () => {
    if (!company?.id) return;
    
    try {
      setLoading(true);
      const projects = await getProjectsByCompany(company.id);
      setMyProjects(projects);
      
      // Get bids for all projects
      const allBids: Bid[] = [];
      for (const project of projects) {
        const projectBids = await getBidsByProject(project.id);
        allBids.push(...projectBids);
      }
      setRecentBids(allBids.slice(0, 4));
      
      // Calculate real stats
      const activeProjects = projects.filter(p => p.status === 'open' || p.status === 'in-progress').length;
      const postedProjects = projects.length;
      const pendingBids = allBids.filter(bid => bid.status === 'pending').length;
      
      // Get transaction data for total spent
      const transactions = await getTransactionsByUserId(company.id);
      const totalSpent = transactions
        .filter(t => (t.type === 'escrow_assignment' || t.type === 'project_payment') && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      
      setStats({
        activeProjects,
        totalSpent,
        postedProjects,
        pendingBids
      });
      
      // Load project ratings
      const ratings = getRatingsForUser(company.id);
      const stats = getRatingStats(company.id);
      setProjectRatings(ratings);
      setRatingStats(stats);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpportunityCreated = () => {
    setShowCreateOpportunity(false);
    loadData(); // Reload data to show new project
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {company.contact_person}!
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Manage your projects and connect with talented students
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalSpent.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-50">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Posted Projects</p>
              <p className="text-2xl font-bold text-gray-900">{stats.postedProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-amber-50">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Bids</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingBids}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Ready to post a new project?</h3>
            <p className="text-blue-100">Connect with talented students and get your project done</p>
          </div>
          <button
            onClick={() => setShowCreateOpportunity(true)}
            className="flex items-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Post Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Projects */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">My Projects</h2>
                <Link
                  to="/my-projects"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all
                </Link>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {myProjects.map((project) => (
                <div key={project.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {project.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          project.status === 'open' 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {project.description}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          ${project.budget}
                        </span>
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {project.bids_count} bids
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Due {new Date(project.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Link
                      to={`/projects/${project.id}`}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/projects/${project.id}/bids`}
                      className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      View Bids
                    </Link>
                    {project.status !== 'completed' && (
                      <Link
                        to={`/projects/${project.id}/complete`}
                        className="px-4 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-lg hover:bg-green-200 transition-colors"
                      >
                        Complete Project
                      </Link>
                    )}
                  </div>
                </div>
              ))}

              {myProjects.length === 0 && (
                <div className="p-8 text-center">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Plus className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                  <p className="text-gray-600 mb-4">Start by posting your first project</p>
                  <button
                    onClick={() => setShowCreateOpportunity(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Post Project
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity & Quick Stats */}
        <div className="space-y-6">
          {/* Recent Bids */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bids</h3>
            <div className="space-y-4">
              {recentBids.map((bid) => (
                <div key={bid.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150"
                    alt={bid.student_name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{bid.student_name}</p>
                    <p className="text-xs text-gray-600">Rating: {bid.student_rating}/5</p>
                    <p className="text-sm text-gray-600">${bid.amount}</p>
                  </div>
                  <div className="flex space-x-1">
                    <button className="p-1 text-gray-400 hover:text-blue-600">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-blue-600">
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowCreateOpportunity(true)}
                className="block w-full px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Post New Project
              </button>
              <Link
                to="/my-projects"
                className="block w-full px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Manage Projects
              </Link>
              <Link
                to="/messages"
                className="block w-full px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Check Messages
              </Link>
              <Link
                to="/company-wallet"
                className="block w-full px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Manage Wallet & Escrow
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentBids.length > 0 ? (
                recentBids.slice(0, 3).map((bid, index) => (
                  <div key={bid.id} className="flex items-center text-sm text-gray-600">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      index === 0 ? 'bg-blue-500' : 
                      index === 1 ? 'bg-green-500' : 'bg-purple-500'
                    }`}></div>
                    New bid received from {bid.student_name} - ${bid.amount}
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Company Ratings & Pending Ratings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ProjectRatingDisplay
          ratings={projectRatings}
          stats={ratingStats}
          userType="company"
          userName={company.company_name}
          showReviews={true}
          maxReviews={3}
        />
        <PendingRatings />
      </div>

      {/* Create Opportunity Modal */}
      {showCreateOpportunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CreateOpportunity onSuccess={handleOpportunityCreated} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;