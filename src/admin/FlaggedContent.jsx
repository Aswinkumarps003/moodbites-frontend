import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flag, AlertTriangle, Eye } from "lucide-react";
import axios from "axios";

const FOOD_API = "https://food-service-new.onrender.com/api/food";

const FlaggedContent = () => {
  const [flagged, setFlagged] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlagged = async () => {
      try {
        const response = await axios.get(`${FOOD_API}/dishes?include_inactive=true`);
        const allRecipes = response.data || [];
        // Show inactive (flagged/deactivated) recipes
        const inactive = allRecipes
          .filter((r) => !r.is_active)
          .slice(0, 5);
        setFlagged(inactive);
      } catch (err) {
        console.error("Error fetching flagged content:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFlagged();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-6 min-w-[220px]"
      style={{
        background: "rgba(15,23,42,0.6)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="font-bold text-lg text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          Flagged Content
        </div>
        <span
          className="px-2 py-1 rounded-lg text-xs font-bold"
          style={{
            background: flagged.length > 0 ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)",
            color: flagged.length > 0 ? "#f87171" : "#34d399",
            border: `1px solid ${flagged.length > 0 ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}`,
          }}
        >
          {flagged.length} items
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
          ))}
        </div>
      ) : flagged.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: "rgba(16,185,129,0.1)" }}>
            <Eye className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-sm text-slate-400">No flagged content</p>
          <p className="text-xs text-slate-600 mt-1">All content is active</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {flagged.map((item, idx) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ x: 4 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
              style={{
                background: "rgba(239,68,68,0.05)",
                border: "1px solid rgba(239,68,68,0.1)",
              }}
            >
              <Flag className="w-4 h-4 text-red-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-200 truncate">{item.title}</div>
                <div className="text-xs text-slate-500">{item.mood} • Deactivated</div>
              </div>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-bold flex-shrink-0"
                style={{
                  background: "rgba(239,68,68,0.15)",
                  color: "#f87171",
                }}
              >
                Inactive
              </span>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};

export default FlaggedContent;
