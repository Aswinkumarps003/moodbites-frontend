import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, Utensils, Home, BarChart3, BookOpen, Plus, User, Scan, LogOut, Settings, Brain, Activity } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [userDropdown, setUserDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');
      const newLoginStatus = !!token;
      setIsLoggedIn(newLoginStatus);
      if (userData) {
        setUser(JSON.parse(userData));
      }
    };

    checkLoginStatus();

    const handleStorage = () => {
      checkLoginStatus();
    };

    const handleCustomLogout = () => {
      setIsLoggedIn(false);
      setUser(null);
    };

    const handleCustomLogin = () => {
      checkLoginStatus();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('moodbites-logout', handleCustomLogout);
    window.addEventListener('moodbites-login', handleCustomLogin);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('moodbites-logout', handleCustomLogout);
      window.removeEventListener('moodbites-login', handleCustomLogin);
    };
  }, []);

  // Handle clicking outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdown && !event.target.closest('.user-dropdown')) {
        setUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userDropdown]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setUserDropdown(false);
    console.log('Logout: removed authToken and user, updating state and dispatching event');
    window.dispatchEvent(new Event('moodbites-logout'));
    navigate('/');
  };

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: BarChart3, requiresAuth: true },
    { name: "Emotion Detection", href: "/emotion-detection", icon: Brain },
    { name: "Blood Report", href: "/blood-report", icon: Activity, requiresAuth: true },
    { name: "Recipes", href: "/recipes", icon: BookOpen },
    { name: "Scanner", href: "/scanner", icon: Scan },
    { name: "Submit", href: "/submit", icon: Plus, requiresAuth: true },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
          ? "bg-white/80 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.08)] border-b border-white/20"
          : "bg-transparent"
        }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2.5"
            >
              <motion.div
                className="w-10 h-10 bg-gradient-to-br from-[#F10100] to-[#FFD122] rounded-xl flex items-center justify-center shadow-lg shadow-[#F10100]/20"
                animate={isScrolled ? {} : { boxShadow: ["0 4px 14px rgba(241,1,0,0.2)", "0 4px 20px rgba(241,1,0,0.35)", "0 4px 14px rgba(241,1,0,0.2)"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Utensils className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-xl font-bold text-gray-900 font-display tracking-tight">MoodBites</span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.filter((item) => !item.requiresAuth || isLoggedIn).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="relative group"
                >
                  <motion.div
                    whileHover={{ y: -2 }}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium ${isActive
                        ? "text-[#F10100] bg-[#F10100]/10"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/60"
                      }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#F10100]" : ""}`} />
                    <span className="text-sm">{item.name}</span>
                  </motion.div>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-1 left-2 right-2 h-0.5 bg-gradient-to-r from-[#F10100] to-[#FFD122] rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-100 transition-all duration-200"
                >
                  Log In
                </Link>
                <Link to="/signup">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#F10100] to-[#FF4444] rounded-xl shadow-lg shadow-[#F10100]/20 hover:shadow-xl hover:shadow-[#F10100]/30 transition-all duration-300"
                  >
                    Sign Up
                  </motion.div>
                </Link>
              </>
            ) : (
              <div className="relative user-dropdown">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    console.log('Dropdown toggle clicked, current state:', userDropdown);
                    setUserDropdown(!userDropdown);
                  }}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#F10100]/10 to-[#FFD122]/10 hover:from-[#F10100]/20 hover:to-[#FFD122]/20 transition-all duration-300 ring-2 ring-[#F10100]/20"
                  title={`Hi, ${user?.name || 'User'}!`}
                >
                  <User className="w-5 h-5 text-[#F10100]" />
                </motion.button>

                {userDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-56 bg-white/90 backdrop-blur-xl rounded-2xl shadow-premium border border-gray-100/50 py-2 z-[100]"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">Hi, {user?.name || 'User'}!</p>
                      <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[#F10100]/5 hover:to-transparent transition-all duration-200"
                      onClick={() => {
                        console.log('Dashboard link clicked');
                        setUserDropdown(false);
                      }}
                    >
                      <BarChart3 className="w-4 h-4 mr-3 text-gray-400" />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        console.log('Logout button clicked');
                        handleLogout();
                      }}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-gray-700 hover:text-[#F10100] hover:bg-gray-100/60 transition-all duration-200"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: isOpen ? 1 : 0,
          height: isOpen ? "auto" : 0,
        }}
        className="md:hidden bg-white/95 backdrop-blur-2xl border-t border-gray-200/50 overflow-hidden shadow-premium"
      >
        <div className="px-4 py-3 space-y-1">
          {navigation.filter((item) => !item.requiresAuth || isLoggedIn).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${isActive
                    ? "text-[#F10100] bg-gradient-to-r from-[#F10100]/10 to-[#FFD122]/5"
                    : "text-gray-700 hover:text-[#F10100] hover:bg-gray-50"
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-[#F10100]" : "text-gray-400"}`} />
                <span>{item.name}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#F10100]" />}
              </Link>
            );
          })}

          {/* Mobile Auth */}
          <div className="border-t border-gray-200/50 pt-3 mt-2">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:text-[#F10100] hover:bg-gray-50 transition-colors font-medium"
                >
                  <span>Log In</span>
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-white bg-gradient-to-r from-[#F10100] to-[#FF4444] shadow-lg font-semibold mt-1"
                >
                  <span>Sign Up</span>
                </Link>
              </>
            ) : (
              <div className="px-3 py-3">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F10100]/10 to-[#FFD122]/10 flex items-center justify-center ring-2 ring-[#F10100]/20">
                    <User className="w-5 h-5 text-[#F10100]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => { setIsOpen(false); handleLogout(); }}
                  className="flex items-center space-x-3 px-3 py-2 text-red-600 hover:text-red-700 transition-colors w-full rounded-lg hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.nav>
  );
};

export default Navbar;