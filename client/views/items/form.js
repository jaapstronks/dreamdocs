/**
 * Item Form View
 * Create or edit an item.
 */

import { h, empty, $ } from '../../lib/dom.js';
import { get, post, put } from '../../lib/api.js';
import { success, error } from '../../lib/toast.js';
import { pageHeader, formGroup, formActions, loading, emptyState } from '../../lib/components.js';
import { navigate } from '../../lib/router.js';

/**
 * Render the item form view
 * @param {HTMLElement} container
 * @param {string} [itemId] - Item ID for editing, undefined for new
 * @returns {Function} Cleanup function
 */
export async function renderItemForm(container, itemId) {
  const isEditing = !!itemId;

  // Show loading state when editing
  if (isEditing) {
    empty(container);
    container.appendChild(loading('Loading item...'));

    const response = await get(`/api/items/${itemId}`);

    if (!response.ok) {
      empty(container);
      container.appendChild(
        emptyState({
          icon: 'exclamation-triangle',
          title: 'Item not found',
          description: 'The item you are looking for does not exist or has been deleted.',
          action: h('sl-button', {
            variant: 'primary',
            onclick: () => navigate('/'),
          }, ['Back to Items']),
        })
      );
      return;
    }

    render(container, response.data, isEditing);
  } else {
    render(container, { name: '', description: '' }, isEditing);
  }

  return () => {
    // Cleanup
  };
}

/**
 * Render the form UI
 */
function render(container, item, isEditing) {
  empty(container);

  // Form state
  const state = {
    name: item.name || '',
    description: item.description || '',
    errors: {},
    isSubmitting: false,
  };

  // Create form elements
  const nameInput = document.createElement('sl-input');
  nameInput.value = state.name;
  nameInput.placeholder = 'Enter item name';
  nameInput.required = true;
  nameInput.addEventListener('sl-input', (e) => {
    state.name = e.target.value;
    clearError('name');
  });

  const descInput = document.createElement('sl-textarea');
  descInput.value = state.description;
  descInput.placeholder = 'Optional description';
  descInput.rows = 3;
  descInput.addEventListener('sl-input', (e) => {
    state.description = e.target.value;
  });

  const submitBtn = document.createElement('sl-button');
  submitBtn.variant = 'primary';
  submitBtn.type = 'submit';
  submitBtn.textContent = isEditing ? 'Save Changes' : 'Create Item';

  const cancelBtn = document.createElement('sl-button');
  cancelBtn.variant = 'default';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', () => navigate('/'));

  // Form groups with error display
  const nameGroup = formGroup({
    label: 'Name',
    id: 'item-name',
    required: true,
    input: nameInput,
  });

  const descGroup = formGroup({
    label: 'Description',
    id: 'item-description',
    help: 'A brief description of this item (optional)',
    input: descInput,
  });

  const actions = formActions({
    buttons: [cancelBtn, submitBtn],
    align: 'end',
  });

  // Build form
  const form = h('form', {
    class: 'max-w-form',
    onsubmit: (e) => handleSubmit(e, state, item, isEditing, submitBtn, nameGroup),
  }, [
    nameGroup,
    descGroup,
    actions,
  ]);

  // Page header
  const header = pageHeader({
    title: isEditing ? 'Edit Item' : 'New Item',
    subtitle: isEditing ? `Editing "${item.name}"` : 'Create a new item',
  });

  container.appendChild(header);
  container.appendChild(form);

  // Focus the name input
  requestAnimationFrame(() => {
    nameInput.focus();
  });

  // Helper to clear error
  function clearError(field) {
    const group = field === 'name' ? nameGroup : null;
    if (group) {
      group.classList.remove('is-invalid');
      const errorEl = group.querySelector('.vk-form-error');
      if (errorEl) errorEl.remove();
    }
  }
}

/**
 * Handle form submission
 */
async function handleSubmit(e, state, item, isEditing, submitBtn, nameGroup) {
  e.preventDefault();

  // Validate
  if (!state.name.trim()) {
    showError(nameGroup, 'Name is required');
    return;
  }

  // Submit
  submitBtn.loading = true;

  const data = {
    name: state.name.trim(),
    description: state.description.trim(),
  };

  let response;
  if (isEditing) {
    response = await put(`/api/items/${item.id}`, data);
  } else {
    response = await post('/api/items', data);
  }

  submitBtn.loading = false;

  if (response.ok) {
    success(isEditing ? 'Item updated' : 'Item created');
    navigate('/');
  } else {
    error(response.data?.error || 'Failed to save item');
  }
}

/**
 * Show field error
 */
function showError(group, message) {
  group.classList.add('is-invalid');

  // Remove existing error
  const existing = group.querySelector('.vk-form-error');
  if (existing) existing.remove();

  // Add new error
  const errorEl = h('p', { class: 'vk-form-error', role: 'alert' }, [message]);
  group.appendChild(errorEl);

  // Focus the input
  const input = group.querySelector('sl-input, sl-textarea, sl-select');
  if (input) input.focus();
}
