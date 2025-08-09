import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Recipes from "./pages/Recipes";
import SubmitRecipe from "./pages/SubmitRecipe";
import ManageRecipe from "./pages/ManageRecipe";
import Profile from "./pages/Profile";
import FridgeScanner from "./pages/FridgeScanner";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import DebugLogout from "./pages/DebugLogout";
import AdminRouter from "./admin/AdminRouter";
import DieticianDashboard from "./pages/DieticianDashboard";

// Component to conditionally render Navbar and Footer
const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isDieticianRoute = location.pathname.startsWith('/dietician');

  return (
    <>
      {/* Only show main Navbar for non-admin and non-dietician routes */}
      {!isAdminRoute && !isDieticianRoute && <Navbar />}
      
      <AnimatePresence mode="wait">
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/*" element={<AdminRouter />} />

          {/* Dietician Route */}
          <Route path="/dietician" element={<DieticianDashboard />} />

          {/* Regular App Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/submit" element={<SubmitRecipe />} />
          <Route path="/manage-recipe/:id" element={<ManageRecipe />} />
          <Route path="/scanner" element={<FridgeScanner />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/debug-logout" element={<DebugLogout />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      
      {/* Only show Footer for non-admin and non-dietician routes */}
      {!isAdminRoute && !isDieticianRoute && <Footer />}
      
      {/* Show Chatbot on all routes except admin */}
      {!isAdminRoute && <Chatbot />}
    </>
  );
};

function App() {
  return (
    <div className="App min-h-screen bg-gradient-to-br from-slate-50 to-stone-100">
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </div>
  );
}

export default App; 