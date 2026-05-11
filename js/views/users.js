/**
 * users.js — Grouped User & Coaching Management View
 */
var UsersView = (function () {
  'use strict';

  var _allUsers = [];
  var _coachings = [];

  function render() {
    var container = document.getElementById('view-users');
    container.innerHTML =
      '<div class="view-header" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:.75rem;">' +
        '<div>' +
          '<h2 class="view-title">Ecosystem Users</h2>' +
          '<p class="view-subtitle">Manage organization and individual entitlements</p>' +
        '</div>' +
        '<div style="display:flex;gap:.5rem;">' +
          '<button class="btn btn-sm btn-outline" id="uRefreshBtn">Refresh</button>' +
          '<button class="btn btn-sm accent" id="uAddCoachingBtn">+ New Coaching</button>' +
        '</div>' +
      '</div>' +
      '<div id="usersContainerArea"><div class="loading">Loading ecosystem...</div></div>';

    document.getElementById('uRefreshBtn').onclick = _loadData;
    document.getElementById('uAddCoachingBtn').onclick = _showAddCoachingModal;
    _loadData();
  }

  async function _loadData() {
    var area = document.getElementById('usersContainerArea');
    if (!area) return;
    area.innerHTML = '<div class="loading">Loading ecosystem...</div>';

    try {
      const [usersRes, coachingsRes] = await Promise.all([
        API.getUsers(),
        API.getCoachings()
      ]);

      _allUsers = usersRes.users || [];
      _coachings = coachingsRes.coachings || [];
      
      AdminState.set({ usersCache: _allUsers, coachingsCache: _coachings });
      _renderGroups();
    } catch (e) {
      area.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⚠️</div><div class="empty-state-text">Error: ' + e.message + '</div></div>';
    }
  }

  function _renderGroups() {
    var area = document.getElementById('usersContainerArea');
    if (!area) return;

    var html = '';

    // Render Coaching Groups
    _coachings.forEach(function (coaching) {
      var groupUsers = _allUsers.filter(u => u.coachingId === coaching.coachingId);
      html += _buildGroupHTML(
        coaching.name + ' — ' + coaching.coachingId, 
        groupUsers, 
        'bulk', 
        coaching.coachingId
      );
    });

    // Render Independent Users
    var independentUsers = _allUsers.filter(u => !u.coachingId);
    if (independentUsers.length > 0 || _coachings.length === 0) {
      html += _buildGroupHTML('Independent / Unaffiliated Users', independentUsers, 'individual', null);
    }

    area.innerHTML = html;
  }

  function _buildGroupHTML(title, users, type, targetId) {
    var html = '<div class="coaching-group card" style="margin-bottom: 1.5rem; padding:0; overflow: hidden;">';
    
    // Header
    html += '<div class="group-header" style="padding: 1.25rem; border-bottom: 1px solid rgba(226,232,240,.6); display: flex; justify-content: space-between; align-items: center; background: #f8fafc; flex-wrap: wrap; gap: 1rem;">';
    html += '<div style="font-weight: 700; font-size: 1.0625rem; color: #0f172a; display: flex; align-items: center; gap: .5rem; word-break: break-word;">' + _escapeHtml(title) + ' <span class="badge badge-free">' + users.length + ' students</span></div>';
    
    if (type === 'bulk' && targetId) {
      html += '<button class="btn btn-sm accent" style="width: auto;" onclick="UsersView.showBulkActions(\'' + targetId + '\')">Bulk Actions ⚡</button>';
    }
    html += '</div>';

    // Users List
    html += '<div class="group-content" style="padding: 1rem; display: flex; flex-direction: column; gap: 1rem;">';
    if (users.length === 0) {
      html += '<div class="empty-state" style="padding: 1.5rem 1rem;"><div class="empty-state-text">No students in this group.</div></div>';
    } else {
      users.forEach(function (u) {
        var name = u.username || u.displayName || 'Unknown';
        var email = u.email || 'No email';
        var isPrem = u.isPremiumPlus || u.isPremium;
        var badgeHTML = '';
        if (u.isPremiumPlus) badgeHTML = '<span class="badge badge-premium-plus">Premium+</span>';
        else if (u.isPremium) badgeHTML = '<span class="badge badge-premium">Premium</span>';
        else if (u.isTrial) badgeHTML = '<span class="badge badge-draft">Trial</span>';
        else badgeHTML = '<span class="badge badge-free">Free</span>';

        // Use a container that expands on click (using a simple toggle pattern)
        var detailId = 'details_' + u.uid;
        
        html += '<div style="border: 1px solid rgba(226,232,240,.6); border-radius: .75rem; padding: 1rem; background: #fff; cursor: pointer; transition: border-color .2s;" onclick="document.getElementById(\'' + detailId + '\').style.display = document.getElementById(\'' + detailId + '\').style.display === \'none\' ? \'block\' : \'none\';">';
        html += '<div style="display: flex; justify-content: space-between; align-items: flex-start; gap: .5rem; flex-wrap: wrap;">';
        html += '<div style="flex: 1; min-width: 150px;">';
        html += '<div style="font-weight: 600; font-size: .9375rem; color: #0f172a; word-break: break-word; overflow-wrap: anywhere; line-height: 1.2; margin-bottom: .25rem;">' + _escapeHtml(name) + '</div>';
        html += '<div style="font-size: .8125rem; color: #64748b; word-break: break-word; overflow-wrap: anywhere;">' + _escapeHtml(email) + '</div>';
        html += '</div>';
        html += '<div style="display: flex; flex-direction: column; align-items: flex-end; gap: .25rem;">';
        html += badgeHTML;
        html += '<div style="font-size: .6875rem; color: #94a3b8; margin-top: .25rem;">Tap for actions ▼</div>';
        html += '</div>';
        html += '</div>';
        
        // Expanded Details
        html += '<div id="' + detailId + '" style="display: none; margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed rgba(226,232,240,.6);">';
        html += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: .75rem; margin-bottom: 1rem; font-size: .8125rem;">';
        html += '<div><span style="color: #64748b; display: block; font-size: .6875rem; text-transform: uppercase;">Joined</span>' + (u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '–') + '</div>';
        if (u.isPremiumPlus && u.premiumPlusExpiry) {
          html += '<div><span style="color: #64748b; display: block; font-size: .6875rem; text-transform: uppercase;">Expiry</span>' + new Date(u.premiumPlusExpiry).toLocaleDateString() + '</div>';
        } else if (u.isTrial && u.trialEnd) {
          html += '<div><span style="color: #64748b; display: block; font-size: .6875rem; text-transform: uppercase;">Trial Ends</span>' + new Date(u.trialEnd).toLocaleDateString() + '</div>';
        }
        html += '</div>';
        
        html += '<div style="display: flex; gap: .5rem; flex-wrap: wrap;">';
        html += '<button class="btn btn-sm btn-outline" style="flex:1;" onclick="event.stopPropagation(); UsersView.confirmEnt(\'individual\', \'trial\', \'' + u.uid + '\')">Trial</button>';
        html += '<button class="btn btn-sm btn-outline" style="flex:1;" onclick="event.stopPropagation(); UsersView.confirmEnt(\'individual\', \'premium_plus_6m\', \'' + u.uid + '\')">Premium+</button>';
        html += '<button class="btn btn-sm btn-danger" style="flex:1;" onclick="event.stopPropagation(); UsersView.confirmEnt(\'individual\', \'revoke\', \'' + u.uid + '\')">Revoke</button>';
        html += '</div>';
        
        html += '</div>'; // End Expanded Details
        html += '</div>'; // End Card
      });
    }
    html += '</div></div>';

    return html;
  }

  function _escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  }

  function _showAddCoachingModal() {
    var body = document.createElement('div');
    body.innerHTML =
      '<div class="modal-field"><label class="modal-label">Coaching ID (e.g., IMS_NAGPUR_01)</label>' +
        '<input type="text" class="modal-input" id="cIdInput" placeholder="Must be unique, no spaces" style="text-transform: uppercase;" /></div>' +
      '<div class="modal-field"><label class="modal-label">Coaching Name</label>' +
        '<input type="text" class="modal-input" id="cNameInput" placeholder="e.g. IMS Nagpur" /></div>';

    Modal.show({
      title: 'Create Coaching Institute',
      body: body,
      actions: [
        { label: 'Cancel' },
        { label: 'Create', accent: true, onClick: _createCoaching, autoClose: false }
      ]
    });
  }

  function _showBulkActions(targetId) {
    var body = document.createElement('div');
    body.innerHTML = 
      '<p class="text-secondary text-sm" style="margin-bottom: 1.5rem;">Select an action to apply to all students within coaching group <strong>' + _escapeHtml(targetId) + '</strong>.</p>' +
      '<div style="display: flex; flex-direction: column; gap: .75rem;">' +
        '<button class="btn btn-outline" onclick="UsersView.confirmEnt(\'bulk\', \'trial\', \'' + targetId + '\'); Modal.close();">Grant 7-Day Trial</button>' +
        '<button class="btn btn-outline" style="color:#2563eb; border-color:#bfdbfe;" onclick="UsersView.confirmEnt(\'bulk\', \'premium_plus_6m\', \'' + targetId + '\'); Modal.close();">Grant Premium+ (6 Months)</button>' +
        '<button class="btn btn-outline" style="color:#2563eb; border-color:#bfdbfe;" onclick="UsersView.confirmEnt(\'bulk\', \'premium_plus_1y\', \'' + targetId + '\'); Modal.close();">Grant Premium+ (1 Year)</button>' +
        '<button class="btn btn-danger" onclick="UsersView.confirmEnt(\'bulk\', \'revoke\', \'' + targetId + '\'); Modal.close();">Revoke All Access</button>' +
      '</div>';
    
    Modal.show({
      title: 'Bulk Actions',
      body: body,
      actions: [ { label: 'Close' } ]
    });
  }

  async function _createCoaching() {
    var cId = document.getElementById('cIdInput').value.trim().toUpperCase().replace(/\s+/g, '_');
    var cName = document.getElementById('cNameInput').value.trim();

    if (!cId || !cName) {
      Toast.error('Both fields are required.');
      return;
    }

    try {
      await API.createCoaching(cId, cName);
      Toast.success('Coaching created successfully.');
      Modal.close();
      _loadData();
    } catch (e) {
      Toast.error('Failed: ' + e.message);
    }
  }

  async function _confirmEntitlement(type, action, targetId) {
    var actionLabels = {
      'trial': '7-Day Trial',
      'premium': 'Lifetime Premium',
      'premium_plus_6m': 'Premium+ (6 Months)',
      'premium_plus_1y': 'Premium+ (1 Year)',
      'revoke': 'Revoke All Access'
    };

    var msg = 'Are you sure you want to ' + (action === 'revoke' ? 'revoke' : 'grant') + ' ' + actionLabels[action] + '?';
    if (type === 'bulk') {
      msg = '⚠️ WARNING: You are applying a BULK ACTION to coaching ID: ' + targetId + '.\n\nThis will permanently update all users in this group with: ' + actionLabels[action] + '.\n\nProceed?';
    }

    if (!confirm(msg)) return;

    try {
      const res = await API.grantEntitlement(type, action, targetId);
      Toast.success('Updated ' + res.updatedCount + ' user(s) successfully.');
      _loadData();
    } catch (e) {
      Toast.error('Failed to update entitlements: ' + e.message);
    }
  }

  return { 
    render: render, 
    showBulkActions: _showBulkActions,
    confirmEnt: _confirmEntitlement 
  };
})();
