import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, Utensils, Home, BarChart3, BookOpen, Plus, User, Scan, LogOut, Settings } from "lucide-react";

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
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Recipes", href: "/recipes", icon: BookOpen },
    { name: "Scanner", href: "/scanner", icon: Scan },
    { name: "Submit", href: "/submit", icon: Plus },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-xl shadow-professional"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-[#F10100] to-[#FFD122] rounded-xl flex items-center justify-center shadow-lg">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 font-display">MoodBites</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => {
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
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium ${
                      isActive
                        ? "text-[#F10100] bg-[#F10100]/10 shadow-sm"
                        : "text-gray-700 hover:text-[#F10100] hover:bg-[#F10100]/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.name}</span>
                  </motion.div>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#F10100] rounded-full"
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
                  className="px-4 py-2 text-sm font-semibold text-[#F10100] rounded-xl hover:bg-[#F10100]/10 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#F10100] to-[#FFD122] rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  Sign Up
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
                  className="flex items-center justify-center w-10 h-10 text-xl text-[#F10100] rounded-full hover:bg-[#F10100]/10 transition-colors focus:outline-none"
                  title={`Hi, ${user?.name || 'User'}!`}
                >
                  <User className="w-6 h-6" />
                </motion.button>
                
                {userDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-[100]"
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">Hi, {user?.name || 'User'}!</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        console.log('Profile link clicked');
                        setUserDropdown(false);
                      }}
                    >
                      <User className="w-4 h-4 mr-3" />
                      Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        console.log('Dashboard link clicked');
                        setUserDropdown(false);
                      }}
                    >
                      <BarChart3 className="w-4 h-4 mr-3" />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        console.log('Logout button clicked');
                        handleLogout();
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
              className="p-2 rounded-lg text-gray-700 hover:text-[#F10100] hover:bg-gray-100"
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
        className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200 overflow-hidden shadow-professional"
      >
        <div className="px-4 py-2 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-colors duration-300 font-medium ${
                  isActive
                    ? "text-[#F10100] bg-[#F10100]/10"
                    : "text-gray-700 hover:text-[#F10100] hover:bg-gray-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          
          {/* Mobile Auth */}
          <div className="border-t border-gray-200 pt-2 mt-2">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-3 py-3 rounded-xl text-gray-700 hover:text-[#F10100] hover:bg-gray-50 transition-colors"
                >
                  <span>Log In</span>
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-3 py-3 rounded-xl text-[#F10100] bg-[#F10100]/10 transition-colors"
                >
                  <span>Sign Up</span>
                </Link>
              </>
            ) : (
              <div className="px-3 py-3">
                <div className="text-sm text-gray-600 mb-2">
                  Hi, {user?.name || 'User'}!
                </div>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-[#F10100] hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={() => { setIsOpen(false); handleLogout(); }}
                  className="flex items-center space-x-3 px-3 py-2 text-red-600 hover:text-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
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