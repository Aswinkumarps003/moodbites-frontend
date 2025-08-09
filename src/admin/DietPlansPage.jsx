import React from "react";
import { motion } from "framer-motion";

const plans = [
  { name: "Keto Kickstart", type: "Keto", users: 120, status: "Active" },
  { name: "Vegan Vitality", type: "Vegan", users: 80, status: "Active" },
  { name: "Low-Carb Lite", type: "Low-Carb", users: 45, status: "Inactive" },
];

const DietPlansPage = () => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 40 }}
    transition={{ duration: 0.4, type: "spring" }}
    className="bg-white rounded-2xl shadow-lg p-6"
  >
    <h2 className="text-xl font-bold text-gray-900 mb-6">Diet Plans</h2>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-amber-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Users</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {plans.map((plan, idx) => (
            <motion.tr
              key={plan.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="hover:bg-orange-50"
            >
              <td className="px-6 py-4 whitespace-nowrap font-semibold">{plan.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{plan.type}</td>
              <td className="px-6 py-4 whitespace-nowrap">{plan.users}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 rounded text-xs font-bold ${plan.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{plan.status}</span>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  </motion.div>
);

export default DietPlansPage;


