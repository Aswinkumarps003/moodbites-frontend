import React from "react";
import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const ChartCard = ({ title, type, data }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.03, boxShadow: "0 8px 32px rgba(241, 1, 0, 0.10)" }}
    className="rounded-2xl p-6 shadow-lg bg-white flex flex-col min-w-[280px]"
  >
    <div className="font-bold text-lg mb-4 text-gray-800">{title}</div>
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        {type === "line" ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#F10100" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#FFD122" radius={[8, 8, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  </motion.div>
);

export default ChartCard;
