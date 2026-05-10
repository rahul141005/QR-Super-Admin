/**
 * auth.js - Firebase Auth and login flow
 */
const Auth = (function() {
  
  function init() {
    const auth = FirebaseApp.getAuth();
    
    auth.onAuthStateChanged(async (user) => {
      const loginScreen = document.getElementById('loginScreen');
      const appContainer = document.getElementById('appContainer');
      const loadingOverlay = document.getElementById('loadingOverlay');

      if (user) {
        try {
          // Force refresh token to get latest custom claims
          const idTokenResult = await user.getIdTokenResult(true);
          
          if (idTokenResult.claims.admin) {
            // Authorized Admin
            AppState.setState({ user: user });
            loginScreen.style.display = 'none';
            appContainer.style.display = 'flex';
            // Start router
            AppRouter.init();
          } else {
            // Not an admin
            throw new Error("Unauthorized. Missing admin claim.");
          }
        } catch (error) {
          console.error(error);
          showError("Access Denied. You do not have admin privileges.");
          auth.signOut();
        }
      } else {
        // Logged out
        AppState.setState({ user: null });
        loginScreen.style.display = 'flex';
        appContainer.style.display = 'none';
      }
    });

    bindEvents();
  }

  function bindEvents() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');

    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        if (email && password) {
          login(email, password);
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', logout);
    }
  }

  function login(email, password) {
    const auth = FirebaseApp.getAuth();
    hideError();
    auth.signInWithEmailAndPassword(email, password)
      .catch(error => {
        showError(error.message);
      });
  }

  function logout() {
    const auth = FirebaseApp.getAuth();
    auth.signOut();
  }

  function showError(msg) {
    const err = document.getElementById('loginError');
    if (err) {
      err.textContent = msg;
      err.style.display = 'block';
    }
  }

  function hideError() {
    const err = document.getElementById('loginError');
    if (err) {
      err.style.display = 'none';
    }
  }

  return { init, logout };
})();
