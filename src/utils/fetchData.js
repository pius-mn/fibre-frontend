import { getProjectDetails, getMilestones, getDependencies } from '../api';
export const fetchProjectData = async (id) => {
    const [milestoneData, dependencyData, projectData] = await Promise.all([
      getMilestones(),
      getDependencies(),
      getProjectDetails(id),
    ]);
  
    return { milestoneData, dependencyData, projectData };
  };