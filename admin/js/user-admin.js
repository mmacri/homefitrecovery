/**
 * Recovery Essentials - User Administration
 * This script handles the UI for user management and role administration
 */

// DOM Elements
let userForm;
let userModal;
let roleForm;
let roleModal;
let permissionModal;

// Current user being edited
let currentUserId = null;
let currentRoleId = null;

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    userForm = document.getElementById('user-form');
    userModal = document.getElementById('user-modal');
    roleForm = document.getElementById('role-form');
    roleModal = document.getElementById('role-modal');
    permissionModal = document.getElementById('permission-modal');

    // Initialize event listeners
    initEventListeners();

    // Load data
    updateUserTable();
    updateRoleTable();
    updateStatistics();
});

/**
 * Initialize all event listeners
 */
function initEventListeners() {
    // User form buttons
    const addUserBtn = document.getElementById('add-user-btn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', openUserModal);
    }

    // Modal close buttons
    const closeModalBtn = document.getElementById('close-modal-btn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeUserModal);
    }

    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeUserModal);
    }

    // User form submission
    if (userForm) {
        userForm.addEventListener('submit', handleUserFormSubmit);
    }

    // Role management
    const addRoleBtn = document.getElementById('add-role-btn');
    if (addRoleBtn) {
        addRoleBtn.addEventListener('click', openRoleModal);
    }

    const closeRoleModalBtn = document.getElementById('close-role-modal-btn');
    if (closeRoleModalBtn) {
        closeRoleModalBtn.addEventListener('click', closeRoleModal);
    }

    const cancelRoleBtn = document.getElementById('cancel-role-btn');
    if (cancelRoleBtn) {
        cancelRoleBtn.addEventListener('click', closeRoleModal);
    }

    // Role form submission
    if (roleForm) {
        roleForm.addEventListener('submit', handleRoleFormSubmit);
    }

    // Permission modal close
    const closePermissionModalBtn = document.getElementById('close-permission-modal-btn');
    if (closePermissionModalBtn) {
        closePermissionModalBtn.addEventListener('click', closePermissionModal);
    }

    const closePermissionViewBtn = document.getElementById('close-permission-view-btn');
    if (closePermissionViewBtn) {
        closePermissionViewBtn.addEventListener('click', closePermissionModal);
    }

    // User role select change
    const userRoleSelect = document.getElementById('user-role');
    if (userRoleSelect) {
        userRoleSelect.addEventListener('change', updateRoleDescription);
    }

    // Password toggle
    const togglePasswordBtn = document.getElementById('toggle-password-btn');
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
    }

    // Search users
    const userSearch = document.getElementById('user-search');
    if (userSearch) {
        userSearch.addEventListener('input', function() {
            filterUsers(this.value);
        });
    }
}

/**
 * Open the user modal for adding a new user
 */
function openUserModal() {
    // Reset form
    userForm.reset();
    document.getElementById('user-id').value = '';

    // Set up the modal for adding a new user
    document.getElementById('modal-title').textContent = 'Add New User';
    document.getElementById('save-user-btn').textContent = 'Create User';

    // Show password field for new users and update hint text
    document.getElementById('user-password').required = true;
    document.querySelector('.password-hint').textContent = 'Password for the new user account';

    // Populate roles dropdown
    populateRolesDropdown();

    // Show the modal
    userModal.classList.remove('hidden');

    // Clear current user ID
    currentUserId = null;
}

/**
 * Close the user modal
 */
function closeUserModal() {
    userModal.classList.add('hidden');
    userForm.reset();
    currentUserId = null;
}

/**
 * Open user modal for editing a user
 * @param {string} userId - ID of user to edit
 */
function editUser(userId) {
    // Get user data
    const user = window.UserRoles.getUser(userId);
    if (!user) return;

    // Fill the form with user data
    document.getElementById('user-id').value = user.id;
    document.getElementById('user-name').value = user.name;
    document.getElementById('user-email').value = user.email;

    // Password field is optional for editing
    document.getElementById('user-password').required = false;
    document.getElementById('user-password').value = '';
    document.querySelector('.password-hint').textContent = 'Leave blank to keep current password';

    // Set up modal for editing
    document.getElementById('modal-title').textContent = 'Edit User';
    document.getElementById('save-user-btn').textContent = 'Update User';

    // Populate roles dropdown and select current role
    populateRolesDropdown(user.role);

    // Show the modal
    userModal.classList.remove('hidden');

    // Store the current user ID
    currentUserId = userId;
}

/**
 * Handle user form submission
 * @param {Event} e - Form submit event
 */
function handleUserFormSubmit(e) {
    e.preventDefault();

    // Get form values
    const userId = document.getElementById('user-id').value || generateUserId();
    const name = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const password = document.getElementById('user-password').value;
    const role = document.getElementById('user-role').value;

    // Validate email
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    // For new users, require a password
    if (!currentUserId && !password) {
        showNotification('Password is required for new users', 'error');
        return;
    }

    // Validate form
    if (!name || !email || !role) {
        showNotification('Please fill out all required fields', 'error');
        return;
    }

    // Get existing user data if editing
    let userData = currentUserId ? window.UserRoles.getUser(currentUserId) : {};

    // Update user data
    userData = {
        ...userData,
        id: userId,
        name: name,
        email: email,
        role: role,
        updated: Date.now()
    };

    // For new users, set creation date
    if (!currentUserId) {
        userData.created = Date.now();
    }

    // Only update password if provided
    if (password) {
        // In a real app, this would hash the password
        userData.password = password;
    }

    // Save user
    const success = window.UserRoles.saveUser(userId, userData);

    if (success) {
        showNotification(currentUserId ? 'User updated successfully' : 'User created successfully', 'success');
        closeUserModal();
        updateUserTable();
        updateStatistics();
    } else {
        showNotification('Error saving user', 'error');
    }
}

/**
 * Populate the roles dropdown
 * @param {string} selectedRole - Role to select (optional)
 */
function populateRolesDropdown(selectedRole = null) {
    const roleSelect = document.getElementById('user-role');
    if (!roleSelect) return;

    // Clear existing options
    roleSelect.innerHTML = '';

    // Get roles
    const roles = window.UserRoles.getAllRoles();

    // Add each role as an option
    for (const [roleId, role] of Object.entries(roles)) {
        const option = document.createElement('option');
        option.value = roleId;
        option.textContent = role.name;

        // Select this role if it matches the selectedRole
        if (selectedRole === roleId) {
            option.selected = true;
        }

        roleSelect.appendChild(option);
    }

    // Update role description
    updateRoleDescription();
}

/**
 * Update the role description when a role is selected
 */
function updateRoleDescription() {
    const roleSelect = document.getElementById('user-role');
    const roleDescription = document.querySelector('.role-description');

    if (!roleSelect || !roleDescription) return;

    const selectedRole = roleSelect.value;
    const role = window.UserRoles.getRole(selectedRole);

    if (role) {
        roleDescription.textContent = role.description;
    } else {
        roleDescription.textContent = '';
    }
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('user-password');
    const toggleBtn = document.getElementById('toggle-password-btn');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        passwordInput.type = 'password';
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

/**
 * Generate a unique user ID
 * @returns {string} Generated user ID
 */
function generateUserId() {
    return 'user_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Update the user table with current users
 */
function updateUserTable() {
    const tableBody = document.getElementById('users-table-body');
    if (!tableBody) return;

    // Get all users
    const users = window.UserRoles.getAllUsers();

    // Clear table
    tableBody.innerHTML = '';

    // Handle empty state
    if (Object.keys(users).length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                No users found. Add your first user to get started.
            </td>
        `;
        tableBody.appendChild(emptyRow);
        return;
    }

    // Add each user to the table
    for (const [userId, user] of Object.entries(users)) {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';

        // Format last login date
        const lastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never';

        // Get role name
        const role = window.UserRoles.getRole(user.role);
        const roleName = role ? role.name : user.role;

        // Determine if this is the current user
        const authData = JSON.parse(localStorage.getItem('recoveryEssentials_auth') || '{"user":{}}');
        const isCurrentUser = authData.user && authData.user.id === userId;

        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span class="text-lg font-medium text-gray-600">${user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${user.name}</div>
                        <div class="text-sm text-gray-500">Created: ${new Date(user.created).toLocaleDateString()}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${user.email}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                    ${roleName}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">${lastLogin}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-indigo-600 hover:text-indigo-900 mr-3 edit-user-btn" data-id="${userId}">
                    Edit
                </button>
                <button class="text-red-600 hover:text-red-900 delete-user-btn ${isCurrentUser ? 'opacity-50 cursor-not-allowed' : ''}"
                        data-id="${userId}" ${isCurrentUser ? 'disabled' : ''}>
                    Delete
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    }

    // Add event listeners to edit and delete buttons
    tableBody.querySelectorAll('.edit-user-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            editUser(userId);
        });
    });

    tableBody.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.disabled) return;

            const userId = this.getAttribute('data-id');
            deleteUser(userId);
        });
    });
}

/**
 * Filter users by search term
 * @param {string} searchTerm - Term to search for
 */
function filterUsers(searchTerm) {
    const tableBody = document.getElementById('users-table-body');
    if (!tableBody) return;

    // Convert search term to lowercase for case-insensitive comparison
    searchTerm = searchTerm.toLowerCase();

    // Show all rows if search term is empty
    if (!searchTerm) {
        tableBody.querySelectorAll('tr').forEach(row => {
            row.style.display = '';
        });
        return;
    }

    // Filter rows
    tableBody.querySelectorAll('tr').forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

/**
 * Delete a user
 * @param {string} userId - ID of user to delete
 */
function deleteUser(userId) {
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete this user? This action cannot be undone.`)) {
        return;
    }

    // Get current user
    const authData = JSON.parse(localStorage.getItem('recoveryEssentials_auth') || '{"user":{}}');

    // Prevent deleting your own account
    if (authData.user && authData.user.id === userId) {
        showNotification('You cannot delete your own account', 'error');
        return;
    }

    // Delete the user
    const success = window.UserRoles.deleteUser(userId);

    if (success) {
        showNotification('User deleted successfully', 'success');
        updateUserTable();
        updateStatistics();
    } else {
        showNotification('Error deleting user', 'error');
    }
}

/**
 * Update user statistics
 */
function updateStatistics() {
    const users = window.UserRoles.getAllUsers();

    // Update total users
    const totalUsers = Object.keys(users).length;
    const totalUsersElement = document.getElementById('total-users');
    if (totalUsersElement) {
        totalUsersElement.textContent = totalUsers;
    }

    // Count active users (logged in within the last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const activeUsers = Object.values(users).filter(user =>
        user.lastLogin && user.lastLogin > thirtyDaysAgo
    ).length;

    const activeUsersElement = document.getElementById('active-users');
    if (activeUsersElement) {
        activeUsersElement.textContent = activeUsers;
    }

    // Count admin users
    const adminUsers = Object.values(users).filter(user =>
        user.role === 'admin'
    ).length;

    const adminUsersElement = document.getElementById('admin-users');
    if (adminUsersElement) {
        adminUsersElement.textContent = adminUsers;
    }
}

/**
 * Open the role modal for adding a new role
 */
function openRoleModal(roleId = null) {
    // Reset form
    roleForm.reset();
    document.getElementById('role-id').value = '';

    // Update modal title
    if (roleId) {
        document.getElementById('role-modal-title').textContent = 'Edit Role';
        document.getElementById('save-role-btn').textContent = 'Update Role';

        // Get role data
        const role = window.UserRoles.getRole(roleId);
        if (role) {
            document.getElementById('role-id').value = roleId;
            document.getElementById('role-name').value = role.name;
            document.getElementById('role-description').value = role.description;

            // Store current role ID
            currentRoleId = roleId;
        }
    } else {
        document.getElementById('role-modal-title').textContent = 'Add Custom Role';
        document.getElementById('save-role-btn').textContent = 'Create Role';
        currentRoleId = null;
    }

    // Populate permissions checkboxes
    populatePermissionsCheckboxes(roleId);

    // Show modal
    roleModal.classList.remove('hidden');
}

/**
 * Close the role modal
 */
function closeRoleModal() {
    roleModal.classList.add('hidden');
    roleForm.reset();
    currentRoleId = null;
}

/**
 * Open modal to view role permissions
 * @param {string} roleId - ID of role to view
 */
function viewRolePermissions(roleId) {
    const role = window.UserRoles.getRole(roleId);
    if (!role) return;

    // Set role information
    document.getElementById('viewing-role-name').textContent = role.name;
    document.getElementById('viewing-role-description').textContent = role.description;

    // Clear permission list
    const permissionList = document.getElementById('permission-list');
    permissionList.innerHTML = '';

    // Add each permission to the list
    if (role.permissions && role.permissions.length > 0) {
        role.permissions.forEach(permission => {
            const li = document.createElement('li');
            const description = window.UserRoles.PERMISSION_DESCRIPTIONS[permission] || permission;
            li.textContent = description;
            permissionList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'This role has no permissions.';
        permissionList.appendChild(li);
    }

    // Show modal
    permissionModal.classList.remove('hidden');
}

/**
 * Close the permission view modal
 */
function closePermissionModal() {
    permissionModal.classList.add('hidden');
}

/**
 * Populate permissions checkboxes in the role form
 * @param {string} roleId - ID of role to load permissions for
 */
function populatePermissionsCheckboxes(roleId = null) {
    const container = document.getElementById('permissions-container');
    if (!container) return;

    // Clear container
    container.innerHTML = '';

    // Get role permissions if editing
    let rolePermissions = [];
    if (roleId) {
        const role = window.UserRoles.getRole(roleId);
        if (role && role.permissions) {
            rolePermissions = role.permissions;
        }
    }

    // Add checkbox for each permission
    for (const [permission, description] of Object.entries(window.UserRoles.PERMISSION_DESCRIPTIONS)) {
        const div = document.createElement('div');
        div.className = 'flex items-start';

        const checked = rolePermissions.includes(permission);

        div.innerHTML = `
            <div class="flex items-center h-5">
                <input id="permission-${permission}" name="permissions" type="checkbox" value="${permission}"
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    ${checked ? 'checked' : ''}>
            </div>
            <div class="ml-3 text-sm">
                <label for="permission-${permission}" class="font-medium text-gray-700">${description}</label>
            </div>
        `;

        container.appendChild(div);
    }
}

/**
 * Handle role form submission
 * @param {Event} e - Form submit event
 */
function handleRoleFormSubmit(e) {
    e.preventDefault();

    // Get form values
    const roleId = document.getElementById('role-id').value || generateRoleId();
    const name = document.getElementById('role-name').value;
    const description = document.getElementById('role-description').value;

    // Get selected permissions
    const permissions = [];
    document.querySelectorAll('input[name="permissions"]:checked').forEach(checkbox => {
        permissions.push(checkbox.value);
    });

    // Validate form
    if (!name || !description || permissions.length === 0) {
        showNotification('Please fill out all fields and select at least one permission', 'error');
        return;
    }

    // Check if trying to edit a built-in role
    if (currentRoleId && ['admin', 'editor', 'author', 'affiliate', 'viewer'].includes(currentRoleId)) {
        showNotification('Cannot modify built-in roles', 'error');
        return;
    }

    // Create role object
    const role = {
        name,
        description,
        permissions,
        custom: true
    };

    // Save role
    let success;
    if (currentRoleId) {
        success = window.UserRoles.updateRole(currentRoleId, role);
    } else {
        success = window.UserRoles.createRole(roleId, role);
    }

    if (success) {
        showNotification(currentRoleId ? 'Role updated successfully' : 'Role created successfully', 'success');
        closeRoleModal();
        updateRoleTable();
    } else {
        showNotification('Error saving role', 'error');
    }
}

/**
 * Update the role table
 */
function updateRoleTable() {
    const tableBody = document.getElementById('roles-table-body');
    if (!tableBody) return;

    // Get all roles
    const roles = window.UserRoles.getAllRoles();

    // Clear table
    tableBody.innerHTML = '';

    // Get all users for counting users per role
    const users = window.UserRoles.getAllUsers();

    // Add each role to the table
    for (const [roleId, role] of Object.entries(roles)) {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';

        // Count users with this role
        const userCount = Object.values(users).filter(user => user.role === roleId).length;

        // Determine if this is a built-in role
        const isBuiltIn = ['admin', 'editor', 'author', 'affiliate', 'viewer'].includes(roleId);

        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="text-sm font-medium text-gray-900">${role.name}</div>
                    ${isBuiltIn ? '<span class="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Built-in</span>' : ''}
                </div>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm text-gray-500">${role.description}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${userCount}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="text-indigo-600 hover:text-indigo-900 mr-3 view-role-btn" data-id="${roleId}">
                    View Permissions
                </button>
                ${isBuiltIn ? '' : `
                <button class="text-indigo-600 hover:text-indigo-900 mr-3 edit-role-btn" data-id="${roleId}">
                    Edit
                </button>
                <button class="text-red-600 hover:text-red-900 delete-role-btn ${userCount > 0 ? 'opacity-50 cursor-not-allowed' : ''}" data-id="${roleId}" ${userCount > 0 ? 'disabled' : ''}>
                    Delete
                </button>
                `}
            </td>
        `;

        tableBody.appendChild(row);
    }

    // Add event listeners
    tableBody.querySelectorAll('.view-role-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const roleId = this.getAttribute('data-id');
            viewRolePermissions(roleId);
        });
    });

    tableBody.querySelectorAll('.edit-role-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const roleId = this.getAttribute('data-id');
            openRoleModal(roleId);
        });
    });

    tableBody.querySelectorAll('.delete-role-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.disabled) return;

            const roleId = this.getAttribute('data-id');
            deleteRole(roleId);
        });
    });
}

/**
 * Delete a role
 * @param {string} roleId - ID of role to delete
 */
function deleteRole(roleId) {
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete this role? This action cannot be undone.`)) {
        return;
    }

    // Cannot delete built-in roles
    if (['admin', 'editor', 'author', 'affiliate', 'viewer'].includes(roleId)) {
        showNotification('Cannot delete built-in roles', 'error');
        return;
    }

    // Check if any users have this role
    const users = window.UserRoles.getAllUsers();
    const hasUsers = Object.values(users).some(user => user.role === roleId);

    if (hasUsers) {
        showNotification('Cannot delete a role that is assigned to users', 'error');
        return;
    }

    // Delete the role
    const success = window.UserRoles.deleteRole(roleId);

    if (success) {
        showNotification('Role deleted successfully', 'success');
        updateRoleTable();
    } else {
        showNotification('Error deleting role', 'error');
    }
}

/**
 * Generate a unique role ID
 * @returns {string} Generated role ID
 */
function generateRoleId() {
    const name = document.getElementById('role-name').value;
    const baseId = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `${baseId}_${Date.now().toString(36)}`;
}

/**
 * Show a notification message
 * @param {string} message - Message to display
 * @param {string} type - Notification type (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    // Use the global notification function from the main dashboard
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        // Fallback implementation
        alert(`${type.toUpperCase()}: ${message}`);
    }
}
