import { useState, useCallback } from 'react';
import { ErrorNotification } from '@/types/error';

type NotificationState = {
  notifications: ErrorNotification[];
  clearNotification: (id: string) => void;
};

export const useErrorNotification = (): NotificationState => {
  const [notifications, setNotifications] = useState<ErrorNotification[]>([]);

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  return {
    notifications,
    clearNotification,
  };
};
