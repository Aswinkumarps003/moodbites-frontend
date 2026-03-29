import React from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-3 py-2 rounded-lg text-xs"
        style={{
          background: "rgba(15,23,42,0.95)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        <p className="text-slate-400 mb-1">{label}</p>
        <p className="text-white font-bold">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const ChartCard = ({ title, type, data, color = "#f97316" }) => {
  const COLORS = ["#f97316", "#8b5cf6", "#3b82f6", "#10b981", "#ef4444", "#f59e0b"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, boxShadow: `0 8px 40px rgba(0,0,0,0.2)` }}
      transition={{ duration: 0.4, type: "spring" }}
      className="rounded-2xl p-6 flex flex-col min-w-[280px]"
      style={{
        background: "rgba(15,23,42,0.6)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="font-bold text-lg text-white">{title}</div>
        <div
          className="w-2 h-2 rounded-full"
          style={{
            background: color,
            boxShadow: `0 0 8px ${color}88`,
          }}
        />
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          {type === "line" ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={3}
                dot={{ r: 4, fill: color, strokeWidth: 2, stroke: "#0f172a" }}
                activeDot={{ r: 7, fill: color, stroke: "#0f172a", strokeWidth: 3 }}
              />
            </LineChart>
          ) : type === "area" ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={3}
                fill={`url(#gradient-${color.replace('#', '')})`}
                dot={{ r: 4, fill: color, strokeWidth: 2, stroke: "#0f172a" }}
                activeDot={{ r: 7, fill: color, stroke: "#0f172a", strokeWidth: 3 }}
              />
            </AreaChart>
          ) : type === "pie" ? (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          ) : (
            <BarChart data={data}>
              <defs>
                <linearGradient id={`barGradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="value"
                fill={`url(#barGradient-${color.replace('#', '')})`}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default ChartCard;
