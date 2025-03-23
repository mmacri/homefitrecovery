/**
 * Recovery Essentials - Product Analytics Dashboard
 * This script handles the UI for the product analytics dashboard
 */

// Dashboard state
let dashboardState = {
  timePeriod: 'last30days',
  startDate: null,
  endDate: null,
  selectedProductId: null,
  selectedCategory: null,
  currentMetric: 'views',
  currentRanking: 'views',
  report: null
};

// Charts references
let performanceChart = null;
let funnelChart = null;

/**
 * Initialize the dashboard
 */
function initProductAnalyticsDashboard() {
  // Populate product and category filters
  populateProductFilter();
  populateCategoryFilter();

  // Set up event listeners
  setupEventListeners();

  // Load initial report
  loadProductReport();

  // Set up charts
  setupCharts();
}

/**
 * Populate the product filter dropdown
 */
function populateProductFilter() {
  const productFilter = document.getElementById('product-filter');
  if (!productFilter) return;

  // Get products
  const products = getProducts();

  // Clear existing options (except "All Products")
  while (productFilter.options.length > 1) {
    productFilter.remove(1);
  }

  // Add product options
  products.forEach(product => {
    const option = document.createElement('option');
    option.value = product.id;
    option.textContent = product.name;
    productFilter.appendChild(option);
  });
}

/**
 * Populate the category filter dropdown
 */
function populateCategoryFilter() {
  const categoryFilter = document.getElementById('category-filter');
  if (!categoryFilter) return;

  // Get categories
  const categories = getCategories();

  // Clear existing options (except "All Categories")
  while (categoryFilter.options.length > 1) {
    categoryFilter.remove(1);
  }

  // Add category options
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.name;
    categoryFilter.appendChild(option);
  });
}

/**
 * Get all products
 * @returns {Array} Array of product objects
 */
function getProducts() {
  // Get products from local storage or other source
  const productsData = localStorage.getItem('recoveryEssentials_products');
  return productsData ? JSON.parse(productsData) : [];
}

/**
 * Get all categories
 * @returns {Array} Array of category objects
 */
function getCategories() {
  // Get categories from local storage or other source
  const categoriesData = localStorage.getItem('recoveryEssentials_categories');
  return categoriesData ? JSON.parse(categoriesData) : [];
}

/**
 * Set up event listeners for the dashboard
 */
function setupEventListeners() {
  // Time period selection
  const timePeriodSelect = document.getElementById('product-time-period');
  if (timePeriodSelect) {
    timePeriodSelect.addEventListener('change', function() {
      dashboardState.timePeriod = this.value;
      toggleCustomDateRange(this.value === 'custom');

      if (this.value !== 'custom') {
        loadProductReport();
      }
    });
  }

  // Custom date range
  const applyDateRangeBtn = document.getElementById('product-apply-date-range');
  if (applyDateRangeBtn) {
    applyDateRangeBtn.addEventListener('click', function() {
      const startDateInput = document.getElementById('product-start-date');
      const endDateInput = document.getElementById('product-end-date');

      if (startDateInput && endDateInput && startDateInput.value && endDateInput.value) {
        dashboardState.startDate = new Date(startDateInput.value);
        dashboardState.endDate = new Date(endDateInput.value);
        loadProductReport();
      } else {
        alert('Please select both start and end dates.');
      }
    });
  }

  // Apply filters button
  const applyFiltersBtn = document.getElementById('apply-product-filters');
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', function() {
      const productFilter = document.getElementById('product-filter');
      const categoryFilter = document.getElementById('category-filter');

      dashboardState.selectedProductId = productFilter && productFilter.value !== 'all' ? productFilter.value : null;
      dashboardState.selectedCategory = categoryFilter && categoryFilter.value !== 'all' ? categoryFilter.value : null;

      loadProductReport();
    });
  }

  // Metric toggle buttons
  const metricToggleButtons = document.querySelectorAll('.metric-toggle');
  metricToggleButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Update active state
      metricToggleButtons.forEach(btn => {
        btn.classList.remove('bg-indigo-600', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
      });
      this.classList.remove('bg-gray-200', 'text-gray-700');
      this.classList.add('bg-indigo-600', 'text-white');

      // Update current metric
      dashboardState.currentMetric = this.getAttribute('data-metric');

      // Update chart
      updatePerformanceChart();
    });
  });

  // Ranking toggle buttons
  const rankingToggleButtons = document.querySelectorAll('.ranking-toggle');
  rankingToggleButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Update active state
      rankingToggleButtons.forEach(btn => {
        btn.classList.remove('bg-indigo-600', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
      });
      this.classList.remove('bg-gray-200', 'text-gray-700');
      this.classList.add('bg-indigo-600', 'text-white');

      // Update current ranking
      dashboardState.currentRanking = this.getAttribute('data-ranking');

      // Update top products list
      updateTopProductsList();
    });
  });

  // Export button
  const exportBtn = document.getElementById('product-export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportProductAnalytics);
  }
}

/**
 * Toggle the visibility of the custom date range inputs
 * @param {boolean} show - Whether to show or hide the custom date inputs
 */
function toggleCustomDateRange(show) {
  const customDateRange = document.getElementById('product-custom-date-range');
  if (customDateRange) {
    customDateRange.classList.toggle('hidden', !show);
  }
}

/**
 * Load the product performance report based on current dashboard state
 */
function loadProductReport() {
  // Show loading state
  showLoadingState();

  // Get report from ProductAnalytics module
  if (window.ProductAnalytics && typeof window.ProductAnalytics.generateProductPerformanceReport === 'function') {
    dashboardState.report = window.ProductAnalytics.generateProductPerformanceReport(
      dashboardState.selectedProductId,
      dashboardState.timePeriod,
      dashboardState.startDate,
      dashboardState.endDate
    );

    // Update dashboard with the report data
    updateDashboardWithReport();
  } else {
    console.error('ProductAnalytics module not available.');
    showErrorState('Product Analytics module not loaded. Please refresh the page.');
  }
}

/**
 * Show loading state for all dashboard components
 */
function showLoadingState() {
  // Set loading text for overview cards
  document.getElementById('total-product-views').textContent = '...';
  document.getElementById('total-add-to-cart').textContent = '...';
  document.getElementById('total-purchases').textContent = '...';
  document.getElementById('product-conversion-rate').textContent = '...';

  // Set loading text for funnel rates
  document.getElementById('view-to-click-rate').textContent = '...';
  document.getElementById('click-to-cart-rate').textContent = '...';
  document.getElementById('cart-to-purchase-rate').textContent = '...';
  document.getElementById('view-to-purchase-rate').textContent = '...';

  // Show loading message in product list
  const topProductsList = document.getElementById('top-products-list');
  if (topProductsList) {
    topProductsList.innerHTML = '<div class="text-center text-gray-400 py-10">Loading top products...</div>';
  }

  // Show loading message in performance table
  const tbody = document.getElementById('product-performance-tbody');
  if (tbody) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-gray-400">Loading product data...</td></tr>';
  }
}

/**
 * Show error state for dashboard components
 * @param {string} message - Error message to display
 */
function showErrorState(message) {
  // Set error text for overview cards
  document.getElementById('total-product-views').textContent = '-';
  document.getElementById('total-add-to-cart').textContent = '-';
  document.getElementById('total-purchases').textContent = '-';
  document.getElementById('product-conversion-rate').textContent = '-';

  // Set error text for funnel rates
  document.getElementById('view-to-click-rate').textContent = '-';
  document.getElementById('click-to-cart-rate').textContent = '-';
  document.getElementById('cart-to-purchase-rate').textContent = '-';
  document.getElementById('view-to-purchase-rate').textContent = '-';

  // Show error message in product list
  const topProductsList = document.getElementById('top-products-list');
  if (topProductsList) {
    topProductsList.innerHTML = `<div class="text-center text-red-500 py-10">${message}</div>`;
  }

  // Show error message in performance table
  const tbody = document.getElementById('product-performance-tbody');
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-red-500">${message}</td></tr>`;
  }
}

/**
 * Set up the charts
 */
function setupCharts() {
  setupPerformanceChart();
  setupFunnelChart();
}

/**
 * Set up the product performance chart
 */
function setupPerformanceChart() {
  const chartElement = document.getElementById('product-performance-chart');
  if (!chartElement) return;

  const ctx = chartElement.getContext('2d');
  if (!ctx) return;

  // Create empty chart initially
  performanceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Views',
        data: [],
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.1,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        }
      }
    }
  });
}

/**
 * Set up the conversion funnel chart
 */
function setupFunnelChart() {
  const chartElement = document.getElementById('conversion-funnel-chart');
  if (!chartElement) return;

  const ctx = chartElement.getContext('2d');
  if (!ctx) return;

  // Create empty chart initially
  funnelChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Views', 'Clicks', 'Add to Cart', 'Purchases'],
      datasets: [{
        data: [0, 0, 0, 0],
        backgroundColor: [
          'rgba(79, 70, 229, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)'
        ],
        borderColor: [
          'rgb(79, 70, 229)',
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        y: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

/**
 * Update the dashboard with the report data
 */
function updateDashboardWithReport() {
  if (!dashboardState.report) return;

  // Update overview cards
  updateOverviewCards();

  // Update conversion funnel
  updateConversionFunnel();

  // Update performance chart
  updatePerformanceChart();

  // Update top products list
  updateTopProductsList();

  // Update performance table
  updatePerformanceTable();
}

/**
 * Update the overview cards with report data
 */
function updateOverviewCards() {
  const report = dashboardState.report;
  if (!report || !report.overall) return;

  // Update values in overview cards
  document.getElementById('total-product-views').textContent = report.overall.views.toLocaleString();
  document.getElementById('total-add-to-cart').textContent = report.overall.addToCart.toLocaleString();
  document.getElementById('total-purchases').textContent = report.overall.purchases.toLocaleString();

  // Format conversion rate to 2 decimal places
  const conversionRate = report.overall.conversionRate.toFixed(2);
  document.getElementById('product-conversion-rate').textContent = `${conversionRate}%`;
}

/**
 * Update the conversion funnel with report data
 */
function updateConversionFunnel() {
  const report = dashboardState.report;
  if (!report || !report.conversionFunnel) return;

  // Update funnel rate values
  document.getElementById('view-to-click-rate').textContent = `${report.conversionFunnel.viewToClick.toFixed(2)}%`;
  document.getElementById('click-to-cart-rate').textContent = `${report.conversionFunnel.clickToCart.toFixed(2)}%`;
  document.getElementById('cart-to-purchase-rate').textContent = `${report.conversionFunnel.cartToPurchase.toFixed(2)}%`;
  document.getElementById('view-to-purchase-rate').textContent = `${report.conversionFunnel.viewToPurchase.toFixed(2)}%`;

  // Update funnel chart
  if (funnelChart) {
    funnelChart.data.datasets[0].data = [
      report.overall.views,
      report.overall.clicks,
      report.overall.addToCart,
      report.overall.purchases
    ];
    funnelChart.update();
  }
}

/**
 * Update the performance chart with report data
 */
function updatePerformanceChart() {
  const report = dashboardState.report;
  if (!report || !performanceChart) return;

  // Get dates from the report
  const dates = Object.keys(report.overall.dailyTotals || {}).sort();

  // Prepare data for the selected metric
  let data = [];
  let label = 'Views';
  let color = 'rgb(79, 70, 229)';
  let backgroundColor = 'rgba(79, 70, 229, 0.1)';

  switch (dashboardState.currentMetric) {
    case 'views':
      data = dates.map(date => {
        return calculateDailyMetric(date, 'views');
      });
      label = 'Views';
      color = 'rgb(79, 70, 229)';
      backgroundColor = 'rgba(79, 70, 229, 0.1)';
      break;

    case 'clicks':
      data = dates.map(date => {
        return calculateDailyMetric(date, 'clicks');
      });
      label = 'Clicks';
      color = 'rgb(59, 130, 246)';
      backgroundColor = 'rgba(59, 130, 246, 0.1)';
      break;

    case 'cart':
      data = dates.map(date => {
        return calculateDailyMetric(date, 'addToCart');
      });
      label = 'Add to Cart';
      color = 'rgb(16, 185, 129)';
      backgroundColor = 'rgba(16, 185, 129, 0.1)';
      break;

    case 'purchases':
      data = dates.map(date => {
        return calculateDailyMetric(date, 'purchases');
      });
      label = 'Purchases';
      color = 'rgb(245, 158, 11)';
      backgroundColor = 'rgba(245, 158, 11, 0.1)';
      break;
  }

  // Update chart data
  performanceChart.data.labels = formatDates(dates);
  performanceChart.data.datasets[0].data = data;
  performanceChart.data.datasets[0].label = label;
  performanceChart.data.datasets[0].borderColor = color;
  performanceChart.data.datasets[0].backgroundColor = backgroundColor;
  performanceChart.update();
}

/**
 * Calculate the daily metric value for a specific date
 * @param {string} date - Date string
 * @param {string} metric - Metric name
 * @returns {number} Metric value
 */
function calculateDailyMetric(date, metric) {
  const report = dashboardState.report;
  if (!report || !report.products) return 0;

  // If filtering by a specific product, return that product's metric
  if (dashboardState.selectedProductId && report.products[dashboardState.selectedProductId]) {
    const product = report.products[dashboardState.selectedProductId];

    // Return specific daily metrics based on the metric type
    switch (metric) {
      case 'views':
        // This assumes that product daily data has a property for each date with the view count
        return product.dailyViews && product.dailyViews[date] ? product.dailyViews[date] : 0;

      case 'clicks':
        return product.dailyClicks && product.dailyClicks[date] ? product.dailyClicks[date] : 0;

      case 'addToCart':
        return product.dailyAddToCart && product.dailyAddToCart[date] ? product.dailyAddToCart[date] : 0;

      case 'purchases':
        return product.dailyPurchases && product.dailyPurchases[date] ? product.dailyPurchases[date] : 0;
    }
  }

  // Otherwise return the overall metric for the date
  // This is assuming the report structure contains these daily totals
  if (metric === 'views' && report.overall.dailyViews) {
    return report.overall.dailyViews[date] || 0;
  }
  else if (metric === 'clicks' && report.overall.dailyClicks) {
    return report.overall.dailyClicks[date] || 0;
  }
  else if (metric === 'addToCart' && report.overall.dailyAddToCart) {
    return report.overall.dailyAddToCart[date] || 0;
  }
  else if (metric === 'purchases' && report.overall.dailyPurchases) {
    return report.overall.dailyPurchases[date] || 0;
  }

  // Fallback - return 0 if data not available
  return 0;
}

/**
 * Format dates for display in chart
 * @param {Array} dates - Array of date strings
 * @returns {Array} Array of formatted date strings
 */
function formatDates(dates) {
  return dates.map(dateStr => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
}

/**
 * Update the top products list with report data
 */
function updateTopProductsList() {
  const report = dashboardState.report;
  if (!report || !report.topProducts) return;

  const topProductsList = document.getElementById('top-products-list');
  if (!topProductsList) return;

  // Get top products by the selected ranking metric
  let topProducts = [];

  switch (dashboardState.currentRanking) {
    case 'views':
      topProducts = report.topProducts.byViews;
      break;

    case 'purchases':
      topProducts = report.topProducts.byPurchases;
      break;

    case 'revenue':
      topProducts = report.topProducts.byRevenue;
      break;
  }

  // Clear the list
  topProductsList.innerHTML = '';

  // Check if we have any products
  if (topProducts.length === 0) {
    topProductsList.innerHTML = '<div class="text-center text-gray-400 py-10">No products found</div>';
    return;
  }

  // Get all products to get the names
  const products = getProducts();

  // Create the list items
  topProducts.forEach((item, index) => {
    // Find the product details
    const product = products.find(p => p.id === item.id) || { name: `Product ${item.id}` };

    // Create list item
    const listItem = document.createElement('div');
    listItem.className = 'flex items-center justify-between py-2 px-4 border-b border-gray-100';

    const rank = document.createElement('span');
    rank.className = 'flex items-center';
    rank.innerHTML = `<span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs flex items-center justify-center mr-2">${index + 1}</span> ${product.name}`;

    const value = document.createElement('span');
    value.className = 'font-medium';

    // Format the value based on ranking type
    if (dashboardState.currentRanking === 'revenue') {
      value.textContent = `$${item.value.toFixed(2)}`;
    } else {
      value.textContent = item.value.toLocaleString();
    }

    listItem.appendChild(rank);
    listItem.appendChild(value);
    topProductsList.appendChild(listItem);
  });
}

/**
 * Update the performance table with report data
 */
function updatePerformanceTable() {
  const report = dashboardState.report;
  if (!report || !report.products) return;

  const tbody = document.getElementById('product-performance-tbody');
  if (!tbody) return;

  // Clear the table
  tbody.innerHTML = '';

  // Get all products to get the names
  const products = getProducts();

  // Get product IDs and sort by views (descending)
  const productIds = Object.keys(report.products);

  // Check if we have any products
  if (productIds.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-gray-400">No products found</td></tr>';
    return;
  }

  // Create table rows
  productIds.forEach(productId => {
    const productMetrics = report.products[productId];
    if (!productMetrics) return;

    // Find the product details
    const product = products.find(p => p.id === productId) || { name: `Product ${productId}` };

    // Create row
    const row = document.createElement('tr');
    row.className = 'hover:bg-gray-50';

    // Product name
    const nameCell = document.createElement('td');
    nameCell.className = 'px-6 py-4 whitespace-nowrap';
    nameCell.innerHTML = `<div class="flex items-center">
      <div class="text-sm font-medium text-gray-900">${product.name}</div>
    </div>`;

    // Views
    const viewsCell = document.createElement('td');
    viewsCell.className = 'px-6 py-4 whitespace-nowrap';
    viewsCell.innerHTML = `<div class="text-sm text-gray-900">${productMetrics.views.toLocaleString()}</div>`;

    // Clicks
    const clicksCell = document.createElement('td');
    clicksCell.className = 'px-6 py-4 whitespace-nowrap';
    clicksCell.innerHTML = `<div class="text-sm text-gray-900">${productMetrics.clicks.toLocaleString()}</div>`;

    // Add to Cart
    const cartCell = document.createElement('td');
    cartCell.className = 'px-6 py-4 whitespace-nowrap';
    cartCell.innerHTML = `<div class="text-sm text-gray-900">${productMetrics.addToCart.toLocaleString()}</div>`;

    // Purchases
    const purchasesCell = document.createElement('td');
    purchasesCell.className = 'px-6 py-4 whitespace-nowrap';
    purchasesCell.innerHTML = `<div class="text-sm text-gray-900">${productMetrics.purchases.toLocaleString()}</div>`;

    // Revenue
    const revenueCell = document.createElement('td');
    revenueCell.className = 'px-6 py-4 whitespace-nowrap';
    revenueCell.innerHTML = `<div class="text-sm text-gray-900">$${productMetrics.revenue.toFixed(2)}</div>`;

    // Conversion Rate
    const conversionCell = document.createElement('td');
    conversionCell.className = 'px-6 py-4 whitespace-nowrap';
    conversionCell.innerHTML = `<div class="text-sm text-gray-900">${productMetrics.conversionRate.toFixed(2)}%</div>`;

    // Add cells to row
    row.appendChild(nameCell);
    row.appendChild(viewsCell);
    row.appendChild(clicksCell);
    row.appendChild(cartCell);
    row.appendChild(purchasesCell);
    row.appendChild(revenueCell);
    row.appendChild(conversionCell);

    // Add row to table
    tbody.appendChild(row);
  });
}

/**
 * Export product analytics data
 */
function exportProductAnalytics() {
  const format = document.getElementById('product-export-format').value || 'json';
  const dataType = document.getElementById('product-export-data').value || 'summary';

  if (!dashboardState.report) {
    alert('No data available to export. Please generate a report first.');
    return;
  }

  let exportData;
  let filename;

  // Prepare the export data based on selected type
  switch (dataType) {
    case 'summary':
      exportData = {
        dateRange: dashboardState.report.dateRange,
        overall: dashboardState.report.overall,
        conversionFunnel: dashboardState.report.conversionFunnel,
        topProducts: dashboardState.report.topProducts
      };
      filename = 'product-analytics-summary';
      break;

    case 'details':
      exportData = {
        dateRange: dashboardState.report.dateRange,
        overall: dashboardState.report.overall,
        conversionFunnel: dashboardState.report.conversionFunnel,
        products: dashboardState.report.products
      };
      filename = 'product-analytics-detailed';
      break;

    case 'raw':
      exportData = dashboardState.report;
      filename = 'product-analytics-raw';
      break;
  }

  // Format the data based on selected format
  let dataString;
  let mimeType;

  if (format === 'json') {
    dataString = JSON.stringify(exportData, null, 2);
    mimeType = 'application/json';
    filename += '.json';
  } else if (format === 'csv') {
    dataString = convertToCSV(exportData, dataType);
    mimeType = 'text/csv';
    filename += '.csv';
  }

  // Create and trigger download
  const blob = new Blob([dataString], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Convert data to CSV format
 * @param {Object} data - Data to convert
 * @param {string} type - Type of data
 * @returns {string} CSV string
 */
function convertToCSV(data, type) {
  // Simple implementation for summary data
  if (type === 'summary') {
    let csv = 'Metric,Value\n';
    csv += `Date Range,${formatDateRange(data.dateRange)}\n`;
    csv += `Total Views,${data.overall.views}\n`;
    csv += `Total Clicks,${data.overall.clicks}\n`;
    csv += `Total Add to Cart,${data.overall.addToCart}\n`;
    csv += `Total Purchases,${data.overall.purchases}\n`;
    csv += `Overall Conversion Rate,${data.overall.conversionRate.toFixed(2)}%\n`;
    return csv;
  }

  // More complex implementation for detailed data would go here
  return 'Export as JSON for more detailed data';
}

/**
 * Format a date range for display
 * @param {Object} dateRange - Date range object
 * @returns {string} Formatted date range
 */
function formatDateRange(dateRange) {
  if (!dateRange || !dateRange.start || !dateRange.end) return 'N/A';

  const start = new Date(dateRange.start);
  const end = new Date(dateRange.end);

  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
}

// Initialize the dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', initProductAnalyticsDashboard);
