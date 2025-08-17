import React, { useState } from 'react';
import { searchExternalFilm, insertFilm } from '../services/api';
import ManualInsert from '../components/ManualInsert';
import NotificationsContainer from '../components/NotificationsContainer';
import { useNotifications } from '../hooks/useNotifications';

function SearchPage() {
  // Hook per le notifiche
  const { notifications, addNotification, removeNotification } = useNotifications();

  // Stati esistenti
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedFilm, setSearchedFilm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inserting, setInserting] = useState(false);
  const [searchYear, setSearchYear] = useState('');

  const [manualFilm, setManualFilm] = useState({
    title: '',
    year: '',
    duration: '',
    director: '',
    genre: '',
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setError('Inserisci il titolo di un film');
      addNotification('⚠️ Inserisci il titolo di un film', 'warning');
      return;
    }

    setLoading(true);
    setError('');
    setSearchedFilm(null);

    try {
      const film = await searchExternalFilm(searchTerm, searchYear.trim());
      setSearchedFilm(film);
      addNotification(`🎬 Film "${film.title}" trovato!`, 'success');
    } catch (err) {
      setError(['Questo Film non è presente nel database esterno. Prova a inserirlo manualmente']);
      addNotification('🔍 Film non trovato nel database esterno', 'info');
    } finally {
      setLoading(false);
    }
  };

  const handleInsertFilm = async () => {
    if (!searchedFilm) return;

    setInserting(true);
    setError('');

    try {
      await insertFilm(searchedFilm);
      addNotification(`📚 "${searchedFilm.title}" aggiunto alla collezione!`, 'success');
      // Reset dello stato dopo inserimento riuscito
      setSearchedFilm(null);
      setSearchTerm('');
      setSearchYear('');
    } catch (err) {
      setError('Errore nell\'inserimento del film: ' + err.message);
      addNotification('Errore nell\'inserimento del film: ' + err.message, 'error');
    } finally {
      setInserting(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualFilm.title.trim()) {
      setError("Il titolo è obbligatorio");
      addNotification('⚠️ Il titolo è obbligatorio', 'warning');
      return;
    }

    setInserting(true);
    setError('');

    try {
      await insertFilm(manualFilm);
      addNotification(`📝 "${manualFilm.title}" inserito manualmente!`, 'success');
      setManualFilm({ title: '', year: '', duration: '', director: '', genre: '', seen: ''});
      setError(''); // Nasconde la sezione manuale dopo inserimento riuscito
    } catch (err) {
      setError("Errore nell'inserimento manuale: " + err.message);
      addNotification("Errore nell'inserimento manuale: " + err.message, 'error');
    } finally {
      setInserting(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="search-container">
          <h1>Cerca Film</h1>
          <p>Cerca un film dal database esterno e aggiungilo alla tua collezione</p>
          
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              className="search-input"
              placeholder="Inserisci il titolo del film..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />
            <input
              type="text"
              className="search-year"
              placeholder="Anno"
              value={searchYear}
              title="opzionale"
              onChange={(e) => setSearchYear(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Cercando...' : 'Cerca'}
            </button>
          </form>
          
          {searchedFilm && (
            <div className="film-card film-card-vertical">
              <h3>{searchedFilm.title}</h3>
              
              <img 
                src={searchedFilm.poster} 
                alt="Locandina" 
                className="posterFilm" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://www.brasscraft.com/wp-content/uploads/2017/01/no-image-available.png";
                }} 
              />
              
              {searchedFilm.year && <p><strong>Anno:</strong> {searchedFilm.year}</p>}
              {searchedFilm.director && <p><strong>Regista:</strong> {searchedFilm.director}</p>}
              {searchedFilm.genre && <p><strong>Genere:</strong> {searchedFilm.genre}</p>}
              {searchedFilm.duration && <p><strong>Durata:</strong> {searchedFilm.duration}</p>}
              
              <div className="film-actions">
                <button 
                  className="btn btn-success"
                  onClick={handleInsertFilm}
                  disabled={inserting}
                >
                  {inserting ? 'Inserendo...' : '📚 Inserisci Film'}
                </button>
              </div>
            </div>
          )}

          {/* Mantieni solo errori critici visibili */}
          {error && !searchedFilm && <div className="error">{error}</div>}

          {/* Sezione inserimento manuale - appare solo se c'è un errore di ricerca */}
          {error && (
            <ManualInsert
              manualFilm={manualFilm}
              setManualFilm={setManualFilm}
              inserting={inserting}
              onSubmit={handleManualSubmit}
            />
          )}
        </div>
      </div>

      {/* Contenitore per le notifiche fluttuanti */}
      <NotificationsContainer 
        notifications={notifications}
        onClose={removeNotification}
      />
    </div>
  );
}

export default SearchPage;