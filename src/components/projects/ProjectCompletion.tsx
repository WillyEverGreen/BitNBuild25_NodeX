import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getProjectById, 
  getEscrowsByProjectId, 
  releaseEscrowToStudent,
  updateProject,
  createNotification
} from '../../services/localStorageService';
import { Project, Escrow } from '../../types';
import { 
  CheckCircle, 
  DollarSign, 
  Shield, 
  AlertCircle,
  Clock
} from 'lucide-react';
import BackButton from '../common/BackButton';

const ProjectCompletion: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [releasing, setReleasing] = useState(false);

  useEffect(() => {
    if (id) {
      loadProjectData();
    }
  }, [id]);

  const loadProjectData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const projectData = await getProjectById(id);
      setProject(projectData);

      if (projectData) {
        const projectEscrows = await getEscrowsByProjectId(id);
        setEscrows(projectEscrows);
      }
    } catch (error) {
      console.error('Error loading project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProject = async () => {
    if (!project || !user || user.type !== 'company') return;

    try {
      setReleasing(true);

      // Find assigned escrows for this project
      const assignedEscrows = escrows.filter(escrow => 
        escrow.status === 'assigned' || escrow.status === 'locked'
      );

      if (assignedEscrows.length === 0) {
        alert('No escrow funds found for this project.');
        return;
      }

      // Release escrow to the assigned student
      const escrow = assignedEscrows[0]; // Assuming one escrow per project for simplicity
      if (!escrow.student_id) {
        alert('No student assigned to this escrow. Please assign the project first.');
        return;
      }

      // Release the escrow
      await releaseEscrowToStudent(escrow.id, escrow.student_id);

      // Update project status to completed
      await updateProject(project.id, { status: 'completed' });

      // Send notification to student
      await createNotification({
        user_id: escrow.student_id,
        type: 'payment',
        title: 'Payment Released! 💰',
        message: `Congratulations! Payment of $${escrow.amount} has been released for "${project.title}". Funds are now available in your wallet.`,
        read: false,
        action_url: '/wallet'
      });

      alert(`Project completed successfully! $${escrow.amount} has been released to the student.`);
      await loadProjectData(); // Refresh data

    } catch (error) {
      console.error('Error completing project:', error);
      alert('Failed to complete project. Please try again.');
    } finally {
      setReleasing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getEscrowStatusColor = (status: Escrow['status']) => {
    switch (status) {
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'locked':
        return 'bg-orange-100 text-orange-800';
      case 'released':
        return 'bg-green-100 text-green-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || user.type !== 'company') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600">This page is only available to companies.</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Project not found</h1>
        </div>
      </div>
    );
  }

  const totalEscrowAmount = escrows
    .filter(escrow => escrow.status === 'assigned' || escrow.status === 'locked')
    .reduce((sum, escrow) => sum + escrow.amount, 0);

  const releasedEscrows = escrows.filter(escrow => escrow.status === 'released');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <BackButton to="/my-projects" />
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Project Completion</h1>
        <p className="text-gray-600 mt-2">Review and complete your project</p>
      </div>

      {/* Project Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{project.title}</h2>
            <p className="text-gray-600 mt-1">{project.description}</p>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            project.status === 'completed' 
              ? 'bg-green-100 text-green-700'
              : project.status === 'in-progress'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {project.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Budget</p>
              <p className="font-semibold">{formatCurrency(project.budget)}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="font-semibold">{project.duration}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-orange-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Escrow</p>
              <p className="font-semibold">{formatCurrency(totalEscrowAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Escrow Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Escrow Status</h3>
        
        {escrows.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No escrow assigned to this project</p>
            <p className="text-sm">Assign escrow funds before completing the project</p>
          </div>
        ) : (
          <div className="space-y-4">
            {escrows.map((escrow) => (
              <div key={escrow.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{formatCurrency(escrow.amount)}</p>
                  <p className="text-sm text-gray-600">{escrow.description}</p>
                  <p className="text-xs text-gray-500">
                    Assigned: {new Date(escrow.assigned_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getEscrowStatusColor(escrow.status)}`}>
                  {escrow.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completion Actions */}
      {project.status !== 'completed' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Project</h3>
          
          {totalEscrowAmount > 0 ? (
            <div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Ready to Complete</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Completing this project will release {formatCurrency(totalEscrowAmount)} from escrow to the assigned student. 
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCompleteProject}
                disabled={releasing}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {releasing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Releasing Funds...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Complete Project & Release Funds
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-900">No Escrow Funds</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    You need to assign escrow funds to this project before it can be completed.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completed Project Info */}
      {project.status === 'completed' && releasedEscrows.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start">
            <CheckCircle className="h-6 w-6 text-green-600 mt-1 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-green-900">Project Completed!</h3>
              <p className="text-green-700 mt-1">
                This project has been successfully completed and {formatCurrency(releasedEscrows.reduce((sum, e) => sum + e.amount, 0))} 
                has been released to the student.
              </p>
              <div className="mt-4">
                {releasedEscrows.map((escrow) => (
                  <div key={escrow.id} className="text-sm text-green-600">
                    Released: {formatCurrency(escrow.amount)} on {new Date(escrow.released_at!).toLocaleDateString()}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCompletion;
