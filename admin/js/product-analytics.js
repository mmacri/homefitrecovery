/**
 * Recovery Essentials - Product Analytics Module
 * This module extends the main analytics system with product-specific tracking and reporting
 */

// Constants
const PRODUCT_METRICS_KEY = 'recoveryEssentials_productMetrics';
const CONVERSION_EVENTS_KEY = 'recoveryEssentials_conversionEvents';

// Event types
const PRODUCT_EVENT_TYPES = {
  VIEW: 'product_view',
  CLICK: 'product_click',
  ADD_TO_CART: 'add_to_cart',
  PURCHASE: 'purchase',
  REVIEW: 'product_review',
  COMPARISON: 'product_comparison'
};

/**
 * Initialize product analytics
 */
function initProductAnalytics() {
  // Initialize storage for product metrics if it doesn't exist
  let productMetrics = JSON.parse(localStorage.getItem(PRODUCT_METRICS_KEY) || 'null');
  if (!productMetrics) {
    productMetrics = {
      productViews: {},
      productClicks: {},
      addToCart: {},
      purchases: {},
      reviews: {},
      comparisons: {},
      lastUpdated: Date.now()
    };
    localStorage.setItem(PRODUCT_METRICS_KEY, JSON.stringify(productMetrics));
  }

  // Initialize storage for conversion events if it doesn't exist
  let conversionEvents = JSON.parse(localStorage.getItem(CONVERSION_EVENTS_KEY) || 'null');
  if (!conversionEvents) {
    conversionEvents = {
      events: [],
      lastUpdated: Date.now()
    };
    localStorage.setItem(CONVERSION_EVENTS_KEY, JSON.stringify(conversionEvents));
  }

  // Set up periodic data cleanup
  setupMetricsCleanup();
}

/**
 * Track a product view
 * @param {string} productId - Product ID
 * @param {Object} metadata - Additional metadata about the product view
 */
function trackProductView(productId, metadata = {}) {
  if (!productId) return;

  // Use main analytics if available
  if (window.Analytics && typeof window.Analytics.trackEvent === 'function') {
    window.Analytics.trackEvent(PRODUCT_EVENT_TYPES.VIEW, { productId, ...metadata }, 'product');
  }

  const productMetrics = getProductMetrics();
  const timestamp = Date.now();
  const dateKey = new Date(timestamp).toISOString().split('T')[0];

  // Initialize product view data if it doesn't exist
  if (!productMetrics.productViews[productId]) {
    productMetrics.productViews[productId] = {
      totalViews: 0,
      viewsByDate: {}
    };
  }

  // Update views counts
  productMetrics.productViews[productId].totalViews++;

  // Update views by date
  if (!productMetrics.productViews[productId].viewsByDate[dateKey]) {
    productMetrics.productViews[productId].viewsByDate[dateKey] = 0;
  }
  productMetrics.productViews[productId].viewsByDate[dateKey]++;

  // Save metrics
  productMetrics.lastUpdated = timestamp;
  saveProductMetrics(productMetrics);
}

/**
 * Track a product click (e.g., on a product in a listing)
 * @param {string} productId - Product ID
 * @param {Object} metadata - Additional metadata about the click
 */
function trackProductClick(productId, metadata = {}) {
  if (!productId) return;

  // Use main analytics if available
  if (window.Analytics && typeof window.Analytics.trackEvent === 'function') {
    window.Analytics.trackEvent(PRODUCT_EVENT_TYPES.CLICK, { productId, ...metadata }, 'product');
  }

  const productMetrics = getProductMetrics();
  const timestamp = Date.now();
  const dateKey = new Date(timestamp).toISOString().split('T')[0];

  // Initialize product click data if it doesn't exist
  if (!productMetrics.productClicks[productId]) {
    productMetrics.productClicks[productId] = {
      totalClicks: 0,
      clicksByDate: {}
    };
  }

  // Update click counts
  productMetrics.productClicks[productId].totalClicks++;

  // Update clicks by date
  if (!productMetrics.productClicks[productId].clicksByDate[dateKey]) {
    productMetrics.productClicks[productId].clicksByDate[dateKey] = 0;
  }
  productMetrics.productClicks[productId].clicksByDate[dateKey]++;

  // Save metrics
  productMetrics.lastUpdated = timestamp;
  saveProductMetrics(productMetrics);
}

/**
 * Track an add to cart event
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity added to cart
 * @param {Object} metadata - Additional metadata
 */
function trackAddToCart(productId, quantity = 1, metadata = {}) {
  if (!productId) return;

  // Use main analytics if available
  if (window.Analytics && typeof window.Analytics.trackEvent === 'function') {
    window.Analytics.trackEvent(PRODUCT_EVENT_TYPES.ADD_TO_CART, { productId, quantity, ...metadata }, 'product');
  }

  const productMetrics = getProductMetrics();
  const timestamp = Date.now();
  const dateKey = new Date(timestamp).toISOString().split('T')[0];

  // Initialize add to cart data if it doesn't exist
  if (!productMetrics.addToCart[productId]) {
    productMetrics.addToCart[productId] = {
      totalAdds: 0,
      totalQuantity: 0,
      addsByDate: {}
    };
  }

  // Update add to cart counts
  productMetrics.addToCart[productId].totalAdds++;
  productMetrics.addToCart[productId].totalQuantity += quantity;

  // Update adds by date
  if (!productMetrics.addToCart[productId].addsByDate[dateKey]) {
    productMetrics.addToCart[productId].addsByDate[dateKey] = {
      adds: 0,
      quantity: 0
    };
  }
  productMetrics.addToCart[productId].addsByDate[dateKey].adds++;
  productMetrics.addToCart[productId].addsByDate[dateKey].quantity += quantity;

  // Save metrics
  productMetrics.lastUpdated = timestamp;
  saveProductMetrics(productMetrics);

  // Track conversion event
  trackConversionEvent({
    type: PRODUCT_EVENT_TYPES.ADD_TO_CART,
    productId,
    quantity,
    timestamp,
    ...metadata
  });
}

/**
 * Track a product purchase
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity purchased
 * @param {number} revenue - Revenue from the purchase
 * @param {Object} metadata - Additional metadata
 */
function trackPurchase(productId, quantity = 1, revenue = 0, metadata = {}) {
  if (!productId) return;

  // Use main analytics if available
  if (window.Analytics && typeof window.Analytics.trackEvent === 'function') {
    window.Analytics.trackEvent(PRODUCT_EVENT_TYPES.PURCHASE, { productId, quantity, revenue, ...metadata }, 'product');
  }

  const productMetrics = getProductMetrics();
  const timestamp = Date.now();
  const dateKey = new Date(timestamp).toISOString().split('T')[0];

  // Initialize purchase data if it doesn't exist
  if (!productMetrics.purchases[productId]) {
    productMetrics.purchases[productId] = {
      totalPurchases: 0,
      totalQuantity: 0,
      totalRevenue: 0,
      purchasesByDate: {}
    };
  }

  // Update purchase counts
  productMetrics.purchases[productId].totalPurchases++;
  productMetrics.purchases[productId].totalQuantity += quantity;
  productMetrics.purchases[productId].totalRevenue += revenue;

  // Update purchases by date
  if (!productMetrics.purchases[productId].purchasesByDate[dateKey]) {
    productMetrics.purchases[productId].purchasesByDate[dateKey] = {
      purchases: 0,
      quantity: 0,
      revenue: 0
    };
  }
  productMetrics.purchases[productId].purchasesByDate[dateKey].purchases++;
  productMetrics.purchases[productId].purchasesByDate[dateKey].quantity += quantity;
  productMetrics.purchases[productId].purchasesByDate[dateKey].revenue += revenue;

  // Save metrics
  productMetrics.lastUpdated = timestamp;
  saveProductMetrics(productMetrics);

  // Track conversion event
  trackConversionEvent({
    type: PRODUCT_EVENT_TYPES.PURCHASE,
    productId,
    quantity,
    revenue,
    timestamp,
    ...metadata
  });
}

/**
 * Track a product review
 * @param {string} productId - Product ID
 * @param {number} rating - Rating given (1-5)
 * @param {Object} metadata - Additional metadata
 */
function trackProductReview(productId, rating, metadata = {}) {
  if (!productId) return;

  // Use main analytics if available
  if (window.Analytics && typeof window.Analytics.trackEvent === 'function') {
    window.Analytics.trackEvent(PRODUCT_EVENT_TYPES.REVIEW, { productId, rating, ...metadata }, 'product');
  }

  const productMetrics = getProductMetrics();
  const timestamp = Date.now();
  const dateKey = new Date(timestamp).toISOString().split('T')[0];

  // Initialize review data if it doesn't exist
  if (!productMetrics.reviews[productId]) {
    productMetrics.reviews[productId] = {
      totalReviews: 0,
      ratingSum: 0,
      ratingDistribution: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
      reviewsByDate: {}
    };
  }

  // Update review counts
  productMetrics.reviews[productId].totalReviews++;
  productMetrics.reviews[productId].ratingSum += rating;
  productMetrics.reviews[productId].ratingDistribution[rating]++;

  // Update reviews by date
  if (!productMetrics.reviews[productId].reviewsByDate[dateKey]) {
    productMetrics.reviews[productId].reviewsByDate[dateKey] = {
      reviews: 0,
      ratingSum: 0
    };
  }
  productMetrics.reviews[productId].reviewsByDate[dateKey].reviews++;
  productMetrics.reviews[productId].reviewsByDate[dateKey].ratingSum += rating;

  // Save metrics
  productMetrics.lastUpdated = timestamp;
  saveProductMetrics(productMetrics);

  // Track conversion event
  trackConversionEvent({
    type: PRODUCT_EVENT_TYPES.REVIEW,
    productId,
    rating,
    timestamp,
    ...metadata
  });
}

/**
 * Track a product comparison
 * @param {string} productId - Primary product ID
 * @param {Array} comparedProductIds - IDs of products being compared with
 * @param {Object} metadata - Additional metadata
 */
function trackProductComparison(productId, comparedProductIds = [], metadata = {}) {
  if (!productId || !comparedProductIds.length) return;

  // Use main analytics if available
  if (window.Analytics && typeof window.Analytics.trackEvent === 'function') {
    window.Analytics.trackEvent(PRODUCT_EVENT_TYPES.COMPARISON, {
      productId,
      comparedProductIds,
      ...metadata
    }, 'product');
  }

  const productMetrics = getProductMetrics();
  const timestamp = Date.now();
  const dateKey = new Date(timestamp).toISOString().split('T')[0];

  // Initialize comparison data if it doesn't exist
  if (!productMetrics.comparisons[productId]) {
    productMetrics.comparisons[productId] = {
      totalComparisons: 0,
      comparedWith: {},
      comparisonsByDate: {}
    };
  }

  // Update comparison counts
  productMetrics.comparisons[productId].totalComparisons++;

  // Update compared with products
  comparedProductIds.forEach(comparedId => {
    if (!productMetrics.comparisons[productId].comparedWith[comparedId]) {
      productMetrics.comparisons[productId].comparedWith[comparedId] = 0;
    }
    productMetrics.comparisons[productId].comparedWith[comparedId]++;
  });

  // Update comparisons by date
  if (!productMetrics.comparisons[productId].comparisonsByDate[dateKey]) {
    productMetrics.comparisons[productId].comparisonsByDate[dateKey] = 0;
  }
  productMetrics.comparisons[productId].comparisonsByDate[dateKey]++;

  // Save metrics
  productMetrics.lastUpdated = timestamp;
  saveProductMetrics(productMetrics);
}

/**
 * Track a conversion event for funnel analysis
 * @param {Object} event - Conversion event data
 */
function trackConversionEvent(event) {
  if (!event || !event.type || !event.productId) return;

  const conversionEvents = getConversionEvents();

  // Add event to the beginning of the array
  conversionEvents.events.unshift({
    ...event,
    timestamp: event.timestamp || Date.now()
  });

  // Limit to 5000 events to prevent localStorage from getting too large
  if (conversionEvents.events.length > 5000) {
    conversionEvents.events = conversionEvents.events.slice(0, 5000);
  }

  // Update last updated timestamp
  conversionEvents.lastUpdated = Date.now();

  // Save conversion events
  saveConversionEvents(conversionEvents);
}

/**
 * Get product metrics
 * @returns {Object} Product metrics
 */
function getProductMetrics() {
  return JSON.parse(localStorage.getItem(PRODUCT_METRICS_KEY) ||
    '{"productViews":{},"productClicks":{},"addToCart":{},"purchases":{},"reviews":{},"comparisons":{},"lastUpdated":0}');
}

/**
 * Save product metrics
 * @param {Object} metrics - Product metrics to save
 */
function saveProductMetrics(metrics) {
  localStorage.setItem(PRODUCT_METRICS_KEY, JSON.stringify(metrics));
}

/**
 * Get conversion events
 * @returns {Object} Conversion events
 */
function getConversionEvents() {
  return JSON.parse(localStorage.getItem(CONVERSION_EVENTS_KEY) ||
    '{"events":[],"lastUpdated":0}');
}

/**
 * Save conversion events
 * @param {Object} events - Conversion events to save
 */
function saveConversionEvents(events) {
  localStorage.setItem(CONVERSION_EVENTS_KEY, JSON.stringify(events));
}

/**
 * Set up metrics cleanup
 */
function setupMetricsCleanup() {
  // Run cleanup if last cleanup was more than a day ago
  const productMetrics = getProductMetrics();
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;

  if (now - productMetrics.lastUpdated > dayInMs) {
    cleanupOldMetrics();
  }
}

/**
 * Clean up old metrics
 */
function cleanupOldMetrics() {
  // Get config from main analytics if available
  let dataRetentionDays = 90;
  if (window.Analytics && typeof window.Analytics.getConfig === 'function') {
    const config = window.Analytics.getConfig();
    if (config && config.retention && config.retention.dataRetentionDays) {
      dataRetentionDays = config.retention.dataRetentionDays;
    }
  }

  const productMetrics = getProductMetrics();
  const conversionEvents = getConversionEvents();
  const now = Date.now();
  const maxAgeMs = dataRetentionDays * 24 * 60 * 60 * 1000;
  const cutoffTime = now - maxAgeMs;
  const cutoffDate = new Date(cutoffTime).toISOString().split('T')[0];

  // Clean up old product metrics
  Object.keys(productMetrics).forEach(metricType => {
    if (metricType === 'lastUpdated') return;

    Object.keys(productMetrics[metricType]).forEach(productId => {
      const metric = productMetrics[metricType][productId];

      // Clean up date-based metrics
      if (metric.viewsByDate) {
        Object.keys(metric.viewsByDate).forEach(date => {
          if (date < cutoffDate) {
            delete metric.viewsByDate[date];
          }
        });
      }

      if (metric.clicksByDate) {
        Object.keys(metric.clicksByDate).forEach(date => {
          if (date < cutoffDate) {
            delete metric.clicksByDate[date];
          }
        });
      }

      if (metric.addsByDate) {
        Object.keys(metric.addsByDate).forEach(date => {
          if (date < cutoffDate) {
            delete metric.addsByDate[date];
          }
        });
      }

      if (metric.purchasesByDate) {
        Object.keys(metric.purchasesByDate).forEach(date => {
          if (date < cutoffDate) {
            delete metric.purchasesByDate[date];
          }
        });
      }

      if (metric.reviewsByDate) {
        Object.keys(metric.reviewsByDate).forEach(date => {
          if (date < cutoffDate) {
            delete metric.reviewsByDate[date];
          }
        });
      }

      if (metric.comparisonsByDate) {
        Object.keys(metric.comparisonsByDate).forEach(date => {
          if (date < cutoffDate) {
            delete metric.comparisonsByDate[date];
          }
        });
      }
    });
  });

  // Clean up old conversion events
  conversionEvents.events = conversionEvents.events.filter(event =>
    event.timestamp >= cutoffTime
  );

  // Save cleaned data
  productMetrics.lastUpdated = now;
  conversionEvents.lastUpdated = now;
  saveProductMetrics(productMetrics);
  saveConversionEvents(conversionEvents);
}

/**
 * Generate product performance report
 * @param {string} productId - Product ID (optional, if omitted will report on all products)
 * @param {string} timePeriod - Time period for the report
 * @param {Date} startDate - Start date for custom time period
 * @param {Date} endDate - End date for custom time period
 * @returns {Object} Product performance report
 */
function generateProductPerformanceReport(productId = null, timePeriod = 'last30days', startDate = null, endDate = null) {
  // Use date range from main analytics if available
  let dateRange;
  if (window.Analytics && typeof window.Analytics.TIME_PERIODS === 'object' &&
      typeof window.Analytics.getDateRangeForPeriod === 'function') {
    dateRange = window.Analytics.getDateRangeForPeriod(timePeriod, startDate, endDate);
  } else {
    // Simple implementation
    const now = new Date();
    const start = new Date();
    if (timePeriod === 'last30days') {
      start.setDate(start.getDate() - 30);
    } else if (timePeriod === 'last7days') {
      start.setDate(start.getDate() - 7);
    } else if (timePeriod === 'custom' && startDate && endDate) {
      start = new Date(startDate);
      now = new Date(endDate);
    }
    dateRange = { startDate: start, endDate: now };
  }

  const productMetrics = getProductMetrics();
  const conversionEvents = getConversionEvents();

  // Filter events by date range
  const filteredEvents = conversionEvents.events.filter(event => {
    const eventDate = new Date(event.timestamp);
    return eventDate >= dateRange.startDate && eventDate <= dateRange.endDate;
  });

  // Filter events by product if specified
  const relevantEvents = productId ?
    filteredEvents.filter(event => event.productId === productId) :
    filteredEvents;

  // Initialize report
  const report = {
    dateRange: {
      start: dateRange.startDate,
      end: dateRange.endDate
    },
    overall: {
      views: 0,
      clicks: 0,
      addToCart: 0,
      purchases: 0,
      reviews: 0,
      conversionRate: 0
    },
    products: {},
    conversionFunnel: {
      viewToClick: 0,
      clickToCart: 0,
      cartToPurchase: 0,
      viewToPurchase: 0
    },
    topProducts: {
      byViews: [],
      byClicks: [],
      byPurchases: [],
      byRevenue: [],
      byRating: []
    }
  };

  // Process each product
  const productIds = productId ? [productId] : Object.keys(productMetrics.productViews);

  productIds.forEach(id => {
    // Ensure we only process products that have view data
    if (!productMetrics.productViews[id]) return;

    // Initialize product stats
    report.products[id] = {
      views: 0,
      clicks: 0,
      addToCart: 0,
      purchases: 0,
      reviews: 0,
      revenue: 0,
      rating: 0,
      conversionRate: 0
    };

    // Count product views
    const viewMetric = productMetrics.productViews[id];
    if (viewMetric) {
      Object.keys(viewMetric.viewsByDate || {}).forEach(date => {
        const viewDate = new Date(date);
        if (viewDate >= dateRange.startDate && viewDate <= dateRange.endDate) {
          const views = viewMetric.viewsByDate[date];
          report.products[id].views += views;
          report.overall.views += views;
        }
      });
    }

    // Count product clicks
    const clickMetric = productMetrics.productClicks[id];
    if (clickMetric) {
      Object.keys(clickMetric.clicksByDate || {}).forEach(date => {
        const clickDate = new Date(date);
        if (clickDate >= dateRange.startDate && clickDate <= dateRange.endDate) {
          const clicks = clickMetric.clicksByDate[date];
          report.products[id].clicks += clicks;
          report.overall.clicks += clicks;
        }
      });
    }

    // Count add to cart events
    const cartMetric = productMetrics.addToCart[id];
    if (cartMetric) {
      Object.keys(cartMetric.addsByDate || {}).forEach(date => {
        const addDate = new Date(date);
        if (addDate >= dateRange.startDate && addDate <= dateRange.endDate) {
          const adds = cartMetric.addsByDate[date].adds;
          report.products[id].addToCart += adds;
          report.overall.addToCart += adds;
        }
      });
    }

    // Count purchases
    const purchaseMetric = productMetrics.purchases[id];
    if (purchaseMetric) {
      Object.keys(purchaseMetric.purchasesByDate || {}).forEach(date => {
        const purchaseDate = new Date(date);
        if (purchaseDate >= dateRange.startDate && purchaseDate <= dateRange.endDate) {
          const purchases = purchaseMetric.purchasesByDate[date].purchases;
          const revenue = purchaseMetric.purchasesByDate[date].revenue;
          report.products[id].purchases += purchases;
          report.products[id].revenue += revenue;
          report.overall.purchases += purchases;
        }
      });
    }

    // Calculate product rating
    const reviewMetric = productMetrics.reviews[id];
    if (reviewMetric && reviewMetric.totalReviews > 0) {
      let periodReviews = 0;
      let periodRatingSum = 0;

      Object.keys(reviewMetric.reviewsByDate || {}).forEach(date => {
        const reviewDate = new Date(date);
        if (reviewDate >= dateRange.startDate && reviewDate <= dateRange.endDate) {
          periodReviews += reviewMetric.reviewsByDate[date].reviews;
          periodRatingSum += reviewMetric.reviewsByDate[date].ratingSum;
        }
      });

      if (periodReviews > 0) {
        report.products[id].rating = periodRatingSum / periodReviews;
        report.products[id].reviews = periodReviews;
        report.overall.reviews += periodReviews;
      } else {
        // If no reviews in this period, use the overall rating
        report.products[id].rating = reviewMetric.ratingSum / reviewMetric.totalReviews;
      }
    }

    // Calculate conversion rate for the product
    if (report.products[id].views > 0 && report.products[id].purchases > 0) {
      report.products[id].conversionRate = (report.products[id].purchases / report.products[id].views) * 100;
    }
  });

  // Calculate overall conversion rate
  if (report.overall.views > 0 && report.overall.purchases > 0) {
    report.overall.conversionRate = (report.overall.purchases / report.overall.views) * 100;
  }

  // Calculate conversion funnel metrics
  if (report.overall.views > 0 && report.overall.clicks > 0) {
    report.conversionFunnel.viewToClick = (report.overall.clicks / report.overall.views) * 100;
  }
  if (report.overall.clicks > 0 && report.overall.addToCart > 0) {
    report.conversionFunnel.clickToCart = (report.overall.addToCart / report.overall.clicks) * 100;
  }
  if (report.overall.addToCart > 0 && report.overall.purchases > 0) {
    report.conversionFunnel.cartToPurchase = (report.overall.purchases / report.overall.addToCart) * 100;
  }
  if (report.overall.views > 0 && report.overall.purchases > 0) {
    report.conversionFunnel.viewToPurchase = (report.overall.purchases / report.overall.views) * 100;
  }

  // Create top products lists
  report.topProducts.byViews = Object.keys(report.products)
    .map(id => ({ id, value: report.products[id].views }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  report.topProducts.byClicks = Object.keys(report.products)
    .map(id => ({ id, value: report.products[id].clicks }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  report.topProducts.byPurchases = Object.keys(report.products)
    .map(id => ({ id, value: report.products[id].purchases }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  report.topProducts.byRevenue = Object.keys(report.products)
    .map(id => ({ id, value: report.products[id].revenue }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  report.topProducts.byRating = Object.keys(report.products)
    .filter(id => report.products[id].rating > 0)
    .map(id => ({ id, value: report.products[id].rating }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  return report;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  initProductAnalytics();
});

// Export functionality
window.ProductAnalytics = {
  // Tracking functions
  trackProductView,
  trackProductClick,
  trackAddToCart,
  trackPurchase,
  trackProductReview,
  trackProductComparison,

  // Reporting
  generateProductPerformanceReport,

  // Constants
  EVENT_TYPES: PRODUCT_EVENT_TYPES
};
