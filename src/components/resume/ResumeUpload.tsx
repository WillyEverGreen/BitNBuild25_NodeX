import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Star, Award, TrendingUp, Eye, EyeOff, Copy, Download } from 'lucide-react';
import { ocrService, OCRResult } from '../../services/ocrService';
import { aiService, ResumeAnalysis } from '../../services/aiService';
import { updateSkillsFromResume } from '../../services/ratingService';
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
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [showRawText, setShowRawText] = useState(false);
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
      
      // Don't call onSuccess to avoid authentication issues
      // onSuccess(analysisResult);
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
      
      // Store OCR result for display
      console.log('Setting OCR result in component:', ocrResult);
      setOcrResult(ocrResult);
      
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
    setOcrResult(null);
    setShowRawText(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadText = (text: string, filename: string) => {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const renderRating = (rating: number, label: string) => {
    const percentage = (rating / 3000) * 100;
    const getRatingColor = (rating: number) => {
      if (rating >= 2400) return 'text-green-600';
      if (rating >= 1800) return 'text-blue-600';
      if (rating >= 1200) return 'text-yellow-600';
      if (rating >= 600) return 'text-orange-600';
      return 'text-red-600';
    };
    
    const getRatingLevel = (rating: number) => {
      if (rating >= 2400) return 'Expert';
      if (rating >= 1800) return 'Advanced';
      if (rating >= 1200) return 'Intermediate';
      if (rating >= 600) return 'Beginner';
      return 'Entry Level';
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <div className="flex items-center space-x-2">
            <span className={`text-lg font-bold ${getRatingColor(rating)}`}>
              {rating.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500">/ 3000</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              rating >= 2400 ? 'bg-green-500' :
              rating >= 1800 ? 'bg-blue-500' :
              rating >= 1200 ? 'bg-yellow-500' :
              rating >= 600 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{getRatingLevel(rating)}</span>
          <span className="text-xs text-gray-500">{percentage.toFixed(1)}%</span>
        </div>
      </div>
    );
  };

  if (analysis) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">Resume analyzed successfully!</span>
          </div>
        </div>

        {/* OCR Results Section */}
        {console.log('Rendering OCR section, ocrResult:', ocrResult)}
        {ocrResult && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">OCR Extraction Results</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  Confidence: {Math.round(ocrResult.confidence * 100)}%
                </span>
                <button
                  onClick={() => setShowRawText(!showRawText)}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {showRawText ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span>{showRawText ? 'Hide' : 'Show'} Raw Text</span>
                </button>
              </div>
            </div>

            {/* Keywords Display */}
            <div className="space-y-6">
              {/* All Keywords Summary */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  Extracted Keywords ({ocrResult.keywords.all.length} total)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {ocrResult.keywords.all.slice(0, 20).map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                  {ocrResult.keywords.all.length > 20 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{ocrResult.keywords.all.length - 20} more
                    </span>
                  )}
                </div>
              </div>

              {/* Categorized Keywords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Technical Keywords */}
                {ocrResult.keywords.technical.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Technical Skills ({ocrResult.keywords.technical.length})
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {ocrResult.keywords.technical.slice(0, 10).map((keyword, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                      {ocrResult.keywords.technical.length > 10 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{ocrResult.keywords.technical.length - 10}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Professional Keywords */}
                {ocrResult.keywords.professional.length > 0 && (
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Professional Roles ({ocrResult.keywords.professional.length})
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {ocrResult.keywords.professional.slice(0, 10).map((keyword, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                      {ocrResult.keywords.professional.length > 10 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{ocrResult.keywords.professional.length - 10}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Education Keywords */}
                {ocrResult.keywords.education.length > 0 && (
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Education ({ocrResult.keywords.education.length})
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {ocrResult.keywords.education.slice(0, 10).map((keyword, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                      {ocrResult.keywords.education.length > 10 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{ocrResult.keywords.education.length - 10}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Experience Keywords */}
                {ocrResult.keywords.experience.length > 0 && (
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Experience ({ocrResult.keywords.experience.length})
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {ocrResult.keywords.experience.slice(0, 10).map((keyword, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                      {ocrResult.keywords.experience.length > 10 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{ocrResult.keywords.experience.length - 10}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Raw Text Display */}
              {showRawText && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-medium text-gray-700">Raw Extracted Text</h5>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyToClipboard(ocrResult.text)}
                        className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                      >
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </button>
                      <button
                        onClick={() => downloadText(ocrResult.text, 'extracted-resume-text.txt')}
                        className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                      {ocrResult.text}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analysis Results */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume Analysis Results</h3>
          
          {/* Overall Rating */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">Overall Rating</h4>
              <div className="flex items-center space-x-2">
                <Award className="h-6 w-6 text-yellow-500" />
                <span className="text-3xl font-bold text-gray-900">{analysis.overallRating.toLocaleString()}</span>
                <span className="text-lg text-gray-500">/ 3000</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  analysis.overallRating >= 2400 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                  analysis.overallRating >= 1800 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                  analysis.overallRating >= 1200 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                  analysis.overallRating >= 600 ? 'bg-gradient-to-r from-orange-400 to-orange-600' : 
                  'bg-gradient-to-r from-red-400 to-red-600'
                }`}
                style={{ width: `${(analysis.overallRating / 3000) * 100}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-600">
                {analysis.overallRating >= 2400 ? 'Expert Level' :
                 analysis.overallRating >= 1800 ? 'Advanced Level' :
                 analysis.overallRating >= 1200 ? 'Intermediate Level' :
                 analysis.overallRating >= 600 ? 'Beginner Level' : 'Entry Level'}
              </span>
              <span className="text-sm text-gray-500">
                {((analysis.overallRating / 3000) * 100).toFixed(1)}% Complete
              </span>
            </div>
          </div>

          {/* Detailed Ratings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Skills</h5>
              {renderRating(analysis.skillRating, '')}
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Experience</h5>
              {renderRating(analysis.experienceRating, '')}
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Education</h5>
              {renderRating(analysis.educationRating, '')}
            </div>
          </div>

          {/* Summary */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">AI Summary</h4>
            <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
              {analysis.summary}
            </p>
          </div>

          {/* Extracted Skills */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Extracted Skills</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Strengths and Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Strengths</h4>
              <ul className="space-y-2">
                {analysis.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Areas for Improvement</h4>
              <ul className="space-y-2">
                {analysis.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Keyword Matches</h5>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-blue-600">{analysis.keywordMatches}</span>
                <span className="text-sm text-gray-500">keywords found</span>
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Technical Depth</h5>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-purple-600">{analysis.technicalDepth}</span>
                <span className="text-sm text-gray-500">depth score</span>
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Professional Level</h5>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-orange-600">{analysis.professionalLevel}</span>
                <span className="text-sm text-gray-500">level score</span>
              </div>
            </div>
          </div>

          {/* Industry Fit */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Industry Fit</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.industryFit.map((industry, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                >
                  {industry}
                </span>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Improvement Suggestions</h4>
            <ul className="space-y-2">
              {analysis.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <button
              onClick={handleAnalyzeAgain}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Analyze Different Resume
            </button>
          </div>
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
