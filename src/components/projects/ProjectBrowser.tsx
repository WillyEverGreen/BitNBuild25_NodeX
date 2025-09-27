import React, { useState, useEffect } from 'react';
import { getProjects } from '../../services/supabaseService';
import { Project } from '../../types';
import { Search, Filter, DollarSign, Clock, Users, Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProjectBrowser: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [budgetRange, setBudgetRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await getProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Web Development', 'Mobile Development', 'Design', 'Data Science', 'Writing', 'Marketing'];
  const budgetRanges = [
    { value: 'all', label: 'All Budgets' },
    { value: '0-500', label: '$0 - $500' },
    { value: '500-1000', label: '$500 - $1000' },
    { value: '1000-2000', label: '$1000 - $2000' },
    { value: '2000+', label: '$2000+' }
  ];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
    
    let matchesBudget = true;
    if (budgetRange !== 'all') {
      const [min, max] = budgetRange.split('-').map(v => v === '' ? Infinity : parseInt(v.replace('+', '')));
      matchesBudget = project.budget >= min && (max === Infinity || project.budget <= max);
    }

    return matchesSearch && matchesCategory && matchesBudget;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Projects</h1>
        <p className="text-lg text-gray-600">
          Find projects that match your skills and interests
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="lg:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Budget Filter */}
          <div className="lg:w-48">
            <select
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {budgetRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          Showing {filteredProjects.length} of {projects.length} projects
        </p>
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option>Sort by: Newest</option>
          <option>Sort by: Budget (High to Low)</option>
          <option>Sort by: Budget (Low to High)</option>
          <option>Sort by: Deadline</option>
        </select>
      </div>

      {/* Project Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {project.title}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {project.client_name}
                  </span>
                  <span className="flex items-center">
                    <Star className="h-4 w-4 mr-1 fill-current text-yellow-500" />
                    {project.client_rating}
                  </span>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                project.category === 'Web Development' ? 'bg-blue-100 text-blue-700' :
                project.category === 'Design' ? 'bg-purple-100 text-purple-700' :
                project.category === 'Data Science' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {project.category}
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {project.skills.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
              {project.skills.length > 4 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                  +{project.skills.length - 4} more
                </span>
              )}
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center font-semibold">
                  <DollarSign className="h-4 w-4 mr-1" />
                  ${project.budget.toLocaleString()}
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {project.duration}
                </span>
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {project.bids_count} bids
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Posted {new Date(project.created_at).toLocaleDateString()}
              </div>
              <Link
                to={`/projects/${project.id}`}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
        </div>
      )}

      {!loading && filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters</p>
        </div>
      )}
    </div>
  );
};

export default ProjectBrowser;