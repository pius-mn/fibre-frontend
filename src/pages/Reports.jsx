import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import Authapi from "../utils/axios";
// Utility function for debouncing
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

const FibreOpticDashboard = () => {
  const [data, setData] = useState({ projects: [], milestoneNames: [] });
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedMilestones, setSelectedMilestones] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showActiveFilters, setShowActiveFilters] = useState(false);

  const milestoneColors = [
    '#10B981', '#3B82F6', '#FBBF24', '#8B5CF6', '#EC4899', '#F97316',
    '#06B6D4', '#EF4444', '#84CC16', '#6366F1', '#D946EF', '#F43F5E',
  ];

  // Fetch and process data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await Authapi.get('/reports');
        if (!response.data) throw new Error(`HTTP error! status: ${response.status}`);
        const apiData = await response.data;
  
        // Create milestone name mapping
        const milestoneNameMap = new Map(apiData.milestoneName.map(m => [m.id, m.name]));
  
        // Process projects with progress calculation
        const projectsWithMilestones = apiData.projects.map(project => ({
          ...project,
          progress: (project.milestone_id / 6) * 100, // Calculate progress
          milestone: {
            status: project.milestone_id === 0 ? 'not-started' : project.completed ? 'completed' : 'in-progress',
            milestone_id: project.milestone_id,
          },
          milestoneName: project.milestone_id !== 0
            ? milestoneNameMap.get(project.milestone_id) || 'Unknown Milestone'
            : 'No Milestone',
          milestoneId: project.milestone_id,
        }));
  
        setData({ projects: projectsWithMilestones, milestoneNames: apiData.milestoneName });
        setFilteredProjects(projectsWithMilestones);
  
        // Initialize all milestones as selected
        const allMilestoneIds = [...apiData.milestoneName.map(m => m.id), 0];
        setSelectedMilestones(allMilestoneIds);
      } catch (err) {
        console.error("Failed to fetch data:", err.message);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  // Debounced search handler
  const handleSearch = useMemo(() => debounce(query => setSearchQuery(query), 300), []);

  // Filter projects
  useEffect(() => {
    const filtered = data.projects.filter(project => {
      const matchesMilestone = selectedMilestones.includes(project.milestoneId);
      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.project_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.username.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesMilestone && matchesSearch;
    });

    setFilteredProjects(filtered);
    setShowActiveFilters(searchQuery || selectedMilestones.length < data.milestoneNames.length + 1);
  }, [selectedMilestones, data.projects, searchQuery, data.milestoneNames.length]);

  // Filter management
  const toggleMilestoneFilter = milestoneId =>
    setSelectedMilestones(prev =>
      prev.includes(milestoneId) ? prev.filter(id => id !== milestoneId) : [...prev, milestoneId]
    );

  const toggleAllMilestones = () => {
    const allMilestoneIds = [...data.milestoneNames.map(m => m.id), 0];
    setSelectedMilestones(selectedMilestones.length === allMilestoneIds.length ? [] : allMilestoneIds);
  };

  const clearAllFilters = () => {
    const allMilestoneIds = [...data.milestoneNames.map(m => m.id), 0];
    setSelectedMilestones(allMilestoneIds);
    setSearchQuery('');
  };

  // Memoized filter options
  const filterOptions = useMemo(() => {
    const options = data.milestoneNames.map(milestone => ({ id: milestone.id, name: milestone.name }));
    options.push({ id: 0, name: 'No Milestone' });
    return options;
  }, [data.milestoneNames]);

  // Memoized chart data
  const milestoneCountData = useMemo(() => {
    const milestoneCounts = new Map([...data.milestoneNames.map(m => [m.name, 0]), ['No Milestone', 0]]);
    data.projects.forEach(project => {
      milestoneCounts.set(project.milestoneName, (milestoneCounts.get(project.milestoneName) || 0) + 1);
    });
    return Array.from(milestoneCounts, ([name, count]) => ({ name, count }));
  }, [data.projects, data.milestoneNames]);

  const milestoneStatusData = useMemo(() => [
    { name: 'Completed', value: data.projects.filter(p => p.milestone.status === 'completed').length },
    { name: 'In Progress', value: data.projects.filter(p => p.milestone.status === 'in-progress').length },
    { name: 'Not Started', value: data.projects.filter(p => p.milestone.status === 'not-started').length },
  ], [data.projects]);

  const summaryStats = useMemo(() => ({
    totalProjects: data.projects.length,
    unassignedProjects: data.projects.filter(p => p.assigned_user_id === null).length,
    totalDistance: data.projects.reduce((sum, p) => sum + parseFloat(p.distance || 0), 0).toFixed(2),
  }), [data.projects]);

  const COLORS = ['#10B981', '#FBBF24', '#EF4444'];
  const exportToExcel = () => {
    // Map filteredProjects to Excel-compatible data
    const excelData = filteredProjects.map(project => ({
      'Project ID':project.project_code,
      'Project Name': project.title,
      'Assigned User': project.username,
      Distance: `${project.distance} km`,
      Progress: `${project.progress.toFixed(0)}%`,
      'Milestone Status': project.milestone.status === 'completed'
        ? 'Completed'
        : project.milestone.status === 'in-progress'
        ? 'In Progress'
        : 'Not Started',
      'Current Phase': project.milestoneName,
    }));
  
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Create workbook and append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Projects');
  
    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
    // Create Blob and trigger download
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'fibre_projects.xlsx');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-green-700 font-medium">Loading fibre optic projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center p-6 bg-red-50 rounded-xl max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-700 mb-2">Data Loading Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <h3 className="text-green-500 font-medium mb-1">Total Projects</h3>
            <p className="text-3xl font-bold text-green-900">{summaryStats.totalProjects}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-amber-500">
            <h3 className="text-amber-500 font-medium mb-1">Not Assigned</h3>
            <p className="text-3xl font-bold text-green-900">{summaryStats.unassignedProjects}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-cyan-500">
            <h3 className="text-cyan-500 font-medium mb-1">Total Distance</h3>
            <p className="text-3xl font-bold text-green-900">{summaryStats.totalDistance} km</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-green-900 mb-4">Projects per Milestone Phase</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={milestoneCountData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} tick={{ fontSize: '0.75rem' }} />
                  <YAxis />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '0.5rem', border: '1px solid #d1fae5' }}
                    formatter={value => [`${value} projects`, 'Count']}
                    labelFormatter={name => `Milestone: ${name}`}
                  />
                  <Legend />
                  <Bar dataKey="count" name="Project Count" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-green-900 mb-4">Milestone Status Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={milestoneStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {milestoneStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '0.5rem', border: '1px solid #d1fae5' }}
                    formatter={value => [`${value} projects`, 'Count']}
                    labelFormatter={name => `Status: ${name}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by project title or code..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                onChange={e => handleSearch(e.target.value)}
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleAllMilestones}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                {selectedMilestones.length === filterOptions.length ? 'Deselect All' : 'Select All'}
              </button>
              {showActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {filterOptions.map(({ id, name }) => {
              const isSelected = selectedMilestones.includes(id);
              const milestoneIndex = id !== 0 ? data.milestoneNames.findIndex(m => m.id === id) : -1;
              const color = milestoneColors[milestoneIndex >= 0 ? milestoneIndex % milestoneColors.length : 0];
              return (
                <button
                  key={id}
                  onClick={() => toggleMilestoneFilter(id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-green-100 text-green-800 border border-green-500'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={isSelected ? { borderColor: color, color } : {}}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>

       {/* Projects Table */}
<div className="bg-white rounded-2xl shadow-lg p-6">
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-lg font-bold text-green-900">Projects Overview</h3>
    <button
      onClick={exportToExcel}
      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
    >
      Export to Excel
    </button>
  </div>
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-green-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Project</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Assigned User</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Distance</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Progress</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Milestone Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Current Phase</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {filteredProjects.map(project => {
          const milestoneIndex = project.milestoneId !== 0
            ? data.milestoneNames.findIndex(m => m.id === project.milestoneId)
            : -1;
          const colorIndex = milestoneIndex >= 0 ? milestoneIndex % milestoneColors.length : 0;
          const color = milestoneColors[colorIndex];
          return (
            <tr key={project.project_id} className="hover:bg-green-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-green-900"><a href={`/projects/${project.project_id}`}>{project.title}</a>
                </div>
                <div className="text-sm text-gray-500">{project.project_code}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-green-900 font-medium">{project.username}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-green-900 font-medium">{project.distance} km</div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                    <div
                      className="h-2.5 rounded-full"
                      style={{
                        width: `${Math.min(project.progress, 100)}%`,
                        backgroundColor:
                          project.progress === 100 ? '#10B981' :
                          project.progress > 75 ? '#22C55E' :
                          project.progress > 50 ? '#84CC16' :
                          project.progress > 25 ? '#FBBF24' : '#EF4444',
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-green-900">{project.progress.toFixed(0)}%</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    project.milestone.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : project.milestone.status === 'in-progress'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {project.milestone.status === 'completed'
                    ? 'Completed'
                    : project.milestone.status === 'in-progress'
                    ? 'In Progress'
                    : 'Not Started'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}` }}
                >
                  {project.milestoneName}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
</div>
      </div>
    </div>
  );
};

export default FibreOpticDashboard;