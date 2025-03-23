# User Roles and Permissions: Integration Guide

This guide explains how to integrate the User Roles and Permissions system with other components of the Recovery Essentials website. It covers how to add permission checks to your custom code, integrate with existing components, and extend the system for new features.

## Table of Contents

1. [Basic Integration](#basic-integration)
2. [Adding Permission Checks to UI Elements](#adding-permission-checks-to-ui-elements)
3. [Creating Permission-Aware Pages](#creating-permission-aware-pages)
4. [Integrating with Content Management](#integrating-with-content-management)
5. [Extending for New Features](#extending-for-new-features)
6. [Best Practices](#best-practices)

## Basic Integration

### Including the Required Scripts

To use the User Roles and Permissions system in your page or component, you need to make sure the necessary scripts are loaded in the correct order:

```html
<!-- First load the User Roles system -->
<script src="js/user-roles.js"></script>

<!-- Then load the authentication system which integrates with user roles -->
<script src="js/auth.js"></script>

<!-- Finally, load your component-specific scripts -->
<script src="js/your-component.js"></script>
```

### Accessing the User Roles API

The User Roles system exposes a global `UserRoles` object with methods for permission checking:

```javascript
// Get the current user from auth
const currentUser = JSON.parse(localStorage.getItem('recoveryEssentials_auth')).user;

// Check if user has a specific permission
if (UserRoles.hasPermission(currentUser, 'manage_products')) {
  // Show product management UI
}

// Check if user has any of multiple permissions
if (UserRoles.hasAnyPermission(currentUser, ['manage_blog', 'create_blog'])) {
  // Show blog creation button
}

// Get all permissions for a user
const userPermissions = UserRoles.getUserPermissions(currentUser);
console.log('User has these permissions:', userPermissions);
```

## Adding Permission Checks to UI Elements

### Hiding Elements Based on Permissions

You can hide elements that users shouldn't access:

```javascript
document.addEventListener('DOMContentLoaded', function() {
  const currentUser = JSON.parse(localStorage.getItem('recoveryEssentials_auth')).user;

  // Hide "Delete" buttons if user doesn't have permission
  if (!UserRoles.hasPermission(currentUser, 'manage_products')) {
    document.querySelectorAll('.delete-product-btn').forEach(btn => {
      btn.style.display = 'none';
    });
  }
});
```

### Dynamic UI Generation

When generating UI elements dynamically, include permission checks:

```javascript
function renderActionMenu(item) {
  const currentUser = JSON.parse(localStorage.getItem('recoveryEssentials_auth')).user;
  const menu = document.createElement('div');
  menu.className = 'action-menu';

  // View button - available to everyone
  const viewBtn = document.createElement('button');
  viewBtn.textContent = 'View';
  viewBtn.onclick = () => viewItem(item.id);
  menu.appendChild(viewBtn);

  // Edit button - only for those with edit permission
  if (UserRoles.hasPermission(currentUser, 'manage_blog') ||
      (UserRoles.hasPermission(currentUser, 'edit_own_blog') && item.authorId === currentUser.id)) {
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => editItem(item.id);
    menu.appendChild(editBtn);
  }

  // Delete button - only for those with full management permission
  if (UserRoles.hasPermission(currentUser, 'manage_blog')) {
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deleteItem(item.id);
    menu.appendChild(deleteBtn);
  }

  return menu;
}
```

### Form Field Restrictions

You can disable or hide form fields based on permissions:

```javascript
function initializeForm() {
  const currentUser = JSON.parse(localStorage.getItem('recoveryEssentials_auth')).user;

  // Disable "Featured" checkbox for non-editors
  const featuredCheckbox = document.getElementById('featured-checkbox');
  if (featuredCheckbox && !UserRoles.hasPermission(currentUser, 'manage_blog')) {
    featuredCheckbox.disabled = true;
    featuredCheckbox.parentNode.title = 'Requires editor permission';
  }

  // Hide advanced settings section if user lacks permission
  const advancedSettings = document.getElementById('advanced-settings');
  if (advancedSettings && !UserRoles.hasPermission(currentUser, 'manage_settings')) {
    advancedSettings.style.display = 'none';
  }
}
```

## Creating Permission-Aware Pages

### Page Structure

When creating new pages for the admin dashboard, follow this structure to make them permission-aware:

```html
<!-- page-name.html -->
<div class="permission-check" data-required-permission="manage_something">
  <h2>Your Feature Title</h2>

  <!-- Your page content here -->

  <script>
    // Run this script when the page loads via AJAX
    (function() {
      // Check permissions
      const authData = JSON.parse(localStorage.getItem('recoveryEssentials_auth') || '{"user":{}}');
      const user = authData.user;

      // Get required permission from data attribute
      const requiredPermission = document.querySelector('.permission-check').dataset.requiredPermission;

      // Verify permission
      if (!window.UserRoles || !window.UserRoles.hasPermission(user, requiredPermission)) {
        // Replace content with access denied message
        document.querySelector('.permission-check').innerHTML = `
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Access Denied!</strong> You don't have permission to view this page.
          </div>
        `;
      } else {
        // Initialize your page
        initializeYourPage();
      }
    })();

    function initializeYourPage() {
      // Your page initialization code here
    }
  </script>
</div>
```

### Adding to Navigation

To add your page to the navigation menu, you'll need to:

1. Update the navigation links in `index.html`
2. Add appropriate `data-section` attributes
3. Update the `UI_ACCESS_MAP` in `user-roles.js` to include your page section

Example addition to `index.html`:

```html
<a href="#" class="flex items-center px-4 py-2 text-gray-300 rounded-md hover:bg-gray-700"
   onclick="loadContent('your-feature.html')" data-section="your_feature">
  <i class="fas fa-cog mr-3"></i>
  Your Feature
</a>
```

Example addition to `UI_ACCESS_MAP` in `user-roles.js`:

```javascript
const UI_ACCESS_MAP = {
  // Existing mappings...
  your_feature: ['your_permission_name', 'another_permission']
};
```

## Integrating with Content Management

### Blog Post Ownership

To implement "edit own content" permissions:

```javascript
function loadBlogPosts() {
  const currentUser = JSON.parse(localStorage.getItem('recoveryEssentials_auth')).user;
  const canEditAny = UserRoles.hasPermission(currentUser, 'manage_blog');
  const canEditOwn = UserRoles.hasPermission(currentUser, 'edit_own_blog');

  // Fetch blog posts
  // In a real implementation, this would be an API call
  const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');

  const postsList = document.getElementById('posts-list');
  postsList.innerHTML = '';

  posts.forEach(post => {
    const postElement = document.createElement('div');
    postElement.className = 'post-item';

    // Determine if user can edit this post
    const canEdit = canEditAny || (canEditOwn && post.authorId === currentUser.id);

    postElement.innerHTML = `
      <h3>${post.title}</h3>
      <p>By: ${post.authorName}</p>
      <div class="actions">
        <button onclick="viewPost(${post.id})">View</button>
        ${canEdit ? `<button onclick="editPost(${post.id})">Edit</button>` : ''}
        ${canEditAny ? `<button onclick="deletePost(${post.id})">Delete</button>` : ''}
      </div>
    `;

    postsList.appendChild(postElement);
  });
}
```

### Product Management

For interfaces with multiple permission levels:

```javascript
function initializeProductsPage() {
  const currentUser = JSON.parse(localStorage.getItem('recoveryEssentials_auth')).user;

  // Set page mode based on permissions
  let pageMode = 'view-only';

  if (UserRoles.hasPermission(currentUser, 'manage_products')) {
    pageMode = 'full-edit';
  } else if (UserRoles.hasPermission(currentUser, 'edit_products')) {
    pageMode = 'limited-edit';
  }

  // Configure UI based on mode
  const addButton = document.getElementById('add-product-btn');
  const bulkActionsMenu = document.getElementById('bulk-actions');
  const priceControls = document.querySelectorAll('.price-control');

  if (pageMode === 'view-only') {
    addButton.style.display = 'none';
    bulkActionsMenu.style.display = 'none';
    priceControls.forEach(control => control.style.display = 'none');
  } else if (pageMode === 'limited-edit') {
    addButton.style.display = 'none';
    bulkActionsMenu.style.display = 'none';
    // Show price controls - limited editors can update prices
  }
  // Full edit mode - everything is visible

  // Load products with appropriate actions
  loadProducts(pageMode);
}
```

## Extending for New Features

### Adding New Permissions

To add new permissions to the system:

1. Add the permission identifier and description to `PERMISSION_DESCRIPTIONS` in `user-roles.js`:

```javascript
const PERMISSION_DESCRIPTIONS = {
  // Existing permissions...
  manage_new_feature: 'Manage the new feature functionality',
  view_new_feature: 'View the new feature data'
};
```

2. Add the permissions to the appropriate roles in `ROLE_DEFINITIONS`:

```javascript
const ROLE_DEFINITIONS = {
  admin: {
    // Existing permissions...
    permissions: [
      // Existing permissions...
      'manage_new_feature',
      'view_new_feature'
    ]
  },
  editor: {
    // Existing permissions...
    permissions: [
      // Existing permissions...
      'manage_new_feature',
      'view_new_feature'
    ]
  },
  // Other roles might only get view permission
  author: {
    // Existing permissions...
    permissions: [
      // Existing permissions...
      'view_new_feature'
    ]
  }
};
```

3. Update the UI access map:

```javascript
const UI_ACCESS_MAP = {
  // Existing mappings...
  new_feature: ['manage_new_feature', 'view_new_feature']
};
```

### Creating Permission-Guarded Components

For reusable components with permission checks:

```javascript
class PermissionComponent {
  constructor(elementId, requiredPermission) {
    this.element = document.getElementById(elementId);
    this.requiredPermission = requiredPermission;
    this.currentUser = JSON.parse(localStorage.getItem('recoveryEssentials_auth')).user;
  }

  initialize() {
    if (!this.element) return false;

    // Check permission
    if (!UserRoles.hasPermission(this.currentUser, this.requiredPermission)) {
      this.element.innerHTML = '<p class="error">You do not have permission to view this component.</p>';
      return false;
    }

    // Initialize component if permission check passes
    this.render();
    this.attachEventListeners();
    return true;
  }

  render() {
    // Override in your component
  }

  attachEventListeners() {
    // Override in your component
  }
}

// Usage example
class ProductEditor extends PermissionComponent {
  constructor(elementId) {
    super(elementId, 'manage_products');
    this.products = [];
  }

  render() {
    // Render product editor
  }

  attachEventListeners() {
    // Set up event handling
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  const editor = new ProductEditor('product-editor');
  editor.initialize();
});
```

## Best Practices

### Granular Permission Checks

Apply permission checks at multiple levels:

1. **Page Access**: Control which pages users can view
2. **UI Elements**: Show/hide buttons and controls
3. **Action Authorization**: Verify permissions before performing actions
4. **Data Access**: Filter data based on permissions

### Error Handling

Provide clear feedback when permission is denied:

```javascript
function performAction(actionType, itemId) {
  const currentUser = JSON.parse(localStorage.getItem('recoveryEssentials_auth')).user;

  // Map actions to required permissions
  const permissionMap = {
    'edit': 'edit_content',
    'delete': 'manage_content',
    'publish': 'publish_content'
  };

  const requiredPermission = permissionMap[actionType];

  if (!requiredPermission || !UserRoles.hasPermission(currentUser, requiredPermission)) {
    showNotification('You do not have permission to perform this action', 'error');
    return false;
  }

  // Proceed with action
  return true;
}
```

### Separation of Concerns

Keep permission logic separate from business logic:

```javascript
// Permission service - handle all permission checks
const PermissionService = {
  hasEditAccess(resource, user) {
    return UserRoles.hasPermission(user, 'manage_' + resource) ||
           (UserRoles.hasPermission(user, 'edit_own_' + resource) &&
            this.isResourceOwner(resource, user.id));
  },

  hasDeleteAccess(resource, user) {
    return UserRoles.hasPermission(user, 'manage_' + resource);
  },

  isResourceOwner(resource, userId) {
    // Check resource ownership
    return resource.ownerId === userId;
  }
};

// Business logic - uses the permission service
function editItem(item) {
  const currentUser = JSON.parse(localStorage.getItem('recoveryEssentials_auth')).user;

  if (!PermissionService.hasEditAccess(item, currentUser)) {
    showNotification('Access denied', 'error');
    return;
  }

  // Proceed with edit
  openEditor(item);
}
```

### Performance Optimization

Cache permission checks to avoid repeated lookups:

```javascript
function initializeInterface() {
  const currentUser = JSON.parse(localStorage.getItem('recoveryEssentials_auth')).user;

  // Cache permission check results
  const permissions = {
    canEdit: UserRoles.hasPermission(currentUser, 'manage_content'),
    canDelete: UserRoles.hasPermission(currentUser, 'manage_content'),
    canPublish: UserRoles.hasPermission(currentUser, 'publish_content'),
    canEditOwn: UserRoles.hasPermission(currentUser, 'edit_own_content')
  };

  // Use cached results in the UI
  setupUI(permissions);
}
```

### Handling Complex Conditions

For complex permission scenarios, create helper functions:

```javascript
function canManageTemplate(template, user) {
  // Admins can manage all templates
  if (UserRoles.hasPermission(user, 'manage_templates')) {
    return true;
  }

  // Authors can only edit their own unpublished templates
  if (UserRoles.hasPermission(user, 'edit_own_templates') &&
      template.createdBy === user.id &&
      template.status !== 'published') {
    return true;
  }

  // Editors can edit any unpublished template
  if (UserRoles.hasPermission(user, 'edit_templates') &&
      template.status !== 'published') {
    return true;
  }

  return false;
}
```

### User Experience

Consider the user experience when implementing permissions:

1. **Don't show what users can't use** - Hide unavailable features
2. **Explain why access is denied** - Provide helpful messages
3. **Guide users to alternatives** - Suggest other actions they can take
4. **Maintain UI consistency** - Keep the same layout even with limited features

```javascript
function setupProductActionMenu(permissions) {
  const actionMenu = document.getElementById('product-actions');
  actionMenu.innerHTML = '';

  // View button - always visible
  const viewBtn = createButton('View', 'view-btn', () => viewProduct());
  actionMenu.appendChild(viewBtn);

  if (permissions.canEdit) {
    // Edit button - only visible with edit permission
    const editBtn = createButton('Edit', 'edit-btn', () => editProduct());
    actionMenu.appendChild(editBtn);
  } else {
    // Suggestion button - offer alternative
    const suggestBtn = createButton('Suggest Edit', 'suggest-btn', () => suggestEdit());
    actionMenu.appendChild(suggestBtn);
  }

  if (permissions.canDelete) {
    // Delete button - only visible with delete permission
    const deleteBtn = createButton('Delete', 'delete-btn', () => deleteProduct());
    actionMenu.appendChild(deleteBtn);
  }
}
```

By following these integration patterns, you can effectively incorporate the User Roles and Permissions system into your components and ensure consistent permission handling throughout the Recovery Essentials admin dashboard.
