import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Bell, 
  Menu, 
  User, 
  LogOut, 
  Settings,
  ChevronDown
} from 'lucide-react';

const Navbar = ({ onSidebarToggle, sidebarCollapsed, user, onLogout }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifications = [
    { id: 1, message: 'New patient consultation request', time: '2 min ago', unread: true },
    { id: 2, message: 'Patient mood report updated', time: '15 min ago', unread: true },
    { id: 3, message: 'Weekly report ready', time: '1 hour ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white/40 backdrop-blur-2xl border-b border-white top-0 z-30 sticky shadow-[0_4px_30px_rgba(0,0,0,0.02)]"
    >
      <div className="px-6 md:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-6">
            <button
              onClick={onSidebarToggle}
              className="p-2.5 bg-white/60 rounded-xl hover:bg-white shadow-sm border border-white/50 transition-all lg:hidden"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
            
            <div className="relative group hidden sm:block">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="text"
                placeholder="Search patients, reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 py-2.5 w-72 lg:w-96 bg-white/50 border border-white/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all shadow-inner text-sm font-medium text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Notifications */}
            <div className="relative">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2.5 bg-white/50 border border-white/80 rounded-2xl hover:bg-white transition-all shadow-sm group"
              >
                <Bell className="w-5 h-5 text-slate-600 group-hover:text-emerald-600 transition-colors" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-md ring-2 ring-white"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </motion.button>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-3 p-1.5 pr-3 bg-white/60 border border-white/80 rounded-2xl hover:bg-white shadow-sm transition-all"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-inner overflow-hidden border-2 border-white/50">
                  {user?.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-sm">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
                    </span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col items-start pr-1">
                  <span className="text-sm font-bold text-slate-800 leading-none">
                    {user?.name || 'Dietician'}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 mt-1 uppercase tracking-wider">Online</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </motion.button>

              <AnimatePresence>
                {showProfileDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95, transformOrigin: 'top right' }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, type: "spring", bounce: 0.2 }}
                    className="absolute right-0 mt-3 w-56 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 py-2 z-50 overflow-hidden"
                  >
                    <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                      <p className="text-sm font-bold text-slate-800 truncate">{user?.name || 'Dietician'}</p>
                      <p className="text-xs font-medium text-slate-500 truncate mt-0.5">{user?.email || 'dietician@moodbites.com'}</p>
                    </div>
                    <div className="p-2">
                      <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-gray-100/80 transition-all">
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                      <button 
                        onClick={onLogout}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;


