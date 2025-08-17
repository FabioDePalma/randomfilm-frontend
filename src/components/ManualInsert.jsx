import React from 'react';

function ManualInsert({ manualFilm, setManualFilm, onSubmit, inserting }) {
  return (
    <div className="manual-insert-form">
      <h2>Prova a inserirlo manualmente</h2>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Titolo *"
          value={manualFilm.title}
          onChange={(e) => setManualFilm({ ...manualFilm, title: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Anno"
          value={manualFilm.year}
          onChange={(e) => setManualFilm({ ...manualFilm, year: e.target.value })}
        />
        <input
          type="text"
          placeholder="Durata"
          value={manualFilm.duration}
          onChange={(e) => setManualFilm({ ...manualFilm, duration: e.target.value })}
        />
        <input
          type="text"
          placeholder="Regista"
          value={manualFilm.director}
          onChange={(e) => setManualFilm({ ...manualFilm, director: e.target.value })}
        />
        <input
          type="text"
          placeholder="Genere"
          value={manualFilm.genre}
          onChange={(e) => setManualFilm({ ...manualFilm, genre: e.target.value })}
        />
        <button type="submit" className="btn btn-primary" disabled={inserting}>
          {inserting ? 'Inserendo...' : 'Inserisci manualmente'}
        </button>
      </form>
    </div>
  );
}

export default ManualInsert;
