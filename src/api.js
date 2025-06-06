import Authapi from './utils/axios'

// General fetch function to handle errors
const fetchData = async (url, method = 'GET', body = null) => {
  
  const config = {
    url,
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  // Only attach body if it's not null
  if (body !== null) {
    config.data = body;
  }
  try {
    const response = await Authapi(config);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    throw error;
  }
};


// Get all projects
export const getProjects = async () => {
  return fetchData(`/projects`);
};

// Get project details by ID
export const getProjectDetails = async (projectId) => {
  return fetchData(`/projects/${projectId}`);
};
// Get Users
export const getUsers = async () => {
  return fetchData(`/user`);
};
// Get all milestones for a project
export const getProjectMilestones = async (projectId) => {
  return fetchData(`/projects/${projectId}/milestones`);
};

// Get all dependencies for a project
export const getProjectDependencies = async (projectId) => {
  return fetchData(`/projects/${projectId}/dependencies`);
};

// Get all milestones (global)
export const getMilestones = async () => {
  return fetchData(`/milestones`);
};

// Get all dependencies (global)
export const getDependencies = async () => {
  return fetchData(`/dependencies`);
};

// Add a milestone to a project
export const addMilestone = async (projectId, milestoneId) => {
  const body = { milestoneId };
  
  const url = `/projects/${projectId}/milestones`;
  return fetchData(url, 'POST', body);
};
export const updateProject = async (projectId,body) => {
  
  console.log(body)
  const url = `/projects/${projectId}`;
  return fetchData(url, 'PUT',body);
};
export const createProject = async (body) => {
  
  const url = `/projects`;
  return fetchData(url, 'POST', body);
};
export const deleteProject = async (projectId) => {
   const url = `/projects/${projectId}`;
   
  return fetchData(url, 'DELETE');
};

// Add a dependency to a project
export const addDependency = async (projectId, dependencyId) => {
  const body = { dependencyId };
  const url = `/projects/${projectId}/dependencies`;
  
  return fetchData(url, 'POST', body);
};
// clearDependency function in api.js
export const clearDependency = async (projectId, dependencyId) => {
  const response = await Authapi(`/projects/${projectId}/dependencies/${dependencyId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  

  return response;
};
