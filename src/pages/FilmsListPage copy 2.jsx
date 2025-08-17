import React, { useState, useEffect } from 'react';
import { getAllFilms, updateFilm, deleteFilm } from '../services/api';
import EditFilmModal from '../components/EditFilmModal';

function FilmsListPage() {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingFilm, setEditingFilm] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSeenFilms, setShowSeenFilms] = useState(true); // true = mostra tutti, false = solo non visti
  const [filteredFilms, setFilteredFilms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);

  useEffect(() => {
    loadFilms();
  }, []);

  useEffect(() => {
    filterFilms();
  }, [films, showSeenFilms, searchTerm, selectedGenres]);

  const loadFilms = async () => {
    try {
      setLoading(true);
      setError('');
      const filmsData = await getAllFilms();
      console.log("getAllFilms completata, dati ricevuti:", filmsData);
      setFilms(filmsData || []);
    } catch (err) {
      setError('Errore nel caricamento dei film: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Funzione per estrarre tutti i generi unici dai film
  const getAllUniqueGenres = () => {
    const allGenres = new Set();
    films.forEach(film => {
      if (film.genre) {
        // Dividi i generi per virgola e aggiungi ciascuno al Set
        const genres = film.genre.split(',').map(g => g.trim());
        genres.forEach(genre => {
          if (genre) allGenres.add(genre);
        });
      }
    });
    return Array.from(allGenres).sort();
  };

  // Funzione per verificare se un film contiene tutti i generi selezionati
  const filmHasAllGenres = (film, genresToFind) => {
    if (!film.genre || genresToFind.length === 0) return true;
    const filmGenres = film.genre.split(',').map(g => g.trim().toLowerCase());
    return genresToFind.every(genre => 
      filmGenres.includes(genre.toLowerCase())
    );
  };

  const filterFilms = () => {
    let filtered = films;
    
    // Filtro per visto/non visto
    if (!showSeenFilms) {
      filtered = filtered.filter(film => !film.seen);
    }
    
    // Filtro per titolo
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(film =>
        film.title.toLowerCase().includes(searchTerm.trim().toLowerCase())
      );
    }
    
    // Filtro per generi multipli
    if (selectedGenres.length > 0) {
      filtered = filtered.filter(film => filmHasAllGenres(film, selectedGenres));
    }

    setFilteredFilms(filtered);
  };

  const handleEdit = (film) => {
    setEditingFilm(film);
    setIsModalOpen(true);
  };

  const handleSaveEdit = async (updatedFilm) => {
    try {
      setError('');
      setSuccess('');
      await updateFilm(updatedFilm);
      setSuccess('Film modificato con successo!');
      setIsModalOpen(false);
      setEditingFilm(null);
      loadFilms(); // Ricarica la lista
    } catch (err) {
      if(err.response && err.response.status === 400) {
        const msg = err.response.data?.message || 'Richiesta non valida durante la modifica del film.';
        setError(msg);
        addNotification(msg, 'error');
        setError('Errore nella modifica del film: ' + err.message);
      }else{
        setError('Errore nella modifica del film: ' + err.message);
        addNotification('Errore nella modifica del film: ' + err.message, 'error');
      }
  };

  const handleDelete = async (film) => {
    if (!window.confirm(`Sei sicuro di voler eliminare "${film.title}"?`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await deleteFilm(film);
      setSuccess('Film eliminato con successo!');
      loadFilms(); // Ricarica la lista
    } catch (err) {
      setError('Errore nell\'eliminazione del film: ' + err.message);
    }
  };

  const handleToggleSeen = async (film) => {
    try {
      setError('');
      setSuccess('');
      const updatedFilm = { ...film, seen: !film.seen };
      await updateFilm(updatedFilm);
      setSuccess(`Film marcato come ${updatedFilm.seen ? 'visto' : 'non visto'}!`);
      loadFilms(); // Ricarica la lista
    } catch (err) {
      if(err.response && err.response.status === 400) {
        const msg = err.response.data?.message || 'Richiesta non valida durante la modifica del film.';
        setError(msg);
        addNotification(msg, 'error');
        setError('non puoi modificare un film che non hai inserito ' + err.message);
      }else{
        setError('Errore nella modifica del film: ' + err.message);
        addNotification('Errore nella modifica del film: ' + err.message, 'error');
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFilm(null);
  };

  // Gestisce la selezione/deselezione dei generi
  const handleGenreToggle = (genre) => {
    setSelectedGenres(prev => {
      if (prev.includes(genre)) {
        // Rimuovi il genere se già selezionato
        return prev.filter(g => g !== genre);
      } else {
        // Aggiungi il genere se non selezionato
        return [...prev, genre];
      }
    });
  };

  // Pulisce tutti i filtri genere
  const clearGenreFilters = () => {
    setSelectedGenres([]);
  };

  const handleFilterChange = (e) => {
    setShowSeenFilms(e.target.checked);
  };
    return (
      <div className="page">
        <div className="container">
          <div className="loading">Caricamento film...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <h1>Lista Film</h1>
        <p>Gestisci la tua collezione di film</p>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div className="filter-bar" style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Cerca titolo film..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
          />

          <div className="genre-filter">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <h4 style={{ margin: 0 }}>Filtra per generi:</h4>
              {selectedGenres.length > 0 && (
                <button 
                  onClick={clearGenreFilters}
                  style={{ 
                    padding: '0.25rem 0.5rem', 
                    fontSize: '0.8rem',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Pulisci filtri ({selectedGenres.length})
                </button>
              )}
            </div>
            
            <div className="genre-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {getAllUniqueGenres().map(genre => (
                <button
                  key={genre}
                  onClick={() => handleGenreToggle(genre)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: selectedGenres.includes(genre) ? '2px solid #2196F3' : '1px solid #ccc',
                    backgroundColor: selectedGenres.includes(genre) ? '#E3F2FD' : 'white',
                    color: selectedGenres.includes(genre) ? '#1976D2' : '#333',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: selectedGenres.includes(genre) ? 'bold' : 'normal'
                  }}
                >
                  {genre} {selectedGenres.includes(genre) ? '✓' : '+'}
                </button>
              ))}
            </div>
            
            {selectedGenres.length > 0 && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                Generi selezionati: <strong>{selectedGenres.join(' + ')}</strong>
                <br />
                <small>Mostrando film che contengono TUTTI i generi selezionati</small>
              </div>
            )}
          </div>
        </div>

        <div className="filter-section">
          <label className="filter-label">
            <input
              type="checkbox"
              checked={showSeenFilms}
              onChange={handleFilterChange}
            />
            <span>Mostra anche i film già visti</span>
          </label>
          <small className="filter-info">
            {showSeenFilms 
              ? `Visualizzando tutti i film (${filteredFilms.length} totali)` 
              : `Visualizzando solo film non visti (${filteredFilms.length} di ${films.length})`
            }
            {selectedGenres.length > 0 && (
              <span> - Filtrati per generi: {selectedGenres.join(', ')}</span>
            )}
          </small>
        </div>

        {filteredFilms.length === 0 ? (
          <div className="loading">
            {films.length === 0 
              ? "Nessun film trovato nella collezione." 
              : selectedGenres.length > 0
                ? `Nessun film trovato con i generi: ${selectedGenres.join(' + ')}`
                : "Nessun film non visto trovato."
            }
          </div>
        ) : (
          <div className="films-list">
            {filteredFilms.map(film => (
              <div key={film.id} className={`film-card ${film.seen ? 'film-seen' : ''}`}>
                <img src={film.poster || "https://www.brasscraft.com/wp-content/uploads/2017/01/no-image-available.png"} alt="Locandina" className="posterFilmPiccola" />
                <div className="film-content">
                  <div className="film-details">
                    <div className="film-header">
                      <h3>{film.title}</h3>
                      <div className="seen-status">
                        <span className={`seen-badge ${film.seen ? 'seen' : 'not-seen'}`}>
                          {film.seen ? '👁️ Visto' : '🔍 Da vedere'}
                        </span>
                      </div>
                    </div>
                    {film.year && <p><strong>Anno:</strong> {film.year}</p>}
                    {film.director && <p><strong>Regista:</strong> {film.director}</p>}
                    {film.genre && <p><strong>Genere:</strong> {film.genre}</p>}
                    {film.duration && <p><strong>Durata:</strong> {film.duration}</p>}
                    
                    <div className="film-actions">
                      <button 
                        className={`btn ${film.seen ? 'btn-secondary' : 'btn-success'} btn-toggle-seen`}
                        onClick={() => handleToggleSeen(film)}
                      >
                        {film.seen ? '📝 da vedere' : '✅ visto'}
                      </button>
                      <button 
                        className="btn btn-warning"
                        onClick={() => handleEdit(film)}
                      >
                        Modifica
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleDelete(film)}
                      >
                        Elimina
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <EditFilmModal
          film={editingFilm}
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={handleSaveEdit}
        />
      </div>
    </div>
  );


export default FilmsListPage;