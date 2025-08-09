import React from "react";
import { Bell, UserCircle } from "lucide-react";
import { motion } from "framer-motion";

const Navbar = ({ pageTitle }) => (
  <header className="flex items-center justify-between px-8 py-4 bg-white rounded-2xl shadow-md mb-6">
    <h1 className="text-2xl font-bold text-gray-900 font-display">{pageTitle || "Dashboard Overview"}</h1>
    <div className="flex items-center gap-6">
      <motion.button
        whileHover={{ scale: 1.2, y: 2 }}
        className="relative text-gray-500 hover:text-orange-500 focus:outline-none"
      >
        <Bell className="w-7 h-7" />
        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-orange-400"></span>
      </motion.button>
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="flex items-center gap-2 cursor-pointer"
      >
        <UserCircle className="w-9 h-9 text-orange-400" />
      </motion.div>
    </div>
  </header>
);

export default Navbar;
