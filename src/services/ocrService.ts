// OCR Service for extracting text from images and PDFs using OCR.space API
// Real implementation using OCR.space API

export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
  keywords: {
    technical: string[];
    professional: string[];
    education: string[];
    experience: string[];
    all: string[];
  };
  boundingBoxes?: Array<{
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

export class OCRService {
  private static instance: OCRService;
  private readonly API_KEY = 'K88279165088957';
  private readonly API_URL = 'https://api.ocr.space/parse/image';
  
  public static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService();
    }
    return OCRService.instance;
  }

  /**
   * Extract text from an image file using OCR.space API
   * @param file - The image file to process
   * @returns Promise<OCRResult> - The extracted text and metadata
   */
  async extractTextFromImage(file: File): Promise<OCRResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          
          console.log('Making OCR.space API call to:', this.API_URL);
          console.log('API Key:', this.API_KEY);
          console.log('File type:', file.type);
          console.log('Base64 length:', base64.length);
          
          const formData = new FormData();
          formData.append('apikey', this.API_KEY);
          formData.append('base64Image', `data:${file.type};base64,${base64}`);
          formData.append('language', 'eng');
          formData.append('isOverlayRequired', 'false');
          formData.append('detectOrientation', 'true');
          formData.append('scale', 'true');
          formData.append('OCREngine', '2');
          
          const response = await fetch(this.API_URL, {
            method: 'POST',
            body: formData
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('OCR.space API Error Response:', errorText);
            throw new Error(`OCR.space API error: ${response.status} - ${errorText}`);
          }
          
          const data = await response.json();
          console.log('OCR.space API Response:', data);
          
          if (data.IsErroredOnProcessing) {
            console.error('OCR.space API Error Response:', data);
            throw new Error(data.ErrorMessage || 'OCR processing failed. Please check if the file is readable and try again.');
          }
          
          const extractedText = data.ParsedResults?.[0]?.ParsedText || '';
          const confidence = data.ParsedResults?.[0]?.TextOverlay?.Lines?.length > 0 
            ? 0.9 // High confidence if we got structured results
            : 0.7; // Lower confidence for plain text
          
          // Validate extracted text
          if (!extractedText || extractedText.trim().length < 10) {
            throw new Error('No readable text found in the image. Please ensure the image is clear and contains text.');
          }
          
          // Extract keywords from the text
          console.log('Extracted text from image:', extractedText);
          const keywords = this.extractKeywords(extractedText);
          console.log('Extracted keywords from image:', keywords);
          
          const result: OCRResult = {
            text: extractedText,
            confidence,
            language: 'en',
            keywords,
            boundingBoxes: data.ParsedResults?.[0]?.TextOverlay?.Lines?.map((line: any) => ({
              text: line.LineText,
              x: line.MinLeft,
              y: line.MinTop,
              width: line.MaxRight - line.MinLeft,
              height: line.MaxBottom - line.MinTop
            })) || []
          };
          
          resolve(result);
        } catch (error) {
          console.error('OCR.space API Error:', error);
          // If it's a CORS or network error, provide a more helpful message
          if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            reject(new Error('OCR service is currently unavailable. This might be due to network restrictions or API limitations. Please try again later or contact support.'));
          } else {
            reject(new Error('Failed to process image with OCR. Please try again.'));
          }
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Extract text from a PDF file using OCR.space API
   * @param file - The PDF file to process
   * @returns Promise<OCRResult> - The extracted text and metadata
   */
  async extractTextFromPDF(file: File): Promise<OCRResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = btoa(String.fromCharCode(...new Uint8Array(reader.result as ArrayBuffer)));
          
          console.log('Making OCR.space API call for PDF to:', this.API_URL);
          console.log('API Key:', this.API_KEY);
          console.log('File type:', file.type);
          console.log('Base64 length:', base64.length);
          
          const formData = new FormData();
          formData.append('apikey', this.API_KEY);
          formData.append('base64Image', `data:${file.type};base64,${base64}`);
          formData.append('language', 'eng');
          formData.append('isOverlayRequired', 'false');
          formData.append('detectOrientation', 'true');
          formData.append('scale', 'true');
          formData.append('OCREngine', '2');
          formData.append('filetype', 'PDF');
          
          const response = await fetch(this.API_URL, {
            method: 'POST',
            body: formData
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('OCR.space API Error Response for PDF:', errorText);
            throw new Error(`OCR.space API error: ${response.status} - ${errorText}`);
          }
          
          const data = await response.json();
          console.log('OCR.space API Response for PDF:', data);
          
          if (data.IsErroredOnProcessing) {
            console.error('OCR.space API Error Response:', data);
            throw new Error(data.ErrorMessage || 'OCR processing failed. Please check if the PDF is readable and not password-protected.');
          }
          
          const extractedText = data.ParsedResults?.[0]?.ParsedText || '';
          const confidence = data.ParsedResults?.[0]?.TextOverlay?.Lines?.length > 0 
            ? 0.9 // High confidence if we got structured results
            : 0.7; // Lower confidence for plain text
          
          // Validate extracted text
          if (!extractedText || extractedText.trim().length < 10) {
            throw new Error('No readable text found in the PDF. Please ensure the PDF contains text and is not password-protected.');
          }
          
          // Extract keywords from the text
          console.log('Extracted text from PDF:', extractedText);
          const keywords = this.extractKeywords(extractedText);
          console.log('Extracted keywords from PDF:', keywords);
          
          const result: OCRResult = {
            text: extractedText,
            confidence,
            language: 'en',
            keywords,
            boundingBoxes: data.ParsedResults?.[0]?.TextOverlay?.Lines?.map((line: any) => ({
              text: line.LineText,
              x: line.MinLeft,
              y: line.MinTop,
              width: line.MaxRight - line.MinLeft,
              height: line.MaxBottom - line.MinTop
            })) || []
          };
          
          resolve(result);
        } catch (error) {
          console.error('OCR.space API Error:', error);
          // If it's a CORS or network error, provide a more helpful message
          if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            reject(new Error('OCR service is currently unavailable. This might be due to network restrictions or API limitations. Please try again later or contact support.'));
          } else {
            reject(new Error('Failed to extract text from PDF. Please try again.'));
          }
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read PDF file'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Extract text from any supported file type
   * @param file - The file to process
   * @returns Promise<OCRResult> - The extracted text and metadata
   */
  async extractText(file: File): Promise<OCRResult> {
    console.log('OCR Service: extractText called with file:', file.name, file.type, file.size);
    const fileType = file.type;
    
    try {
    if (fileType.startsWith('image/')) {
        console.log('Processing as image file');
      return this.extractTextFromImage(file);
    } else if (fileType === 'application/pdf') {
        console.log('Processing as PDF file');
      return this.extractTextFromPDF(file);
    } else {
        console.log('Unsupported file type:', fileType);
      throw new Error('Unsupported file type for OCR');
      }
    } catch (error) {
      console.error('OCR extraction failed:', error);
      // If it's a network/CORS error, provide a helpful message
      if (error instanceof Error && error.message.includes('OCR service is currently unavailable')) {
        throw new Error('OCR service is currently unavailable. This might be due to network restrictions or API limitations. Please try again later or contact support.');
      }
      throw error;
    }
  }


  /**
   * Extract and categorize keywords from resume text
   * @param text - The extracted text from OCR
   * @returns Object containing categorized keywords
   */
  private extractKeywords(text: string): {
    technical: string[];
    professional: string[];
    education: string[];
    experience: string[];
    all: string[];
  } {
    console.log('Extracting keywords from text:', text);
    
    // Technical keywords - more comprehensive list
    const technicalKeywords = [
      // Programming Languages
      'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'go', 'rust', 'swift', 'kotlin',
      'php', 'ruby', 'scala', 'matlab', 'sql', 'html', 'css', 'dart', 'perl', 'bash',
      'c', 'csharp', 'objective-c', 'assembly', 'fortran', 'cobol', 'pascal', 'ada',
      
      // Frameworks & Libraries
      'react', 'angular', 'vue.js', 'vue', 'node.js', 'nodejs', 'express', 'django', 'flask', 'spring',
      'laravel', 'rails', 'asp.net', 'jquery', 'bootstrap', 'tailwind', 'sass', 'less', 'webpack',
      'babel', 'jest', 'mocha', 'chai', 'cypress', 'selenium', 'pytest', 'junit', 'next.js',
      'nuxt.js', 'ember', 'backbone', 'knockout', 'aurelia', 'polymer', 'lit', 'stencil',
      
      // Databases
      'postgresql', 'mysql', 'mongodb', 'redis', 'sqlite', 'oracle', 'sql server', 'dynamodb',
      'cassandra', 'neo4j', 'elasticsearch', 'firebase', 'supabase', 'couchdb', 'riak',
      'influxdb', 'timescaledb', 'cockroachdb', 'planetscale', 'supabase',
      
      // Cloud & DevOps
      'aws', 'amazon web services', 'azure', 'google cloud', 'gcp', 'docker', 'kubernetes', 'k8s',
      'jenkins', 'git', 'github', 'gitlab', 'bitbucket', 'ci/cd', 'terraform', 'ansible',
      'linux', 'ubuntu', 'centos', 'debian', 'nginx', 'apache', 'helm', 'prometheus',
      'grafana', 'kibana', 'logstash', 'consul', 'vault', 'nomad', 'packer',
      
      // Data Science & AI
      'tensorflow', 'pytorch', 'scikit-learn', 'sklearn', 'pandas', 'numpy', 'matplotlib',
      'seaborn', 'jupyter', 'apache spark', 'hadoop', 'tableau', 'power bi', 'plotly',
      'machine learning', 'deep learning', 'neural networks', 'nlp', 'natural language processing',
      'computer vision', 'opencv', 'scipy', 'statsmodels', 'keras', 'theano', 'caffe',
      'mxnet', 'chainer', 'pytorch lightning', 'hugging face', 'transformers',
      
      // Design & UI/UX
      'figma', 'adobe xd', 'sketch', 'photoshop', 'illustrator', 'indesign', 'principle',
      'framer', 'zeplin', 'invision', 'canva', 'adobe creative suite', 'adobe photoshop',
      'adobe illustrator', 'adobe indesign', 'adobe after effects', 'blender', 'cinema 4d',
      
      // Mobile Development
      'react native', 'flutter', 'ios', 'android', 'xcode', 'android studio', 'expo',
      'ionic', 'cordova', 'phonegap', 'xamarin', 'unity', 'unreal engine',
      
      // Other Technologies
      'rest api', 'graphql', 'microservices', 'agile', 'scrum', 'kanban', 'tdd', 'bdd',
      'blockchain', 'web3', 'ethereum', 'solidity', 'smart contracts', 'cryptocurrency',
      'bitcoin', 'hyperledger', 'ipfs', 'arweave', 'polkadot', 'cosmos', 'chainlink'
    ];

    // Professional keywords
    const professionalKeywords = [
      'software engineer', 'developer', 'programmer', 'architect', 'lead', 'senior', 'principal',
      'full-stack', 'frontend', 'backend', 'devops', 'data scientist', 'analyst', 'consultant',
      'project manager', 'product manager', 'technical lead', 'team lead', 'engineering manager',
      'scrum master', 'product owner', 'solutions architect', 'system administrator',
      'database administrator', 'security engineer', 'qa engineer', 'test engineer',
      'ui/ux designer', 'product designer', 'user experience', 'user interface',
      'business analyst', 'data analyst', 'research scientist', 'machine learning engineer',
      'cloud engineer', 'site reliability engineer', 'sre', 'platform engineer',
      'mobile developer', 'ios developer', 'android developer', 'web developer',
      'full stack developer', 'frontend developer', 'backend developer'
    ];

    // Education keywords
    const educationKeywords = [
      'bachelor', 'master', 'phd', 'doctorate', 'degree', 'certificate', 'diploma',
      'university', 'college', 'institute', 'school', 'gpa', 'graduated', 'alumni',
      'computer science', 'engineering', 'mathematics', 'physics', 'statistics',
      'information technology', 'software engineering', 'data science', 'artificial intelligence',
      'cybersecurity', 'electrical engineering', 'computer engineering', 'business administration',
      'mba', 'ms', 'ma', 'bs', 'ba', 'bsc', 'msc', 'meng', 'beng', 'associate',
      'summa cum laude', 'magna cum laude', 'cum laude', 'dean\'s list', 'honor roll',
      'scholarship', 'fellowship', 'research', 'thesis', 'dissertation', 'publication',
      'bachelor of science', 'master of science', 'doctor of philosophy', 'bachelor of arts',
      'master of arts', 'bachelor of engineering', 'master of engineering'
    ];

    // Experience keywords
    const experienceKeywords = [
      'intern', 'internship', 'co-op', 'trainee', 'apprentice', 'entry level', 'junior',
      'mid-level', 'senior', 'lead', 'principal', 'staff', 'director', 'vp', 'cto',
      'freelance', 'contract', 'consultant', 'self-employed', 'startup', 'enterprise',
      'fortune 500', 'faang', 'big tech', 'unicorn', 'scale-up', 'growth stage',
      'years of experience', 'yoe', 'leadership', 'management', 'mentoring', 'training',
      'team building', 'cross-functional', 'collaboration', 'stakeholder', 'client',
      'customer', 'user', 'agile', 'scrum', 'kanban', 'waterfall', 'lean', 'six sigma',
      'google', 'microsoft', 'apple', 'amazon', 'facebook', 'meta', 'netflix', 'uber',
      'airbnb', 'tesla', 'spacex', 'twitter', 'linkedin', 'salesforce', 'oracle',
      'ibm', 'intel', 'nvidia', 'amd', 'cisco', 'vmware', 'adobe', 'salesforce'
    ];

    // More precise keyword matching using word boundaries and case-insensitive search
    const findKeywords = (keywords: string[]) => {
      return keywords.filter(keyword => {
        const keywordLower = keyword.toLowerCase();
        // Use word boundary regex for more precise matching
        const regex = new RegExp(`\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        return regex.test(text);
      });
    };

    // Extract all keywords found in text with precise matching
    const foundTechnical = findKeywords(technicalKeywords);
    const foundProfessional = findKeywords(professionalKeywords);
    const foundEducation = findKeywords(educationKeywords);
    const foundExperience = findKeywords(experienceKeywords);

    // Combine all keywords and remove duplicates
    const allKeywords = [...foundTechnical, ...foundProfessional, ...foundEducation, ...foundExperience];
    const uniqueKeywords = [...new Set(allKeywords)];

    console.log('Found technical keywords:', foundTechnical);
    console.log('Found professional keywords:', foundProfessional);
    console.log('Found education keywords:', foundEducation);
    console.log('Found experience keywords:', foundExperience);
    console.log('Total unique keywords:', uniqueKeywords.length);

    return {
      technical: foundTechnical,
      professional: foundProfessional,
      education: foundEducation,
      experience: foundExperience,
      all: uniqueKeywords
    };
  }

}

// Export singleton instance
export const ocrService = OCRService.getInstance();
