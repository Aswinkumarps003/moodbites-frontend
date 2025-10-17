import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, ChefHat, Heart, Brain } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your MoodBites AI assistant. I can help you find the perfect food based on your mood! How are you feeling today? 😊",
      sender: 'bot',
      timestamp: new Date(),
      mood: null,
      intent: 'chit_chat',
      recipes: []
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(true); // Track service connection
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Call the enhanced MoodBites AI service
      const response = await fetch('http://localhost:3009/api/complete-flow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userMessage: inputValue }),
      });

      if (response.ok) {
        const result = await response.json();
        
        const botResponse = {
          id: Date.now() + 1,
          text: result.chatbotReply,
          sender: 'bot',
          timestamp: new Date(),
          mood: result.detectedMood,
          intent: result.intent,
          recipes: result.recipes || []
        };
        
        setMessages(prev => [...prev, botResponse]);
        setIsConnected(true);
      } else {
        throw new Error('Service unavailable');
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      setIsConnected(false);
      
      // Fallback response
      const fallbackResponse = {
        id: Date.now() + 1,
        text: getFallbackResponse(inputValue),
        sender: 'bot',
        timestamp: new Date(),
        mood: null,
        intent: 'unknown',
        recipes: []
      };
      
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const getFallbackResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('hello') || input.includes('hi')) {
      return "Hello! I'm here to help you find the perfect food for your mood. How are you feeling today? 🍽️";
    } else if (input.includes('sad') || input.includes('down') || input.includes('depressed')) {
      return "I hear you're feeling down. Comfort foods like warm soup, chocolate, or a hearty pasta dish might help lift your spirits. What sounds appealing? 💙";
    } else if (input.includes('happy') || input.includes('joy') || input.includes('excited')) {
      return "That's wonderful! When you're feeling great, try colorful, vibrant foods like fresh salads, smoothie bowls, or fun desserts to match your energy! ✨";
    } else if (input.includes('stressed') || input.includes('anxious') || input.includes('worried')) {
      return "Stress can be challenging. Soothing foods like chamomile tea, warm oatmeal, or gentle soups might help calm your nerves. Would you like some suggestions? 🌸";
    } else if (input.includes('angry') || input.includes('frustrated') || input.includes('mad')) {
      return "I understand you're feeling frustrated. Sometimes spicy foods or cooling smoothies can help release that energy. What sounds good to you? 🔥";
    } else if (input.includes('recipe') || input.includes('food') || input.includes('cook')) {
      return "I can help you find recipes based on your mood! Tell me how you're feeling and I'll suggest the perfect meal. 😋";
    } else if (input.includes('help') || input.includes('support')) {
      return "I'm here to help! I can suggest foods based on your mood, help with recipes, or just chat about food and feelings. What would you like to know? 🤗";
    } else {
      return "That's interesting! I'm here to help you discover amazing recipes and make better food choices based on how you're feeling. What's on your mind? 🤔";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMoodEmoji = (mood) => {
    const moodEmojis = {
      joy: '😊',
      sadness: '💙',
      anger: '😤',
      fear: '😰',
      surprise: '😲',
      disgust: '🤢',
      neutral: '😐'
    };
    return moodEmojis[mood] || '😊';
  };

  const getIntentIcon = (intent) => {
    const intentIcons = {
      mood: '💭',
      food: '🍽️',
      chit_chat: '💬',
      unknown: '❓'
    };
    return intentIcons[intent] || '💬';
  };

  const getIntentColor = (intent) => {
    const intentColors = {
      mood: 'text-purple-600',
      food: 'text-orange-600',
      chit_chat: 'text-blue-600',
      unknown: 'text-gray-600'
    };
    return intentColors[intent] || 'text-gray-600';
  };

  return (
    <>
      {/* Floating Chat Icon */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          delay: 2 
        }}
      >
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 bg-gradient-to-r from-[#F10100] to-[#FFD122] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-white"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircle className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Pulse animation to attract attention */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-[#F10100] to-[#FFD122] opacity-20"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 3 }}
          />
          
          {/* Connection status indicator */}
          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
        </motion.button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 z-40 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col"
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-[#F10100] to-[#FFD122] rounded-t-2xl">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-[#F10100]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">MoodBites AI</h3>
                  <p className="text-white/80 text-xs flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-300' : 'bg-red-300'}`}></span>
                    {isConnected ? 'AI Connected' : 'Offline Mode'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-64">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-[#F10100] to-[#FFD122] text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    
                    {/* Show intent and mood for bot messages */}
                    {message.sender === 'bot' && message.intent && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`text-xs ${getIntentColor(message.intent)} flex items-center gap-1`}>
                          <Brain className="w-3 h-3" />
                          {message.intent.replace('_', ' ')}
                        </span>
                        {message.mood && (
                          <span className="text-xs opacity-70 flex items-center gap-1">
                            {getMoodEmoji(message.mood)} {message.mood}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {message.sender === 'bot' && message.recipes && message.recipes.length > 0 && (
                      <div className="mt-2 p-2 bg-white/50 rounded-lg">
                        <div className="flex items-center gap-1 mb-1">
                          <ChefHat className="w-3 h-3 text-[#F10100]" />
                          <span className="text-xs font-medium text-[#F10100]">Suggested Recipes:</span>
                        </div>
                        <div className="space-y-1">
                          {message.recipes.slice(0, 2).map((recipe, idx) => (
                            <div key={idx} className="text-xs opacity-80">
                              • {recipe.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <motion.div
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                      <span className="text-xs">AI thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tell me how you're feeling..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F10100]/20 focus:border-[#F10100] text-sm"
                />
                <motion.button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="p-2 bg-gradient-to-r from-[#F10100] to-[#FFD122] text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
              
              {/* Quick message suggestions */}
              {messages.length === 1 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {[
                    "I'm feeling sad",
                    "I'm stressed",
                    "I'm happy!",
                    "I need comfort food"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInputValue(suggestion);
                        setTimeout(() => handleSendMessage(), 100);
                      }}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot; 