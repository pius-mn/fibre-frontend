import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ProjectCard from "../ProjectCard";
import { getProjects, deleteProject } from "../../api";
import LoadingSkeleton from "../LoadingSkeleton";

const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 6;

  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole") || "";

  useEffect(() => {
    const abortController = new AbortController();
    const fetchProjects = async () => {
      try {
        const data = await getProjects(abortController.signal);
        setProjects(data);
      } catch (err) {
        console.error(err.message || "Failed to load projects");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
    return () => abortController.abort();
  }, []);

  // Debounced search effect to improve performance
  useEffect(() => {
    const delayDebounce = setTimeout(() => setCurrentPage(1), 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  // Filter projects based on search term
  const filteredProjects = useMemo(() => {
    return projects.filter((project) =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, projects]);

  // Paginate projects
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * projectsPerPage;
    return filteredProjects.slice(start, start + projectsPerPage);
  }, [currentPage, filteredProjects]);

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  const confirmDelete = (projectId) => {
    setSelectedProject(projectId);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedProject) return;
    try {
      await deleteProject(selectedProject);
      setProjects((prev) => prev.filter((project) => project.id !== selectedProject));
    } catch (err) {
      console.error(`Failed to delete project. ${err}`);
    } finally {
      setIsModalOpen(false);
    }
  };

  if (isLoading) return <LoadingSkeleton count={4} />;

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Projects</h2>
        {userRole === "editor" && (
          <button
            onClick={() => navigate("/create")}
            className="px-5 py-2 bg-green-600 text-white font-medium rounded-lg shadow-md hover:bg-green-700 transition"
          >
            + Create Project
          </button>
        )}
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search projects..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {paginatedProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              mode={userRole}
              onDelete={() => confirmDelete(project.id)}
              onEdit={() => navigate(`/edit/${project.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center mt-6">
          <p className="text-gray-500">No projects found.</p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-80">
            <h2 className="text-lg font-semibold text-gray-800">Confirm Deletion</h2>
            <p className="text-gray-600 mt-2">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex justify-end mt-4 gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsList;
