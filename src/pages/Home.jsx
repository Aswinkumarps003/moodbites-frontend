import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Brain, Heart, Utensils, Scan, ChefHat, TrendingUp, Star, Leaf, Zap } from "lucide-react";
import ScrollReveal from "../components/ScrollReveal";

const Home = () => {
  const features = [
    {
      icon: Brain,
      title: "AI Mood Analysis",
      description: "Advanced emotion recognition technology understands your psychological state to recommend foods that naturally boost your mood and energy levels.",
      color: "#F10100",
      stats: "94% accuracy",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80"
    },
    {
      icon: Scan,
      title: "Smart Fridge Scanner",
      description: "Revolutionary image recognition instantly identifies ingredients in your fridge and suggests personalized recipes, reducing food waste by 40%.",
      color: "#FFD122",
      stats: "10K+ recipes",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80"
    },
    {
      icon: Utensils,
      title: "Personalized Nutrition",
      description: "Tailored meal recommendations based on your health goals, dietary preferences, and current emotional state for optimal wellness outcomes.",
      color: "#476E00",
      stats: "Custom plans",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80"
    },
    {
      icon: Heart,
      title: "Wellness Tracking",
      description: "Comprehensive health monitoring including mood trends, nutrition analytics, and progress tracking towards your fitness and wellness goals.",
      color: "#D8D86B",
      stats: "24/7 insights",
      image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&q=80"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Thompson",
      role: "Nutritionist",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b602?ixlib=rb-4.0.3&w=150&q=80",
      content: "MoodBites has revolutionized how I help clients connect their emotions with nutrition. The AI recommendations are incredibly accurate and scientifically sound.",
      rating: 5
    },
    {
      name: "David Chen",
      role: "Busy Professional",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=150&q=80",
      content: "The fridge scanner feature saves me hours every week. No more wondering what to cook - MoodBites tells me exactly what I can make with what I have.",
      rating: 5
    },
    {
      name: "Maria Rodriguez",
      role: "Wellness Coach",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&w=150&q=80",
      content: "My clients have seen remarkable improvements in their mood and energy levels since using MoodBites. It's like having a personal nutritionist in your pocket.",
      rating: 5
    }
  ];

  const floatingFoods = ["🥗", "🍎", "🥑", "🍊", "🥕", "🍇", "🌽", "🥦"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-16"
    >
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80"
            alt="Fresh food background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/75 to-white/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        </div>

        {/* Floating Food Emojis */}
        {floatingFoods.map((food, index) => (
          <motion.div
            key={index}
            className="absolute text-4xl md:text-5xl opacity-20 pointer-events-none select-none z-0"
            style={{
              left: `${10 + (index * 12) % 80}%`,
              top: `${15 + (index * 17) % 60}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4 + index * 0.7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.5,
            }}
          >
            {food}
          </motion.div>
        ))}

        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
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
              <span className="text-lg font-semibold text-gray-600 font-medium tracking-wide uppercase">Welcome to the Future of Wellness</span>
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-gray-900 mb-8 leading-tight font-display">
              <motion.span
                className="gradient-text-animated"
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

              <Link to="/emotion-detection">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-gray-300 text-gray-700 hover:border-[#FFD122] hover:text-[#FFD122] hover:bg-[#FFD122]/5 px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 flex items-center space-x-3"
                >
                  <Brain className="w-6 h-6" />
                  <span>Detect My Mood</span>
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

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10" />
      </section>

      {/* Stats Section */}
      <ScrollReveal>
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 dots-pattern opacity-40" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { number: "50K+", label: "Active Users", icon: TrendingUp, color: "#F10100" },
                { number: "15K+", label: "Recipes", icon: ChefHat, color: "#FFD122" },
                { number: "94%", label: "Accuracy Rate", icon: Brain, color: "#476E00" },
                { number: "40%", label: "Less Food Waste", icon: Leaf, color: "#D8D86B" }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <ScrollReveal key={index} direction="up" delay={index * 0.1}>
                    <motion.div
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="text-center glass-card rounded-3xl p-8 card-glow"
                    >
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ background: `linear-gradient(135deg, ${stat.color}15, ${stat.color}25)` }}
                      >
                        <Icon className="w-8 h-8" style={{ color: stat.color }} />
                      </div>
                      <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 font-display">
                        {stat.number}
                      </div>
                      <div className="text-gray-600 font-medium">{stat.label}</div>
                    </motion.div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center mb-20">
              <span className="inline-block px-4 py-2 rounded-full bg-[#F10100]/10 text-[#F10100] font-semibold text-sm mb-6 tracking-wide uppercase">How It Works</span>
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 font-display">
                Three Simple <span className="gradient-text">Steps</span>
              </h2>
              <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-medium">
                From mood detection to personalized meals in minutes
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-[#F10100]/20 via-[#FFD122]/20 to-[#476E00]/20" />

            {[
              {
                step: "01",
                title: "Share Your Mood",
                desc: "Use our AI camera or select your current emotional state",
                icon: Brain,
                color: "#F10100",
                image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80"
              },
              {
                step: "02",
                title: "Get Recommendations",
                desc: "Our AI analyzes your mood and dietary needs for perfect matches",
                icon: Zap,
                color: "#FFD122",
                image: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&q=80"
              },
              {
                step: "03",
                title: "Cook & Enjoy",
                desc: "Follow personalized recipes designed for your wellness goals",
                icon: ChefHat,
                color: "#476E00",
                image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80"
              }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <ScrollReveal key={index} direction="up" delay={index * 0.2}>
                  <motion.div
                    whileHover={{ y: -10 }}
                    className="relative bg-white rounded-3xl overflow-hidden shadow-elevated hover:shadow-elevated-hover transition-all duration-500 group"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div
                        className="absolute top-4 left-4 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: item.color }}
                      >
                        {item.step}
                      </div>
                    </div>
                    {/* Content */}
                    <div className="p-8">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 -mt-12 relative z-10 shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${item.color}, ${item.color}CC)` }}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 font-display">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed text-lg">{item.desc}</p>
                    </div>
                  </motion.div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 dots-pattern opacity-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal direction="up">
            <div className="text-center mb-20">
              <span className="inline-block px-4 py-2 rounded-full bg-[#476E00]/10 text-[#476E00] font-semibold text-sm mb-6 tracking-wide uppercase">Features</span>
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 font-display">
                Revolutionary <span className="text-[#F10100]">Features</span>
              </h2>
              <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-medium">
                Experience cutting-edge technology designed to transform your wellness journey through intelligent food recommendations
              </p>
            </div>
          </ScrollReveal>

          <div className="grid lg:grid-cols-2 gap-10">
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
                    className="bg-white rounded-3xl shadow-elevated hover:shadow-elevated-hover transition-all duration-500 border border-gray-100/80 overflow-hidden group relative"
                  >
                    {/* Feature Image Banner */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div
                        className="absolute inset-0"
                        style={{ background: `linear-gradient(135deg, ${feature.color}90 0%, ${feature.color}30 100%)` }}
                      />
                      <div className="absolute bottom-4 left-6">
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-white font-bold text-sm bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">{feature.stats}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 font-display">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-lg font-medium">
                        {feature.description}
                      </p>
                    </div>
                    <div
                      className="h-1.5 w-full"
                      style={{ background: `linear-gradient(90deg, ${feature.color}40 0%, ${feature.color}80 50%, ${feature.color}40 100%)` }}
                    />
                  </motion.div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Food Gallery Strip */}
      <section className="py-4 bg-white overflow-hidden">
        <div className="flex animate-[scroll_30s_linear_infinite]" style={{ width: 'max-content' }}>
          {[
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80",
            "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=300&q=80",
            "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=300&q=80",
            "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300&q=80",
            "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=300&q=80",
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&q=80",
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&q=80",
            "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=300&q=80",
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80",
            "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=300&q=80",
            "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=300&q=80",
            "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300&q=80",
          ].map((img, i) => (
            <div key={i} className="w-48 h-32 mx-1 rounded-2xl overflow-hidden flex-shrink-0">
              <img src={img} alt="Food" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F10100]/5 via-[#FFD122]/5 to-[#476E00]/5" />
        <div className="absolute inset-0 dots-pattern opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-20">
              <span className="inline-block px-4 py-2 rounded-full bg-[#FFD122]/20 text-[#9a7d00] font-semibold text-sm mb-6 tracking-wide uppercase">Testimonials</span>
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
                  className="glass-card rounded-3xl p-8 transition-all duration-500 card-glow relative"
                >
                  {/* Quote icon */}
                  <div className="absolute top-6 right-6 text-6xl font-serif text-[#F10100]/10 leading-none">"</div>

                  {/* Stars */}
                  <div className="flex space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-[#FFD122] text-[#FFD122]" />
                    ))}
                  </div>

                  <p className="text-gray-600 leading-relaxed text-lg italic mb-6 relative z-10">
                    "{testimonial.content}"
                  </p>

                  <div className="flex items-center">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full mr-4 shadow-lg ring-2 ring-white"
                    />
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 font-display">
                        {testimonial.name}
                      </h4>
                      <p className="text-[#F10100] font-semibold text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=1920&q=80"
            alt="Fresh healthy food"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/80 to-gray-900/70" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <ScrollReveal direction="up">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-2 rounded-full bg-white/10 text-white/90 font-semibold text-sm mb-8 tracking-wide uppercase backdrop-blur-sm border border-white/10">Start Today</span>
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 font-display">
                Ready to Transform Your <span className="gradient-text-animated">Wellness</span>?
              </h2>
              <p className="text-2xl text-gray-300 mb-12 font-medium max-w-3xl mx-auto">
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
            </motion.div>
          </ScrollReveal>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;