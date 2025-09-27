import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getBidsByProject, getProjectById, getUserById, updateBid, createNotification, createMessage, getEscrowsByProjectId, updateEscrowStatus } from '../../services/localStorageService';
import { Bid, Project, Student } from '../../types';
import BackButton from '../common/BackButton';
import { 
  DollarSign, 
  Clock, 
  Star, 
  User, 
  Award,
  TrendingUp,
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface BidWithStudent extends Bid {
  student: Student;
  skillMatch: number;
}

type SortOption = 'amount_low' | 'amount_high' | 'rating_high' | 'rating_low' | 'skill_match' | 'delivery_time';
type FilterOption = 'all' | 'pending' | 'accepted' | 'rejected';

const ProjectBids: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [bids, setBids] = useState<BidWithStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('amount_low');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (id) {
      loadProjectAndBids();
    }
  }, [id]);

  const loadProjectAndBids = async () => {
    try {
      setLoading(true);
      
      // Load project
      const projectData = await getProjectById(id!);
      if (!projectData) {
        navigate('/my-projects');
        return;
      }
      setProject(projectData);

      // Load bids
      const projectBids = await getBidsByProject(id!);
      
      // Enhance bids with student data and skill matching
      const enhancedBids: BidWithStudent[] = await Promise.all(
        projectBids.map(async (bid) => {
          const student = await getUserById(bid.student_id) as Student;
          const skillMatch = calculateSkillMatch(student.skills, projectData.skills);
          return {
            ...bid,
            student,
            skillMatch
          };
        })
      );

      setBids(enhancedBids);
    } catch (error) {
      console.error('Error loading project and bids:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSkillMatch = (studentSkills: string[], projectSkills: string[]): number => {
    if (projectSkills.length === 0) return 0;
    const matchingSkills = studentSkills.filter(skill => 
      projectSkills.some(projectSkill => 
        projectSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(projectSkill.toLowerCase())
      )
    );
    return Math.round((matchingSkills.length / projectSkills.length) * 100);
  };

  const sortBids = (bidsToSort: BidWithStudent[]): BidWithStudent[] => {
    return [...bidsToSort].sort((a, b) => {
      switch (sortBy) {
        case 'amount_low':
          return a.amount - b.amount;
        case 'amount_high':
          return b.amount - a.amount;
        case 'rating_high':
          return b.student.rating - a.student.rating;
        case 'rating_low':
          return a.student.rating - b.student.rating;
        case 'skill_match':
          return b.skillMatch - a.skillMatch;
        case 'delivery_time':
          return a.delivery_time - b.delivery_time;
        default:
          return 0;
      }
    });
  };

  const filterBids = (bidsToFilter: BidWithStudent[]): BidWithStudent[] => {
    let filtered = bidsToFilter;

    // Filter by status
    if (filterBy !== 'all') {
      filtered = filtered.filter(bid => bid.status === filterBy);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(bid => 
        bid.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bid.proposal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bid.student.skills.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    return filtered;
  };

  const getProcessedBids = (): BidWithStudent[] => {
    return sortBids(filterBids(bids));
  };

  const handleAcceptBid = async (bidId: string, studentId: string, studentName: string) => {
    try {
      // Update bid status to accepted
      await updateBid(bidId, { status: 'accepted' });
      
      // Reject all other bids for this project
      const otherBids = bids.filter(bid => bid.id !== bidId);
      await Promise.all(
        otherBids.map(bid => updateBid(bid.id, { status: 'rejected' }))
      );

      // Create initial conversation message to establish chat
      const conversationId = [user!.id, studentId].sort().join('_');
      await createMessage({
        sender_id: user!.id,
        receiver_id: studentId,
        content: `🎉 Congratulations ${studentName}! Your bid for "${project?.title}" has been accepted. Let's discuss the project details and get started!`,
        read: false,
        conversation_id: conversationId
      });

      // Create notification for the accepted student
      await createNotification({
        user_id: studentId,
        type: 'project',
        title: 'Bid Accepted! 🎉',
        message: `Congratulations! Your bid for "${project?.title}" has been accepted. Check your messages to start the conversation.`,
        read: false,
        action_url: `/messages`
      });

      // Assign student to existing escrows for this project
      if (project) {
        const projectEscrows = await getEscrowsByProjectId(project.id);
        console.log('Found escrows for project:', projectEscrows);
        const unassignedEscrows = projectEscrows.filter(escrow => !escrow.student_id && escrow.status === 'assigned');
        console.log('Unassigned escrows to update:', unassignedEscrows);
        
        if (unassignedEscrows.length > 0) {
          // Assign the accepted student to all unassigned escrows for this project
          await Promise.all(
            unassignedEscrows.map(async (escrow) => {
              console.log(`Updating escrow ${escrow.id} with student ${studentId}`);
              return updateEscrowStatus(escrow.id, 'locked', { student_id: studentId });
            })
          );
          console.log('Escrow assignment completed');
        } else {
          console.log('No unassigned escrows found for this project');
        }
      }

      // Create notifications for rejected students
      await Promise.all(
        otherBids.map(bid => 
          createNotification({
            user_id: bid.student_id,
            type: 'project',
            title: 'Bid Update',
            message: `Thank you for your interest in "${project?.title}". Unfortunately, another candidate was selected for this project.`,
            read: false,
            action_url: `/projects`
          })
        )
      );

      // Reload bids to reflect changes
      await loadProjectAndBids();
      
      alert(`Bid accepted! ${studentName} has been notified and a conversation has been started. Check your Messages tab to continue the discussion.`);
    } catch (error) {
      console.error('Error accepting bid:', error);
      alert('Failed to accept bid. Please try again.');
    }
  };

  const handleRejectBid = async (bidId: string, studentId: string) => {
    try {
      await updateBid(bidId, { status: 'rejected' });
      
      // Create notification for the rejected student
      await createNotification({
        user_id: studentId,
        type: 'project',
        title: 'Bid Update',
        message: `Your bid for "${project?.title}" was not selected. Keep applying to other projects!`,
        read: false,
        action_url: `/projects`
      });

      await loadProjectAndBids();
      alert('Bid rejected and student has been notified.');
    } catch (error) {
      console.error('Error rejecting bid:', error);
      alert('Failed to reject bid. Please try again.');
    }
  };

  const handleStartChat = (studentId: string, studentName: string) => {
    // Navigate to chat with the specific student
    navigate(`/chat?with=${studentId}&name=${studentName}&project=${project?.title}`);
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Award className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Award className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-medium text-gray-500">#{index + 1}</span>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const isCompany = user?.type === 'company';
  const isStudent = user?.type === 'student';

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Project Not Found</h1>
          <p className="text-gray-600">The project you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const processedBids = getProcessedBids();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <BackButton to={isCompany ? "/my-projects" : "/projects"} />
        <div className="mt-4">
          <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
          <p className="text-gray-600 mt-2">
            {isCompany ? 'Bids Leaderboard - Manage Applications' : 'Bids Leaderboard - See Competition'}
          </p>
        </div>
      </div>

      {/* Project Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <DollarSign className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">${project.budget.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Budget</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <User className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{bids.length}</p>
            <p className="text-sm text-gray-600">Total Bids</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Clock className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{project.duration}</p>
            <p className="text-sm text-gray-600">Duration</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Calendar className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {new Date(project.deadline).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">Deadline</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, proposal, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Sort */}
          <div className="flex gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="amount_low">Price: Low to High</option>
              <option value="amount_high">Price: High to Low</option>
              <option value="rating_high">Rating: High to Low</option>
              <option value="rating_low">Rating: Low to High</option>
              <option value="skill_match">Best Skill Match</option>
              <option value="delivery_time">Fastest Delivery</option>
            </select>

            {/* Filter */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterOption)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Bids</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bids List */}
      {processedBids.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No bids found</h3>
          <p className="text-gray-600">
            {bids.length === 0 
              ? "No one has bid on this project yet." 
              : "No bids match your current filters."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {processedBids.map((bid, index) => (
            <div key={bid.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
                    {getRankIcon(index)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{bid.student.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{bid.student.rating}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-600">{bid.student.university}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-600">{bid.student.completed_projects} projects</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center ${getStatusColor(bid.status)}`}>
                    {getStatusIcon(bid.status)}
                    <span className="ml-1 capitalize">{bid.status}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">${bid.amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">Bid Amount</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{bid.delivery_time}</p>
                  <p className="text-xs text-gray-600">Days</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{bid.skillMatch}%</p>
                  <p className="text-xs text-gray-600">Skill Match</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">${bid.student.total_earnings.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">Total Earned</p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Proposal:</h4>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{bid.proposal}</p>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Skills:</h4>
                <div className="flex flex-wrap gap-2">
                  {bid.student.skills.map((skill) => {
                    const isMatching = project.skills.some(projectSkill => 
                      projectSkill.toLowerCase().includes(skill.toLowerCase()) ||
                      skill.toLowerCase().includes(projectSkill.toLowerCase())
                    );
                    return (
                      <span
                        key={skill}
                        className={`px-2 py-1 text-xs rounded-full ${
                          isMatching 
                            ? 'bg-green-100 text-green-800 font-medium' 
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {skill}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Submitted: {new Date(bid.created_at).toLocaleDateString()}</span>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleStartChat(bid.student_id, bid.student.name)}
                    className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Message
                  </button>
                  {isCompany && bid.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleAcceptBid(bid.id, bid.student_id, bid.student.name)}
                        className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Accept
                      </button>
                      <button 
                        onClick={() => handleRejectBid(bid.id, bid.student_id)}
                        className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                      </button>
                    </>
                  )}
                  {isStudent && bid.student_id === user?.id && bid.status === 'accepted' && (
                    <span className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-lg">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      You Won!
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectBids;
