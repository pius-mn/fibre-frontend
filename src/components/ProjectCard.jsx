import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { 
  UserIcon, 
  UserPlusIcon, 
  CalendarIcon, 
  MapPinIcon,
  PencilIcon,
  TrashIcon,
  ArrowRightIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

const ProjectCard = ({ 
  project, 
  mode = 'user', 
  onDelete, 
  onEdit
}) => {
  const isAssigned = !!project.assigned_user_id;
  
  return (
    <div className={`border-2 rounded-xl p-5 hover:shadow-lg transition-all duration-300 h-full flex flex-col
      ${isAssigned ? 'border-green-300' : 'border-amber-300'}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
            ${isAssigned 
              ? 'bg-green-100 text-green-800' 
              : 'bg-amber-100 text-amber-800'
            }`}
          >
            {isAssigned ? (
              <>
                <UserIcon className="h-4 w-4 mr-1" />
                Assigned
              </>
            ) : (
              <>
                <UserPlusIcon className="h-4 w-4 mr-1" />
                Unassigned
              </>
            )}
          </span>
          
          {/* Priority Badge */}
          {project.priority && (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs ${
              project.priority === 'High' 
                ? 'bg-red-100 text-red-800' 
                : project.priority === 'Medium'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-gray-100 text-gray-800'
            }`}>
              {project.priority} Priority
            </span>
          )}
        </div>
        
        {/* Project ID */}
        {project.project_id && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            ID: {project.project_id}
          </span>
        )}
      </div>

      {/* Project Header */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800">{project.title}</h3>
      </div>

      {/* Project Details */}
      <div className="flex-1 mb-5">
     
        
        {/* Additional Details */}
        <div className="space-y-3 text-sm text-gray-600">
          {project.created_at && (
            <p className="flex items-center">
              <CalendarIcon className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
              <span className="font-medium mr-2">Created:</span>
              {new Date(project.created_at).toLocaleDateString()}
            </p>
          )}
          
          {project.distance && (
            <p className="flex items-center">
              <MapPinIcon className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
              <span className="font-medium mr-2">Distance:</span>
              {project.distance} km
            </p>
          )}
          
          {isAssigned ? (
            <p className="flex items-center">
              <UserIcon className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
              <span className="font-medium mr-2">Assigned To:</span>
              <span className="flex items-center text-green-600 font-medium">
                <CheckBadgeIcon className="h-4 w-4 mr-1" />
                {project.assigned_username || `User #${project.assigned_user_id}`}
              </span>
            </p>
          ) : (
            <p className="flex items-center">
              <UserPlusIcon className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
              <span className="font-medium mr-2">Status:</span>
              <span className="text-amber-600 font-medium">
                Awaiting assignment
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Action Section */}
      <div className="mt-auto pt-4 border-t border-gray-200 flex justify-between items-center">
        <Link
          to={`/projects/${project.id}`}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center group"
        >
          View Details
          <ArrowRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </Link>
        
        {mode === 'editor' && (
          <div className="flex gap-3">
            <button
              onClick={() => onEdit?.(project.id)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center group"
            >
              <PencilIcon className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" />
              Edit
            </button>
            <button 
              onClick={() => onDelete?.(project.id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center group"
            >
              <TrashIcon className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" />
              Delete
            </button>
          </div>
        )}

        {mode === 'admin' && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit?.(project.id)}
              className={`text-sm font-medium px-3 py-1.5 rounded-md flex items-center transition-colors group ${
                isAssigned
                  ? 'text-green-700 bg-green-100 hover:bg-green-200'
                  : 'text-amber-700 bg-amber-100 hover:bg-amber-200'
              }`}
            >
              {isAssigned ? (
                <>
                  <UserIcon className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" />
                  Reassign
                </>
              ) : (
                <>
                  <UserPlusIcon className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" />
                  Assign
                </>
              )}
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
    project_id: PropTypes.string,
    title: PropTypes.string.isRequired,
    created_at: PropTypes.string,
    distance: PropTypes.string,
    assigned_user_id: PropTypes.number,
    assigned_username: PropTypes.string, // Added prop type for username
    priority: PropTypes.string
  }).isRequired,
  mode: PropTypes.oneOf(['user', 'editor', 'admin']),
  onDelete: PropTypes.func,
  onEdit: PropTypes.func
};

export default ProjectCard;