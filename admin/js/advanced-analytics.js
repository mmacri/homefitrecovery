/**
 * Recovery Essentials - Advanced Analytics & Reporting System
 * Handles data collection, analysis, and visualization for website performance metrics
 */

// Storage keys
const ANALYTICS_CONFIG_KEY = 'recoveryEssentials_analyticsConfig';
const ANALYTICS_DATA_KEY = 'recoveryEssentials_analyticsData';
const ANALYTICS_GOALS_KEY = 'recoveryEssentials_analyticsGoals';
const ANALYTICS_REPORTS_KEY = 'recoveryEssentials_analyticsReports';

// Default analytics configuration
const DEFAULT_ANALYTICS_CONFIG = {
    dataCollection: {
        pageViews: true,           // Track page views
        uniqueVisitors: true,      // Track unique visitors
        referrers: true,           // Track referrer sources
        deviceInfo: true,          // Track device information
        geoLocation: true,         // Track geographic location
        userInteractions: true,    // Track clicks, scrolls, etc.
        sessionDuration: true,     // Track how long users stay
        conversionEvents: true     // Track conversion events
    },
    privacySettings: {
        anonymizeIp: true,         // Anonymize IP addresses
        respectDnt: true,          // Respect Do Not Track
        cookieConsent: true,       // Require cookie consent
        dataRetention: 90          // Data retention period (days)
    },
    reporting: {
        realTimeEnabled: true,     // Enable real-time analytics
        dailyReports: true,        // Generate daily reports
        weeklyReports: true,       // Generate weekly reports
        monthlyReports: true,      // Generate monthly reports
        customReports: true,       // Allow custom report creation
        automaticEmails: false     // Send reports via email
    },
    integrations: {
        googleAnalytics: false,    // Google Analytics integration
        googleSearchConsole: false, // Google Search Console
        facebookPixel: false,      // Facebook Pixel
        customEndpoint: ""         // Custom analytics endpoint
    }
};

// Mock data for demonstration
const MOCK_ANALYTICS_DATA = {
    timeRanges: {
        today: generateMockTimelineData(24, 'hours'),
        thisWeek: generateMockTimelineData(7, 'days'),
        thisMonth: generateMockTimelineData(30, 'days'),
        thisYear: generateMockTimelineData(12, 'months')
    },
    metrics: {
        pageViews: {
            total: 18543,
            trend: 0.12, // +12% from previous period
        },
        uniqueVisitors: {
            total: 7891,
            trend: 0.08, // +8% from previous period
        },
        bounceRate: {
            value: 0.42, // 42%
            trend: -0.05, // -5% from previous period (improvement)
        },
        avgSessionDuration: {
            value: 185, // 185 seconds
            trend: 0.15, // +15% from previous period
        },
        conversionRate: {
            value: 0.032, // 3.2%
            trend: 0.22, // +22% from previous period
        }
    },
    topPages: [
        { path: '/', views: 4231, avgTimeOnPage: 78 },
        { path: '/blog/best-recovery-supplements', views: 2198, avgTimeOnPage: 240 },
        { path: '/products/recovery-essentials-combo', views: 1876, avgTimeOnPage: 189 },
        { path: '/about', views: 987, avgTimeOnPage: 65 },
        { path: '/contact', views: 765, avgTimeOnPage: 42 }
    ],
    traffic: {
        sources: {
            'direct': 0.35,
            'organic': 0.28,
            'social': 0.18,
            'referral': 0.12,
            'email': 0.05,
            'other': 0.02
        },
        social: {
            'facebook': 0.45,
            'instagram': 0.25,
            'twitter': 0.15,
            'linkedin': 0.10,
            'pinterest': 0.05
        },
        devices: {
            'mobile': 0.58,
            'desktop': 0.32,
            'tablet': 0.10
        },
        browsers: {
            'chrome': 0.52,
            'safari': 0.25,
            'firefox': 0.10,
            'edge': 0.08,
            'other': 0.05
        }
    },
    conversions: {
        total: 253,
        rate: 0.032,
        bySource: {
            'direct': 82,
            'organic': 65,
            'social': 47,
            'referral': 35,
            'email': 20,
            'other': 4
        },
        byPage: {
            '/products/recovery-essentials-combo': 95,
            '/products/protein-powder': 62,
            '/products/electrolyte-mix': 48,
            '/blog/best-recovery-supplements': 30,
            'other': 18
        }
    },
    geographicData: {
        countries: {
            'United States': 0.65,
            'Canada': 0.12,
            'United Kingdom': 0.08,
            'Australia': 0.06,
            'Germany': 0.03,
            'Other': 0.06
        },
        cities: [
            { name: 'New York', visitors: 854 },
            { name: 'Los Angeles', visitors: 673 },
            { name: 'Chicago', visitors: 521 },
            { name: 'Toronto', visitors: 458 },
            { name: 'London', visitors: 392 }
        ]
    }
};

// Initialize the Analytics System
function initAnalyticsSystem() {
    // Load or create config
    let config = getAnalyticsConfig();
    if (!config) {
        config = DEFAULT_ANALYTICS_CONFIG;
        saveAnalyticsConfig(config);
    }

    // Initialize analytics data storage if needed
    let analyticsData = getAnalyticsData();
    if (!analyticsData) {
        analyticsData = MOCK_ANALYTICS_DATA; // Using mock data for demonstration
        saveAnalyticsData(analyticsData);
    }

    // Initialize goals if needed
    let goals = getAnalyticsGoals();
    if (!goals) {
        goals = {
            pageViews: { target: 20000, timeframe: 'month', progress: 0.93 },
            conversionRate: { target: 0.04, timeframe: 'month', progress: 0.80 },
            revenue: { target: 50000, timeframe: 'month', progress: 0.75 }
        };
        saveAnalyticsGoals(goals);
    }

    // Initialize saved reports if needed
    let reports = getAnalyticsReports();
    if (!reports) {
        reports = [
            {
                id: 'weekly-traffic-report',
                name: 'Weekly Traffic Report',
                type: 'traffic',
                timeframe: 'week',
                metrics: ['pageViews', 'uniqueVisitors', 'bounceRate'],
                createdAt: new Date().toISOString(),
                lastRun: new Date().toISOString()
            },
            {
                id: 'monthly-conversion-report',
                name: 'Monthly Conversion Report',
                type: 'conversion',
                timeframe: 'month',
                metrics: ['conversionRate', 'totalConversions', 'revenuePerVisitor'],
                createdAt: new Date().toISOString(),
                lastRun: new Date().toISOString()
            }
        ];
        saveAnalyticsReports(reports);
    }

    return config;
}

/**
 * Get analytics data for specified time range and metrics
 * @param {string} timeRange - Time range (today, week, month, year, custom)
 * @param {Array} metrics - Array of metric names to retrieve
 * @param {Object} options - Additional options for filtering
 * @returns {Object} Analytics data
 */
function getAnalyticsForTimeRange(timeRange = 'today', metrics = [], options = {}) {
    const analyticsData = getAnalyticsData();
    const result = {
        timeRange: timeRange,
        period: getPeriodLabel(timeRange),
        data: {}
    };

    // If no specific metrics requested, return all
    if (!metrics || metrics.length === 0) {
        return {
            ...result,
            data: analyticsData
        };
    }

    // Filter for requested metrics
    metrics.forEach(metric => {
        switch(metric) {
            case 'pageViews':
                result.data.pageViews = analyticsData.metrics.pageViews;
                result.data.pageViewsTimeline = getTimelineData(timeRange, 'pageViews');
                break;
            case 'uniqueVisitors':
                result.data.uniqueVisitors = analyticsData.metrics.uniqueVisitors;
                result.data.uniqueVisitorsTimeline = getTimelineData(timeRange, 'uniqueVisitors');
                break;
            case 'bounceRate':
                result.data.bounceRate = analyticsData.metrics.bounceRate;
                result.data.bounceRateTimeline = getTimelineData(timeRange, 'bounceRate');
                break;
            case 'avgSessionDuration':
                result.data.avgSessionDuration = analyticsData.metrics.avgSessionDuration;
                result.data.sessionDurationTimeline = getTimelineData(timeRange, 'avgSessionDuration');
                break;
            case 'conversionRate':
                result.data.conversionRate = analyticsData.metrics.conversionRate;
                result.data.conversionRateTimeline = getTimelineData(timeRange, 'conversionRate');
                break;
            case 'topPages':
                result.data.topPages = analyticsData.topPages;
                break;
            case 'traffic':
                result.data.traffic = analyticsData.traffic;
                break;
            case 'conversions':
                result.data.conversions = analyticsData.conversions;
                break;
            case 'geographicData':
                result.data.geographicData = analyticsData.geographicData;
                break;
            default:
                // Unknown metric
                break;
        }
    });

    return result;
}

/**
 * Get timeline data for a specific time range and metric
 * @param {string} timeRange - Time range
 * @param {string} metric - Metric to get timeline for
 * @returns {Array} Timeline data
 */
function getTimelineData(timeRange, metric) {
    const analyticsData = getAnalyticsData();

    if (!analyticsData.timeRanges[timeRange]) {
        return [];
    }

    return analyticsData.timeRanges[timeRange].map(point => ({
        ...point,
        value: point[metric] || 0
    }));
}

/**
 * Create a custom analytics report
 * @param {Object} reportConfig - Report configuration
 * @returns {Object} Created report
 */
function createAnalyticsReport(reportConfig) {
    if (!reportConfig.name || !reportConfig.type || !reportConfig.timeframe) {
        throw new Error('Missing required report configuration properties');
    }

    const reports = getAnalyticsReports();

    // Create new report
    const newReport = {
        id: generateId(),
        name: reportConfig.name,
        type: reportConfig.type,
        timeframe: reportConfig.timeframe,
        metrics: reportConfig.metrics || [],
        filters: reportConfig.filters || {},
        createdAt: new Date().toISOString(),
        lastRun: new Date().toISOString(),
        schedule: reportConfig.schedule || null
    };

    // Add to reports
    reports.push(newReport);
    saveAnalyticsReports(reports);

    return newReport;
}

/**
 * Run an analytics report
 * @param {string} reportId - ID of the report to run
 * @returns {Object} Report results
 */
function runAnalyticsReport(reportId) {
    const reports = getAnalyticsReports();
    const report = reports.find(r => r.id === reportId);

    if (!report) {
        throw new Error(`Report with ID ${reportId} not found`);
    }

    // Update last run time
    report.lastRun = new Date().toISOString();
    saveAnalyticsReports(reports);

    // Run the report based on its configuration
    const reportData = getAnalyticsForTimeRange(
        report.timeframe,
        report.metrics,
        report.filters
    );

    return {
        report: report,
        results: reportData,
        generatedAt: new Date().toISOString()
    };
}

/**
 * Set an analytics goal
 * @param {string} metric - Metric to set goal for
 * @param {number} target - Target value
 * @param {string} timeframe - Timeframe for the goal
 * @returns {Object} Updated goals
 */
function setAnalyticsGoal(metric, target, timeframe = 'month') {
    const goals = getAnalyticsGoals();

    // Calculate current progress
    const analyticsData = getAnalyticsData();
    let currentValue = 0;
    let progress = 0;

    switch(metric) {
        case 'pageViews':
            currentValue = analyticsData.metrics.pageViews.total;
            break;
        case 'uniqueVisitors':
            currentValue = analyticsData.metrics.uniqueVisitors.total;
            break;
        case 'conversionRate':
            currentValue = analyticsData.metrics.conversionRate.value;
            break;
        // Add other metrics as needed
    }

    // Calculate progress (capped at 1.0)
    progress = Math.min(currentValue / target, 1.0);

    // Update or create goal
    goals[metric] = {
        target: target,
        timeframe: timeframe,
        progress: progress,
        currentValue: currentValue,
        updatedAt: new Date().toISOString()
    };

    saveAnalyticsGoals(goals);

    return goals;
}

/**
 * Get analytics insights based on current data
 * @returns {Array} List of insights
 */
function getAnalyticsInsights() {
    const analyticsData = getAnalyticsData();
    const insights = [];

    // Check for significant changes in metrics
    if (analyticsData.metrics.pageViews.trend > 0.1) {
        insights.push({
            type: 'positive',
            title: 'Page views increasing',
            description: `Page views have increased by ${(analyticsData.metrics.pageViews.trend * 100).toFixed(1)}% compared to the previous period.`,
            metric: 'pageViews',
            importance: 'medium'
        });
    } else if (analyticsData.metrics.pageViews.trend < -0.1) {
        insights.push({
            type: 'negative',
            title: 'Page views decreasing',
            description: `Page views have decreased by ${Math.abs(analyticsData.metrics.pageViews.trend * 100).toFixed(1)}% compared to the previous period.`,
            metric: 'pageViews',
            importance: 'high'
        });
    }

    // Check bounce rate trends
    if (analyticsData.metrics.bounceRate.trend < -0.05) {
        insights.push({
            type: 'positive',
            title: 'Bounce rate improving',
            description: `Bounce rate has decreased by ${Math.abs(analyticsData.metrics.bounceRate.trend * 100).toFixed(1)}%, showing better user engagement.`,
            metric: 'bounceRate',
            importance: 'high'
        });
    } else if (analyticsData.metrics.bounceRate.trend > 0.05) {
        insights.push({
            type: 'negative',
            title: 'Bounce rate increasing',
            description: `Bounce rate has increased by ${(analyticsData.metrics.bounceRate.trend * 100).toFixed(1)}%, indicating potential user experience issues.`,
            metric: 'bounceRate',
            importance: 'high'
        });
    }

    // Check conversion rate trends
    if (analyticsData.metrics.conversionRate.trend > 0.1) {
        insights.push({
            type: 'positive',
            title: 'Conversion rate improving',
            description: `Conversion rate has increased by ${(analyticsData.metrics.conversionRate.trend * 100).toFixed(1)}%, showing better performance.`,
            metric: 'conversionRate',
            importance: 'high'
        });
    } else if (analyticsData.metrics.conversionRate.trend < -0.1) {
        insights.push({
            type: 'negative',
            title: 'Conversion rate decreasing',
            description: `Conversion rate has decreased by ${Math.abs(analyticsData.metrics.conversionRate.trend * 100).toFixed(1)}%, indicating potential issues in the conversion funnel.`,
            metric: 'conversionRate',
            importance: 'high'
        });
    }

    // Check traffic source distribution
    const trafficSources = analyticsData.traffic.sources;
    if (trafficSources.organic < 0.2) {
        insights.push({
            type: 'suggestion',
            title: 'Improve organic traffic',
            description: 'Organic traffic is below 20%. Consider improving SEO to increase organic visitors.',
            metric: 'trafficSources',
            importance: 'medium'
        });
    }

    if (trafficSources.social < 0.15) {
        insights.push({
            type: 'suggestion',
            title: 'Boost social media presence',
            description: 'Social traffic is relatively low. Consider increasing social media marketing efforts.',
            metric: 'trafficSources',
            importance: 'medium'
        });
    }

    // Add mobile optimization insight if mobile traffic is high
    if (analyticsData.traffic.devices.mobile > 0.5) {
        insights.push({
            type: 'information',
            title: 'High mobile traffic',
            description: 'Over 50% of your traffic comes from mobile devices. Ensure your site is fully optimized for mobile users.',
            metric: 'devices',
            importance: 'medium'
        });
    }

    return insights;
}

/**
 * Generate mock timeline data for demonstration
 * @param {number} points - Number of data points
 * @param {string} unit - Time unit (hours, days, months)
 * @returns {Array} Generated timeline data
 */
function generateMockTimelineData(points, unit) {
    const result = [];
    const now = new Date();

    for (let i = 0; i < points; i++) {
        const date = new Date(now);

        // Adjust date based on unit
        switch (unit) {
            case 'hours':
                date.setHours(date.getHours() - (points - i - 1));
                break;
            case 'days':
                date.setDate(date.getDate() - (points - i - 1));
                break;
            case 'months':
                date.setMonth(date.getMonth() - (points - i - 1));
                break;
        }

        // Generate random values
        const pageViews = Math.floor(Math.random() * 500) + 300;
        const uniqueVisitors = Math.floor(pageViews * (0.3 + Math.random() * 0.2));
        const bounceRate = 0.3 + Math.random() * 0.3;
        const avgSessionDuration = Math.floor(Math.random() * 120) + 60;
        const conversionRate = 0.02 + Math.random() * 0.03;

        result.push({
            date: date.toISOString(),
            label: formatDate(date, unit),
            pageViews: pageViews,
            uniqueVisitors: uniqueVisitors,
            bounceRate: bounceRate,
            avgSessionDuration: avgSessionDuration,
            conversionRate: conversionRate
        });
    }

    return result;
}

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @param {string} unit - Time unit
 * @returns {string} Formatted date
 */
function formatDate(date, unit) {
    switch (unit) {
        case 'hours':
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        case 'days':
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        case 'months':
            return date.toLocaleDateString([], { month: 'short', year: 'numeric' });
        default:
            return date.toLocaleDateString();
    }
}

/**
 * Get period label for a time range
 * @param {string} timeRange - Time range identifier
 * @returns {string} Human-readable period label
 */
function getPeriodLabel(timeRange) {
    const today = new Date();

    switch (timeRange) {
        case 'today':
            return today.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
        case 'yesterday':
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return yesterday.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
        case 'thisWeek':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            return `${weekStart.toLocaleDateString([], { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`;
        case 'thisMonth':
            return today.toLocaleDateString([], { month: 'long', year: 'numeric' });
        case 'thisYear':
            return today.getFullYear().toString();
        default:
            return 'Custom Period';
    }
}

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Get analytics configuration
 * @returns {Object} Analytics configuration
 */
function getAnalyticsConfig() {
    return JSON.parse(localStorage.getItem(ANALYTICS_CONFIG_KEY) || JSON.stringify(DEFAULT_ANALYTICS_CONFIG));
}

/**
 * Save analytics configuration
 * @param {Object} config - Analytics configuration to save
 */
function saveAnalyticsConfig(config) {
    localStorage.setItem(ANALYTICS_CONFIG_KEY, JSON.stringify(config));
}

/**
 * Get analytics data
 * @returns {Object} Analytics data
 */
function getAnalyticsData() {
    return JSON.parse(localStorage.getItem(ANALYTICS_DATA_KEY) || JSON.stringify(MOCK_ANALYTICS_DATA));
}

/**
 * Save analytics data
 * @param {Object} data - Analytics data to save
 */
function saveAnalyticsData(data) {
    localStorage.setItem(ANALYTICS_DATA_KEY, JSON.stringify(data));
}

/**
 * Get analytics goals
 * @returns {Object} Analytics goals
 */
function getAnalyticsGoals() {
    return JSON.parse(localStorage.getItem(ANALYTICS_GOALS_KEY) || '{}');
}

/**
 * Save analytics goals
 * @param {Object} goals - Analytics goals to save
 */
function saveAnalyticsGoals(goals) {
    localStorage.setItem(ANALYTICS_GOALS_KEY, JSON.stringify(goals));
}

/**
 * Get analytics reports
 * @returns {Array} Saved analytics reports
 */
function getAnalyticsReports() {
    return JSON.parse(localStorage.getItem(ANALYTICS_REPORTS_KEY) || '[]');
}

/**
 * Save analytics reports
 * @param {Array} reports - Analytics reports to save
 */
function saveAnalyticsReports(reports) {
    localStorage.setItem(ANALYTICS_REPORTS_KEY, JSON.stringify(reports));
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    initAnalyticsSystem();
});

// Export functions
window.AdvancedAnalytics = {
    // Core functions
    getAnalyticsForTimeRange,
    createAnalyticsReport,
    runAnalyticsReport,
    setAnalyticsGoal,
    getAnalyticsInsights,

    // Configuration
    getAnalyticsConfig,
    saveAnalyticsConfig,

    // Utility functions
    getAnalyticsGoals,
    getAnalyticsReports
};
