import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Salad, Search, RefreshCw, CheckCircle, XCircle, Users, Flame } from "lucide-react";

const DietPlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      const dietResp = await fetch('https://diet-service-latest.onrender.com/api/diet-plans');
      if (!dietResp.ok) throw new Error(`diet-service ${dietResp.status}`);
      const dietJson = await dietResp.json();
      const dietPlans = dietJson?.dietPlans || [];

      const userIds = Array.from(new Set(dietPlans.map(p => p.userId)));

      let userMap = new Map();
      try {
        const usersResp = await fetch('https://user-service-latest-bae8.onrender.com/api/users/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userIds })
        });
        if (usersResp.ok) {
          const usersArr = await usersResp.json();
          userMap = new Map(usersArr.map(u => [String(u._id), u]));
        }
      } catch (e) { /* ignore user fetch errors */ }

      const merged = dietPlans.map((p) => {
        const user = userMap.get(String(p.userId));
        return {
          _id: p._id,
          planName: p.planName,
          totalCalories: p.totalCalories,
          isActive: p.isActive,
          createdAt: p.createdAt,
          userName: user?.name || 'Unknown',
          userEmail: user?.email || '—',
          dietMeta: p.dietId || null,
        };
      });

      setPlans(merged);
    } catch (e) {
      console.error('Fetch diet plans error:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (planId, nextActive) => {
    try {
      setSavingId(planId);
      const resp = await fetch(`https://diet-service-latest.onrender.com/api/diet-plans/${planId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextActive })
      });
      if (!resp.ok) throw new Error(`diet-service ${resp.status}`);
      const json = await resp.json();
      const updated = json?.dietPlan;
      if (updated) {
        setPlans(prev => prev.map(p => p._id === planId ? { ...p, isActive: updated.isActive } : p));
      }
    } catch (e) {
      console.error('Update status error:', e);
    } finally {
      setSavingId(null);
    }
  };

  const filtered = plans.filter(p =>
    (p.planName || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.userName || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.userEmail || '').toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = plans.filter(p => p.isActive).length;
  const totalCalories = plans.reduce((sum, p) => sum + (p.totalCalories || 0), 0);

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
        {[
          { label: "Total Plans", value: plans.length, color: "#f97316", icon: Salad },
          { label: "Active Plans", value: activeCount, color: "#34d399", icon: CheckCircle },
          { label: "Inactive", value: plans.length - activeCount, color: "#f87171", icon: XCircle },
          { label: "Avg Calories", value: plans.length && totalCalories ? Math.round(totalCalories / plans.length) : 0, color: "#fbbf24", icon: Flame },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: "rgba(15,23,42,0.6)", border: `1px solid ${s.color}22` }}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15` }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-5"
        style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Diet Plans Management</h2>
            <p className="text-xs text-slate-500 mt-1">{plans.length} total • Showing {filtered.length} plans</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Search className="w-4 h-4 text-slate-500" />
              <input type="text" placeholder="Search plans..." value={search} onChange={e => setSearch(e.target.value)}
                className="bg-transparent outline-none text-sm text-slate-300 placeholder-slate-600 w-40" />
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={fetchPlans}
              className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
              style={{ background: "rgba(249,115,22,0.12)", color: "#fb923c", border: "1px solid rgba(249,115,22,0.2)" }}>
              <RefreshCw className="w-4 h-4" /> Refresh
            </motion.button>
          </div>
        </div>
        {error && (
          <div className="mt-3 text-sm px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
            {error}
          </div>
        )}
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr style={{ background: "rgba(249,115,22,0.06)", borderBottom: "1px solid rgba(249,115,22,0.1)" }}>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Plan Name</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Calories</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Diet Pref</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-5 py-8 text-slate-500 text-center" colSpan={8}>
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-600 border-t-orange-400" />
                    Loading plans...
                  </div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td className="px-5 py-8 text-slate-500 text-center" colSpan={8}>No plans found</td></tr>
              ) : (
                filtered.map((plan, idx) => {
                  const initials = (plan.userName || "?").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                  const maxCal = 3000;
                  const calPercent = Math.min(100, ((plan.totalCalories || 0) / maxCal) * 100);
                  return (
                    <motion.tr
                      key={plan._id}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="transition-colors duration-200 border-b"
                      style={{ borderColor: "rgba(255,255,255,0.03)" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(249,115,22,0.04)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Salad className="w-4 h-4 text-orange-400 flex-shrink-0" />
                          <span className="font-semibold text-slate-200 text-sm">{plan.planName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white"
                            style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(139,92,246,0.15))", border: "1px solid rgba(139,92,246,0.25)" }}>
                            {initials}
                          </div>
                          <span className="text-sm text-slate-300">{plan.userName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-500">{plan.userEmail}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-200">{plan.totalCalories}</span>
                          <div className="w-16 h-1.5 rounded-full bg-white/5">
                            <div className="h-full rounded-full" style={{
                              width: `${calPercent}%`,
                              background: calPercent > 80 ? "linear-gradient(90deg, #f97316, #ef4444)" : "linear-gradient(90deg, #34d399, #3b82f6)",
                            }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-lg text-xs font-medium" style={{ background: "rgba(139,92,246,0.1)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.2)" }}>
                          {plan.dietMeta?.dietPreference || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold"
                          style={{
                            background: plan.isActive ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                            color: plan.isActive ? "#34d399" : "#f87171",
                            border: `1px solid ${plan.isActive ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
                          }}>
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={savingId === plan._id}
                          onClick={() => toggleStatus(plan._id, !plan.isActive)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40 transition-all"
                          style={{
                            background: plan.isActive ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                            color: plan.isActive ? "#f87171" : "#34d399",
                            border: `1px solid ${plan.isActive ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}`,
                          }}
                        >
                          {savingId === plan._id ? 'Saving...' : (plan.isActive ? 'Deactivate' : 'Activate')}
                        </motion.button>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500">{new Date(plan.createdAt).toLocaleDateString()}</td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DietPlansPage;
