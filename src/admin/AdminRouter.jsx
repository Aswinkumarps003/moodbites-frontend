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
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.4, type: "spring" }}
        className="flex flex-col gap-6"
      >
        {/* Refresh Button */}
        <div className="flex justify-end">
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
        {/* Charts and Lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ChartCard title="Weekly Registrations" type="line" data={chartData.userRegistration} />
          <ChartCard title="User Distribution" type="bar" data={chartData.userRoles} />
          <RecipeList />
        </div>
        {/* Flagged Content & System Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-stone-100">
      <Sidebar activePage={activePage} setActivePage={setActivePage} navOrder={navOrder} />
      <main className="flex-1 flex flex-col overflow-x-hidden">
        <Navbar pageTitle={activePage + (activePage === "Dashboard" ? " Overview" : "")} />
        <div className="p-6">
          <AnimatePresence mode="wait">
            <PageComponent key={activePage} />
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AdminRouter;