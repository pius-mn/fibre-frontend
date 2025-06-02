import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Clear previous error messages

    try {
      const response = await api.post('/auth/login', { username, password });
      const { accessToken, refreshToken, role } = response.data;

      // Store tokens and role in localStorage
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userRole', role);

      // Navigate based on role
      navigate(`/`);
    } catch (err) {
      console.error(err);
      // Handle specific error messages
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50">
      <div className="relative mx-auto w-full max-w-md bg-white px-6 pt-20 pb-8 shadow-xl ring-1 ring-green-200 sm:rounded-xl sm:px-10">
        <div className="w-full">
          <div className="text-center">
            {/* Project Title */}
            <h1 className="text-4xl font-bold text-green-800">2G Management System</h1>
            <p className="mt-1 text-lg text-green-700">Sign In</p>
            {error && (
              <div
                className="mt-5 flex items-center justify-between p-5 leading-normal text-red-600 bg-red-100 rounded-lg"
                role="alert"
              >
                <p>{error}</p>
              </div>
            )}
          </div>
          <div className="mt-8">
            <form onSubmit={handleLogin}>
              <div className="relative mt-6">
                <input
                  type="text"
                  placeholder="Username"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                  className="peer mt-1 w-full border-b-2 border-green-300 px-0 py-1 placeholder:text-transparent focus:border-green-600 focus:outline-none"
                />
                <label
                  htmlFor="username"
                  className="pointer-events-none absolute top-0 left-0 origin-left -translate-y-1/2 transform text-sm text-green-800 opacity-75 transition-all duration-100 ease-in-out peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-green-500 peer-focus:top-0 peer-focus:pl-0 peer-focus:text-sm peer-focus:text-green-800"
                >
                  Username
                </label>
              </div>
              <div className="relative mt-6">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  id="password"
                  className="peer mt-1 w-full border-b-2 border-green-300 px-0 py-1 placeholder:text-transparent focus:border-green-600 focus:outline-none"
                />
                <label
                  htmlFor="password"
                  className="pointer-events-none absolute top-0 left-0 origin-left -translate-y-1/2 transform text-sm text-green-800 opacity-75 transition-all duration-100 ease-in-out peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-green-500 peer-focus:top-0 peer-focus:pl-0 peer-focus:text-sm peer-focus:text-green-800"
                >
                  Password
                </label>
              </div>
              <div className="my-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md bg-green-600 px-3 py-4 text-white hover:bg-green-700 focus:bg-green-700 focus:outline-none"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </div>
              <p className="text-center text-sm text-green-600">
                Don&apos;t have an account yet?{' '}
                <a
                  href="#"
                  className="font-semibold hover:underline focus:text-green-800 focus:outline-none"
                >
                  Sign up
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
