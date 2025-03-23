/**
 * Recovery Essentials Admin - Affiliate Link Management
 * This script handles the affiliate link management in the admin dashboard
 */

// Affiliate link data storage
let affiliateLinks = [];

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on the affiliate section
    if (document.getElementById('affiliate-section')) {
        loadAffiliateLinks();
        bindAffiliateEvents();
        updateAffiliateTable();
    }
});

// Load affiliate links from localStorage
function loadAffiliateLinks() {
    const storedLinks = localStorage.getItem('recoveryEssentials_affiliateLinks');
    if (storedLinks) {
        affiliateLinks = JSON.parse(storedLinks);
    } else {
        // Load demo affiliate links if no stored links
        affiliateLinks = getDemoAffiliateLinks();
        saveAffiliateLinks();
    }
}

// Save affiliate links to localStorage
function saveAffiliateLinks() {
    localStorage.setItem('recoveryEssentials_affiliateLinks', JSON.stringify(affiliateLinks));
}

// Get demo affiliate links
function getDemoAffiliateLinks() {
    return [
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
        },
        {
            id: 'afl002',
            name: 'GRID Foam Roller - Amazon',
            productId: 'grid-foam-roller',
            productName: 'TriggerPoint GRID Foam Roller',
            url: 'https://www.amazon.com/dp/B0040EGNIU?tag=recoveryessentials-20',
            platform: 'amazon',
            commission: 4.0,
            tag: 'recoveryessentials-20',
            clicks: 42,
            conversions: 9
        },
        {
            id: 'afl003',
            name: 'TheraBand Set - Amazon',
            productId: 'theraband-set',
            productName: 'TheraBand Resistance Bands Set',
            url: 'https://www.amazon.com/dp/B01A58FH9I?tag=recoveryessentials-20',
            platform: 'amazon',
            commission: 3.5,
            tag: 'recoveryessentials-20',
            clicks: 32,
            conversions: 7
        }
    ];
}

// Bind affiliate form events
function bindAffiliateEvents() {
    // Affiliate form submission
    const affiliateForm = document.getElementById('affiliate-form');
    if (affiliateForm) {
        affiliateForm.addEventListener('submit', handleAffiliateFormSubmit);
    }

    // Affiliate table actions
    const affiliateTable = document.querySelector('#affiliate-table tbody');
    if (affiliateTable) {
        affiliateTable.addEventListener('click', function(e) {
            const target = e.target.closest('a');
            if (!target) return;

            e.preventDefault();
            const linkId = target.getAttribute('data-id');

            if (target.classList.contains('edit-link')) {
                editAffiliateLink(linkId);
            } else if (target.classList.contains('delete-link')) {
                deleteAffiliateLink(linkId);
            }
        });
    }

    // Cancel button
    const cancelBtn = document.getElementById('affiliate-cancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', resetAffiliateForm);
    }
}

// Handle affiliate form submission
function handleAffiliateFormSubmit(e) {
    e.preventDefault();

    // Get form values
    const linkId = document.getElementById('affiliate-id')?.value;
    const name = document.getElementById('affiliate-name').value;
    const productId = document.getElementById('affiliate-product').value;
    const url = document.getElementById('affiliate-url').value;
    const platform = document.getElementById('affiliate-platform').value;
    const commission = parseFloat(document.getElementById('affiliate-commission').value);
    const tag = document.getElementById('affiliate-tag').value;

    // Get product name from select
    const productSelect = document.getElementById('affiliate-product');
    const productName = productSelect.options[productSelect.selectedIndex].text;

    // Validate form
    if (!name || !productId || !url || !platform) {
        showNotification('Please fill out all required fields', 'error');
        return;
    }

    // Create affiliate link object
    const affiliateLink = {
        id: linkId || `afl${affiliateLinks.length + 1}`.padStart(6, '0'),
        name,
        productId,
        productName,
        url,
        platform,
        commission: commission || 0,
        tag,
        clicks: linkId ? (affiliateLinks.find(l => l.id === linkId)?.clicks || 0) : 0,
        conversions: linkId ? (affiliateLinks.find(l => l.id === linkId)?.conversions || 0) : 0
    };

    // Add or update affiliate link
    if (linkId) {
        // Update existing link
        const index = affiliateLinks.findIndex(l => l.id === linkId);
        if (index !== -1) {
            affiliateLinks[index] = affiliateLink;
            showNotification('Affiliate link updated successfully', 'success');
        }
    } else {
        // Add new link
        affiliateLinks.push(affiliateLink);
        showNotification('Affiliate link added successfully', 'success');
    }

    // Save links
    saveAffiliateLinks();

    // Update table
    updateAffiliateTable();

    // Reset form
    resetAffiliateForm();
}

// Update affiliate links table
function updateAffiliateTable() {
    const tableBody = document.querySelector('#affiliate-table tbody');
    if (!tableBody) return;

    // Clear table
    tableBody.innerHTML = '';

    // Add links to table
    affiliateLinks.forEach(link => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';

        const conversionRate = link.clicks > 0 ? ((link.conversions / link.clicks) * 100).toFixed(1) : '0.0';

        row.innerHTML = `
            <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${link.name}</div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${link.productName}</div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${link.platform}</div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${link.clicks}</div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${link.conversions} (${conversionRate}%)</div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-sm font-medium">
                <a href="#" class="edit-link text-indigo-600 hover:text-indigo-900 mr-3" data-id="${link.id}">Edit</a>
                <a href="#" class="delete-link text-red-600 hover:text-red-900" data-id="${link.id}">Delete</a>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Edit affiliate link
function editAffiliateLink(linkId) {
    const link = affiliateLinks.find(l => l.id === linkId);
    if (!link) return;

    // Set form values
    document.getElementById('affiliate-id').value = link.id;
    document.getElementById('affiliate-name').value = link.name;
    document.getElementById('affiliate-product').value = link.productId;
    document.getElementById('affiliate-url').value = link.url;
    document.getElementById('affiliate-platform').value = link.platform;
    document.getElementById('affiliate-commission').value = link.commission;
    document.getElementById('affiliate-tag').value = link.tag;

    // Update form title and button
    document.getElementById('affiliate-form-title').textContent = 'Edit Affiliate Link';
    document.getElementById('affiliate-submit').textContent = 'Update Affiliate Link';

    // Scroll to form
    document.getElementById('affiliate-form').scrollIntoView({ behavior: 'smooth' });
}

// Delete affiliate link
function deleteAffiliateLink(linkId) {
    if (confirm('Are you sure you want to delete this affiliate link?')) {
        const index = affiliateLinks.findIndex(l => l.id === linkId);
        if (index !== -1) {
            affiliateLinks.splice(index, 1);
            saveAffiliateLinks();
            updateAffiliateTable();
            showNotification('Affiliate link deleted successfully', 'success');
        }
    }
}

// Reset affiliate form
function resetAffiliateForm() {
    // Reset form
    document.getElementById('affiliate-form').reset();
    document.getElementById('affiliate-id').value = '';

    // Update form title and button
    document.getElementById('affiliate-form-title').textContent = 'Add New Affiliate Link';
    document.getElementById('affiliate-submit').textContent = 'Add Affiliate Link';
}

// Export functions to window
window.updateAffiliateTable = updateAffiliateTable;
window.editAffiliateLink = editAffiliateLink;
window.deleteAffiliateLink = deleteAffiliateLink;
window.resetAffiliateForm = resetAffiliateForm;
