import React, { useState } from 'react';
import { searchExternalFilm, insertFilm } from '../services/api';
import ManualInsert from '../components/ManualInsert';
import useNotifications from '../hooks/useNotifications';
import Notifications from '../components/Notification'; // Componente

function SearchPage() {

  // Stati per le notifiche fluttuanti
  const { addNotification, notifications, removeNotification } = useNotifications();

  // Queste servono per gestire cosa mostra la pagina, in base alle azioni dell'utente
  const [searchTerm, setSearchTerm] = useState(''); // contiene il testo che l'utente scrive per cercare un film.
  const [searchedFilm, setSearchedFilm] = useState(null); //contiene il film trovato dopo la ricerca.
  const [loading, setLoading] = useState(false); //indica se la ricerca è in corso.
  const [error, setError] = useState(''); //contiene un messaggio d'errore da mostrare.
  const [inserting, setInserting] = useState(false); //indica se è in corso l'inserimento del film.
  const [searchYear, setSearchYear] = useState('');
  const [showManualInsert, setShowManualInsert] = useState(false); // Nuovo stato per controllare la visualizzazione

  // oggetto che contiene dati del film che vengono inseriti manualmente
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
      setShowManualInsert(false); // Non mostrare inserimento manuale per errori di validazione
      addNotification('Inserisci il titolo di un film', 'warning');
      return;
    }

    setLoading(true);
    setError('');
    setSearchedFilm(null);
    setShowManualInsert(false); // Reset dello stato

    try {
      //chiamo l'api 
      const film = await searchExternalFilm(searchTerm, searchYear.trim());
      setSearchedFilm(film);
      addNotification(`Film "${film.title}" trovato!`, 'success');
    } catch (err) {
      setError(['Questo Film non è presente nel database esterno. Prova a inserirlo manualmente']);
      setShowManualInsert(true); // Mostra inserimento manuale solo quando il film non è trovato
      addNotification('Film non trovato nel database esterno, inseriscilo manualmente', 'info');
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
      if (err.status === 400) {
        addNotification("Film già presente", 'warning');
      } else {
        // Altri errori HTTP
       setError(['Questo Film non è presente nel database esterno']);
        setShowManualInsert(true); // Mostra inserimento manuale anche in caso di errore nell'inserimento
        addNotification('Film non trovato nel database esterno, inseriscilo manualmente', 'info');
      }
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
      setShowManualInsert(false); // Nascondi il componente dopo inserimento riuscito
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
              
              <img src={searchedFilm.poster} alt="Locandina" className="posterFilm" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://www.brasscraft.com/wp-content/uploads/2017/01/no-image-available.png";
              } } />
              {searchedFilm.year && <p><strong>Anno:</strong> {searchedFilm.year}</p>}
              {searchedFilm.director && <p><strong>Regista:</strong> {searchedFilm.director}</p>}
              {searchedFilm.genre && <p><strong>Genere:</strong> {searchedFilm.genre}</p>}
              
              <div className="film-actions">
                <button 
                  className="btn btn-success"
                  onClick={handleInsertFilm}
                  disabled={inserting}
                >
                  {inserting ? 'Inserendo...' : 'Inserisci Film'}
                </button>
              </div>
            </div>
          )}

          {/* Mantieni solo errori critici visibili */}
          {error && !searchedFilm && <div className="error">{error}</div>}

          {/* Sezione inserimento manuale - appare solo quando showManualInsert è true */}
          {showManualInsert && (
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
      <Notifications notifications={notifications} onClose={removeNotification} />
    </div>
  );
}

export default SearchPage;