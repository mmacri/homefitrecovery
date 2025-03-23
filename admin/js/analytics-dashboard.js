/**
 * Recovery Essentials - Analytics Dashboard
 * This script handles the analytics dashboard UI and data visualization
 */

// Chart instances
let trafficChart = null;

// Current report data
let pageViewReport = null;
let affiliateReport = null;
let userActivityReport = null;

// Current time period
let currentTimePeriod = Analytics.TIME_PERIODS.LAST_30_DAYS;
let customStartDate = null;
let customEndDate = null;

// Initialize the dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Setup event listeners
  setupEventListeners();

  // Load initial analytics data with default time period
  loadAnalyticsData();

  // Load settings
  loadSettings();
});

/**
 * Set up dashboard event listeners
 */
function setupEventListeners() {
  // Time period selection
  const timePeriodSelect = document.getElementById('time-period');
  if (timePeriodSelect) {
    timePeriodSelect.addEventListener('change', function() {
      currentTimePeriod = this.value;

      // Show/hide custom date range inputs
      const customDateRangeDiv = document.getElementById('custom-date-range');
      if (currentTimePeriod === 'custom') {
        customDateRangeDiv.classList.remove('hidden');
      } else {
        customDateRangeDiv.classList.add('hidden');
        loadAnalyticsData();
      }
    });
  }

  // Custom date range
  const applyDateRangeBtn = document.getElementById('apply-date-range');
  if (applyDateRangeBtn) {
    applyDateRangeBtn.addEventListener('click', function() {
      const startDateInput = document.getElementById('start-date');
      const endDateInput = document.getElementById('end-date');

      if (startDateInput.value && endDateInput.value) {
        customStartDate = new Date(startDateInput.value);
        customEndDate = new Date(endDateInput.value);
        loadAnalyticsData();
      } else {
        showNotification('Please select both start and end dates', 'error');
      }
    });
  }

  // Report export
  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportReport);
  }

  // Settings save
  const saveSettingsBtn = document.getElementById('save-settings-btn');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', saveSettings);
  }

  // Sampling checkbox
  const enableSamplingCheckbox = document.getElementById('enable-sampling');
  if (enableSamplingCheckbox) {
    enableSamplingCheckbox.addEventListener('change', function() {
      const samplingRateInput = document.getElementById('sampling-rate');
      samplingRateInput.disabled = !this.checked;
    });
  }
}

/**
 * Load analytics data based on current time period
 */
function loadAnalyticsData() {
  // Show loading indicators
  showLoading();

  // Generate reports
  if (currentTimePeriod === 'custom' && customStartDate && customEndDate) {
    pageViewReport = Analytics.generatePageViewReport(currentTimePeriod, customStartDate, customEndDate);
    affiliateReport = Analytics.generateAffiliateReport(currentTimePeriod, customStartDate, customEndDate);
    userActivityReport = Analytics.generateUserActivityReport(currentTimePeriod, customStartDate, customEndDate);
  } else {
    pageViewReport = Analytics.generatePageViewReport(currentTimePeriod);
    affiliateReport = Analytics.generateAffiliateReport(currentTimePeriod);
    userActivityReport = Analytics.generateUserActivityReport(currentTimePeriod);
  }

  // Update UI with report data
  updateDashboardUI();
}

/**
 * Show loading indicators
 */
function showLoading() {
  document.getElementById('total-page-views').textContent = '-';
  document.getElementById('total-affiliate-clicks').textContent = '-';
  document.getElementById('total-user-activities').textContent = '-';
  document.getElementById('conversion-rate').textContent = '-';

  document.getElementById('top-pages-list').innerHTML = '<div class="text-center text-gray-500 py-4">Loading data...</div>';
  document.getElementById('affiliate-performance').innerHTML = '<div class="text-center text-gray-500 py-4">Loading data...</div>';
  document.getElementById('user-activity').innerHTML = '<div class="text-center text-gray-500 py-4">Loading data...</div>';
}

/**
 * Update the dashboard UI with report data
 */
function updateDashboardUI() {
  // Update summary cards
  document.getElementById('total-page-views').textContent = pageViewReport.totalViews.toLocaleString();
  document.getElementById('total-affiliate-clicks').textContent = affiliateReport.totalClicks.toLocaleString();
  document.getElementById('total-user-activities').textContent = userActivityReport.totalActivities.toLocaleString();

  // Calculate conversion rate (clicks / views)
  const conversionRate = pageViewReport.totalViews > 0
    ? ((affiliateReport.totalClicks / pageViewReport.totalViews) * 100).toFixed(2)
    : '0.00';
  document.getElementById('conversion-rate').textContent = `${conversionRate}%`;

  // Render traffic chart
  renderTrafficChart();

  // Render top pages list
  renderTopPagesList();

  // Render affiliate performance
  renderAffiliatePerformance();

  // Render user activity
  renderUserActivity();
}

/**
 * Render the traffic over time chart
 */
function renderTrafficChart() {
  const chartContainer = document.getElementById('traffic-chart');
  if (!chartContainer) return;

  // Prepare data
  const labels = Object.keys(pageViewReport.dailyTotals);
  const pageViewData = Object.values(pageViewReport.dailyTotals);
  const affiliateData = labels.map(date => affiliateReport.dailyTotals[date] || 0);

  // Destroy existing chart if it exists
  if (trafficChart) {
    trafficChart.destroy();
  }

  // Create new chart
  const ctx = document.createElement('canvas');
  chartContainer.innerHTML = '';
  chartContainer.appendChild(ctx);

  trafficChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Page Views',
          data: pageViewData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Affiliate Clicks',
          data: affiliateData,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true
        }
      },
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        tooltip: {
          enabled: true
        }
      }
    }
  });
}

/**
 * Render the top pages list
 */
function renderTopPagesList() {
  const container = document.getElementById('top-pages-list');
  if (!container) return;

  if (pageViewReport.topPages.length === 0) {
    container.innerHTML = '<div class="text-center text-gray-500 py-4">No page view data available</div>';
    return;
  }

  let html = '<div class="space-y-3">';

  pageViewReport.topPages.slice(0, 10).forEach((page, index) => {
    const percentage = pageViewReport.totalViews > 0
      ? ((page.views / pageViewReport.totalViews) * 100).toFixed(1)
      : '0.0';

    html += `
      <div class="flex items-center">
        <span class="font-semibold text-gray-700 w-7">${index + 1}.</span>
        <div class="flex-1 ml-2">
          <div class="text-sm font-medium text-gray-800 truncate" title="${page.page}">${page.page}</div>
          <div class="flex items-center">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full" style="width: ${percentage}%"></div>
            </div>
            <span class="text-xs text-gray-500 ml-2">${page.views.toLocaleString()} (${percentage}%)</span>
          </div>
        </div>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
}

/**
 * Render affiliate performance
 */
function renderAffiliatePerformance() {
  const container = document.getElementById('affiliate-performance');
  if (!container) return;

  if (affiliateReport.topProducts.length === 0) {
    container.innerHTML = '<div class="text-center text-gray-500 py-4">No affiliate click data available</div>';
    return;
  }

  // Create product performance table
  let html = `
    <div class="overflow-x-auto">
      <table class="min-w-full">
        <thead>
          <tr>
            <th class="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
            <th class="text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
            <th class="text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Share</th>
          </tr>
        </thead>
        <tbody>
  `;

  affiliateReport.topProducts.slice(0, 10).forEach(product => {
    const percentage = affiliateReport.totalClicks > 0
      ? ((product.clicks / affiliateReport.totalClicks) * 100).toFixed(1)
      : '0.0';

    html += `
      <tr class="hover:bg-gray-50">
        <td class="py-2 text-sm font-medium text-gray-800">${product.productId}</td>
        <td class="py-2 text-sm text-gray-600 text-right">${product.clicks.toLocaleString()}</td>
        <td class="py-2 text-sm text-gray-600 text-right">${percentage}%</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;
}

/**
 * Render user activity
 */
function renderUserActivity() {
  const container = document.getElementById('user-activity');
  if (!container) return;

  if (userActivityReport.topActions.length === 0) {
    container.innerHTML = '<div class="text-center text-gray-500 py-4">No user activity data available</div>';
    return;
  }

  // Create tabs for user and action views
  let html = `
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-4">
        <button id="actions-tab" class="border-indigo-500 text-indigo-600 border-b-2 py-2 px-1 text-sm font-medium">
          Top Actions
        </button>
        <button id="users-tab" class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 py-2 px-1 text-sm font-medium">
          Active Users
        </button>
      </nav>
    </div>

    <div id="actions-content" class="pt-4">
      <div class="space-y-2">
  `;

  // Add top actions
  userActivityReport.topActions.slice(0, 8).forEach(action => {
    const percentage = userActivityReport.totalActivities > 0
      ? ((action.count / userActivityReport.totalActivities) * 100).toFixed(1)
      : '0.0';

    html += `
      <div>
        <div class="flex justify-between text-sm">
          <span class="font-medium text-gray-800">${action.action}</span>
          <span class="text-gray-600">${action.count.toLocaleString()}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
          <div class="bg-purple-600 h-2 rounded-full" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  });

  html += `
      </div>
    </div>

    <div id="users-content" class="pt-4 hidden">
      <div class="space-y-2">
  `;

  // Add most active users
  userActivityReport.mostActiveUsers.slice(0, 8).forEach(user => {
    const percentage = userActivityReport.totalActivities > 0
      ? ((user.activities / userActivityReport.totalActivities) * 100).toFixed(1)
      : '0.0';

    html += `
      <div>
        <div class="flex justify-between text-sm">
          <span class="font-medium text-gray-800">${user.userId}</span>
          <span class="text-gray-600">${user.activities.toLocaleString()} activities</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
          <div class="bg-purple-600 h-2 rounded-full" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Setup tab switching
  document.getElementById('actions-tab').addEventListener('click', function() {
    this.classList.add('border-indigo-500', 'text-indigo-600');
    this.classList.remove('border-transparent', 'text-gray-500');

    document.getElementById('users-tab').classList.remove('border-indigo-500', 'text-indigo-600');
    document.getElementById('users-tab').classList.add('border-transparent', 'text-gray-500');

    document.getElementById('actions-content').classList.remove('hidden');
    document.getElementById('users-content').classList.add('hidden');
  });

  document.getElementById('users-tab').addEventListener('click', function() {
    this.classList.add('border-indigo-500', 'text-indigo-600');
    this.classList.remove('border-transparent', 'text-gray-500');

    document.getElementById('actions-tab').classList.remove('border-indigo-500', 'text-indigo-600');
    document.getElementById('actions-tab').classList.add('border-transparent', 'text-gray-500');

    document.getElementById('users-content').classList.remove('hidden');
    document.getElementById('actions-content').classList.add('hidden');
  });
}

/**
 * Export report data
 */
function exportReport() {
  const reportType = document.getElementById('export-report').value;
  const format = document.getElementById('export-format').value;

  let reportData;
  let fileName;

  // Get the appropriate report data
  switch (reportType) {
    case 'pageViews':
      reportData = Analytics.exportReport(pageViewReport, format);
      fileName = `page-views-report.${format}`;
      break;
    case 'affiliateClicks':
      reportData = Analytics.exportReport(affiliateReport, format);
      fileName = `affiliate-clicks-report.${format}`;
      break;
    case 'userActivity':
      reportData = Analytics.exportReport(userActivityReport, format);
      fileName = `user-activity-report.${format}`;
      break;
  }

  // Create and trigger download
  if (reportData) {
    const blob = new Blob([reportData], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

/**
 * Load settings from analytics config
 */
function loadSettings() {
  const config = Analytics.getConfig();

  // Tracking options
  document.getElementById('track-pageviews').checked = config.tracking.pageViews;
  document.getElementById('track-events').checked = config.tracking.events;
  document.getElementById('track-affiliate-clicks').checked = config.tracking.affiliateClicks;
  document.getElementById('track-user-activity').checked = config.tracking.userActivity;

  // Data retention
  document.getElementById('data-retention-days').value = config.retention.dataRetentionDays;

  // Sampling
  document.getElementById('enable-sampling').checked = config.sampling.enabled;
  document.getElementById('sampling-rate').value = config.sampling.rate;
  document.getElementById('sampling-rate').disabled = !config.sampling.enabled;
}

/**
 * Save settings to analytics config
 */
function saveSettings() {
  const newConfig = {
    tracking: {
      pageViews: document.getElementById('track-pageviews').checked,
      events: document.getElementById('track-events').checked,
      affiliateClicks: document.getElementById('track-affiliate-clicks').checked,
      userActivity: document.getElementById('track-user-activity').checked
    },
    retention: {
      dataRetentionDays: parseInt(document.getElementById('data-retention-days').value, 10)
    },
    sampling: {
      enabled: document.getElementById('enable-sampling').checked,
      rate: parseInt(document.getElementById('sampling-rate').value, 10)
    }
  };

  Analytics.updateConfig(newConfig);
  showNotification('Analytics settings saved successfully', 'success');
}
