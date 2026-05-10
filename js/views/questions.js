/**
 * questions.js — Question Bank management view
 */
var QuestionsView = (function () {
  'use strict';

  function render() {
    var container = document.getElementById('view-questions');
    container.innerHTML =
      '<div class="view-header" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:.75rem;">' +
        '<div>' +
          '<h2 class="view-title">Question Bank</h2>' +
          '<p class="view-subtitle">Manage word problems and categories</p>' +
        '</div>' +
        '<div style="display:flex;gap:.5rem;">' +
          '<button class="btn btn-sm btn-outline" id="qRefreshBtn">Refresh</button>' +
          '<button class="btn btn-sm accent" id="qAddBtn">+ Add</button>' +
        '</div>' +
      '</div>' +
      '<div id="questionsTableArea"><div class="loading">Loading questions...</div></div>';

    document.getElementById('qRefreshBtn').onclick = _loadQuestions;
    document.getElementById('qAddBtn').onclick = _showAddModal;
    _loadQuestions();
  }

  async function _loadQuestions() {
    var area = document.getElementById('questionsTableArea');
    if (!area) return;
    area.innerHTML = '<div class="loading">Loading questions...</div>';

    try {
      var data = await API.getQuestions();
      var questions = data.questions || [];
      AdminState.set({ questionsCache: questions });

      var columns = [
        { key: 'category', label: 'Category' },
        {
          key: 'text', label: 'Question',
          render: function (val) {
            var txt = val || '';
            return txt.length > 60 ? txt.substring(0, 60) + '…' : txt;
          }
        },
        { key: 'difficulty', label: 'Difficulty' },
        {
          key: 'status', label: 'Status',
          render: function (val) {
            if (val === 'active') return '<span class="badge badge-active">Active</span>';
            if (val === 'draft') return '<span class="badge badge-draft">Draft</span>';
            if (val === 'archived') return '<span class="badge badge-archived">Archived</span>';
            return '<span class="badge badge-draft">' + (val || 'draft') + '</span>';
          }
        }
      ];

      area.innerHTML = '';
      area.appendChild(Table.build(columns, questions));
    } catch (e) {
      area.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⚠️</div><div class="empty-state-text">Error: ' + e.message + '</div></div>';
    }
  }

  function _showAddModal() {
    var body = document.createElement('div');
    body.innerHTML =
      '<div class="modal-field"><label class="modal-label">Category</label>' +
        '<select class="modal-select" id="mqCategory">' +
          '<option value="percentages">Percentages</option>' +
          '<option value="profit-loss">Profit &amp; Loss</option>' +
          '<option value="ratios">Ratios</option>' +
          '<option value="averages">Averages</option>' +
          '<option value="time-speed-distance">Time Speed Distance</option>' +
          '<option value="time-and-work">Time &amp; Work</option>' +
          '<option value="fractions">Fractions</option>' +
          '<option value="multiplication">Multiplication</option>' +
        '</select></div>' +
      '<div class="modal-field"><label class="modal-label">Question Text</label>' +
        '<textarea class="modal-input" id="mqText" rows="3" placeholder="Enter question..."></textarea></div>' +
      '<div class="modal-field"><label class="modal-label">Correct Answer</label>' +
        '<input type="text" class="modal-input" id="mqAnswer" placeholder="Answer" /></div>' +
      '<div class="modal-field"><label class="modal-label">Difficulty</label>' +
        '<select class="modal-select" id="mqDifficulty">' +
          '<option value="easy">Easy</option>' +
          '<option value="medium" selected>Medium</option>' +
          '<option value="hard">Hard</option>' +
        '</select></div>';

    Modal.show({
      title: 'Add Question',
      body: body,
      actions: [
        { label: 'Cancel' },
        { label: 'Save Draft', accent: true, onClick: _saveQuestion, autoClose: false }
      ]
    });
  }

  async function _saveQuestion() {
    var text = document.getElementById('mqText').value.trim();
    var answer = document.getElementById('mqAnswer').value.trim();
    var category = document.getElementById('mqCategory').value;
    var difficulty = document.getElementById('mqDifficulty').value;

    if (!text || !answer) {
      Toast.error('Question and answer are required.');
      return;
    }

    try {
      var db = FirebaseApp.getDb();
      await db.collection('questions').add({
        text: text,
        answer: answer,
        category: category,
        difficulty: difficulty,
        status: 'draft',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      Toast.success('Question saved as draft');
      Modal.close();
      _loadQuestions();
    } catch (e) {
      Toast.error('Failed to save: ' + e.message);
    }
  }

  return { render: render };
})();
