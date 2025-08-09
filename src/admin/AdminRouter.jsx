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
import FridgeScannerPage from "./FridgeScannerPage";
import DietPlansPage from "./DietPlansPage";
import FeedbackPage from "./FeedbackPage";
import SettingsPage from "./SettingsPage";
import { Users, Brain, Smile, Dumbbell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const stats = [
  { label: "Total Users", value: 12430, icon: Users, bgGradient: "bg-gradient-to-r from-orange-100 to-amber-200" },
  { label: "AI Scans", value: 8219, icon: Brain, bgGradient: "bg-gradient-to-r from-amber-100 to-orange-200" },
  { label: "Mood Trends", value: 78, icon: Smile, bgGradient: "bg-gradient-to-r from-yellow-100 to-orange-100" },
  { label: "Gym Plans", value: 1522, icon: Dumbbell, bgGradient: "bg-gradient-to-r from-lime-100 to-green-100" },
];

const lineData = [
  { name: "Mon", value: 120 },
  { name: "Tue", value: 210 },
  { name: "Wed", value: 180 },
  { name: "Thu", value: 250 },
  { name: "Fri", value: 300 },
  { name: "Sat", value: 200 },
  { name: "Sun", value: 400 },
];

const barData = [
  { name: "Calorie Intake", value: 2200 },
  { name: "Calorie Burn", value: 1800 },
];

const pageComponents = {
  Dashboard: () => (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.4, type: "spring" }}
      className="flex flex-col gap-6"
    >
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
      {/* Charts and Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ChartCard title="Top Active Users" type="line" data={lineData} />
        <ChartCard title="Diet Trends" type="bar" data={barData} />
        <RecipeList />
      </div>
      {/* Flagged Content & System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <FlaggedContent />
        <StatusCard />
      </div>
    </motion.div>
  ),
  Users: UsersPage,
  Recipes: RecipesPage,
  "AI Insights": AIInsightsPage,
  "Fridge Scanner": FridgeScannerPage,
  "Diet Plans": DietPlansPage,
  Feedback: FeedbackPage,
  Settings: SettingsPage,
};

const navOrder = [
  "Dashboard",
  "Users",
  "Recipes",
  "AI Insights",
  "Fridge Scanner",
  "Diet Plans",
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