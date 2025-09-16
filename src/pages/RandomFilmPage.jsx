import React, { useState } from 'react';
import { getRandomFilm,  updateFilmSeenStatus } from '../services/api';
import Notifications from '../components/Notification';

function RandomFilmPage() {
  // Stati per le notifiche fluttuanti
  const [notifications, setNotifications] = useState([]);

  // Stati esistenti
  const [randomFilm, setRandomFilm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animatedFilm, setAnimatedFilm] = useState(null);

  // Funzione per aggiungere una notifica
  const addNotification = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    const newNotification = { id, message, type };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove dopo 3 secondi
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };
  
  // Funzione per rimuovere una notifica
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleGetRandomFilm = async () => {
    setError('');
    setRandomFilm(null);
    setShowAnimation(true); // avvia animazione
    setLoading(true);
    setAnimatedFilm(null);
    
    setTimeout(async () => {
      try {
        const film = await getRandomFilm();
        setAnimatedFilm(film); // usato solo per animare
        setTimeout(() => {
          setRandomFilm(film); // mostra la card completa dopo l'effetto
        }, 2000); // deve essere in linea con la durata totale dell'animazione
      } catch (err) {
        setError('Errore nel recupero del film casuale: ' + err.message);
        addNotification('Errore nel recupero del film casuale: ' + err.message, 'error');
      } finally {
        setLoading(false);
        setTimeout(() => setShowAnimation(false), 2000); 
      }
    }, 800);
  };

  const handleMarkAsSeen = async () => {
    if (!randomFilm) return;

    setUpdating(true);

    try {
      const updatedFilm = { ...randomFilm, seen: true };
      await updateFilmSeenStatus(updatedFilm);
      
      // Aggiorna lo stato locale
      setRandomFilm(updatedFilm);
      
      addNotification(`"${randomFilm.title}" marcato come visto! Ottima scelta! 🎬`, 'success');
    } catch (err) {
      addNotification('Errore nell\'aggiornamento del film: ' + err.message, 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleGetAnotherFilm = () => {
    handleGetRandomFilm();
  };

  return (
    <div className="page">
      <div className="container">
        <div className="random-film-container">
          <h1>🎲 Film Casuale</h1>
          <p>Scopri un film casuale dalla collezione e decidete se guardarlo stasera!</p>
          
          <button 
            className="btn btn-primary"
            onClick={handleGetRandomFilm}
            disabled={loading}
            style={{ marginBottom: '2rem' }}
          >
            {loading ? '🔍 Cercando...' : 'Ottieni Film Casuale'}
          </button>

          {error && <div className="error">{error}</div>}

          {showAnimation && (
            <div className="box-animation-container">
              {/* <div className="box-lid" />
              <div className="box-body" /> */}

              {animatedFilm && (
                <img 
                  src={animatedFilm.poster} 
                  alt="Poster"
                  className="film-poster-animation"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://www.brasscraft.com/wp-content/uploads/2017/01/no-image-available.png";
                  }}
                />
              )}
            </div>
          )}

          {randomFilm && (
            <div className="film-card film-card-vertical">
              <div className="film-header" style={{ width: '100%', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>{randomFilm.title}</h3>
              </div>

              <img 
                src={randomFilm.poster} 
                alt="Locandina" 
                className="posterFilm" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://www.brasscraft.com/wp-content/uploads/2017/01/no-image-available.png";
                }} 
              />

              {randomFilm.year && <p><strong>Anno:</strong> {randomFilm.year}</p>}
              {randomFilm.director && <p><strong>Regista:</strong> {randomFilm.director}</p>}
              {randomFilm.genre && <p><strong>Genere:</strong> {randomFilm.genre}</p>}
              {randomFilm.duration && <p><strong>Durata:</strong> {randomFilm.duration}</p>}
              <p style={{ margin: 0, color: '#007bff', fontWeight: '500' }}>
                🍿 Questo film va bene?
              </p>

              {/* Azioni per il film */}
              <div className="film-actions" style={{ 
                marginTop: '1.5rem', 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '1rem', 
                justifyContent: 'center' 
              }}>
                
                {/* Pulsanti per marcare come visto/non visto */}
                <button 
                  className="btn btn-success"
                  onClick={handleMarkAsSeen}
                  disabled={updating}
                  style={{ minWidth: '160px' }}
                >
                  {updating ? '⏳ Aggiornando...' : '👁️ OK questo è perfetto!'}
                </button>

                {/* Pulsante per ottenere un altro film */}
                <button 
                  className="btn btn-primary"
                  onClick={handleGetAnotherFilm}
                  disabled={loading}
                  style={{ minWidth: '160px' }}
                >
                  {loading ? '🔍 Cercando...' : '🎲 Altro film'}
                </button>
              </div>

              {/* Suggerimenti basati sullo stato */}
              <div style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                
              </div>
            </div>
          )}

          {!randomFilm && !loading && !error && !showAnimation && (
            <div className="loading" style={{ 
              padding: '3rem 2rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '12px',
              textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎬</div>
                <h3 style={{ margin: '0 0 1rem 0' }}>Pronto per una sorpresa?</h3>
                <p style={{ margin: 0, opacity: 0.9 }}>
                  Clicca sul pulsante per ottenere un film casuale dalla tua collezione!
                </p>
            </div>
          )}
        </div>
      </div>

      {/* Contenitore per le notifiche fluttuanti */}
      <Notifications 
        notifications={notifications}
        onClose={removeNotification}
      />
    </div>
  );
}

export default RandomFilmPage;