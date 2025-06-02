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
    const fetchData = async () => {
      try {
        setLoading(true);
        const { milestoneData, dependencyData, projectData } = await fetchProjectData(id);
  
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
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-t-4 border-green-600">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-green-800">Details for: <i>{project.project?.title || 'Unnamed Project'} </i></h2>
          <button
            onClick={() => setIsProjectDetailsOpen(!isProjectDetailsOpen)}
            className="text-green-600 hover:text-green-800 focus:outline-none"
          >
            {isProjectDetailsOpen ? 'Collapse' : 'Expand'}
          </button>
        </div>
        {isProjectDetailsOpen && (
          <>
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2 text-green-800">Project ID</h2>
              <p className="text-green-700">
               {project.project?.project_id|| 'No ID available.'}
              </p>
            </div>
            <div className="text-sm text-green-700 mb-4">
              Created At: {project.project?.created_at ? formatDate(project.project.created_at) : 'Date not available'}
            </div>

            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2 text-green-800">Description</h2>
              <p className="text-green-700">
                {project.project?.description || 'No description available.'}
              </p>
            </div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2 text-green-800">Status</h2>
              <p className="text-green-700">
                { project.milestones[0]?.name || "Unknown"}
              </p>
            </div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2 text-green-800">Distance</h2>
              <p className="text-green-700">
                {project.project?.distance || 'Owner not specified.'} Km
              </p>
            </div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2 text-green-800">Assigned To</h2>
              <p className="text-green-700">
                {project.project?.username|| 'No team members assigned.'}
              </p>
            </div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2 text-green-800">Progress Overview</h2>
              <div className="w-full bg-green-200 rounded-full h-3">
                <div
                  className="h-3 bg-green-600 rounded-full"
                  style={{
                    width: `${(project.milestones.filter((m) => m.completed).length / 6) * 100}%`,
                  }}
                ></div>
              </div>
              <p className="text-sm text-green-700 mt-2">
                {project.milestones.filter((m) => m.completed).length} of 6 milestones completed
              </p>
            </div>
          </>
        )}
      </div>

      {/* Milestones Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-green-800">
            Milestones ({project.milestones.length}/6)
          </h2>
          <button
            onClick={() => setIsMilestonesOpen(!isMilestonesOpen)}
            className="text-green-600 hover:text-green-800 focus:outline-none"
          >
            {isMilestonesOpen ? 'Collapse' : 'Expand'}
          </button>
        </div>
        {isMilestonesOpen && (
          <>
           {project.milestones.length === 6 && (
              <p className="text-green-800 font-semibold mt-4">
                All 6 milestones have been added.
              </p>
            )}
            {project.milestones.length < 6 && userRole === 'user' && (
              <div className="m-4">
                <select
                  value={selectedMilestone}
                  onChange={(e) => setSelectedMilestone(e.target.value)}
                  className="border border-green-400 rounded-lg p-2 mb-4 w-full text-green-800"
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
                  className="bg-green-600 text-white px-4 py-2 rounded-lg w-full hover:bg-green-700 focus:outline-none"
                >
                  Add Milestone
                </button>
              </div>
            )}
            {project?.milestones.length === 0 ? (
              <p className="text-green-700">No milestones yet. Add the first milestone!</p>
            ) : (
              <div className="space-y-4">
                {project?.milestones.map((milestone) => (
                  <MilestoneProgress key={milestone.id} milestone={milestone} />
                ))}
              </div>
            )}
           
            
            
          </>
        )}
      </div>

      {/* Dependencies Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-green-800">Dependencies ({project.dependencies.length})</h2>
          <button
            onClick={() => setIsDependenciesOpen(!isDependenciesOpen)}
            className="text-green-600 hover:text-green-800 focus:outline-none"
          >
            {isDependenciesOpen ? 'Collapse' : 'Expand'}
          </button>
        </div>
        {isDependenciesOpen && (
          <>
          {project.milestones.length < 3 && userRole === 'user' && (
              <div className="m-4">
                <select
                  value={selectedDependency}
                  onChange={(e) => setSelectedDependency(e.target.value)}
                  className="border border-green-400 rounded-lg p-2 mb-4 w-full text-green-800"
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
                  className="bg-green-600 text-white px-4 py-2 rounded-lg w-full hover:bg-green-700 focus:outline-none"
                >
                  Add Dependency
                </button>
              </div>
            )}
            <ul className="space-y-2">
              {project?.dependencies.length === 0 ? (
                <li className="text-green-700">No dependencies to manage</li>
              ) : (
                project?.dependencies.map((dependency) => (
                  <li
                    key={dependency.id}
                    className="p-4 border rounded-lg bg-green-100 flex justify-between items-center"
                  >
                    <span className="text-green-800">
                      {dependency.name} - {dependency.cleared ? 'Cleared' : 'Not Cleared'}
                    </span>
                    {!dependency.cleared && (
                      <button
                        onClick={() => handleClearDependency(dependency.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none"
                      >
                        Mark as Cleared
                      </button>
                    )}
                  </li>
                ))
              )}
            </ul>
            
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
