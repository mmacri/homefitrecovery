/**
 * Recovery Essentials - User Roles and Permissions Module
 * This module handles user role definitions, permissions, and access control
 */

// Storage key for roles
const ROLES_KEY = 'recoveryEssentials_roles';
const USERS_KEY = 'recoveryEssentials_users';

// Define role types and their permissions
const ROLE_DEFINITIONS = {
    admin: {
        name: 'Administrator',
        description: 'Full access to all features',
        permissions: [
            'manage_users',
            'manage_roles',
            'manage_products',
            'manage_blog',
            'manage_navigation',
            'manage_affiliate',
            'manage_settings',
            'manage_tags_categories',
            'manage_templates',
            'view_analytics',
            'manage_analytics',
            'view_workflow', // Added permission
            'manage_seo' // Added permission
        ]
    },
    editor: {
        name: 'Editor',
        description: 'Can manage content but not users or system settings',
        permissions: [
            'manage_blog',
            'manage_products',
            'manage_navigation',
            'manage_tags_categories',
            'manage_templates',
            'view_analytics',
            'view_workflow', // Added permission
            'manage_seo' // Added permission
        ]
    },
    author: {
        name: 'Author',
        description: 'Can create and edit their own content only',
        permissions: [
            'create_blog',
            'edit_own_blog',
            'use_templates',
            'view_analytics',
            'view_workflow' // Added permission
            // 'manage_seo', // Not added to author role
        ]
    },
    affiliate: {
        name: 'Affiliate Manager',
        description: 'Can manage affiliate links and view analytics',
        permissions: [
            'manage_affiliate',
            'view_analytics',
            'view_workflow' // Added permission
        ]
    },
    viewer: {
        name: 'Viewer',
        description: 'Read-only access to the admin dashboard',
        permissions: [
            'view_dashboard',
            'view_analytics',
            'view_workflow' // Added permission
        ]
    }
};

// Permission descriptions for UI display
const PERMISSION_DESCRIPTIONS = {
    manage_users: 'Create, edit, and delete user accounts',
    manage_roles: 'Assign and manage user roles',
    manage_products: 'Create, edit, and delete products',
    manage_blog: 'Create, edit, and delete any blog posts',
    manage_navigation: 'Edit site navigation structure',
    manage_affiliate: 'Manage affiliate links and programs',
    manage_settings: 'Edit site settings and configurations',
    manage_tags_categories: 'Create and manage tags and categories',
    manage_templates: 'Create and manage content templates',
    view_analytics: 'View site analytics and reports',
    manage_analytics: 'Configure analytics settings and export data',
    create_blog: 'Create new blog posts',
    edit_own_blog: 'Edit only blog posts created by this user',
    use_templates: 'Use existing content templates',
    view_workflow: 'View and use the content workflow system', // Added permission description
    manage_seo: 'Manage SEO settings and analyze content' // Added permission description
};

// UI Access Configuration - maps permissions to UI elements
const UI_ACCESS_MAP = {
    dashboard: ['view_dashboard', 'view_analytics'],
    products: ['manage_products'],
    blog: ['manage_blog', 'create_blog', 'edit_own_blog'],
    navigation: ['manage_navigation'],
    affiliate: ['manage_affiliate'],
    settings: ['manage_settings'],
    tags_categories: ['manage_tags_categories'],
    templates: ['manage_templates', 'use_templates'],
    users: ['manage_users', 'manage_roles'],
    analytics: ['view_analytics', 'manage_analytics'],
    workflow: ['view_workflow'], // Added UI section for workflow
    seo: ['manage_seo'] // Added UI section for SEO
};

/**
 * Initialize the roles system
 */
function initRoles() {
    // Check if roles already exist in storage
    const storedRoles = localStorage.getItem(ROLES_KEY);
    if (!storedRoles) {
        // Initialize with default roles
        localStorage.setItem(ROLES_KEY, JSON.stringify(ROLE_DEFINITIONS));
    }
}

/**
 * Get all defined roles
 * @returns {Object} All role definitions
 */
function getAllRoles() {
    const roles = JSON.parse(localStorage.getItem(ROLES_KEY) || '{}');
    return roles;
}

/**
 * Get a specific role definition
 * @param {string} roleId - Role identifier
 * @returns {Object} Role definition object
 */
function getRole(roleId) {
    const roles = getAllRoles();
    return roles[roleId] || null;
}

/**
 * Create a custom role
 * @param {string} roleId - Unique role identifier
 * @param {Object} roleDef - Role definition, including name, description, and permissions
 * @returns {boolean} Success status
 */
function createRole(roleId, roleDef) {
    if (!roleId || !roleDef.name || !Array.isArray(roleDef.permissions)) {
        return false;
    }

    const roles = getAllRoles();

    // Check if role already exists
    if (roles[roleId]) {
        return false;
    }

    // Add the new role
    roles[roleId] = roleDef;
    localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
    return true;
}

/**
 * Update an existing role
 * @param {string} roleId - Role identifier
 * @param {Object} roleDef - Updated role definition
 * @returns {boolean} Success status
 */
function updateRole(roleId, roleDef) {
    const roles = getAllRoles();

    // Check if role exists
    if (!roles[roleId]) {
        return false;
    }

    // Update the role
    roles[roleId] = {...roles[roleId], ...roleDef};
    localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
    return true;
}

/**
 * Delete a custom role
 * @param {string} roleId - Role identifier
 * @returns {boolean} Success status
 */
function deleteRole(roleId) {
    // Prevent deletion of built-in roles
    if (['admin', 'editor', 'author', 'affiliate', 'viewer'].includes(roleId)) {
        return false;
    }

    const roles = getAllRoles();

    // Check if role exists
    if (!roles[roleId]) {
        return false;
    }

    // Check if any users have this role
    const users = getAllUsers();
    const hasUsersWithRole = Object.values(users).some(user => user.role === roleId);
    if (hasUsersWithRole) {
        return false; // Cannot delete role that's in use
    }

    // Delete the role
    delete roles[roleId];
    localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
    return true;
}

/**
 * Check if user has a specific permission
 * @param {Object} user - User object
 * @param {string} permission - Permission to check
 * @returns {boolean} Whether user has the permission
 */
function hasPermission(user, permission) {
    if (!user || !user.role) {
        return false;
    }

    const role = getRole(user.role);
    if (!role) {
        return false;
    }

    return role.permissions.includes(permission);
}

/**
 * Check if user has any of the specified permissions
 * @param {Object} user - User object
 * @param {Array} permissions - Array of permissions to check
 * @returns {boolean} Whether user has any of the permissions
 */
function hasAnyPermission(user, permissions) {
    if (!user || !user.role || !Array.isArray(permissions)) {
        return false;
    }

    const role = getRole(user.role);
    if (!role) {
        return false;
    }

    return permissions.some(permission => role.permissions.includes(permission));
}

/**
 * Get all users
 * @returns {Object} All users
 */
function getAllUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
}

/**
 * Get a specific user
 * @param {string} userId - User ID
 * @returns {Object} User object
 */
function getUser(userId) {
    const users = getAllUsers();
    return users[userId] || null;
}

/**
 * Save a user
 * @param {string} userId - User ID
 * @param {Object} userData - User data
 * @returns {boolean} Success status
 */
function saveUser(userId, userData) {
    if (!userId || !userData) {
        return false;
    }

    const users = getAllUsers();
    users[userId] = userData;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
}

/**
 * Delete a user
 * @param {string} userId - User ID
 * @returns {boolean} Success status
 */
function deleteUser(userId) {
    const users = getAllUsers();

    // Check if user exists
    if (!users[userId]) {
        return false;
    }

    // Delete the user
    delete users[userId];
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
}

/**
 * Initialize the users system with a default admin user
 */
function initDefaultUsers() {
    const users = getAllUsers();

    // If no users exist, create default admin
    if (Object.keys(users).length === 0) {
        users['admin'] = {
            id: 'admin',
            name: 'Admin User',
            email: 'admin@recoveryessentials.com',
            role: 'admin',
            created: Date.now(),
            lastLogin: null
        };

        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
}

/**
 * Check if user has access to a specific UI section
 * @param {Object} user - User object
 * @param {string} section - UI section to check
 * @returns {boolean} Whether user has access
 */
function canAccessUISection(user, section) {
    if (!user || !section || !UI_ACCESS_MAP[section]) {
        return false;
    }

    return hasAnyPermission(user, UI_ACCESS_MAP[section]);
}

/**
 * Get all permissions a user has
 * @param {Object} user - User object
 * @returns {Array} Array of permission strings
 */
function getUserPermissions(user) {
    if (!user || !user.role) {
        return [];
    }

    const role = getRole(user.role);
    if (!role) {
        return [];
    }

    return role.permissions || [];
}

/**
 * Get all UI sections a user can access
 * @param {Object} user - User object
 * @returns {Array} Array of accessible section names
 */
function getAccessibleSections(user) {
    if (!user) {
        return [];
    }

    const sections = [];
    for (const [section, permissions] of Object.entries(UI_ACCESS_MAP)) {
        if (hasAnyPermission(user, permissions)) {
            sections.push(section);
        }
    }

    return sections;
}

// Initialize the roles system on script load
initRoles();
initDefaultUsers();

// Export functions for use in other modules
window.UserRoles = {
    getAllRoles,
    getRole,
    createRole,
    updateRole,
    deleteRole,
    hasPermission,
    hasAnyPermission,
    getAllUsers,
    getUser,
    saveUser,
    deleteUser,
    canAccessUISection,
    getUserPermissions,
    getAccessibleSections,
    ROLE_DEFINITIONS,
    PERMISSION_DESCRIPTIONS
};
