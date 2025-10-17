import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Recipes from "./pages/Recipes";
import SubmitRecipe from "./pages/SubmitRecipe";
import ManageRecipe from "./pages/ManageRecipe";
// import Profile from "./pages/Profile"; // Merged into Dashboard
import FridgeScanner from "./pages/FridgeScanner";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import DebugLogout from "./pages/DebugLogout";
import AdminRouter from "./admin/AdminRouter";
import DieticianDashboard from "./dietician/DieticianDashboard";
import EmotionDetectionPage from "./pages/EmotionDetectionPage";
import DietPlannerSetup from "./pages/DietPlannerSetup";
import DietPlanView from "./pages/DietPlanView";
import Consult from "./pages/Consult";
import Chat from "./pages/Chat";
import BloodReport from "./pages/BloodReport";
import VideoConsultation from "./pages/VideoConsultation";
import TestVideoCall from "./pages/TestVideoCall";
import SimpleCallTest from "./components/SimpleCallTest";
import SocketConnectionTest from "./components/SocketConnectionTest";
import JWTTokenTest from "./components/JWTTokenTest";
import { RequireAuth, RequireRole } from "./utils/RouteGuards";

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
          {/* Redirect legacy /video-call?dieticianId=... to new /video-consultation/:roomId/:userRole */}
          <Route
            path="/video-call"
            element={<RedirectVideoCall />}
          />
          {/* Admin Routes (role 0) */}
          <Route
            path="/admin/*"
            element={
              <RequireRole roles={[0]}>
                <AdminRouter />
              </RequireRole>
            }
          />

          {/* Dietician Route (role 2) */}
          <Route
            path="/dietician"
            element={
              <RequireRole roles={[2]}>
                <DieticianDashboard />
              </RequireRole>
            }
          />

          {/* Regular App Routes */}
          <Route path="/" element={<Home />} />
          <Route
            path="/dashboard"
            element={
              <RequireRole roles={[1]}>
                <Dashboard />
              </RequireRole>
            }
          />
          <Route
            path="/emotion-detection"
            element={
              <RequireRole roles={[1]}>
                <EmotionDetectionPage />
              </RequireRole>
            }
          />
          <Route path="/recipes" element={<Recipes />} />
          <Route
            path="/submit"
            element={
              <RequireRole roles={[1]}>
                <SubmitRecipe />
              </RequireRole>
            }
          />
          <Route
            path="/manage-recipe/:id"
            element={
              <RequireRole roles={[1]}>
                <ManageRecipe />
              </RequireRole>
            }
          />
          <Route
            path="/scanner"
            element={
              <RequireRole roles={[1]}>
                <FridgeScanner />
              </RequireRole>
            }
          />
          <Route
            path="/diet-planner"
            element={
              <RequireRole roles={[1]}>
                <DietPlannerSetup />
              </RequireRole>
            }
          />
          <Route
            path="/diet-plan-view"
            element={
              <RequireRole roles={[1]}>
                <DietPlanView />
              </RequireRole>
            }
          />
          <Route
            path="/consult"
            element={
              <RequireRole roles={[1]}>
                <Consult />
              </RequireRole>
            }
          />
          <Route
            path="/chat"
            element={
              <RequireRole roles={[1]}>
                <Chat />
              </RequireRole>
            }
          />
          <Route
            path="/blood-report"
            element={
              <RequireRole roles={[1]}>
                <BloodReport />
              </RequireRole>
            }
          />
          <Route
            path="/video-consultation/:roomId/:userRole?"
            element={
              <RequireAuth>
                <VideoConsultation />
              </RequireAuth>
            }
          />
          <Route
            path="/test-video-call"
            element={<TestVideoCall />}
          />
          <Route
            path="/test-call-modal"
            element={<SimpleCallTest />}
          />
          <Route
            path="/test-socket-connection"
            element={<SocketConnectionTest />}
          />
          <Route
            path="/test-jwt-token"
            element={<JWTTokenTest />}
          />
          <Route
            path="/profile"
            element={
              <RequireRole roles={[1]}>
                <Dashboard />
              </RequireRole>
            }
          />
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

// Lightweight redirector to map /video-call?dieticianId=... to the new route
const RedirectVideoCall = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Generate a deterministic room if needed (can include dieticianId)
  const dieticianId = searchParams.get('dieticianId') || 'general';
  const roomId = `room-${Date.now()}-${dieticianId.substring(0, 6)}`;
  const userRole = 'user';

  // Immediately redirect
  React.useEffect(() => {
    navigate(`/video-consultation/${roomId}/${userRole}`, { replace: true });
  }, [navigate, roomId]);

  return null;
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