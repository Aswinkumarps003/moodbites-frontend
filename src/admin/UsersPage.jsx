import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Users, UserCheck, UserX, Search, RefreshCw, Shield, Stethoscope } from "lucide-react";

const API_URL = 'https://user-service-latest-bae8.onrender.com/api';

const MiniStat = ({ icon: Icon, label, value, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="flex items-center gap-3 px-4 py-3 rounded-xl"
    style={{
      background: "rgba(15,23,42,0.6)",
      border: `1px solid ${color}22`,
      boxShadow: `0 0 20px ${color}08`,
    }}
  >
    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}22` }}>
      <Icon className="w-4 h-4" style={{ color }} />
    </div>
    <div>
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</div>
    </div>
  </motion.div>
);

const Table = ({ title, users, onToggleVerify, loading, height = 360, accent = 'orange', headerActions = null, icon: TitleIcon }) => {
  const colors = useMemo(() => ({
    header: accent === 'emerald' ? 'rgba(16,185,129,0.08)' : 'rgba(249,115,22,0.08)',
    headerBorder: accent === 'emerald' ? 'rgba(16,185,129,0.12)' : 'rgba(249,115,22,0.12)',
    hoverBg: accent === 'emerald' ? 'rgba(16,185,129,0.05)' : 'rgba(249,115,22,0.05)',
    accentColor: accent === 'emerald' ? '#34d399' : '#fb923c',
    buttonColor: accent === 'emerald' ? '#34d399' : '#fb923c',
  }), [accent]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl p-5"
      style={{
        background: "rgba(15,23,42,0.6)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      }}
    >
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          {TitleIcon && <TitleIcon className="w-5 h-5" style={{ color: colors.accentColor }} />}
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {headerActions}
          {loading && (
            <div className="flex items-center text-sm text-slate-500 gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-600 border-t-slate-400" />
              Loading...
            </div>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="overflow-y-auto rounded-xl" style={{ maxHeight: height, border: "1px solid rgba(255,255,255,0.04)" }}>
          <table className="min-w-full">
            <thead>
              <tr style={{ background: colors.header, borderBottom: `1px solid ${colors.headerBorder}` }}>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => {
                const initials = (user.name || "?").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                return (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="transition-colors duration-200 border-b"
                    style={{ borderColor: "rgba(255,255,255,0.03)" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = colors.hoverBg}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                          style={{
                            background: `linear-gradient(135deg, ${colors.accentColor}44, ${colors.accentColor}22)`,
                            border: `1px solid ${colors.accentColor}33`,
                          }}
                        >
                          {initials}
                        </div>
                        <span className="font-semibold text-slate-200 text-sm">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-sm text-slate-400">{user.email}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className="px-2.5 py-1 rounded-lg text-xs font-bold"
                        style={{
                          background: user.active ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                          color: user.active ? "#34d399" : "#f87171",
                          border: `1px solid ${user.active ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
                        }}
                      >
                        {user.active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onToggleVerify(user, !user.active)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                        style={{
                          background: user.active ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                          color: user.active ? "#f87171" : "#34d399",
                          border: `1px solid ${user.active ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}`,
                        }}
                      >
                        {user.active ? "Deactivate" : "Activate"}
                      </motion.button>
                    </td>
                  </motion.tr>
                );
              })}
              {!users.length && (
                <tr>
                  <td colSpan="4" className="px-5 py-8 text-center text-sm text-slate-500">No users found.</td>
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
      const updateList = (list) => list.map(u => u._id === user._id ? { ...u, active: nextState } : u);
      if (user.role === 2) setDieticians(prev => updateList(prev));
      else setNormalUsers(prev => updateList(prev));
    } catch (e) {
      setError('Failed to update user');
    }
  };

  const filterBySearch = (list) => list.filter(u =>
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalUsers = normalUsers.length + dieticians.length;
  const activeUsers = [...normalUsers, ...dieticians].filter(u => u.active).length;
  const inactiveUsers = totalUsers - activeUsers;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="space-y-5"
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniStat icon={Users} label="Total Users" value={totalUsers} color="#f97316" delay={0} />
        <MiniStat icon={UserCheck} label="Active" value={activeUsers} color="#34d399" delay={0.05} />
        <MiniStat icon={UserX} label="Inactive" value={inactiveUsers} color="#f87171" delay={0.1} />
        <MiniStat icon={Stethoscope} label="Dieticians" value={dieticians.length} color="#8b5cf6" delay={0.15} />
      </div>

      {/* Search & Controls */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-5"
        style={{
          background: "rgba(15,23,42,0.6)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Users Management</h2>
            <p className="text-slate-500 text-xs mt-1">View and manage normal users and dieticians</p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent outline-none text-sm text-slate-300 placeholder-slate-600 w-40"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchUsers}
              className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
              style={{
                background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(20,184,166,0.12))",
                color: "#34d399",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </motion.button>
          </div>
        </div>
        {error && (
          <div className="mt-3 text-sm px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
            {error}
          </div>
        )}
      </motion.div>

      {/* Tables */}
      <div className="grid grid-cols-1 gap-5">
        <Table
          title={`Dieticians (${filterBySearch(dieticians).length})`}
          users={filterBySearch(dieticians)}
          onToggleVerify={handleToggleVerify}
          loading={loading}
          accent="emerald"
          icon={Stethoscope}
        />
        <Table
          title={`Normal Users (${filterBySearch(normalUsers).length})`}
          users={filterBySearch(normalUsers)}
          onToggleVerify={handleToggleVerify}
          loading={loading}
          accent="orange"
          icon={Users}
        />
      </div>
    </motion.div>
  );
};

export default UsersPage;
