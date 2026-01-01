/**
 * Items List View
 * Displays a list of items with CRUD actions.
 */

import { h, empty, announce } from '../../lib/dom.js';
import { get, del } from '../../lib/api.js';
import { success, error } from '../../lib/toast.js';
import { confirmDelete } from '../../lib/dialogs.js';
import { pageHeader, dataTable, loading, emptyState } from '../../lib/components.js';
import { navigate } from '../../lib/router.js';

/**
 * Render the items list view
 * @param {HTMLElement} container
 * @returns {Function} Cleanup function
 */
export async function renderItemList(container) {
  // Show loading state
  empty(container);
  container.appendChild(loading('Loading items...'));

  // Fetch items
  const response = await get('/api/items');

  if (!response.ok) {
    empty(container);
    container.appendChild(
      emptyState({
        icon: 'exclamation-triangle',
        title: 'Failed to load items',
        description: response.data?.error || 'An error occurred while loading items.',
        action: h('sl-button', {
          variant: 'primary',
          onclick: () => renderItemList(container),
        }, ['Try Again']),
      })
    );
    return;
  }

  const items = response.data || [];

  // Render view
  render(container, items);

  // Cleanup function
  return () => {
    // Nothing to clean up
  };
}

/**
 * Render the list UI
 */
function render(container, items) {
  empty(container);

  // Page header
  const header = pageHeader({
    title: 'Items',
    subtitle: `${items.length} item${items.length !== 1 ? 's' : ''}`,
    actions: [
      h('sl-button', {
        variant: 'primary',
        onclick: () => navigate('/items/new'),
      }, [
        h('sl-icon', { slot: 'prefix', name: 'plus' }),
        'New Item',
      ]),
    ],
  });

  container.appendChild(header);

  // Table or empty state
  if (items.length === 0) {
    container.appendChild(
      emptyState({
        icon: 'inbox',
        title: 'No items yet',
        description: 'Get started by creating your first item.',
        action: h('sl-button', {
          variant: 'primary',
          onclick: () => navigate('/items/new'),
        }, ['Create Item']),
      })
    );
  } else {
    const table = dataTable({
      columns: [
        { key: 'name', label: 'Name' },
        { key: 'description', label: 'Description' },
        { key: 'updatedAt', label: 'Updated', width: '150px' },
      ],
      data: items,
      renderCell: (row, col) => {
        if (col.key === 'updatedAt') {
          return formatDate(row.updatedAt);
        }
        if (col.key === 'description') {
          return row.description || h('span', { class: 'text-muted' }, ['—']);
        }
        return row[col.key];
      },
      renderActions: (row) => [
        h('sl-icon-button', {
          name: 'pencil',
          label: 'Edit',
          onclick: () => navigate(`/items/${row.id}/edit`),
        }),
        h('sl-icon-button', {
          name: 'trash',
          label: 'Delete',
          onclick: () => handleDelete(container, items, row),
        }),
      ],
    });

    container.appendChild(table);
  }
}

/**
 * Handle item deletion
 */
async function handleDelete(container, items, item) {
  const confirmed = await confirmDelete(item.name);

  if (!confirmed) {
    return;
  }

  const response = await del(`/api/items/${item.id}`);

  if (response.ok) {
    success(`"${item.name}" deleted`);
    announce(`${item.name} deleted`);

    // Remove from list and re-render
    const newItems = items.filter((i) => i.id !== item.id);
    render(container, newItems);
  } else {
    error(response.data?.error || 'Failed to delete item');
  }
}

/**
 * Format a date string
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
