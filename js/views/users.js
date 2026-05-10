/**
 * users.js - CRM view for users
 */
const UsersView = (function() {
  
  async function render() {
    const container = document.getElementById('view-users');
    container.innerHTML = `
      <div class="view-header" style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h2>Users</h2>
          <p class="secondary-text">Manage users and subscriptions</p>
        </div>
        <button class="btn action-btn" id="refreshUsersBtn">Refresh</button>
      </div>
      <div id="usersTableContainer">Loading users...</div>
    `;

    document.getElementById('refreshUsersBtn').onclick = loadData;
    loadData();
  }

  async function loadData() {
    const tableContainer = document.getElementById('usersTableContainer');
    try {
      tableContainer.innerHTML = 'Loading users...';
      const data = await API.getUsers();
      
      const columns = [
        { label: 'Username', key: 'username' },
        { label: 'Email', key: 'email' },
        { 
          label: 'Status', 
          key: 'isPremium',
          render: (val) => val ? '<span class="badge premium">Premium</span>' : '<span class="badge free">Free</span>'
        },
        { 
          label: 'Joined', 
          key: 'createdAt',
          render: (val) => val ? new Date(val).toLocaleDateString() : '-'
        }
      ];

      const actionsRenderer = (row) => {
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.textContent = row.isPremium ? 'Revoke Premium' : 'Grant Premium';
        btn.onclick = () => togglePremium(row.uid, !row.isPremium);
        return btn;
      };

      const tableEl = TableBuilder.createTable(columns, data.users, actionsRenderer);
      tableContainer.innerHTML = '';
      tableContainer.appendChild(tableEl);

    } catch (e) {
      console.error(e);
      tableContainer.innerHTML = `<p style="color:var(--danger-color)">Error loading users: ${e.message}</p>`;
    }
  }

  async function togglePremium(uid, newStatus) {
    try {
      await API.togglePremium(uid, newStatus);
      loadData(); // Refresh list
    } catch (e) {
      alert("Failed to update premium status: " + e.message);
    }
  }

  return { render };
})();
