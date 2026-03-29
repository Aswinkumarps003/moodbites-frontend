import React from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

const StatCard = ({ label, value, icon: Icon, bgGradient, loading = false, error = false, delay = 0 }) => {
  const count = useSpring(0, { stiffness: 60, damping: 15 });
  const rounded = useTransform(count, latest => Math.round(latest));

  React.useEffect(() => {
    if (!loading && !error) {
      count.set(value);
    }
  }, [value, count, loading, error]);

  // Generate a gradient based on original bgGradient or fallback
  const gradientMap = {
    "bg-gradient-to-r from-orange-100 to-amber-200": { accent: "#f97316", glow: "rgba(249,115,22,0.15)", border: "rgba(249,115,22,0.2)" },
    "bg-gradient-to-r from-blue-100 to-cyan-200": { accent: "#3b82f6", glow: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.2)" },
    "bg-gradient-to-r from-green-100 to-emerald-200": { accent: "#10b981", glow: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.2)" },
    "bg-gradient-to-r from-purple-100 to-violet-200": { accent: "#8b5cf6", glow: "rgba(139,92,246,0.15)", border: "rgba(139,92,246,0.2)" },
  };

  const colors = gradientMap[bgGradient] || { accent: "#f97316", glow: "rgba(249,115,22,0.15)", border: "rgba(249,115,22,0.2)" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, type: "spring", stiffness: 100 }}
      whileHover={{
        y: -4,
        boxShadow: `0 8px 40px ${colors.glow}, 0 0 0 1px ${colors.border}`,
      }}
      className="relative overflow-hidden rounded-2xl p-6 flex flex-col items-start cursor-default"
      style={{
        background: "rgba(15,23,42,0.6)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${colors.border}`,
        boxShadow: `0 4px 20px ${colors.glow}`,
      }}
    >
      {/* Background glow orb */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-20 blur-2xl"
        style={{ background: colors.accent }}
      />

      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{
          background: `linear-gradient(135deg, ${colors.accent}22, ${colors.accent}11)`,
          border: `1px solid ${colors.accent}33`,
          boxShadow: `0 0 16px ${colors.accent}22`,
        }}
      >
        <Icon className="w-6 h-6" style={{ color: colors.accent }} />
      </div>

      {/* Value */}
      <motion.div className="text-3xl font-bold text-white mb-1">
        {loading ? (
          <div className="h-9 w-16 rounded-lg animate-pulse" style={{ background: "rgba(255,255,255,0.1)" }} />
        ) : error ? (
          <span className="text-red-400 text-lg">Error</span>
        ) : (
          <motion.span>{rounded}</motion.span>
        )}
      </motion.div>

      {/* Label */}
      <div className="text-sm text-slate-400 font-medium">{label}</div>

      {/* Decorative bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{
        background: `linear-gradient(90deg, transparent, ${colors.accent}66, transparent)`,
      }} />
    </motion.div>
  );
};

export default StatCard;
