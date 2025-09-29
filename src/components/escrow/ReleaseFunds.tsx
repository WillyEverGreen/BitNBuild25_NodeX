import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { releaseFunds, getEscrowsByProjectId, createMessage, createNotification, updateProject, updateUser, getUserById } from '../../services/supabaseService';
import { DollarSign, CheckCircle, AlertCircle, Send } from 'lucide-react';

interface ReleaseFundsProps {
  projectId: string;
  projectTitle: string;
  studentId: string;
  studentName: string;
  onSuccess?: () => void;
}

const ReleaseFunds: React.FC<ReleaseFundsProps> = ({
  projectId,
  projectTitle,
  studentId,
  studentName,
  onSuccess
}) => {
  const { user } = useAuth();
  const [escrows, setEscrows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [releasing, setReleasing] = useState(false);
  const [selectedEscrow, setSelectedEscrow] = useState<any>(null);
  const [releaseAmount, setReleaseAmount] = useState<number>(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadEscrows();
  }, [projectId]);

  const loadEscrows = async () => {
    try {
      setLoading(true);
      const projectEscrows = await getEscrowsByProjectId(projectId);
      console.log('ReleaseFunds - All project escrows:', projectEscrows);
      console.log('ReleaseFunds - Current user ID:', user?.id);
      console.log('ReleaseFunds - Project ID:', projectId);
      
      // Filter for escrows that are assigned and not yet released
      const availableEscrows = projectEscrows.filter(
        (escrow: any) => {
          console.log('ReleaseFunds - Checking escrow:', escrow);
          console.log('ReleaseFunds - Escrow status:', escrow.status);
          console.log('ReleaseFunds - Escrow company_id:', escrow.company_id);
          console.log('ReleaseFunds - Status match:', escrow.status === 'assigned');
          console.log('ReleaseFunds - Company match:', escrow.company_id === user?.id);
          
          return escrow.status === 'assigned' && escrow.company_id === user?.id;
        }
      );
      console.log('ReleaseFunds - Available escrows after filtering:', availableEscrows);
      setEscrows(availableEscrows);
      
      if (availableEscrows.length > 0) {
        setSelectedEscrow(availableEscrows[0]);
        setReleaseAmount(availableEscrows[0].amount);
      }
    } catch (error) {
      console.error('Error loading escrows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseFunds = async () => {
    if (!selectedEscrow || !user) return;

    try {
      setReleasing(true);
      console.log('Starting fund release:', {
        escrowId: selectedEscrow.id,
        companyId: user.id,
        studentId,
        amount: releaseAmount
      });

      // Release funds from escrow to student wallet
      await releaseFunds(
        selectedEscrow.id,
        user.id,
        studentId,
        releaseAmount,
        `Funds released for project: ${projectTitle}`
      );
      
      console.log('Funds released successfully');

      // Update project status to completed
      try {
        await updateProject(projectId, { status: 'completed' });
        console.log('Project status updated to completed');
      } catch (err) {
        console.error('Failed to update project status:', err);
        // Continue anyway - funds are released
      }

      // Update student's stats (completed_projects, total_earnings, and rating)
      try {
        const student = await getUserById(studentId);
        if (student) {
          const newCompletedProjects = (student.completed_projects || 0) + 1;
          const newTotalEarnings = (student.total_earnings || 0) + releaseAmount;
          
          // Increase rating slightly on successful completion (max 5.0)
          const ratingBoost = 0.05; // Small boost per completed project
          const currentRating = student.rating || 5.0;
          const newRating = Math.min(5.0, currentRating + ratingBoost);
          
          await updateUser(studentId, {
            completed_projects: newCompletedProjects,
            total_earnings: newTotalEarnings,
            rating: newRating
          });
          
          console.log(`✅ Student stats updated: projects=${newCompletedProjects}, earnings=$${newTotalEarnings}, rating=${newRating.toFixed(2)}`);
        }
      } catch (err) {
        console.error('Failed to update student stats:', err);
        // Continue anyway - funds are released
      }

      // Ensure conversation exists and create message to student
      try {
        const conversationId = [user.id, studentId].sort().join('_');
        
        // Ensure conversation exists with proper names
        try {
          const { ensureConversation } = await import('../../services/supabaseService');
          await ensureConversation(user.id, studentId, projectTitle, user.name, studentName);
        } catch (err) {
          console.warn('Failed to ensure conversation:', err);
        }
        
        await createMessage({
          sender_id: user.id,
          receiver_id: studentId,
          content: `🎉 **FUNDS RELEASED** 🎉

Great news ${studentName}!

I'm satisfied with the work you've completed for "${projectTitle}" and have released the funds from escrow.

💰 **Amount Released:** $${releaseAmount.toLocaleString()}
📋 **Project:** ${projectTitle}
💳 **Status:** Funds have been transferred to your wallet

${message ? `**Additional Message:**\n${message}` : ''}

The funds are now available in your wallet and you can withdraw them to your bank account.

Thank you for the excellent work!

Best regards,
${user.name}`,
          read: false,
          conversation_id: conversationId
        });
        console.log('✅ Message sent to student');
      } catch (err) {
        console.error('Failed to send message:', err);
        // Continue anyway - funds are released
      }

      // Create notification for student
      try {
        await createNotification({
          user_id: studentId,
          type: 'payment',
          title: 'Funds Released! 💰',
          message: `$${releaseAmount.toLocaleString()} has been released from escrow for "${projectTitle}". Check your wallet!`,
          read: false,
          action_url: '/wallet'
        });
        console.log('✅ Notification sent to student');
      } catch (err) {
        console.error('Failed to send notification:', err);
        // Continue anyway - funds are released
      }

      // Success feedback
      alert(`🎉 Funds Released Successfully!

$${releaseAmount.toLocaleString()} has been released to ${studentName}'s wallet.

✅ What happened:
• Funds transferred from escrow to ${studentName}'s wallet
• ${studentName} has been notified via message and notification
• ${studentName} can now withdraw the funds to their bank account
• Rating notifications sent to both you and ${studentName}

⭐ Rate Your Experience
You'll receive a notification to rate ${studentName}, and they'll be prompted to rate you too. This helps build trust in our community!

The transaction is complete!`);

      if (onSuccess) {
        onSuccess();
      }

      // Reload escrows to reflect changes
      await loadEscrows();
      setMessage('');
    } catch (error: any) {
      console.error('Error releasing funds:', error);
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      alert(`Failed to release funds: ${errorMessage}\n\nPlease check:\n• Escrow has sufficient balance\n• Student wallet exists\n• Database connection is working\n\nTry again or contact support.`);
    } finally {
      setReleasing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-6">
          {/* Debug Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Debug Info:</strong> Project ID: {projectId} | Student: {studentId} | User: {user?.id}
            </p>
            <button
              onClick={async () => {
                console.log('=== RELEASE FUNDS DEBUG ===');
                console.log('Project ID:', projectId);
                console.log('Student ID:', studentId);
                console.log('Current User:', user?.id);
                
                // Check localStorage directly
                const allEscrows = JSON.parse(localStorage.getItem('gigcampus_escrows') || '[]');
                console.log('All escrows in localStorage:', allEscrows);
                console.log('Escrows for this company:', allEscrows.filter((e: any) => e.company_id === user?.id));
                
                const allProjects = JSON.parse(localStorage.getItem('gigcampus_projects') || '[]');
                console.log('All projects:', allProjects);
                console.log('This project:', allProjects.find((p: any) => p.id === projectId));
                
                // Force reload
                await loadEscrows();
              }}
              className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded"
            >
              DEBUG ESCROWS
            </button>
          </div>

          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading escrows...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center mb-6">
        <DollarSign className="h-6 w-6 text-green-600 mr-3" />
        <h3 className="text-xl font-semibold text-gray-900">Release Funds</h3>
      </div>

      <div className="space-y-6">
        {/* Debug Info */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Debug Info:</strong> Project ID: {projectId} | Student: {studentId} | User: {user?.id}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            <strong>Escrows Found:</strong> {escrows.length}
          </p>
          <button
            onClick={async () => {
              console.log('=== RELEASE FUNDS DEBUG ===');
              console.log('Project ID:', projectId);
              console.log('Student ID:', studentId);
              console.log('Current User:', user?.id);
              
              // Check localStorage directly
              const allEscrows = JSON.parse(localStorage.getItem('gigcampus_escrows') || '[]');
              console.log('All escrows in localStorage:', allEscrows);
              console.log('Escrows for this company:', allEscrows.filter((e: any) => e.company_id === user?.id));
              
              const allProjects = JSON.parse(localStorage.getItem('gigcampus_projects') || '[]');
              console.log('All projects:', allProjects);
              console.log('This project:', allProjects.find((p: any) => p.id === projectId));
              
              // Force reload
              await loadEscrows();
            }}
            className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded"
          >
            DEBUG ESCROWS
          </button>
        </div>

        {/* Project Info */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Project Details</h4>
          <p className="text-blue-800"><strong>Project:</strong> {projectTitle}</p>
          <p className="text-blue-800"><strong>Student:</strong> {studentName}</p>
        </div>

        {/* Escrow Selection */}
        {escrows.length > 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Escrow
            </label>
            <select
              value={selectedEscrow?.id || ''}
              onChange={(e) => {
                const escrow = escrows.find(e => e.id === e.target.value);
                setSelectedEscrow(escrow);
                setReleaseAmount(escrow?.amount || 0);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {escrows.map((escrow) => (
                <option key={escrow.id} value={escrow.id}>
                  ${escrow.amount.toLocaleString()} - {escrow.description}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Release Amount
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="number"
              value={releaseAmount}
              onChange={(e) => setReleaseAmount(Number(e.target.value))}
              max={selectedEscrow?.amount || 0}
              min={0}
              step="0.01"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
          {selectedEscrow && (
            <p className="text-sm text-gray-600 mt-1">
              Available: ${selectedEscrow.amount.toLocaleString()}
            </p>
          )}
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Message (Optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add a personal message to the student..."
          />
        </div>

        {/* Release Button */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleReleaseFunds}
            disabled={releasing || !selectedEscrow || releaseAmount <= 0 || releaseAmount > selectedEscrow?.amount}
            className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {releasing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Releasing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Release ${releaseAmount.toLocaleString()}
              </>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Important:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Once released, funds cannot be returned to escrow</li>
                <li>The student will be notified immediately</li>
                <li>Funds will be available in the student's wallet</li>
                <li>The student can withdraw funds to their bank account</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReleaseFunds;
