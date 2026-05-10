/**
 * users.js — User management view
 */
var UsersView = (function () {
  'use strict';

  function render() {
    var container = document.getElementById('view-users');
    container.innerHTML =
      '<div class="view-header">' +
        '<h2 class="view-title">Users</h2>' +
        '<p class="view-subtitle">Manage users and subscriptions</p>' +
      '</div>' +
      '<div class="search-bar">' +
        '<input type="text" class="search-input" id="userSearchInput" placeholder="Search by username or email..." />' +
        '<button class="btn btn-sm btn-outline" id="userRefreshBtn">Refresh</button>' +
      '</div>' +
      '<div id="usersTableArea"><div class="loading">Loading users...</div></div>';

    document.getElementById('userRefreshBtn').onclick = _loadUsers;
    document.getElementById('userSearchInput').addEventListener('input', _filterUsers);
    _loadUsers();
  }

  var _allUsers = [];

  async function _loadUsers() {
    var area = document.getElementById('usersTableArea');
    if (!area) return;
    area.innerHTML = '<div class="loading">Loading users...</div>';

    try {
      var data = await API.getUsers();
      _allUsers = data.users || [];
      AdminState.set({ usersCache: _allUsers });
      _renderTable(_allUsers);
    } catch (e) {
      area.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⚠️</div><div class="empty-state-text">Error: ' + e.message + '</div></div>';
    }
  }

  function _filterUsers() {
    var q = (document.getElementById('userSearchInput').value || '').toLowerCase().trim();
    if (!q) { _renderTable(_allUsers); return; }
    var filtered = _allUsers.filter(function (u) {
      return (u.username || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
    });
    _renderTable(filtered);
  }

  function _renderTable(users) {
    var area = document.getElementById('usersTableArea');
    if (!area) return;

    var columns = [
      { key: 'username', label: 'User' },
      { key: 'email', label: 'Email' },
      {
        key: 'isPremium', label: 'Status',
        render: function (val, row) {
          if (row.isPremiumPlus) return '<span class="badge badge-premium-plus">Premium+</span>';
          if (val) return '<span class="badge badge-premium">Premium</span>';
          return '<span class="badge badge-free">Free</span>';
        }
      },
      {
        key: 'createdAt', label: 'Joined',
        render: function (val) {
          if (!val) return '–';
          return new Date(val).toLocaleDateString();
        }
      }
    ];

    var actionsRenderer = function (row) {
      var frag = document.createDocumentFragment();
      var toggleBtn = document.createElement('button');
      toggleBtn.className = 'action-btn';
      toggleBtn.textContent = row.isPremium ? 'Revoke' : 'Grant';
      toggleBtn.onclick = function () { _togglePremium(row.uid, !row.isPremium); };
      frag.appendChild(toggleBtn);
      return frag;
    };

    area.innerHTML = '';
    area.appendChild(Table.build(columns, users, actionsRenderer));
  }

  async function _togglePremium(uid, newStatus) {
    try {
      await API.togglePremium(uid, newStatus);
      Toast.success(newStatus ? 'Premium granted' : 'Premium revoked');
      _loadUsers();
    } catch (e) {
      Toast.error('Failed: ' + e.message);
    }
  }

  return { render: render };
})();
