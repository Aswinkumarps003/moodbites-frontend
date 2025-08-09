import React from "react";
import { motion, useSpring, useTransform } from "framer-motion";

const StatCard = ({ label, value, icon: Icon, bgGradient }) => {
  const count = useSpring(value, { stiffness: 80, damping: 15 });
  const rounded = useTransform(count, latest => Math.round(latest));

  React.useEffect(() => {
    count.set(value);
  }, [value, count]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05, boxShadow: "0 8px 32px rgba(241, 1, 0, 0.12)" }}
      className={`rounded-2xl p-6 shadow-lg flex flex-col items-start min-w-[180px] ${bgGradient}`}
    >
      <div className="text-3xl mb-2"><Icon /></div>
      <motion.div className="text-3xl font-bold text-gray-900 mb-1">
        {rounded}
      </motion.div>
      <div className="text-md text-gray-600 font-semibold">{label}</div>
    </motion.div>
  );
};

export default StatCard;
