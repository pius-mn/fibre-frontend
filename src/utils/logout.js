import { useNavigate } from 'react-router-dom';
import Authapi from '../utils/axios';

const useLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');

    // Immediately clear localStorage regardless of API call success
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');

    try {
      if (refreshToken) {
        await Authapi.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout API call failed:', error?.response?.data || error.message);
      // Optionally handle error (e.g., toast notification or logging)
    } finally {
      navigate('/login'); // Always redirect, regardless of error
    }
  };

  return { logout };
};

export default useLogout;
