import React from "react";
import { motion } from "framer-motion";
import { Utensils, Heart, Mail, Phone, MapPin, ArrowRight, Instagram, Twitter, Github } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const footerLinks = [
    {
      title: "Platform",
      links: [
        { name: "Dashboard", href: "/dashboard" },
        { name: "Emotion Detection", href: "/emotion-detection" },
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
    <footer className="relative bg-gray-950 text-white overflow-hidden">
      {/* Animated top border */}
      <div className="h-1 w-full bg-gradient-to-r from-[#F10100] via-[#FFD122] to-[#476E00] animate-[border-flow_4s_linear_infinite]" style={{ backgroundSize: '200% auto' }} />

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#F10100]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#FFD122]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#476E00]/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <motion.div
                  className="w-12 h-12 bg-gradient-to-br from-[#F10100] to-[#FFD122] rounded-2xl flex items-center justify-center shadow-lg shadow-[#F10100]/20"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <Utensils className="w-7 h-7 text-white" />
                </motion.div>
                <span className="text-2xl font-bold font-display">MoodBites</span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-8 text-lg max-w-md">
                Transform your eating habits with AI-powered mood-based food recommendations.
                Join thousands in their wellness journey.
              </p>

              {/* Newsletter-style CTA */}
              <div className="flex items-center space-x-2 mb-8">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#F10100]/50 focus:ring-1 focus:ring-[#F10100]/20 transition-all duration-300 text-sm"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-3 bg-gradient-to-r from-[#F10100] to-[#FF4444] rounded-xl text-white shadow-lg shadow-[#F10100]/20 hover:shadow-xl hover:shadow-[#F10100]/30 transition-all duration-300"
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Social Links */}
              <div className="flex space-x-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      whileHover={{ scale: 1.1, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 bg-white/5 hover:bg-gradient-to-br hover:from-[#F10100] hover:to-[#FF4444] rounded-xl flex items-center justify-center transition-all duration-300 group border border-white/5 hover:border-transparent"
                    >
                      <Icon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-300" />
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
              <h3 className="text-sm font-bold mb-6 uppercase tracking-wider text-gray-300">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-500 hover:text-white transition-all duration-300 text-sm flex items-center group"
                    >
                      <span className="w-0 group-hover:w-3 h-0.5 bg-gradient-to-r from-[#F10100] to-[#FFD122] mr-0 group-hover:mr-2 transition-all duration-300 rounded-full" />
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
          className="border-t border-white/5 pt-8 mt-12"
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-gray-500 text-sm mb-4 md:mb-0">
              © 2025 MoodBites. All rights reserved. Made with{" "}
              <Heart className="w-4 h-4 inline text-red-500 fill-current animate-pulse" />{" "}
              for wellness enthusiasts.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link
                to="#"
                className="text-gray-500 hover:text-white transition-colors duration-300"
              >
                Privacy Policy
              </Link>
              <Link
                to="#"
                className="text-gray-500 hover:text-white transition-colors duration-300"
              >
                Terms of Service
              </Link>
              <Link
                to="#"
                className="text-gray-500 hover:text-white transition-colors duration-300"
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