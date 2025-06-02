import { useState } from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import useLogout from '../../utils/logout';
import {
  HomeIcon,
  ChartBarIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";

export default function Dashboard() {
  const { logout } = useLogout();
  const userRole = localStorage.getItem('userRole') || '';
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const roleNames = {
    user: 'Contractor Dashboard',
    admin: 'fixed Metro Rollout Dashboard',
    editor: 'Access Transmission Planning Dashboard'
  };

  if (!['admin', 'editor', 'user'].includes(userRole)) {
    return <Navigate to="/login" replace />;
  }


  const cancelLogout = () => {
    setShowLogoutModal(false);
  };
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };
  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };
  // Navigation items with icons
  const navItems = [
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
    }
  ];

 

  return (
    <div className="bg-gray-100 font-sans min-h-screen">
      {/* Mobile Header with Logout (visible on small screens) */}
      <header className="lg:hidden bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-green-600">Safaricom PM</h1>
        <button
          className="text-sm font-medium text-gray-900 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-150"
          aria-label="Logout"
          onClick={handleLogoutClick}
        >
          Logout
        </button>
      </header>

      {/* Sidebar for Large Screens */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex-grow p-6">
          <h2 className="text-2xl font-bold text-green-600 mb-8">Safaricom PM</h2>
          <nav>
          {navItems.map((item) =>
            item.roles.includes(userRole) && (
              <NavLink
                key={item.name}
                to={item.to}
                end
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md ${
                    isActive ? 'bg-green-900 text-white' : 'hover:bg-green-700'
                  }`
                }
              >
                <item.icon className="h-6 w-6" />
                <span className="ml-3">{item.name}</span>
              </NavLink>
            )
          )}
          </nav>
        </div>
        {/* Logout Button at Bottom */}
        <div className="p-6 border-t">
          <button
            className="w-full text-left text-gray-900 hover:text-green-600 transition duration-150 focus:outline-none focus:ring-2 focus:ring-green-400 font-medium"
            aria-label="Logout"
            onClick={handleLogoutClick}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation (Twitter/X style, visible on small screens) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-inner lg:hidden z-10">
        <div className="flex justify-around">
        {navItems
        .filter((item) => item.roles.includes(userRole))
        .map(({ name, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center p-3 transition duration-150 ${
                isActive ? "text-green-600" : "text-gray-900 hover:text-green-600"
              }`
            }
            aria-label={name}
          >
            <Icon className="w-6 h-6 mb-1" />
            <span className="text-xs">{name}</span>
          </NavLink>
        ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="lg:ml-64 p-6 pt-10 mb-20">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-green-600 mb-6">
          {roleNames[userRole] || 'Dashboard'}
          </h1>
         <Outlet />
           {/* Footer */}
      <footer className="mb-2 border-t border-green-200 pt-4 text-center text-sm text-green-900">
        <p>© {new Date().getFullYear()} Safaricom PLC. All rights reserved.</p>
        <p className="mt-1">Customer Experience Management System</p>
      </footer>
        </div>
          {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-semibold text-green-800 mb-4">Confirm Logout</h2>
            <p className="mb-6 text-gray-700">Are you sure you want to log out?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 rounded-md bg-gray-300 text-gray-800 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}
