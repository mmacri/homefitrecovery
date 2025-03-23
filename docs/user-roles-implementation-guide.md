# User Roles and Permissions: Implementation Guide

This guide provides practical implementation instructions for developers who need to add user role and permission functionality to new or existing features in the Recovery Essentials admin dashboard.

## Quick Start

### Step 1: Include Required Dependencies

Ensure these scripts are included in your HTML in this order:

```html
<script src="js/user-roles.js"></script>
<script src="js/auth.js"></script>
```

### Step 2: Get Current User and Check Permissions

```javascript
// Get current user from auth
const authData = JSON.parse(localStorage.getItem('recoveryEssentials_auth') || '{"user":{}}');
const currentUser = authData.user;

// Basic permission check
if (UserRoles.hasPermission(currentUser, 'manage_products')) {
  // User can manage products
  showProductManagementUI();
}
```

### Step 3: Guard UI Elements

```javascript
// Hide or show elements based on permissions
document.querySelectorAll('[data-requires-permission]').forEach(element => {
  const requiredPermission = element.dataset.requiresPermission;
  if (!UserRoles.hasPermission(currentUser, requiredPermission)) {
    element.style.display = 'none'; // Or disable the element
  }
});
```

## Implementation Checklist

When implementing user roles in a new feature, follow this checklist:

- [ ] Define required permissions in `user-roles.js`
- [ ] Add permissions to appropriate roles
- [ ] Update UI access map if adding navigation items
- [ ] Implement permission checks in UI components
- [ ] Add fallbacks for users without required permissions
- [ ] Test with different user roles
- [ ] Document permission requirements

## Common Implementation Patterns

### Permission-Based Navigation

To add a new navigation item with permission control:

1. Add the item to `index.html`:

```html
<a href="#" class="flex items-center px-4 py-2 text-gray-300 rounded-md hover:bg-gray-700"
   onclick="loadContent('my-feature.html')" data-section="my_feature">
  <i class="fas fa-star mr-3"></i>
  My Feature
</a>
```

2. Update the `UI_ACCESS_MAP` in `user-roles.js`:

```javascript
const UI_ACCESS_MAP = {
  // Existing items...
  my_feature: ['manage_my_feature', 'view_my_feature']
};
```

3. Define the required permissions in `PERMISSION_DESCRIPTIONS`:

```javascript
const PERMISSION_DESCRIPTIONS = {
  // Existing permissions...
  manage_my_feature: 'Manage my feature',
  view_my_feature: 'View my feature'
};
```

4. Add the permissions to appropriate roles:

```javascript
const ROLE_DEFINITIONS = {
  admin: {
    // ...
    permissions: [
      // Existing permissions...
      'manage_my_feature',
      'view_my_feature'
    ]
  },
  // Update other roles as needed
};
```

### Permission-Aware Form

To create a form with field-level permissions:

```html
<form id="product-form">
  <div class="form-group">
    <label for="product-name">Product Name</label>
    <input type="text" id="product-name" name="name" required>
  </div>

  <div class="form-group" data-requires-permission="manage_pricing">
    <label for="product-price">Price</label>
    <input type="number" id="product-price" name="price">
  </div>

  <div class="form-group" data-requires-permission="manage_inventory">
    <label for="product-stock">Stock Level</label>
    <input type="number" id="product-stock" name="stock">
  </div>

  <div class="actions">
    <button type="submit" id="save-btn">Save</button>
    <button type="button" id="delete-btn" data-requires-permission="manage_products">Delete</button>
  </div>
</form>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('recoveryEssentials_auth')).user;

    // Hide fields based on permissions
    document.querySelectorAll('[data-requires-permission]').forEach(element => {
      const permission = element.dataset.requiresPermission;
      if (!UserRoles.hasPermission(currentUser, permission)) {
        element.style.display = 'none';
      }
    });

    // Set up form submission handler
    document.getElementById('product-form').addEventListener('submit', function(e) {
      e.preventDefault();

      // Check permission before saving
      if (!UserRoles.hasPermission(currentUser, 'edit_products')) {
        showNotification('You do not have permission to edit products', 'error');
        return;
      }

      // Proceed with save
      saveProduct();
    });
  });
</script>
```

### Permission-Based Data Loading

When loading data, filter based on user permissions:

```javascript
function loadBlogPosts() {
  const currentUser = JSON.parse(localStorage.getItem('recoveryEssentials_auth')).user;

  // Get all blog posts
  const allPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');

  // Filter based on permissions
  let visiblePosts;

  if (UserRoles.hasPermission(currentUser, 'manage_blog')) {
    // Admins and editors see all posts
    visiblePosts = allPosts;
  } else if (UserRoles.hasPermission(currentUser, 'edit_own_blog')) {
    // Authors see their own posts and published posts
    visiblePosts = allPosts.filter(post =>
      post.authorId === currentUser.id || post.status === 'published'
    );
  } else {
    // Viewers see only published posts
    visiblePosts = allPosts.filter(post => post.status === 'published');
  }

  // Render posts
  renderPosts(visiblePosts);
}
```

### Permission Checking in Features

Here's how to integrate permission checks into your feature's code:

```javascript
class ProductManager {
  constructor() {
    this.currentUser = JSON.parse(localStorage.getItem('recoveryEssentials_auth')).user;
    this.permissions = this.getUserPermissions();
    this.initialize();
  }

  getUserPermissions() {
    return {
      canView: UserRoles.hasPermission(this.currentUser, 'view_products'),
      canEdit: UserRoles.hasPermission(this.currentUser, 'edit_products'),
      canDelete: UserRoles.hasPermission(this.currentUser, 'manage_products'),
      canManagePricing: UserRoles.hasPermission(this.currentUser, 'manage_pricing')
    };
  }

  initialize() {
    // Set up UI based on permissions
    this.setupUI();

    // Load data
    this.loadProducts();

    // Set up event handlers
    this.attachEventHandlers();
  }

  setupUI() {
    // Show/hide UI elements based on permissions
    if (!this.permissions.canEdit) {
      document.getElementById('add-product-btn').style.display = 'none';
    }

    if (!this.permissions.canManagePricing) {
      document.querySelectorAll('.price-edit-control').forEach(el => {
        el.style.display = 'none';
      });
    }
  }

  attachEventHandlers() {
    // Add event handlers with permission checks
    const addButton = document.getElementById('add-product-btn');
    if (addButton) {
      addButton.addEventListener('click', () => {
        if (this.permissions.canEdit) {
          this.openProductForm();
        } else {
          showNotification('You do not have permission to add products', 'error');
        }
      });
    }
  }

  editProduct(productId) {
    // Permission check before action
    if (!this.permissions.canEdit) {
      showNotification('You do not have permission to edit products', 'error');
      return;
    }

    // Proceed with edit
    this.openProductForm(productId);
  }

  deleteProduct(productId) {
    // Permission check before action
    if (!this.permissions.canDelete) {
      showNotification('You do not have permission to delete products', 'error');
      return;
    }

    // Confirm deletion
    if (confirm('Are you sure you want to delete this product?')) {
      // Proceed with deletion
      this.performDeleteProduct(productId);
    }
  }
}

// Initialize the product manager
document.addEventListener('DOMContentLoaded', function() {
  new ProductManager();
});
```

## Page-Level Permission Enforcement

For standalone pages, implement this pattern to enforce permissions:

```html
<!-- my-feature.html -->
<div class="feature-container">
  <h2>My Feature</h2>

  <div id="feature-content" style="display: none;">
    <!-- Feature content goes here -->
  </div>

  <div id="access-denied" style="display: none;">
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      <strong>Access Denied!</strong> You don't have permission to access this feature.
    </div>
  </div>

  <script>
    (function() {
      // Check permissions
      const authData = JSON.parse(localStorage.getItem('recoveryEssentials_auth') || '{"user":{}}');
      const currentUser = authData.user;

      // Define required permission
      const requiredPermission = 'manage_my_feature';

      // Check permission
      if (window.UserRoles && UserRoles.hasPermission(currentUser, requiredPermission)) {
        // Show content
        document.getElementById('feature-content').style.display = 'block';
        initializeFeature();
      } else {
        // Show access denied
        document.getElementById('access-denied').style.display = 'block';
      }

      function initializeFeature() {
        // Initialize feature code here
      }
    })();
  </script>
</div>
```

## Working with Owner-Based Permissions

For features where users need to edit their own content:

```javascript
function loadContentForEdit(contentId) {
  const authData = JSON.parse(localStorage.getItem('recoveryEssentials_auth') || '{"user":{}}');
  const currentUser = authData.user;

  // Get the content
  const content = getContentById(contentId);

  // Check if user can edit this content
  const canManageAll = UserRoles.hasPermission(currentUser, 'manage_content');
  const canEditOwn = UserRoles.hasPermission(currentUser, 'edit_own_content');
  const isOwner = content.authorId === currentUser.id;

  if (canManageAll || (canEditOwn && isOwner)) {
    // User can edit, show editor
    openEditor(content);
  } else {
    // User cannot edit, show view-only version
    showViewOnly(content);
    showNotification('You do not have permission to edit this content', 'warning');
  }
}
```

## Adding a New User Role

To create a new user role:

1. Add the role definition in `user-roles.js`:

```javascript
// Add a new role
window.UserRoles.createRole('social_media_manager', {
  name: 'Social Media Manager',
  description: 'Can manage social media content and posts',
  permissions: [
    'view_dashboard',
    'view_analytics',
    'create_blog',
    'edit_own_blog',
    'manage_social_posts',
    'publish_social_content'
  ]
});
```

2. Use the admin UI to create the role, or add it programmatically:

```javascript
// Add a custom role to the roles storage
function addCustomRole() {
  const roles = JSON.parse(localStorage.getItem('recoveryEssentials_roles') || '{}');

  // Define new role
  roles['social_media_manager'] = {
    name: 'Social Media Manager',
    description: 'Can manage social media content and posts',
    permissions: [
      'view_dashboard',
      'view_analytics',
      'create_blog',
      'edit_own_blog',
      'manage_social_posts',
      'publish_social_content'
    ],
    custom: true
  };

  // Save updated roles
  localStorage.setItem('recoveryEssentials_roles', JSON.stringify(roles));
}
```

## Testing Permission Configurations

Use this helper function to test how different roles see your UI:

```javascript
// Test helper: temporarily switch roles for testing
function temporarilyAssumeRole(roleId, callback) {
  // Save current auth data
  const originalAuth = localStorage.getItem('recoveryEssentials_auth');
  const authData = JSON.parse(originalAuth || '{"user":{}}');

  if (!authData.user) {
    console.error('No authenticated user found');
    return;
  }

  // Switch role temporarily
  const originalRole = authData.user.role;
  authData.user.role = roleId;
  localStorage.setItem('recoveryEssentials_auth', JSON.stringify(authData));

  // Execute callback
  try {
    callback();
  } finally {
    // Restore original role
    if (originalAuth) {
      localStorage.setItem('recoveryEssentials_auth', originalAuth);
    }
  }
}

// Usage
function testAllRoles() {
  const rolesToTest = ['admin', 'editor', 'author', 'viewer'];

  rolesToTest.forEach(role => {
    console.log(`Testing UI as role: ${role}`);
    temporarilyAssumeRole(role, () => {
      // Refresh UI or perform test actions
      refreshUI();

      // You could take screenshots here or log visible elements
      console.log('Visible elements:',
        Array.from(document.querySelectorAll('.action-btn'))
          .filter(el => el.offsetParent !== null)
          .map(el => el.textContent)
      );
    });
  });
}
```

## Debugging Permissions

Use these helpers to debug permission issues:

```javascript
// Debug helper: Check why a user can't access something
function debugPermissions(user, requiredPermission) {
  console.group('Permission Debugging');

  console.log('User:', user);
  console.log('Required permission:', requiredPermission);

  // Get user role
  const roleId = user.role;
  console.log('User role:', roleId);

  // Get role definition
  const role = UserRoles.getRole(roleId);
  console.log('Role definition:', role);

  // Check if permission exists in role
  const hasPermission = role && role.permissions && role.permissions.includes(requiredPermission);
  console.log('Has required permission:', hasPermission);

  // List all permissions user has
  const allPermissions = UserRoles.getUserPermissions(user);
  console.log('All user permissions:', allPermissions);

  console.groupEnd();

  return hasPermission;
}

// Usage
const user = JSON.parse(localStorage.getItem('recoveryEssentials_auth')).user;
debugPermissions(user, 'manage_products');
```

## Performance Optimization

For pages with many permission checks, use this pattern:

```javascript
function initializeWithPermissions() {
  const currentUser = JSON.parse(localStorage.getItem('recoveryEssentials_auth')).user;

  // Cache all permission checks at initialization
  const permissions = {};

  // Add needed permissions to the cache
  ['view_products', 'edit_products', 'manage_products', 'manage_pricing']
    .forEach(permission => {
      permissions[permission] = UserRoles.hasPermission(currentUser, permission);
    });

  // Add composite permissions
  permissions.canDeleteProduct = permissions.manage_products;
  permissions.canEditPrice = permissions.manage_pricing || permissions.manage_products;
  permissions.isAdmin = UserRoles.hasPermission(currentUser, 'manage_users');

  // Use the cached permissions
  setupUI(permissions);

  return permissions;
}

function setupUI(permissions) {
  // Use the cached permissions for all UI elements
  if (permissions.canEditPrice) {
    enablePriceEditing();
  }

  if (permissions.canDeleteProduct) {
    enableDeleteButtons();
  }

  if (permissions.isAdmin) {
    showAdminControls();
  }
}
```

## Error Handling Best Practices

Implement consistent error handling for permission failures:

```javascript
function attemptAction(action, requiredPermission, ...args) {
  const currentUser = JSON.parse(localStorage.getItem('recoveryEssentials_auth')).user;

  // Check permission
  if (!UserRoles.hasPermission(currentUser, requiredPermission)) {
    // Handle permission error
    const errorMessages = {
      'manage_products': 'You need administrator or editor permissions to manage products',
      'manage_blog': 'You need administrator or editor permissions to manage blog posts',
      'publish_content': 'You need publisher permissions to publish content'
      // Add more custom messages as needed
    };

    const message = errorMessages[requiredPermission] ||
                   `You don't have permission to ${action.replace(/([A-Z])/g, ' $1').toLowerCase()}`;

    showNotification(message, 'error');

    // Log the attempt for security auditing
    console.warn('Permission denied:', {
      user: currentUser.id,
      action,
      requiredPermission,
      timestamp: new Date()
    });

    return false;
  }

  // Permission granted, execute action function with arguments
  return action(...args);
}

// Usage
function editProduct(productId) {
  return attemptAction(
    (id) => {
      // Implementation of product editing
      openProductEditor(id);
      return true;
    },
    'edit_products',
    productId
  );
}
```

## Building a Permission-Based UI

Complete example of building a UI with permission controls:

```javascript
class PermissionAwareUI {
  constructor(containerId, requiredPermission) {
    this.container = document.getElementById(containerId);
    this.requiredPermission = requiredPermission;
    this.currentUser = JSON.parse(localStorage.getItem('recoveryEssentials_auth')).user;
  }

  render() {
    if (!this.container) return false;

    // Check base permission
    if (!UserRoles.hasPermission(this.currentUser, this.requiredPermission)) {
      this.renderAccessDenied();
      return false;
    }

    // Render main UI
    this.renderContent();
    return true;
  }

  renderAccessDenied() {
    this.container.innerHTML = `
      <div class="access-denied bg-red-100 border border-red-400 text-red-700 p-4 rounded">
        <h3 class="font-bold">Access Denied</h3>
        <p>You don't have permission to access this feature.</p>
        <p>Please contact an administrator if you need access.</p>
      </div>
    `;
  }

  renderContent() {
    // Implement in subclass
  }

  hasPermission(permission) {
    return UserRoles.hasPermission(this.currentUser, permission);
  }

  hasAnyPermission(permissions) {
    return UserRoles.hasAnyPermission(this.currentUser, permissions);
  }
}

// Example implementation
class ProductManagementUI extends PermissionAwareUI {
  constructor() {
    super('product-management-container', 'view_products');
    this.products = [];
  }

  async renderContent() {
    await this.loadProducts();

    this.container.innerHTML = `
      <div class="header flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Product Management</h2>
        ${this.hasPermission('edit_products') ?
          `<button id="add-product-btn" class="bg-blue-500 text-white px-4 py-2 rounded">
            Add Product
          </button>` : ''}
      </div>

      <div class="product-list">
        ${this.renderProductList()}
      </div>
    `;

    this.attachEventListeners();
  }

  renderProductList() {
    if (this.products.length === 0) {
      return `<p class="text-gray-500">No products found.</p>`;
    }

    return `
      <table class="w-full border-collapse">
        <thead>
          <tr>
            <th class="text-left p-2 border-b">Name</th>
            <th class="text-left p-2 border-b">Category</th>
            <th class="text-left p-2 border-b">Price</th>
            ${this.hasPermission('edit_products') ?
              `<th class="text-left p-2 border-b">Actions</th>` : ''}
          </tr>
        </thead>
        <tbody>
          ${this.products.map(product => this.renderProductRow(product)).join('')}
        </tbody>
      </table>
    `;
  }

  renderProductRow(product) {
    return `
      <tr>
        <td class="p-2 border-b">${product.name}</td>
        <td class="p-2 border-b">${product.category}</td>
        <td class="p-2 border-b">$${product.price.toFixed(2)}</td>
        ${this.hasPermission('edit_products') ?
          `<td class="p-2 border-b flex space-x-2">
            <button class="edit-btn text-blue-500" data-id="${product.id}">Edit</button>
            ${this.hasPermission('manage_products') ?
              `<button class="delete-btn text-red-500" data-id="${product.id}">Delete</button>` : ''}
          </td>` : ''}
      </tr>
    `;
  }

  async loadProducts() {
    // In a real implementation, this would be an API call
    this.products = JSON.parse(localStorage.getItem('products') || '[]');
  }

  attachEventListeners() {
    const addBtn = document.getElementById('add-product-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.addProduct());
    }

    this.container.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.dataset.id;
        this.editProduct(productId);
      });
    });

    this.container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.dataset.id;
        this.deleteProduct(productId);
      });
    });
  }

  addProduct() {
    if (!this.hasPermission('edit_products')) {
      showNotification('You do not have permission to add products', 'error');
      return;
    }

    // Implementation of product addition
    console.log('Adding new product');
  }

  editProduct(productId) {
    if (!this.hasPermission('edit_products')) {
      showNotification('You do not have permission to edit products', 'error');
      return;
    }

    // Implementation of product editing
    console.log('Editing product:', productId);
  }

  deleteProduct(productId) {
    if (!this.hasPermission('manage_products')) {
      showNotification('You do not have permission to delete products', 'error');
      return;
    }

    // Implementation of product deletion
    console.log('Deleting product:', productId);
  }
}

// Usage
document.addEventListener('DOMContentLoaded', function() {
  const ui = new ProductManagementUI();
  ui.render();
});
```

By following these implementation patterns, you can consistently apply permission-based access control throughout the Recovery Essentials admin dashboard.
