/**
 * Recovery Essentials - Analytics Module
 * This script handles analytics tracking, data collection, and reporting
 */

// Storage keys
const ANALYTICS_DATA_KEY = 'recoveryEssentials_analytics';
const ANALYTICS_CONFIG_KEY = 'recoveryEssentials_analyticsConfig';

// Default time periods for reports
const TIME_PERIODS = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: 'last7days',
  LAST_30_DAYS: 'last30days',
  THIS_MONTH: 'thisMonth',
  LAST_MONTH: 'lastMonth',
  CUSTOM: 'custom'
};

// Default analytics configuration
const DEFAULT_CONFIG = {
  tracking: {
    pageViews: true,
    events: true,
    affiliateClicks: true,
    userActivity: true
  },
  retention: {
    dataRetentionDays: 90 // How long to keep analytics data
  },
  sampling: {
    enabled: false,
    rate: 100 // Percentage of events to track (100 = all)
  }
};

/**
 * Initialize the analytics system
 */
function initAnalytics() {
  // Load or create config
  let config = JSON.parse(localStorage.getItem(ANALYTICS_CONFIG_KEY) || 'null');
  if (!config) {
    config = DEFAULT_CONFIG;
    localStorage.setItem(ANALYTICS_CONFIG_KEY, JSON.stringify(config));
  }

  // Initialize data structure if needed
  let analyticsData = JSON.parse(localStorage.getItem(ANALYTICS_DATA_KEY) || 'null');
  if (!analyticsData) {
    analyticsData = {
      pageViews: {},
      events: [],
      affiliateClicks: [],
      userActivity: [],
      lastCleanup: Date.now()
    };
    localStorage.setItem(ANALYTICS_DATA_KEY, JSON.stringify(analyticsData));
  }

  // Set up periodic data cleanup
  setupDataCleanup();

  // Return the configuration
  return config;
}

/**
 * Track a page view
 * @param {string} page - Page path or identifier
 * @param {Object} metadata - Additional metadata about the page view
 */
function trackPageView(page, metadata = {}) {
  const config = getConfig();
  if (!config.tracking.pageViews) return;

  // Apply sampling if enabled
  if (config.sampling.enabled && Math.random() * 100 > config.sampling.rate) {
    return;
  }

  const analyticsData = getAnalyticsData();
  const timestamp = Date.now();

  // Initialize page data if it doesn't exist
  if (!analyticsData.pageViews[page]) {
    analyticsData.pageViews[page] = {
      totalViews: 0,
      viewsByDate: {},
      recentViews: []
    };
  }

  // Update total views
  analyticsData.pageViews[page].totalViews++;

  // Update views by date
  const dateKey = new Date(timestamp).toISOString().split('T')[0];
  analyticsData.pageViews[page].viewsByDate[dateKey] =
    (analyticsData.pageViews[page].viewsByDate[dateKey] || 0) + 1;

  // Add to recent views (keep last 100)
  analyticsData.pageViews[page].recentViews.unshift({
    timestamp,
    ...metadata
  });

  // Trim to 100 recent views
  if (analyticsData.pageViews[page].recentViews.length > 100) {
    analyticsData.pageViews[page].recentViews =
      analyticsData.pageViews[page].recentViews.slice(0, 100);
  }

  // Save analytics data
  saveAnalyticsData(analyticsData);
}

/**
 * Track a user event
 * @param {string} eventName - Name of the event
 * @param {Object} eventData - Data associated with the event
 * @param {string} category - Event category
 */
function trackEvent(eventName, eventData = {}, category = 'general') {
  const config = getConfig();
  if (!config.tracking.events) return;

  // Apply sampling if enabled
  if (config.sampling.enabled && Math.random() * 100 > config.sampling.rate) {
    return;
  }

  const analyticsData = getAnalyticsData();
  const timestamp = Date.now();

  // Add event
  analyticsData.events.unshift({
    name: eventName,
    category,
    timestamp,
    data: eventData
  });

  // Limit to 1000 events
  if (analyticsData.events.length > 1000) {
    analyticsData.events = analyticsData.events.slice(0, 1000);
  }

  // Save analytics data
  saveAnalyticsData(analyticsData);
}

/**
 * Track an affiliate link click
 * @param {string} linkId - ID of the affiliate link
 * @param {string} productId - ID of the product
 * @param {Object} metadata - Additional metadata about the click
 */
function trackAffiliateClick(linkId, productId, metadata = {}) {
  const config = getConfig();
  if (!config.tracking.affiliateClicks) return;

  const analyticsData = getAnalyticsData();
  const timestamp = Date.now();

  // Add affiliate click
  analyticsData.affiliateClicks.unshift({
    linkId,
    productId,
    timestamp,
    ...metadata
  });

  // Limit to 1000 affiliate clicks
  if (analyticsData.affiliateClicks.length > 1000) {
    analyticsData.affiliateClicks = analyticsData.affiliateClicks.slice(0, 1000);
  }

  // Save analytics data
  saveAnalyticsData(analyticsData);
}

/**
 * Track user activity in the admin dashboard
 * @param {string} userId - ID of the user
 * @param {string} action - Action performed
 * @param {Object} details - Details about the action
 */
function trackUserActivity(userId, action, details = {}) {
  const config = getConfig();
  if (!config.tracking.userActivity) return;

  const analyticsData = getAnalyticsData();
  const timestamp = Date.now();

  // Add user activity
  analyticsData.userActivity.unshift({
    userId,
    action,
    timestamp,
    details
  });

  // Limit to 1000 user activities
  if (analyticsData.userActivity.length > 1000) {
    analyticsData.userActivity = analyticsData.userActivity.slice(0, 1000);
  }

  // Save analytics data
  saveAnalyticsData(analyticsData);
}

/**
 * Set up periodic data cleanup
 */
function setupDataCleanup() {
  // Check if cleanup is needed (daily)
  const analyticsData = getAnalyticsData();
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;

  if (now - analyticsData.lastCleanup > dayInMs) {
    cleanupOldData();
    analyticsData.lastCleanup = now;
    saveAnalyticsData(analyticsData);
  }
}

/**
 * Clean up old analytics data
 */
function cleanupOldData() {
  const config = getConfig();
  const analyticsData = getAnalyticsData();
  const now = Date.now();
  const maxAgeMs = config.retention.dataRetentionDays * 24 * 60 * 60 * 1000;
  const cutoffTime = now - maxAgeMs;

  // Clean up old events
  analyticsData.events = analyticsData.events.filter(
    event => event.timestamp >= cutoffTime
  );

  // Clean up old affiliate clicks
  analyticsData.affiliateClicks = analyticsData.affiliateClicks.filter(
    click => click.timestamp >= cutoffTime
  );

  // Clean up old user activity
  analyticsData.userActivity = analyticsData.userActivity.filter(
    activity => activity.timestamp >= cutoffTime
  );

  // Clean up old page view data
  Object.keys(analyticsData.pageViews).forEach(page => {
    // Clean up old daily stats
    const viewsByDate = analyticsData.pageViews[page].viewsByDate;
    Object.keys(viewsByDate).forEach(dateKey => {
      const dateMs = new Date(dateKey).getTime();
      if (dateMs < cutoffTime) {
        delete viewsByDate[dateKey];
      }
    });

    // Clean up old recent views
    analyticsData.pageViews[page].recentViews =
      analyticsData.pageViews[page].recentViews.filter(
        view => view.timestamp >= cutoffTime
      );
  });

  // Save cleaned data
  saveAnalyticsData(analyticsData);
}

/**
 * Get the analytics configuration
 * @returns {Object} Analytics configuration
 */
function getConfig() {
  return JSON.parse(localStorage.getItem(ANALYTICS_CONFIG_KEY) || JSON.stringify(DEFAULT_CONFIG));
}

/**
 * Update the analytics configuration
 * @param {Object} newConfig - New configuration (partial)
 */
function updateConfig(newConfig) {
  const currentConfig = getConfig();
  const updatedConfig = {
    ...currentConfig,
    ...newConfig,
    tracking: {
      ...currentConfig.tracking,
      ...(newConfig.tracking || {})
    },
    retention: {
      ...currentConfig.retention,
      ...(newConfig.retention || {})
    },
    sampling: {
      ...currentConfig.sampling,
      ...(newConfig.sampling || {})
    }
  };

  localStorage.setItem(ANALYTICS_CONFIG_KEY, JSON.stringify(updatedConfig));
  return updatedConfig;
}

/**
 * Get the analytics data
 * @returns {Object} Analytics data
 */
function getAnalyticsData() {
  return JSON.parse(localStorage.getItem(ANALYTICS_DATA_KEY) || '{"pageViews":{},"events":[],"affiliateClicks":[],"userActivity":[],"lastCleanup":0}');
}

/**
 * Save the analytics data
 * @param {Object} data - Analytics data to save
 */
function saveAnalyticsData(data) {
  localStorage.setItem(ANALYTICS_DATA_KEY, JSON.stringify(data));
}

/**
 * Generate a report for page views
 * @param {string} timePeriod - Time period for the report
 * @param {Date} startDate - Start date for custom time period
 * @param {Date} endDate - End date for custom time period
 * @returns {Object} Page view report
 */
function generatePageViewReport(timePeriod = TIME_PERIODS.LAST_30_DAYS, startDate = null, endDate = null) {
  const analyticsData = getAnalyticsData();
  const dateRange = getDateRangeForPeriod(timePeriod, startDate, endDate);

  // Get all page views
  const pageViews = analyticsData.pageViews;
  const report = {
    totalViews: 0,
    byPage: {},
    dateRange: {
      start: dateRange.startDate,
      end: dateRange.endDate
    },
    dailyTotals: {},
    topPages: []
  };

  // Create a list of all dates in the range
  const dateList = getDatesInRange(dateRange.startDate, dateRange.endDate);
  dateList.forEach(date => {
    report.dailyTotals[date] = 0;
  });

  // Process page view data
  Object.keys(pageViews).forEach(page => {
    const pageData = pageViews[page];
    let pageTotal = 0;
    const pageDailyData = {};

    // Initialize daily data with zeros
    dateList.forEach(date => {
      pageDailyData[date] = 0;
    });

    // Fill in actual data
    Object.keys(pageData.viewsByDate).forEach(date => {
      if (dateList.includes(date)) {
        const views = pageData.viewsByDate[date];
        pageDailyData[date] = views;
        pageTotal += views;
        report.dailyTotals[date] += views;
      }
    });

    if (pageTotal > 0) {
      report.byPage[page] = {
        total: pageTotal,
        dailyData: pageDailyData
      };
      report.totalViews += pageTotal;
    }
  });

  // Create sorted list of top pages
  report.topPages = Object.keys(report.byPage)
    .map(page => ({
      page,
      views: report.byPage[page].total
    }))
    .sort((a, b) => b.views - a.views);

  return report;
}

/**
 * Generate a report for affiliate clicks
 * @param {string} timePeriod - Time period for the report
 * @param {Date} startDate - Start date for custom time period
 * @param {Date} endDate - End date for custom time period
 * @returns {Object} Affiliate click report
 */
function generateAffiliateReport(timePeriod = TIME_PERIODS.LAST_30_DAYS, startDate = null, endDate = null) {
  const analyticsData = getAnalyticsData();
  const dateRange = getDateRangeForPeriod(timePeriod, startDate, endDate);

  // Filter clicks by date range
  const filteredClicks = analyticsData.affiliateClicks.filter(click => {
    const clickDate = new Date(click.timestamp);
    return clickDate >= dateRange.startDate && clickDate <= dateRange.endDate;
  });

  // Initialize report structure
  const report = {
    totalClicks: filteredClicks.length,
    byProduct: {},
    byLink: {},
    dateRange: {
      start: dateRange.startDate,
      end: dateRange.endDate
    },
    dailyTotals: {},
    topProducts: [],
    topLinks: []
  };

  // Create a list of all dates in the range
  const dateList = getDatesInRange(dateRange.startDate, dateRange.endDate);
  dateList.forEach(date => {
    report.dailyTotals[date] = 0;
  });

  // Process click data
  filteredClicks.forEach(click => {
    const date = new Date(click.timestamp).toISOString().split('T')[0];

    // Update daily totals
    if (report.dailyTotals[date] !== undefined) {
      report.dailyTotals[date]++;
    }

    // Update product stats
    if (!report.byProduct[click.productId]) {
      report.byProduct[click.productId] = {
        total: 0,
        dailyData: Object.fromEntries(dateList.map(date => [date, 0]))
      };
    }
    report.byProduct[click.productId].total++;
    if (report.byProduct[click.productId].dailyData[date] !== undefined) {
      report.byProduct[click.productId].dailyData[date]++;
    }

    // Update link stats
    if (!report.byLink[click.linkId]) {
      report.byLink[click.linkId] = {
        total: 0,
        dailyData: Object.fromEntries(dateList.map(date => [date, 0]))
      };
    }
    report.byLink[click.linkId].total++;
    if (report.byLink[click.linkId].dailyData[date] !== undefined) {
      report.byLink[click.linkId].dailyData[date]++;
    }
  });

  // Create sorted lists of top products and links
  report.topProducts = Object.keys(report.byProduct)
    .map(productId => ({
      productId,
      clicks: report.byProduct[productId].total
    }))
    .sort((a, b) => b.clicks - a.clicks);

  report.topLinks = Object.keys(report.byLink)
    .map(linkId => ({
      linkId,
      clicks: report.byLink[linkId].total
    }))
    .sort((a, b) => b.clicks - a.clicks);

  return report;
}

/**
 * Generate a report for user activity
 * @param {string} timePeriod - Time period for the report
 * @param {Date} startDate - Start date for custom time period
 * @param {Date} endDate - End date for custom time period
 * @returns {Object} User activity report
 */
function generateUserActivityReport(timePeriod = TIME_PERIODS.LAST_30_DAYS, startDate = null, endDate = null) {
  const analyticsData = getAnalyticsData();
  const dateRange = getDateRangeForPeriod(timePeriod, startDate, endDate);

  // Filter activities by date range
  const filteredActivities = analyticsData.userActivity.filter(activity => {
    const activityDate = new Date(activity.timestamp);
    return activityDate >= dateRange.startDate && activityDate <= dateRange.endDate;
  });

  // Initialize report structure
  const report = {
    totalActivities: filteredActivities.length,
    byUser: {},
    byAction: {},
    dateRange: {
      start: dateRange.startDate,
      end: dateRange.endDate
    },
    dailyTotals: {},
    mostActiveUsers: [],
    topActions: []
  };

  // Create a list of all dates in the range
  const dateList = getDatesInRange(dateRange.startDate, dateRange.endDate);
  dateList.forEach(date => {
    report.dailyTotals[date] = 0;
  });

  // Process activity data
  filteredActivities.forEach(activity => {
    const date = new Date(activity.timestamp).toISOString().split('T')[0];

    // Update daily totals
    if (report.dailyTotals[date] !== undefined) {
      report.dailyTotals[date]++;
    }

    // Update user stats
    if (!report.byUser[activity.userId]) {
      report.byUser[activity.userId] = {
        total: 0,
        actions: {},
        dailyData: Object.fromEntries(dateList.map(date => [date, 0]))
      };
    }
    report.byUser[activity.userId].total++;
    report.byUser[activity.userId].actions[activity.action] =
      (report.byUser[activity.userId].actions[activity.action] || 0) + 1;
    if (report.byUser[activity.userId].dailyData[date] !== undefined) {
      report.byUser[activity.userId].dailyData[date]++;
    }

    // Update action stats
    if (!report.byAction[activity.action]) {
      report.byAction[activity.action] = {
        total: 0,
        dailyData: Object.fromEntries(dateList.map(date => [date, 0]))
      };
    }
    report.byAction[activity.action].total++;
    if (report.byAction[activity.action].dailyData[date] !== undefined) {
      report.byAction[activity.action].dailyData[date]++;
    }
  });

  // Create sorted lists of most active users and top actions
  report.mostActiveUsers = Object.keys(report.byUser)
    .map(userId => ({
      userId,
      activities: report.byUser[userId].total
    }))
    .sort((a, b) => b.activities - a.activities);

  report.topActions = Object.keys(report.byAction)
    .map(action => ({
      action,
      count: report.byAction[action].total
    }))
    .sort((a, b) => b.count - a.count);

  return report;
}

/**
 * Get the date range for a specified time period
 * @param {string} timePeriod - Time period identifier
 * @param {Date} startDate - Start date for custom period
 * @param {Date} endDate - End date for custom period
 * @returns {Object} Date range with start and end dates
 */
function getDateRangeForPeriod(timePeriod, startDate, endDate) {
  const now = new Date();
  let start = new Date();
  let end = new Date();

  // Set time to end of day for end date
  end.setHours(23, 59, 59, 999);

  switch (timePeriod) {
    case TIME_PERIODS.TODAY:
      start.setHours(0, 0, 0, 0);
      break;

    case TIME_PERIODS.YESTERDAY:
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - 1);
      break;

    case TIME_PERIODS.LAST_7_DAYS:
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      break;

    case TIME_PERIODS.LAST_30_DAYS:
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      break;

    case TIME_PERIODS.THIS_MONTH:
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;

    case TIME_PERIODS.LAST_MONTH:
      start.setMonth(start.getMonth() - 1);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setDate(0); // Last day of previous month
      break;

    case TIME_PERIODS.CUSTOM:
      if (startDate && endDate) {
        start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
      } else {
        // Default to last 30 days if custom dates not provided
        start.setDate(start.getDate() - 29);
        start.setHours(0, 0, 0, 0);
      }
      break;
  }

  return {
    startDate: start,
    endDate: end
  };
}

/**
 * Get an array of date strings between two dates (inclusive)
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} Array of ISO date strings
 */
function getDatesInRange(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

/**
 * Export data reports
 * @param {Object} report - Report to export
 * @param {string} format - Export format (json or csv)
 * @returns {string} Exported data
 */
function exportReport(report, format = 'json') {
  if (format === 'json') {
    return JSON.stringify(report, null, 2);
  } else if (format === 'csv') {
    // Basic CSV export for simple data
    let csv = '';

    // If the report has daily totals, export that as a time series
    if (report.dailyTotals) {
      csv += 'Date,Total\n';
      Object.entries(report.dailyTotals).forEach(([date, count]) => {
        csv += `${date},${count}\n`;
      });
    }

    return csv;
  }

  return null;
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
  initAnalytics();
});

// Export functions
window.Analytics = {
  // Tracking functions
  trackPageView,
  trackEvent,
  trackAffiliateClick,
  trackUserActivity,

  // Configuration
  getConfig,
  updateConfig,

  // Reporting
  generatePageViewReport,
  generateAffiliateReport,
  generateUserActivityReport,
  exportReport,

  // Constants
  TIME_PERIODS
};
