import React, { useState, useEffect } from 'react';

function EditFilmModal({ film, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    year: '',
    director: '',
    duration: '',
    genre: '',
    seen: '',
    poster: '',
    userEmail: ''
  });

  useEffect(() => {
    if (film) {
      setFormData({
        id: film.id || '',
        title: film.title || '',
        year: film.year || '',
        director: film.director || '',
        duration: film.duration || '',
        genre: film.genre || '',
        seen: film.seen ?? false,
        poster: film.poster || '',
        userEmail: film.userEmail || ''
      });
    }
  }, [film]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Prepara i dati per l'invio
    const filmToSave = {
      ...formData,
      year: formData.year ? parseInt(formData.year) : null
    };
    onSave(filmToSave);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Modifica Film</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label htmlFor="title">Titolo:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label htmlFor="year">Anno:</label>
            <input
              type="number"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label htmlFor="director">Regista:</label>
            <input
              type="text"
              id="director"
              name="director"
              value={formData.director}
              onChange={handleChange}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label htmlFor="duration">Durata:</label>
            <input
              type="text"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label htmlFor="genre">Genere:</label>
            <input
              type="text"
              id="genre"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              placeholder="es. Action, Adventure, Sci-Fi"
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Salva Modifiche
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditFilmModal;