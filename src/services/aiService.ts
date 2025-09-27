// AI Service for processing resume text with Gemini AI
// In a real implementation, this would integrate with:
// - Google Gemini API
// - OpenAI GPT API
// - Anthropic Claude API
// - Azure OpenAI Service

export interface ResumeAnalysis {
  extractedText: string;
  skills: string[];
  experience: string[];
  education: string[];
  overallRating: number; // 100-3000 scale
  skillRating: number; // 100-3000 scale
  experienceRating: number; // 100-3000 scale
  educationRating: number; // 100-3000 scale
  suggestions: string[];
  confidence: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  industryFit: string[];
  keywordMatches: number;
  technicalDepth: number;
  professionalLevel: number;
}

export class AIService {
  private static instance: AIService;
  
  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Analyze resume text using AI to extract skills, experience, and provide ratings
   * @param text - The extracted text from OCR
   * @returns Promise<ResumeAnalysis> - Comprehensive analysis of the resume
   */
  async analyzeResume(text: string): Promise<ResumeAnalysis> {
    return new Promise((resolve, reject) => {
      try {
        // Simulate AI processing time
        setTimeout(() => {
          const analysis = this.generateMockAnalysis(text);
          resolve(analysis);
        }, 3000);
      } catch (error) {
        reject(new Error('Failed to analyze resume with AI'));
      }
    });
  }

  /**
   * Generate comprehensive analysis using real OCR data
   * @param text - The resume text extracted from OCR
   * @returns ResumeAnalysis - Comprehensive analysis results
   */
  private generateMockAnalysis(text: string): ResumeAnalysis {
    // Extract skills using keyword matching
    const skills = this.extractSkills(text);
    
    // Extract experience using pattern matching
    const experience = this.extractExperience(text);
    
    // Extract education using pattern matching
    const education = this.extractEducation(text);
    
    // Calculate keyword matches and technical depth
    const keywordMatches = this.calculateKeywordMatches(text);
    const technicalDepth = this.calculateTechnicalDepth(skills, text);
    const professionalLevel = this.calculateProfessionalLevel(experience, education, text);
    
    // Calculate ratings using 100-3000 scale
    const skillRating = this.calculateSkillRating(skills, text, keywordMatches, technicalDepth);
    const experienceRating = this.calculateExperienceRating(experience, text, professionalLevel);
    const educationRating = this.calculateEducationRating(education, text);
    const overallRating = Math.round((skillRating + experienceRating + educationRating) / 3);
    
    // Generate suggestions based on analysis
    const suggestions = this.generateSuggestions(skills, experience, education, text);
    
    // Generate strengths and weaknesses
    const strengths = this.generateStrengths(skills, experience, education);
    const weaknesses = this.generateWeaknesses(skills, experience, education, text);
    
    // Determine industry fit
    const industryFit = this.determineIndustryFit(skills, experience, text);
    
    return {
      extractedText: text,
      skills,
      experience,
      education,
      overallRating: Math.max(100, Math.min(3000, overallRating)),
      skillRating: Math.max(100, Math.min(3000, skillRating)),
      experienceRating: Math.max(100, Math.min(3000, experienceRating)),
      educationRating: Math.max(100, Math.min(3000, educationRating)),
      suggestions,
      confidence: 0.85 + Math.random() * 0.1,
      summary: this.generateSummary(skills, experience, education, overallRating),
      strengths,
      weaknesses,
      industryFit,
      keywordMatches,
      technicalDepth,
      professionalLevel
    };
  }

  private extractSkills(text: string): string[] {
    const skillKeywords = [
      // Programming Languages
      'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Swift', 'Kotlin',
      'PHP', 'Ruby', 'Scala', 'MATLAB', 'SQL', 'HTML', 'CSS', 'Dart',
      
      // Frameworks & Libraries
      'React', 'Angular', 'Vue.js', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel',
      'Rails', 'ASP.NET', 'jQuery', 'Bootstrap', 'Tailwind', 'Sass', 'Less',
      
      // Databases
      'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server', 'DynamoDB',
      'Cassandra', 'Neo4j', 'Elasticsearch',
      
      // Cloud & DevOps
      'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'GitHub', 'GitLab',
      'CI/CD', 'Terraform', 'Ansible', 'Linux', 'Ubuntu', 'CentOS',
      
      // Data Science & AI
      'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn',
      'Jupyter', 'Apache Spark', 'Hadoop', 'Tableau', 'Power BI',
      
      // Design
      'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator', 'InDesign', 'Principle',
      'Framer', 'Zeplin', 'InVision',
      
      // Other
      'REST API', 'GraphQL', 'Microservices', 'Agile', 'Scrum', 'Machine Learning',
      'Deep Learning', 'Computer Vision', 'NLP', 'Blockchain', 'Web3'
    ];

    const foundSkills = skillKeywords.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    );

    // Remove duplicates and return
    return [...new Set(foundSkills)];
  }

  private extractExperience(text: string): string[] {
    const experiencePatterns = [
      /(?:Intern|Developer|Engineer|Designer|Analyst|Manager|Lead|Senior|Junior|Associate).*?(?:\d{4}|\d{1,2}\/\d{4})/gi,
      /(?:Software|Web|Mobile|Data|UX|UI|Frontend|Backend|Full-stack).*?(?:Developer|Engineer|Designer)/gi,
      /(?:Google|Microsoft|Apple|Amazon|Facebook|Meta|Netflix|Uber|Airbnb|Tesla|SpaceX).*?(?:\d{4}|\d{1,2}\/\d{4})/gi
    ];

    const experiences: string[] = [];
    experiencePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        experiences.push(...matches);
      }
    });

    return experiences.slice(0, 5); // Limit to top 5 experiences
  }

  private extractEducation(text: string): string[] {
    const educationPatterns = [
      /(?:University|College|Institute|School).*?(?:\d{4}|\d{1,2}\/\d{4})/gi,
      /(?:Bachelor|Master|PhD|Associate|Certificate).*?(?:Science|Engineering|Arts|Business)/gi,
      /(?:MIT|Stanford|Harvard|Berkeley|Caltech|CMU|Georgia Tech|UIUC|UCLA|UCSD)/gi
    ];

    const education: string[] = [];
    educationPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        education.push(...matches);
      }
    });

    return education.slice(0, 3); // Limit to top 3 education entries
  }

  private calculateKeywordMatches(text: string): number {
    const allKeywords = [
      // Technical Skills
      'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Swift', 'Kotlin',
      'React', 'Angular', 'Vue.js', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel',
      'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server',
      'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'GitHub',
      'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn',
      'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator',
      'REST API', 'GraphQL', 'Microservices', 'Machine Learning', 'Deep Learning',
      'Computer Vision', 'NLP', 'Blockchain', 'Web3',
      
      // Professional Terms
      'Software Engineer', 'Developer', 'Programmer', 'Architect', 'Lead', 'Senior', 'Principal',
      'Full-stack', 'Frontend', 'Backend', 'DevOps', 'Data Scientist', 'Analyst',
      'Project Manager', 'Product Manager', 'Technical Lead', 'Team Lead',
      'Agile', 'Scrum', 'CI/CD', 'Test Driven Development', 'Code Review',
      
      // Experience Indicators
      'Experience', 'Years', 'Intern', 'Internship', 'Freelance', 'Contract',
      'Startup', 'Enterprise', 'Scale', 'Performance', 'Optimization',
      'Leadership', 'Mentoring', 'Training', 'Management', 'Coordination',
      
      // Education Terms
      'Bachelor', 'Master', 'PhD', 'Doctorate', 'Degree', 'Certificate', 'Diploma',
      'University', 'College', 'Institute', 'School', 'GPA', 'Graduated',
      'Computer Science', 'Engineering', 'Mathematics', 'Physics', 'Statistics',
      
      // Achievement Terms
      'Achieved', 'Improved', 'Increased', 'Reduced', 'Optimized', 'Developed',
      'Created', 'Built', 'Designed', 'Implemented', 'Deployed', 'Launched',
      'Award', 'Recognition', 'Honor', 'Scholarship', 'Grant', 'Publication'
    ];
    
    const textLower = text.toLowerCase();
    const matches = allKeywords.filter(keyword => 
      textLower.includes(keyword.toLowerCase())
    ).length;
    
    return matches;
  }

  private calculateTechnicalDepth(skills: string[], text: string): number {
    let depth = 0;
    
    // Programming languages (base depth)
    const languages = ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Go', 'Rust'];
    const languageCount = skills.filter(skill => 
      languages.some(lang => skill.toLowerCase().includes(lang.toLowerCase()))
    ).length;
    depth += languageCount * 50;
    
    // Frameworks and libraries
    const frameworks = ['React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring'];
    const frameworkCount = skills.filter(skill => 
      frameworks.some(fw => skill.toLowerCase().includes(fw.toLowerCase()))
    ).length;
    depth += frameworkCount * 40;
    
    // Cloud and DevOps
    const cloudSkills = ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD'];
    const cloudCount = skills.filter(skill => 
      cloudSkills.some(cloud => skill.toLowerCase().includes(cloud.toLowerCase()))
    ).length;
    depth += cloudCount * 60;
    
    // Data Science and AI
    const aiSkills = ['TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning', 'Pandas', 'NumPy'];
    const aiCount = skills.filter(skill => 
      aiSkills.some(ai => skill.toLowerCase().includes(ai.toLowerCase()))
    ).length;
    depth += aiCount * 70;
    
    // Database skills
    const dbSkills = ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQL', 'NoSQL'];
    const dbCount = skills.filter(skill => 
      dbSkills.some(db => skill.toLowerCase().includes(db.toLowerCase()))
    ).length;
    depth += dbCount * 30;
    
    return Math.min(1000, depth);
  }

  private calculateProfessionalLevel(experience: string[], education: string[], text: string): number {
    let level = 0;
    
    // Experience level indicators
    const seniorTerms = ['Senior', 'Lead', 'Principal', 'Architect', 'Manager', 'Director'];
    const hasSeniorRole = experience.some(exp => 
      seniorTerms.some(term => exp.toLowerCase().includes(term.toLowerCase()))
    );
    if (hasSeniorRole) level += 300;
    
    // Years of experience (rough estimation)
    const yearPatterns = [
      /\d+\+?\s*years?/gi,
      /\d+\+?\s*yrs?/gi,
      /(\d{4})\s*-\s*(\d{4})/g
    ];
    const yearMatches = yearPatterns.reduce((count, pattern) => {
      const matches = text.match(pattern);
      return count + (matches ? matches.length : 0);
    }, 0);
    level += Math.min(500, yearMatches * 100);
    
    // Education level
    if (education.some(edu => edu.toLowerCase().includes('phd') || edu.toLowerCase().includes('doctorate'))) {
      level += 400;
    } else if (education.some(edu => edu.toLowerCase().includes('master'))) {
      level += 300;
    } else if (education.some(edu => edu.toLowerCase().includes('bachelor'))) {
      level += 200;
    }
    
    // Prestigious companies
    const prestigiousCompanies = ['Google', 'Microsoft', 'Apple', 'Amazon', 'Facebook', 'Meta', 'Netflix', 'Uber'];
    const hasPrestigiousExp = experience.some(exp => 
      prestigiousCompanies.some(company => exp.toLowerCase().includes(company.toLowerCase()))
    );
    if (hasPrestigiousExp) level += 200;
    
    // Leadership indicators
    const leadershipTerms = ['led', 'managed', 'mentored', 'trained', 'coordinated', 'supervised'];
    const hasLeadership = leadershipTerms.some(term => text.toLowerCase().includes(term));
    if (hasLeadership) level += 150;
    
    return Math.min(1000, level);
  }

  private calculateSkillRating(skills: string[], text: string, keywordMatches: number, technicalDepth: number): number {
    let rating = 100; // Base rating
    
    // Skill count factor (0-800 points)
    const skillCount = skills.length;
    if (skillCount >= 20) rating += 800;
    else if (skillCount >= 15) rating += 600;
    else if (skillCount >= 10) rating += 400;
    else if (skillCount >= 7) rating += 300;
    else if (skillCount >= 5) rating += 200;
    else if (skillCount >= 3) rating += 100;
    
    // Technical depth factor (0-500 points)
    rating += Math.min(500, technicalDepth / 2);
    
    // Keyword matches factor (0-300 points)
    rating += Math.min(300, keywordMatches * 10);
    
    // High-value skills bonus (0-400 points)
    const highValueSkills = [
      'React', 'Angular', 'Vue', 'Node.js', 'Python', 'TypeScript', 'Java',
      'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins',
      'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning',
      'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'REST API'
    ];
    const highValueCount = skills.filter(skill => 
      highValueSkills.some(hv => skill.toLowerCase().includes(hv.toLowerCase()))
    ).length;
    rating += Math.min(400, highValueCount * 50);
    
    // Skill diversity bonus (0-200 points)
    const categories = {
      languages: ['Python', 'JavaScript', 'Java', 'C++', 'Go', 'Rust'],
      frameworks: ['React', 'Angular', 'Vue', 'Django', 'Flask', 'Spring'],
      databases: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis'],
      cloud: ['AWS', 'Azure', 'Google Cloud', 'Docker'],
      ai: ['TensorFlow', 'PyTorch', 'Machine Learning', 'Pandas']
    };
    
    const categoryCount = Object.values(categories).reduce((count, category) => {
      const hasCategorySkill = category.some(skill => 
        skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
      );
      return count + (hasCategorySkill ? 1 : 0);
    }, 0);
    
    rating += Math.min(200, categoryCount * 40);
    
    return Math.max(100, Math.min(3000, rating));
  }

  private calculateExperienceRating(experience: string[], text: string, professionalLevel: number): number {
    let rating = 100; // Base rating
    
    // Experience count factor (0-600 points)
    const expCount = experience.length;
    if (expCount >= 8) rating += 600;
    else if (expCount >= 6) rating += 500;
    else if (expCount >= 4) rating += 400;
    else if (expCount >= 3) rating += 300;
    else if (expCount >= 2) rating += 200;
    else if (expCount >= 1) rating += 100;
    
    // Professional level factor (0-800 points)
    rating += Math.min(800, professionalLevel * 0.8);
    
    // Prestigious companies bonus (0-400 points)
    const prestigiousCompanies = ['Google', 'Microsoft', 'Apple', 'Amazon', 'Facebook', 'Meta', 'Netflix', 'Uber', 'Airbnb', 'Tesla'];
    const prestigiousCount = experience.filter(exp => 
      prestigiousCompanies.some(company => exp.toLowerCase().includes(company.toLowerCase()))
    ).length;
    rating += Math.min(400, prestigiousCount * 200);
    
    // Leadership roles bonus (0-300 points)
    const leadershipKeywords = ['Lead', 'Senior', 'Principal', 'Manager', 'Director', 'Architect', 'Head'];
    const leadershipCount = experience.filter(exp => 
      leadershipKeywords.some(keyword => exp.toLowerCase().includes(keyword.toLowerCase()))
    ).length;
    rating += Math.min(300, leadershipCount * 150);
    
    // Internship/Entry level experience (0-200 points)
    const internshipKeywords = ['Intern', 'Internship', 'Co-op', 'Trainee'];
    const hasInternship = experience.some(exp => 
      internshipKeywords.some(keyword => exp.toLowerCase().includes(keyword.toLowerCase()))
    );
    if (hasInternship) rating += 200;
    
    // Freelance/Contract experience (0-150 points)
    const freelanceKeywords = ['Freelance', 'Contract', 'Consultant', 'Self-employed'];
    const hasFreelance = experience.some(exp => 
      freelanceKeywords.some(keyword => exp.toLowerCase().includes(keyword.toLowerCase()))
    );
    if (hasFreelance) rating += 150;
    
    return Math.max(100, Math.min(3000, rating));
  }

  private calculateEducationRating(education: string[], text: string): number {
    let rating = 100; // Base rating
    
    // Education count factor (0-300 points)
    const eduCount = education.length;
    if (eduCount >= 3) rating += 300;
    else if (eduCount >= 2) rating += 200;
    else if (eduCount >= 1) rating += 100;
    
    // Prestigious universities bonus (0-800 points)
    const prestigiousUniversities = [
      'MIT', 'Stanford', 'Harvard', 'Berkeley', 'Caltech', 'CMU', 'Princeton', 'Yale',
      'Columbia', 'Chicago', 'Cornell', 'Penn', 'Brown', 'Dartmouth', 'Duke',
      'Northwestern', 'Johns Hopkins', 'Rice', 'Vanderbilt', 'WashU', 'Emory',
      'Georgetown', 'Carnegie Mellon', 'Georgia Tech', 'UCLA', 'UCSD', 'UCSB',
      'UCI', 'UCD', 'UCSF', 'UCSD', 'UCSB', 'UCI', 'UCD', 'UCSF'
    ];
    const prestigiousCount = education.filter(edu => 
      prestigiousUniversities.some(uni => edu.toLowerCase().includes(uni.toLowerCase()))
    ).length;
    rating += Math.min(800, prestigiousCount * 400);
    
    // Advanced degrees bonus (0-600 points)
    const advancedDegrees = ['PhD', 'Doctorate', 'Doctor of Philosophy'];
    const hasPhD = education.some(edu => 
      advancedDegrees.some(degree => edu.toLowerCase().includes(degree.toLowerCase()))
    );
    if (hasPhD) rating += 600;
    
    const masterDegrees = ['Master', 'Masters', 'MBA', 'MS', 'MA', 'MEng', 'MSc'];
    const hasMasters = education.some(edu => 
      masterDegrees.some(degree => edu.toLowerCase().includes(degree.toLowerCase()))
    );
    if (hasMasters) rating += 400;
    
    // Technical fields bonus (0-400 points)
    const technicalFields = [
      'Computer Science', 'Software Engineering', 'Data Science', 'Artificial Intelligence',
      'Machine Learning', 'Cybersecurity', 'Information Technology', 'Engineering',
      'Mathematics', 'Statistics', 'Physics', 'Electrical Engineering', 'Computer Engineering'
    ];
    const technicalFieldCount = education.filter(edu => 
      technicalFields.some(field => edu.toLowerCase().includes(field.toLowerCase()))
    ).length;
    rating += Math.min(400, technicalFieldCount * 200);
    
    // GPA indicators (0-200 points)
    const gpaPatterns = [
      /GPA[:\s]*(\d+\.?\d*)/gi,
      /Grade[:\s]*Point[:\s]*Average[:\s]*(\d+\.?\d*)/gi,
      /(\d+\.?\d*)\s*\/\s*4\.?0?/gi
    ];
    const gpaMatches = gpaPatterns.reduce((matches, pattern) => {
      const found = text.match(pattern);
      return matches + (found ? found.length : 0);
    }, 0);
    if (gpaMatches > 0) rating += 200;
    
    // Academic achievements (0-300 points)
    const achievementTerms = [
      'Summa Cum Laude', 'Magna Cum Laude', 'Cum Laude', 'Dean\'s List',
      'Honor Roll', 'Scholarship', 'Fellowship', 'Research', 'Thesis',
      'Dissertation', 'Publication', 'Conference', 'Award', 'Recognition'
    ];
    const achievementCount = achievementTerms.filter(term => 
      text.toLowerCase().includes(term.toLowerCase())
    ).length;
    rating += Math.min(300, achievementCount * 50);
    
    return Math.max(100, Math.min(3000, rating));
  }

  private generateSuggestions(skills: string[], experience: string[], education: string[], text: string): string[] {
    const suggestions: string[] = [];
    
    if (skills.length < 5) {
      suggestions.push('Add more technical skills to showcase your capabilities');
    }
    
    if (experience.length < 2) {
      suggestions.push('Include more work experience or internships');
    }
    
    if (!text.toLowerCase().includes('project')) {
      suggestions.push('Add a projects section to highlight your work');
    }
    
    if (!text.toLowerCase().includes('achievement') && !text.toLowerCase().includes('accomplish')) {
      suggestions.push('Include quantifiable achievements and metrics');
    }
    
    if (skills.length > 0 && !skills.some(skill => ['React', 'Angular', 'Vue'].includes(skill))) {
      suggestions.push('Consider learning modern frontend frameworks like React, Angular, or Vue.js');
    }
    
    if (!text.toLowerCase().includes('github') && !text.toLowerCase().includes('portfolio')) {
      suggestions.push('Add links to your GitHub profile and portfolio');
    }
    
    return suggestions.slice(0, 5);
  }

  private generateStrengths(skills: string[], experience: string[], education: string[]): string[] {
    const strengths: string[] = [];
    
    if (skills.length >= 8) {
      strengths.push('Strong technical skill set');
    }
    
    if (experience.length >= 3) {
      strengths.push('Solid work experience');
    }
    
    if (education.some(edu => ['MIT', 'Stanford', 'Harvard', 'Berkeley'].some(uni => 
      edu.toLowerCase().includes(uni.toLowerCase())))) {
      strengths.push('Prestigious educational background');
    }
    
    if (skills.some(skill => ['React', 'Node.js', 'Python', 'AWS'].includes(skill))) {
      strengths.push('In-demand technology expertise');
    }
    
    if (experience.some(exp => ['Lead', 'Senior', 'Manager'].some(role => 
      exp.toLowerCase().includes(role.toLowerCase())))) {
      strengths.push('Leadership experience');
    }
    
    return strengths;
  }

  private generateWeaknesses(skills: string[], experience: string[], education: string[], text: string): string[] {
    const weaknesses: string[] = [];
    
    if (skills.length < 5) {
      weaknesses.push('Limited technical skills');
    }
    
    if (experience.length < 2) {
      weaknesses.push('Minimal work experience');
    }
    
    if (!text.toLowerCase().includes('project')) {
      weaknesses.push('No projects showcased');
    }
    
    if (!skills.some(skill => ['Git', 'Docker', 'AWS'].includes(skill))) {
      weaknesses.push('Missing DevOps/Cloud skills');
    }
    
    return weaknesses;
  }

  private determineIndustryFit(skills: string[], experience: string[], text: string): string[] {
    const industryFit: string[] = [];
    
    const techSkills = ['React', 'Node.js', 'Python', 'JavaScript', 'AWS', 'Docker'];
    if (techSkills.some(skill => skills.includes(skill))) {
      industryFit.push('Software Development');
    }
    
    const dataSkills = ['Python', 'R', 'SQL', 'Machine Learning', 'TensorFlow', 'Pandas'];
    if (dataSkills.some(skill => skills.includes(skill))) {
      industryFit.push('Data Science');
    }
    
    const designSkills = ['Figma', 'Adobe', 'Sketch', 'UI', 'UX'];
    if (designSkills.some(skill => skills.includes(skill))) {
      industryFit.push('Design');
    }
    
    const mobileSkills = ['React Native', 'Flutter', 'iOS', 'Android', 'Swift', 'Kotlin'];
    if (mobileSkills.some(skill => skills.includes(skill))) {
      industryFit.push('Mobile Development');
    }
    
    return industryFit.length > 0 ? industryFit : ['General Technology'];
  }

  private generateSummary(skills: string[], experience: string[], education: string[], overallRating: number): string {
    const skillCount = skills.length;
    const expCount = experience.length;
    const eduCount = education.length;
    
    let summary = `This candidate shows `;
    
    if (overallRating >= 4.0) {
      summary += 'strong potential with ';
    } else if (overallRating >= 3.0) {
      summary += 'good potential with ';
    } else {
      summary += 'developing skills with ';
    }
    
    summary += `${skillCount} technical skills, ${expCount} work experiences, and ${eduCount} education entries. `;
    
    if (skills.length >= 8) {
      summary += 'The technical skill set is comprehensive and includes modern technologies. ';
    }
    
    if (experience.length >= 3) {
      summary += 'Work experience demonstrates practical application of skills. ';
    }
    
    summary += 'Overall, this candidate would be a good fit for technology roles.';
    
    return summary;
  }
}

// Export singleton instance
export const aiService = AIService.getInstance();
