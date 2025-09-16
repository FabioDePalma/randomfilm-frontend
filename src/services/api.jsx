const INGRESS_IP = '34.54.230.164';  
const API_BASE_URL = `http://${INGRESS_IP}/api`;       
const AUTH_API_URL = `http://${INGRESS_IP}/api/auth`;  
// const INGRESS_IP = 'localhost'; 
// const API_BASE_URL = `http://${INGRESS_IP}:8087/api`;       
// const AUTH_API_URL = `http://${INGRESS_IP}:8080/api/auth`;  



export const login = async (username, password) => {
  const response = await fetch(`${AUTH_API_URL}/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Login failed');
  }

  const data = await response.json();
  // normalizza il token in "token"
  const token =
    data.token ??
    data.accessToken ?? 
    data.jwt ??
    data.access_token;

  if (!token) {
    throw new Error('Token non presente nella risposta di login');
  }
  console.log(data);

  return {
    token,
    id: data.id,
    username: data.username,
    email: data.email,
  };
};

export const signup = async (username, email, password) => {
  const response = await fetch(`${AUTH_API_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Signup failed');
  }

  return await response.json();
};



const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };


  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log(response.status);

    if (response.status === 401) {
      // Logout forzato
      localStorage.clear();
      window.location.href = "/login"; 
      throw new Error("Sessione scaduta, effettua di nuovo il login");
    }

    return response;
  } catch (error) {
    console.error("Errore fetch API:", error);
    console.log("token scaduto o pod non disponibile!");
    //se sono qui significa che i pod non sono up & runing OPPURE è scaduto il token!!!!
    if (error instanceof TypeError && token) {
      // localStorage.clear();
      // window.location.href = "/login";
      throw new Error("Servizio non disponibile, riprova più tardi");
    }

    throw error;
  }
};


// Funzione helper per gestire le risposte
const handleResponse = async (response) => {
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    console.log(response.status);
    // Prova a estrarre il messaggio di errore dal JSON del backend
    if (contentType?.includes('application/json')) {
      try {
        const errorData = await response.json();
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        error.status = response.status;
        error.code = errorData.code;
        throw error;
      } catch (jsonError) {
        // Se è il nostro errore personalizzato, rilancialo
        if (jsonError.status) throw jsonError;
      }
    }
    
    // Fallback per errori non-JSON o parsing fallito
    const error = new Error(`HTTP error! status: ${response.status}`);
    error.status = response.status;
    throw error;
  }
  
  // Se la risposta è vuota (204 No Content), ritorna null
  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
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
  const response = await apiFetch(url);
  return handleResponse(response);
};

// API per inserire un film
export const insertFilm = async (film) => {
  const response = await apiFetch(`${API_BASE_URL}/film`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(film),
  });
  return handleResponse(response);
};

// API per ottenere tutti i film
export const getAllFilms = async () => {
  console.log("sono dentro allfilms")
  const response = await apiFetch(`${API_BASE_URL}/films/all`);
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
    
    const response = await apiFetch(`${API_BASE_URL}/films?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return await handleResponse(response); // Ritorna l'oggetto Page con content, totalElements, totalPages, etc.
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
    
    const response = await apiFetch(`${API_BASE_URL}/films/search?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
  const response = await apiFetch(`${API_BASE_URL}/film/${film.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(film),
  });

  return handleResponse(response);
};

export const updateFilmSeenStatus = async (film) => {
  const response = await apiFetch(`${API_BASE_URL}/filmseen/${film.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(film),
  });

  return handleResponse(response);
}

// API per eliminare un film
export const deleteFilm = async (film) => {
  const response = await apiFetch(`${API_BASE_URL}/film`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(film),
  });
  return handleResponse(response);
};

// API per ottenere un film casuale
export const getRandomFilm = async () => {
  const response = await apiFetch(`${API_BASE_URL}/getrandomfilm`);
  return handleResponse(response);
};