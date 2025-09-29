import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { ocrService } from '../../services/ocrService';
import { aiService, ResumeAnalysis } from '../../services/aiService';
import { updateSkillsFromResume } from '../../services/ratingService';
import { saveResumeAnalysis } from '../../services/supabaseService';
import { saveResumeAnalysis as saveResumeAnalysisLocal } from '../../services/localStorageService';
import { Student } from '../../types';

// ResumeAnalysis interface is now imported from aiService

interface ResumeUploadProps {
  user: Student;
  onSuccess: (analysis: ResumeAnalysis) => void;
  onError: (error: string) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ user, onSuccess, onError }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      onError('Please upload a PDF, JPEG, or PNG file.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      onError('File size must be less than 10MB.');
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);

    try {
      // Simulate OCR and AI analysis
      const analysisResult = await analyzeResume(file);
      setAnalysis(analysisResult);
      
      // Update rating system with extracted skills
      if (analysisResult.skills && analysisResult.skills.length > 0) {
        try {
          updateSkillsFromResume(user.id, analysisResult.skills);
          console.log('Skills updated in rating system:', analysisResult.skills);
        } catch (ratingError) {
          console.error('Error updating rating system:', ratingError);
          // Don't fail the upload if rating update fails
        }
      }
      
      // Save resume analysis data to user profile
      try {
        // Try Supabase first, then fallback to localStorage
        try {
          await saveResumeAnalysis(user.id, analysisResult);
          console.log('Resume analysis saved to Supabase successfully');
        } catch (supabaseError) {
          console.warn('Supabase save failed, using localStorage fallback:', supabaseError);
          await saveResumeAnalysisLocal(user.id, analysisResult);
          console.log('Resume analysis saved to localStorage successfully');
        }
        onSuccess(analysisResult);
      } catch (saveError) {
        console.error('Error saving resume analysis to both Supabase and localStorage:', saveError);
        // Still show the analysis even if saving fails
        onSuccess(analysisResult);
      }
    } catch (error) {
      console.error('Error analyzing resume:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze resume. Please ensure the file is a valid, readable resume.';
      onError(errorMessage);
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  const analyzeResume = async (file: File): Promise<ResumeAnalysis> => {
    setIsAnalyzing(true);
    
    try {
      // Step 1: Extract text using OCR
      console.log('Starting OCR extraction for file:', file.name, file.type);
      const ocrResult = await ocrService.extractText(file);
      console.log('OCR Result:', ocrResult);
      
      // Check if OCR extracted any meaningful text
      if (!ocrResult.text || ocrResult.text.trim().length < 10) {
        throw new Error('Resume text could not be extracted. Please ensure the file is clear and readable.');
      }
      
      // OCR result processed successfully
      console.log('OCR extraction completed:', ocrResult);
      
      // Step 2: Analyze the extracted text using AI
      const analysis = await aiService.analyzeResume(ocrResult.text);
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing resume:', error);
      // Pass through the original error message if it's meaningful
      if (error instanceof Error && error.message) {
        throw error;
      }
      throw new Error('Failed to analyze resume. Please ensure the file is a valid, readable resume.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeAgain = () => {
    setAnalysis(null);
    setUploadedFile(null);
  };


  if (analysis) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">Resume analyzed successfully!</span>
            </div>
            <button
              onClick={handleAnalyzeAgain}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Upload Different Resume
            </button>
          </div>
          <p className="text-sm text-green-700 mt-2">
            Your profile has been updated with the analysis results. You can view your rating in the profile section above.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Your Resume</h3>
        <p className="text-gray-600">
          Upload your resume to get AI-powered analysis and improve your profile rating
        </p>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        {isUploading || isAnalyzing ? (
          <div className="space-y-4">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isUploading ? 'Uploading resume...' : 'Analyzing resume with AI...'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {isUploading ? 'Please wait while we process your file' : 'This may take a few moments'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                Drop your resume here, or click to browse
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Supports PDF, JPEG, and PNG files up to 10MB
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Choose File
            </button>
          </div>
        )}
      </div>

      {uploadedFile && !analysis && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium">
              {uploadedFile.name} uploaded successfully
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
