/**
 * modal-builder.js - Reusable modal component
 */
const ModalBuilder = (function() {
  
  function showModal({ title, content, actions = [] }) {
    // Remove existing modal if any
    const existing = document.getElementById('admin-dynamic-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'admin-dynamic-modal';
    overlay.className = 'loading-overlay'; // Reusing the dark transparent background
    overlay.style.display = 'flex';
    overlay.style.zIndex = '1000';

    const modal = document.createElement('div');
    modal.className = 'card';
    modal.style.width = '100%';
    modal.style.maxWidth = '500px';
    modal.style.margin = '1rem';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '1.5rem';

    const h3 = document.createElement('h3');
    h3.textContent = title;
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.fontSize = '1.25rem';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => overlay.remove();

    header.appendChild(h3);
    header.appendChild(closeBtn);
    modal.appendChild(header);

    const body = document.createElement('div');
    if (typeof content === 'string') {
      body.innerHTML = content;
    } else {
      body.appendChild(content);
    }
    modal.appendChild(body);

    if (actions.length > 0) {
      const footer = document.createElement('div');
      footer.style.display = 'flex';
      footer.style.justifyContent = 'flex-end';
      footer.style.gap = '1rem';
      footer.style.marginTop = '2rem';

      actions.forEach(action => {
        const btn = document.createElement('button');
        btn.className = action.primary ? 'btn accent' : 'btn action-btn';
        btn.textContent = action.label;
        btn.onclick = () => {
          if (action.onClick) action.onClick();
          if (action.closeOnClick !== false) overlay.remove();
        };
        footer.appendChild(btn);
      });
      modal.appendChild(footer);
    }

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  return { showModal };
})();
