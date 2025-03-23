/**
 * Recovery Essentials Admin - Navigation Management
 * This script handles the navigation management in the admin dashboard
 */

// Navigation data storage
let navigationItems = [];

// Storage key for localStorage
const NAVIGATION_KEY = 'recoveryEssentials_navigation';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on the navigation section
    if (document.getElementById('navigation-section')) {
        loadNavigationItems();
        bindNavigationEvents();
        updateNavigationTable();
        populateParentDropdown();
    }
});

/**
 * Load navigation items from localStorage
 */
function loadNavigationItems() {
    const storedItems = localStorage.getItem(NAVIGATION_KEY);
    if (storedItems) {
        navigationItems = JSON.parse(storedItems);
    } else {
        // Load demo navigation if no stored items
        navigationItems = getDemoNavigationItems();
        saveNavigationItems();
    }
}

/**
 * Save navigation items to localStorage
 */
function saveNavigationItems() {
    localStorage.setItem(NAVIGATION_KEY, JSON.stringify(navigationItems));
}

/**
 * Set up event listeners for navigation management
 */
function bindNavigationEvents() {
    // Form submission
    const navForm = document.getElementById('navigation-form');
    if (navForm) {
        navForm.addEventListener('submit', handleNavigationFormSubmit);
    }

    // Cancel button
    const cancelBtn = document.getElementById('nav-cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            resetNavigationForm();
        });
    }

    // Preview button
    const previewBtn = document.getElementById('nav-preview-btn');
    if (previewBtn) {
        previewBtn.addEventListener('click', function(e) {
            e.preventDefault();
            previewNavigation();
        });
    }

    // Apply changes button
    const applyBtn = document.getElementById('nav-apply-btn');
    if (applyBtn) {
        applyBtn.addEventListener('click', function(e) {
            e.preventDefault();
            saveNavigationToFrontend();
        });
    }

    // Slug generator
    const labelField = document.getElementById('nav-label');
    const slugField = document.getElementById('nav-slug');
    if (labelField && slugField) {
        labelField.addEventListener('blur', function() {
            if (slugField.value === '') {
                slugField.value = createSlug(labelField.value);
            }
        });
    }
}

/**
 * Handle navigation form submission
 * @param {Event} e - Form submit event
 */
function handleNavigationFormSubmit(e) {
    e.preventDefault();

    // Get form values
    const itemId = document.getElementById('nav-id').value;
    const label = document.getElementById('nav-label').value;
    const slug = document.getElementById('nav-slug').value || createSlug(label);
    const url = document.getElementById('nav-url').value;
    const parent = document.getElementById('nav-parent').value;
    const order = parseInt(document.getElementById('nav-order').value, 10) || 1;
    const isMainNav = document.getElementById('nav-main').checked;
    const cssClass = document.getElementById('nav-css-class').value;

    // Validate form
    if (!label) {
        showNotification('Label is required', 'error');
        return;
    }

    if (!url) {
        showNotification('URL is required', 'error');
        return;
    }

    // Create navigation item object
    const navigationItem = {
        id: itemId || `nav${Date.now()}`,
        label,
        slug,
        url,
        parent: parent || null,
        isMainNav,
        order,
        cssClass
    };

    // Add or update navigation item
    if (itemId) {
        // Update existing item
        const index = navigationItems.findIndex(item => item.id === itemId);
        if (index !== -1) {
            navigationItems[index] = navigationItem;
            showNotification('Navigation item updated successfully', 'success');
        }
    } else {
        // Add new item
        navigationItems.push(navigationItem);
        showNotification('Navigation item added successfully', 'success');
    }

    // Save items and update UI
    saveNavigationItems();
    updateNavigationTable();
    populateParentDropdown();
    resetNavigationForm();
}

/**
 * Update the navigation items table
 */
function updateNavigationTable() {
    const tableBody = document.getElementById('navigation-table-body');
    if (!tableBody) return;

    // Clear the table
    tableBody.innerHTML = '';

    // Sort items by parent and order
    const topLevelItems = navigationItems.filter(item => !item.parent).sort((a, b) => a.order - b.order);

    // First, add top-level items
    topLevelItems.forEach(item => {
        const row = createNavigationTableRow(item, 0);
        tableBody.appendChild(row);

        // Add child items
        addChildItems(item.id, 1, tableBody);
    });

    // Update preview if visible
    if (document.getElementById('navigation-preview').style.display !== 'none') {
        previewNavigation();
    }
}

/**
 * Recursively add child items to the table
 * @param {string} parentId - Parent item ID
 * @param {number} level - Nesting level
 * @param {HTMLElement} tableBody - Table body element
 */
function addChildItems(parentId, level, tableBody) {
    const children = navigationItems
        .filter(item => item.parent === parentId)
        .sort((a, b) => a.order - b.order);

    children.forEach(item => {
        const row = createNavigationTableRow(item, level);
        tableBody.appendChild(row);

        // Recursively add grandchildren
        addChildItems(item.id, level + 1, tableBody);
    });
}

/**
 * Create a table row for a navigation item
 * @param {Object} item - Navigation item
 * @param {number} level - Nesting level
 * @returns {HTMLElement} Table row element
 */
function createNavigationTableRow(item, level) {
    const row = document.createElement('tr');
    row.className = level > 0 ? 'child-row' : '';

    // Label cell with indentation
    const labelCell = document.createElement('td');
    labelCell.className = 'px-4 py-2';
    const indentation = '— '.repeat(level);
    labelCell.textContent = level > 0 ? indentation + item.label : item.label;

    // URL cell
    const urlCell = document.createElement('td');
    urlCell.className = 'px-4 py-2 hidden md:table-cell';
    urlCell.textContent = item.url;

    // Parent cell
    const parentCell = document.createElement('td');
    parentCell.className = 'px-4 py-2 hidden md:table-cell';
    if (item.parent) {
        const parentItem = navigationItems.find(nav => nav.id === item.parent);
        parentCell.textContent = parentItem ? parentItem.label : '';
    } else {
        parentCell.textContent = '-';
    }

    // Order cell
    const orderCell = document.createElement('td');
    orderCell.className = 'px-4 py-2 hidden md:table-cell';
    orderCell.textContent = item.order;

    // Visibility cell
    const visibilityCell = document.createElement('td');
    visibilityCell.className = 'px-4 py-2 hidden md:table-cell';
    visibilityCell.textContent = item.isMainNav ? 'Visible' : 'Hidden';

    // Actions cell
    const actionsCell = document.createElement('td');
    actionsCell.className = 'px-4 py-2 text-right';

    // Order buttons
    const upButton = document.createElement('button');
    upButton.type = 'button';
    upButton.className = 'text-gray-600 hover:text-indigo-600 mx-1';
    upButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    upButton.title = 'Move Up';
    upButton.addEventListener('click', () => updateNavigationOrder(item.id, 'up'));

    const downButton = document.createElement('button');
    downButton.type = 'button';
    downButton.className = 'text-gray-600 hover:text-indigo-600 mx-1';
    downButton.innerHTML = '<i class="fas fa-arrow-down"></i>';
    downButton.title = 'Move Down';
    downButton.addEventListener('click', () => updateNavigationOrder(item.id, 'down'));

    // Edit button
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'text-blue-600 hover:text-blue-800 mx-1';
    editButton.innerHTML = '<i class="fas fa-edit"></i>';
    editButton.title = 'Edit';
    editButton.addEventListener('click', () => editNavigationItem(item.id));

    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'text-red-600 hover:text-red-800 mx-1';
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    deleteButton.title = 'Delete';
    deleteButton.addEventListener('click', () => deleteNavigationItem(item.id));

    actionsCell.appendChild(upButton);
    actionsCell.appendChild(downButton);
    actionsCell.appendChild(editButton);
    actionsCell.appendChild(deleteButton);

    // Append cells to row
    row.appendChild(labelCell);
    row.appendChild(urlCell);
    row.appendChild(parentCell);
    row.appendChild(orderCell);
    row.appendChild(visibilityCell);
    row.appendChild(actionsCell);

    return row;
}

/**
 * Populate the parent dropdown with current navigation items
 */
function populateParentDropdown() {
    const parentSelect = document.getElementById('nav-parent');
    if (!parentSelect) return;

    // Save current selection
    const currentSelection = parentSelect.value;

    // Clear the dropdown except for the default option
    while (parentSelect.options.length > 1) {
        parentSelect.remove(1);
    }

    // Sort items for the dropdown
    const sortedItems = [...navigationItems].sort((a, b) => {
        if (!a.parent && b.parent) return -1;
        if (a.parent && !b.parent) return 1;
        return a.label.localeCompare(b.label);
    });

    // Add items to dropdown
    sortedItems.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;

        // Add indentation for child items
        let label = item.label;
        if (item.parent) {
            // Find all parents to determine level
            let level = 0;
            let parentId = item.parent;
            while (parentId) {
                level++;
                const parent = navigationItems.find(nav => nav.id === parentId);
                parentId = parent ? parent.parent : null;
            }
            label = '— '.repeat(level) + label;
        }

        option.textContent = label;
        parentSelect.appendChild(option);
    });

    // Restore previous selection if it still exists
    if (currentSelection) {
        parentSelect.value = currentSelection;
    }
}

/**
 * Edit a navigation item
 * @param {string} itemId - Navigation item ID
 */
function editNavigationItem(itemId) {
    const item = navigationItems.find(item => item.id === itemId);
    if (!item) return;

    // Populate form with item data
    document.getElementById('nav-id').value = item.id;
    document.getElementById('nav-label').value = item.label;
    document.getElementById('nav-slug').value = item.slug;
    document.getElementById('nav-url').value = item.url;
    document.getElementById('nav-parent').value = item.parent || '';
    document.getElementById('nav-order').value = item.order;
    document.getElementById('nav-main').checked = item.isMainNav;
    document.getElementById('nav-css-class').value = item.cssClass || '';

    // Update form title and button
    document.getElementById('form-title').textContent = 'Edit Navigation Item';
    document.getElementById('nav-submit-btn').textContent = 'Update Navigation Item';
    document.getElementById('nav-cancel-btn').style.display = 'inline-flex';

    // Scroll to form
    document.getElementById('navigation-form').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Delete a navigation item
 * @param {string} itemId - Navigation item ID
 */
function deleteNavigationItem(itemId) {
    // Check if the item has children
    const hasChildren = navigationItems.some(item => item.parent === itemId);

    if (hasChildren) {
        // Ask what to do with children
        if (!confirm('This item has child items. Delete them too?')) {
            // Move children up to parent's parent
            const item = navigationItems.find(item => item.id === itemId);
            navigationItems.forEach(navItem => {
                if (navItem.parent === itemId) {
                    navItem.parent = item.parent;
                }
            });
        }
    }

    // Remove the item
    navigationItems = navigationItems.filter(item => item.id !== itemId);

    // Save changes and update UI
    saveNavigationItems();
    updateNavigationTable();
    populateParentDropdown();
    showNotification('Navigation item deleted successfully', 'success');
}

/**
 * Reset the navigation form to add new item
 */
function resetNavigationForm() {
    document.getElementById('nav-id').value = '';
    document.getElementById('nav-label').value = '';
    document.getElementById('nav-slug').value = '';
    document.getElementById('nav-url').value = '';
    document.getElementById('nav-parent').value = '';
    document.getElementById('nav-order').value = '';
    document.getElementById('nav-main').checked = true;
    document.getElementById('nav-css-class').value = '';

    // Update form title and button
    document.getElementById('form-title').textContent = 'Add New Navigation Item';
    document.getElementById('nav-submit-btn').textContent = 'Add Navigation Item';
    document.getElementById('nav-cancel-btn').style.display = 'none';
}

/**
 * Update the order of a navigation item
 * @param {string} itemId - Navigation item ID
 * @param {string} direction - Direction to move (up/down)
 */
function updateNavigationOrder(itemId, direction) {
    const item = navigationItems.find(item => item.id === itemId);
    if (!item) return;

    // Get siblings (items with same parent)
    const siblings = navigationItems.filter(nav =>
        (nav.parent === item.parent) && nav.id !== itemId
    ).sort((a, b) => a.order - b.order);

    // Find current position
    const allItems = [item, ...siblings].sort((a, b) => a.order - b.order);
    const currentIndex = allItems.findIndex(i => i.id === itemId);

    if (direction === 'up' && currentIndex > 0) {
        // Swap with previous item
        const temp = allItems[currentIndex].order;
        allItems[currentIndex].order = allItems[currentIndex - 1].order;
        allItems[currentIndex - 1].order = temp;
    } else if (direction === 'down' && currentIndex < allItems.length - 1) {
        // Swap with next item
        const temp = allItems[currentIndex].order;
        allItems[currentIndex].order = allItems[currentIndex + 1].order;
        allItems[currentIndex + 1].order = temp;
    }

    // Update all items
    allItems.forEach(updatedItem => {
        const index = navigationItems.findIndex(nav => nav.id === updatedItem.id);
        if (index !== -1) {
            navigationItems[index] = updatedItem;
        }
    });

    // Save changes and update UI
    saveNavigationItems();
    updateNavigationTable();
    showNotification('Navigation order updated', 'success');
}

/**
 * Preview the navigation in the preview panel
 */
function previewNavigation() {
    const previewEl = document.getElementById('navigation-preview');
    previewEl.style.display = 'block';

    // Generate HTML for preview
    const html = generateNavigationHtml();

    // Add to preview container
    const previewContainer = document.getElementById('preview-container');
    if (previewContainer) {
        previewContainer.innerHTML = html;
    }

    // Scroll to preview
    previewEl.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Generate HTML for front-end navigation
 * @returns {string} HTML for navigation
 */
function generateNavigationHtml() {
    // Get top-level items that should appear in main nav
    const topLevelItems = navigationItems
        .filter(item => !item.parent && item.isMainNav)
        .sort((a, b) => a.order - b.order);

    // Start building HTML
    let html = '<nav class="bg-white px-6 py-4 border rounded-md">\n';
    html += '  <ul class="flex space-x-6">\n';

    // Add each top-level item
    topLevelItems.forEach(item => {
        // Check for children
        const children = navigationItems
            .filter(navItem => navItem.parent === item.id)
            .sort((a, b) => a.order - b.order);

        const itemClass = item.cssClass ? ` ${item.cssClass}` : '';

        if (children.length > 0) {
            // Item with dropdown
            html += `    <li class="relative group${itemClass}">\n`;
            html += `      <a href="${item.url}" class="font-medium text-gray-700 hover:text-indigo-600 py-2 inline-block">${item.label} <i class="fas fa-chevron-down ml-1 text-xs"></i></a>\n`;
            html += '      <ul class="absolute left-0 top-full bg-white border rounded-md shadow-md p-2 min-w-max hidden group-hover:block">\n';

            // Add children
            children.forEach(child => {
                const childClass = child.cssClass ? ` ${child.cssClass}` : '';
                html += `        <li${childClass ? ` class="${childClass.trim()}"` : ''}><a href="${child.url}" class="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md">${child.label}</a></li>\n`;
            });

            html += '      </ul>\n';
            html += '    </li>\n';
        } else {
            // Simple item
            html += `    <li${itemClass ? ` class="${itemClass.trim()}"` : ''}><a href="${item.url}" class="font-medium text-gray-700 hover:text-indigo-600 py-2 inline-block">${item.label}</a></li>\n`;
        }
    });

    html += '  </ul>\n';
    html += '</nav>';

    return html;
}

/**
 * Apply navigation changes to front-end
 */
function saveNavigationToFrontend() {
    // In a real implementation, this would update the navigation HTML in all pages
    // For the demonstration, we'll just show the HTML that would be inserted

    const navigationHtml = generateNavigationHtml();

    // Display the generated HTML
    const outputEl = document.getElementById('navigation-output');
    if (outputEl) {
        outputEl.textContent = navigationHtml;
        outputEl.parentElement.style.display = 'block';
    }

    // In a real implementation, we would update actual template files
    /* Example:
    const templates = [
        '/index.html',
        '/categories/massage-guns.html',
        '/categories/foam-rollers.html',
        // etc.
    ];

    templates.forEach(template => {
        // Read file
        const content = fs.readFileSync(template, 'utf8');

        // Replace navigation section
        const updatedContent = content.replace(
            /<!-- START NAVIGATION CONTENT -->[\s\S]*?<!-- END NAVIGATION CONTENT -->/,
            `<!-- START NAVIGATION CONTENT -->\n${navigationHtml}\n<!-- END NAVIGATION CONTENT -->`
        );

        // Write updated file
        fs.writeFileSync(template, updatedContent, 'utf8');
    });
    */

    showNotification('Navigation updated on all front-end pages', 'success');
}

/**
 * Show notification message
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success/error/info)
 */
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) return;

    // Set message and type
    notification.textContent = message;
    notification.className = 'mb-4 p-3 rounded';

    // Add type-specific class
    if (type === 'success') {
        notification.classList.add('bg-green-100', 'text-green-800', 'border', 'border-green-200');
    } else if (type === 'error') {
        notification.classList.add('bg-red-100', 'text-red-800', 'border', 'border-red-200');
    } else {
        notification.classList.add('bg-blue-100', 'text-blue-800', 'border', 'border-blue-200');
    }

    // Show the notification
    notification.style.display = 'block';

    // Hide after 5 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

/**
 * Create a slug from text
 * @param {string} text - Text to convert to slug
 * @returns {string} Slug
 */
function createSlug(text) {
    return text
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
}

/**
 * Get demo navigation items
 * @returns {Array} Demo navigation items
 */
function getDemoNavigationItems() {
    return [
        {
            id: 'nav001',
            label: 'Massage Guns',
            slug: 'massage-guns',
            url: '/categories/massage-guns.html',
            parent: null,
            order: 1,
            isMainNav: true,
            cssClass: ''
        },
        {
            id: 'nav002',
            label: 'Professional',
            slug: 'professional-massage-guns',
            url: '/products/massage-guns/theragun-pro.html',
            parent: 'nav001',
            order: 1,
            isMainNav: false,
            cssClass: ''
        },
        {
            id: 'nav003',
            label: 'Home Use',
            slug: 'home-massage-guns',
            url: '/products/massage-guns/renpho-active-massage-gun.html',
            parent: 'nav001',
            order: 2,
            isMainNav: false,
            cssClass: ''
        },
        {
            id: 'nav004',
            label: 'Foam Rollers',
            slug: 'foam-rollers',
            url: '/categories/foam-rollers.html',
            parent: null,
            order: 2,
            isMainNav: true,
            cssClass: ''
        },
        {
            id: 'nav005',
            label: 'Fitness Bands',
            slug: 'fitness-bands',
            url: '/categories/fitness-bands.html',
            parent: null,
            order: 3,
            isMainNav: true,
            cssClass: ''
        },
        {
            id: 'nav006',
            label: 'Compression Gear',
            slug: 'compression-gear',
            url: '/categories/compression-gear.html',
            parent: null,
            order: 4,
            isMainNav: true,
            cssClass: ''
        },
        {
            id: 'nav007',
            label: 'Compression Socks',
            slug: 'compression-socks',
            url: '/products/compression-gear/cep-compression-socks.html',
            parent: 'nav006',
            order: 1,
            isMainNav: false,
            cssClass: ''
        },
        {
            id: 'nav008',
            label: 'Compression Sleeves',
            slug: 'compression-sleeves',
            url: '/categories/compression-sleeves.html',
            parent: 'nav006',
            order: 2,
            isMainNav: false,
            cssClass: ''
        },
        {
            id: 'nav009',
            label: 'Compression Tights',
            slug: 'compression-tights',
            url: '/categories/compression-tights.html',
            parent: 'nav006',
            order: 3,
            isMainNav: false,
            cssClass: ''
        },
        {
            id: 'nav010',
            label: 'Blog',
            slug: 'blog',
            url: '/blog/index.html',
            parent: null,
            order: 5,
            isMainNav: true,
            cssClass: ''
        }
    ];
}
