import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getProjects, createBid } from '../../services/supabaseService';
import { Project, Student } from '../../types';

const OpportunityList: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [bidData, setBidData] = useState({
    amount: '',
    proposal: '',
    deliveryTime: ''
  });
  const [submittingBid, setSubmittingBid] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const projectsData = await getProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.type !== 'student' || !selectedProject) return;

    setSubmittingBid(true);
    try {
      const student = user as Student;
      const bid = {
        project_id: selectedProject.id,
        student_id: user.id,
        student_name: student.name,
        student_rating: student.rating,
        amount: parseInt(bidData.amount),
        proposal: bidData.proposal,
        timeline: `${bidData.deliveryTime} days`,
        delivery_time: parseInt(bidData.deliveryTime),
        status: 'pending' as const
      };

      await createBid(bid);
      
      // Reset form and close modal
      setBidData({ amount: '', proposal: '', deliveryTime: '' });
      setSelectedProject(null);
      
      // Reload projects to update bid count
      loadProjects();
      
      alert('Bid submitted successfully!');
    } catch (error) {
      console.error('Error submitting bid:', error);
      alert('Failed to submit bid. Please try again.');
    } finally {
      setSubmittingBid(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Opportunities</h1>
        <p className="text-gray-600">Find projects that match your skills and interests</p>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No opportunities available</h3>
          <p className="text-gray-600">Check back later for new projects!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {project.title}
                  </h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {project.category}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {project.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Budget:</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(project.budget)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Deadline:</span>
                    <span className="font-medium">{formatDate(project.deadline)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Duration:</span>
                    <span className="font-medium">{project.duration}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Bids:</span>
                    <span className="font-medium">{project.bids_count}</span>
                  </div>
                </div>

                {project.skills && project.skills.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {project.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {project.skills.length > 3 && (
                        <span className="text-gray-500 text-xs px-2 py-1">
                          +{project.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    by {project.client_name}
                  </div>
                  {user?.type === 'student' && (
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                    >
                      Submit Bid
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bid Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Submit Bid for "{selectedProject.title}"
              </h2>

              <form onSubmit={handleBidSubmit} className="space-y-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Bid Amount ($)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={bidData.amount}
                    onChange={(e) => setBidData(prev => ({ ...prev, amount: e.target.value }))}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your bid amount"
                  />
                </div>

                <div>
                  <label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Time (days)
                  </label>
                  <input
                    type="number"
                    id="deliveryTime"
                    value={bidData.deliveryTime}
                    onChange={(e) => setBidData(prev => ({ ...prev, deliveryTime: e.target.value }))}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="How many days will you take?"
                  />
                </div>

                <div>
                  <label htmlFor="proposal" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Proposal
                  </label>
                  <textarea
                    id="proposal"
                    value={bidData.proposal}
                    onChange={(e) => setBidData(prev => ({ ...prev, proposal: e.target.value }))}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your approach, experience, and why you're the best fit for this project..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedProject(null)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingBid}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingBid ? 'Submitting...' : 'Submit Bid'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunityList;


