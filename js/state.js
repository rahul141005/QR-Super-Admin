/**
 * state.js - Centralized state management for Admin Panel
 */
const AppState = (function () {
  let state = {
    user: null,
    dashboardMetrics: null,
    users: [],
    questions: []
  };

  const listeners = {};

  function getState() {
    return state;
  }

  function setState(newState) {
    state = { ...state, ...newState };
    notify();
  }

  function subscribe(listener) {
    const id = Date.now().toString() + Math.random().toString();
    listeners[id] = listener;
    return () => delete listeners[id];
  }

  function notify() {
    Object.values(listeners).forEach(listener => listener(state));
  }

  return {
    getState,
    setState,
    subscribe
  };
})();
