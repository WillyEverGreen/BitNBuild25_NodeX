import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateUser, getCurrentUser } from '../../services/localStorageService';
import { Student, Company } from '../../types';
import BackButton from '../common/BackButton';
import ResumeUpload from '../resume/ResumeUpload';

const Profile: React.FC = () => {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState<any>(null);
  const [formData, setFormData] = useState(() => {
    if (!user) return { name: '', email: '' };
    
    const baseData = {
      name: user.name || '',
      email: user.email || '',
    };

    if (user.type === 'student') {
      const student = user as Student;
      return {
        ...baseData,
        university: student.university || '',
        year: student.year || 1,
        major: student.major || '',
        skills: student.skills?.join(', ') || '',
        interests: student.interests?.join(', ') || '',
        available_hours: student.available_hours || 0,
      };
    } else {
      const company = user as Company;
      return {
        ...baseData,
        company_name: company.company_name || '',
        industry: company.industry || '',
        website: company.website || '',
        contact_person: company.contact_person || '',
      };
    }
  });

  // Update form data when user changes
  useEffect(() => {
    if (!user) return;
    
    const baseData = {
      name: user.name || '',
      email: user.email || '',
    };

    if (user.type === 'student') {
      const student = user as Student;
      setFormData({
        ...baseData,
        university: student.university || '',
        year: student.year || 1,
        major: student.major || '',
        skills: student.skills?.join(', ') || '',
        interests: student.interests?.join(', ') || '',
        available_hours: student.available_hours || 0,
      });
    } else {
      const company = user as Company;
      setFormData({
        ...baseData,
        company_name: company.company_name || '',
        industry: company.industry || '',
        website: company.website || '',
        contact_person: company.contact_person || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const updateData = {
        ...formData,
        ...(user.type === 'student' ? {
          skills: (formData as any).skills?.split(',').map((s: string) => s.trim()).filter((s: string) => s) || [],
          interests: (formData as any).interests?.split(',').map((s: string) => s.trim()).filter((s: string) => s) || [],
        } : {})
      };

      const updatedUser = await updateUser(user.id, updateData);
      alert('Profile updated successfully!');
      // The useEffect will automatically update the form with the new user data
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResumeSuccess = (analysis: any) => {
    setResumeAnalysis(analysis);
    setShowResumeUpload(false);
    alert('Resume uploaded successfully! Your skills have been updated.');
    // The useEffect will automatically update the form with the new user data
  };

  const handleResumeError = (error: string) => {
    alert(error);
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Please log in</h1>
          <p className="text-gray-600">You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <BackButton to={user.type === 'student' ? '/dashboard' : '/company-dashboard'} />
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Update your profile information</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Skills Display Section for Students */}
          {user.type === 'student' && (
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Skills & Expertise</h3>
                <span className="text-sm text-gray-500">Visible to companies</span>
              </div>
              
              {/* Current Skills Display */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Skills
                </label>
                <div className="flex flex-wrap gap-2">
                  {(formData as any).skills?.split(',').map((skill: string, index: number) => {
                    const trimmedSkill = skill.trim();
                    if (!trimmedSkill) return null;
                    return (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {trimmedSkill}
                      </span>
                    );
                  })}
                  {(!(formData as any).skills || (formData as any).skills.trim() === '') && (
                    <span className="text-gray-500 text-sm">No skills added yet</span>
                  )}
                </div>
              </div>

              {/* Skills Input */}
              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                  Add/Edit Skills
                </label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  value={(formData as any).skills || ''}
                  onChange={handleChange}
                  placeholder="JavaScript, React, Python, Node.js (comma separated)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate skills with commas. These will be visible to companies.
                </p>
              </div>
            </div>
          )}

          {/* Resume Upload Section for Students */}
          {user.type === 'student' && (
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Resume Upload</h3>
                {!showResumeUpload && (
                  <button
                    type="button"
                    onClick={() => setShowResumeUpload(true)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {(user as Student).resume_uploaded ? 'Upload New Resume' : 'Upload Resume'}
                  </button>
                )}
              </div>
              
              {(user as Student).resume_uploaded ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        Resume uploaded successfully
                      </p>
                      <p className="text-sm text-green-700">
                        Your profile has been enhanced with AI analysis
                      </p>
                    </div>
                  </div>
                </div>
              ) : showResumeUpload ? (
                <ResumeUpload
                  user={user as Student}
                  onSuccess={handleResumeSuccess}
                  onError={handleResumeError}
                />
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <p className="text-gray-600 mb-4">
                    Upload your resume to get AI-powered analysis and improve your profile rating
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowResumeUpload(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Upload Resume
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Student-specific fields */}
          {user.type === 'student' && (
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-2">
                    University
                  </label>
                  <input
                    type="text"
                    id="university"
                    name="university"
                    value={(formData as any).university || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Year
                  </label>
                  <select
                    id="year"
                    name="year"
                    value={(formData as any).year || 1}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                    <option value={5}>Graduate</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="major" className="block text-sm font-medium text-gray-700 mb-2">
                    Major
                  </label>
                  <input
                    type="text"
                    id="major"
                    name="major"
                    value={(formData as any).major || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="available_hours" className="block text-sm font-medium text-gray-700 mb-2">
                    Available Hours per Week
                  </label>
                  <input
                    type="number"
                    id="available_hours"
                    name="available_hours"
                    value={(formData as any).available_hours || 0}
                    onChange={handleChange}
                    min="0"
                    max="40"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6">
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  value={(formData as any).skills || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., React, Python, Design, Writing"
                />
              </div>
              <div className="mt-6">
                <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-2">
                  Interests (comma-separated)
                </label>
                <input
                  type="text"
                  id="interests"
                  name="interests"
                  value={(formData as any).interests || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Web Development, AI, Marketing"
                />
              </div>
            </div>
          )}

          {/* Company-specific fields */}
          {user.type === 'company' && (
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="company_name"
                    name="company_name"
                    value={(formData as any).company_name || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <input
                    type="text"
                    id="industry"
                    name="industry"
                    value={(formData as any).industry || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={(formData as any).website || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="contact_person" className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    id="contact_person"
                    name="contact_person"
                    value={(formData as any).contact_person || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
