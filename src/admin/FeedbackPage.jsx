import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { MessageCircle, UserPlus, Clock, User } from "lucide-react";

const API_URL = 'https://user-service-latest-bae8.onrender.com/api';

const FeedbackPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const token = useMemo(() => localStorage.getItem('authToken'), []);

  useEffect(() => {
    const fetchRecentUsers = async () => {
      try {
        setLoading(true);
        const [pResp, dResp] = await Promise.all([
          fetch(`${API_URL}/user/users/role/1`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/user/users/role/2`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const patients = pResp.ok ? (await pResp.json()).users || [] : [];
        const dieticians = dResp.ok ? (await dResp.json()).users || [] : [];

        // Combine and sort by creation date (most recent first)
        const all = [
          ...patients.map(u => ({ ...u, userType: "Patient" })),
          ...dieticians.map(u => ({ ...u, userType: "Dietician" })),
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setUsers(all);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentUsers();
  }, [token]);

  const filtered = filter === "all" ? users : users.filter(u => u.userType === filter);

  const timeAgo = (dateStr) => {
    if (!dateStr) return "Unknown";
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="space-y-5"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6"
        style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.2), rgba(245,158,11,0.15))", border: "1px solid rgba(249,115,22,0.25)" }}>
              <MessageCircle className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">User Activity & Registrations</h2>
              <p className="text-xs text-slate-500 mt-0.5">Recent platform activity timeline ({users.length} total users)</p>
            </div>
          </div>
          <div className="flex gap-2">
            {[
              { label: "All", value: "all" },
              { label: "Patients", value: "Patient" },
              { label: "Dieticians", value: "Dietician" },
            ].map(f => (
              <motion.button
                key={f.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(f.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: filter === f.value ? "rgba(249,115,22,0.15)" : "rgba(255,255,255,0.04)",
                  color: filter === f.value ? "#fb923c" : "#94a3b8",
                  border: `1px solid ${filter === f.value ? "rgba(249,115,22,0.25)" : "rgba(255,255,255,0.08)"}`,
                }}
              >
                {f.label}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Activity Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-6"
        style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-slate-500">No users found</div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {filtered.map((user, idx) => {
              const initials = (user.name || "?").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
              const isPatient = user.userType === "Patient";
              const accentColor = isPatient ? "#3b82f6" : "#8b5cf6";
              return (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  whileHover={{ x: 4, background: `${accentColor}06` }}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 cursor-default"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.03)" }}
                >
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ background: accentColor, boxShadow: `0 0 8px ${accentColor}66` }} />
                  </div>

                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${accentColor}44, ${accentColor}22)`,
                      border: `1px solid ${accentColor}33`,
                    }}
                  >
                    {initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200 text-sm">{user.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold"
                        style={{ background: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}25` }}>
                        {user.userType}
                      </span>
                      {user.active && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px rgba(52,211,153,0.5)" }} />
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>{user.email}</span>
                      {user.certValidated && (
                        <span className="text-[10px] text-emerald-400">✓ Verified</span>
                      )}
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Clock className="w-3 h-3 text-slate-600" />
                    <span className="text-xs text-slate-500">{timeAgo(user.createdAt)}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default FeedbackPage;
