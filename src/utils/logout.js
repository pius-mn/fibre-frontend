import { useNavigate } from 'react-router-dom';
import Authapi from '../utils/axios'; // Import your custom axios instance

const useLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userRole');

      // Call the logout API using axios
      await Authapi.post('/auth/logout', { refreshToken });

      // Clear tokens and user role from local storage
      

      // Navigate back to the login page
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Optionally handle specific error responses, e.g., show a notification
    }
  };

  return { logout };
};

export default useLogout;
