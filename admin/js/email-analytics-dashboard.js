/**
 * Email Analytics Dashboard - Visualizes email campaign performance
 * This module provides interactive charts and metrics for email campaigns.
 */

// Define the EmailAnalyticsDashboard module
const EmailAnalyticsDashboard = (function() {
  // Private variables
  let config = {
    timeframe: 'last30days',
    compareWith: 'none',
    metricFocus: 'opens'
  };
  let charts = {};
  let selectedCampaign = null;

  /**
   * Initialize the analytics dashboard
   * @param {Object} options - Configuration options
   */
  function init(options = {}) {
    if (options.timeframe) config.timeframe = options.timeframe;
    if (options.compareWith) config.compareWith = options.compareWith;
    if (options.metricFocus) config.metricFocus = options.metricFocus;

    // Initialize the dashboard UI
    setupDashboardUI();

    // Load and display analytics data
    loadAnalyticsData();

    console.log('Email Analytics Dashboard initialized');
  }

  /**
   * Set up the dashboard UI elements
   */
  function setupDashboardUI() {
    // Set up dashboard controls
    setupTimeframeControls();
    setupCampaignSelector();
    setupMetricFocusControls();
    setupComparisonControls();

    // Set up chart containers
    createEmptyCharts();
  }

  /**
   * Set up timeframe selector controls
   */
  function setupTimeframeControls() {
    const timeframeControl = document.getElementById('analytics-timeframe');
    if (!timeframeControl) return;

    timeframeControl.addEventListener('change', function() {
      config.timeframe = this.value;
      loadAnalyticsData();
    });
  }

  /**
   * Set up campaign selector
   */
  function setupCampaignSelector() {
    const campaignSelector = document.getElementById('analytics-campaign-select');
    if (!campaignSelector) return;

    // Populate with campaigns if Email Marketing is available
    if (window.EmailMarketing) {
      const campaigns = window.EmailMarketing.getCampaigns() || [];

      // Clear existing options
      campaignSelector.innerHTML = '<option value="">All Campaigns</option>';

      // Add campaigns
      campaigns.forEach(campaign => {
        const option = document.createElement('option');
        option.value = campaign.id;
        option.textContent = campaign.name;
        campaignSelector.appendChild(option);
      });
    }

    // Add event listener
    campaignSelector.addEventListener('change', function() {
      selectedCampaign = this.value;
      loadAnalyticsData();
    });
  }

  /**
   * Set up metric focus controls
   */
  function setupMetricFocusControls() {
    const metricFocusControl = document.getElementById('analytics-metrics-focus');
    if (!metricFocusControl) return;

    metricFocusControl.addEventListener('change', function() {
      config.metricFocus = this.value;
      updateCharts();
    });
  }

  /**
   * Set up comparison controls
   */
  function setupComparisonControls() {
    const comparisonControl = document.getElementById('analytics-comparison');
    if (!comparisonControl) return;

    comparisonControl.addEventListener('change', function() {
      config.compareWith = this.value;
      loadAnalyticsData();
    });
  }

  /**
   * Create empty chart containers
   */
  function createEmptyCharts() {
    // Ensure Chart.js is available
    if (typeof Chart === 'undefined') {
      console.error('Chart.js is required for the Email Analytics Dashboard');
      return;
    }

    // Create main performance trend chart
    createPerformanceTrendChart();

    // Create engagement metrics chart
    createEngagementMetricsChart();

    // Create device breakdown chart
    createDeviceBreakdownChart();

    // Create time of day chart
    createTimeOfDayChart();

    // Create geographical distribution chart
    createGeographicalChart();
  }

  /**
   * Create the main performance trend chart
   */
  function createPerformanceTrendChart() {
    const ctx = document.getElementById('performance-trend-chart');
    if (!ctx) return;

    charts.performanceTrend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Open Rate',
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.3,
          fill: true,
          data: []
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Campaign Performance Trend'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Rate (%)'
            },
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          }
        }
      }
    });
  }

  /**
   * Create the engagement metrics chart
   */
  function createEngagementMetricsChart() {
    const ctx = document.getElementById('engagement-metrics-chart');
    if (!ctx) return;

    charts.engagementMetrics = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Delivered', 'Opens', 'Clicks', 'Conversions', 'Unsubscribes'],
        datasets: [{
          label: 'Percentage',
          backgroundColor: [
            'rgba(16, 185, 129, 0.7)',  // green
            'rgba(99, 102, 241, 0.7)',  // indigo
            'rgba(14, 165, 233, 0.7)',  // sky
            'rgba(168, 85, 247, 0.7)',  // purple
            'rgba(239, 68, 68, 0.7)'    // red
          ],
          borderColor: [
            'rgb(16, 185, 129)',
            'rgb(99, 102, 241)',
            'rgb(14, 165, 233)',
            'rgb(168, 85, 247)',
            'rgb(239, 68, 68)'
          ],
          borderWidth: 1,
          data: [0, 0, 0, 0, 0]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Engagement Metrics'
          },
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.parsed.y + '%';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Percentage (%)'
            },
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          }
        }
      }
    });
  }

  /**
   * Create the device breakdown chart
   */
  function createDeviceBreakdownChart() {
    const ctx = document.getElementById('device-breakdown-chart');
    if (!ctx) return;

    charts.deviceBreakdown = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Desktop', 'Mobile', 'Tablet'],
        datasets: [{
          data: [0, 0, 0],
          backgroundColor: [
            'rgba(99, 102, 241, 0.7)',  // indigo
            'rgba(14, 165, 233, 0.7)',  // sky
            'rgba(168, 85, 247, 0.7)'   // purple
          ],
          borderColor: [
            'rgb(99, 102, 241)',
            'rgb(14, 165, 233)',
            'rgb(168, 85, 247)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Device Breakdown'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${context.label}: ${percentage}% (${value})`;
              }
            }
          }
        }
      }
    });
  }

  /**
   * Create the time of day chart
   */
  function createTimeOfDayChart() {
    const ctx = document.getElementById('time-of-day-chart');
    if (!ctx) return;

    const hours = Array.from({length: 24}, (_, i) => i);

    charts.timeOfDay = new Chart(ctx, {
      type: 'line',
      data: {
        labels: hours.map(hour => `${hour}:00`),
        datasets: [{
          label: 'Opens',
          borderColor: 'rgba(99, 102, 241, 1)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.3,
          fill: true,
          data: []
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Opens by Time of Day'
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Hour'
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Count'
            }
          }
        }
      }
    });
  }

  /**
   * Create the geographical distribution chart
   */
  function createGeographicalChart() {
    const ctx = document.getElementById('geographical-chart');
    if (!ctx) return;

    charts.geographical = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Opens by Region',
          backgroundColor: 'rgba(14, 165, 233, 0.7)',
          borderColor: 'rgb(14, 165, 233)',
          borderWidth: 1,
          data: []
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Geographical Distribution'
          },
          legend: {
            display: false
          }
        }
      }
    });
  }

  /**
   * Load analytics data based on current configuration
   */
  function loadAnalyticsData() {
    // If Email Analytics is available, fetch the data
    if (window.EmailAnalytics) {
      const timeframe = config.timeframe;
      const comparison = config.compareWith;

      // Load data with or without specific campaign filter
      let data;
      if (selectedCampaign) {
        data = window.EmailAnalytics.getCampaignAnalytics(selectedCampaign, { timeframe, comparison });
      } else {
        data = window.EmailAnalytics.getAggregateAnalytics({ timeframe, comparison });
      }

      // Update charts with the data
      updateChartsWithData(data);

      // Update metrics summary
      updateMetricsSummary(data);
    } else {
      // No data source available, use demo data
      const demoData = generateDemoData();
      updateChartsWithData(demoData);
      updateMetricsSummary(demoData);
    }
  }

  /**
   * Generate demo data for visualization
   * @returns {Object} - Demo analytics data
   */
  function generateDemoData() {
    // Generate dates for the selected timeframe
    const dates = generateDateRange(config.timeframe);

    // Generate open rates with some randomness but a general trend
    const openRates = dates.map(() => Math.floor(15 + Math.random() * 15));
    const clickRates = dates.map(() => Math.floor(5 + Math.random() * 10));
    const conversionRates = dates.map(() => Math.floor(1 + Math.random() * 3));

    // Create comparison data if needed
    let comparisonOpenRates = null;
    let comparisonClickRates = null;
    let comparisonConversionRates = null;

    if (config.compareWith !== 'none') {
      comparisonOpenRates = dates.map(() => Math.floor(10 + Math.random() * 15));
      comparisonClickRates = dates.map(() => Math.floor(3 + Math.random() * 8));
      comparisonConversionRates = dates.map(() => Math.floor(0.5 + Math.random() * 2.5));
    }

    // Device breakdown
    const devices = {
      desktop: Math.floor(30 + Math.random() * 30),
      mobile: Math.floor(30 + Math.random() * 30),
      tablet: 0  // Will be calculated to sum to 100
    };
    devices.tablet = 100 - devices.desktop - devices.mobile;

    // Time of day data
    const timeOfDay = Array.from({length: 24}, () => Math.floor(Math.random() * 50));
    // Make a pattern with higher opens during business hours and lunch
    timeOfDay[9] = timeOfDay[9] * 3;  // 9am
    timeOfDay[12] = timeOfDay[12] * 4; // 12pm
    timeOfDay[17] = timeOfDay[17] * 3.5; // 5pm
    timeOfDay[20] = timeOfDay[20] * 2.5; // 8pm

    // Geographical data
    const regions = ['North America', 'Europe', 'Asia', 'South America', 'Oceania', 'Africa', 'Middle East'];
    const geoData = regions.map((region) => ({
      region,
      opens: Math.floor(100 + Math.random() * 900)
    })).sort((a, b) => b.opens - a.opens);

    return {
      performance: {
        dates: dates,
        metrics: {
          opens: {
            values: openRates,
            comparison: comparisonOpenRates
          },
          clicks: {
            values: clickRates,
            comparison: comparisonClickRates
          },
          conversions: {
            values: conversionRates,
            comparison: comparisonConversionRates
          }
        }
      },
      engagement: {
        delivered: 98.5,
        opened: 23.7,
        clicked: 8.4,
        converted: 2.2,
        unsubscribed: 0.3
      },
      devices: {
        desktop: devices.desktop,
        mobile: devices.mobile,
        tablet: devices.tablet
      },
      timeOfDay: timeOfDay,
      geography: geoData,
      summary: {
        sent: 25000,
        delivered: 24625,
        opened: 5925,
        clicked: 2100,
        converted: 550,
        revenue: 27500
      }
    };
  }

  /**
   * Generate a range of dates based on the selected timeframe
   * @param {string} timeframe - The selected timeframe
   * @returns {Array} - Array of formatted dates
   */
  function generateDateRange(timeframe) {
    const dates = [];
    const today = new Date();
    let days = 30; // default to 30 days

    switch (timeframe) {
      case 'last7days':
        days = 7;
        break;
      case 'last30days':
        days = 30;
        break;
      case 'last90days':
        days = 90;
        break;
      case 'thisYear':
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        days = Math.ceil((today - startOfYear) / (1000 * 60 * 60 * 24));
        break;
    }

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(formatDate(date));
    }

    return dates;
  }

  /**
   * Format a date as MM/DD/YYYY
   * @param {Date} date - The date to format
   * @returns {string} - Formatted date string
   */
  function formatDate(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  /**
   * Update all charts with analytics data
   * @param {Object} data - The analytics data
   */
  function updateChartsWithData(data) {
    updatePerformanceTrendChart(data);
    updateEngagementMetricsChart(data);
    updateDeviceBreakdownChart(data);
    updateTimeOfDayChart(data);
    updateGeographicalChart(data);
  }

  /**
   * Update the performance trend chart
   * @param {Object} data - The analytics data
   */
  function updatePerformanceTrendChart(data) {
    if (!charts.performanceTrend || !data.performance) return;

    const chart = charts.performanceTrend;
    const performanceData = data.performance;
    const metricData = performanceData.metrics[config.metricFocus];

    // Update chart data
    chart.data.labels = performanceData.dates;
    chart.data.datasets[0].data = metricData.values;
    chart.data.datasets[0].label = `${config.metricFocus.charAt(0).toUpperCase() + config.metricFocus.slice(1)} Rate`;

    // Add comparison data if available
    if (metricData.comparison && config.compareWith !== 'none') {
      if (chart.data.datasets.length < 2) {
        chart.data.datasets.push({
          label: `Previous Period ${config.metricFocus.charAt(0).toUpperCase() + config.metricFocus.slice(1)} Rate`,
          borderColor: 'rgba(168, 85, 247, 1)',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          tension: 0.3,
          fill: true,
          data: metricData.comparison
        });
      } else {
        chart.data.datasets[1].data = metricData.comparison;
        chart.data.datasets[1].label = `Previous Period ${config.metricFocus.charAt(0).toUpperCase() + config.metricFocus.slice(1)} Rate`;
      }
    } else if (chart.data.datasets.length > 1) {
      // Remove comparison dataset if no longer needed
      chart.data.datasets.pop();
    }

    chart.update();
  }

  /**
   * Update the engagement metrics chart
   * @param {Object} data - The analytics data
   */
  function updateEngagementMetricsChart(data) {
    if (!charts.engagementMetrics || !data.engagement) return;

    const chart = charts.engagementMetrics;
    const engagement = data.engagement;

    chart.data.datasets[0].data = [
      engagement.delivered,
      engagement.opened,
      engagement.clicked,
      engagement.converted,
      engagement.unsubscribed
    ];

    chart.update();
  }

  /**
   * Update the device breakdown chart
   * @param {Object} data - The analytics data
   */
  function updateDeviceBreakdownChart(data) {
    if (!charts.deviceBreakdown || !data.devices) return;

    const chart = charts.deviceBreakdown;
    const devices = data.devices;

    chart.data.datasets[0].data = [
      devices.desktop,
      devices.mobile,
      devices.tablet
    ];

    chart.update();
  }

  /**
   * Update the time of day chart
   * @param {Object} data - The analytics data
   */
  function updateTimeOfDayChart(data) {
    if (!charts.timeOfDay || !data.timeOfDay) return;

    const chart = charts.timeOfDay;
    chart.data.datasets[0].data = data.timeOfDay;

    chart.update();
  }

  /**
   * Update the geographical distribution chart
   * @param {Object} data - The analytics data
   */
  function updateGeographicalChart(data) {
    if (!charts.geographical || !data.geography) return;

    const chart = charts.geographical;
    const geoData = data.geography;

    chart.data.labels = geoData.map(item => item.region);
    chart.data.datasets[0].data = geoData.map(item => item.opens);

    chart.update();
  }

  /**
   * Update the metrics summary cards
   * @param {Object} data - The analytics data
   */
  function updateMetricsSummary(data) {
    if (!data.summary) return;

    const summary = data.summary;

    // Update summary cards if elements exist
    updateSummaryCard('summary-sent', summary.sent);
    updateSummaryCard('summary-delivered', summary.delivered);
    updateSummaryCard('summary-opened', summary.opened);
    updateSummaryCard('summary-clicked', summary.clicked);
    updateSummaryCard('summary-converted', summary.converted);
    updateSummaryCard('summary-revenue', `$${summary.revenue.toLocaleString()}`);
  }

  /**
   * Update a single summary card
   * @param {string} elementId - The element ID
   * @param {number|string} value - The value to display
   */
  function updateSummaryCard(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = typeof value === 'number' ? value.toLocaleString() : value;
    }
  }

  /**
   * Update charts based on metric focus change
   */
  function updateCharts() {
    const data = window.EmailAnalytics ?
      (selectedCampaign ?
        window.EmailAnalytics.getCampaignAnalytics(selectedCampaign, { timeframe: config.timeframe, comparison: config.compareWith }) :
        window.EmailAnalytics.getAggregateAnalytics({ timeframe: config.timeframe, comparison: config.compareWith })) :
      generateDemoData();

    updatePerformanceTrendChart(data);
  }

  /**
   * Export analytics data to CSV
   * @returns {string} - CSV data
   */
  function exportToCSV() {
    const data = window.EmailAnalytics ?
      (selectedCampaign ?
        window.EmailAnalytics.getCampaignAnalytics(selectedCampaign, { timeframe: config.timeframe }) :
        window.EmailAnalytics.getAggregateAnalytics({ timeframe: config.timeframe })) :
      generateDemoData();

    if (!data || !data.performance) return null;

    const performanceData = data.performance;
    const metrics = performanceData.metrics;

    let csv = 'Date,Opens,Clicks,Conversions\n';

    performanceData.dates.forEach((date, index) => {
      csv += `${date},${metrics.opens.values[index]},${metrics.clicks.values[index]},${metrics.conversions.values[index]}\n`;
    });

    return csv;
  }

  /**
   * Generate a PDF report of the analytics
   */
  function generatePDFReport() {
    // This would integrate with a PDF generation library like jsPDF
    console.log('PDF report generation triggered');

    // In a real implementation, this would capture the charts and data
    // to generate a comprehensive PDF report
    alert('PDF report generation would be implemented here.');
  }

  // Public API
  return {
    init: init,
    loadAnalyticsData: loadAnalyticsData,
    exportToCSV: exportToCSV,
    generatePDFReport: generatePDFReport,
    setTimeframe: function(timeframe) {
      config.timeframe = timeframe;
      loadAnalyticsData();
    },
    setMetricFocus: function(metric) {
      config.metricFocus = metric;
      updateCharts();
    },
    setComparison: function(comparison) {
      config.compareWith = comparison;
      loadAnalyticsData();
    },
    selectCampaign: function(campaignId) {
      selectedCampaign = campaignId;
      loadAnalyticsData();
    }
  };
})();

// Make the module available globally
window.EmailAnalyticsDashboard = EmailAnalyticsDashboard;
