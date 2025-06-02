import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ProjectForm = ({ initialData, onSubmit, isSubmitting, users = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_user_id: '',
    project_id: '',
    distance: '',
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const userRole = localStorage.getItem('userRole') || '';
  const isAdmin = userRole === 'admin';
  const isEditor = userRole === 'editor';
  const canEditAssignment = isAdmin;
  const canEditDetails = isEditor;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">

      {/* Title Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title {!canEditDetails && <span className="ml-2 text-gray-400">(View only)</span>}
        </label>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          disabled={!canEditDetails}
          className={`mt-1 block w-full rounded-md border shadow-sm transition duration-200 ${!canEditDetails ? 'bg-gray-50 border-gray-200 cursor-not-allowed' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
            }`}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Project Id {!canEditDetails && <span className="ml-2 text-gray-400">(View only)</span>}
        </label>
        <input
          name="project_id"
          value={formData?.project_id}
          onChange={handleChange}
          disabled={!canEditDetails}
          className={`mt-1 block w-full rounded-md border shadow-sm transition duration-200 ${!canEditDetails ? 'bg-gray-50 border-gray-200 cursor-not-allowed' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
            }`}
        />
      </div>
      <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Distance Km {!canEditDetails && <span className="ml-2 text-gray-400">(View only)</span>}
  </label>
  <input
    name="distance"
    value={formData?.distance}
    onChange={handleChange}
    disabled={!canEditDetails}
    type="number"
    min="0.01"  // Ensure the distance is greater than 0
    step="0.01"  // Allow decimal points
    className={`mt-1 block w-full rounded-md border shadow-sm transition duration-200 ${!canEditDetails ? 'bg-gray-50 border-gray-200 cursor-not-allowed' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'}`}
  />
</div>


      {/* Description Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description {!canEditDetails && <span className="ml-2 text-gray-400">(View only)</span>}
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          disabled={!canEditDetails}
          className={`mt-1 block w-full rounded-md border shadow-sm transition duration-200 ${!canEditDetails ? 'bg-gray-50 border-gray-200 cursor-not-allowed' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
            }`}
          rows="4"
        />
      </div>

      {/* Assign To Field - Select Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Current Assigned To <span className="ml-2 text-gray-400">(View only)</span>
        </label>
        <span
          className="mt-1 block w-full rounded-md border bg-gray-50 p-2 text-gray-700 shadow-sm"
        >
          {formData.username || 'Not assigned'}
        </span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Assign To {!canEditAssignment && <span className="ml-2 text-gray-400">(View only)</span>}
        </label>
        <select
          name="assigned_user_id"
          value={formData.assigned_user_id ||""}
          onChange={handleChange}
          disabled={!canEditAssignment}
          className={`mt-1 block w-full rounded-md border shadow-sm transition duration-200 ${!canEditAssignment ? 'bg-gray-50 border-gray-200 cursor-not-allowed' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
            }`}
        >
          <option value="">Select a user</option>
          {users.length > 0 ? (
            users.map(user => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))
          ) : (
            <option disabled>No users available</option>
          )}
        </select>
        {!canEditAssignment && (
          <p className="mt-1 text-sm text-gray-500">
            {isEditor ? "Editors cannot modify assignments" : "Contact admin to change assignment"}
          </p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 mt-8">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-5 py-2.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Project'}
        </button>
      </div>
    </form>
  );
};

ProjectForm.propTypes = {
  initialData: PropTypes.object,
  users: PropTypes.array,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};

export default ProjectForm;
