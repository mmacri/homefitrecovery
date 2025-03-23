/**
 * Recovery Essentials - Product Detail Page
 * This file handles the product detail page functionality
 */

// Current product data
let currentProduct = null;

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Get product ID from URL
  const productSlug = getProductSlugFromUrl();

  if (productSlug) {
    loadProductData(productSlug);
  } else {
    showProductError('Product not found');
  }

  // Set up event listeners
  setupEventListeners();
});

/**
 * Extract product slug from URL
 * @returns {string|null} Product slug
 */
function getProductSlugFromUrl() {
  const path = window.location.pathname;
  const segments = path.split('/').filter(segment => segment.length > 0);

  // Check if we have a product path like /products/category/product-slug.html
  if (segments.length >= 3 && segments[0] === 'products') {
    // Extract slug from the filename (remove .html extension)
    const filename = segments[segments.length - 1];
    return filename.replace('.html', '');
  }

  // Alternative: look for a URL parameter
  return getUrlParameter('product');
}

/**
 * Load product data from API or localStorage
 * @param {string} productSlug - Product slug
 */
function loadProductData(productSlug) {
  // In a real implementation, this would fetch from an API
  // For demo purposes, we'll load from localStorage

  const storedProducts = localStorage.getItem('recoveryEssentials_products');
  let products = [];

  if (storedProducts) {
    products = JSON.parse(storedProducts);
  } else {
    products = getDemoProducts();
  }

  const product = products.find(p => p.slug === productSlug);

  if (product) {
    currentProduct = product;
    updateProductUI(product);
    loadRelatedProducts(product.category, product.id);
  } else {
    showProductError('Product not found');
  }
}

/**
 * Update the UI with product data
 * @param {Object} product - Product data
 */
function updateProductUI(product) {
  // Update page title and meta description
  document.title = `${product.name} - Recovery Essentials`;

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.content = truncateText(product.description, 160);
  }

  // Update breadcrumbs
  document.getElementById('category-breadcrumb').textContent = getCategoryName(product.category);
  document.getElementById('category-breadcrumb').href = `/categories/${product.category}.html`;
  document.getElementById('product-breadcrumb').textContent = product.name;

  // Update product details
  document.getElementById('product-name').textContent = product.name;
  document.getElementById('product-rating').innerHTML = generateRatingHTML(product.rating, product.reviewCount);
  document.getElementById('review-count').textContent = `${product.reviewCount} reviews`;

  // Update price
  document.getElementById('product-price').textContent = formatPrice(product.price);
  if (product.originalPrice && product.originalPrice > product.price) {
    document.getElementById('product-original-price').textContent = formatPrice(product.originalPrice);

    // Add discount badge if not already present
    const discountPercentage = calculateDiscount(product.originalPrice, product.price);
    if (discountPercentage > 0) {
      const availabilityEl = document.getElementById('product-availability');
      availabilityEl.innerHTML += `
        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 ml-2">
          Save ${discountPercentage}%
        </span>
      `;
    }
  } else {
    document.getElementById('product-original-price').style.display = 'none';
  }

  // Update availability
  if (!product.inStock) {
    const availabilityEl = document.getElementById('product-availability');
    availabilityEl.innerHTML = `
      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
        <svg class="mr-1 h-2 w-2 text-red-500" fill="currentColor" viewBox="0 0 8 8">
          <circle cx="4" cy="4" r="3"></circle>
        </svg>
        Out of Stock
      </span>
    `;
  }

  // Update short description
  document.getElementById('product-short-description').textContent = truncateText(product.description, 200);

  // Update affiliate links
  if (product.asin) {
    document.getElementById('amazon-button').href = generateAmazonUrl(product.asin);
  }
  if (product.alternativeUrl) {
    document.getElementById('alternative-button').href = product.alternativeUrl;
  }

  // Update product features
  const featuresEl = document.getElementById('product-features');
  featuresEl.innerHTML = '';
  if (product.features && product.features.length) {
    product.features.forEach(feature => {
      const li = document.createElement('li');
      li.textContent = feature;
      featuresEl.appendChild(li);
    });
  }

  // Update main image
  const mainImage = document.getElementById('product-main-img');
  mainImage.src = product.images && product.images.length ? product.images[0].url : '/images/placeholder-product.jpg';
  mainImage.alt = product.name;

  // Update thumbnails
  const thumbnailsContainer = document.getElementById('product-thumbnails');
  thumbnailsContainer.innerHTML = '';

  if (product.images && product.images.length > 1) {
    product.images.forEach((image, index) => {
      const thumbnail = document.createElement('div');
      thumbnail.className = `product-thumbnail ${index === 0 ? 'active' : ''}`;
      thumbnail.dataset.index = index;

      const img = document.createElement('img');
      img.src = image.url;
      img.alt = `${product.name} - Image ${index + 1}`;
      img.className = 'w-full h-full object-cover';

      thumbnail.appendChild(img);
      thumbnailsContainer.appendChild(thumbnail);

      // Add click event
      thumbnail.addEventListener('click', function() {
        mainImage.src = image.url;
        document.querySelectorAll('.product-thumbnail').forEach(thumb => {
          thumb.classList.remove('active');
        });
        this.classList.add('active');
      });
    });
  } else {
    thumbnailsContainer.style.display = 'none';
  }

  // Update full description
  document.getElementById('product-full-description').innerHTML = product.fullDescription || product.description;

  // Update specifications
  const specsTable = document.getElementById('product-specifications');
  specsTable.innerHTML = '';

  if (product.specifications && Object.keys(product.specifications).length) {
    Object.entries(product.specifications).forEach(([key, value]) => {
      const row = document.createElement('tr');

      const keyCell = document.createElement('td');
      keyCell.className = 'px-4 py-3 bg-gray-50 text-gray-700 font-medium';
      keyCell.textContent = key;

      const valueCell = document.createElement('td');
      valueCell.className = 'px-4 py-3 text-gray-600';
      valueCell.textContent = value;

      row.appendChild(keyCell);
      row.appendChild(valueCell);
      specsTable.appendChild(row);
    });
  } else {
    specsTable.innerHTML = '<tr><td class="px-4 py-3 text-gray-600">No specifications available</td></tr>';
  }

  // Update structured data
  updateStructuredData(product);
}

/**
 * Update the product structured data
 * @param {Object} product - Product data
 */
function updateStructuredData(product) {
  const schemaScript = document.getElementById('product-schema');

  if (!schemaScript) {
    return;
  }

  const structuredData = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images && product.images.length ? product.images[0].url : '/images/placeholder-product.jpg',
    sku: product.sku || product.id,
    mpn: product.mpn,
    brand: {
      '@type': 'Brand',
      name: product.brand
    },
    offers: {
      '@type': 'Offer',
      url: window.location.href,
      priceCurrency: 'USD',
      price: product.price,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    }
  };

  if (product.rating && product.reviewCount) {
    structuredData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount
    };
  }

  schemaScript.textContent = JSON.stringify(structuredData);
}

/**
 * Load related products
 * @param {string} category - Product category
 * @param {string} currentProductId - Current product ID to exclude
 */
function loadRelatedProducts(category, currentProductId) {
  // In a real implementation, this would fetch from an API
  // For demo purposes, we'll load from localStorage

  const storedProducts = localStorage.getItem('recoveryEssentials_products');
  let products = [];

  if (storedProducts) {
    products = JSON.parse(storedProducts);
  } else {
    products = getDemoProducts();
  }

  // Filter related products (same category, different ID)
  const relatedProducts = products.filter(p =>
    p.category === category && p.id !== currentProductId
  ).slice(0, 4); // Limit to 4 related products

  const relatedContainer = document.getElementById('related-products');
  relatedContainer.innerHTML = '';

  if (relatedProducts.length) {
    relatedProducts.forEach(product => {
      relatedContainer.innerHTML += generateProductCardHTML(product);
    });
  } else {
    relatedContainer.innerHTML = '<p class="text-gray-600">No related products found</p>';
  }
}

/**
 * Generate HTML for a product card
 * @param {Object} product - Product data
 * @returns {string} HTML for product card
 */
function generateProductCardHTML(product) {
  return `
    <div class="card product-card">
      <div class="product-card__image">
        <img src="${product.images && product.images.length ? product.images[0].url : '/images/placeholder-product.jpg'}"
             alt="${product.name}" class="max-h-full">
      </div>
      <div class="product-card__content">
        <h3 class="product-card__title">
          <a href="/products/${product.category}/${product.slug}.html">${product.name}</a>
        </h3>
        <div class="product-card__rating">
          ${generateRatingHTML(product.rating, product.reviewCount)}
        </div>
        <div class="product-card__price">
          ${formatPrice(product.price)}
        </div>
        <div class="product-card__actions">
          <a href="/products/${product.category}/${product.slug}.html" class="btn btn-primary w-full">
            View Details
          </a>
        </div>
      </div>
    </div>
  `;
}

/**
 * Show an error message when product cannot be loaded
 * @param {string} message - Error message
 */
function showProductError(message) {
  const container = document.querySelector('.container');

  if (container) {
    container.innerHTML = `
      <div class="py-12 text-center">
        <div class="mb-6 text-red-600">
          <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-4">${message}</h1>
        <p class="text-gray-600 mb-6">The product you're looking for could not be found or has been removed.</p>
        <a href="/categories/${getCategoryFromUrl() || 'massage-guns'}.html" class="btn btn-primary">
          Browse Products
        </a>
      </div>
    `;
  }
}

/**
 * Set up event listeners for product page
 */
function setupEventListeners() {
  // Write review button
  const writeReviewBtn = document.getElementById('write-review-button');
  if (writeReviewBtn) {
    writeReviewBtn.addEventListener('click', function() {
      // Scroll to review form or show modal
      alert('Review functionality coming soon!');
    });
  }
}

/**
 * Get category name from slug
 * @param {string} categorySlug - Category slug
 * @returns {string} Category name
 */
function getCategoryName(categorySlug) {
  const categories = {
    'massage-guns': 'Massage Guns',
    'foam-rollers': 'Foam Rollers',
    'fitness-bands': 'Fitness Bands',
    'compression-gear': 'Compression Gear'
  };

  return categories[categorySlug] || categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Get category from URL
 * @returns {string|null} Category slug
 */
function getCategoryFromUrl() {
  const path = window.location.pathname;
  const segments = path.split('/').filter(segment => segment.length > 0);

  if (segments.length >= 2 && segments[0] === 'products') {
    return segments[1];
  }

  return null;
}

/**
 * Get demo products for testing
 * @returns {Array} Demo products
 */
function getDemoProducts() {
  return [
    {
      id: 'p001',
      name: 'Theragun Pro',
      slug: 'theragun-pro',
      category: 'massage-guns',
      description: 'Professional-grade percussive therapy device with advanced features for enhanced recovery.',
      fullDescription: `
        <h3>Professional-Grade Percussion Massage Gun</h3>
        <p>The Theragun Pro is our most advanced percussion device, designed for professionals and serious athletes. With its proprietary brushless motor maintaining top speeds while operating quietly, you'll experience a consistently powerful treatment every time.</p>

        <h3>Key Benefits:</h3>
        <ul>
          <li>Reduces muscle soreness and stiffness</li>
          <li>Improves range of motion</li>
          <li>Enhances circulation and accelerates recovery</li>
          <li>Activates the nervous system and muscles</li>
          <li>Breaks up scar tissue</li>
        </ul>

        <h3>Superior Design</h3>
        <p>The ergonomic multi-grip provides comfort and reduces strain on your hands, wrists, and arms. The Pro includes a rotating arm allowing you to reach 90% of your body by yourself, without straining or compromising proper form.</p>

        <h3>Smart Features</h3>
        <p>Connect to the Therabody app via Bluetooth to access guided treatments and control speed remotely. The Pro features an OLED screen with a force meter that displays how much pressure you're applying during your treatment to help you improve your recovery technique.</p>
      `,
      price: 599.00,
      originalPrice: 649.00,
      brand: 'Therabody',
      sku: 'TGP-2020',
      mpn: 'G4PRO',
      asin: 'B087MJ8VVW',
      rating: 4.7,
      reviewCount: 1254,
      inStock: true,
      features: [
        'Professional-grade percussion therapy device',
        'Rotating arm and ergonomic multi-grip',
        'Reaches 60% deeper into muscle than consumer massagers',
        'Bluetooth connectivity with Therabody app',
        'OLED screen with force meter',
        '5 built-in speeds (1750-2400 PPMs)',
        'Up to 60 lbs of force with no stalling',
        '2 swappable rechargeable batteries (150 min. each)',
        'Customizable speed range',
        'Comes with 6 attachments'
      ],
      specifications: {
        'Speed Range': '1750-2400 PPMs',
        'Percussion Force': 'Up to 60 lbs',
        'Battery Life': '300 minutes total (2 batteries)',
        'Weight': '2.9 lbs',
        'Amplitude': '16mm',
        'Noise Level': '60-65 dB',
        'Warranty': '2-year limited',
        'Attachments': '6 (Dampener, Standard Ball, Wedge, Thumb, Cone, Supersoft)'
      },
      images: [
        { url: 'https://ext.same-assets.com/1001010126/theragun-pro.jpg' },
        { url: 'https://ext.same-assets.com/1001010126/theragun-pro-side.jpg' },
        { url: 'https://ext.same-assets.com/1001010126/theragun-pro-attachments.jpg' },
        { url: 'https://ext.same-assets.com/1001010126/theragun-pro-app.jpg' }
      ]
    },
    {
      id: 'p002',
      name: 'Hyperice Hypervolt 2',
      slug: 'hyperice-hypervolt-2',
      category: 'massage-guns',
      description: 'Bluetooth-enabled percussion massage device with 3 speeds and 5 interchangeable heads.',
      price: 299.00,
      brand: 'Hyperice',
      sku: 'HV2-2021',
      asin: 'B09GFSZXRN',
      rating: 4.5,
      reviewCount: 823,
      inStock: true,
      features: [
        'Quiet Glide™ Technology',
        '3 speed settings',
        'Bluetooth connectivity with Hyperice App',
        'Lightweight design (1.8 lbs)',
        '5 interchangeable head attachments',
        'TSA-approved for carry-on',
        '3 hours of battery life'
      ],
      specifications: {
        'Speed Range': '2000-3200 PPMs',
        'Battery Life': '3 hours',
        'Weight': '1.8 lbs',
        'Noise Level': '54-62 dB',
        'Warranty': '1-year limited'
      },
      images: [
        { url: 'https://ext.same-assets.com/1001010127/hypervolt-2.jpg' }
      ]
    },
    {
      id: 'p003',
      name: 'RENPHO Active Massage Gun',
      slug: 'renpho-active-massage-gun',
      category: 'massage-guns',
      description: 'Affordable percussion massage gun with 20 speed levels and 6 massage heads.',
      price: 99.99,
      originalPrice: 129.99,
      brand: 'RENPHO',
      sku: 'R-MG-A1',
      asin: 'B07YZDJ5FQ',
      rating: 4.3,
      reviewCount: 12892,
      inStock: true,
      features: [
        '20 adjustable speed levels',
        '6 massage heads for different body parts',
        'Super quiet operation (<45dB)',
        'Up to 6 hours of battery life',
        'Auto-shutoff after 10 minutes',
        'Lightweight design (2.1 lbs)'
      ],
      images: [
        { url: 'https://ext.same-assets.com/1001010128/renpho-massage-gun.jpg' }
      ]
    },
    {
      id: 'p004',
      name: 'TriggerPoint GRID Foam Roller',
      slug: 'triggerpoint-grid-foam-roller',
      category: 'foam-rollers',
      description: 'High-quality foam roller with patented multi-density exterior for effective muscle recovery.',
      price: 36.99,
      brand: 'TriggerPoint',
      sku: 'TP-GRID-13',
      asin: 'B0040EGNIU',
      rating: 4.8,
      reviewCount: 18436,
      inStock: true,
      features: [
        'Patented design with multi-density exterior',
        'Distinctive surface pattern for targeted massage',
        'Hollow core maintains shape after repeated use',
        'Supports up to 500 pounds',
        'Compact size (13 inches)'
      ],
      images: [
        { url: 'https://ext.same-assets.com/1001010124/foam-roller.jpg' }
      ]
    },
    {
      id: 'p005',
      name: 'CEP Compression Socks',
      slug: 'cep-compression-socks',
      category: 'compression-gear',
      description: 'Medical-grade graduated compression socks for enhanced circulation and recovery.',
      price: 59.95,
      brand: 'CEP',
      sku: 'CEP-3-0',
      asin: 'B0BL3VTXLZ',
      rating: 4.6,
      reviewCount: 3271,
      inStock: true,
      features: [
        '20-30 mmHg medical-grade compression',
        'Graduated compression profile',
        'Moisture-wicking fabric',
        'Anatomical fit for left and right foot',
        'Microfiber technology for comfort'
      ],
      images: [
        { url: 'https://ext.same-assets.com/1001010129/compression-socks.jpg' }
      ]
    }
  ];
}
