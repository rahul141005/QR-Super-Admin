/**
 * api.js - Wrapper for API calls to Vercel backend
 */
const API = (function() {
  
  async function fetchWithAuth(endpoint, options = {}) {
    const auth = FirebaseApp.getAuth();
    if (!auth || !auth.currentUser) {
      throw new Error("Not authenticated");
    }

    const token = await auth.currentUser.getIdToken();
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    };

    const response = await fetch(endpoint, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "API Request Failed");
    }

    return data;
  }

  return {
    getDashboardMetrics: () => fetchWithAuth('/api/admin/dashboard'),
    getUsers: () => fetchWithAuth('/api/admin/users'),
    togglePremium: (uid, isPremium) => fetchWithAuth('/api/admin/users/premium', {
      method: 'POST',
      body: JSON.stringify({ uid, isPremium })
    }),
    getQuestions: () => fetchWithAuth('/api/admin/questions')
  };
})();
