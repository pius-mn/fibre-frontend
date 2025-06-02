import Authapi from "../utils/axios";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";

const Reports = () => {
  const [reportType, setReportType] = useState("projects");
  const [selectedValue, setSelectedValue] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(""); // New state for duration
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState({
    projects: [],
    users: [],
    milestones: [],
    dependencies: [],
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportError, setReportError] = useState(null);

  // Reset selections when report type changes
  useEffect(() => {
    setSelectedValue("");
    setSelectedProject("");
    setSelectedDuration(""); // Reset duration on report type change
  }, [reportType]);

  // Fetch dropdown data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, usersRes, milestonesRes, dependenciesRes] = await Promise.all([
          Authapi.get("/projects"),
          Authapi.get("/user"),
          Authapi.get("/milestones"),
          Authapi.get("/dependencies"),
        ]);
        
        setOptions({
          projects: projectsRes.data,
          users: usersRes.data,
          milestones: milestonesRes.data,
          dependencies: dependenciesRes.data,
        });
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load dropdown options. Please try again later.");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch report based on selection
  const fetchReport = useCallback(async () => {
    setLoading(true);
    setReportError(null);
    
    try {
      // Validate required fields
      if (reportType === "project_duration_by_milestone" && !selectedDuration) {
        throw new Error("Please enter a duration");
      }

      const response = await Authapi.get("/reports", {
        params: { 
          type: reportType, 
          value: selectedValue,
          duration: reportType === "project_duration_by_milestone" ? selectedDuration : undefined,
          projectId: selectedProject 
        },
      });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching report:", error);
      setReportError(error.response?.data?.error || error.message);
      setData([]);
    }
    setLoading(false);
  }, [reportType, selectedValue, selectedProject, selectedDuration]);

  // Dynamic dropdown options with default selection
  const getDropdownOptions = () => {
    const defaultOption = (label) => (
      <option key="default" value="" disabled>
        Select {label}
      </option>
    );

    switch (reportType) {
      case "projects_by_user":
        return [
          defaultOption("user"),
          ...options.users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          )),
        ];
      case "projects_by_milestone":
      case "project_duration_by_milestone": // Include duration report in milestones
        return [
          defaultOption("milestone"),
          ...options.milestones.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          )),
        ];
      case "project_by_dependencies":
        return [
          defaultOption("dependency"),
          ...options.dependencies.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          )),
        ];
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">Project Reports</h2>

      {/* Error Messages */}
      {error && <div className="text-red-600 mb-4">{error}</div>}

      {/* Report Type Selection */}
      <label htmlFor="reportType" className="block font-semibold mb-1">
        Select Report Type:
      </label>
      <select
        id="reportType"
        value={reportType}
        onChange={(e) => setReportType(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      >
        <option value="projects">All Projects</option>
        <option value="single_project">Single Project</option>
        <option value="projects_by_user">Projects by User</option>
        <option value="projects_by_milestone">Projects by Milestone</option>
        <option value="project_by_dependencies">Projects by Dependency Not Cleared</option>
        <option value="project_duration_by_milestone">Project Duration by Milestone</option>
      </select>

      {/* Project Selection */}
      {reportType === "single_project" && (
        <>
          <label htmlFor="projectSelect" className="block font-semibold mb-1">
            Select Project:
          </label>
          <select
            id="projectSelect"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="border p-2 rounded w-full mb-4"
            disabled={initialLoading}
          >
            <option value="">Select a project</option>
            {initialLoading ? (
              <option disabled>Loading projects...</option>
            ) : (
              options.projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))
            )}
          </select>
        </>
      )}

      {/* Dynamic Parameter Selection */}
      {reportType !== "projects" && reportType !== "single_project" && (
        <>
          <label htmlFor="dynamicSelect" className="block font-semibold mb-1">
            Select Value:
          </label>
          <select
            id="dynamicSelect"
            value={selectedValue}
            onChange={(e) => setSelectedValue(e.target.value)}
            className="border p-2 rounded w-full mb-4"
            disabled={initialLoading}
          >
            {initialLoading ? (
              <option disabled>Loading options...</option>
            ) : (
              getDropdownOptions()
            )}
          </select>
        </>
      )}

      {/* Duration Input for Project Duration report */}
      {reportType === "project_duration_by_milestone" && (
        <>
          <label htmlFor="durationInput" className="block font-semibold mb-1">
            Minimum Duration (Days):
          </label>
          <input
            id="durationInput"
            type="number"
            min="1"
            value={selectedDuration}
            onChange={(e) => setSelectedDuration(e.target.value)}
            className="border p-2 rounded w-full mb-4"
            placeholder="Enter minimum days"
          />
        </>
      )}

      {/* Fetch Button */}
      <button
        type="button"
        onClick={fetchReport}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        disabled={
          loading || 
          initialLoading ||
          (reportType !== "projects" && 
            (reportType !== "single_project" && !selectedValue) ||
          (reportType === "single_project" && !selectedProject) ||
          (reportType === "project_duration_by_milestone" && !selectedDuration))
        }
      >
        {loading ? "Loading..." : "Fetch Report"}
      </button>

      {/* Error Message for Reports */}
      {reportError && <div className="text-red-600 mt-4">{reportError}</div>}

      {/* Results Table */}
      {!loading && data.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-4">Report Results</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-4 py-2 text-left">#</th>
                  {Object.keys(data[0])
                    .filter((key) => key !== "id")
                    .map((key) => (
                      <th key={key} className="border px-4 py-2 text-left capitalize">
                        {key.replace(/_/g, " ")}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="border px-4 py-2">{data.indexOf(row) + 1}</td>
                    {Object.entries(row)
                      .filter(([key]) => key !== "id")
                      .map(([key, value]) => (
                        <td key={key} className="border px-4 py-2">
                          {key === "title" ? (
                            <Link
                              to={`/projects/${row.id}`}
                              className="text-blue-600 underline hover:text-blue-800"
                            >
                              {value}
                            </Link>
                          ) : (
                            value
                          )}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && data.length === 0 && !reportError && (
        <p className="text-gray-500 mt-4">No data available</p>
      )}
    </div>
  );
};

export default Reports;