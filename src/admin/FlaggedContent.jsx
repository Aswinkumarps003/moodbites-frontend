import React from "react";
import { motion } from "framer-motion";
import { Flag } from "lucide-react";

const flagged = [
  { id: 1024, status: "Pending" },
  { id: 983, status: "Reviewed" }
];

const statusColor = status =>
  status === "Pending" ? "text-red-600 bg-red-50" : "text-yellow-700 bg-yellow-50";

const FlaggedContent = () => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl p-6 shadow-lg bg-white min-w-[220px]"
  >
    <div className="font-bold text-lg mb-4 text-gray-800">Flagged Content</div>
    <ul className="space-y-3">
      {flagged.map(item => (
        <motion.li
          key={item.id}
          whileHover={{ scale: 1.04 }}
          className={`flex items-center gap-3 px-4 py-2 rounded-xl font-semibold ${statusColor(item.status)}`}
        >
          <Flag className="w-5 h-5 mr-2 text-red-400" />
          Recipe {item.id}
          <span className="ml-auto text-xs px-2 py-1 rounded bg-white border border-gray-200">{item.status}</span>
        </motion.li>
      ))}
    </ul>
  </motion.div>
);

export default FlaggedContent;
