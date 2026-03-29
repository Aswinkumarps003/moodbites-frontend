import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Search, RefreshCw, DollarSign, TrendingUp, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";

const API_URL = 'https://user-service-latest-bae8.onrender.com/api';

const PaymentsPage = () => {
  const token = useMemo(() => localStorage.getItem('authToken'), []);
  const user = useMemo(() => JSON.parse(localStorage.getItem('user')), []);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPayments = async (nextPage = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.set('page', String(nextPage));
      params.set('limit', '50');
      if (search) params.set('q', search);
      const resp = await fetch(`${API_URL}/admin/payments?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error('Failed to fetch payments');
      const data = await resp.json();
      setPayments(data.payments || []);
      setPage(data.pagination?.page || 1);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (e) {
      setError(e.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 0) return;
    fetchPayments(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = () => fetchPayments(1);

  const totalRevenue = payments.reduce((sum, p) => sum + (p.status === 'success' ? (p.amount || 0) / 100 : 0), 0);
  const successCount = payments.filter(p => p.status === 'success').length;
  const avgAmount = successCount > 0 ? Math.round(totalRevenue / successCount) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="space-y-5"
    >
      {/* Revenue Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Payments", value: payments.length, color: "#f97316", icon: CreditCard },
          { label: "Revenue", value: `₹${totalRevenue.toLocaleString()}`, color: "#34d399", icon: DollarSign },
          { label: "Successful", value: successCount, color: "#3b82f6", icon: CheckCircle },
          { label: "Avg Amount", value: `₹${avgAmount}`, color: "#8b5cf6", icon: TrendingUp },
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
            <h2 className="text-xl font-bold text-white">Payments</h2>
            <p className="text-xs text-slate-500 mt-1">All user payments with search and pagination</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search payments..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                className="bg-transparent outline-none text-sm text-slate-300 placeholder-slate-600 w-52"
              />
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={onSearch}
              className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
              style={{ background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}>
              <Search className="w-4 h-4" /> Search
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => fetchPayments(page)}
              className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
              style={{ background: "rgba(255,255,255,0.04)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }}>
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
              <tr style={{ background: "rgba(16,185,129,0.05)", borderBottom: "1px solid rgba(16,185,129,0.1)" }}>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Paid At</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Order ID</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Payment ID</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, idx) => {
                const initials = (p.userName || "?").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                const statusColors = {
                  success: { bg: "rgba(16,185,129,0.12)", color: "#34d399", border: "rgba(16,185,129,0.2)" },
                  failed: { bg: "rgba(239,68,68,0.12)", color: "#f87171", border: "rgba(239,68,68,0.2)" },
                  pending: { bg: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "rgba(251,191,36,0.2)" },
                };
                const sc = statusColors[p.status] || statusColors.pending;
                return (
                  <motion.tr
                    key={p._id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="transition-colors duration-200 border-b"
                    style={{ borderColor: "rgba(255,255,255,0.03)" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(16,185,129,0.03)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-400">{new Date(p.paidAt || p.createdAt).toLocaleString()}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white"
                          style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.3), rgba(16,185,129,0.15))", border: "1px solid rgba(16,185,129,0.25)" }}>
                          {initials}
                        </div>
                        <span className="font-semibold text-slate-200 text-sm">{p.userName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-sm text-slate-400">{p.userEmail}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-bold text-emerald-300">₹{(p.amount || 0) / 100}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs font-mono text-slate-500">{p.razorpayOrderId || '-'}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs font-mono text-slate-500">{p.razorpayPaymentId || '-'}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold"
                        style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                        {p.status}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
              {!payments.length && (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-sm text-slate-500">
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-600 border-t-emerald-400" />
                        Loading payments...
                      </div>
                    ) : 'No payments found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">Page {page} of {totalPages}</div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={page <= 1}
            onClick={() => fetchPayments(page - 1)}
            className="px-3 py-1.5 rounded-xl text-sm font-medium flex items-center gap-1 disabled:opacity-30 transition-all"
            style={{ background: "rgba(255,255,255,0.04)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={page >= totalPages}
            onClick={() => fetchPayments(page + 1)}
            className="px-3 py-1.5 rounded-xl text-sm font-medium flex items-center gap-1 disabled:opacity-30 transition-all"
            style={{ background: "rgba(255,255,255,0.04)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            Next <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentsPage;
