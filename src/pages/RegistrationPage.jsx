import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/register', { username, password });

      // Optionally, redirect to login
      navigate('/login');
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
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
            <h1 className="text-4xl font-bold text-green-800">2G Management System</h1>
            <p className="mt-1 text-lg text-green-700">Register</p>
            {error && (
              <div className="mt-5 p-5 text-red-600 bg-red-100 rounded-lg" role="alert">
                {error}
              </div>
            )}
          </div>
          <div className="mt-8">
            <form onSubmit={handleRegister}>
              <div className="relative mt-6">
                <input
                  type="text"
                  placeholder="Username"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="peer mt-1 w-full border-b-2 border-green-300 px-0 py-1 placeholder:text-transparent focus:border-green-600 focus:outline-none"
                />
                <label
                  htmlFor="username"
                  className="pointer-events-none absolute top-0 left-0 origin-left -translate-y-1/2 transform text-sm text-green-800 opacity-75 transition-all duration-100 ease-in-out peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-green-500 peer-focus:top-0 peer-focus:text-sm peer-focus:text-green-800"
                >
                  Username
                </label>
              </div>

              <div className="relative mt-6">
                <input
                  type="password"
                  placeholder="Password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="peer mt-1 w-full border-b-2 border-green-300 px-0 py-1 placeholder:text-transparent focus:border-green-600 focus:outline-none"
                />
                <label
                  htmlFor="password"
                  className="pointer-events-none absolute top-0 left-0 origin-left -translate-y-1/2 transform text-sm text-green-800 opacity-75 transition-all duration-100 ease-in-out peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-green-500 peer-focus:top-0 peer-focus:text-sm peer-focus:text-green-800"
                >
                  Password
                </label>
              </div>

              <div className="relative mt-6">
                <input
                  type="password"
                  placeholder="Confirm Password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="peer mt-1 w-full border-b-2 border-green-300 px-0 py-1 placeholder:text-transparent focus:border-green-600 focus:outline-none"
                />
                <label
                  htmlFor="confirmPassword"
                  className="pointer-events-none absolute top-0 left-0 origin-left -translate-y-1/2 transform text-sm text-green-800 opacity-75 transition-all duration-100 ease-in-out peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-green-500 peer-focus:top-0 peer-focus:text-sm peer-focus:text-green-800"
                >
                  Confirm Password
                </label>
              </div>

              <div className="my-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md bg-green-600 px-3 py-4 text-white hover:bg-green-700 focus:bg-green-700 focus:outline-none"
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </div>

              <p className="text-center text-sm text-green-600">
                Already have an account?{' '}
                <a
                  href="/login"
                  className="font-semibold hover:underline focus:text-green-800 focus:outline-none"
                >
                  Log in
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
