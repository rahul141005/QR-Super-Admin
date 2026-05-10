/**
 * app.js - Main entry point and SPA router
 */
const AppRouter = (function() {
  
  function init() {
    window.addEventListener('hashchange', handleRoute);
    
    // Initial route
    if (!window.location.hash) {
      window.location.hash = '#dashboard';
    } else {
      handleRoute();
    }
  }

  function handleRoute() {
    const hash = window.location.hash.substring(1) || 'dashboard';
    
    // Hide all views
    document.querySelectorAll('.spa-view').forEach(view => {
      view.style.display = 'none';
      view.classList.remove('active');
    });

    // Remove active class from nav
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });

    // Show target view
    const targetView = document.getElementById(`view-${hash}`);
    const targetLink = document.querySelector(`.nav-link[data-view="${hash}"]`);

    if (targetView) {
      targetView.style.display = 'block';
      targetView.classList.add('active');
      
      // Call view specific init
      if (hash === 'dashboard' && DashboardView) DashboardView.render();
      if (hash === 'users' && UsersView) UsersView.render();
      if (hash === 'questions' && QuestionsView) QuestionsView.render();
      if (hash === 'system' && SystemView) SystemView.render();
    }

    if (targetLink) {
      targetLink.classList.add('active');
    }
  }

  return { init };
})();

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  if (FirebaseApp.init()) {
    Auth.init();
  }
});
