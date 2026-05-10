/**
 * table-builder.js - Reusable data table component
 */
const TableBuilder = (function() {
  
  function createTable(columns, data, actionsRenderer = null) {
    const container = document.createElement('div');
    container.className = 'table-container';

    const table = document.createElement('table');
    table.className = 'data-table';

    // Header
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    columns.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.label;
      trHead.appendChild(th);
    });
    if (actionsRenderer) {
      const th = document.createElement('th');
      th.textContent = 'Actions';
      trHead.appendChild(th);
    }
    thead.appendChild(trHead);
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');
    
    if (!data || data.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = columns.length + (actionsRenderer ? 1 : 0);
      td.textContent = 'No data available';
      td.style.textAlign = 'center';
      td.style.color = 'var(--text-secondary)';
      tr.appendChild(td);
      tbody.appendChild(tr);
    } else {
      data.forEach(row => {
        const tr = document.createElement('tr');
        columns.forEach(col => {
          const td = document.createElement('td');
          if (col.render) {
            td.innerHTML = col.render(row[col.key], row);
          } else {
            td.textContent = row[col.key] || '-';
          }
          tr.appendChild(td);
        });

        if (actionsRenderer) {
          const td = document.createElement('td');
          td.appendChild(actionsRenderer(row));
          tr.appendChild(td);
        }

        tbody.appendChild(tr);
      });
    }

    table.appendChild(tbody);
    container.appendChild(table);
    
    return container;
  }

  return { createTable };
})();
