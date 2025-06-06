import { useEffect, useState } from 'react';
import Authapi from "../utils/axios";

export default function UserTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [error, setError] = useState('');
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await Authapi.get('/user');
      setUsers(res.data);
    } catch (err) {
      setError(`Failed to fetch users. ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (id, newRole) => {
    try {
      setUpdatingUserId(id);
      await Authapi.put(`/user/${id}/role`, { role: newRole });
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const confirmDelete = (user) => {
    setConfirmDeleteUser(user);
  };

  const deleteUser = async () => {
    if (!confirmDeleteUser) return;
    try {
      await Authapi.delete(`/user/${confirmDeleteUser.id}`);
      setUsers(prev => prev.filter(user => user.id !== confirmDeleteUser.id));
      setConfirmDeleteUser(null);
    } catch (err) {
      setError(`Failed to delete user. ${err}`);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center py-4">Loading users...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">User Management</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          className="w-full md:w-1/3 border px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search by username or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left whitespace-nowrap">Username</th>
              <th className="px-4 py-2 text-left whitespace-nowrap">Email</th>
              <th className="px-4 py-2 text-left whitespace-nowrap">Role</th>
              <th className="px-4 py-2 text-left whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-t">
                <td className="px-4 py-2">{user.username}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">
                  <select
                    className="border rounded px-2 py-1"
                    value={user.role}
                    onChange={(e) => updateRole(user.id, e.target.value)}
                    disabled={updatingUserId === user.id}
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                    <option value="editor">editor</option>
                  </select>
                </td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => confirmDelete(user)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="4" className="px-4 py-4 text-center text-gray-500">
                  No users match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {confirmDeleteUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p>
              Are you sure you want to delete <strong>{confirmDeleteUser.username}</strong>?
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setConfirmDeleteUser(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={deleteUser}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
