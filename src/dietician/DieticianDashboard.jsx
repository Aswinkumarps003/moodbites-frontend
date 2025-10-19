import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import PatientOverview from './components/PatientOverview';
import MoodAnalytics from './components/MoodAnalytics';
import PatientsList from './components/PatientsList';
import ChatPanel from './components/ChatPanel';
import VideoConsultation from './components/VideoConsultation';
import AIRecommendations from './components/AIRecommendations';
import Reports from './components/Reports';

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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to access your dashboard</h2>
          <p className="text-gray-600">You need to be logged in to view this page.</p>
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
              <VideoConsultation />
            </div>
          </div>
        );
      case 'patients':
        return <PatientsList fullWidth />;
      case 'chat':
        return <ChatPanel />;
      case 'consultations':
        return <VideoConsultation fullWidth />;
      case 'reports':
        return <Reports />;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-purple-50">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar 
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          user={user}
        />
        
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <Navbar 
            onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            sidebarCollapsed={sidebarCollapsed}
            user={user}
            onLogout={handleLogout}
          />
          
          <main className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
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
