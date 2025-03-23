# User Roles and Permissions Guide

This guide provides detailed information about the User Roles and Permissions system in the Recovery Essentials admin dashboard.

## Overview

The User Roles and Permissions system controls access to different features of the admin dashboard. It allows you to:

- Create custom user roles with specific permissions
- Assign roles to users
- Control access to admin dashboard features
- Implement granular permission checks in the interface

## Built-in Roles

The system comes with five built-in roles, each with a predefined set of permissions:

### Administrator

Administrators have full access to all features of the dashboard.

**Permissions:**
- Manage users and roles
- Manage products
- Manage blog content
- Manage website navigation
- Manage affiliate links
- Manage site settings
- Manage tags and categories
- Manage content templates
- View analytics

### Editor

Editors can manage content but not users or system settings.

**Permissions:**
- Manage blog content
- Manage products
- Manage website navigation
- Manage tags and categories
- Manage content templates
- View analytics

### Author

Authors can create and edit their own content.

**Permissions:**
- Create blog posts
- Edit their own blog posts
- Use content templates
- View analytics

### Affiliate Manager

Affiliate managers can manage affiliate links and view analytics.

**Permissions:**
- Manage affiliate links
- View analytics

### Viewer

Viewers have read-only access to the dashboard.

**Permissions:**
- View dashboard
- View analytics

## Creating Custom Roles

You can create custom roles with specific permissions:

1. Go to the **Users** page in the admin dashboard
2. Scroll down to the **Role Management** section
3. Click **Add Custom Role**
4. Enter a name and description for the role
5. Select the permissions you want to grant to this role
6. Click **Create Role**

## Managing Users

### Adding Users

1. Go to the **Users** page in the admin dashboard
2. Click **Add New User**
3. Fill in the user's name, email, and password
4. Select a role for the user
5. Click **Create User**

### Editing Users

1. Go to the **Users** page
2. Find the user you want to edit
3. Click **Edit**
4. Update the user's information
5. Click **Update User**

### Deleting Users

1. Go to the **Users** page
2. Find the user you want to delete
3. Click **Delete**
4. Confirm the deletion

**Note:** You cannot delete your own account.

## Understanding Permissions

### Core Permissions

| Permission | Description |
|------------|-------------|
| manage_users | Create, edit, and delete user accounts |
| manage_roles | Assign and manage user roles |
| manage_products | Create, edit, and delete products |
| manage_blog | Create, edit, and delete any blog posts |
| create_blog | Create new blog posts |
| edit_own_blog | Edit only blog posts created by this user |
| manage_navigation | Edit site navigation structure |
| manage_affiliate | Manage affiliate links and programs |
| manage_settings | Edit site settings and configurations |
| manage_tags_categories | Create and manage tags and categories |
| manage_templates | Create and manage content templates |
| use_templates | Use existing content templates |
| view_dashboard | View the admin dashboard |
| view_analytics | View site analytics and reports |

### Permission Checking

The system automatically checks permissions to determine:

1. Which navigation items are visible to a user
2. Which pages a user can access
3. Which actions a user can perform on a page

## Technical Implementation

The User Roles and Permissions system is implemented with the following components:

- **user-roles.js**: Defines roles, permissions, and access control functions
- **auth.js**: Integrates authentication with the permissions system
- **user-admin.js**: Provides the UI for managing users and roles
- **index.html**: Implements permission-based navigation filtering

## Best Practices

- **Principle of Least Privilege**: Give users only the permissions they need to perform their tasks
- **Role-Based Access**: Group permissions into logical roles rather than assigning individual permissions
- **Regular Auditing**: Periodically review user accounts and their assigned roles
- **Protect Admin Accounts**: Limit the number of users with the Administrator role

## Troubleshooting

### User Can't Access a Page

1. Check which role is assigned to the user
2. Verify that the role has the necessary permissions
3. If using a custom role, make sure it has all the required permissions for the page

### Missing Navigation Items

If a user reports that certain navigation items are missing:

1. This is likely due to permission restrictions
2. Check if their role has the necessary permissions
3. If they need access, either change their role or add the required permissions to their current role

### Unable to Delete a Role

You cannot delete a role if:
- It is a built-in role (Administrator, Editor, Author, Affiliate Manager, Viewer)
- There are users currently assigned to the role

Remove all users from the role first, then try deleting it again.

## Security Considerations

The User Roles and Permissions system adds a layer of security to your admin dashboard, but keep in mind:

- All permission checks happen on the client side in this implementation
- In a production environment, implement server-side permission checks as well
- Regularly update passwords and audit user accounts
- Consider implementing two-factor authentication for admin accounts
