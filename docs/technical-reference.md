# Technical Reference

This document provides an in-depth technical reference for the Recovery Essentials Admin Dashboard, including code structure, JavaScript architecture, data storage mechanisms, and function references.

## Code Structure

The admin dashboard follows a modular architecture with these key components:

```
recovery-site/
│── admin/
│   ├── index.html          # Main dashboard container
│   ├── products.html       # Products section template
│   ├── blog.html           # Blog section template
│   ├── affiliate.html      # Affiliate links template
│   ├── settings.html       # Settings template
│   ├── navigation.html     # Navigation manager template (NEW)
│   ├── js/
│   │   ├── admin.js           # Core admin functionality
│   │   ├── blog-admin.js      # Blog management
│   │   ├── affiliate-admin.js # Affiliate link management
│   │   ├── navigation-admin.js # Navigation management (NEW)
│   ├── css/
│   │   ├── styles.css         # Custom styles
```

## JavaScript Architecture

The dashboard uses a modular JavaScript architecture where:

1. **index.html** loads all main JavaScript files and contains core navigation
2. Each section has its own HTML template and dedicated JavaScript controller
3. Data is stored in localStorage (in demo mode) and can be migrated to a server API
4. JavaScript modules share a common notification and data management system

## Data Storage

### Storage Keys

```javascript
// Main data storage keys
const PRODUCTS_KEY = 'recoveryEssentials_products';
const BLOG_POSTS_KEY = 'recoveryEssentials_blogPosts';
const AFFILIATE_LINKS_KEY = 'recoveryEssentials_affiliateLinks';
const NAVIGATION_KEY = 'recoveryEssentials_navigation';
const SETTINGS_KEY = 'recoveryEssentials_settings';
```

### Data Models

#### Product Model

```javascript
{
    id: 'prod001',
    name: 'Theragun Pro',
    category: 'massage-guns',
    description: 'Professional-grade massage device...',
    price: 599.00,
    rating: 4.8,
    reviewCount: 245,
    imageUrl: 'https://example.com/theragun.jpg',
    affiliateLink: 'https://www.amazon.com/dp/B087MJ8VVW?tag=recoveryessentials-20',
    features: [
        'Powerful motor with 60lbs of force',
        'Ergonomic multi-grip design',
        'Smart app integration',
        '5 built-in speeds'
    ]
}
```

#### Blog Post Model

```javascript
{
    id: 'blog001',
    title: 'The Ultimate Foam Rolling Guide',
    slug: 'foam-rolling-guide',
    excerpt: 'Master the techniques of self-myofascial release...',
    content: 'Foam rolling is one of the most effective self-care techniques...',
    category: 'recovery-techniques',
    author: 'Dr. Sarah Johnson',
    publishDate: '2023-05-15',
    imageUrl: 'https://example.com/foam-rolling.jpg',
    tags: ['foam-rolling', 'recovery', 'flexibility'],
    status: 'published'
}
```

#### Affiliate Link Model

```javascript
{
    id: 'afl001',
    name: 'Theragun Pro - Amazon',
    productId: 'theragun-pro',
    productName: 'Theragun Pro',
    url: 'https://www.amazon.com/dp/B087MJ8VVW?tag=recoveryessentials-20',
    platform: 'amazon',
    commission: 4.5,
    tag: 'recoveryessentials-20',
    clicks: 68,
    conversions: 12
}
```

#### Navigation Model (New)

```javascript
{
    id: 'nav001',
    label: 'Massage Guns',
    slug: 'massage-guns',
    url: '/categories/massage-guns.html',
    order: 1,
    parent: null,
    isMainNav: true,
    children: [
        {
            id: 'nav002',
            label: 'Professional',
            slug: 'professional-massage-guns',
            url: '/categories/professional-massage-guns.html',
            order: 1,
            parent: 'nav001',
            isMainNav: false
        }
    ]
}
```

## Function Reference

### admin.js

| Function | Description | Parameters | Returns | Usage |
|---------|-------------|------------|---------|-------|
| `loadDemoProducts()` | Loads demo product data if no products exist | None | None | Called during initialization |
| `updateProductsTable()` | Refreshes the products table with current data | None | None | Called after any product operation and on page load |
| `handleFormSubmit(e)` | Processes product form submissions | `e` (Event) | None | Called when product form is submitted |
| `editProduct(productId)` | Populates form with product data for editing | `productId` (String) | None | Called when Edit button is clicked |
| `deleteProduct(productId)` | Removes a product from the catalog | `productId` (String) | None | Called when Delete button is clicked |
| `resetForm()` | Clears the product form | None | None | Called after submissions or when Cancel is clicked |
| `addFeatureField()` | Adds a new feature input field | None | None | Called when Add Feature button is clicked |
| `removeFeatureField(button)` | Removes a feature input field | `button` (Element) | None | Called when a feature's delete button is clicked |
| `showNotification(message, type)` | Displays a notification | `message` (String), `type` (String) | None | Called after operations to provide feedback |
| `validateForm()` | Validates form inputs | None | Boolean | Called before form submission |
| `toggleVisibility(elementId)` | Shows/hides an element | `elementId` (String) | None | Used for UI toggling |

### blog-admin.js

| Function | Description | Parameters | Returns | Usage |
|---------|-------------|------------|---------|-------|
| `loadBlogPosts()` | Loads blog posts from storage | None | None | Called during initialization |
| `bindBlogEvents()` | Sets up blog form event listeners | None | None | Called during initialization |
| `updateBlogPostsTable()` | Refreshes the blog posts table | None | None | Called after any blog operation and on page load |
| `handleBlogFormSubmit(e)` | Processes blog form submissions | `e` (Event) | None | Called when blog form is submitted |
| `editBlogPost(postId)` | Populates form with post data for editing | `postId` (String) | None | Called when Edit button is clicked |
| `deleteBlogPost(postId)` | Removes a blog post | `postId` (String) | None | Called when Delete button is clicked |
| `viewBlogPost(postId)` | Opens the public view of a post | `postId` (String) | None | Called when View button is clicked |
| `resetBlogForm()` | Clears the blog form | None | None | Called after submissions or when Cancel is clicked |
| `addTagField()` | Adds a new tag input field | None | None | Called when Add Tag button is clicked |
| `removeTagField(button)` | Removes a tag input field | `button` (Element) | None | Called when a tag's delete button is clicked |
| `createSlug(title)` | Generates a URL slug from a title | `title` (String) | String | Called when generating slugs for posts |
| `formatDate(dateString)` | Formats dates for display | `dateString` (String) | String | Used for date formatting in the UI |

### affiliate-admin.js

| Function | Description | Parameters | Returns | Usage |
|---------|-------------|------------|---------|-------|
| `loadAffiliateLinks()` | Loads affiliate links from storage | None | None | Called during initialization |
| `bindAffiliateEvents()` | Sets up affiliate form event listeners | None | None | Called during initialization |
| `updateAffiliateTable()` | Refreshes the affiliate links table | None | None | Called after any affiliate operation and on page load |
| `handleAffiliateFormSubmit(e)` | Processes affiliate form submissions | `e` (Event) | None | Called when affiliate form is submitted |
| `editAffiliateLink(linkId)` | Populates form with link data for editing | `linkId` (String) | None | Called when Edit button is clicked |
| `deleteAffiliateLink(linkId)` | Removes an affiliate link | `linkId` (String) | None | Called when Delete button is clicked |
| `resetAffiliateForm()` | Clears the affiliate form | None | None | Called after submissions or when Cancel is clicked |

### navigation-admin.js (New)

| Function | Description | Parameters | Returns | Usage |
|---------|-------------|------------|---------|-------|
| `loadNavigationItems()` | Loads navigation items from storage | None | None | Called during initialization |
| `bindNavigationEvents()` | Sets up navigation form event listeners | None | None | Called during initialization |
| `updateNavigationTable()` | Refreshes the navigation items table | None | None | Called after any navigation operation and on page load |
| `handleNavigationFormSubmit(e)` | Processes navigation form submissions | `e` (Event) | None | Called when navigation form is submitted |
| `editNavigationItem(itemId)` | Populates form with navigation item data | `itemId` (String) | None | Called when Edit button is clicked |
| `deleteNavigationItem(itemId)` | Removes a navigation item | `itemId` (String) | None | Called when Delete button is clicked |
| `resetNavigationForm()` | Clears the navigation form | None | None | Called after submissions or when Cancel is clicked |
| `updateNavigationOrder(itemId, direction)` | Changes the order of navigation items | `itemId` (String), `direction` (String) | None | Called when Up/Down buttons are clicked |
| `generateNavigationHtml()` | Creates HTML for front-end navigation | None | String | Called when updating navigation |
| `saveNavigationToFrontend()` | Updates navigation on the main site | None | None | Called after navigation changes |

## Data Flow Diagrams

### Product Management Flow

```
User Action → UI Event → Event Handler → Data Update → localStorage Update → UI Refresh
```

Example:
1. User clicks "Edit" on a product
2. `editProduct()` function is called
3. Form is populated with product data
4. User makes changes and submits
5. `handleFormSubmit()` processes the form
6. Product array is updated
7. `saveProducts()` updates localStorage
8. `updateProductsTable()` refreshes the UI

### Common Data Operations

**Create Operation:**
```javascript
function createItem(item) {
    items.push(item);
    saveItems();
    updateTable();
    showNotification('Item created successfully', 'success');
}
```

**Read Operation:**
```javascript
function getItem(id) {
    return items.find(item => item.id === id);
}
```

**Update Operation:**
```javascript
function updateItem(id, updatedItem) {
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
        items[index] = {...items[index], ...updatedItem};
        saveItems();
        updateTable();
        showNotification('Item updated successfully', 'success');
        return true;
    }
    return false;
}
```

**Delete Operation:**
```javascript
function deleteItem(id) {
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
        items.splice(index, 1);
        saveItems();
        updateTable();
        showNotification('Item deleted successfully', 'success');
        return true;
    }
    return false;
}
```

## Event Handling

The admin dashboard uses event delegation for efficient event handling:

```javascript
// Example of event delegation from the blog table
const blogTable = document.querySelector('#blog-table tbody');
if (blogTable) {
    blogTable.addEventListener('click', function(e) {
        const target = e.target.closest('a');
        if (!target) return;

        e.preventDefault();
        const postId = target.getAttribute('data-id');

        if (target.classList.contains('edit-post')) {
            editBlogPost(postId);
        } else if (target.classList.contains('delete-post')) {
            deleteBlogPost(postId);
        } else if (target.classList.contains('view-post')) {
            viewBlogPost(postId);
        }
    });
}
```

This pattern is used throughout the admin dashboard to handle user interactions with a minimal number of event listeners.

## Shared Utilities

Several utility functions are shared across modules:

```javascript
// Show notification
function showNotification(message, type) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });

    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Add to body
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

// Generate unique ID
function generateId(prefix) {
    return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`;
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}
```

These utilities help maintain consistency across the admin dashboard and reduce code duplication.
