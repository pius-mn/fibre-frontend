import { useState, useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom';
import useLogout from '../../utils/logout';
import {
  HomeIcon,
  ChartBarIcon,
  PlusCircleIcon,
  UserCircleIcon,
  UsersIcon,
  PowerIcon
} from "@heroicons/react/24/outline";

// Static configuration objects
const ROLE_NAMES = {
  user: 'Contractor Dashboard',
  admin: 'Fixed Metro Rollout Dashboard',
  editor: 'Access Transmission Planning Dashboard'
};

const BASE_NAV_ITEMS = [
  {
    name: 'Home',
    to: '/',
    icon: HomeIcon,
    roles: ['admin', 'editor', 'user']
  },
  {
    name: 'Add Project',
    to: '/create',
    icon: PlusCircleIcon,
    roles: ['editor']
  },
  {
    name: 'Report',
    to: '/report',
    icon: ChartBarIcon,
    roles: ['admin', 'editor', 'user']
  },
  {
    name: 'Users',
    to: '/users',
    icon: UsersIcon,
    roles: ['admin']
  }
];

// Extracted components for better readability
const LogoutModal = ({ onCancel, onConfirm }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-lg p-6 max-w-sm w-full">
      <h2 className="text-xl font-semibold text-green-800 mb-4">Confirm Logout</h2>
      <p className="mb-6 text-gray-700">Are you sure you want to log out?</p>
      <div className="flex justify-end space-x-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-md bg-gray-300 text-gray-800 hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
);

LogoutModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired
};

const NavItem = ({ item, userRole, isMobile = false, userId }) => {
  if (!item.roles.includes(userRole)) return null;

  const profileLink = item.name === 'Profile' ? `/user/${userId}` : item.to;

  return (
    <NavLink
      to={profileLink}
      end
      className={({ isActive }) =>
        isMobile
          ? `flex flex-col items-center p-3 transition-colors ${isActive ? "text-green-600" : "text-gray-900 hover:text-green-600"}`
          : `flex items-center px-3 py-2 rounded-md transition-colors ${isActive ? 'bg-green-900 text-white' : 'hover:bg-green-700'}`
      }
      aria-label={item.name}
    >
      <item.icon className="h-6 w-6" />
      {!isMobile && <span className="ml-3">{item.name}</span>}
      {isMobile && <span className="text-xs mt-1">{item.name}</span>}
    </NavLink>
  );
};

NavItem.propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    roles: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired,
  userRole: PropTypes.string.isRequired,
  isMobile: PropTypes.bool,
  userId: PropTypes.string.isRequired
};

const MobileHeader = ({ onLogout }) => (
  <header className="lg:hidden bg-white shadow p-4 flex justify-between items-center">
    <h1 className="text-lg font-bold text-green-600">Safaricom PM</h1>
    <button
      className="text-sm font-medium text-gray-900 hover:text-green-600 focus:outline-none transition-colors"
      aria-label="Logout"
      onClick={onLogout}
    >
      <PowerIcon className="w-6 h-6" />
    </button>
  </header>
);

MobileHeader.propTypes = {
  onLogout: PropTypes.func.isRequired
};

const Sidebar = ({ navItems, userRole, onLogout, userId }) => (
  <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-20">
    <div className="flex-grow p-6">
      <h2 className="text-2xl font-bold text-green-600 mb-8">Safaricom PM</h2>
      <nav className="space-y-2 mb-8">
        {navItems.map(item => (
          <NavItem
            key={`desktop-${item.name}`}
            item={item}
            userRole={userRole}
            userId={userId}
          />
        ))}
      </nav>
    </div>
    <div className="p-6 border-t">
      <button
        className="w-full text-left text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none font-medium flex items-center p-2 rounded-md"
        aria-label="Logout"
        onClick={onLogout}
      >
        <PowerIcon className="w-5 h-5 mr-3" />
        <span>Logout</span>
      </button>
    </div>
  </aside>
);

Sidebar.propTypes = {
  navItems: PropTypes.arrayOf(PropTypes.object).isRequired,
  userRole: PropTypes.string.isRequired,
  onLogout: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
};

const MobileNav = ({ navItems, userRole, userId }) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-inner lg:hidden z-10">
    <div className="flex justify-around">
      {navItems.map(item => (
        <NavItem
          key={`mobile-${item.name}`}
          item={item}
          userRole={userRole}
          isMobile={true}
          userId={userId}
        />
      ))}
    </div>
  </nav>
);

MobileNav.propTypes = {
  navItems: PropTypes.arrayOf(PropTypes.object).isRequired,
  userRole: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired
};

const getUserDataFromStorage = () => {
  try {
    return {
      role: localStorage.getItem('userRole') || '',
      id: localStorage.getItem('userId') || '',
      user: localStorage.getItem('username') || ''
    };
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return { role: '', id: '',user:'' };
  }
};

const Dashboard = () => {
  const { logout } = useLogout();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [userData, setUserData] = useState(getUserDataFromStorage);

  useEffect(() => {
    const handleStorageChange = () => {
      setUserData(getUserDataFromStorage());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const navItems = useMemo(() => {
    const baseItems = [...BASE_NAV_ITEMS];
    if (userData.id) {
      baseItems.push({
        name: 'Profile',
        to: `/user/${userData.id}`,
        icon: UserCircleIcon,
        roles: ['admin', 'editor', 'user']
      });
    }
    return baseItems.filter(item => item.roles.includes(userData.role));
  }, [userData.role, userData.id]);

  const sidebarNavItems = useMemo(() => navItems.slice(0, -1), [navItems]);

  const handleLogoutClick = useCallback(() => {
    setShowLogoutModal(true);
  }, []);

  const cancelLogout = useCallback(() => {
    setShowLogoutModal(false);
  }, []);

  const confirmLogout = useCallback(() => {
    setShowLogoutModal(false);
    logout();
  }, [logout]);

  if (!['admin', 'editor', 'user'].includes(userData.role)) {
    return <Navigate to="/login" replace />;
  }

  if (!userData.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Profile Error</h2>
          <p className="mb-6 text-gray-700">User ID not found. Please log in again.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 font-sans min-h-screen">
      <MobileHeader onLogout={handleLogoutClick} />

      <Sidebar
        navItems={sidebarNavItems}
        userRole={userData.role}
        onLogout={handleLogoutClick}
        userId={userData.id}
      />

      <MobileNav
        navItems={navItems}
        userRole={userData.role}
        userId={userData.id}
      />

      <main className="lg:ml-64 p-6 pt-10 mb-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-green-600">
              {ROLE_NAMES[userData.role] || 'Dashboard'}
            </h1>
            <div className="hidden lg:block">
              <NavLink
                to={`/user/${userData.id}`}
                className="flex items-center text-gray-700 hover:text-green-600 transition-colors"
              >
                <UserCircleIcon className="w-8 h-8" />
                <span className="ml-2 text-sm font-medium">{userData.user}</span>
              </NavLink>
            </div>
          </div>

          <Outlet />

          <footer className="mb-2 border-t border-green-200 pt-4 text-center text-sm text-green-900 mt-8">
            <p>© {new Date().getFullYear()} Safaricom PLC. All rights reserved.</p>
            <p className="mt-1">Customer Experience Management System</p>
          </footer>
        </div>
      </main>

      {showLogoutModal && (
        <LogoutModal
          onCancel={cancelLogout}
          onConfirm={confirmLogout}
        />
      )}
    </div>
  );
};

export default Dashboard;
