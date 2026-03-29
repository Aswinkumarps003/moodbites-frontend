import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  MessageCircle, 
  Video, 
  FileText, 
  ChevronLeft,
  ChevronRight,
  Stethoscope
} from 'lucide-react';

const Sidebar = ({ collapsed, onToggle, activeSection, onSectionChange, user }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'consultations', label: 'Consultations', icon: Video },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 288 }}
      transition={{ duration: 0.4, type: "spring", bounce: 0.1 }}
      className="fixed left-0 top-0 h-full bg-white/60 backdrop-blur-2xl border-r border-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-40 overflow-hidden"
    >
      <div className="flex flex-col h-full bg-gradient-to-b from-white/40 to-transparent">
        {/* Logo Section */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center space-x-3 shrink-0"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-teal-600 tracking-tight">MoodBites</span>
              </motion.div>
            )}
            <button
              onClick={onToggle}
              className="p-2.5 rounded-xl hover:bg-white/80 text-gray-400 hover:text-gray-700 hover:shadow-sm transition-all absolute right-4"
            >
              {collapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <li key={item.id}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSectionChange(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="font-medium"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </motion.button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 mt-auto">
          <div className="p-3 bg-white/50 backdrop-blur-md rounded-2xl border border-white max-w-full overflow-hidden flex items-center space-x-3">
            <div className="w-12 h-12 shrink-0 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-inner overflow-hidden border-2 border-white">
              {user?.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-lg">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
                </span>
              )}
            </div>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex-1 min-w-0"
              >
                <p className="text-[15px] font-bold text-slate-800 truncate">{user?.name || 'Dietician'}</p>
                <div className="flex items-center mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></div>
                  <p className="text-xs font-semibold text-emerald-600">Online</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;


