// src/hooks/useErrorNotification.ts
import { useState, useEffect, useCallback } from 'react';
import { ErrorNotification, ErrorState } from '../types/error';
import ErrorService from '../services/ErrorService';

const MAX_NOTIFICATIONS = 100;

export function useErrorNotification() {
  const [state, setState] = useState<ErrorState>({
    notifications: [],
    unreadCount: 0
  });

  useEffect(() => {
    const errorService = ErrorService.getInstance();
    
    const unsubscribe = errorService.subscribe((notification: ErrorNotification) => {
      setState(prevState => {
        const notifications = [notification, ...prevState.notifications]
          .slice(0, MAX_NOTIFICATIONS);
        
        return {
          notifications,
          unreadCount: prevState.unreadCount + 1
        };
      });
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setState(prevState => {
      const notifications = prevState.notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      );

      return {
        notifications,
        unreadCount: Math.max(0, prevState.unreadCount - 1)
      };
    });
  }, []);

  const clearNotification = useCallback((notificationId: string) => {
    setState(prevState => {
      const notification = prevState.notifications.find(n => n.id === notificationId);
      const notifications = prevState.notifications.filter(n => n.id !== notificationId);
      
      return {
        notifications,
        unreadCount: notification && !notification.read
          ? Math.max(0, prevState.unreadCount - 1)
          : prevState.unreadCount
      };
    });
  }, []);

  const clearAll = useCallback(() => {
    setState({ notifications: [], unreadCount: 0 });
  }, []);

  return {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    markAsRead,
    clearNotification,
    clearAll
  };
}

export default useErrorNotification;