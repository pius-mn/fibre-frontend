import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ProjectCard from "../ProjectCard";
import { getProjects, deleteProject } from "../../api";
import LoadingSkeleton from "../LoadingSkeleton";
import { debounce } from "../../utils/helpers";

const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [userRole, setUserRole] = useState("");
  const projectsPerPage = 6;

  const navigate = useNavigate();
  
  useEffect(() => {
    // Get user role from localStorage
    const role = localStorage.getItem("userRole") || "";
    setUserRole(role);
    
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

  // Debounced search handler
  const handleSearchChange = useCallback(
    debounce(() => {
      setCurrentPage(1);
    }, 300),
    []
  );

  const handleSearchInput = (value) => {
    setSearchTerm(value);
    handleSearchChange(value);
  };

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

  const confirmDelete = useCallback((projectId) => {
    setSelectedProject(projectId);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!selectedProject) return;
    try {
      await deleteProject(selectedProject);
      setProjects((prev) => prev.filter((project) => project.id !== selectedProject));
    } catch (err) {
      console.error(`Failed to delete project. ${err}`);
    } finally {
      setIsModalOpen(false);
    }
  }, [selectedProject]);

  const navigateToCreate = useCallback(() => navigate("/create"), [navigate]);

  if (isLoading) return <LoadingSkeleton count={projectsPerPage} />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Projects</h2>
        {userRole === "editor" && (
          <button
            onClick={navigateToCreate}
            className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg shadow-md hover:bg-green-700 transition focus:ring-2 focus:ring-green-500 focus:outline-none"
          >
            + Create Project
          </button>
        )}
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search projects..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
          value={searchTerm}
          onChange={(e) => handleSearchInput(e.target.value)}
        />
      </div>

      {paginatedProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              mode={userRole}
              onDelete={confirmDelete}
              onEdit={() => navigate(`/edit/${project.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <h3 className="text-xl font-medium text-gray-600">No projects found</h3>
          <p className="text-gray-500 mt-2">
            {searchTerm ? 'Try a different search term' : 'Create your first project'}
          </p>
          {userRole === "editor" && !searchTerm && (
            <button
              onClick={navigateToCreate}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Create Project
            </button>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center mt-8 gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const startPage = currentPage <= 3 
                ? 1 
                : Math.min(currentPage - 2, totalPages - 4);
              const pageNum = startPage + i;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-md ${
                    currentPage === pageNum
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Deletion</h3>
              <p className="text-gray-600">
                Are you sure you want to delete this project? This action cannot be undone.
              </p>
              <div className="flex justify-end mt-6 gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsList;