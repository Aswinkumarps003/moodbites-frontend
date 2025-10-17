import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const API_URL = 'http://localhost:5000/api';

const Table = ({ title, users, onToggleVerify, loading, height = 320, accent = 'orange', headerActions = null }) => {
  const color = useMemo(() => ({
    header: accent === 'emerald' ? 'bg-emerald-100' : 'bg-amber-100',
    hover: accent === 'emerald' ? 'hover:bg-emerald-50' : 'hover:bg-orange-50',
    badgeActiveBg: accent === 'emerald' ? 'bg-emerald-100 text-emerald-700' : 'bg-green-100 text-green-700',
    badgeInactiveBg: 'bg-red-100 text-red-700',
    button: accent === 'emerald' ? 'text-emerald-600 hover:text-emerald-800' : 'text-orange-600 hover:text-orange-900'
  }), [accent]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-lg p-4"
    >
      <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <div className="flex items-center gap-2">
          {headerActions}
          {loading && (
            <div className="flex items-center text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
              Loading...
            </div>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="max-h-[320px] overflow-y-auto rounded-xl border border-gray-100" style={{ maxHeight: height }}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={color.header}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {users.map((user, idx) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={color.hover}
                >
                  <td className="px-6 py-3 whitespace-nowrap font-semibold">{user.name}</td>
                  <td className="px-6 py-3 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.active ? color.badgeActiveBg : color.badgeInactiveBg}`}>
                      {user.active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {user.active ? (
                      <button
                        onClick={() => onToggleVerify(user, false)}
                        className={`font-bold ${color.button}`}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => onToggleVerify(user, true)}
                        className={`font-bold ${color.button}`}
                      >
                        Activate
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
              {!users.length && (
                <tr>
                  <td colSpan="4" className="px-6 py-6 text-center text-sm text-gray-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

const UsersPage = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [normalUsers, setNormalUsers] = useState([]);
  const [dieticians, setDieticians] = useState([]);
  const [error, setError] = useState(null);

  const token = useMemo(() => localStorage.getItem('authToken'), []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      // role 1 = normal users, role 2 = dieticians
      const [r1, r2] = await Promise.all([
        fetch(`${API_URL}/user/users/role/1`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/user/users/role/2`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const d1 = r1.ok ? await r1.json() : { users: [] };
      const d2 = r2.ok ? await r2.json() : { users: [] };
      setNormalUsers(d1.users || []);
      setDieticians(d2.users || []);
    } catch (e) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleVerify = async (user, nextState) => {
    try {
      const resp = await fetch(`${API_URL}/user/profile/${user._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ active: nextState })
      });
      if (!resp.ok) throw new Error('Failed to update');
      // Optimistic UI update
      const updateList = (list) => list.map(u => u._id === user._id ? { ...u, active: nextState } : u);
      if (user.role === 2) setDieticians(prev => updateList(prev));
      else setNormalUsers(prev => updateList(prev));
    } catch (e) {
      setError('Failed to update user');
    }
  };

  // Bulk actions removed per requirement

  const filterBySearch = (list) => list.filter(u =>
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.4, type: "spring" }}
      className="space-y-6"
    >
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
            <p className="text-gray-500 text-sm">View and manage normal users and dieticians separately.</p>
          </div>
          <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-400 focus:border-emerald-400"
            />
            <button
              onClick={fetchUsers}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow hover:shadow-md"
            >
              Refresh
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Table
          title={`Dieticians (${filterBySearch(dieticians).length})`}
          users={filterBySearch(dieticians)}
          onToggleVerify={handleToggleVerify}
          loading={loading}
          accent="emerald"
        />
        <Table
          title={`Normal Users (${filterBySearch(normalUsers).length})`}
          users={filterBySearch(normalUsers)}
          onToggleVerify={handleToggleVerify}
          loading={loading}
          accent="orange"
        />
      </div>
    </motion.div>
  );
};

export default UsersPage;


