import React, { useState, useEffect } from "react";
import ChartCard from "./ChartCard";
import { motion } from "framer-motion";
import axios from "axios";
import { Brain, Users, BookOpen, Salad, TrendingUp, BarChart3, PieChart, Activity } from "lucide-react";

const FOOD_API = "https://food-service-new.onrender.com/api/food";
const USER_API = "https://user-service-latest-bae8.onrender.com/api";
const DIET_API = "https://diet-service-latest.onrender.com/api";

const AIInsightsPage = () => {
  const [moodData, setMoodData] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [summaryStats, setSummaryStats] = useState({ totalRecipes: 0, totalUsers: 0, totalDietPlans: 0, activeDietPlans: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');

        // Fetch recipes for mood distribution
        const recipeResp = await axios.get(`${FOOD_API}/dishes?include_inactive=true`);
        const recipes = recipeResp.data || [];

        // Mood distribution
        const moodCounts = {};
        recipes.forEach(r => {
          const mood = r.mood || 'Unknown';
          moodCounts[mood] = (moodCounts[mood] || 0) + 1;
        });
        setMoodData(Object.entries(moodCounts).map(([name, value]) => ({ name, value })));

        // Fetch users
        const [pResp, dResp] = await Promise.all([
          fetch(`${USER_API}/user/users/role/1`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${USER_API}/user/users/role/2`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const patients = pResp.ok ? (await pResp.json()).users || [] : [];
        const dieticians = dResp.ok ? (await dResp.json()).users || [] : [];
        const allUsers = [...patients, ...dieticians];

        // User registration by month
        const monthMap = {};
        allUsers.forEach(u => {
          if (u.createdAt) {
            const d = new Date(u.createdAt);
            const key = d.toLocaleString('default', { month: 'short' });
            monthMap[key] = (monthMap[key] || 0) + 1;
          }
        });
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        setUserGrowth(months.filter(m => monthMap[m]).map(m => ({ name: m, value: monthMap[m] || 0 })));

        // Fetch diet plans
        let dietPlans = [];
        try {
          const dietResp = await fetch(`${DIET_API}/diet-plans`);
          if (dietResp.ok) {
            const dJson = await dietResp.json();
            dietPlans = dJson?.dietPlans || [];
          }
        } catch (e) { /* ignore */ }

        setSummaryStats({
          totalRecipes: recipes.length,
          totalUsers: allUsers.length,
          totalDietPlans: dietPlans.length,
          activeDietPlans: dietPlans.filter(p => p.isActive).length,
        });
      } catch (err) {
        console.error("Error fetching AI insights:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  const insights = [
    { label: "Total Users", value: summaryStats.totalUsers, icon: Users, color: "#3b82f6", desc: "Registered on platform" },
    { label: "Total Recipes", value: summaryStats.totalRecipes, icon: BookOpen, color: "#f97316", desc: "User-submitted recipes" },
    { label: "Diet Plans", value: summaryStats.totalDietPlans, icon: Salad, color: "#8b5cf6", desc: "Generated plans" },
    { label: "Active Plans", value: summaryStats.activeDietPlans, icon: Activity, color: "#34d399", desc: "Currently in use" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="space-y-5"
    >
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6"
        style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.15))", border: "1px solid rgba(139,92,246,0.25)" }}>
            <Brain className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI & Analytics Insights</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time platform analytics from all services</p>
          </div>
        </div>
      </motion.div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {insights.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -3 }}
            className="rounded-xl p-4"
            style={{ background: "rgba(15,23,42,0.6)", border: `1px solid ${s.color}22`, boxShadow: `0 0 20px ${s.color}08` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15`, border: `1px solid ${s.color}22` }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-400 opacity-50" />
            </div>
            <div className="text-2xl font-bold text-white mb-0.5">
              {loading ? <div className="h-7 w-12 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.1)" }} /> : s.value}
            </div>
            <div className="text-xs text-slate-400">{s.label}</div>
            <div className="text-[10px] text-slate-600 mt-1">{s.desc}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ChartCard
          title="Recipe Mood Distribution"
          type="bar"
          data={moodData.length > 0 ? moodData : [{ name: "Loading...", value: 0 }]}
          color="#f97316"
        />
        <ChartCard
          title="User Registration Growth"
          type="area"
          data={userGrowth.length > 0 ? userGrowth : [{ name: "Loading...", value: 0 }]}
          color="#8b5cf6"
        />
      </div>

      {/* Mood Breakdown Cards */}
      {moodData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-6"
          style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-orange-400" />
            Mood Category Breakdown
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {moodData.map((mood, idx) => {
              const moodColors = {
                happy: "#fbbf24", sad: "#60a5fa", stressed: "#f87171", energetic: "#34d399",
                calm: "#a78bfa", angry: "#ef4444", tired: "#94a3b8", anxious: "#fb923c",
              };
              const color = moodColors[mood.name.toLowerCase()] || "#94a3b8";
              const totalRecipes = summaryStats.totalRecipes || 1;
              const percent = Math.round((mood.value / totalRecipes) * 100);
              return (
                <motion.div
                  key={mood.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + idx * 0.03 }}
                  whileHover={{ y: -2 }}
                  className="rounded-xl p-3 text-center"
                  style={{ background: `${color}08`, border: `1px solid ${color}20` }}
                >
                  <div className="text-lg font-bold text-white">{mood.value}</div>
                  <div className="text-xs font-medium capitalize" style={{ color }}>{mood.name}</div>
                  <div className="text-[10px] text-slate-600 mt-1">{percent}%</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AIInsightsPage;
