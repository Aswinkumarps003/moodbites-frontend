import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const StatusCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(34,197,94,0.15)" }}
    className="rounded-2xl p-6 shadow-2xl bg-gradient-to-br from-green-200 to-green-50 flex items-center gap-4 min-w-[220px] border border-green-100"
    style={{ boxShadow: "0 4px 32px 0 rgba(34,197,94,0.10), 0 1.5px 0 0 #fff inset" }}
  >
    <CheckCircle2 className="w-10 h-10 text-green-500 drop-shadow-lg" />
    <div className="flex flex-col">
      <span className="text-lg font-bold text-green-800">MoodBITES Operational</span>
      <span className="text-green-600 text-xs mt-1">All systems running smoothly</span>
    </div>
  </motion.div>
);

export default StatusCard;
