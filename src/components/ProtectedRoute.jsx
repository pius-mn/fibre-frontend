import PropTypes from 'prop-types';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const userRole = localStorage.getItem('userRole') || ''; // Get userRole from local storage

  // Check if the user's role is included in the allowedRoles array
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" />;
  }

  return <Outlet />;
};

// Define prop types for validation
ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired, // Allow an array of strings for roles
};

export default ProtectedRoute;
