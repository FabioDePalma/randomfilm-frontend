import { useState, useCallback } from 'react';

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    const newNotification = { 
      id, 
      message, 
      type,
      createdAt: Date.now() 
    };
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  return { addNotification, notifications, removeNotification };
}