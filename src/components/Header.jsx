// Header.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import logo from '../assets/logo.svg';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  
  const { user, isAuthenticated, handleLogout } = useContext(AuthContext);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const closeUserMenu = () => {
    setIsUserMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogoutClick = () => {
    handleLogout();
    closeUserMenu();
    navigate('/login');
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        closeUserMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <img src={logo} alt="Logo" className="logo-image" />
          <span className="logo-text">Random Film</span>
        </Link>
        <nav>
          <div className="menu-area">
            {isAuthenticated && (
              <div className="user-menu-container" ref={userMenuRef}>
                <div className="user-info" onClick={toggleUserMenu}>
                  👤 {user?.username}
                  <span className={`dropdown-arrow ${isUserMenuOpen ? 'open' : ''}`}>▼</span>
                </div>
                {isUserMenuOpen && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-item logout" onClick={handleLogoutClick}>
                      🚪 Logoutt
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Menu hamburger solo per utenti autenticati */}
            {isAuthenticated && (
              <div className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
          </div>
          
          {/* Menu di navigazione solo per utenti autenticati */}
          {isAuthenticated && (
            <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
              <li>
                <Link to="/" className={isActive('/')} onClick={closeMenu}>
                  Cerca Film
                </Link>
              </li>
              <li>
                <Link to="/films" className={isActive('/films')} onClick={closeMenu}>
                  Lista Film
                </Link>
              </li>
              <li>
                <Link to="/random" className={isActive('/random')} onClick={closeMenu}>
                  Film Casuale
                </Link>
              </li>
            </ul>
          )}
          
          {/* Pulsanti Login/Register per utenti non autenticati */}
          {!isAuthenticated && (
            <div className="auth-buttons">
              <Link to="/login" className="auth-btn">
                Accedi
              </Link>
              <Link to="/register" className="auth-btn register">
                Registrati
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;