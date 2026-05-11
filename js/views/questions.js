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
          '<p class="view-subtitle">Centralized AI educational content pipeline</p>' +
        '</div>' +
        '<div style="display:flex;gap:.5rem;">' +
          '<button class="btn btn-sm btn-outline" id="qRefreshBtn">Refresh</button>' +
          '<button class="btn btn-sm" id="qGenerateBtn" style="background:var(--bg-secondary); border:1px solid var(--border-color);">✨ AI Generate</button>' +
          '<button class="btn btn-sm accent" id="qAddBtn">+ Manual Add</button>' +
        '</div>' +
      '</div>' +
      '<div id="questionsTableArea"><div class="loading">Loading questions...</div></div>';

    document.getElementById('qRefreshBtn').onclick = _loadQuestions;
    document.getElementById('qGenerateBtn').onclick = _showGenerateModal;
    document.getElementById('qAddBtn').onclick = function() { _showEditModal(); };
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
        { key: 'topic', label: 'Topic' },
        {
          key: 'question', label: 'Question',
          render: function (val, row) {
            var txt = val || row.text || '';
            return txt.length > 50 ? txt.substring(0, 50) + '…' : txt;
          }
        },
        { key: 'difficulty', label: 'Difficulty' },
        {
          key: 'status', label: 'Status',
          render: function (val, row) {
            var badges = '';
            if (val === 'active') badges += '<span class="badge badge-active">Active</span>';
            else if (val === 'draft') badges += '<span class="badge badge-draft">Draft</span>';
            else badges += '<span class="badge badge-archived">' + (val || 'draft') + '</span>';
            
            if (row.premiumOnly) {
              badges += ' <span class="badge badge-premium-plus" style="margin-left:4px;">Premium</span>';
            }
            return badges;
          }
        }
      ];

      area.innerHTML = '';
      area.appendChild(Table.build(columns, questions));
    } catch (e) {
      area.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⚠️</div><div class="empty-state-text">Error: ' + e.message + '</div></div>';
    }
  }

  function _showGenerateModal() {
    var body = document.createElement('div');
    body.innerHTML =
      '<p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:1rem;">Select a topic and difficulty to generate a new question using OpenAI.</p>' +
      '<div class="modal-field"><label class="modal-label">Topic</label>' +
        '<select class="modal-select" id="aiTopic">' +
          '<option value="profit-loss">Profit &amp; Loss</option>' +
          '<option value="percentages">Percentages</option>' +
          '<option value="ratios">Ratios</option>' +
          '<option value="averages">Averages</option>' +
          '<option value="time-speed-distance">Time Speed Distance</option>' +
          '<option value="time-and-work">Time &amp; Work</option>' +
          '<option value="fractions">Fractions</option>' +
          '<option value="multiplication">Multiplication</option>' +
        '</select></div>' +
      '<div class="modal-field"><label class="modal-label">Difficulty</label>' +
        '<select class="modal-select" id="aiDifficulty">' +
          '<option value="easy">Easy</option>' +
          '<option value="medium" selected>Medium</option>' +
          '<option value="hard">Hard</option>' +
        '</select></div>';

    Modal.show({
      title: '✨ AI Generate Question',
      body: body,
      actions: [
        { label: 'Cancel' },
        { label: 'Generate', accent: true, onClick: _handleGenerate, autoClose: false }
      ]
    });
  }

  async function _handleGenerate() {
    var topic = document.getElementById('aiTopic').value;
    var difficulty = document.getElementById('aiDifficulty').value;
    
    Toast.success('Generating question...', 2000);
    var btn = document.querySelector('.modal-actions .accent');
    if(btn) { btn.disabled = true; btn.textContent = 'Generating...'; }

    try {
      var res = await API.generateQuestion(topic, difficulty);
      Modal.close();
      // Show edit modal pre-filled with AI generated content
      _showEditModal({
        topic: topic,
        difficulty: difficulty,
        question: res.question,
        options: res.options || [],
        answer: res.answer,
        explanation: res.explanation
      });
    } catch (e) {
      if(btn) { btn.disabled = false; btn.textContent = 'Generate'; }
      Toast.error('Failed to generate: ' + e.message);
    }
  }

  function _showEditModal(data) {
    data = data || {};
    var optsStr = data.options ? data.options.join(', ') : '';

    var body = document.createElement('div');
    body.innerHTML =
      '<div style="display:flex; gap:1rem;">' +
        '<div class="modal-field" style="flex:1;"><label class="modal-label">Topic</label>' +
          '<input type="text" class="modal-input" id="mqTopic" value="' + (data.topic || '') + '" placeholder="e.g. profit-loss" /></div>' +
        '<div class="modal-field" style="flex:1;"><label class="modal-label">Difficulty</label>' +
          '<select class="modal-select" id="mqDifficulty">' +
            '<option value="easy" ' + (data.difficulty==='easy'?'selected':'') + '>Easy</option>' +
            '<option value="medium" ' + (data.difficulty==='medium'||!data.difficulty?'selected':'') + '>Medium</option>' +
            '<option value="hard" ' + (data.difficulty==='hard'?'selected':'') + '>Hard</option>' +
          '</select></div>' +
      '</div>' +
      '<div class="modal-field"><label class="modal-label">Question Text</label>' +
        '<textarea class="modal-input" id="mqQuestion" rows="3">' + (data.question || '') + '</textarea></div>' +
      '<div class="modal-field"><label class="modal-label">Options (comma separated numbers)</label>' +
        '<input type="text" class="modal-input" id="mqOptions" value="' + optsStr + '" placeholder="e.g. 10, 20, 30, 40" /></div>' +
      '<div style="display:flex; gap:1rem;">' +
        '<div class="modal-field" style="flex:1;"><label class="modal-label">Correct Answer (Number)</label>' +
          '<input type="number" class="modal-input" id="mqAnswer" value="' + (data.answer !== undefined ? data.answer : '') + '" /></div>' +
        '<div class="modal-field" style="flex:1;"><label class="modal-label">Status</label>' +
          '<select class="modal-select" id="mqStatus">' +
            '<option value="draft" ' + (data.status==='draft'||!data.status?'selected':'') + '>Draft</option>' +
            '<option value="active" ' + (data.status==='active'?'selected':'') + '>Active</option>' +
          '</select></div>' +
      '</div>' +
      '<div class="modal-field"><label class="modal-label">Explanation</label>' +
        '<textarea class="modal-input" id="mqExplanation" rows="4">' + (data.explanation || '') + '</textarea></div>' +
      '<div class="modal-field" style="display:flex; align-items:center; gap:0.5rem; margin-top:0.5rem;">' +
        '<input type="checkbox" id="mqPremium" ' + (data.premiumOnly?'checked':'') + ' /> <label for="mqPremium" class="modal-label" style="margin:0;">Premium Only</label>' +
      '</div>';

    Modal.show({
      title: 'Question Details',
      body: body,
      actions: [
        { label: 'Cancel' },
        { label: 'Save Question', accent: true, onClick: _saveQuestion, autoClose: false }
      ]
    });
  }

  async function _saveQuestion() {
    var topic = document.getElementById('mqTopic').value.trim();
    var difficulty = document.getElementById('mqDifficulty').value;
    var question = document.getElementById('mqQuestion').value.trim();
    var answerStr = document.getElementById('mqAnswer').value.trim();
    var explanation = document.getElementById('mqExplanation').value.trim();
    var status = document.getElementById('mqStatus').value;
    var premiumOnly = document.getElementById('mqPremium').checked;
    
    var optionsStr = document.getElementById('mqOptions').value.trim();
    var options = [];
    if (optionsStr) {
      options = optionsStr.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
    }

    if (!topic || !question || !answerStr) {
      Toast.error('Topic, question, and answer are required.');
      return;
    }

    var answer = Number(answerStr);

    var payload = {
      type: 'word_problem',
      topic: topic,
      difficulty: difficulty,
      question: question,
      options: options,
      answer: answer,
      explanation: explanation,
      approved: status === 'active',
      status: status,
      premiumOnly: premiumOnly
    };

    try {
      await API.saveQuestion(payload);
      Toast.success('Question saved successfully');
      Modal.close();
      _loadQuestions();
    } catch (e) {
      Toast.error('Failed to save: ' + e.message);
    }
  }

  return { render: render };
})();
