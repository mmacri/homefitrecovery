/**
 * Tags and Categories Management JavaScript
 */

// Storage keys
const TAGS_STORAGE_KEY = 'recoveryEssentials_tags';
const CATEGORIES_STORAGE_KEY = 'recoveryEssentials_categories';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initializeTabNavigation();
    initializeTagsSystem();
    initializeCategoriesSystem();

    // Check authentication
    checkAuth();
});

/**
 * Tab Navigation
 */
function initializeTabNavigation() {
    const tagsTab = document.getElementById('tags-tab');
    const categoriesTab = document.getElementById('categories-tab');
    const tagsSection = document.getElementById('tags-section');
    const categoriesSection = document.getElementById('categories-section');

    // Tab click handlers
    if (tagsTab && categoriesTab && tagsSection && categoriesSection) {
        tagsTab.addEventListener('click', function() {
            // Update active tab
            tagsTab.classList.add('border-indigo-500', 'text-indigo-600');
            tagsTab.classList.remove('border-transparent', 'text-gray-500');
            categoriesTab.classList.add('border-transparent', 'text-gray-500');
            categoriesTab.classList.remove('border-indigo-500', 'text-indigo-600');

            // Show/hide sections
            tagsSection.classList.remove('hidden');
            tagsSection.classList.add('block');
            categoriesSection.classList.add('hidden');
            categoriesSection.classList.remove('block');
        });

        categoriesTab.addEventListener('click', function() {
            // Update active tab
            categoriesTab.classList.add('border-indigo-500', 'text-indigo-600');
            categoriesTab.classList.remove('border-transparent', 'text-gray-500');
            tagsTab.classList.add('border-transparent', 'text-gray-500');
            tagsTab.classList.remove('border-indigo-500', 'text-indigo-600');

            // Show/hide sections
            categoriesSection.classList.remove('hidden');
            categoriesSection.classList.add('block');
            tagsSection.classList.add('hidden');
            tagsSection.classList.remove('block');
        });
    }

    // Mobile sidebar toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.toggle('hidden');
            }
        });
    }
}

/**
 * Check authentication status
 */
function checkAuth() {
    // Reference to existing auth.js functionality
    if (typeof isAuthenticated === 'function') {
        if (!isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }

        // Set username if authenticated
        const userName = document.getElementById('user-name');
        if (userName) {
            const user = getCurrentUser();
            if (user && user.name) {
                userName.textContent = user.name;
            }
        }
    }
}

/**
 * Utility functions
 */

// Generate a unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Generate a URL-friendly slug from a string
function generateSlug(str) {
    return str
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove non-word chars
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Show a notification message
function showNotification(message, type = 'info') {
    // Could implement a toast notification system here
    // For now, just use alert
    alert(message);
}

/**
 * Modal management functions
 */

// Close delete confirmation modal
function closeDeleteModal() {
    const modal = document.getElementById('delete-confirmation-modal');
    if (modal) modal.classList.add('hidden');
}

// Confirm delete action
function confirmDelete() {
    const confirmBtn = document.getElementById('confirm-delete-btn');
    const deleteType = confirmBtn.getAttribute('data-delete-type');
    const deleteId = confirmBtn.getAttribute('data-delete-id');

    if (deleteType === 'tag') {
        deleteTag(deleteId);
    } else if (deleteType === 'category') {
        deleteCategory(deleteId);
    }

    // Close modal
    closeDeleteModal();
}

/**
 * Tags System
 */
function initializeTagsSystem() {
    // Load existing tags
    loadTags();

    // Set up form submission
    setupTagForm();

    // Set up search functionality
    setupTagSearch();

    // Set up modal events
    setupTagModals();
}

/**
 * Load tags from storage
 */
function loadTags() {
    const tagsList = document.getElementById('tags-list');
    const noTagsMessage = document.getElementById('no-tags-message');
    const tagRelatedSelect = document.getElementById('tag-related');
    const editTagRelatedSelect = document.getElementById('edit-tag-related');

    // Clear existing content
    if (tagsList) tagsList.innerHTML = '';
    if (tagRelatedSelect) tagRelatedSelect.innerHTML = '';
    if (editTagRelatedSelect) editTagRelatedSelect.innerHTML = '';

    // Get tags from localStorage
    const tags = getTags();

    // Populate the related tags dropdowns
    tags.forEach(tag => {
        if (tagRelatedSelect || editTagRelatedSelect) {
            const option = document.createElement('option');
            option.value = tag.id;
            option.textContent = tag.name;

            if (tagRelatedSelect) {
                const optionClone = option.cloneNode(true);
                tagRelatedSelect.appendChild(optionClone);
            }

            if (editTagRelatedSelect) {
                const optionClone = option.cloneNode(true);
                editTagRelatedSelect.appendChild(optionClone);
            }
        }
    });

    // Display tags or empty state
    if (tags.length === 0) {
        if (noTagsMessage) noTagsMessage.classList.remove('hidden');
        return;
    } else {
        if (noTagsMessage) noTagsMessage.classList.add('hidden');
    }

    // Add tags to the table
    if (tagsList) {
        tags.forEach(tag => {
            const row = document.createElement('tr');

            // Tag info
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${tag.name}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">${tag.slug}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        ${tag.count || 0}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button data-tag-id="${tag.id}" class="edit-tag-btn text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                    <button data-tag-id="${tag.id}" class="delete-tag-btn text-red-600 hover:text-red-900">Delete</button>
                </td>
            `;

            tagsList.appendChild(row);
        });

        // Add event listeners for edit and delete buttons
        document.querySelectorAll('.edit-tag-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const tagId = this.getAttribute('data-tag-id');
                openEditTagModal(tagId);
            });
        });

        document.querySelectorAll('.delete-tag-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const tagId = this.getAttribute('data-tag-id');
                openDeleteTagModal(tagId);
            });
        });
    }
}

/**
 * Get tags from localStorage
 */
function getTags() {
    const storedTags = localStorage.getItem(TAGS_STORAGE_KEY);
    return storedTags ? JSON.parse(storedTags) : [];
}

/**
 * Save tags to localStorage
 */
function saveTags(tags) {
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
}

/**
 * Set up tag form submission
 */
function setupTagForm() {
    const addTagForm = document.getElementById('add-tag-form');
    const tagNameInput = document.getElementById('tag-name');
    const tagSlugInput = document.getElementById('tag-slug');

    // Auto-generate slug from name
    if (tagNameInput && tagSlugInput) {
        tagNameInput.addEventListener('input', function() {
            tagSlugInput.value = generateSlug(this.value);
        });
    }

    // Handle form submission
    if (addTagForm) {
        addTagForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('tag-name').value;
            const slug = document.getElementById('tag-slug').value;
            const description = document.getElementById('tag-description').value;

            // Get selected related tags
            const relatedSelect = document.getElementById('tag-related');
            let relatedTags = [];
            if (relatedSelect) {
                relatedTags = Array.from(relatedSelect.selectedOptions).map(option => option.value);
            }

            addTag(name, slug, description, relatedTags);

            // Reset form
            this.reset();
        });
    }
}

/**
 * Add a new tag
 */
function addTag(name, slug, description, relatedTags) {
    // Get existing tags
    const tags = getTags();

    // Check for duplicate slug
    if (tags.some(tag => tag.slug === slug)) {
        alert('A tag with this slug already exists. Please use a different slug.');
        return;
    }

    // Create new tag
    const newTag = {
        id: generateId(),
        name,
        slug,
        description,
        related: relatedTags || [],
        count: 0,
        created: new Date().toISOString()
    };

    // Add to array and save
    tags.push(newTag);
    saveTags(tags);

    // Reload tags display
    loadTags();

    // Show success message
    showNotification('Tag added successfully', 'success');
}

/**
 * Set up tag search functionality
 */
function setupTagSearch() {
    const tagSearch = document.getElementById('tag-search');
    if (tagSearch) {
        tagSearch.addEventListener('input', function() {
            filterTags(this.value);
        });
    }
}

/**
 * Filter tags based on search input
 */
function filterTags(query) {
    const rows = document.querySelectorAll('#tags-list tr');
    const noTagsMessage = document.getElementById('no-tags-message');
    let matchCount = 0;

    query = query.toLowerCase();

    rows.forEach(row => {
        const name = row.querySelector('td:first-child').textContent.toLowerCase();
        const slug = row.querySelector('td:nth-child(2)').textContent.toLowerCase();

        if (name.includes(query) || slug.includes(query)) {
            row.classList.remove('hidden');
            matchCount++;
        } else {
            row.classList.add('hidden');
        }
    });

    // Show/hide empty state message
    if (matchCount === 0) {
        if (noTagsMessage) noTagsMessage.classList.remove('hidden');
    } else {
        if (noTagsMessage) noTagsMessage.classList.add('hidden');
    }
}

/**
 * Set up tag modals
 */
function setupTagModals() {
    // Close edit tag modal
    const closeTagModalBtn = document.getElementById('close-tag-modal-btn');
    if (closeTagModalBtn) {
        closeTagModalBtn.addEventListener('click', closeEditTagModal);
    }

    // Update tag button
    const updateTagBtn = document.getElementById('update-tag-btn');
    if (updateTagBtn) {
        updateTagBtn.addEventListener('click', updateTag);
    }
}

/**
 * Open the edit tag modal
 */
function openEditTagModal(tagId) {
    const tags = getTags();
    const tag = tags.find(t => t.id === tagId);

    if (!tag) return;

    // Set form values
    document.getElementById('edit-tag-id').value = tag.id;
    document.getElementById('edit-tag-name').value = tag.name;
    document.getElementById('edit-tag-slug').value = tag.slug;
    document.getElementById('edit-tag-description').value = tag.description || '';

    // Set related tags
    const relatedSelect = document.getElementById('edit-tag-related');
    if (relatedSelect) {
        Array.from(relatedSelect.options).forEach(option => {
            option.selected = tag.related && tag.related.includes(option.value);
        });
    }

    // Show modal
    const modal = document.getElementById('edit-tag-modal');
    if (modal) modal.classList.remove('hidden');
}

/**
 * Close the edit tag modal
 */
function closeEditTagModal() {
    const modal = document.getElementById('edit-tag-modal');
    if (modal) modal.classList.add('hidden');
}

/**
 * Update a tag
 */
function updateTag() {
    const tagId = document.getElementById('edit-tag-id').value;
    const name = document.getElementById('edit-tag-name').value;
    const slug = document.getElementById('edit-tag-slug').value;
    const description = document.getElementById('edit-tag-description').value;

    // Get selected related tags
    const relatedSelect = document.getElementById('edit-tag-related');
    let relatedTags = [];
    if (relatedSelect) {
        relatedTags = Array.from(relatedSelect.selectedOptions).map(option => option.value);
    }

    // Get tags
    const tags = getTags();

    // Check for duplicate slug with other tags
    if (tags.some(tag => tag.slug === slug && tag.id !== tagId)) {
        alert('Another tag with this slug already exists. Please use a different slug.');
        return;
    }

    // Update tag
    const tagIndex = tags.findIndex(t => t.id === tagId);
    if (tagIndex !== -1) {
        tags[tagIndex] = {
            ...tags[tagIndex],
            name,
            slug,
            description,
            related: relatedTags,
            updated: new Date().toISOString()
        };

        // Save and reload
        saveTags(tags);
        loadTags();

        // Close modal
        closeEditTagModal();

        // Show success message
        showNotification('Tag updated successfully', 'success');
    }
}

/**
 * Open delete confirmation modal for a tag
 */
function openDeleteTagModal(tagId) {
    const tags = getTags();
    const tag = tags.find(t => t.id === tagId);

    if (!tag) return;

    // Set delete information
    document.getElementById('delete-title').textContent = 'Delete Tag';
    document.getElementById('delete-message').textContent = `Are you sure you want to delete the tag "${tag.name}"? This action cannot be undone.`;

    // Set data attribute for item to delete
    const confirmBtn = document.getElementById('confirm-delete-btn');
    confirmBtn.setAttribute('data-delete-type', 'tag');
    confirmBtn.setAttribute('data-delete-id', tagId);

    // Show modal
    const modal = document.getElementById('delete-confirmation-modal');
    if (modal) modal.classList.remove('hidden');
}

/**
 * Delete a tag
 */
function deleteTag(tagId) {
    // Get tags
    let tags = getTags();

    // Filter out the deleted tag
    tags = tags.filter(tag => tag.id !== tagId);

    // Save and reload
    saveTags(tags);
    loadTags();

    // Show success message
    showNotification('Tag deleted successfully', 'success');
}

/**
 * Categories System
 */
function initializeCategoriesSystem() {
    // Load existing categories
    loadCategories();

    // Set up form submission
    setupCategoryForm();

    // Set up search functionality
    setupCategorySearch();

    // Set up modal events
    setupCategoryModals();
}
