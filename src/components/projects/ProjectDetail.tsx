import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockProjects } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { DollarSign, Clock, Users, Star, MapPin, Calendar, Send, ArrowLeft } from 'lucide-react';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [bidAmount, setBidAmount] = useState('');
  const [proposal, setProposal] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [showBidForm, setShowBidForm] = useState(false);

  const project = mockProjects.find(p => p.id === id);

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Project not found</h1>
          <Link to="/projects" className="text-blue-600 hover:text-blue-700">
            Back to projects
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmitBid = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle bid submission
    console.log('Bid submitted:', { bidAmount, proposal, deliveryDays });
    setShowBidForm(false);
    // Show success message
  };

  const isStudent = user?.type === 'student';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/projects"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to projects
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {project.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {project.clientName}
                    </span>
                    <span className="flex items-center">
                      <Star className="h-4 w-4 mr-1 fill-current text-yellow-500" />
                      {project.clientRating}/5
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Posted {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  project.status === 'open' ? 'bg-green-100 text-green-700' :
                  project.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {project.status}
                </span>
              </div>

              {/* Project Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">${project.budget.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Budget</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-gray-900">{project.duration}</p>
                  <p className="text-sm text-gray-600">Duration</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{project.bidsCount}</p>
                  <p className="text-sm text-gray-600">Bids</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Calendar className="h-6 w-6 text-red-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(project.deadline).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">Deadline</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Description</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
              </div>
            </div>

            {/* Skills Required */}
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills Required</h2>
              <div className="flex flex-wrap gap-2">
                {project.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Client Information */}
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">About the Client</h2>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {project.clientName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{project.clientName}</h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="h-4 w-4 mr-1 fill-current text-yellow-500" />
                    {project.clientRating}/5 rating
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Bid Form */}
          {isStudent && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {!showBidForm ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Place a Bid</h3>
                  <p className="text-gray-600 mb-4">
                    Submit your proposal and get hired for this project
                  </p>
                  <button
                    onClick={() => setShowBidForm(true)}
                    className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Place Bid
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitBid}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Your Bid</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bid Amount ($)
                    </label>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your bid amount"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Time (days)
                    </label>
                    <input
                      type="number"
                      value={deliveryDays}
                      onChange={(e) => setDeliveryDays(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Days to complete"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proposal
                    </label>
                    <textarea
                      value={proposal}
                      onChange={(e) => setProposal(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe your approach and why you're the best fit for this project..."
                      required
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowBidForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Submit Bid
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Project Categories */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Projects</h3>
            <div className="space-y-3">
              {mockProjects.filter(p => p.category === project.category && p.id !== project.id).slice(0, 3).map((similarProject) => (
                <Link
                  key={similarProject.id}
                  to={`/projects/${similarProject.id}`}
                  className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                    {similarProject.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    ${similarProject.budget.toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Project Tips */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips for Success</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Read the project description carefully</li>
              <li>• Highlight relevant experience in your proposal</li>
              <li>• Be realistic with your timeline and budget</li>
              <li>• Ask clarifying questions if needed</li>
              <li>• Showcase your portfolio and past work</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;