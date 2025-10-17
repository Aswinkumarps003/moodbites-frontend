import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const USER_SERVICE_URL = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:5000';
const API_URL = `${USER_SERVICE_URL}/api`;

const PaymentsTable = ({ payments, loading, height = 420 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-lg p-4"
    >
      <div className="overflow-x-auto">
        <div className="rounded-xl border border-gray-100" style={{ maxHeight: height }}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Paid At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Payment ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {payments.map((p, idx) => (
                <motion.tr
                  key={p._id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="hover:bg-emerald-50/40"
                >
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">{new Date(p.paidAt || p.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-3 whitespace-nowrap font-semibold">{p.userName}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">{p.userEmail}</td>
                  <td className="px-6 py-3 whitespace-nowrap font-semibold">₹{(p.amount || 0) / 100}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-xs font-mono text-gray-600">{p.razorpayOrderId || '-'}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-xs font-mono text-gray-600">{p.razorpayPaymentId || '-'}</td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'success' ? 'bg-emerald-100 text-emerald-700' : p.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {p.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
              {!payments.length && (
                <tr>
                  <td colSpan="7" className="px-6 py-6 text-center text-sm text-gray-500">{loading ? 'Loading payments...' : 'No payments found.'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

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
            <h2 className="text-2xl font-bold text-gray-900">Payments</h2>
            <p className="text-gray-500 text-sm">View all user payments with search and pagination.</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search (name, email, order id, payment id)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-400 focus:border-emerald-400 w-[320px]"
            />
            <button
              onClick={onSearch}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow hover:shadow-md"
            >
              Search
            </button>
            <button
              onClick={() => fetchPayments(page)}
              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
            >
              Refresh
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</div>
        )}
      </div>

      <PaymentsTable payments={payments} loading={loading} />

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => fetchPayments(page - 1)}
            className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 disabled:opacity-50"
          >
            Prev
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => fetchPayments(page + 1)}
            className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentsPage;




