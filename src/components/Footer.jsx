import React from "react";
import { motion } from "framer-motion";
import { Utensils, Heart, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const footerLinks = [
    {
      title: "Platform",
      links: [
        { name: "Dashboard", href: "/dashboard" },
        { name: "Recipes", href: "/recipes" },
        { name: "Submit Recipe", href: "/submit" },
        { name: "Profile", href: "/profile" }
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "#" },
        { name: "Community", href: "#" },
        { name: "Contact Us", href: "#" },
        { name: "FAQ", href: "#" }
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "#" },
        { name: "Privacy Policy", href: "#" },
        { name: "Terms of Service", href: "#" },
        { name: "Blog", href: "#" }
      ]
    }
  ];

  const socialLinks = [
    { name: "Email", icon: Mail, href: "mailto:hello@moodbites.com" },
    { name: "Phone", icon: Phone, href: "tel:+1234567890" },
    { name: "Location", icon: MapPin, href: "#" }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#F10100] to-[#FFD122] rounded-2xl flex items-center justify-center">
                  <Utensils className="w-7 h-7 text-white" />
                </div>
                <span className="text-2xl font-bold">MoodBites</span>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">
                Transform your eating habits with AI-powered mood-based food recommendations. 
                Join thousands in their wellness journey.
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 bg-gray-700 hover:bg-[#F10100] rounded-xl flex items-center justify-center transition-all duration-300 group"
                    >
                      <Icon className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors duration-300" />
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Links Sections */}
          {footerLinks.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <h3 className="text-lg font-bold mb-6">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-300 hover:text-[#FFD122] transition-colors duration-300 hover:underline"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="border-t border-gray-700 pt-8 mt-12"
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 MoodBites. All rights reserved. Made with{" "}
              <Heart className="w-4 h-4 inline text-red-500 fill-current" />{" "}
              for wellness enthusiasts.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link 
                to="#" 
                className="text-gray-400 hover:text-[#FFD122] transition-colors duration-300"
              >
                Privacy Policy
              </Link>
              <Link 
                to="#" 
                className="text-gray-400 hover:text-[#FFD122] transition-colors duration-300"
              >
                Terms of Service
              </Link>
              <Link 
                to="#" 
                className="text-gray-400 hover:text-[#FFD122] transition-colors duration-300"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;