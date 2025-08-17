import React, { useState, useEffect, useCallback } from 'react';
import { getFilmsPaginated, searchFilmsPaginated, updateFilm, deleteFilm } from '../services/api';
import EditFilmModal from '../components/EditFilmModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

// Componente per le notifiche fluttuanti
const FloatingNotification = ({ notification, onClose }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '✅';
    }
  };

  const handleClose = () => {
    // Aggiungi classe per animazione di uscita
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
        <span className="notification-icon">
          {getIcon(notification.type)}
        </span>
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

function FilmsListPage() {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingFilm, setEditingFilm] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingFilm, setDeletingFilm] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Stati per le notifiche fluttuanti
  const [notifications, setNotifications] = useState([]);
  
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

  const loadFilms = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      if (activeSearchTerm.trim().length >= 3) {
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
      setActiveSearchTerm('');
      setCurrentPage(0);
    } else {
      setActiveSearchTerm(searchTerm.trim());
      setCurrentPage(0);
    }
  };

  const handleResetSearch = () => {
    setSearchTerm('');
    setActiveSearchTerm('');
    setCurrentPage(0);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  // Filtri locali sui dati della pagina corrente
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
      setError('Errore nella modifica del film: ' + err.message);
      addNotification('Errore nella modifica del film: ' + err.message, 'error');
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
      setError('Errore nell\'eliminazione del film: ' + err.message);
      addNotification('Errore nell\'eliminazione del film: ' + err.message, 'error');
    }
  };

  const handleToggleSeen = async (film) => {
    try {
      setError('');
      const updatedFilm = { ...film, seen: !film.seen };
      await updateFilm(updatedFilm);
      
      // Messaggio personalizzato in base allo stato
      const message = updatedFilm.seen 
        ? `👁️ "${film.title}" marcato come visto!` 
        : `🔍 "${film.title}" marcato come da vedere!`;
      
      addNotification(message, 'success');

      setFilms(prevFilms =>
        prevFilms.map(f => f.id === updatedFilm.id ? updatedFilm : f)
      );
    } catch (err) {
      setError('Errore nell\'aggiornamento del film: ' + err.message);
      addNotification('Errore nell\'aggiornamento del film: ' + err.message, 'error');
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

        {/* Mantieni i messaggi di errore normali solo per errori critici */}
        {error && <div className="error">{error}</div>}

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
      <NotificationsContainer 
        notifications={notifications}
        onClose={removeNotification}
      />
    </div>
  );
}

export default FilmsListPage;