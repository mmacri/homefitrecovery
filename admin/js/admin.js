/**
 * Recovery Essentials Admin Dashboard
 * This file handles the admin dashboard functionality
 */

// Product data storage
let products = [];

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Load demo products on init
    loadDemoProducts();

    // Bind event listeners
    bindEvents();

    // Update products table
    updateProductsTable();
});

// Load demo product data
function loadDemoProducts() {
    // Check if we already have products in localStorage
    const storedProducts = localStorage.getItem('recoveryEssentials_products');
    if (storedProducts) {
        products = JSON.parse(storedProducts);
        return;
    }

    // Otherwise initialize with demo data
    products = [
        {
            id: 'mg001',
            name: 'Theragun Pro',
            category: 'massage-guns',
            description: 'Professional-grade percussion therapy device with multiple attachments and smart app integration.',
            price: 599.00,
            rating: 4.9,
            reviewCount: 1254,
            imageUrl: 'https://ext.same-assets.com/4260193750/159753842.jpeg',
            affiliateLink: 'https://www.amazon.com/dp/B087MJ8VVW?tag=recoveryessentials-20',
            features: [
                '5 built-in speeds',
                'Multiple attachments',
                'Smart app integration',
                'Long battery life (5+ hours)',
                'OLED screen'
            ]
        },
        {
            id: 'fr001',
            name: 'TriggerPoint GRID Foam Roller',
            category: 'foam-rollers',
            description: 'The TriggerPoint GRID features a patented multi-density exterior designed to deliver firm pressure to help release muscle tightness.',
            price: 36.99,
            rating: 4.8,
            reviewCount: 3850,
            imageUrl: 'https://ext.same-assets.com/2108554563/1470587620.jpeg',
            affiliateLink: 'https://www.amazon.com/dp/B0040EGNIU?tag=recoveryessentials-20',
            features: [
                'Multi-density surface',
                'Hollow core design',
                'Durable construction',
                'Maintains shape',
                'Compact 13" size'
            ]
        },
        {
            id: 'fb001',
            name: 'TheraBand Resistance Bands Set',
            category: 'fitness-bands',
            description: 'TheraBand resistance bands set with multiple resistance levels for rehabilitation and strength training.',
            price: 18.95,
            rating: 4.7,
            reviewCount: 2789,
            imageUrl: 'https://ext.same-assets.com/2560824938/1799041335.jpeg',
            affiliateLink: 'https://www.amazon.com/dp/B01A58FH9I?tag=recoveryessentials-20',
            features: [
                'Progressive resistance levels',
                'Latex material',
                '3 bands included',
                'Color-coded by strength',
                'Exercise guide included'
            ]
        }
    ];

    // Save to localStorage
    saveProducts();
}

// Save products to localStorage
function saveProducts() {
    localStorage.setItem('recoveryEssentials_products', JSON.stringify(products));
}

// Bind event handlers
function bindEvents() {
    // Form submission handler
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', handleFormSubmit);
    }

    // Add feature button
    const addFeatureBtn = document.getElementById('add-feature-btn');
    if (addFeatureBtn) {
        addFeatureBtn.addEventListener('click', addFeatureField);
    }

    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-target');
            showSection(targetId);
        });
    });

    // Product table actions
    const productsTable = document.querySelector('#products-table tbody');
    if (productsTable) {
        productsTable.addEventListener('click', function(e) {
            const target = e.target;
            if (target.classList.contains('edit-product')) {
                e.preventDefault();
                const productId = target.getAttribute('data-id');
                editProduct(productId);
            } else if (target.classList.contains('delete-product')) {
                e.preventDefault();
                const productId = target.getAttribute('data-id');
                deleteProduct(productId);
            }
        });
    }
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();

    // Get form values
    const productId = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const description = document.getElementById('product-description').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const rating = parseFloat(document.getElementById('product-rating').value);
    const reviewCount = parseInt(document.getElementById('product-reviews').value);
    const imageUrl = document.getElementById('product-image').value;
    const affiliateLink = document.getElementById('product-affiliate-link').value;

    // Get features
    const features = [];
    document.querySelectorAll('#feature-container input').forEach(input => {
        if (input.value.trim()) {
            features.push(input.value.trim());
        }
    });

    // Validate form
    if (!name || !category || !description || isNaN(price) || !imageUrl || !affiliateLink || features.length === 0) {
        showNotification('Please fill out all required fields', 'error');
        return;
    }

    // Create product object
    const product = {
        id: productId || generateProductId(category),
        name,
        category,
        description,
        price,
        rating,
        reviewCount,
        imageUrl,
        affiliateLink,
        features
    };

    // Add or update product
    if (productId) {
        // Update existing product
        const index = products.findIndex(p => p.id === productId);
        if (index !== -1) {
            products[index] = product;
            showNotification('Product updated successfully', 'success');
        }
    } else {
        // Add new product
        products.push(product);
        showNotification('Product added successfully', 'success');
    }

    // Save products
    saveProducts();

    // Update products table
    updateProductsTable();

    // Reset form
    resetForm();
}

// Generate a product ID
function generateProductId(category) {
    const prefix = category.substring(0, 2);
    const nextId = products.filter(p => p.category === category).length + 1;
    return `${prefix}${String(nextId).padStart(3, '0')}`;
}

// Update products table
function updateProductsTable() {
    const tableBody = document.querySelector('#products-table tbody');
    if (!tableBody) return;

    // Clear table
    tableBody.innerHTML = '';

    // Add products to table
    products.forEach(product => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';

        row.innerHTML = `
            <td class="px-4 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                        <img class="h-10 w-10 rounded-md object-cover" src="${product.imageUrl}" alt="${product.name}">
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${product.name}</div>
                    </div>
                </div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${getCategoryName(product.category)}</div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">$${product.price.toFixed(2)}</div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${product.rating}/5</div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-sm font-medium">
                <a href="#" class="edit-product text-indigo-600 hover:text-indigo-900 mr-3" data-id="${product.id}">Edit</a>
                <a href="#" class="delete-product text-red-600 hover:text-red-900" data-id="${product.id}">Delete</a>
            </td>
        `;

        tableBody.appendChild(row);
    });

    // Update product count
    const productCount = document.getElementById('product-count');
    if (productCount) {
        productCount.textContent = products.length;
    }
}

// Edit product
function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Show products section
    showSection('products-section');

    // Fill form
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-rating').value = product.rating;
    document.getElementById('product-reviews').value = product.reviewCount;
    document.getElementById('product-image').value = product.imageUrl;
    document.getElementById('product-affiliate-link').value = product.affiliateLink;

    // Clear features
    const featureContainer = document.getElementById('feature-container');
    featureContainer.innerHTML = '';

    // Add features
    product.features.forEach(feature => {
        const featureRow = document.createElement('div');
        featureRow.className = 'flex items-center gap-2';
        featureRow.innerHTML = `
            <input type="text" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Feature or benefit" value="${feature}">
            <button type="button" class="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-md" onclick="removeFeatureField(this)">
                <i class="fas fa-times"></i>
            </button>
        `;
        featureContainer.appendChild(featureRow);
    });

    // Update form title and button
    document.getElementById('form-title').textContent = 'Edit Product';
    document.getElementById('submit-btn').textContent = 'Update Product';

    // Scroll to form
    document.getElementById('product-form').scrollIntoView({ behavior: 'smooth' });
}

// Delete product
function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        const index = products.findIndex(p => p.id === productId);
        if (index !== -1) {
            products.splice(index, 1);
            saveProducts();
            updateProductsTable();
            showNotification('Product deleted successfully', 'success');
        }
    }
}

// Reset form
function resetForm() {
    document.getElementById('product-id').value = '';
    document.getElementById('product-form').reset();

    // Reset features
    const featureContainer = document.getElementById('feature-container');
    featureContainer.innerHTML = `
        <div class="flex items-center gap-2">
            <input type="text" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Feature or benefit">
            <button type="button" class="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-md" onclick="removeFeatureField(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Update form title and button
    document.getElementById('form-title').textContent = 'Add New Product';
    document.getElementById('submit-btn').textContent = 'Save Product';
}

// Add feature field
function addFeatureField() {
    const container = document.getElementById('feature-container');
    const featureRow = document.createElement('div');
    featureRow.className = 'flex items-center gap-2';
    featureRow.innerHTML = `
        <input type="text" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Feature or benefit">
        <button type="button" class="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-md" onclick="removeFeatureField(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    container.appendChild(featureRow);
}

// Remove feature field
function removeFeatureField(button) {
    const featureRow = button.parentNode;
    featureRow.parentNode.removeChild(featureRow);
}

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

// Show section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.add('hidden');
    });

    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('text-indigo-600', 'bg-indigo-50');
        link.classList.add('text-gray-700');

        if (link.getAttribute('data-target') === sectionId) {
            link.classList.remove('text-gray-700');
            link.classList.add('text-indigo-600', 'bg-indigo-50');
        }
    });
}

// Get category display name
function getCategoryName(category) {
    const categories = {
        'massage-guns': 'Massage Guns',
        'foam-rollers': 'Foam Rollers',
        'fitness-bands': 'Fitness Bands',
        'compression-gear': 'Compression Gear'
    };
    return categories[category] || category;
}

// New function for form validation
function validateForm() {
    // Code for form validation
}

// New function to toggle visibility of elements
function toggleVisibility(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = (element.style.display === 'none') ? 'block' : 'none';
    }
}
