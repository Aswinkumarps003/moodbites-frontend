import React from "react";
import { Bell, Search, UserCircle } from "lucide-react";
import { motion } from "framer-motion";

const Navbar = ({ pageTitle }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const initials = (user.name || "A")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header
      className="flex items-center justify-between px-8 py-4 mb-6 mx-1 rounded-2xl"
      style={{
        background: "rgba(15,23,42,0.6)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 4px 30px rgba(0,0,0,0.15)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          {pageTitle || "Dashboard Overview"}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </motion.div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Quick search..."
            className="bg-transparent outline-none text-sm text-slate-300 placeholder-slate-600 w-36"
          />
        </motion.div>

        {/* Notification */}
        <motion.button
          whileHover={{ scale: 1.15, rotate: 10 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2 rounded-xl transition-all duration-300"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Bell className="w-5 h-5 text-slate-400" />
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full"
            style={{
              background: "linear-gradient(135deg, #f97316, #ef4444)",
              boxShadow: "0 0 8px rgba(249,115,22,0.6)",
            }}
          />
        </motion.button>

        {/* Profile */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-3 pl-4 cursor-pointer"
          style={{ borderLeft: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-slate-200">{user.name || "Admin"}</div>
            <div className="text-[10px] text-slate-500">Administrator</div>
          </div>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #f97316, #ef4444)",
              boxShadow: "0 0 16px rgba(249,115,22,0.3)",
            }}
          >
            {initials}
          </div>
        </motion.div>
      </div>
    </header>
  );
};

export default Navbar;
