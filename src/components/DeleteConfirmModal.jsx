import React from 'react';

function DeleteConfirmModal({ film, isOpen, onClose, onConfirm }) {
  if (!isOpen || !film) return null;

  const handleConfirm = () => {
    onConfirm(film);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Conferma eliminazione</h2>
        
        <div style={{ marginBottom: '1.5rem' }}>
        <p>Sei sicuro di voler eliminare questo film?</p>
        <div className="modal" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <strong>{film.title}</strong>
            {film.year && <div>Anno: {film.year}</div>}
            {film.director && <div>Regista: {film.director}</div>}
          </div>
          <img
            src={film.poster || "https://www.brasscraft.com/wp-content/uploads/2017/01/no-image-available.png"}
            alt="Locandina"
            className="posterFilmPiccola"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://www.brasscraft.com/wp-content/uploads/2017/01/no-image-available.png";
            }}
            style={{ maxWidth: '120px', height: 'auto', objectFit: 'cover' }}
          />
        </div>
      </div>


        <div className="modal-actions">
          <button 
            type="button" 
            className="btn"
            onClick={onClose}
            style={{ backgroundColor: '#6c757d',color:'white' }}
          >
            Annulla
          </button>
          <button 
            type="button" 
            className="btn btn-danger"
            onClick={handleConfirm}
          >
            Elimina definitivamente
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;