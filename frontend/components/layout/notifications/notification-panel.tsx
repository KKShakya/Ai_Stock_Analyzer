// components/layout/notifications/notification-panel.tsx
"use client";

import { Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Bell, 
  Settings as SettingsIcon, 
  User, 
  Zap, 
  Crown, 
  AlertTriangle,
  Info,
  CheckCircle,
  Clock
} from "lucide-react";

// Hooks and stores
import { useNotificationStore } from "@/hooks/use-notifications";
import { useAuthStore } from "@/hooks/use-auth";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Types
interface NotificationItemProps {
  notification: {
    id: string;
    type: 'system' | 'user';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    priority: 'low' | 'medium' | 'high';
  };
  onMarkRead: (id: string) => void;
}

// Individual notification item component
function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div
      className={`p-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors cursor-pointer ${
        !notification.read ? 'bg-primary/5 border-l-4 border-l-primary' : ''
      }`}
      onClick={() => !notification.read && onMarkRead(notification.id)}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-sm text-foreground truncate pr-2">
              {notification.title}
            </h4>
            {!notification.read && (
              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
            )}
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {getTimeAgo(notification.timestamp)}
            </span>
            
            {notification.priority === 'high' && (
              <Badge variant="destructive" className="text-xs">Urgent</Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Empty state component
function EmptyNotifications({ type }: { type: 'system' | 'user' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <h3 className="font-medium text-foreground mb-2">No notifications</h3>
      <p className="text-sm text-muted-foreground text-center">
        {type === 'system' 
          ? "You're all caught up! System notifications will appear here."
          : "You haven't set up any custom alerts yet. Create alerts in your dashboard to get notified about price changes and market events."
        }
      </p>
    </div>
  );
}

export default function NotificationPanel() {
  const {
    notifications,
    unreadCount,
    activeTab,
    isOpen,
    setActiveTab,
    togglePanel,
    markAsRead
  } = useNotificationStore();

  const { isAuthenticated, user } = useAuthStore();

  // Filter notifications by type
  const systemNotifications = notifications.filter(n => n.type === 'system');
  const userNotifications = notifications.filter(n => n.type === 'user');

  // Get unread count for each tab
  const systemUnreadCount = systemNotifications.filter(n => !n.read).length;
  const userUnreadCount = userNotifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="absolute top-16 right-4 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-foreground" />
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {unreadCount}
              </Badge>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePanel}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'system' | 'user')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/30 m-0 rounded-none border-b border-border">
            <TabsTrigger value="system" className="relative">
              <SettingsIcon className="h-4 w-4 mr-2" />
              System
              {systemUnreadCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {systemUnreadCount > 9 ? '9+' : systemUnreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="user" className="relative">
              <User className="h-4 w-4 mr-2" />
              Alerts
              {userUnreadCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {userUnreadCount > 9 ? '9+' : userUnreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* System Notifications */}
          <TabsContent value="system" className="m-0">
            <ScrollArea className="h-96">
              {systemNotifications.length > 0 ? (
                systemNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={markAsRead}
                  />
                ))
              ) : (
                <EmptyNotifications type="system" />
              )}
            </ScrollArea>
          </TabsContent>

          {/* User Notifications */}
          <TabsContent value="user" className="m-0">
            <ScrollArea className="h-96">
              {!isAuthenticated ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <User className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium text-foreground mb-2">Login Required</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Sign in to create custom alerts and get notified about your favorite stocks.
                  </p>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      // This will be handled by the auth store
                      togglePanel();
                      // openLoginModal();
                    }}
                  >
                    Sign In
                  </Button>
                </div>
              ) : userNotifications.length > 0 ? (
                userNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={markAsRead}
                  />
                ))
              ) : (
                <EmptyNotifications type="user" />
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        {isAuthenticated && (
          <div className="p-4 border-t border-border bg-muted/20">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" className="text-xs">
                Mark all read
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                Settings
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
