import React, { useState, useEffect, memo, useRef }  from 'react';

const FloatingNotification = memo(({ notification, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef(null);
  // const createdAtRef = useRef(notification.createdAt);

  const handleClose = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsExiting(true);
    setTimeout(() => onClose(notification.id), 300);
  };

  useEffect(() => {
    // Calcola il tempo rimanente basandosi sul timestamp di creazione
    const createdAt = notification.createdAt || Date.now();
    const elapsed = Date.now() - createdAt;
    const remaining = Math.max(5000 - elapsed, 0);
    
    // Se il tempo è già scaduto, chiudi immediatamente
    // if (remaining === 0) {
    //   handleClose();
    //   return;
    // }
    
    // Imposta il timer per il tempo rimanente
    timerRef.current = setTimeout(() => {
      handleClose();
    }, remaining);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [notification.id]); // Dipende dall'id della notifica

  return (
    <div 
      className={`floating-notification ${notification.type} ${isExiting ? 'slide-out' : ''}`}
    >
      <div className="notification-content">
        <span className="notification-text">
          {notification.message}
        </span>
      </div>
      <button 
        className="notification-close"
        onClick={handleClose}
        aria-label="Chiudi notifica"
      >
        ×
      </button>
    </div>
  );
});

// Aggiungiamo displayName per debugging
FloatingNotification.displayName = 'FloatingNotification';

const Notifications = React.memo(({ notifications, onClose }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="notifications-container">
      {notifications.map(notification => (
        <FloatingNotification
          key={notification.id}
          notification={notification}
          onClose={onClose}
        />
      ))}
    </div>
  );
});

Notifications.displayName = 'Notifications';

export { FloatingNotification };
export default Notifications;