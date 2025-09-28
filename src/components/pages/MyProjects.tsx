import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getProjectsByCompany, 
  getEscrowsByProjectId, 
  releaseEscrowToStudent,
  createNotification,
  updateProject
} from '../../services/supabaseService';
import { updateRatingOnProjectSuccess } from '../../services/ratingService';
import { Project, Escrow } from '../../types';
import BackButton from '../common/BackButton';
import { DollarSign, Clock, Users, Calendar, Plus, Eye, Shield, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyProjects: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectEscrows, setProjectEscrows] = useState<Record<string, Escrow[]>>({});
  const [loading, setLoading] = useState(true);
  const [releasingFunds, setReleasingFunds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user?.type === 'company') {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const companyProjects = await getProjectsByCompany(user!.id);
      setProjects(companyProjects);

      // Load escrows for each project
      const escrowsData: Record<string, Escrow[]> = {};
      for (const project of companyProjects) {
        const escrows = await getEscrowsByProjectId(project.id);
        escrowsData[project.id] = escrows;
      }
      setProjectEscrows(escrowsData);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseFunds = async (projectId: string, projectTitle: string) => {
    if (!user) return;

    const escrows = projectEscrows[projectId] || [];
    const activeEscrows = escrows.filter(e => e.status === 'assigned' || e.status === 'locked');

    if (activeEscrows.length === 0) {
      alert('No active escrow funds found for this project.');
      return;
    }

    // Find escrows that have students assigned (locked status)
    const lockedEscrows = activeEscrows.filter(e => e.status === 'locked' && e.student_id);
    
    if (lockedEscrows.length === 0) {
      alert('No student assigned to this escrow. Please accept a bid first to assign a student to the project.');
      return;
    }

    const escrow = lockedEscrows[0]; // Taking the first locked escrow with student

    if (!confirm(`Are you sure you want to release $${escrow.amount} to the student for "${projectTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setReleasingFunds(prev => ({ ...prev, [projectId]: true }));

      // Release the escrow
      await releaseEscrowToStudent(escrow.id, escrow.student_id!);

      // Update project status to completed
      await updateProject(projectId, { status: 'completed' });

      // Update student rating based on project completion
      try {
        const project = projects.find(p => p.id === projectId);
        if (project) {
          await updateRatingOnProjectSuccess(escrow.student_id!, project.skills);
          console.log('Student rating updated for project completion');
        }
      } catch (ratingError) {
        console.error('Error updating student rating:', ratingError);
        // Don't fail the completion if rating update fails
      }

      // Send notification to student
      await createNotification({
        user_id: escrow.student_id!,
        type: 'payment',
        title: 'Payment Released! 💰',
        message: `Congratulations! Payment of $${escrow.amount} has been released for "${projectTitle}". Funds are now available in your wallet.`,
        read: false,
        action_url: '/wallet'
      });

      // Reload projects to reflect changes
      await loadProjects();

      alert(`Successfully released $${escrow.amount} to the student for "${projectTitle}"!`);
    } catch (error) {
      console.error('Error releasing funds:', error);
      alert('Failed to release funds. Please try again.');
    } finally {
      setReleasingFunds(prev => ({ ...prev, [projectId]: false }));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Temporary fix function to assign student to unassigned escrows
  const handleFixEscrowAssignment = async (projectId: string, projectTitle: string) => {
    if (!user) return;

    try {
      // Get accepted bid for this project
      const { getBidsByProject } = await import('../../services/localStorageService');
      const projectBids = await getBidsByProject(projectId);
      const acceptedBid = projectBids.find(bid => bid.status === 'accepted');

      if (!acceptedBid) {
        alert('No accepted bid found for this project. Please accept a bid first.');
        return;
      }

      // Get unassigned escrows and assign the student
      const escrows = projectEscrows[projectId] || [];
      const unassignedEscrows = escrows.filter(e => e.status === 'assigned' && !e.student_id);

      if (unassignedEscrows.length === 0) {
        alert('No unassigned escrows found.');
        return;
      }

      // Update escrows to assign student
      const { updateEscrowStatus } = await import('../../services/localStorageService');
      await Promise.all(
        unassignedEscrows.map(escrow => 
          updateEscrowStatus(escrow.id, 'locked', { student_id: acceptedBid.student_id })
        )
      );

      // Reload data
      await loadProjects();
      alert(`Successfully assigned student to ${unassignedEscrows.length} escrow(s) for "${projectTitle}"`);
    } catch (error) {
      console.error('Error fixing escrow assignment:', error);
      alert('Failed to fix escrow assignment. Please try again.');
    }
  };

  if (user?.type !== 'company') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600">Only companies can view their projects.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <BackButton to="/company-dashboard" />
        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-600 mt-2">Manage all your posted projects</p>
          </div>
          <Link
            to="/post-project"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Post New Project
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-600 mb-4">Start by posting your first project</p>
          <Link
            to="/post-project"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Post Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project) => {
            const escrows = projectEscrows[project.id] || [];
            const activeEscrows = escrows.filter(e => e.status === 'assigned' || e.status === 'locked');
            const lockedEscrows = escrows.filter(e => e.status === 'locked' && e.student_id);
            const releasedEscrows = escrows.filter(e => e.status === 'released');
            const totalEscrowAmount = activeEscrows.reduce((sum, e) => sum + e.amount, 0);
            const totalLockedAmount = lockedEscrows.reduce((sum, e) => sum + e.amount, 0);
            const totalReleasedAmount = releasedEscrows.reduce((sum, e) => sum + e.amount, 0);
            const isReleasing = releasingFunds[project.id] || false;

            return (
              <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {project.description}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    project.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : project.status === 'in-progress'
                      ? 'bg-blue-100 text-blue-700'
                      : project.status === 'open' 
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {project.status}
                  </span>
                </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <span className="font-semibold">${project.budget.toLocaleString()}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{project.duration}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{project.bids_count} bids</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{new Date(project.deadline).toLocaleDateString()}</span>
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
                {project.skills.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                    +{project.skills.length - 3} more
                  </span>
                )}
              </div>

              {/* Escrow Information */}
              {(totalEscrowAmount > 0 || totalReleasedAmount > 0) && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Escrow Status</span>
                    <Shield className="h-4 w-4 text-gray-500" />
                  </div>
                  {/* Debug info - remove this later */}
                  <div className="text-xs text-gray-500 mb-2">
                    Debug: {escrows.length} escrows - Assigned: {escrows.filter(e => e.status === 'assigned').length}, 
                    Locked: {escrows.filter(e => e.status === 'locked').length}, 
                    Released: {escrows.filter(e => e.status === 'released').length}
                  </div>
                  {totalEscrowAmount > totalLockedAmount && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Unassigned Escrow:</span>
                      <span className="font-semibold text-orange-600">{formatCurrency(totalEscrowAmount - totalLockedAmount)}</span>
                    </div>
                  )}
                  {totalLockedAmount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Ready to Release:</span>
                      <span className="font-semibold text-blue-600">{formatCurrency(totalLockedAmount)}</span>
                    </div>
                  )}
                  {totalReleasedAmount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Released:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(totalReleasedAmount)}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex space-x-2">
                <Link
                  to={`/projects/${project.id}`}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
                <Link
                  to={`/projects/${project.id}/bids`}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Bids
                </Link>
              </div>

              {/* Release Funds Button */}
              {totalLockedAmount > 0 && project.status !== 'completed' && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleReleaseFunds(project.id, project.title)}
                    disabled={isReleasing}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isReleasing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Releasing Funds...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Release Funds ({formatCurrency(totalLockedAmount)})
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Show message if escrow exists but no student assigned */}
              {totalEscrowAmount > 0 && totalLockedAmount === 0 && project.status !== 'completed' && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-center text-sm text-orange-600 bg-orange-50 rounded-lg py-2 mb-2">
                    <Shield className="h-4 w-4 mr-2" />
                    Accept a bid to assign student and enable fund release
                  </div>
                  {/* Temporary fix button */}
                  <button
                    onClick={() => handleFixEscrowAssignment(project.id, project.title)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    🔧 Fix Escrow Assignment (if bid already accepted)
                  </button>
                </div>
              )}

              {/* Completed Project Status */}
              {project.status === 'completed' && totalReleasedAmount > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-center text-sm text-green-600 bg-green-50 rounded-lg py-2">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Project Completed - Funds Released
                  </div>
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyProjects;
