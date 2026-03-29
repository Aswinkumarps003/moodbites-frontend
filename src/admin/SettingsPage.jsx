import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Bell, Moon, RotateCcw, Shield, Globe, Server, User, Info } from "lucide-react";

const Toggle = ({ enabled, onChange, color = "#f97316" }) => (
  <button
    onClick={() => onChange(!enabled)}
    className="relative w-12 h-6 rounded-full p-0.5 transition-all duration-300"
    style={{
      background: enabled
        ? `linear-gradient(135deg, ${color}, ${color}cc)`
        : "rgba(255,255,255,0.08)",
      border: `1px solid ${enabled ? `${color}44` : "rgba(255,255,255,0.12)"}`,
      boxShadow: enabled ? `0 0 12px ${color}33` : "none",
    }}
  >
    <motion.div
      animate={{ x: enabled ? 24 : 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="w-5 h-5 rounded-full bg-white shadow-lg"
    />
  </button>
);

const SettingsPage = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const user = useMemo(() => JSON.parse(localStorage.getItem("user") || "{}"), []);
  const initials = (user.name || "A").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const settingSections = [
    {
      title: "Notifications",
      icon: Bell,
      color: "#f97316",
      items: [
        { label: "Push Notifications", desc: "Get notified about new registrations", enabled: notifications, onChange: setNotifications },
        { label: "Email Alerts", desc: "Receive email summaries", enabled: emailAlerts, onChange: setEmailAlerts },
      ],
    },
    {
      title: "Appearance",
      icon: Moon,
      color: "#8b5cf6",
      items: [
        { label: "Dark Mode", desc: "Use dark theme for the dashboard", enabled: darkMode, onChange: setDarkMode },
        { label: "Auto Refresh", desc: "Automatically refresh data every 60s", enabled: autoRefresh, onChange: setAutoRefresh },
      ],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="space-y-5 max-w-3xl"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6"
        style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.2), rgba(245,158,11,0.15))", border: "1px solid rgba(249,115,22,0.25)" }}>
            <SettingsIcon className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Settings</h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage your admin preferences</p>
          </div>
        </div>
      </motion.div>

      {/* Admin Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl p-5"
        style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #f97316, #ef4444)",
              boxShadow: "0 0 20px rgba(249,115,22,0.3)",
            }}
          >
            {initials}
          </div>
          <div className="flex-1">
            <div className="text-lg font-bold text-white">{user.name || "Admin"}</div>
            <div className="text-sm text-slate-400">{user.email || "admin@moodbites.com"}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold"
                style={{ background: "rgba(249,115,22,0.15)", color: "#fb923c", border: "1px solid rgba(249,115,22,0.25)" }}>
                Administrator
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold"
                style={{ background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.25)" }}>
                Active
              </span>
            </div>
          </div>
          <User className="w-5 h-5 text-slate-600" />
        </div>
      </motion.div>

      {/* Setting Sections */}
      {settingSections.map((section, sIdx) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + sIdx * 0.05 }}
          className="rounded-2xl p-5"
          style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <section.icon className="w-4 h-4" style={{ color: section.color }} />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{section.title}</h3>
          </div>
          <div className="space-y-4">
            {section.items.map((item, i) => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-200">{item.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                </div>
                <Toggle enabled={item.enabled} onChange={item.onChange} color={section.color} />
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl p-5"
        style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(239,68,68,0.12)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <RotateCcw className="w-4 h-4 text-red-400" />
          <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider">Danger Zone</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-slate-200">Reset All Caches</div>
            <div className="text-xs text-slate-500 mt-0.5">Clear local storage and reload dashboard</div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
            style={{
              background: "rgba(239,68,68,0.12)",
              color: "#f87171",
              border: "1px solid rgba(239,68,68,0.25)",
            }}
            onClick={() => {
              if (confirm("Are you sure? This will clear cached data.")) {
                window.location.reload();
              }
            }}
          >
            Reset
          </motion.button>
        </div>
      </motion.div>

      {/* Platform Info */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl p-5"
        style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Platform</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Version", value: "2.0.0", icon: Globe },
            { label: "Environment", value: "Production", icon: Server },
            { label: "Auth", value: "JWT + Role-Based", icon: Shield },
            { label: "Frontend", value: "React + Vite", icon: Globe },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <item.icon className="w-3.5 h-3.5 text-slate-600" />
              <div>
                <div className="text-[10px] text-slate-600 uppercase">{item.label}</div>
                <div className="text-xs text-slate-300 font-medium">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SettingsPage;
