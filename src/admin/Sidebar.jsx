import React from "react";
import { Home, Users, BookOpen, Brain, Salad, MessageCircle, Settings, LogOut } from "lucide-react";
import { motion } from "framer-motion";

const iconMap = {
  Dashboard: Home,
  Users: Users,
  Recipes: BookOpen,
  "AI Insights": Brain,
  "Diet Plans": Salad,
  Feedback: MessageCircle,
  Settings: Settings,
};

const Sidebar = ({ activePage, setActivePage, navOrder }) => (
  <motion.aside
    initial={{ x: -80, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ type: "spring", stiffness: 80 }}
    className="h-screen w-64 bg-gradient-to-b from-amber-100 to-orange-200 shadow-2xl flex flex-col justify-between p-6 rounded-2xl"
  >
    <div>
      <div className="text-2xl font-extrabold text-orange-600 mb-10 tracking-tight select-none">MoodBites</div>
      <nav className="flex flex-col gap-2">
        {navOrder.map((label) => {
          const Icon = iconMap[label];
          const isActive = activePage === label;
          return (
            <motion.button
              key={label}
              whileHover={{ scale: 1.05, x: 8 }}
              onClick={() => setActivePage(label)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 text-lg ${isActive ? "bg-orange-300 text-orange-900 shadow-md" : "text-orange-700 hover:bg-orange-200"}`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="w-6 h-6" />
              {label}
            </motion.button>
          );
        })}
      </nav>
    </div>
    <motion.button
      whileHover={{ scale: 1.05 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-red-600 bg-red-100 hover:bg-red-200 transition-all duration-200"
      onClick={() => {
        try {
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          window.dispatchEvent(new Event('moodbites-logout'));
        } finally {
          window.location.href = '/login';
        }
      }}
    >
      <LogOut className="w-6 h-6" />
      Logout
    </motion.button>
  </motion.aside>
);

export default Sidebar;
