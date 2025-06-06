import { useState, useEffect,useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProjectForm from './ProjectForm';
import { getProjectDetails, createProject, updateProject,getUsers } from '../../api';
import Notification from '../Notification';
import LoadingSkeleton from '../LoadingSkeleton';

const ProjectFormPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);

  // Fetch project data if editing
  useEffect(() => {
    if (!projectId) return;
  
    const abortController = new AbortController();
  
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projectData, usersData] = await Promise.all([
          getProjectDetails(projectId, abortController.signal),
          getUsers(abortController.signal),
        ]);
  
        setInitialData(projectData.project);
        setUsers(usersData || []); // Ensure users is always an array
        setError(null);
      } catch (err) {
        setError(`Failed to load data: ${err.message || err}`);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
    return () => abortController.abort();
  }, [projectId]);
  

  // Handle form submission
  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      if (projectId) {
        await updateProject(projectId, formData);
      } else {
        await createProject(formData);
      }
      navigate('/');
    } catch (err) {
      setError(`Failed to save project. Please try again. ${err}`);
    } finally {
      setLoading(false);
    }
  };
  const regularUsers = useMemo(() => {
    return users.filter(user => user.role === 'user');
  }, [users]);
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">
        {projectId ? 'Edit Project' : 'Create New Project'}
      </h2>
      
      {error && (
        <Notification type="error" message={error} />
      )}

      {loading && projectId ? (
        <LoadingSkeleton count={2} />
      ) : (
        <ProjectForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isSubmitting={loading}
          users={regularUsers}
        />
      )}
    </div>
  );
};

export default ProjectFormPage;