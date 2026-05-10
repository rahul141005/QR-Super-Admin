/**
 * dashboard.js - Top level metrics view
 */
const DashboardView = (function() {
  let isLoaded = false;

  async function render() {
    const container = document.getElementById('view-dashboard');
    if (!isLoaded) {
      container.innerHTML = `
        <div class="view-header">
          <h2>Dashboard</h2>
          <p class="secondary-text">Overview of QuantReflex ecosystem</p>
        </div>
        <div class="stat-grid" id="dashboardStats">
          <div class="stat-card">
            <div class="stat-value">...</div>
            <div class="stat-label">Total Users</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">...</div>
            <div class="stat-label">Premium Active</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">...</div>
            <div class="stat-label">AI Tokens Used</div>
          </div>
        </div>
      `;
      loadData();
    }
  }

  async function loadData() {
    try {
      const data = await API.getDashboardMetrics();
      const statsContainer = document.getElementById('dashboardStats');
      if (statsContainer && data) {
        statsContainer.innerHTML = `
          <div class="stat-card">
            <div class="stat-value">${data.totalUsers || 0}</div>
            <div class="stat-label">Total Users</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.premiumUsers || 0}</div>
            <div class="stat-label">Premium Active</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.aiTokens || 0}</div>
            <div class="stat-label">AI Tokens Used</div>
          </div>
        `;
        isLoaded = true;
      }
    } catch (e) {
      console.error(e);
      // Fallback UI or error state
    }
  }

  return { render };
})();
