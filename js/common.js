/**
 * Recovery Essentials - Common JavaScript Functions
 * This file contains site-wide utility functions
 */

// Global site configuration
const SITE_CONFIG = {
  apiEndpoint: '/api',
  defaultCurrency: 'USD',
  currencySymbol: '$',
  siteName: 'Recovery Essentials',
  associateTag: 'recoveryessentials-20',
  imageBasePath: '/images/'
};

/**
 * Format a price with currency symbol
 * @param {number} price - The price to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted price
 */
function formatPrice(price, currency = SITE_CONFIG.defaultCurrency) {
  if (typeof price !== 'number') {
    return 'Price unavailable';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(price);
}

/**
 * Calculate discount percentage between original and current price
 * @param {number} originalPrice - Original price
 * @param {number} currentPrice - Current (discounted) price
 * @returns {number} Discount percentage
 */
function calculateDiscount(originalPrice, currentPrice) {
  if (!originalPrice || !currentPrice || originalPrice <= currentPrice) {
    return 0;
  }

  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

/**
 * Generate star rating HTML
 * @param {number} rating - Rating value (0-5)
 * @param {number} reviewCount - Number of reviews
 * @returns {string} HTML for rating display
 */
function generateRatingHTML(rating, reviewCount = 0) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  let html = '<div class="rating">';

  // Full stars
  for (let i = 0; i < fullStars; i++) {
    html += '<i class="fas fa-star rating__star"></i>';
  }

  // Half star
  if (halfStar) {
    html += '<i class="fas fa-star-half-alt rating__star"></i>';
  }

  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    html += '<i class="far fa-star rating__star"></i>';
  }

  if (reviewCount > 0) {
    html += `<span class="rating__count">(${reviewCount})</span>`;
  }

  html += '</div>';

  return html;
}

/**
 * Create a slug from a string
 * @param {string} text - Text to convert to slug
 * @returns {string} URL-friendly slug
 */
function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

/**
 * Truncate text to a certain length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, length = 100) {
  if (!text || text.length <= length) {
    return text;
  }

  return text.substring(0, length) + '...';
}

/**
 * Get URL parameter value
 * @param {string} param - Parameter name
 * @returns {string|null} Parameter value
 */
function getUrlParameter(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * Generate a product URL
 * @param {Object} product - Product object
 * @returns {string} Product URL
 */
function generateProductUrl(product) {
  if (!product || !product.slug) {
    return '#';
  }

  return `/products/${product.category}/${product.slug}.html`;
}

/**
 * Generate Amazon affiliate URL
 * @param {string} asin - Amazon Standard Identification Number
 * @param {string} tag - Associate tag (affiliate ID)
 * @returns {string} Affiliate URL
 */
function generateAmazonUrl(asin, tag = SITE_CONFIG.associateTag) {
  if (!asin) {
    return '#';
  }

  return `https://www.amazon.com/dp/${asin}?tag=${tag}`;
}

/**
 * Load HTML content from another file and inject it into the page
 * @param {string} url - URL of HTML file to load
 * @param {string} targetSelector - CSS selector of target element
 */
function loadHTMLContent(url, targetSelector) {
  const targetElement = document.querySelector(targetSelector);

  if (!targetElement) {
    console.error(`Target element not found: ${targetSelector}`);
    return;
  }

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.text();
    })
    .then(html => {
      targetElement.innerHTML = html;

      // Execute any scripts in the loaded HTML
      const scripts = targetElement.querySelectorAll('script');
      scripts.forEach(script => {
        const newScript = document.createElement('script');

        if (script.src) {
          newScript.src = script.src;
        } else {
          newScript.textContent = script.textContent;
        }

        document.head.appendChild(newScript);
        script.remove();
      });
    })
    .catch(error => {
      console.error(`Error loading ${url}:`, error);
      targetElement.innerHTML = `<div class="alert alert-danger">Error loading content. Please refresh the page and try again.</div>`;
    });
}

/**
 * Initialize common page elements
 */
function initCommonElements() {
  // Load header
  loadHTMLContent('/templates/header.html', '#header-placeholder');

  // Load footer
  loadHTMLContent('/templates/footer.html', '#footer-placeholder');

  // Initialize tabs
  initTabs();
}

/**
 * Initialize tab functionality
 */
function initTabs() {
  const tabLinks = document.querySelectorAll('a[href^="#"]');

  tabLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Only handle tab links
      if (!this.closest('li') || !this.getAttribute('href').startsWith('#')) {
        return;
      }

      e.preventDefault();

      const targetId = this.getAttribute('href').substring(1);
      const tabContent = document.getElementById(targetId);

      if (!tabContent) {
        return;
      }

      // Hide all tab content
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
        content.classList.remove('active');
      });

      // Remove active class from all tab links
      document.querySelectorAll('a[href^="#"]').forEach(tabLink => {
        tabLink.classList.remove('active');
        tabLink.classList.remove('text-indigo-600');
        tabLink.classList.remove('border-indigo-600');
        tabLink.classList.add('text-gray-500');
        tabLink.classList.add('border-transparent');
      });

      // Show selected tab content
      tabContent.classList.remove('hidden');
      tabContent.classList.add('active');

      // Add active class to clicked tab link
      this.classList.remove('text-gray-500');
      this.classList.remove('border-transparent');
      this.classList.add('active');
      this.classList.add('text-indigo-600');
      this.classList.add('border-indigo-600');
    });
  });
}

// Initialize common elements when the DOM is ready
document.addEventListener('DOMContentLoaded', initCommonElements);
