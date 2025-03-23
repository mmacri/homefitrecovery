# Analytics System Guide

This guide provides comprehensive information about the Analytics System in the Recovery Essentials admin dashboard.

## Overview

The Analytics System collects, processes, and visualizes data about website performance, user behavior, and affiliate marketing effectiveness. It helps you make data-driven decisions to improve your website's performance and content strategy.

## Features

The Analytics System includes the following key features:

- **Page View Tracking**: Monitor which pages receive the most traffic
- **Affiliate Click Tracking**: Track clicks on affiliate links
- **User Activity Tracking**: Monitor admin user actions in the dashboard
- **Interactive Dashboards**: Visualize data with charts and graphs
- **Customizable Reports**: Filter data by time periods
- **Data Export**: Export analytics data in JSON or CSV formats
- **Configurable Settings**: Control what data is tracked and how long it's stored

## Accessing Analytics

To access the Analytics Dashboard:

1. Log in to the Recovery Essentials admin dashboard
2. Click on "Analytics" in the main navigation menu
3. The Analytics Dashboard will load, displaying key metrics and visualizations

## Dashboard Sections

### Overview Cards

The top section of the dashboard displays overview cards with key metrics:

- **Total Page Views**: The total number of page views in the selected time period
- **Affiliate Clicks**: The total number of affiliate link clicks
- **User Activities**: The total number of admin user actions tracked
- **Conversion Rate**: The percentage of page views that resulted in affiliate clicks

### Traffic Over Time

This chart shows page views and affiliate clicks over time, allowing you to:

- Identify traffic patterns and trends
- Compare page views to affiliate clicks
- Spot seasonal variations or the impact of marketing campaigns

### Top Pages

This section shows the most viewed pages on your site, including:

- Relative ranking of pages by popularity
- Percentage of total traffic for each page
- Visual representation of traffic distribution

### Affiliate Performance

This table shows your top-performing products based on affiliate link clicks:

- Product identifiers
- Number of clicks per product
- Percentage share of total clicks

### User Activity

This tab-based section shows:

- **Top Actions**: Most frequent activities performed by admin users
- **Active Users**: Most active users in the admin dashboard

## Using Time Filters

You can filter all analytics data by different time periods:

1. Select the desired time period from the dropdown at the top of the dashboard:
   - Today
   - Yesterday
   - Last 7 Days
   - Last 30 Days
   - This Month
   - Last Month
   - Custom Range

2. For Custom Range:
   - Select "Custom Range" from the dropdown
   - Enter start and end dates in the date pickers that appear
   - Click "Apply" to update the dashboard with the custom date range

## Exporting Data

To export analytics data for further analysis:

1. Scroll to the "Export Analytics Data" section
2. Select the report type:
   - Page Views
   - Affiliate Clicks
   - User Activity
3. Select the export format:
   - JSON (for programmatic processing)
   - CSV (for spreadsheet analysis)
4. Click "Export Data"
5. Save the downloaded file to your computer

## Analytics Settings

You can customize how the Analytics System works:

### Tracking Options

Control what types of data are tracked:

- **Track Page Views**: Track visits to pages on your site
- **Track Events**: Track user interactions with site elements
- **Track Affiliate Clicks**: Track clicks on affiliate links
- **Track User Activity**: Track admin user actions in the dashboard

### Data Retention

Manage how long analytics data is stored:

- **Data Retention Period**: Number of days to keep analytics data (default: 90 days)
- **Enable Sampling**: Reduce data collection volume by tracking only a percentage of events
- **Sampling Rate**: Percentage of events to track when sampling is enabled

To update settings:

1. Modify the desired options
2. Click "Save Settings"
3. The changes will take effect immediately

## Implementation Details

### Tracking Page Views

To track page views on the front-end of your website:

```javascript
// Include the analytics.js script on your page
<script src="/admin/js/analytics.js"></script>

// Track a page view
Analytics.trackPageView('/path/to/page', {
  title: 'Page Title',
  referrer: document.referrer,
  // Additional metadata
});
```

### Tracking Affiliate Clicks

To track affiliate link clicks:

```javascript
// On your product page
document.querySelector('.affiliate-link').addEventListener('click', function(e) {
  // Track the click
  Analytics.trackAffiliateClick('link-123', 'product-456', {
    price: 99.99,
    category: 'massage-guns',
    position: 'sidebar'
  });
});
```

### Tracking User Activity

User activity in the admin dashboard is tracked automatically when users perform actions like:

- Creating, editing, or deleting content
- Changing settings
- Managing users and roles

## Analytics Data Structure

The Analytics System stores data in the following structure:

```javascript
{
  "pageViews": {
    "/page-path": {
      "totalViews": 123,
      "viewsByDate": {
        "2024-03-21": 45,
        "2024-03-22": 78
      },
      "recentViews": [
        {
          "timestamp": 1616284800000,
          "title": "Page Title",
          "referrer": "https://google.com"
        }
      ]
    }
  },
  "events": [
    {
      "name": "button_click",
      "category": "engagement",
      "timestamp": 1616284800000,
      "data": {
        "buttonId": "cta-main",
        "position": "hero"
      }
    }
  ],
  "affiliateClicks": [
    {
      "linkId": "link-123",
      "productId": "product-456",
      "timestamp": 1616284800000,
      "price": 99.99,
      "category": "massage-guns"
    }
  ],
  "userActivity": [
    {
      "userId": "admin",
      "action": "edit_post",
      "timestamp": 1616284800000,
      "details": {
        "postId": "post-789",
        "title": "Updated Title"
      }
    }
  ]
}
```

## Permissions

The Analytics System integrates with the User Roles and Permissions system and includes the following permissions:

- **view_analytics**: Access to view analytics data and reports
- **manage_analytics**: Ability to configure analytics settings and export data

These permissions are assigned to roles as follows:

| Role | Permissions |
|------|-------------|
| Administrator | view_analytics, manage_analytics |
| Editor | view_analytics |
| Author | view_analytics |
| Affiliate Manager | view_analytics |
| Viewer | view_analytics |

## Best Practices

### Tracking Strategy

- **Be Selective**: Track the most important metrics rather than everything
- **Respect Privacy**: Only collect data that provides actionable insights
- **Segment Data**: Use metadata to segment analytics for better insights
- **Use Consistent Naming**: Maintain consistent page paths and event names

### Data Analysis

- **Look for Trends**: Focus on patterns over time rather than absolute numbers
- **Compare Metrics**: Analyze relationships between different metrics
- **Set Benchmarks**: Establish baseline performance to measure improvements
- **Act on Insights**: Use analytics data to inform content and marketing decisions

### Data Management

- **Regular Exports**: Periodically export important data for long-term storage
- **Optimize Retention**: Adjust retention periods based on your analysis needs
- **Consider Sampling**: Enable sampling for high-traffic sites to reduce storage needs
- **Periodic Review**: Regularly review and clean up tracking implementations

## Troubleshooting

### No Data Showing

If no data appears in your analytics dashboard:

1. Verify tracking is enabled in Analytics Settings
2. Check that analytics.js is properly included on your pages
3. Look for JavaScript errors in the browser console
4. Ensure the time period selection includes dates with data

### Incomplete Data

If analytics data seems incomplete:

1. Check if sampling is enabled and adjust the sampling rate
2. Verify that tracking code is present on all pages
3. Check for JavaScript errors that might interrupt tracking
4. Ensure tracking calls are not blocked by ad blockers

### Performance Issues

If the Analytics System is causing performance issues:

1. Increase the sampling rate to reduce data collection volume
2. Reduce the data retention period
3. Export and delete old data regularly
4. Optimize event tracking to focus on essential metrics

## Future Enhancements

The Analytics System is designed to be extensible. Planned future enhancements include:

- Integration with third-party analytics platforms
- Advanced data visualization options
- Goal tracking and conversion funnels
- Enhanced user flow analysis
- A/B testing support
- Custom dashboard layouts

## Support

For assistance with the Analytics System, please contact:

- **Email**: support@recoveryessentials.com
- **Documentation**: See the Technical Reference for more detailed information
