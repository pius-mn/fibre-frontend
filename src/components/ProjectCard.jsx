import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const ProjectCard = ({ 
  project, 
  mode = 'user', 
  onDelete, 
  onEdit
}) => {
  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow h-full flex flex-col">
      {/* Project Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold">{project.title}</h3>
      </div>

      {/* Project Details */}
      <div className="flex-1">
        <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
        
        {/* Additional Details */}
        <div className="space-y-2 text-sm text-gray-500">
          {project.startDate && (
            <p>Start Date: {new Date(project.startDate).toLocaleDateString()}</p>
          )}
          {project.endDate && (
            <p>Due Date: {new Date(project.endDate).toLocaleDateString()}</p>
          )}
          {project.owner && (
            <p>Owner: {project.owner.name}</p>
          )}
        </div>
      </div>

      {/* Action Section */}
      <div className="mt-4 pt-4 border-t flex justify-between items-center">
        <Link
          to={`/projects/${project.id}`}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          View Full Details →
        </Link>
        
        {mode === 'editor' && (
  <div className="flex gap-2">
    <button
      onClick={() => onEdit?.(project.id)}
      className="text-blue-600 hover:text-blue-800 text-sm"
    >
      Edit
    </button>
    <button 
      onClick={() => onDelete?.(project.id)}
      className="text-red-600 hover:text-red-800 text-sm"
    >
      Delete
    </button>
  </div>
)}

{mode === 'admin' && (
  <div className="flex gap-2">
    <button
     onClick={() => onEdit?.(project.id)}
      className="text-green-600 hover:text-green-800 text-sm"
    >
      Assign
    </button>
  </div>
)}

      </div>
    </div>
  );
};

ProjectCard.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    owner: PropTypes.shape({
      name: PropTypes.string
    })
  }).isRequired,
  mode: PropTypes.oneOf(['user', 'editor','admin']),
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
 
};

export default ProjectCard;