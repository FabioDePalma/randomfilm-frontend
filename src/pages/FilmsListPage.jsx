import React, { useState, useEffect, useCallback } from 'react';
import { getFilmsPaginated, searchFilmsPaginated, updateFilm, deleteFilm, updateFilmSeenStatus } from '../services/api';
import EditFilmModal from '../components/EditFilmModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import useNotifications from '../hooks/useNotifications';
import Notifications from '../components/Notification'; // Componente



function FilmsListPage() {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingFilm, setEditingFilm] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingFilm, setDeletingFilm] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Stati per le notifiche fluttuanti
  const { addNotification, notifications, removeNotification } = useNotifications();
  
  // Stati per la paginazione
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortDir, setSortDir] = useState('asc');
  
  // Stati per la ricerca
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Stati per filtri locali
  const [showSeenFilms, setShowSeenFilms] = useState(true);


  const loadFilms = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      if (activeSearchTerm.trim().length >= 2) {
        setIsSearching(true);
        response = await searchFilmsPaginated(activeSearchTerm, currentPage, pageSize, sortDir);
      } else {
        setIsSearching(false);
        response = await getFilmsPaginated(currentPage, pageSize, sortDir);
      }
      
      console.log("Dati ricevuti:", response);
      
      setFilms(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      setError('Errore nel caricamento dei film: ' + err.message);
      addNotification('Errore nel caricamento dei film: ' + err.message, 'error');
      setFilms([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, sortDir, activeSearchTerm]);

  useEffect(() => {
    loadFilms();
  }, [loadFilms]);

  // Funzione per gestire la ricerca
  const handleSearch = () => {
    if (searchTerm.trim().length === 0) {
      // Se il campo è vuoto, torna alla lista normale
      setActiveSearchTerm('');
      setCurrentPage(0);
    } else {
      // Attiva la ricerca
      setActiveSearchTerm(searchTerm.trim());
      setCurrentPage(0);
    }
  };

  // Funzione per resettare la ricerca
  const handleResetSearch = () => {
    setSearchTerm('');
    setActiveSearchTerm('');
    setCurrentPage(0);
  };

  // Gestione del cambio del campo di ricerca (solo aggiorna il valore)
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Gestione dell'invio del form con Enter
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  // Filtri locali sui dati della pagina corrente (solo per il filtro "visto")
  const filteredFilms = films.filter(film => {
    const matchesSeen = showSeenFilms || !film.seen;
    return matchesSeen;
  });

  const handleEdit = (film) => {
    setEditingFilm(film);
    setIsModalOpen(true);
  };

  const handleSaveEdit = async (updatedFilm) => {
    try {
      setError('');
      await updateFilm(updatedFilm);
      addNotification('🎬 Film modificato con successo!', 'success');
      setIsModalOpen(false);
      setEditingFilm(null);
      loadFilms();
    } catch (err) {
      console.error('Errore completo:', err);
      if (err.status === 400) {
      const customMessage = err.message || 'Non puoi modificare il film che non hai inserito';
      setError(customMessage);
      addNotification(customMessage, 'warning');
      } else {
        // Altri errori HTTP
        const genericMessage = `Errore nell'aggiornamento del film: ${err.message}`;
        setError(genericMessage);
        addNotification(genericMessage, 'error');
      }

    }
  };

  const handleDelete = (film) => {
    setDeletingFilm(film);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (film) => {
    try {
      setError('');
      await deleteFilm(film);
      addNotification(`🗑️ "${film.title}" eliminato con successo!`, 'success');
      loadFilms();
    } catch (err) {
      console.error('Errore completo:', err);
      if (err.status === 400) {
      const customMessage = err.message || 'Non puoi eliminare il film che non hai inserito';
      setError(customMessage);
      addNotification(customMessage, 'warning');
      } else {
        // Altri errori HTTP
        const genericMessage = `Errore nell'aggiornamento del film: ${err.message}`;
        setError(genericMessage);
        addNotification(genericMessage, 'error');
      }

    }
  };

  const handleToggleSeen = async (film) => {
    try {
      setError('');
      const updatedFilm = { ...film, seen: !film.seen };
      await updateFilmSeenStatus(updatedFilm);
            
      // Messaggio personalizzato in base allo stato
      const message = updatedFilm.seen 
        ? `"${film.title}" marcato come visto!` 
        : `"${film.title}" marcato come da vedere!`;
      
      addNotification(message, 'success');

      setFilms(prevFilms =>
      prevFilms.map(f => f.id === updatedFilm.id ? updatedFilm : f)
      );
      // await loadFilms();
    } catch (err) {
      const genericMessage = `Errore nell'aggiornamento del film: ${err.message}`;
      setError(genericMessage);
      addNotification(genericMessage, 'error');

    }
    
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value));
    setCurrentPage(0);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFilm(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingFilm(null);
  };

  if (loading) {
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
        <div className="header-bar">
          <div>
            <h1>Lista Film</h1>
            <p>
              Gestisci la tua collezione di film ({totalElements} {isSearching ? 'risultati' : 'totali'})
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Cerca titolo..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ 
                width: '200px', 
                padding: '0.3rem 0.5rem', 
                fontSize: '0.9rem' 
              }}
            />
            <button 
              type="submit"
              style={{
                padding: '0.3rem 0.8rem',
                fontSize: '0.9rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔍 Cerca
            </button>
            {(isSearching || activeSearchTerm) && (
              <button 
                type="button"
                onClick={handleResetSearch}
                style={{
                  padding: '0.3rem 0.8rem',
                  fontSize: '0.9rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ✕ Reset
              </button>
            )}
          </form>
        </div>


        {/* Controlli di paginazione superiori */}
        <div className="pagination-controls">
          <div className="page-size-selector">
            <label>
              Elementi per pagina:
              <select value={pageSize} onChange={handlePageSizeChange}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </label>
          </div>

          <div className="sort-controls">
            <span>Ordina per: </span>
            <button 
              onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
              className="sort-btn"
            >
              Titolo {(sortDir === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>

        <div className="filter-section">
          <label className="filter-label">
            <input
              type="checkbox"
              checked={showSeenFilms}
              onChange={e => setShowSeenFilms(e.target.checked)}
            />
            <span>Mostra anche i film già visti</span>
          </label>
          <small className="filter-info">
            Pagina {currentPage + 1} di {totalPages} - 
            Mostrando {filteredFilms.length} di {films.length} film di questa pagina
            {isSearching && ` (filtrati per "${activeSearchTerm}")`}
          </small>
        </div>

        {filteredFilms.length === 0 ? (
          <div className="loading">
            {films.length === 0 
              ? (isSearching 
                  ? `Nessun film trovato per "${activeSearchTerm}".` 
                  : "Nessun film trovato in questa pagina."
                )
              : "Nessun film corrisponde ai filtri in questa pagina."
            }
          </div>
        ) : (
          <div className="films-list">
            {filteredFilms.map(film => (
              <div key={film.id} className={`film-card ${film.seen ? 'film-seen' : ''}`}>
                <img 
                  src={film.poster || "https://www.brasscraft.com/wp-content/uploads/2017/01/no-image-available.png"} 
                  alt="Locandina" 
                  className="posterFilmPiccola" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://www.brasscraft.com/wp-content/uploads/2017/01/no-image-available.png";
                  }} 
                />
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
                    {film.userEmail && <p><strong>Inserito da:</strong> {film.userEmail}</p>}
                    
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

        {/* Controlli di paginazione inferiori */}
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="btn btn-pagination"
          >
            ⬅️ Precedente
          </button>

          <span className="page-info">
            Pagina {currentPage + 1} di {totalPages}
          </span>

          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="btn btn-pagination"
          >
            Successiva ➡️
          </button>
        </div>

        <EditFilmModal
          film={editingFilm}
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={handleSaveEdit}
        />

        <DeleteConfirmModal
          film={deletingFilm}
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleConfirmDelete}
        />
      </div>
      {/* Contenitore per le notifiche fluttuanti */}
      <Notifications notifications={notifications} onClose={removeNotification} />
    </div>
  );
}

export default FilmsListPage;