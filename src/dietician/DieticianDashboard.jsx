import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import PatientOverview from './components/PatientOverview';
import MoodAnalytics from './components/MoodAnalytics';
import PatientsList from './components/PatientsList';
import ChatPanel from './components/ChatPanel';
import AIRecommendations from './components/AIRecommendations';
import Reports from './components/Reports';
import VideoConsultations from './components/VideoConsultations';

const DieticianDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Authentication check and user data fetch
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        navigate('/login');
        return;
      }
      
      try {
        const parsedUser = JSON.parse(userData);
        
        // Check if user is a dietician
        if (parsedUser.role !== 2) {
          navigate('/dashboard');
          return;
        }
        
        // Fetch updated user data from backend
        const response = await fetch(`https://user-service-latest-bae8.onrender.com/api/user/profile/${parsedUser._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const userProfileData = await response.json();
          setUser(userProfileData);
        } else {
          // Fallback to localStorage data
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('moodbites-logout'));
    navigate('/login');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="text-center relative z-10 bg-white/50 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-emerald-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-800 font-medium text-lg tracking-wide">Initializing workspace...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-xl border border-white">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Access Restricted</h2>
          <p className="text-gray-600">Please log in to access your dietician portal.</p>
        </div>
      </div>
    );
  }

  const renderMainContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <PatientOverview user={user} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MoodAnalytics />
              <PatientsList user={user} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AIRecommendations />
            </div>
          </div>
        );
      case 'patients':
        return <PatientsList fullWidth />;
      case 'chat':
        return <ChatPanel />;
      case 'consultations':
        return <VideoConsultations user={user} />;
      case 'reports':
        return <Reports />;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-300/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-300/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed top-[40%] left-[60%] w-[30%] h-[30%] bg-teal-300/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="flex relative z-10">
        {/* Sidebar */}
        <Sidebar 
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          user={user}
        />
        
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
          <Navbar 
            onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            sidebarCollapsed={sidebarCollapsed}
            user={user}
            onLogout={handleLogout}
          />
          
          <main className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.98 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
              >
                {renderMainContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DieticianDashboard;