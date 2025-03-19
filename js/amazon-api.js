/**
 * Amazon Product Advertising API Integration
 *
 * This script provides integration with Amazon's Product Advertising API v5
 * to fetch product information and generate affiliate links.
 *
 * For documentation, see: https://webservices.amazon.com/paapi5/documentation/
 */

// Configuration - Replace with your own credentials
const AMAZON_API_CONFIG = {
    // Your Amazon Associate ID (replace with your own)
    associateTag: 'recoveryessentials-20',

    // Your API credentials (replace with your own)
    accessKey: 'YOUR_ACCESS_KEY',
    secretKey: 'YOUR_SECRET_KEY',

    // API endpoint (change region if needed)
    endpoint: 'webservices.amazon.com',
    region: 'us-east-1',

    // Default marketplace
    marketplace: 'www.amazon.com'
};

/**
 * Fetches product information from Amazon API
 *
 * @param {string} asin - Amazon Standard Identification Number
 * @returns {Promise<Object>} - Product data
 */
async function fetchProductByASIN(asin) {
    if (!asin) {
        throw new Error('ASIN is required');
    }

    // Implementation requires Amazon PAAPI v5 SDK
    // This is a placeholder for the actual implementation

    console.log(`Fetching product data for ASIN: ${asin}`);
    console.log('Please implement the actual API call using the Amazon PAAPI v5 SDK');

    // Return mock data for demonstration
    return {
        asin: asin,
        title: 'Product Title',
        description: 'Product Description',
        price: {
            amount: 99.99,
            currency: 'USD'
        },
        images: {
            primary: {
                large: {
                    url: 'https://example.com/product-image.jpg'
                }
            }
        },
        detailPageURL: generateAffiliateURL(asin)
    };
}

/**
 * Searches for products on Amazon
 *
 * @param {string} keyword - Search keyword
 * @param {string} category - Product category (optional)
 * @returns {Promise<Array>} - List of products
 */
async function searchProducts(keyword, category = '') {
    if (!keyword) {
        throw new Error('Search keyword is required');
    }

    // Implementation requires Amazon PAAPI v5 SDK
    // This is a placeholder for the actual implementation

    console.log(`Searching for "${keyword}" in category "${category || 'All'}"`);
    console.log('Please implement the actual API call using the Amazon PAAPI v5 SDK');

    // Return mock data for demonstration
    return [
        {
            asin: 'B0040EGNIU',
            title: 'TriggerPoint GRID Foam Roller',
            price: {
                amount: 36.99,
                currency: 'USD'
            },
            detailPageURL: generateAffiliateURL('B0040EGNIU')
        },
        {
            asin: 'B087MJ8VVW',
            title: 'Theragun Pro',
            price: {
                amount: 599.00,
                currency: 'USD'
            },
            detailPageURL: generateAffiliateURL('B087MJ8VVW')
        }
    ];
}

/**
 * Generates an affiliate link for a product
 *
 * @param {string} asin - Amazon Standard Identification Number
 * @param {string} tag - Associate Tag (optional, uses default if not provided)
 * @returns {string} - Affiliate URL
 */
function generateAffiliateURL(asin, tag = AMAZON_API_CONFIG.associateTag) {
    return `https://${AMAZON_API_CONFIG.marketplace}/dp/${asin}?tag=${tag}`;
}

/**
 * Renders a product card in HTML
 *
 * @param {Object} product - Product data
 * @returns {string} - HTML string for the product card
 */
function renderProductCard(product) {
    return `
    <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div class="p-4">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold text-gray-800">${product.title}</h3>
                <div class="product-rating">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star-half-alt"></i>
                </div>
            </div>
            <div class="mb-4">
                <img src="${product.images?.primary?.large?.url || 'placeholder.jpg'}" alt="${product.title}" class="w-full h-48 object-contain">
            </div>
            <div class="mb-4">
                <p class="text-gray-800 text-xl font-semibold">${product.price.currency} ${product.price.amount.toFixed(2)}</p>
            </div>
            <a href="${product.detailPageURL}" target="_blank" class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md inline-block w-full text-center">
                View on Amazon
            </a>
        </div>
    </div>
    `;
}

/**
 * Populates a container with product cards
 *
 * @param {string} containerId - ID of the container element
 * @param {Array} products - Array of product data
 */
function populateProductContainer(containerId, products) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID "${containerId}" not found`);
        return;
    }

    container.innerHTML = products.map(renderProductCard).join('');
}

/**
 * Initialize product listings on page load
 * Use data attributes to configure the container:
 * - data-category: Amazon category
 * - data-keywords: Search keywords
 * - data-asins: Comma-separated list of ASINs
 */
document.addEventListener('DOMContentLoaded', async () => {
    const productContainers = document.querySelectorAll('[data-product-container]');

    for (const container of productContainers) {
        const containerId = container.id;
        const category = container.dataset.category || '';
        const keywords = container.dataset.keywords || '';
        const asins = container.dataset.asins || '';

        try {
            let products = [];

            if (asins) {
                // Fetch specific products by ASINs
                const asinList = asins.split(',').map(asin => asin.trim());
                products = await Promise.all(asinList.map(fetchProductByASIN));
            } else if (keywords) {
                // Search for products by keywords
                products = await searchProducts(keywords, category);
            }

            populateProductContainer(containerId, products);
        } catch (error) {
            console.error(`Error loading products for container "${containerId}":`, error);
            container.innerHTML = `<div class="text-red-600 p-4">Error loading products. Please try again later.</div>`;
        }
    }
});

// Export functions for use in other scripts
window.AmazonAPI = {
    fetchProductByASIN,
    searchProducts,
    generateAffiliateURL,
    renderProductCard,
    populateProductContainer
};
