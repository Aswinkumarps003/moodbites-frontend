import React from "react";
import ChartCard from "./ChartCard";
import { motion } from "framer-motion";

const aiData = [
  { name: "Jan", value: 120 },
  { name: "Feb", value: 210 },
  { name: "Mar", value: 180 },
  { name: "Apr", value: 250 },
  { name: "May", value: 300 },
  { name: "Jun", value: 200 },
];

const events = [
  { id: 1, desc: "AI flagged a suspicious recipe.", time: "2h ago" },
  { id: 2, desc: "New AI model deployed.", time: "1d ago" },
  { id: 3, desc: "AI scan completed for user Bob.", time: "3d ago" },
];

const AIInsightsPage = () => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 40 }}
    transition={{ duration: 0.4, type: "spring" }}
    className="flex flex-col gap-8"
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <ChartCard title="AI Usage Over Time" type="line" data={aiData} />
      <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">AI Summary</h2>
        <p className="text-gray-700 mb-2">AI has processed <span className="font-bold text-orange-600">1,200</span> scans this month, flagged <span className="font-bold text-red-500">3</span> suspicious recipes, and improved recommendation accuracy by <span className="font-bold text-green-600">8%</span>.</p>
        <p className="text-gray-500 text-sm">Last model update: 2 days ago</p>
      </div>
    </div>
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-bold mb-4 text-gray-900">Recent AI Events</h3>
      <ul className="divide-y divide-gray-100">
        {events.map(e => (
          <li key={e.id} className="py-3 flex items-center justify-between">
            <span className="text-gray-700">{e.desc}</span>
            <span className="text-xs text-gray-400">{e.time}</span>
          </li>
        ))}
      </ul>
    </div>
  </motion.div>
);

export default AIInsightsPage;


