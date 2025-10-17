import React from "react";
import { motion } from "framer-motion";

const DietPlansPage = () => {
  const [plans, setPlans] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [savingId, setSavingId] = React.useState(null);

  React.useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) Fetch all active diet plans from diet-service
        const dietResp = await fetch('http://localhost:5005/api/diet-plans');
        if (!dietResp.ok) throw new Error(`diet-service ${dietResp.status}`);
        const dietJson = await dietResp.json();
        const dietPlans = dietJson?.dietPlans || [];

        // 2) Collect unique userIds
        const userIds = Array.from(new Set(dietPlans.map(p => p.userId)));

        // 3) Fetch user details in batch from user-service
        const usersResp = await fetch('https://user-service-o0l2.onrender.com/api/users/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userIds })
        });
        if (!usersResp.ok) throw new Error(`user-service ${usersResp.status}`);
        const usersArr = await usersResp.json();
        const userMap = new Map(usersArr.map(u => [String(u._id), u]));

        // 4) Merge user details into plans
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
    fetchPlans();
  }, []);

  const toggleStatus = async (planId, nextActive) => {
    try {
      setSavingId(planId);
      const resp = await fetch(`http://localhost:5005/api/diet-plans/${planId}/status`, {
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
      alert('Failed to update status');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.4, type: "spring" }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-6">Diet Plans</h2>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">{String(error)}</div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-amber-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Plan Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Calories</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Diet Pref</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr><td className="px-6 py-4 text-gray-500" colSpan={7}>Loading...</td></tr>
            ) : plans.length === 0 ? (
              <tr><td className="px-6 py-4 text-gray-500" colSpan={7}>No plans found</td></tr>
            ) : (
              plans.map((plan, idx) => (
                <motion.tr
                  key={plan._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="hover:bg-orange-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap font-semibold">{plan.planName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{plan.userName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{plan.userEmail}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{plan.totalCalories}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{plan.dietMeta?.dietPreference || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${plan.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{plan.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      disabled={savingId === plan._id}
                      onClick={() => toggleStatus(plan._id, !plan.isActive)}
                      className={`px-3 py-1 rounded text-xs font-semibold ${plan.isActive ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'} disabled:opacity-60`}
                    >
                      {savingId === plan._id ? 'Saving...' : (plan.isActive ? 'Deactivate' : 'Activate')}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(plan.createdAt).toLocaleDateString()}</td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default DietPlansPage;


