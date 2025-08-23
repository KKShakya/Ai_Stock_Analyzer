import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  stocks?: string[]; // Referenced stocks in the message
  sentiment?: 'bullish' | 'bearish' | 'neutral';
}

interface AIChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isConnected: boolean;
  
  // Actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setConnected: (connected: boolean) => void;
  sendMessage: (content: string) => Promise<void>;
}

export const useAIChatStore = create<AIChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,
      isConnected: true,
      
      addMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now()
        };
        
        set(state => ({
          messages: [...state.messages, newMessage]
        }));
      },
      
      clearMessages: () => set({ messages: [] }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setConnected: (isConnected) => set({ isConnected }),
      
      // Future-ready API call - currently uses mock responses
      sendMessage: async (content: string) => {
        const { addMessage, setLoading } = get();
        
        // Add user message immediately
        addMessage({
          content,
          role: 'user'
        });
        
        setLoading(true);
        
        try {
          // TODO: Replace with real AI API call
          // const response = await fetch('/api/ai/chat', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({ message: content, history: get().messages })
          // });
          // const aiResponse = await response.json();
          
          // For now, simulate AI response
          setTimeout(() => {
            const aiResponse = generateMockAIResponse(content);
            addMessage({
              content: aiResponse.content,
              role: 'assistant',
              stocks: aiResponse.stocks,
              sentiment: aiResponse.sentiment
            });
            setLoading(false);
          }, 1500);
          
        } catch (error) {
          console.error('AI Chat error:', error);
          addMessage({
            content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
            role: 'assistant'
          });
          setLoading(false);
        }
      }
    }),
    {
      name: 'ai-chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        messages: state.messages.slice(-50) // Keep only last 50 messages
      }),
    }
  )
);

// Mock AI response generator (replace with real AI later)
function generateMockAIResponse(userMessage: string): {
  content: string;
  stocks?: string[];
  sentiment?: 'bullish' | 'bearish' | 'neutral';
} {
  const lowerMessage = userMessage.toLowerCase();
  
  // Stock-specific responses
  if (lowerMessage.includes('aapl') || lowerMessage.includes('apple')) {
    return {
      content: "Apple (AAPL) is showing strong fundamentals with robust iPhone sales and growing services revenue. The company's focus on AI integration could drive future growth. Consider the current P/E ratio and upcoming product launches when making investment decisions.",
      stocks: ['AAPL'],
      sentiment: 'bullish'
    };
  }
  
  if (lowerMessage.includes('tsla') || lowerMessage.includes('tesla')) {
    return {
      content: "Tesla (TSLA) continues to lead in the EV space, but faces increasing competition. Recent delivery numbers and Elon's focus on autonomous driving could be key catalysts. Monitor production capacity and regulatory changes in the EV sector.",
      stocks: ['TSLA'],
      sentiment: 'neutral'
    };
  }
  
  // General investment advice
  if (lowerMessage.includes('buy') || lowerMessage.includes('invest')) {
    return {
      content: "When considering any investment, remember to diversify your portfolio, do thorough research, and never invest more than you can afford to lose. Consider dollar-cost averaging for long-term positions.",
      sentiment: 'neutral'
    };
  }
  
  // Market sentiment
  if (lowerMessage.includes('market') || lowerMessage.includes('dow') || lowerMessage.includes('s&p')) {
    return {
      content: "Current market conditions show mixed signals. While some sectors like technology remain strong, keep an eye on inflation data, Federal Reserve policy, and geopolitical events. Diversification across sectors is key in this environment.",
      sentiment: 'neutral'
    };
  }
  
  // Default responses
  const defaultResponses = [
    "That's an interesting question about the markets! Could you tell me more about which specific stocks or sectors you're interested in?",
    "I'd be happy to help you analyze that. Are you looking at this from a short-term trading perspective or long-term investment?",
    "Great question! To give you the most relevant insights, could you share what your investment goals are?",
    "I can help you with stock analysis and market insights. What specific companies or trends are you curious about?"
  ];
  
  return {
    content: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
    sentiment: 'neutral'
  };
}
