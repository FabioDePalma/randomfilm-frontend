// App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import SearchPage from './pages/SearchPage';
import FilmsListPage from './pages/FilmsListPage';
import RandomFilmPage from './pages/RandomFilmPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <div className="App">
          <Header />
          <main style={{ minHeight: 'calc(100vh - 60px)', padding: '1rem' }}>
            <Routes>
              {/* Rotte pubbliche */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Rotte protette */}
              <Route path="/" element={
                <ProtectedRoute>
                  <SearchPage />
                </ProtectedRoute>
              } />
              
              <Route path="/films" element={
                <ProtectedRoute>
                  <FilmsListPage />
                </ProtectedRoute>
              } />
              
              <Route path="/random" element={
                <ProtectedRoute>
                  <RandomFilmPage />
                </ProtectedRoute>
              } />
              
              {/* Rotta 404 */}
              <Route path="*" element={
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <h2>Pagina non trovata</h2>
                  <p>La pagina che stai cercando non esiste.</p>
                </div>
              } />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;