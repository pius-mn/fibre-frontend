import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PencilIcon } from '@heroicons/react/24/outline';
import Authapi from '../utils/axios';

const UserProfileUpdate = () => {
  const { userId } = useParams();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [editable, setEditable] = useState({
    username: false,
    password: false,
    confirmPassword: false,
  });
  const [status, setStatus] = useState({ 
    message: '', 
    error: '', 
    loading: false 
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await Authapi.get(`/user/${userId}`);
        setFormData({
          username: res.data.user?.username || '',
          password: '',
          confirmPassword: '',
        });
      } catch {
        setStatus(s => ({ ...s, error: 'Failed to load user data' }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (name === 'password' || name === 'confirmPassword') {
      setStatus(s => ({ ...s, error: '' }));
    }
  };

  const toggleEdit = (field) => {
    setEditable(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      return setStatus({
        message: '',
        error: 'Passwords do not match',
        loading: false
      });
    }

    setStatus({ message: '', error: '', loading: true });

    try {
      const payload = {
        username: formData.username,
        ...(formData.password && { password: formData.password }),
      };

      await Authapi.put(`/user/${userId}/profile`, payload);

      setStatus({ 
        message: 'Profile updated successfully!', 
        error: '', 
        loading: false 
      });
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }));
      setEditable({
        username: false,
        password: false,
        confirmPassword: false,
      });
      
      // Auto-clear success message
      setTimeout(() => {
        setStatus(s => ({ ...s, message: '' }));
      }, 3000);
    } catch (err) {
      setStatus({
        message: '',
        error: err.response?.data?.message || 'Update failed. Please try again.',
        loading: false,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-lg mt-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Update Profile</h2>
        <p className="text-gray-600 mt-1">
          Manage your account information
        </p>
      </div>

      {status.error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {status.error}
        </div>
      )}
      
      {status.message && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Username Field */}
        <div className="relative">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <div className="relative">
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              readOnly={!editable.username}
              className={`w-full rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:outline-none transition-all ${
                editable.username 
                  ? 'border-blue-300 focus:ring-blue-200 focus:border-blue-500 bg-white border-2' 
                  : 'border-gray-300 bg-gray-50'
              }`}
              required
            />
            <button
              type="button"
              onClick={() => toggleEdit('username')}
              className={`absolute top-1/2 right-3 transform -translate-y-1/2 p-1 rounded-full ${
                editable.username 
                  ? 'text-blue-600 bg-blue-100 hover:bg-blue-200' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              aria-label={editable.username ? "Save username" : "Edit username"}
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Password Field */}
        <div className="relative">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <div className="relative">
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              readOnly={!editable.password}
              placeholder={editable.password ? "Enter new password" : "********"}
              className={`w-full rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:outline-none transition-all ${
                editable.password 
                  ? 'border-blue-300 focus:ring-blue-200 focus:border-blue-500 bg-white border-2' 
                  : 'border-gray-300 bg-gray-50'
              }`}
            />
            <button
              type="button"
              onClick={() => toggleEdit('password')}
              className={`absolute top-1/2 right-3 transform -translate-y-1/2 p-1 rounded-full ${
                editable.password 
                  ? 'text-blue-600 bg-blue-100 hover:bg-blue-200' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              aria-label={editable.password ? "Save password" : "Edit password"}
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          </div>
          {editable.password && (
            <p className="mt-1 text-xs text-gray-500">
              Leave blank to keep current password
            </p>
          )}
        </div>

        {/* Confirm Password Field - Only shown when password is being edited */}
        {editable.password && (
          <div className="relative">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                readOnly={!editable.password}
                placeholder="Repeat password"
                className={`w-full rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:outline-none transition-all ${
                  editable.confirmPassword 
                    ? 'border-blue-300 focus:ring-blue-200 focus:border-blue-500 bg-white border-2' 
                    : 'border-gray-300 bg-gray-50'
                }`}
              />
              <button
                type="button"
                onClick={() => toggleEdit('confirmPassword')}
                className={`absolute top-1/2 right-3 transform -translate-y-1/2 p-1 rounded-full ${
                  editable.confirmPassword 
                    ? 'text-blue-600 bg-blue-100 hover:bg-blue-200' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                aria-label={editable.confirmPassword ? "Save confirmation" : "Edit confirmation"}
              >
                <PencilIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        )}

        <button
          type="submit"
          disabled={status.loading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium py-3 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {status.loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Updating...
            </div>
          ) : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default UserProfileUpdate;