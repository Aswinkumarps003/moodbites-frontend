import React from "react";
import { motion } from "framer-motion";

const feedbacks = [
  { user: "Alice Smith", message: "Love the new dashboard!", date: "2024-06-01", status: "Read" },
  { user: "Bob Lee", message: "Recipe scan was slow.", date: "2024-06-02", status: "Unread" },
  { user: "Carol Jones", message: "Great diet plans!", date: "2024-06-03", status: "Read" },
];

const FeedbackPage = () => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 40 }}
    transition={{ duration: 0.4, type: "spring" }}
    className="bg-white rounded-2xl shadow-lg p-6"
  >
    <h2 className="text-xl font-bold text-gray-900 mb-6">User Feedback</h2>
    <ul className="divide-y divide-gray-100">
      {feedbacks.map((fb, idx) => (
        <motion.li
          key={fb.user + fb.date}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="py-4 flex flex-col md:flex-row md:items-center md:justify-between hover:bg-orange-50 rounded-xl px-2"
        >
          <div>
            <span className="font-semibold text-gray-800">{fb.user}</span>
            <span className="ml-2 text-gray-500 text-sm">{fb.date}</span>
            <div className="text-gray-700 mt-1">{fb.message}</div>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-bold mt-2 md:mt-0 ${fb.status === "Read" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{fb.status}</span>
        </motion.li>
      ))}
    </ul>
  </motion.div>
);

export default FeedbackPage;


