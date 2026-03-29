import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import StatCard from "./StatCard";
import ChartCard from "./ChartCard";
import RecipeList from "./RecipeList";
import FlaggedContent from "./FlaggedContent";
import StatusCard from "./StatusCard";
import UsersPage from "./UsersPage";
import RecipesPage from "./RecipesPage";
import AIInsightsPage from "./AIInsightsPage";
import DietPlansPage from "./DietPlansPage";
import FeedbackPage from "./FeedbackPage";
import SettingsPage from "./SettingsPage";
import PaymentsPage from "./PaymentsPage";
import DashboardStats from "./DashboardStats";
import { motion, AnimatePresence } from "framer-motion";

const pageComponents = {
  Dashboard: () => {
    const { stats, chartData, refreshData } = DashboardStats();
    
    return (
      <motion.div
        key="dashboard"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="flex flex-col gap-6"
      >
        {/* Refresh Button */}
        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshData}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(245,158,11,0.1))",
              color: "#fb923c",
              border: "1px solid rgba(249,115,22,0.2)",
              boxShadow: "0 0 20px rgba(249,115,22,0.1)",
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </motion.button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, idx) => (
            <StatCard key={stat.label} {...stat} delay={idx * 0.1} />
          ))}
        </div>

        {/* Charts and Lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <ChartCard title="Weekly Registrations" type="area" data={chartData.userRegistration} color="#f97316" />
          <ChartCard title="User Distribution" type="bar" data={chartData.userRoles} color="#8b5cf6" />
          <RecipeList />
        </div>

        {/* Flagged Content & System Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FlaggedContent />
          <StatusCard />
        </div>
      </motion.div>
    );
  },
  Users: UsersPage,
  Recipes: RecipesPage,
  "AI Insights": AIInsightsPage,
  "Diet Plans": DietPlansPage,
  Payments: PaymentsPage,
  Feedback: FeedbackPage,
  Settings: SettingsPage,
};

const navOrder = [
  "Dashboard",
  "Users",
  "Recipes",
  "AI Insights",
  "Diet Plans",
  "Payments",
  "Feedback",
  "Settings",
];

const AdminRouter = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [activePage, setActivePage] = useState("Dashboard");
  if (!user || user.role !== 0) return null;
  const PageComponent = pageComponents[activePage];
  return (
    <div
      className="flex min-h-screen"
      style={{
        background: "linear-gradient(135deg, #0a0e1a 0%, #0f172a 30%, #1a1040 70%, #0f172a 100%)",
      }}
    >
      {/* Animated background mesh */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 50%, rgba(249,115,22,0.04) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.04) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 80%, rgba(59,130,246,0.03) 0%, transparent 50%)
          `,
        }}
      />

      <Sidebar activePage={activePage} setActivePage={setActivePage} navOrder={navOrder} />
      <main className="flex-1 flex flex-col overflow-x-hidden relative z-10">
        <div className="p-6">
          <Navbar pageTitle={activePage + (activePage === "Dashboard" ? " Overview" : "")} />
          <AnimatePresence mode="wait">
            <PageComponent key={activePage} />
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AdminRouter;