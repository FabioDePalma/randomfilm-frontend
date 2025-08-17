import Keycloak from 'keycloak-js';

const keycloakInstance  = new Keycloak({
  url: 'http://34.54.230.164/auth',
  realm: 'randomfilm',
  clientId: 'randomfilm'
});

const initKeycloak = async () => {
  try {
    const authenticated = await keycloakInstance.init({
      onLoad: 'check-sso', // Tenta un single sign-on silenzioso
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      pkceMethod: 'S256',
    });
    console.log(`Keycloak autenticato: ${authenticated}`);
    return authenticated; // Restituisce true se autenticato, false altrimenti
  } catch (error) {
    console.error('Errore durante l\'inizializzazione di Keycloak:', error);
    return false; // Errore durante l'inizializzazione
  }
};

export { keycloakInstance as keycloak, initKeycloak };