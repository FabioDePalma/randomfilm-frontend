import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Componente per le notifiche fluttuanti
const FloatingNotification = ({ notification, onClose }) => {
  const handleClose = () => {
    const element = document.getElementById(`notification-${notification.id}`);
    if (element) {
      element.classList.add('slide-out');
      setTimeout(() => onClose(notification.id), 300);
    } else {
      onClose(notification.id);
    }
  };

  return (
    <div 
      id={`notification-${notification.id}`}
      className={`floating-notification ${notification.type}`}
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
      <div className="notification-progress"></div>
    </div>
  );
};

// Componente contenitore per le notifiche
const NotificationsContainer = ({ notifications, onClose }) => {
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
};


function ChangePassword({ keycloak }) {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  // Funzione per aggiungere una notifica
  const addNotification = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    const newNotification = { id, message, type };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove dopo 3 secondi
    setTimeout(() => {
      removeNotification(id);
    }, 3000);
  };

  // Funzione per rimuovere una notifica
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!passwords.currentPassword) {
      newErrors.currentPassword = 'La password attuale è richiesta';
    }

    if (!passwords.newPassword) {
      newErrors.newPassword = 'La nuova password è richiesta';
    } else if (passwords.newPassword.length < 8) {
      newErrors.newPassword = 'La password deve essere di almeno 8 caratteri';
    }

    if (!passwords.confirmPassword) {
      newErrors.confirmPassword = 'La conferma password è richiesta';
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = 'Le password non coincidono';
    }

    if (passwords.currentPassword === passwords.newPassword) {
      newErrors.newPassword = 'La nuova password deve essere diversa da quella attuale';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const changePassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      // Costruisci l'URL dell'endpoint di Keycloak
      const accountUrl = `${keycloak.authServerUrl}/realms/${keycloak.realm}/account/credentials/password`;
      
      const response = await fetch(accountUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${keycloak.token}`
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
          confirmation: passwords.confirmPassword
        })
      });

      if (response.ok) {
        //reset form
        setPasswords({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });

        addNotification('🔑 Password cambiata con successo!', 'success');

        // Redirect dopo 3 secondi
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 400) {
          setErrors({ 
            currentPassword: 'Password attuale non corretta o nuova password non valida' 
          });
          addNotification('❌ Password attuale non corretta o nuova password non valida', 'error');
        } else if (response.status === 401) {
          addNotification('❌ Sessione scaduta. Effettua nuovamente il login.', 'error');
        } else {
          addNotification(`❌ ${errorData.error || 'Errore durante il cambio password'}`, 'error');
        }
      }
    } catch (error) {
      console.error('Errore nel cambio password:', error);
      addNotification('❌ Errore di connessione. Riprova più tardi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    changePassword();
  };

  const handleCancel = () => {
    navigate(-1); // Torna alla pagina precedente
  };

  if (!keycloak?.authenticated) {
    addNotification('❌ Devi essere autenticato per cambiare la password.', 'error');
    navigate('/');
    return null;
  }

  return (
    <div className="change-password-container">
      <div className="change-password-card">
        <h2>Cambia Password</h2>
        
        
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="currentPassword">Password Attuale *</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handleInputChange}
                className={errors.currentPassword ? 'error' : ''}
                disabled={loading}
              />
              {errors.currentPassword && (
                <span className="error-text">{errors.currentPassword}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">Nuova Password *</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handleInputChange}
                className={errors.newPassword ? 'error' : ''}
                disabled={loading}
              />
              {errors.newPassword && (
                <span className="error-text">{errors.newPassword}</span>
              )}
              <small className="password-hint">
                La password deve essere di almeno 8 caratteri
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Conferma Nuova Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? 'error' : ''}
                disabled={loading}
              />
              {errors.confirmPassword && (
                <span className="error-text">{errors.confirmPassword}</span>
              )}
            </div>

            {errors.general && (
              <div className="error-message">
                <span className="error-text">{errors.general}</span>
              </div>
            )}

            <div className="form-buttons">
              <button
                type="button"
                onClick={handleCancel}
                className="btn-cancel"
                disabled={loading}
              >
                Annulla
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? 'Cambiando...' : 'Cambia Password'}
              </button>
            </div>
          </form>
      </div>
      <NotificationsContainer 
          notifications={notifications}
          onClose={removeNotification}
        />
    </div>
  );
}

export default ChangePassword;