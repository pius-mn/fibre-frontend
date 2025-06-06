import { useState, useEffect } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import { getProjectDetails, addMilestone, addDependency, clearDependency } from '../api';
import Message from '../components/Message';
import MilestoneProgress from '../components/MilestoneProgress';
import { fetchProjectData } from '../utils/fetchData';
import { formatDate } from '../utils/dateFormatter';
import LoadingSkeleton from '../components/LoadingSkeleton';

// Assume we retrieve the current user's role from context or auth


const ProjectDetails = () => {
  const [userRole, setRole] = useState(''); 
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [dependencies, setDependencies] = useState([]);
  const [selectedMilestone, setSelectedMilestone] = useState('');
  const [selectedDependency, setSelectedDependency] = useState('');
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]); // State for notifications
  const [isProjectDetailsOpen, setIsProjectDetailsOpen] = useState(false);
  const [isMilestonesOpen, setIsMilestonesOpen] = useState(false);
  const [isDependenciesOpen, setIsDependenciesOpen] = useState(false);

  const navigate = useNavigate();
  
  useEffect(() => {
    const role = localStorage.getItem('userRole') || '';
    setRole(role);
    const projectId = Number(id);
    if (!id || isNaN(projectId) || !Number.isInteger(projectId) || projectId <= 0) {
      addMessage('error', 'Invalid project ID.');
      navigate('/unauthorized'); // Or another error page or fallback
      return; // Stop further execution
    }
    const fetchData = async () => {
      try {
        setLoading(true);
        const { milestoneData, dependencyData, projectData } = await fetchProjectData(projectId);
        console.log("project data",projectData)
  
        if (!projectData) {
          addMessage('error', 'Unauthorized access or project not found.');
          return navigate('/unauthorized'); // Redirect and exit early
        }
  
        setProject(projectData);
        setMilestones(milestoneData);
        setDependencies(dependencyData);
      } catch (err) {
        addMessage('error', `Error fetching project details. Please try again.${err}`);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id, navigate]);
  

  const addMessage = (type, message) => {
    const newMessage = { id: Date.now(), type, message };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const removeMessage = (id) => {
    setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== id));
  };

  const handleAddMilestone = async () => {
    if (userRole !== 'user') {
      addMessage('error', 'You are not authorized to add milestones.');
      return;
    }
    if (!selectedMilestone) return;
    try {
      await addMilestone(id, parseInt(selectedMilestone, 10));
      addMessage('success', 'Milestone added successfully!');
      const projectData = await getProjectDetails(id);
      setProject(projectData);
      setSelectedMilestone('');
    } catch (err) {
      addMessage('error', `Error adding milestone. ${err.response?.data?.error || err}`);
    }
  };

  const handleAddDependency = async () => {
    if (userRole !== 'user') {
      addMessage('error', 'You are not authorized to add dependencies.');
      return;
    }
    if (!selectedDependency) return;
    try {
      await addDependency(id, parseInt(selectedDependency, 10));
      addMessage('success', 'Dependency added successfully!');
      const projectData = await getProjectDetails(id);
      setProject(projectData);
      setSelectedDependency('');
    } catch (err) {
      addMessage('error', `Error adding dependency. ${err.response?.data?.error || err}`);
    }
  };

  const handleClearDependency = async (dependencyId) => {
    try {
      await clearDependency(id, parseInt(dependencyId, 10));
      addMessage('success', 'Dependency cleared successfully!');
      const projectData = await getProjectDetails(id);
      setProject(projectData);
    } catch (err) {
      
      addMessage('error', `Failed to mark dependency as cleared. Please try again. ${err}`);
    }
  };

  if (loading) return <LoadingSkeleton />

  return (
    <div className="container mx-auto p-6 bg-green-50 min-h-screen">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {messages.map((msg) => (
          <Message
            key={msg.id}
            type={msg.type}
            message={msg.message}
            onClose={() => removeMessage(msg.id)}
          />
        ))}
      </div>

     {/* Project Details Section */}
<div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-t-4 border-green-500 transition-all duration-300">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-2xl font-semibold text-green-900 truncate">
      Details for: <span className="italic">{project.project?.title || 'Unnamed Project'}</span>
    </h2>
    <button
      onClick={() => setIsProjectDetailsOpen(!isProjectDetailsOpen)}
      className="flex items-center gap-2 px-3 py-1 text-green-600 hover:text-green-800 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 transition-colors"
      aria-expanded={isProjectDetailsOpen}
      aria-label={isProjectDetailsOpen ? 'Collapse project details' : 'Expand project details'}
    >
      {isProjectDetailsOpen ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      )}
      {isProjectDetailsOpen ? 'Collapse' : 'Expand'}
    </button>
  </div>
  {isProjectDetailsOpen && (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold text-green-800 mb-2">Project ID</h3>
        <p className="text-green-600">{project.project?.project_id || 'No ID available'}</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-green-800 mb-2">Created At</h3>
        <p className="text-green-600">
          {project.project?.created_at ? formatDate(project.project.created_at) : 'Date not available'}
        </p>
      </div>
      <div className="md:col-span-2">
        <h3 className="text-lg font-semibold text-green-800 mb-2">Description</h3>
        <p className="text-green-600">{project.project?.description || 'No description available'}</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-green-800 mb-2">Status</h3>
        <span
          className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
            project.milestone_id === 0
              ? 'bg-red-100 text-red-800'
              : project.milestones[0]?.completed
              ? 'bg-green-100 text-green-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {project.milestone_id === 0
            ? 'Not Started'
            : project.milestones[0]?.name
           }
        </span>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-green-800 mb-2">Distance</h3>
        <p className="text-green-600">{project.project?.distance ? `${project.project.distance} km` : 'Not specified'}</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-green-800 mb-2">Assigned To</h3>
        <p className="text-green-600">{project.project?.username || 'Unassigned'}</p>
      </div>
      <div className="md:col-span-2">
        <h3 className="text-lg font-semibold text-green-800 mb-2">Progress Overview</h3>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full transition-all duration-500"
            style={{
              width: `${(project.milestones[0]?.id / 6) * 100}%`,
              backgroundColor:
                (project.milestones[0]?.id / 6) * 100 === 100 ? '#10B981' :
                (project.milestones[0]?.id / 6) * 100 > 75 ? '#22C55E' :
                (project.milestones[0]?.id/ 6) * 100 > 50 ? '#84CC16' :
                (project.milestones[0]?.id/ 6) * 100 > 25 ? '#FBBF24' : '#EF4444',
            }}
          />
        </div>
        <p className="text-sm text-green-600 mt-2">
          {project.milestones[0]?.id} of 6 milestones reached ({((project.milestones[0]?.id / 6) * 100).toFixed(0)}%)
        </p>
      </div>
    </div>
  )}
</div>

{/* Milestones Section */}
<div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-t-4 border-green-500 transition-all duration-300">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-2xl font-semibold text-green-900">
      Milestones ({project.milestones.length}/6)
    </h2>
    <button
      onClick={() => setIsMilestonesOpen(!isMilestonesOpen)}
      className="flex items-center gap-2 px-3 py-1 text-green-600 hover:text-green-800 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 transition-colors"
      aria-expanded={isMilestonesOpen}
      aria-label={isMilestonesOpen ? 'Collapse milestones' : 'Expand milestones'}
    >
      {isMilestonesOpen ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      )}
      {isMilestonesOpen ? 'Collapse' : 'Expand'}
    </button>
  </div>
  {isMilestonesOpen && (
    <div className="space-y-4">
      {project.milestones.length === 6 && (
        <p className="text-green-700 font-medium bg-green-50 p-3 rounded-lg">
          All 6 milestones have been added.
        </p>
      )}
      {project.milestones.length < 6 && userRole === 'user' && (
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedMilestone}
              onChange={(e) => setSelectedMilestone(e.target.value)}
              className="flex-1 border border-green-300 rounded-lg p-2 text-green-800 focus:ring-2 focus:ring-green-500 focus:outline-none"
              aria-label="Select milestone to add"
            >
              <option value="">Select a milestone to add</option>
              {milestones.map((milestone) => (
                <option key={milestone.id} value={milestone.id}>
                  {milestone.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddMilestone}
              disabled={!selectedMilestone}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              aria-label="Add selected milestone"
            >
              Add Milestone
            </button>
          </div>
        </div>
      )}
      {project.milestones.length === 0 ? (
        <p className="text-green-700 text-center py-4">No milestones yet. Add the first milestone!</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {project.milestones.map((milestone) => (
            <MilestoneProgress key={milestone.id} milestone={milestone} />
          ))}
        </div>
      )}
    </div>
  )}
</div>

{/* Dependencies Section */}
<div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-t-4 border-green-500 transition-all duration-300">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-2xl font-semibold text-green-900">
      Dependencies ({project.dependencies.length})
    </h2>
    <button
      onClick={() => setIsDependenciesOpen(!isDependenciesOpen)}
      className="flex items-center gap-2 px-3 py-1 text-green-600 hover:text-green-800 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 transition-colors"
      aria-expanded={isDependenciesOpen}
      aria-label={isDependenciesOpen ? 'Collapse dependencies' : 'Expand dependencies'}
    >
      {isDependenciesOpen ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      )}
      {isDependenciesOpen ? 'Collapse' : 'Expand'}
    </button>
  </div>
  {isDependenciesOpen && (
    <div className="space-y-4">
      {project.milestones.length < 3 && userRole === 'user' && (
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedDependency}
              onChange={(e) => setSelectedDependency(e.target.value)}
              className="flex-1 border border-green-300 rounded-lg p-2 text-green-800 focus:ring-2 focus:ring-green-500 focus:outline-none"
              aria-label="Select dependency to add"
            >
              <option value="">Select a dependency to add</option>
              {dependencies.map((dependency) => (
                <option key={dependency.id} value={dependency.id}>
                  {dependency.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddDependency}
              disabled={!selectedDependency}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              aria-label="Add selected dependency"
            >
              Add Dependency
            </button>
          </div>
        </div>
      )}
      {project.dependencies.length === 0 ? (
        <p className="text-green-700 text-center py-4">No dependencies to manage.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4">
          {project.dependencies.map((dependency) => (
            <li
              key={dependency.id}
              className="p-4 border border-green-200 rounded-lg bg-green-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    dependency.cleared ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {dependency.cleared ? 'Cleared' : 'Not Cleared'}
                </span>
                <span className="text-green-800 font-medium">{dependency.name}</span>
              </div>
              {!dependency.cleared && userRole === 'user' && (
                <button
                  onClick={() => handleClearDependency(dependency.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 transition-colors"
                  aria-label={`Mark ${dependency.name} as cleared`}
                >
                  Mark as Cleared
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )}
</div>
    </div>
  );
};

export default ProjectDetails;
