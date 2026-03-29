import React from "react";
import { Home, Users, BookOpen, Brain, Salad, MessageCircle, Settings, LogOut, CreditCard, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const iconMap = {
  Dashboard: Home,
  Users: Users,
  Recipes: BookOpen,
  "AI Insights": Brain,
  "Diet Plans": Salad,
  Payments: CreditCard,
  Feedback: MessageCircle,
  Settings: Settings,
};

const Sidebar = ({ activePage, setActivePage, navOrder }) => (
  <motion.aside
    initial={{ x: -80, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ type: "spring", stiffness: 70, damping: 18 }}
    className="h-screen w-72 flex flex-col justify-between p-5 sticky top-0"
    style={{
      background: "linear-gradient(180deg, rgba(15,23,42,0.97) 0%, rgba(30,27,75,0.95) 100%)",
      backdropFilter: "blur(24px)",
      borderRight: "1px solid rgba(255,255,255,0.06)",
      boxShadow: "4px 0 40px rgba(0,0,0,0.3)",
    }}
  >
    <div>
      {/* Logo */}
      <motion.div
        className="flex items-center gap-3 mb-10 px-3 pt-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #f97316, #f59e0b, #ef4444)",
            boxShadow: "0 0 20px rgba(249,115,22,0.4)",
          }}
        >
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
            MoodBites
          </span>
          <div className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">Admin Panel</div>
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {navOrder.map((label, idx) => {
          const Icon = iconMap[label] || Home;
          const isActive = activePage === label;
          return (
            <motion.button
              key={label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * idx, type: "spring", stiffness: 100 }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActivePage(label)}
              className="relative flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 text-sm group"
              style={{
                background: isActive
                  ? "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(245,158,11,0.1))"
                  : "transparent",
                color: isActive ? "#fb923c" : "#94a3b8",
                border: isActive ? "1px solid rgba(249,115,22,0.2)" : "1px solid transparent",
              }}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active glow indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                  style={{
                    background: "linear-gradient(180deg, #f97316, #f59e0b)",
                    boxShadow: "0 0 12px rgba(249,115,22,0.6)",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon
                className="w-5 h-5 transition-all duration-300"
                style={{
                  filter: isActive ? "drop-shadow(0 0 6px rgba(249,115,22,0.5))" : "none",
                }}
              />
              <span>{label}</span>
              {isActive && (
                <motion.div
                  className="absolute right-3 w-1.5 h-1.5 rounded-full bg-orange-400"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>
    </div>

    {/* Logout button */}
    <motion.button
      whileHover={{ scale: 1.02, x: 3 }}
      whileTap={{ scale: 0.97 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300"
      style={{
        background: "rgba(239,68,68,0.08)",
        color: "#f87171",
        border: "1px solid rgba(239,68,68,0.15)",
      }}
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
      <LogOut className="w-5 h-5" />
      Logout
    </motion.button>
  </motion.aside>
);

export default Sidebar;
