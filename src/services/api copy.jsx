// src/services/api.js
import { getAuthHeaders } from './keycloak';

const API_BASE_URL = 'http://localhost:8080/api';

// Funzione helper per gestire le risposte
const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  // Se la risposta è vuota (204 No Content), ritorna null
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  
  return null;
};

// API per cercare film esterni
export const searchExternalFilm = async (title, year) => {
  let url = `${API_BASE_URL}/external/${encodeURIComponent(title)}`;
  if (year !== undefined && year !== null && year !== '') {
    url += `?year=${encodeURIComponent(year)}`;
  }
  const response = await fetch(url, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// API per inserire un film
export const insertFilm = async (film) => {
  const response = await fetch(`${API_BASE_URL}/film`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(film),
  });
  return handleResponse(response);
};

// API per ottenere tutti i film
export const getAllFilms = async () => {
  console.log("sono dentro allfilms")
  const response = await fetch(`${API_BASE_URL}/films/all`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// API per prendere film paginati
export const getFilmsPaginated = async (page = 0, size = 10, sortDir = 'asc') => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortDir
    });
    
    const response = await fetch(`${API_BASE_URL}/films?${params}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Errore nel recupero dei film paginati:', error);
    throw error;
  }
};

// API per cercare film con paginazione
export const searchFilmsPaginated = async (title, page = 0, size = 10, sortDir = 'asc') => {
  try {
    const params = new URLSearchParams({
      title: title.trim(),
      page: page.toString(),
      size: size.toString(),
      sortDir
    });
    
    const response = await fetch(`${API_BASE_URL}/films/search?${params}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Errore nella ricerca dei film:', error);
    throw error;
  }
};

// API per modificare un film
export const updateFilm = async (film) => {
  const response = await fetch(`${API_BASE_URL}/film/${film.id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(film),
  });

  return handleResponse(response);
};

// API per eliminare un film
export const deleteFilm = async (film) => {
  const response = await fetch(`${API_BASE_URL}/film`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    body: JSON.stringify(film),
  });
  return handleResponse(response);
};

// API per ottenere un film casuale
export const getRandomFilm = async () => {
  const response = await fetch(`${API_BASE_URL}/getrandomfilm`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};