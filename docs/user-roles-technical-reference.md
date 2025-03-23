# User Roles and Permissions: Technical Reference

This document provides a technical overview of the User Roles and Permissions system implemented in the Recovery Essentials admin dashboard.

## Architecture Overview

The User Roles and Permissions system consists of several interconnected components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   user-roles.js │    │     auth.js     │    │  user-admin.js  │
│                 │◄───┤                 │◄───┤                 │
│  Core Functions │    │  Authentication │    │  UI Management  │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                      │
         ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│                       Admin Dashboard                        │
│                                                             │
│  Permission-Based Navigation and Content Access Controls     │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. `user-roles.js`

This is the foundation of the permission system. It defines:

- Role types and their associated permissions
- Storage mechanisms for roles and users
- Permission checking functions
- User management functions

#### Key Data Structures

```javascript
// Role definition structure
{
  name: "Role Name",
  description: "Role Description",
  permissions: ["permission1", "permission2", "..."]
}

// User structure
{
  id: "unique_id",
  name: "User Name",
  email: "user@example.com",
  role: "role_id",
  created: timestamp,
  lastLogin: timestamp
}
```

#### Storage Implementation

The system uses `localStorage` for client-side storage:

- `recoveryEssentials_roles`: Stores all role definitions
- `recoveryEssentials_users`: Stores all user data

In a production environment, these would be replaced with server-side database storage, but the basic structure remains the same.

#### Key Functions

| Function | Purpose |
|----------|---------|
| `getAllRoles()` | Retrieves all defined roles |
| `getRole(roleId)` | Gets a specific role's definition |
| `hasPermission(user, permission)` | Checks if a user has a specific permission |
| `hasAnyPermission(user, permissions)` | Checks if a user has any of a set of permissions |
| `getAllUsers()` | Gets all user accounts |
| `saveUser(userId, userData)` | Creates or updates a user |
| `deleteUser(userId)` | Removes a user |
| `canAccessUISection(user, section)` | Determines if a user can access a UI section |

### 2. `auth.js`

This module handles authentication and integrates with the permissions system:

- User login and session management
- Password handling
- Session validation
- Permission checks during navigation

#### Session Structure

```javascript
// Auth session structure
{
  authenticated: true,
  token: "session_token",
  expires: timestamp,
  user: {
    id: "user_id",
    name: "User Name",
    email: "user@example.com",
    role: "role_id"
  }
}
```

#### Integration Points

- Initializes user-roles system during authentication
- Ensures user exists in the roles system
- Provides permission checking methods
- Handles user profile updates

### 3. `user-admin.js`

This module provides the UI for user and role management:

- User listing, creation, editing, deletion
- Role listing, creation, editing, deletion
- Permission assignment interface
- Form validation and error handling

## Permission System Details

### Permission Types

Permissions are string identifiers that represent specific capabilities:

| Permission | Controls Access To |
|------------|-------------------|
| `manage_users` | User management page and functions |
| `manage_roles` | Role management section and functions |
| `manage_products` | Product management features |
| `manage_blog` | Blog post creation and editing |
| `create_blog` | Creating new blog posts |
| `edit_own_blog` | Editing only user's own blog posts |
| `manage_navigation` | Navigation structure editing |
| `manage_affiliate` | Affiliate link management |
| `manage_settings` | Site settings |
| `manage_tags_categories` | Tags and categories management |
| `manage_templates` | Content template management |
| `use_templates` | Using existing content templates |
| `view_dashboard` | Basic dashboard access |
| `view_analytics` | Analytics reports viewing |

### Permission Checking Flow

When a user attempts to access a feature:

1. The system retrieves the current user's role from `authData.user.role`
2. It loads the role definition to get associated permissions
3. It checks if the required permission is in the user's permission list
4. Access is granted or denied based on this check

```javascript
// Example permission check flow
function checkAccess(requiredPermission) {
  const user = getCurrentUser();
  return UserRoles.hasPermission(user, requiredPermission);
}
```

### UI Access Mapping

The system maps UI sections to permissions in the `UI_ACCESS_MAP` constant:

```javascript
const UI_ACCESS_MAP = {
  dashboard: ['view_dashboard', 'view_analytics'],
  products: ['manage_products'],
  blog: ['manage_blog', 'create_blog', 'edit_own_blog'],
  // ... other mappings
};
```

This mapping is used to determine which navigation items should be visible to a user.

## Integration with Admin Dashboard

### Navigation Filtering

The `applyPermissionBasedNavigation()` function in `index.html` filters navigation items based on user permissions:

1. It retrieves the current user data
2. For each navigation link, it checks if the user has the required permissions
3. Links without proper permissions are hidden from the UI

### Page Access Control

The `checkPermissionForPage(page)` function prevents unauthorized page access:

1. When a user attempts to load a page, this function checks required permissions
2. If the user lacks permissions, an "Access Denied" message is displayed
3. This provides a second layer of protection beyond navigation hiding

### Dynamic Content Adaptation

Components can use permission checks to adapt their UI:

```javascript
// Example of dynamic UI adaptation based on permissions
if (UserRoles.hasPermission(currentUser, 'manage_users')) {
  // Show user management controls
}
```

## Security Considerations

### Client-Side Limitations

This implementation performs permission checks on the client side, which means:

1. It can prevent accidental access to features
2. It provides a good user experience by hiding inaccessible features
3. It is **not** sufficient for true security without server-side validation

### Production Enhancements

In a production environment, additional security measures should be implemented:

1. Server-side permission validation for all API endpoints
2. Secure password storage with proper hashing (bcrypt/Argon2)
3. CSRF protection for authentication endpoints
4. Rate limiting to prevent brute force attacks
5. Audit logging for access attempts

## Technical Scalability

### Adding New Permissions

To add a new permission:

1. Add the permission identifier to `PERMISSION_DESCRIPTIONS` in `user-roles.js`
2. Add the permission to appropriate roles in `ROLE_DEFINITIONS`
3. Update `UI_ACCESS_MAP` if the permission affects navigation
4. Implement permission checks in relevant UI components

### Extending Role System

To add new role functionality:

1. Add methods to the `UserRoles` object
2. Update the admin interface as needed to expose new functions
3. Make sure to maintain compatibility with existing role data

## Database Integration

The current implementation uses `localStorage`, but can be adapted to use a database:

1. Replace storage functions with API calls:
   ```javascript
   async function getAllUsers() {
     const response = await fetch('/api/users');
     return await response.json();
   }
   ```

2. Add authentication headers to all API requests:
   ```javascript
   headers: {
     'Authorization': `Bearer ${authData.token}`
   }
   ```

3. Implement corresponding server-side endpoints with proper validation

## Technical Debt and Considerations

### Current Limitations

1. Password storage is insecure in the demo implementation
2. All permission checks are client-side only
3. User sessions don't expire automatically without refresh
4. No conflict resolution for concurrent edits

### Future Improvements

1. Server-side permission enforcement
2. Two-factor authentication
3. Password policies and secure reset flow
4. Account lockout after failed attempts
5. Enhanced audit logging for security events
6. Role inheritance for more complex permission structures

## Code Examples

### Checking Multiple Permissions

```javascript
function canEditPage(page, user) {
  // User can edit if they're an admin or the page author
  return UserRoles.hasPermission(user, 'manage_blog') ||
         (UserRoles.hasPermission(user, 'edit_own_blog') && page.authorId === user.id);
}
```

### Dynamically Building a Permitted UI

```javascript
function buildActionButtons(user, itemData) {
  const actions = document.createElement('div');

  if (UserRoles.hasPermission(user, 'manage_products')) {
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => editItem(itemData.id));
    actions.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteItem(itemData.id));
    actions.appendChild(deleteBtn);
  } else if (UserRoles.hasPermission(user, 'view_products')) {
    const viewBtn = document.createElement('button');
    viewBtn.textContent = 'View Details';
    viewBtn.addEventListener('click', () => viewItem(itemData.id));
    actions.appendChild(viewBtn);
  }

  return actions;
}
```

## Debugging and Troubleshooting

### Common Issues

1. **Missing Navigation Items**
   - Check the user's role and permissions
   - Verify the `data-section` attribute matches the expected section in `UI_ACCESS_MAP`

2. **Access Denied Messages**
   - The user lacks the necessary permissions for the page
   - Check permission requirements in `checkPermissionForPage()`

3. **Cannot Create/Edit Users**
   - Ensure the current user has `manage_users` permission
   - Check for validation errors in form submission

### Debugging Techniques

1. Inspect the `localStorage` contents to view current roles and users:
   ```javascript
   console.log(JSON.parse(localStorage.getItem('recoveryEssentials_roles')));
   console.log(JSON.parse(localStorage.getItem('recoveryEssentials_users')));
   ```

2. Log permission checks:
   ```javascript
   console.log('User permissions:', UserRoles.getUserPermissions(currentUser));
   console.log('Has permission:', UserRoles.hasPermission(currentUser, 'manage_users'));
   ```

3. Verify role assignments:
   ```javascript
   console.log('User role:', currentUser.role);
   console.log('Role definition:', UserRoles.getRole(currentUser.role));
   ```
