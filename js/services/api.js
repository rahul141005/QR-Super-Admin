/**
 * api.js — Centralized API service for Admin Panel
 *
 * Wraps all fetch calls to Vercel serverless endpoints.
 * Automatically attaches Firebase JWT for server-side verification.
 */
var API = (function () {
  'use strict';

  async function _fetch(endpoint, options) {
    var token = await AdminAuth.getToken();
    var config = Object.assign({}, options || {}, {
      headers: Object.assign({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }, (options && options.headers) || {})
    });

    var response = await fetch(endpoint, config);
    if (!response.ok) {
      var errData;
      try { errData = await response.json(); } catch (e) { errData = {}; }
      throw new Error(errData.error || 'Request failed (' + response.status + ')');
    }
    return response.json();
  }

  /* ---- Dashboard ---- */
  function getDashboard() {
    return _fetch('/api/admin/dashboard');
  }

  /* ---- Users ---- */
  function getUsers() {
    return _fetch('/api/admin/users');
  }

  function togglePremium(uid, isPremium) {
    return _fetch('/api/admin/users-premium', {
      method: 'POST',
      body: JSON.stringify({ uid: uid, isPremium: isPremium })
    });
  }

  /* ---- Questions ---- */
  function getQuestions() {
    return _fetch('/api/admin/questions');
  }

  return {
    getDashboard: getDashboard,
    getUsers: getUsers,
    togglePremium: togglePremium,
    getQuestions: getQuestions
  };
})();
