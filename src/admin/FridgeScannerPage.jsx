import React from "react";
import { motion } from "framer-motion";

const logs = [
  { user: "Alice Smith", date: "2024-06-01", items: "Milk, Eggs, Spinach", status: "Success" },
  { user: "Bob Lee", date: "2024-06-02", items: "Chicken, Broccoli", status: "Success" },
  { user: "Carol Jones", date: "2024-06-03", items: "Expired Yogurt", status: "Flagged" },
];

const FridgeScannerPage = () => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 40 }}
    transition={{ duration: 0.4, type: "spring" }}
    className="bg-white rounded-2xl shadow-lg p-6"
  >
    <h2 className="text-xl font-bold text-gray-900 mb-6">Fridge Scanner Logs</h2>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-amber-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">User</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Items Detected</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {logs.map((log, idx) => (
            <motion.tr
              key={log.user + log.date}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="hover:bg-orange-50"
            >
              <td className="px-6 py-4 whitespace-nowrap font-semibold">{log.user}</td>
              <td className="px-6 py-4 whitespace-nowrap">{log.date}</td>
              <td className="px-6 py-4 whitespace-nowrap">{log.items}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 rounded text-xs font-bold ${log.status === "Success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{log.status}</span>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  </motion.div>
);

export default FridgeScannerPage;


