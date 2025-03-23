# User Roles and Permissions: Administrator's Guide

This guide explains the built-in user roles in the Recovery Essentials admin dashboard, what each role can do, and how to manage users and roles effectively.

## Built-in Roles Overview

The Recovery Essentials admin dashboard includes five built-in roles, each designed for different levels of responsibility:

| Role | Purpose | Use For |
|------|---------|---------|
| Administrator | Complete system access | Site owners and top-level managers |
| Editor | Content management across the site | Content managers and senior editors |
| Author | Creating and managing own content | Blog writers and contributors |
| Affiliate Manager | Managing affiliate links and analytics | Marketing team members |
| Viewer | Read-only access to dashboard | Stakeholders who need visibility |

## Role Capabilities

### Administrator

Administrators have full access to all features of the admin dashboard.

**Can do:**
- Manage all users and roles
- Create, edit, and delete any content
- Manage site navigation and structure
- Configure site settings
- Manage templates, tags, and categories
- View all analytics and reports
- Access all areas of the dashboard

**Cannot do:**
- (No restrictions)

**When to use:** Assign Administrator role to site owners, webmasters, and top-level management only. Due to their complete access, the number of Administrator accounts should be limited.

### Editor

Editors can manage content across the site but cannot manage users or system settings.

**Can do:**
- Create, edit, and delete any blog posts
- Manage products and product information
- Edit site navigation
- Manage tags and categories
- Create and use content templates
- View analytics and reports

**Cannot do:**
- Manage users or roles
- Change system settings
- Access certain administrative features

**When to use:** Assign Editor role to content managers, senior editors, and team leaders who need broad control over content but shouldn't manage users or system settings.

### Author

Authors can create their own content and edit only what they've created.

**Can do:**
- Create new blog posts
- Edit and delete their own blog posts
- Use existing content templates
- View basic analytics and reports

**Cannot do:**
- Edit or delete other users' content
- Manage products
- Edit site navigation
- Change tags or categories
- Manage templates
- Access administrative features

**When to use:** Assign Author role to regular content contributors, blog writers, and freelancers who should only manage their own content.

### Affiliate Manager

Affiliate Managers focus on managing affiliate links and tracking performance.

**Can do:**
- Manage affiliate links and programs
- View analytics related to affiliates
- Track conversion metrics
- View basic dashboard information

**Cannot do:**
- Edit blog posts or products (unless specifically granted)
- Manage site structure
- Change system settings
- Manage users

**When to use:** Assign Affiliate Manager role to marketing team members, affiliate coordinators, and those responsible for monetization who need focused access to affiliate features.

### Viewer

Viewers have read-only access to the dashboard.

**Can do:**
- View dashboard statistics
- Access analytics and reports
- See content (but not edit it)

**Cannot do:**
- Create, edit, or delete any content
- Change any settings
- Manage any aspect of the site

**When to use:** Assign Viewer role to stakeholders, clients, or team members who need visibility into site performance but shouldn't make changes.

## Managing Users

### Accessing User Management

1. Log in with an Administrator account
2. Click on the "Users" link in the admin navigation menu
3. You'll see the User Management page with:
   - Statistics about users
   - List of current users
   - Controls to add, edit, and delete users

### Adding a New User

1. Click the "Add New User" button at the top of the User Management page
2. Fill in the required information:
   - **Name**: The user's full name
   - **Email**: A valid email address that will serve as their login
   - **Password**: A secure initial password (users can change this later)
   - **Role**: Select the appropriate role from the dropdown menu
3. Click "Create User" to add the new account

### Editing a User

1. Locate the user in the users list
2. Click the "Edit" button for that user
3. You can modify:
   - The user's name
   - Their email address
   - Their assigned role
   - Their password (leave blank to keep current password)
4. Click "Update User" to save changes

### Deleting a User

1. Locate the user in the users list
2. Click the "Delete" button for that user
3. Confirm the deletion when prompted
4. The user account will be permanently removed

**Note:** You cannot delete your own account. This is a safety measure to prevent administrators from accidentally locking themselves out of the system.

## Managing Roles

### Accessing Role Management

1. Log in with an Administrator account
2. Click on the "Users" link in the admin navigation menu
3. Scroll down to the "Role Management" section
4. Here you'll see the list of existing roles

### Viewing Role Permissions

1. Locate the role in the roles list
2. Click "View Permissions" to see what this role can do
3. A modal will appear showing:
   - Role name and description
   - Complete list of permissions granted to this role

### Creating a Custom Role

You can create custom roles with specific permissions beyond the built-in ones:

1. Click the "Add Custom Role" button in the Role Management section
2. Fill in the role details:
   - **Role Name**: A clear, descriptive name
   - **Description**: Explain what this role is for
   - **Permissions**: Check the boxes for permissions this role should have
3. Click "Create Role" to add the new role

**Example use case:** You might create a "Product Manager" role that can only manage products but not blog posts, or a "Blog Editor" role that can edit any blog post but not publish them.

### Editing a Role

1. Find the custom role in the roles list
2. Click the "Edit" button for that role
3. Modify the name, description, or permissions
4. Click "Update Role" to save changes

**Note:** You cannot edit the built-in roles (Administrator, Editor, Author, Affiliate Manager, Viewer). This ensures system stability and consistent behavior.

### Deleting a Role

1. Locate the custom role in the roles list
2. Click the "Delete" button for that role
3. Confirm the deletion when prompted

**Important limitations:**
- You cannot delete built-in roles
- You cannot delete a role that has users assigned to it

If you need to delete a role that has users, reassign those users to different roles first.

## Best Practices for Role Management

### Security Recommendations

1. **Principle of Least Privilege**: Give users only the permissions they absolutely need to do their job
2. **Limit Administrator Accounts**: Keep the number of Administrator accounts to a minimum
3. **Regular Audit**: Periodically review user accounts and their assigned roles
4. **Role-Based Organization**: Organize users by role rather than giving individual permissions
5. **Remove Inactive Users**: Delete or deactivate accounts for users who no longer need access

### Workflow Recommendations

1. **Start Restrictive**: Begin by assigning more restrictive roles, then elevate privileges if needed
2. **Use Custom Roles**: Create specialized roles for specific job functions rather than using broader roles
3. **Document Role Assignments**: Keep track of which users have which roles and why
4. **Test Access**: After assigning roles, verify users can access what they need (and can't access what they shouldn't)
5. **Train Users**: Ensure users understand what they can and cannot do with their assigned roles

## Common Scenarios

### Content Team Setup

For a typical content team:

- **Content Director**: Administrator or Editor role
- **Senior Writers**: Editor role
- **Staff Writers**: Author role
- **Freelancers**: Author role
- **Marketing Team**: Affiliate Manager role
- **Clients/Stakeholders**: Viewer role

### Adding Temporary Access

For temporary contractors or consultants:

1. Create an account with the most restrictive role that meets their needs (typically Author or Viewer)
2. Set a calendar reminder to review/remove access after their contract ends
3. Delete the account when access is no longer needed

### Changing User Responsibilities

When a user's job changes:

1. Edit the user account
2. Assign the new appropriate role
3. Inform the user of their new permissions
4. Consider whether a custom role would better fit their specific needs

## Troubleshooting Role Issues

### User Cannot Access Feature

If a user reports they cannot access a feature they need:

1. Check their current role in the User Management page
2. View the permissions for that role
3. Determine if they should have access based on their role
4. Either:
   - Assign them a role with the needed permission, or
   - Create a custom role that includes just the permissions they need

### Too Many Administrator Accounts

If you notice too many Administrator accounts:

1. Audit all Administrator users
2. Determine the actual needs of each user
3. Create appropriate custom roles if needed
4. Downgrade users to the most appropriate role that matches their responsibilities

### Custom Role Management

If you need to reorganize your custom roles:

1. Create the new roles before deleting old ones
2. Make a list of all users on each role you plan to remove
3. Reassign users to the new roles
4. Only then delete the unused custom roles

## Role Management FAQ

**Q: Can I have multiple administrators?**
A: Yes, but for security reasons, limit the number of administrator accounts to only those who absolutely need full system access.

**Q: What happens to content when I delete a user?**
A: Content created by users remains in the system even after their account is deleted. It will not be automatically removed.

**Q: Can a user have multiple roles?**
A: No, each user can only have one role. For users with complex needs, create a custom role that includes all required permissions.

**Q: How do I temporarily disable a user without deleting them?**
A: Currently, you need to delete users you want to disable. As a workaround, you could reassign them to a Viewer role to restrict their access without removing their account.

**Q: What should I do if none of the built-in roles fit my needs?**
A: Create a custom role with exactly the permissions you need. This is better than giving users broader access than necessary through a built-in role.

**Q: Can I rename the built-in roles?**
A: No, the built-in role names are fixed. However, you can create custom roles with any names you prefer.

## Summary of Permissions

| Permission | Administrator | Editor | Author | Affiliate Manager | Viewer |
|------------|:-------------:|:------:|:------:|:-----------------:|:------:|
| Manage users | ✓ | ✗ | ✗ | ✗ | ✗ |
| Manage roles | ✓ | ✗ | ✗ | ✗ | ✗ |
| Manage products | ✓ | ✓ | ✗ | ✗ | ✗ |
| Manage blog | ✓ | ✓ | ✗ | ✗ | ✗ |
| Create blog posts | ✓ | ✓ | ✓ | ✗ | ✗ |
| Edit own blog posts | ✓ | ✓ | ✓ | ✗ | ✗ |
| Manage navigation | ✓ | ✓ | ✗ | ✗ | ✗ |
| Manage affiliate links | ✓ | ✗ | ✗ | ✓ | ✗ |
| Manage settings | ✓ | ✗ | ✗ | ✗ | ✗ |
| Manage tags/categories | ✓ | ✓ | ✗ | ✗ | ✗ |
| Manage templates | ✓ | ✓ | ✗ | ✗ | ✗ |
| Use templates | ✓ | ✓ | ✓ | ✗ | ✗ |
| View dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| View analytics | ✓ | ✓ | ✓ | ✓ | ✓ |

This table provides a quick reference for which permissions are included with each built-in role.
