import React, { useState } from "react";
import { motion } from "framer-motion";

const SettingsPage = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.4, type: "spring" }}
      className="bg-white rounded-2xl shadow-lg p-6 max-w-xl"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-6">Settings</h2>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-800">Enable Notifications</span>
          <button
            onClick={() => setNotifications(v => !v)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${notifications ? "bg-orange-400" : "bg-gray-300"}`}
          >
            <span className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${notifications ? "translate-x-6" : "translate-x-0"}`}></span>
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-800">Dark Mode</span>
          <button
            onClick={() => setDarkMode(v => !v)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${darkMode ? "bg-gray-900" : "bg-gray-300"}`}
          >
            <span className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${darkMode ? "translate-x-6" : "translate-x-0"}`}></span>
          </button>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="font-semibold text-gray-800">Reset Demo Data</span>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold shadow hover:bg-red-600 transition-all duration-200"
            onClick={() => alert("Demo data reset!")}
          >
            Reset
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;


