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

    // Attach event listeners for entitlements
    var actionSelects = area.querySelectorAll('.entitlement-select');
    actionSelects.forEach(function (select) {
      select.onchange = function () {
        if (!this.value) return;
        var type = this.getAttribute('data-type');
        var targetId = this.getAttribute('data-target');
        var action = this.value;
        this.value = ''; // Reset dropdown
        _confirmEntitlement(type, action, targetId);
      };
    });
  }

  function _buildGroupHTML(title, users, type, targetId) {
    var html = '<div class="coaching-group card" style="margin-bottom: 1.5rem; border-radius: 12px; overflow: hidden; background: var(--bg-card); border: 1px solid var(--border-color);">';
    
    // Header
    html += '<div class="group-header" style="padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.02);">';
    html += '<div style="font-weight: 600; font-size: 1.1rem; color: var(--text-main);">' + title + ' <span class="badge" style="margin-left:8px; font-weight:normal; background: var(--bg-secondary);">' + users.length + ' students</span></div>';
    
    if (type === 'bulk' && targetId) {
      html += '<div class="group-actions">';
      html += '<select class="entitlement-select form-control" data-type="bulk" data-target="' + targetId + '" style="padding: 0.4rem; font-size: 0.9rem; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-body);">';
      html += '<option value="">Bulk Actions...</option>';
      html += '<option value="trial">Grant Trial (7 Days)</option>';
      html += '<option value="premium">Grant Premium (Lifetime)</option>';
      html += '<option value="premium_plus_6m">Grant Premium+ (6 Months)</option>';
      html += '<option value="premium_plus_1y">Grant Premium+ (1 Year)</option>';
      html += '<option value="revoke">Revoke All Access</option>';
      html += '</select>';
      html += '</div>';
    }
    html += '</div>';

    // Users List
    html += '<div class="group-content" style="padding: 0;">';
    if (users.length === 0) {
      html += '<div style="padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">No students in this group.</div>';
    } else {
      html += '<table class="table" style="margin: 0; width: 100%;">';
      html += '<thead><tr><th>User</th><th>Status</th><th>Joined</th><th style="text-align:right;">Actions</th></tr></thead>';
      html += '<tbody>';
      users.forEach(function (u) {
        html += '<tr style="border-bottom: 1px solid var(--border-color);">';
        html += '<td style="padding: 1rem;">';
        html += '<div style="font-weight: 500;">' + (u.username || 'Unknown') + '</div>';
        html += '<div style="font-size: 0.8rem; color: var(--text-muted);">' + (u.email || 'No email') + '</div>';
        html += '</td>';
        
        // Status Column
        html += '<td style="padding: 1rem;">';
        if (u.isPremiumPlus) {
          html += '<span class="badge badge-premium-plus">Premium+</span>';
          if (u.premiumPlusExpiry) {
            html += '<div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Exp: ' + new Date(u.premiumPlusExpiry).toLocaleDateString() + '</div>';
          }
        } else if (u.isPremium) {
          html += '<span class="badge badge-premium">Premium</span>';
        } else if (u.isTrial) {
          html += '<span class="badge badge-trial" style="background:#f39c12;color:#fff;">Trial</span>';
          if (u.trialEnd) {
            html += '<div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Exp: ' + new Date(u.trialEnd).toLocaleDateString() + '</div>';
          }
        } else {
          html += '<span class="badge badge-free" style="background:#e0e0e0;color:#333;">Free</span>';
        }
        html += '</td>';

        html += '<td style="padding: 1rem; color: var(--text-muted); font-size: 0.9rem;">' + (u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '–') + '</td>';
        
        // Individual Actions
        html += '<td style="padding: 1rem; text-align:right;">';
        html += '<select class="entitlement-select form-control" data-type="individual" data-target="' + u.uid + '" style="padding: 0.3rem; font-size: 0.8rem; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-body);">';
        html += '<option value="">Modify Access...</option>';
        html += '<option value="trial">Trial Access</option>';
        html += '<option value="premium">Premium Lifetime</option>';
        html += '<option value="premium_plus_6m">Premium+ 6m</option>';
        html += '<option value="premium_plus_1y">Premium+ 1y</option>';
        html += '<option value="revoke">Revoke Access</option>';
        html += '</select>';
        html += '</td>';
        html += '</tr>';
      });
      html += '</tbody></table>';
    }
    html += '</div></div>';

    return html;
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

  return { render: render };
})();
