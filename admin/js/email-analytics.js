/**
 * Email Analytics - Advanced analytics for email campaigns
 * This module provides comprehensive analytics and reporting for email campaigns.
 */

// Define the EmailAnalytics module
const EmailAnalytics = (function() {
  // Private variables
  let campaignStats = new Map();
  let globalStats = {
    totalSent: 0,
    totalOpened: 0,
    totalClicked: 0,
    totalBounced: 0,
    totalUnsubscribed: 0,
    averageOpenRate: 0,
    averageClickRate: 0,
    bestTimeOfDay: null,
    bestDayOfWeek: null
  };

  // Charts references
  let openRateChart = null;
  let clickRateChart = null;
  let engagementChart = null;
  let timeOfDayChart = null;
  let deviceTypeChart = null;

  /**
   * Initialize the analytics module
   * @param {Object} options - Configuration options
   */
  function init(options = {}) {
    // Load past campaign data if available
    if (window.EmailMarketing) {
      const campaigns = window.EmailMarketing.getCampaigns();
      if (campaigns && campaigns.length > 0) {
        campaigns.forEach(campaign => {
          if (campaign.stats) {
            campaignStats.set(campaign.id, campaign.stats);
          }
        });

        // Calculate global stats
        calculateGlobalStats();
      }
    }

    console.log('Email Analytics initialized');
  }

  /**
   * Calculate global statistics across all campaigns
   */
  function calculateGlobalStats() {
    let totalCampaigns = 0;
    let totalSent = 0;
    let totalOpened = 0;
    let totalClicked = 0;
    let totalBounced = 0;
    let totalUnsubscribed = 0;

    // Time of day and day of week tracking
    const timeOfDayData = new Array(24).fill(0);
    const dayOfWeekData = new Array(7).fill(0);
    const timeOfDayOpens = new Array(24).fill(0);
    const dayOfWeekOpens = new Array(7).fill(0);

    campaignStats.forEach((stats, campaignId) => {
      totalCampaigns++;
      totalSent += stats.sent || 0;
      totalOpened += stats.opened || 0;
      totalClicked += stats.clicked || 0;
      totalBounced += stats.bounced || 0;
      totalUnsubscribed += stats.unsubscribed || 0;

      // Analyze time data if available
      if (stats.openTimes && Array.isArray(stats.openTimes)) {
        stats.openTimes.forEach(timestamp => {
          const date = new Date(timestamp);
          const hour = date.getHours();
          const day = date.getDay();

          timeOfDayData[hour]++;
          dayOfWeekData[day]++;
        });
      }
    });

    // Calculate averages and best times
    const averageOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
    const averageClickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;

    // Find best time of day (highest opens)
    let bestHour = 0;
    let maxOpensAtHour = 0;
    timeOfDayData.forEach((opens, hour) => {
      if (opens > maxOpensAtHour) {
        maxOpensAtHour = opens;
        bestHour = hour;
      }
    });

    // Find best day of week (highest opens)
    let bestDay = 0;
    let maxOpensAtDay = 0;
    dayOfWeekData.forEach((opens, day) => {
      if (opens > maxOpensAtDay) {
        maxOpensAtDay = opens;
        bestDay = day;
      }
    });

    // Format best time of day
    const bestTimeOfDay = `${bestHour}:00 - ${bestHour + 1}:00`;

    // Format best day of week
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const bestDayOfWeek = daysOfWeek[bestDay];

    // Update global stats
    globalStats = {
      totalSent,
      totalOpened,
      totalClicked,
      totalBounced,
      totalUnsubscribed,
      averageOpenRate: parseFloat(averageOpenRate.toFixed(2)),
      averageClickRate: parseFloat(averageClickRate.toFixed(2)),
      bestTimeOfDay,
      bestDayOfWeek,
      timeOfDayData,
      dayOfWeekData
    };
  }

  /**
   * Track a new email campaign event
   * @param {string} campaignId - The campaign ID
   * @param {string} eventType - Type of event (sent, opened, clicked, etc.)
   * @param {Object} eventData - Additional event data
   */
  function trackEvent(campaignId, eventType, eventData = {}) {
    if (!campaignId || !eventType) return;

    // Get or create campaign stats
    let stats = campaignStats.get(campaignId) || {
      sent: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      unsubscribed: 0,
      openRate: 0,
      clickRate: 0,
      openTimes: [],
      clickTimes: [],
      deviceTypes: {
        desktop: 0,
        mobile: 0,
        tablet: 0
      }
    };

    const timestamp = new Date().toISOString();
    const deviceType = eventData.deviceType || 'desktop';

    // Update stats based on event type
    switch (eventType) {
      case 'sent':
        stats.sent += eventData.count || 1;
        break;
      case 'opened':
        stats.opened += 1;
        stats.openTimes.push(timestamp);
        stats.deviceTypes[deviceType] += 1;
        break;
      case 'clicked':
        stats.clicked += 1;
        stats.clickTimes.push(timestamp);
        break;
      case 'bounced':
        stats.bounced += 1;
        break;
      case 'unsubscribed':
        stats.unsubscribed += 1;
        break;
    }

    // Calculate rates
    if (stats.sent > 0) {
      stats.openRate = parseFloat(((stats.opened / stats.sent) * 100).toFixed(2));
      stats.clickRate = parseFloat(((stats.clicked / stats.sent) * 100).toFixed(2));
    }

    // Save updated stats
    campaignStats.set(campaignId, stats);

    // Update campaign in Email Marketing system
    if (window.EmailMarketing) {
      const campaign = window.EmailMarketing.getCampaignById(campaignId);
      if (campaign) {
        window.EmailMarketing.updateCampaign(campaignId, {
          ...campaign,
          stats: stats
        });
      }
    }

    // Recalculate global stats
    calculateGlobalStats();
  }

  /**
   * Get analytics data for a specific campaign
   * @param {string} campaignId - The campaign ID
   * @returns {Object} - The campaign analytics data
   */
  function getCampaignAnalytics(campaignId) {
    if (!campaignId) return null;

    const stats = campaignStats.get(campaignId);
    if (!stats) return null;

    return {
      ...stats,
      roi: calculateROI(campaignId),
      engagementScore: calculateEngagementScore(stats),
      geographicData: getGeographicData(campaignId),
      linkPerformance: getLinkPerformance(campaignId)
    };
  }

  /**
   * Calculate return on investment for a campaign
   * @param {string} campaignId - The campaign ID
   * @returns {Object} - ROI data
   */
  function calculateROI(campaignId) {
    // In a real system, this would connect to e-commerce or sales data
    // For demonstration, we'll use some simulated values

    const stats = campaignStats.get(campaignId);
    if (!stats) return { value: 0, percent: 0 };

    // Simulate campaign cost (e.g., $0.01 per email sent)
    const cost = stats.sent * 0.01;

    // Simulate revenue (e.g., average order value * conversion rate * clicks)
    const averageOrderValue = 75;
    const conversionRate = 0.02; // 2% of clicks convert to sales
    const revenue = stats.clicked * conversionRate * averageOrderValue;

    // Calculate ROI
    const roi = cost > 0 ? ((revenue - cost) / cost) * 100 : 0;

    return {
      cost: parseFloat(cost.toFixed(2)),
      revenue: parseFloat(revenue.toFixed(2)),
      value: parseFloat((revenue - cost).toFixed(2)),
      percent: parseFloat(roi.toFixed(2))
    };
  }

  /**
   * Calculate engagement score for campaign stats
   * @param {Object} stats - Campaign statistics
   * @returns {number} - Engagement score (0-100)
   */
  function calculateEngagementScore(stats) {
    if (!stats || stats.sent === 0) return 0;

    // Engagement is a weighted score based on opens, clicks, and unsubscribes
    const openWeight = 0.4;
    const clickWeight = 0.5;
    const unsubscribeWeight = 0.1;

    const openScore = (stats.opened / stats.sent) * 100;
    const clickScore = stats.opened > 0 ? (stats.clicked / stats.opened) * 100 : 0;
    const unsubscribeScore = 100 - ((stats.unsubscribed / stats.sent) * 100);

    const score = (openScore * openWeight) + (clickScore * clickWeight) + (unsubscribeScore * unsubscribeWeight);

    return parseFloat(Math.min(100, score).toFixed(2));
  }

  /**
   * Get geographic data for campaign opens
   * @param {string} campaignId - The campaign ID
   * @returns {Object} - Geographic distribution data
   */
  function getGeographicData(campaignId) {
    // In a real implementation, this would use actual geographic data
    // For demonstration, we'll return simulated data
    return {
      countries: [
        { name: 'United States', count: 42, percent: 60 },
        { name: 'United Kingdom', count: 15, percent: 21 },
        { name: 'Canada', count: 8, percent: 11 },
        { name: 'Australia', count: 5, percent: 7 },
        { name: 'Germany', count: 1, percent: 1 }
      ],
      topRegions: [
        { name: 'California', count: 15, percent: 21 },
        { name: 'New York', count: 12, percent: 17 },
        { name: 'Texas', count: 9, percent: 13 }
      ]
    };
  }

  /**
   * Get performance data for links in the campaign
   * @param {string} campaignId - The campaign ID
   * @returns {Array} - Link performance data
   */
  function getLinkPerformance(campaignId) {
    // In a real implementation, this would track individual link clicks
    // For demonstration, we'll return simulated data
    return [
      { url: 'https://recoveryessentials.com/products/massage-guns', clicks: 24, ctr: 18.5 },
      { url: 'https://recoveryessentials.com/products/foam-rollers', clicks: 18, ctr: 13.8 },
      { url: 'https://recoveryessentials.com/blog/foam-rolling-guide', clicks: 12, ctr: 9.2 }
    ];
  }

  /**
   * Render analytics charts for a dashboard
   * @param {Object} containers - Chart container element IDs
   */
  function renderDashboardCharts(containers) {
    if (!containers) return;

    if (containers.openRateChartId) {
      renderOpenRateChart(containers.openRateChartId);
    }

    if (containers.clickRateChartId) {
      renderClickRateChart(containers.clickRateChartId);
    }

    if (containers.engagementChartId) {
      renderEngagementChart(containers.engagementChartId);
    }

    if (containers.timeOfDayChartId) {
      renderTimeOfDayChart(containers.timeOfDayChartId);
    }

    if (containers.deviceTypeChartId) {
      renderDeviceTypeChart(containers.deviceTypeChartId);
    }
  }

  /**
   * Render open rate comparison chart
   * @param {string} containerId - Chart container element ID
   */
  function renderOpenRateChart(containerId) {
    const container = document.getElementById(containerId);
    if (!container || !window.Chart) return;

    // Prepare data
    const campaigns = window.EmailMarketing ? window.EmailMarketing.getCampaigns().slice(-5) : [];
    const labels = campaigns.map(c => c.name);
    const openRates = campaigns.map(c => c.stats?.openRate || 0);
    const industryAverage = new Array(labels.length).fill(21.5); // Example industry average

    // Create chart
    if (openRateChart) {
      openRateChart.destroy();
    }

    const ctx = container.getContext('2d');
    openRateChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Open Rate %',
            data: openRates,
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          },
          {
            label: 'Industry Average',
            data: industryAverage,
            type: 'line',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Open Rate (%)'
            }
          }
        }
      }
    });
  }

  /**
   * Render click rate comparison chart
   * @param {string} containerId - Chart container element ID
   */
  function renderClickRateChart(containerId) {
    const container = document.getElementById(containerId);
    if (!container || !window.Chart) return;

    // Prepare data
    const campaigns = window.EmailMarketing ? window.EmailMarketing.getCampaigns().slice(-5) : [];
    const labels = campaigns.map(c => c.name);
    const clickRates = campaigns.map(c => c.stats?.clickRate || 0);
    const industryAverage = new Array(labels.length).fill(2.3); // Example industry average

    // Create chart
    if (clickRateChart) {
      clickRateChart.destroy();
    }

    const ctx = container.getContext('2d');
    clickRateChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Click Rate %',
            data: clickRates,
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1
          },
          {
            label: 'Industry Average',
            data: industryAverage,
            type: 'line',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Click Rate (%)'
            }
          }
        }
      }
    });
  }

  /**
   * Render engagement score chart
   * @param {string} containerId - Chart container element ID
   */
  function renderEngagementChart(containerId) {
    const container = document.getElementById(containerId);
    if (!container || !window.Chart) return;

    // Prepare data
    const campaigns = window.EmailMarketing ? window.EmailMarketing.getCampaigns().slice(-5) : [];
    const labels = campaigns.map(c => c.name);
    const engagementScores = campaigns.map(c => {
      const stats = c.stats || {};
      return calculateEngagementScore(stats);
    });

    // Create chart
    if (engagementChart) {
      engagementChart.destroy();
    }

    const ctx = container.getContext('2d');
    engagementChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Engagement Score',
            data: engagementScores,
            backgroundColor: 'rgba(139, 92, 246, 0.3)',
            borderColor: 'rgba(139, 92, 246, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(139, 92, 246, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(139, 92, 246, 1)'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: {
              display: true
            },
            suggestedMin: 0,
            suggestedMax: 100
          }
        }
      }
    });
  }

  /**
   * Render time of day performance chart
   * @param {string} containerId - Chart container element ID
   */
  function renderTimeOfDayChart(containerId) {
    const container = document.getElementById(containerId);
    if (!container || !window.Chart) return;

    // Prepare labels for 24 hours
    const labels = Array.from({length: 24}, (_, i) => `${i}:00`);

    // Get time of day data
    const timeData = globalStats.timeOfDayData || new Array(24).fill(0);

    // Create chart
    if (timeOfDayChart) {
      timeOfDayChart.destroy();
    }

    const ctx = container.getContext('2d');
    timeOfDayChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Opens by Hour',
            data: timeData,
            backgroundColor: 'rgba(245, 158, 11, 0.3)',
            borderColor: 'rgba(245, 158, 11, 1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Open Count'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Hour of Day'
            }
          }
        }
      }
    });
  }

  /**
   * Render device type distribution chart
   * @param {string} containerId - Chart container element ID
   */
  function renderDeviceTypeChart(containerId) {
    const container = document.getElementById(containerId);
    if (!container || !window.Chart) return;

    // Prepare data - aggregate device types across all campaigns
    let desktop = 0, mobile = 0, tablet = 0;

    campaignStats.forEach(stats => {
      if (stats.deviceTypes) {
        desktop += stats.deviceTypes.desktop || 0;
        mobile += stats.deviceTypes.mobile || 0;
        tablet += stats.deviceTypes.tablet || 0;
      }
    });

    const data = [desktop, mobile, tablet];

    // Create chart
    if (deviceTypeChart) {
      deviceTypeChart.destroy();
    }

    const ctx = container.getContext('2d');
    deviceTypeChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Desktop', 'Mobile', 'Tablet'],
        datasets: [
          {
            data: data,
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)'
            ],
            borderColor: [
              'rgba(59, 130, 246, 1)',
              'rgba(16, 185, 129, 1)',
              'rgba(245, 158, 11, 1)'
            ],
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  /**
   * Generate campaign performance report
   * @param {string} campaignId - The campaign ID
   * @returns {Object} - Performance report data
   */
  function generateReport(campaignId) {
    if (!campaignId) return null;

    const campaign = window.EmailMarketing ? window.EmailMarketing.getCampaignById(campaignId) : null;
    if (!campaign) return null;

    const stats = campaignStats.get(campaignId) || {};
    const analytics = getCampaignAnalytics(campaignId);

    return {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        subject: campaign.subject,
        dateSent: campaign.sent,
        recipients: campaign.recipients
      },
      performance: {
        openRate: stats.openRate || 0,
        clickRate: stats.clickRate || 0,
        bounceRate: stats.sent > 0 ? ((stats.bounced / stats.sent) * 100).toFixed(2) : 0,
        unsubscribeRate: stats.sent > 0 ? ((stats.unsubscribed / stats.sent) * 100).toFixed(2) : 0
      },
      comparison: {
        openRateDiff: stats.openRate ? (stats.openRate - globalStats.averageOpenRate).toFixed(2) : 0,
        clickRateDiff: stats.clickRate ? (stats.clickRate - globalStats.averageClickRate).toFixed(2) : 0
      },
      roi: analytics?.roi || { value: 0, percent: 0 },
      engagement: analytics?.engagementScore || 0,
      geography: analytics?.geographicData || { countries: [], topRegions: [] },
      links: analytics?.linkPerformance || []
    };
  }

  // Public API
  return {
    init: init,
    trackEvent: trackEvent,
    getCampaignAnalytics: getCampaignAnalytics,
    renderDashboardCharts: renderDashboardCharts,
    generateReport: generateReport,
    getGlobalStats: function() { return {...globalStats}; }
  };
})();

// Make the module available globally
window.EmailAnalytics = EmailAnalytics;
