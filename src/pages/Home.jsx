import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Brain, Heart, Utensils, Scan, ChefHat, TrendingUp } from "lucide-react";
import ScrollReveal from "../components/ScrollReveal";

const Home = () => {
  const features = [
    {
      icon: Brain,
      title: "AI Mood Analysis",
      description: "Advanced emotion recognition technology understands your psychological state to recommend foods that naturally boost your mood and energy levels.",
      color: "#F10100",
      stats: "94% accuracy"
    },
    {
      icon: Scan,
      title: "Smart Fridge Scanner",
      description: "Revolutionary image recognition instantly identifies ingredients in your fridge and suggests personalized recipes, reducing food waste by 40%.",
      color: "#FFD122",
      stats: "10K+ recipes"
    },
    {
      icon: Utensils,
      title: "Personalized Nutrition",
      description: "Tailored meal recommendations based on your health goals, dietary preferences, and current emotional state for optimal wellness outcomes.",
      color: "#476E00",
      stats: "Custom plans"
    },
    {
      icon: Heart,
      title: "Wellness Tracking",
      description: "Comprehensive health monitoring including mood trends, nutrition analytics, and progress tracking towards your fitness and wellness goals.",
      color: "#D8D86B",
      stats: "24/7 insights"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Thompson",
      role: "Nutritionist",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b602?ixlib=rb-4.0.3&w=150&q=80",
      content: "MoodBites has revolutionized how I help clients connect their emotions with nutrition. The AI recommendations are incredibly accurate and scientifically sound."
    },
    {
      name: "David Chen",
      role: "Busy Professional",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=150&q=80",
      content: "The fridge scanner feature saves me hours every week. No more wondering what to cook - MoodBites tells me exactly what I can make with what I have."
    },
    {
      name: "Maria Rodriguez",
      role: "Wellness Coach",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&w=150&q=80",
      content: "My clients have seen remarkable improvements in their mood and energy levels since using MoodBites. It's like having a personal nutritionist in your pocket."
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-16"
    >
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 -z-10">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-[#F10100]/10 to-[#FFD122]/10 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                rotate: [360, 180, 0],
                opacity: [0.4, 0.6, 0.4]
              }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute bottom-1/4 right-1/4 w-[32rem] h-[32rem] bg-gradient-to-r from-[#476E00]/10 to-[#D8D86B]/10 rounded-full blur-3xl"
            />
          </div>

          {/* Hero Content */}
          <ScrollReveal direction="up" delay={0.2}>
            <div className="flex items-center justify-center mb-8">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="mr-4"
              >
                <Sparkles className="w-10 h-10 text-[#FFD122]" />
              </motion.div>
              <span className="text-lg font-semibold text-gray-600 font-medium">Welcome to the Future of Wellness</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-gray-900 mb-8 leading-tight font-display">
              <motion.span 
                className="bg-gradient-to-r from-[#F10100] via-[#FFD122] to-[#476E00] bg-clip-text text-transparent"
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: "200% auto" }}
              >
                MoodBites
              </motion.span>
            </h1>
            
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
              Transform your relationship with food through AI-powered mood analysis, 
              smart ingredient recognition, and personalized nutrition recommendations 
              designed for your unique wellness journey.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/dashboard">
                <motion.button
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: "0 25px 50px rgba(241, 1, 0, 0.4)" 
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-[#F10100] to-[#FF4444] text-white px-10 py-5 rounded-2xl font-bold text-xl flex items-center space-x-3 shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden group"
                >
                  <span className="relative z-10">Start Your Journey</span>
                  <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FF4444] to-[#F10100] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>
              </Link>
              
              <Link to="/scanner">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-gray-300 text-gray-700 hover:border-[#476E00] hover:text-[#476E00] hover:bg-[#476E00]/5 px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 flex items-center space-x-3"
                >
                  <Scan className="w-6 h-6" />
                  <span>Try Fridge Scanner</span>
                </motion.button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Stats Section */}
      <ScrollReveal>
        <section className="py-20 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { number: "50K+", label: "Active Users", icon: TrendingUp },
                { number: "15K+", label: "Recipes", icon: ChefHat },
                { number: "94%", label: "Accuracy Rate", icon: Brain },
                { number: "40%", label: "Less Food Waste", icon: Sparkles }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <ScrollReveal key={index} direction="up" delay={index * 0.1}>
                    <div className="text-center">
                      <Icon className="w-8 h-8 text-[#F10100] mx-auto mb-4" />
                      <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 font-display">
                        {stat.number}
                      </div>
                      <div className="text-gray-600 font-medium">{stat.label}</div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Features Section */}
      <section className="py-32 bg-gradient-to-br from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 font-display">
                Revolutionary <span className="text-[#F10100]">Features</span>
              </h2>
              <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-medium">
                Experience cutting-edge technology designed to transform your wellness journey through intelligent food recommendations
              </p>
            </div>
          </ScrollReveal>

          <div className="grid lg:grid-cols-2 gap-16">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <ScrollReveal 
                  key={index} 
                  direction={index % 2 === 0 ? "left" : "right"} 
                  delay={index * 0.2}
                >
                  <motion.div
                    whileHover={{ y: -10, scale: 1.02 }}
                    className="bg-white rounded-3xl shadow-professional hover:shadow-professional-hover transition-all duration-500 border border-gray-100 overflow-hidden group"
                  >
                    <div className="p-10">
                      <div className="flex items-center mb-6">
                        <div
                          className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300"
                          style={{
                            background: `linear-gradient(135deg, ${feature.color}15 0%, ${feature.color}25 100%)`
                          }}
                        >
                          <Icon className="w-8 h-8" style={{ color: feature.color }} />
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold" style={{ color: feature.color }}>
                            {feature.stats}
                          </div>
                        </div>
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-4 font-display">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-lg font-medium">
                        {feature.description}
                      </p>
                    </div>
                    <div 
                      className="h-2 w-full"
                      style={{ background: `linear-gradient(90deg, ${feature.color}20 0%, ${feature.color}40 100%)` }}
                    />
                  </motion.div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-gradient-to-r from-[#F10100]/5 via-[#FFD122]/5 to-[#476E00]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 font-display">
                Trusted by <span className="text-[#F10100]">Professionals</span>
              </h2>
              <p className="text-2xl text-gray-600 max-w-3xl mx-auto font-medium">
                See how MoodBites is transforming lives across the wellness community
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <ScrollReveal key={index} direction="up" delay={index * 0.2}>
                <motion.div
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-3xl shadow-professional hover:shadow-professional-hover p-8 transition-all duration-500"
                >
                  <div className="flex items-center mb-6">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full mr-4 shadow-lg"
                    />
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 font-display">
                        {testimonial.name}
                      </h4>
                      <p className="text-[#F10100] font-semibold">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-lg italic">
                    "{testimonial.content}"
                  </p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 animated-gradient opacity-10" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <ScrollReveal direction="up">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 font-display">
              Ready to Transform Your <span className="text-[#F10100]">Wellness</span>?
            </h2>
            <p className="text-2xl text-gray-600 mb-12 font-medium max-w-3xl mx-auto">
              Join thousands of users who have discovered the perfect balance between mood, nutrition, and sustainable living.
            </p>
            <Link to="/dashboard">
              <motion.button
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 30px 60px rgba(241, 1, 0, 0.4)" 
                }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-[#F10100] to-[#FF4444] text-white px-12 py-6 rounded-2xl font-bold text-2xl flex items-center space-x-4 shadow-2xl hover:shadow-3xl transition-all duration-300 mx-auto group relative overflow-hidden"
              >
                <span className="relative z-10">Start Your Transformation</span>
                <ArrowRight className="w-7 h-7 relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF4444] to-[#F10100] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;