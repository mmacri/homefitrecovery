# Navigation Management

This document explains how to manage the navigation categories and menus for the Recovery Essentials website using the admin dashboard.

## Overview

The Navigation Management system allows you to:

1. Create, edit, and delete navigation categories
2. Control the order of navigation items
3. Manage hierarchical navigation (parent-child relationships)
4. Update navigation on all front-end pages automatically

## Accessing Navigation Management

1. Log in to the admin dashboard
2. Click on "Navigation" in the sidebar or top navigation
3. The Navigation Management interface will load

## Navigation Interface Components

The Navigation Management interface consists of:

1. **Navigation Item Form**: Add or edit navigation items
2. **Navigation Structure Table**: View and manage the current navigation structure
3. **Preview**: See how the navigation will look on the front-end
4. **Apply Changes**: Update the front-end navigation

![Navigation Management Interface](https://ext.same-assets.com/1001010122/navigation-management.png)

## Managing Navigation Items

### Adding a New Navigation Item

1. In the Navigation Management section, make sure the form is in "Add New Item" mode
2. Fill out the following fields:
   - **Label**: The text displayed in the navigation menu (e.g., "Massage Guns")
   - **Slug**: URL-friendly version of the label (auto-generated if left blank)
   - **URL**: The page the link should navigate to
   - **Parent**: Select if this item should be a child of another item (for dropdowns)
   - **Show in Main Nav**: Toggle to show/hide in the main navigation
   - **Order**: Numeric position in the navigation (lower numbers appear first)
3. Click "Add Navigation Item"

```javascript
// Example navigation item structure
{
    id: 'nav001',
    label: 'Massage Guns',
    slug: 'massage-guns',
    url: '/categories/massage-guns.html',
    parent: null,
    isMainNav: true,
    order: 1
}
```

### Editing an Existing Navigation Item

1. In the Navigation Structure Table, click "Edit" next to the item you want to modify
2. The form will be populated with the item's current data
3. Make your changes
4. Click "Update Navigation Item"

### Deleting a Navigation Item

1. In the Navigation Structure Table, click "Delete" next to the item you want to remove
2. Confirm the deletion in the dialog
3. If the item has children, you'll be asked if you want to:
   - Delete the children as well
   - Move the children up to the parent level
   - Assign the children to a different parent

### Changing Navigation Order

You can change the order of navigation items in two ways:

1. **Using the Order Field**:
   - Edit the item
   - Change the "Order" value
   - Update the item

2. **Using the Up/Down Buttons**:
   - In the Navigation Structure Table, use the arrow buttons to move items up or down
   - Changes take effect immediately

## Managing Hierarchical Navigation

### Creating Dropdown Menus

To create a dropdown menu:

1. First, create the parent navigation item (main category)
2. Then, create child items by selecting the parent in the "Parent" dropdown
3. Child items will appear nested under their parent in the Navigation Structure Table

Example structure:
```
Massage Guns (parent)
  ├── Professional (child)
  ├── Home Use (child)
  └── Travel (child)
```

### Reordering Items Within a Dropdown

1. Edit the child item
2. Change its "Order" value
3. Update the item
4. The new order will be reflected in the dropdown

## Applying Navigation Changes to the Front-End

After making changes to the navigation structure, you need to apply them to the front-end:

1. Review your changes in the Preview section
2. Click "Apply Changes to Site" at the bottom of the page
3. The system will:
   - Generate the necessary HTML code
   - Update all front-end templates
   - Show a success message when complete

```javascript
// How navigation is applied to front-end
function saveNavigationToFrontend() {
    const navigationHtml = generateNavigationHtml();

    // Update all front-end template files
    const templates = [
        '../index.html',
        '../about.html',
        '../contact.html',
        '../blog/index.html'
        // ... other templates
    ];

    templates.forEach(template => {
        updateNavInTemplate(template, navigationHtml);
    });

    showNotification('Navigation updated on all pages', 'success');
}
```

## Technical Details

### Navigation HTML Structure

The generated navigation HTML follows this structure:

```html
<nav class="main-navigation">
    <ul class="nav-list">
        <li class="nav-item">
            <a href="/categories/massage-guns.html" class="nav-link">Massage Guns</a>
            <ul class="dropdown-menu">
                <li class="dropdown-item">
                    <a href="/categories/professional-massage-guns.html" class="dropdown-link">Professional</a>
                </li>
                <!-- Additional dropdown items -->
            </ul>
        </li>
        <!-- Additional nav items -->
    </ul>
</nav>
```

### Navigation Storage

Navigation data is stored using the `recoveryEssentials_navigation` key in localStorage. The data follows this structure:

```javascript
[
    {
        id: 'nav001',
        label: 'Massage Guns',
        slug: 'massage-guns',
        url: '/categories/massage-guns.html',
        parent: null,
        isMainNav: true,
        order: 1,
        children: [
            {
                id: 'nav002',
                label: 'Professional',
                slug: 'professional-massage-guns',
                url: '/categories/professional-massage-guns.html',
                parent: 'nav001',
                isMainNav: false,
                order: 1
            }
        ]
    },
    // Additional items
]
```

## Common Navigation Management Tasks

### Creating a New Category with Products Page

1. First, create a new HTML page for the category (e.g., `/categories/new-category.html`)
2. Add a navigation item pointing to this page
3. Set appropriate parent/child relationships
4. Apply changes to the front-end
5. Add products to this category through the Products Management section

### Reorganizing the Main Navigation

1. Edit each navigation item that needs to be reorganized
2. Change their "Order" values to reflect the desired order
3. Update the items
4. Preview the changes
5. Apply changes to the front-end

### Temporarily Hiding a Navigation Item

1. Edit the navigation item
2. Uncheck "Show in Main Nav"
3. Update the item
4. Apply changes to the front-end
5. The item will still exist but won't be visible in the navigation

### Creating a Mega Menu

For larger dropdown menus with multiple columns:

1. Create a parent navigation item
2. Add the "mega-menu" class to its CSS Class field
3. Create child items, using the "column" field to specify which column they should appear in
4. Apply changes to the front-end

## Troubleshooting

### Navigation Items Not Appearing

1. Check if "Show in Main Nav" is enabled
2. Verify the "Order" value isn't too high
3. For child items, make sure the parent item exists and is visible
4. Check that changes were applied to the front-end

### Front-End Navigation Not Updating

1. Make sure you clicked "Apply Changes to Site"
2. Check the browser console for any JavaScript errors
3. Verify that all template files are writable
4. Try refreshing the browser cache

### Dropdown Menus Not Working

1. Check that parent-child relationships are correctly set
2. Verify the CSS is being loaded
3. Check that JavaScript dropdown handlers are functioning
4. Try a different browser to rule out browser-specific issues

## Best Practices

1. **Use Clear Labels**: Keep navigation labels short and descriptive
2. **Limit Dropdown Depth**: Avoid more than one level of dropdowns for better usability
3. **Maintain Consistency**: Use similar naming conventions across the navigation
4. **Consider Mobile**: Ensure navigation is usable on mobile devices
5. **Regular Backups**: Export navigation data regularly as a backup

By following these guidelines, you can effectively manage the navigation structure of your Recovery Essentials website, ensuring users can easily find all content.
