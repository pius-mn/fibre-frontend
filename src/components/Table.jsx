import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

export default function TableComponent({ data = [], loading }) {
  console.log(data)
  return (
    <div className="font-sans overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100 whitespace-nowrap">
          <tr>
            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Project
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Assigned To
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Progress
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 whitespace-nowrap">
          {data && data.length > 0 ? (
            data.map((project) => (
              <tr key={project.id}>
                <td className="px-4 py-4 text-sm text-gray-800">
                <Link
          to={`/projects/${project.id}`}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          {project.title || 'Untitled'}
        </Link>
               
                  
                </td>
                <td className="px-4 py-4 text-sm text-gray-800">
                  {project.assigned_user || 'Unassigned'}
                </td>
                <td className="px-4 py-4 text-sm text-gray-800">
                  <div className="flex items-center">
                    <span className="mr-3 text-sm text-green-900">
                      {Number(project.completed_milestones) || 0}/ 6
                    </span>
                    <div className="w-32 bg-green-100 rounded-full h-2">
                      <div
                        className="bg-green-600 rounded-full h-2"
                        style={{
                          width: `${
                            ((Number(project.completed_milestones) || 0) / 6) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-800">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                      (Number(project.cleared_dependencies) || 0) > 0
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {(Number(project.cleared_dependencies) || 0)} Cleared
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="py-4 text-center text-green-600">
                {loading ? 'Loading projects...' : 'No projects found'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

TableComponent.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      title: PropTypes.string,
      assigned_user: PropTypes.string,
      completed_milestones: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),
      total_milestones: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),
      cleared_dependencies: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),
    })
  ),
  loading: PropTypes.bool.isRequired,
};

TableComponent.defaultProps = {
  loading: false,
};
