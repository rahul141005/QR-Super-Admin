/**
 * app.js — Main entry point and SPA router for Admin Panel
 *
 * Mirrors the main app's bootstrap philosophy:
 * Initialize Firebase → Auth → Router → Views
 */
var App = (function () {
  'use strict';

  function init() {
    if (!FirebaseApp.init()) {
      console.error('Firebase failed to initialize.');
      return;
    }

    AdminAuth.init();
    _bindLogin();
    _bindLogout();

    AdminAuth.onAuthReady(function (user) {
      if (user) {
        _startRouter();
      }
    });
  }

  /* ---- Router ---- */
  function _startRouter() {
    window.addEventListener('hashchange', _handleRoute);
    if (!window.location.hash) {
      window.location.hash = '#dashboard';
    } else {
      _handleRoute();
    }
  }

  function _handleRoute() {
    var hash = (window.location.hash || '#dashboard').substring(1);
    var views = ['dashboard', 'users', 'payments', 'questions', 'system'];
    if (views.indexOf(hash) === -1) hash = 'dashboard';

    // Update state
    AdminState.set({ currentView: hash });

    // Toggle views
    views.forEach(function (v) {
      var el = document.getElementById('view-' + v);
      if (el) {
        el.style.display = v === hash ? 'block' : 'none';
        el.classList.toggle('active', v === hash);
      }
    });

    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('data-view') === hash);
    });

    // Render view
    if (hash === 'dashboard') DashboardView.render();
    if (hash === 'users') UsersView.render();
    if (hash === 'payments') PaymentsView.render();
    if (hash === 'questions') QuestionsView.render();
    if (hash === 'system') SystemView.render();
  }

  /* ---- Login Form ---- */
  function _bindLogin() {
    var btn = document.getElementById('loginBtn');
    var emailInput = document.getElementById('loginEmail');
    var passInput = document.getElementById('loginPassword');

    if (btn) {
      btn.addEventListener('click', function () {
        var email = emailInput.value.trim();
        var password = passInput.value;
        if (email && password) {
          AdminAuth.login(email, password);
        }
      });
    }

    // Enter key support
    if (passInput) {
      passInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') btn.click();
      });
    }
  }

  /* ---- Logout ---- */
  function _bindLogout() {
    var btn = document.getElementById('logoutBtnTop');
    if (btn) btn.addEventListener('click', AdminAuth.logout);
  }

  return { init: init };
})();

/* ---- Bootstrap ---- */
document.addEventListener('DOMContentLoaded', function () {
  App.init();
});
