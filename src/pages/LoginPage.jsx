// LoginPage.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const { handleLogin, loading: authLoading } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Cancella l'errore quando l'utente inizia a digitare
    if (error) setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await handleLogin(formData.username, formData.password);
      navigate('/films');
    } catch (err) {
      setError(err.message || 'Errore durante il login');
    } finally {
      setLoading(false);
    }
  };

  // Mostra caricamento durante l'inizializzazione dell'auth
  if (authLoading) {
    return <div>Caricamento...</div>;
  }

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem' }}>
      <h2>Login</h2>
      
      {error && (
        <div style={{ 
          color: 'red', 
          backgroundColor: '#ffe6e6', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="username">Username o E-mail</label>
          <input 
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '8px', 
              marginTop: '4px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password">Password</label>
          <input 
            id="password"
            name="password"
            type="password" 
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '8px', 
              marginTop: '4px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Accesso in corso...' : 'Accedi'}
        </button>
      </form>
      
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <p>Non hai un account? <Link to="/register">Registrati qui</Link></p>
      </div>
    </div>
  );
};

export default LoginPage;
