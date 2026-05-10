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
    _bindSidebar();
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
    var views = ['dashboard', 'users', 'questions', 'system'];
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

    // Update top bar title
    var titleMap = { dashboard: 'Dashboard', users: 'Users', questions: 'Questions', system: 'System' };
    var topTitle = document.querySelector('.top-bar-title');
    if (topTitle) topTitle.textContent = titleMap[hash] || 'Dashboard';

    // Render view
    if (hash === 'dashboard') DashboardView.render();
    if (hash === 'users') UsersView.render();
    if (hash === 'questions') QuestionsView.render();
    if (hash === 'system') SystemView.render();

    // Close sidebar on mobile
    _closeSidebar();
  }

  /* ---- Sidebar Toggle ---- */
  function _bindSidebar() {
    var toggle = document.getElementById('menuToggle');
    var overlay = document.getElementById('sidebarOverlay');

    if (toggle) {
      toggle.addEventListener('click', function () {
        var sidebar = document.getElementById('sidebar');
        var isOpen = sidebar.classList.contains('open');
        if (isOpen) { _closeSidebar(); } else { _openSidebar(); }
      });
    }

    if (overlay) {
      overlay.addEventListener('click', _closeSidebar);
    }

    // Nav links close sidebar on mobile
    document.querySelectorAll('.nav-item').forEach(function (link) {
      link.addEventListener('click', function () {
        // Let hash change handle the route; sidebar closes in _handleRoute
      });
    });
  }

  function _openSidebar() {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebarOverlay').classList.add('active');
  }

  function _closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('active');
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
    var btns = [document.getElementById('logoutBtnTop'), document.getElementById('logoutBtnSidebar')];
    btns.forEach(function (btn) {
      if (btn) btn.addEventListener('click', AdminAuth.logout);
    });
  }

  return { init: init };
})();

/* ---- Bootstrap ---- */
document.addEventListener('DOMContentLoaded', function () {
  App.init();
});
