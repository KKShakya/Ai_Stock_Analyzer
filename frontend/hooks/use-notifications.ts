import { create } from 'zustand';

interface Notification {
  id: string;
  type: 'system' | 'user';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  activeTab: 'system' | 'user';
  isOpen: boolean;
  setActiveTab: (tab: 'system' | 'user') => void;
  togglePanel: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  clearAll: () => void;
}

// Sample notifications for demonstration
const sampleNotifications: Notification[] = [
  {
    id: '1',
    type: 'system',
    title: 'Welcome to AI Stock Analyzer!',
    message: 'You have 1000 free API calls this month. Explore real-time market data and advanced analytics.',
    timestamp: new Date(Date.now() - 5 * 60000), // 5 minutes ago
    read: false,
    priority: 'medium'
  },
  {
    id: '2',
    type: 'system',
    title: 'Market Update',
    message: 'NIFTY 50 closed 2.3% higher today. Check out the latest market analysis in your dashboard.',
    timestamp: new Date(Date.now() - 2 * 60 * 60000), // 2 hours ago
    read: false,
    priority: 'low'
  },
  {
    id: '3',
    type: 'system',
    title: 'API Usage Alert',
    message: 'You have used 750 out of 1000 free API calls. Consider upgrading to Pro for unlimited access.',
    timestamp: new Date(Date.now() - 24 * 60 * 60000), // 1 day ago
    read: true,
    priority: 'medium'
  }
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: sampleNotifications,
  unreadCount: sampleNotifications.filter(n => !n.read).length,
  activeTab: 'system',
  isOpen: false,
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  togglePanel: () => set((state) => ({ isOpen: !state.isOpen })),
  
  markAsRead: (id) => set((state) => {
    const updatedNotifications = state.notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    return {
      notifications: updatedNotifications,
      unreadCount: updatedNotifications.filter(n => !n.read).length
    };
  }),
  
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0
  })),
  
  addNotification: (notification) => set((state) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    return {
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    };
  }),
  
  clearAll: () => set({ notifications: [], unreadCount: 0 })
}));
