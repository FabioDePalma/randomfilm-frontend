// RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../services/api';

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username è richiesto';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username deve essere almeno 3 caratteri';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email è richiesta';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email non valida';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password è richiesta';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password deve essere almeno 6 caratteri';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Le password non corrispondono';
    }
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Rimuovi l'errore per questo campo quando l'utente inizia a digitare
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  const validationErrors = validateForm();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }
  
  setLoading(true);
  setErrors({});
  setSuccess('');

  try {
    const response = await signup(formData.username, formData.email, formData.password);

    setSuccess(response.message || 'Richiesta inviata con successo!');
    
    
  } catch (err) {
    setErrors({ general: err.message || 'Errore durante la registrazione' });
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem' }}>
      <h2>Registrati</h2>
      
      {errors.general && (
        <div style={{ 
          color: 'red', 
          backgroundColor: '#ffe6e6', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          {errors.general}
        </div>
      )}
      
      {success && (
        <div style={{ 
          color: 'green', 
          backgroundColor: '#e6ffe6', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="username">Username</label>
          <input 
            id="username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '8px', 
              marginTop: '4px',
              border: `1px solid ${errors.username ? 'red' : '#ccc'}`,
              borderRadius: '4px'
            }}
          />
          {errors.username && (
            <small style={{ color: 'red' }}>{errors.username}</small>
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email">Email</label>
          <input 
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '8px', 
              marginTop: '4px',
              border: `1px solid ${errors.email ? 'red' : '#ccc'}`,
              borderRadius: '4px'
            }}
          />
          {errors.email && (
            <small style={{ color: 'red' }}>{errors.email}</small>
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password">Password</label>
          <input 
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '8px', 
              marginTop: '4px',
              border: `1px solid ${errors.password ? 'red' : '#ccc'}`,
              borderRadius: '4px'
            }}
          />
          {errors.password && (
            <small style={{ color: 'red' }}>{errors.password}</small>
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="confirmPassword">Conferma Password</label>
          <input 
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '8px', 
              marginTop: '4px',
              border: `1px solid ${errors.confirmPassword ? 'red' : '#ccc'}`,
              borderRadius: '4px'
            }}
          />
          {errors.confirmPassword && (
            <small style={{ color: 'red' }}>{errors.confirmPassword}</small>
          )}
        </div>

        <button 
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: loading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Registrazione in corso...' : 'Registrati'}
        </button>
      </form>
      
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <p>Hai già un account? <Link to="/login">Accedi qui</Link></p>
      </div>
    </div>
  );
}

export default RegisterPage;