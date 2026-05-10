/**
 * questions.js - Question Bank CRUD
 */
const QuestionsView = (function() {
  
  async function render() {
    const container = document.getElementById('view-questions');
    container.innerHTML = `
      <div class="view-header" style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h2>Question Bank</h2>
          <p class="secondary-text">Manage AI Word Problems</p>
        </div>
        <div>
          <button class="btn action-btn" id="refreshQuestionsBtn">Refresh</button>
          <button class="btn accent" id="addQuestionBtn">Add Question</button>
        </div>
      </div>
      <div id="questionsTableContainer">Loading questions...</div>
    `;

    document.getElementById('refreshQuestionsBtn').onclick = loadData;
    document.getElementById('addQuestionBtn').onclick = showAddModal;
    loadData();
  }

  async function loadData() {
    const tableContainer = document.getElementById('questionsTableContainer');
    try {
      tableContainer.innerHTML = 'Loading questions...';
      const data = await API.getQuestions();
      
      const columns = [
        { label: 'Category', key: 'category' },
        { label: 'Question', key: 'text' },
        { label: 'Difficulty', key: 'difficulty' }
      ];

      const actionsRenderer = (row) => {
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.textContent = 'Edit';
        btn.onclick = () => alert('Edit question ID: ' + row.id);
        return btn;
      };

      const tableEl = TableBuilder.createTable(columns, data.questions, actionsRenderer);
      tableContainer.innerHTML = '';
      tableContainer.appendChild(tableEl);

    } catch (e) {
      console.error(e);
      tableContainer.innerHTML = `<p style="color:var(--danger-color)">Error loading questions: ${e.message}</p>`;
    }
  }

  function showAddModal() {
    ModalBuilder.showModal({
      title: 'Add New Question',
      content: `
        <div style="display:flex; flex-direction:column; gap:1rem;">
          <input type="text" class="login-input" placeholder="Category (e.g. percentages)" />
          <textarea class="login-input" placeholder="Question Text" rows="3"></textarea>
          <input type="text" class="login-input" placeholder="Correct Answer" />
        </div>
      `,
      actions: [
        { label: 'Cancel' },
        { label: 'Save Draft', primary: true, onClick: () => alert('Not implemented locally yet') }
      ]
    });
  }

  return { render };
})();
