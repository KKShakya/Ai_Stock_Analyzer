"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Loader2,
  MessageCircle,
  LogIn
} from "lucide-react";
import SectionCard from "@/components/ui/section-card";
import { Button } from "@/components/ui/button";
import { useAIChatStore, type ChatMessage } from "@/store/ai-chat-store";
import { useAuthStore } from "@/hooks/use-auth";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useWatchlistStore } from "@/store/watchlist-store";

export default function AIChatCard() {
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { isAuthenticated, openLoginModal } = useAuthStore();
  const { userData } = useOnboardingStore();
  const { watchlist } = useWatchlistStore();
  const {
    messages,
    isLoading,
    isConnected,
    sendMessage,
    clearMessages
  } = useAIChatStore();

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Welcome message for new users
  useEffect(() => {
    if (isAuthenticated && messages.length === 0) {
      setTimeout(() => {
        const welcomeMessage = userData?.interests 
          ? `Welcome! I see you're interested in ${userData.interests.join(", ")}. I'm here to help you with stock analysis and investment insights. What would you like to know?`
          : "Welcome! I'm your AI stock analyst. Ask me about any stocks, market trends, or investment strategies!";
        
        useAIChatStore.getState().addMessage({
          content: welcomeMessage,
          role: 'assistant'
        });
      }, 1000);
    }
  }, [isAuthenticated, messages.length, userData?.interests]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    const message = inputMessage.trim();
    setInputMessage("");
    
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'bullish':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'bearish':
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  // Empty state for unauthenticated users
  if (!isAuthenticated) {
    return (
      <SectionCard
        title="AI Stock Analyst"
        subtitle="Get personalized insights"
        icon={<Bot className="h-5 w-5" />}
        className="h-96"
      >
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-blue-500/30">
              <Bot className="h-8 w-8 text-blue-500" />
            </div>
            {/* Subtle pulse animation */}
            <div className="absolute inset-0 w-16 h-16 bg-blue-500/20 rounded-full animate-ping"></div>
          </div>
          
          <h3 className="font-semibold text-foreground mb-2">Meet Your AI Analyst</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            Get personalized stock insights, market analysis, and investment recommendations tailored to your interests
          </p>
          
          {/* Beautiful login button */}
          <motion.button
            onClick={openLoginModal}
            className="relative px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative z-10 flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              <span>Start Chatting</span>
            </div>
            
            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"
              style={{ width: '100%' }}
            />
          </motion.button>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="AI Stock Analyst"
      subtitle={`${messages.length} messages`}
      icon={<Bot className="h-5 w-5" />}
      className="h-96"
      contentClassName="p-0 flex flex-col"
    >
      <div className="flex flex-col h-full">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`
                  max-w-[80%] rounded-2xl p-3 shadow-sm backdrop-blur-sm border
                  ${message.role === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-500/30' 
                    : 'bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 border-border/50 text-foreground'
                  }
                `}>
                  
                  {/* Message Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-white/20' 
                        : 'bg-gradient-to-r from-blue-500/20 to-purple-500/20'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="h-3 w-3" />
                      ) : (
                        <Bot className="h-3 w-3 text-blue-500" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs opacity-70">
                        {message.role === 'user' ? 'You' : 'AI Analyst'}
                      </span>
                      {message.sentiment && getSentimentIcon(message.sentiment)}
                    </div>
                    
                    <span className="text-xs opacity-50 ml-auto">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                  
                  {/* Message Content */}
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  
                  {/* Referenced Stocks */}
                  {message.stocks && message.stocks.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {message.stocks.map(stock => (
                        <span
                          key={stock}
                          className="px-2 py-1 bg-black/10 dark:bg-white/10 rounded-full text-xs font-medium"
                        >
                          {stock}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Typing Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-sm border border-border/50 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-blue-500" />
                  <div className="flex gap-1">
                    <motion.div
                      className="w-2 h-2 bg-blue-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-blue-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-blue-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">AI is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border/50 p-4 bg-gradient-to-r from-background/80 to-background/40 backdrop-blur-sm">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  watchlist.length > 0 
                    ? `Ask about ${watchlist[0]}, market trends, or any stock...`
                    : "Ask me about any stock or market insight..."
                }
                className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-border/50 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 text-sm"
                disabled={isLoading}
              />
            </div>
            
            <motion.button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
              )}
            </motion.button>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>{isConnected ? 'AI Connected' : 'Connection Lost'}</span>
            </div>
            
            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                className="hover:text-foreground transition-colors duration-200"
              >
                Clear Chat
              </button>
            )}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
