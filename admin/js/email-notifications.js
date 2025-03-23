/**
 * Email Notifications - Alert system for campaign performance
 * This module provides real-time notifications for email marketing campaigns.
 */

const EmailNotifications = (function() {
  // Private variables
  const NOTIFICATIONS_KEY = 'recoveryEssentials_email_notifications';
  const NOTIFICATION_SETTINGS_KEY = 'recoveryEssentials_notification_settings';

  let notifications = [];
  let settings = {
    enabled: true,
    desktop: true,
    browser: true,
    email: false,
    openRateThreshold: 15, // Percentage below which to notify for low open rates
    clickRateThreshold: 5, // Percentage below which to notify for low click rates
    bounceRateThreshold: 5, // Percentage above which to notify for high bounce rates
    unsubscribeRateThreshold: 2, // Percentage above which to notify for high unsubscribe rates
    performanceAlerts: true,
    deliveryAlerts: true,
    weeklyDigest: true,
    campaignCompletion: true,
    emailAddress: '' // For email notifications
  };

  // Notification types
  const NOTIFICATION_TYPE = {
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
    INFO: 'info'
  };

  /**
   * Initialize the notifications module
   */
  function init() {
    // Load saved notifications and settings
    loadData();

    // Set up event listeners
    setupEventListeners();

    // Set up polling for campaign updates
    setupPolling();

    console.log('Email Notifications initialized');
  }

  /**
   * Set up event listeners
   */
  function setupEventListeners() {
    // Listen for campaign completions
    document.addEventListener('campaignCompleted', function(event) {
      const campaign = event.detail.campaign;

      if (settings.campaignCompletion) {
        addNotification({
          type: NOTIFICATION_TYPE.SUCCESS,
          title: 'Campaign Completed',
          message: `The campaign "${campaign.name}" has completed sending.`,
          timestamp: new Date().toISOString(),
          data: {
            campaignId: campaign.id,
            campaignName: campaign.name
          },
          read: false
        });
      }

      // Check performance metrics
      checkCampaignPerformance(campaign);
    });

    // Listen for notification badge clicks
    const notificationBadge = document.getElementById('notification-badge');
    if (notificationBadge) {
      notificationBadge.addEventListener('click', toggleNotificationPanel);
    }

    // Listen for notification settings changes
    const settingsForm = document.getElementById('notification-settings-form');
    if (settingsForm) {
      settingsForm.addEventListener('submit', saveNotificationSettings);
    }
  }

  /**
   * Set up polling for campaign updates
   */
  function setupPolling() {
    // Check for campaign updates every 5 minutes
    setInterval(checkCampaignUpdates, 5 * 60 * 1000);
  }

  /**
   * Load data from storage
   */
  function loadData() {
    const storedNotifications = localStorage.getItem(NOTIFICATIONS_KEY);
    const storedSettings = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);

    if (storedNotifications) {
      notifications = JSON.parse(storedNotifications);
    }

    if (storedSettings) {
      settings = JSON.parse(storedSettings);
    }

    // Update notification badge count
    updateNotificationBadge();
  }

  /**
   * Save data to storage
   */
  function saveData() {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  }

  /**
   * Add a new notification
   * @param {Object} notification - The notification to add
   */
  function addNotification(notification) {
    // Add to beginning of array
    notifications.unshift(notification);

    // Keep only the last 50 notifications
    if (notifications.length > 50) {
      notifications = notifications.slice(0, 50);
    }

    // Save to storage
    saveData();

    // Update notification badge
    updateNotificationBadge();

    // Show desktop notification if enabled
    if (settings.desktop) {
      showDesktopNotification(notification);
    }

    // Show in-browser notification if enabled
    if (settings.browser) {
      showBrowserNotification(notification);
    }

    // Send email notification if enabled
    if (settings.email && settings.emailAddress) {
      sendEmailNotification(notification);
    }
  }

  /**
   * Update the notification badge with the unread count
   */
  function updateNotificationBadge() {
    const badge = document.getElementById('notification-badge');
    if (!badge) return;

    const unreadCount = notifications.filter(n => !n.read).length;

    if (unreadCount > 0) {
      badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  /**
   * Show a desktop notification
   * @param {Object} notification - The notification to show
   */
  function showDesktopNotification(notification) {
    // Check if desktop notifications are supported and permission is granted
    if (!('Notification' in window)) {
      console.log('Desktop notifications not supported');
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification('Recovery Essentials: ' + notification.title, {
        body: notification.message,
        icon: '/recovery-site/images/logo.png'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Recovery Essentials: ' + notification.title, {
            body: notification.message,
            icon: '/recovery-site/images/logo.png'
          });
        }
      });
    }
  }

  /**
   * Show an in-browser notification
   * @param {Object} notification - The notification to show
   */
  function showBrowserNotification(notification) {
    // Create notification element
    const notifElement = document.createElement('div');
    notifElement.className = `browser-notification ${notification.type}`;

    let bgColor = 'bg-blue-100 border-blue-500';
    let icon = 'fa-info-circle text-blue-500';

    switch(notification.type) {
      case NOTIFICATION_TYPE.SUCCESS:
        bgColor = 'bg-green-100 border-green-500';
        icon = 'fa-check-circle text-green-500';
        break;
      case NOTIFICATION_TYPE.WARNING:
        bgColor = 'bg-yellow-100 border-yellow-500';
        icon = 'fa-exclamation-triangle text-yellow-500';
        break;
      case NOTIFICATION_TYPE.ERROR:
        bgColor = 'bg-red-100 border-red-500';
        icon = 'fa-exclamation-circle text-red-500';
        break;
    }

    notifElement.className = `fixed top-4 right-4 p-4 rounded shadow-lg border-l-4 ${bgColor} z-50 max-w-md transform transition-transform duration-300 translate-x-full`;

    notifElement.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <i class="fas ${icon} text-lg"></i>
        </div>
        <div class="ml-3 w-0 flex-1">
          <p class="font-medium text-gray-900">${notification.title}</p>
          <p class="mt-1 text-sm text-gray-600">${notification.message}</p>
        </div>
        <div class="ml-4 flex-shrink-0 flex">
          <button class="inline-flex text-gray-400 focus:outline-none focus:text-gray-500 transition ease-in-out duration-150">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    `;

    // Add to document
    document.body.appendChild(notifElement);

    // Animate in
    setTimeout(() => {
      notifElement.classList.remove('translate-x-full');
    }, 10);

    // Set up close button
    const closeBtn = notifElement.querySelector('button');
    closeBtn.addEventListener('click', () => {
      notifElement.classList.add('translate-x-full');
      setTimeout(() => {
        notifElement.remove();
      }, 300);
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(notifElement)) {
        notifElement.classList.add('translate-x-full');
        setTimeout(() => {
          if (document.body.contains(notifElement)) {
            notifElement.remove();
          }
        }, 300);
      }
    }, 5000);
  }

  /**
   * Send an email notification
   * @param {Object} notification - The notification to send
   */
  function sendEmailNotification(notification) {
    // In a real implementation, this would send an email
    // For demo purposes, just log to console
    console.log(`Email notification would be sent to ${settings.emailAddress}:`, notification);
  }

  /**
   * Toggle the notification panel
   */
  function toggleNotificationPanel() {
    const panel = document.getElementById('notification-panel');
    if (!panel) return;

    panel.classList.toggle('hidden');

    // If showing panel, mark notifications as read
    if (!panel.classList.contains('hidden')) {
      markAllAsRead();

      // Populate notifications
      renderNotifications();
    }
  }

  /**
   * Mark all notifications as read
   */
  function markAllAsRead() {
    let changed = false;

    notifications.forEach(notification => {
      if (!notification.read) {
        notification.read = true;
        changed = true;
      }
    });

    if (changed) {
      saveData();
      updateNotificationBadge();
    }
  }

  /**
   * Render notifications in the notification panel
   */
  function renderNotifications() {
    const container = document.getElementById('notification-list');
    if (!container) return;

    if (notifications.length === 0) {
      container.innerHTML = `
        <div class="p-4 text-center text-gray-500">
          <p>No notifications</p>
        </div>
      `;
      return;
    }

    container.innerHTML = '';

    notifications.forEach(notification => {
      const notifElement = document.createElement('div');
      notifElement.className = 'p-4 border-b border-gray-200 hover:bg-gray-50';

      let iconClass = 'text-blue-500 fa-info-circle';

      switch(notification.type) {
        case NOTIFICATION_TYPE.SUCCESS:
          iconClass = 'text-green-500 fa-check-circle';
          break;
        case NOTIFICATION_TYPE.WARNING:
          iconClass = 'text-yellow-500 fa-exclamation-triangle';
          break;
        case NOTIFICATION_TYPE.ERROR:
          iconClass = 'text-red-500 fa-exclamation-circle';
          break;
      }

      // Format date
      const date = new Date(notification.timestamp);
      const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

      notifElement.innerHTML = `
        <div class="flex">
          <div class="flex-shrink-0">
            <i class="fas ${iconClass} text-lg"></i>
          </div>
          <div class="ml-3 flex-1">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-gray-900">${notification.title}</p>
              <p class="text-xs text-gray-500">${formattedDate}</p>
            </div>
            <p class="text-sm text-gray-600 mt-1">${notification.message}</p>
          </div>
        </div>
      `;

      container.appendChild(notifElement);
    });
  }

  /**
   * Save notification settings
   * @param {Event} event - The form submit event
   */
  function saveNotificationSettings(event) {
    event.preventDefault();

    const form = event.target;

    settings.enabled = form.elements.enableNotifications.checked;
    settings.desktop = form.elements.enableDesktopNotifications.checked;
    settings.browser = form.elements.enableBrowserNotifications.checked;
    settings.email = form.elements.enableEmailNotifications.checked;
    settings.emailAddress = form.elements.notificationEmail.value;

    settings.openRateThreshold = parseInt(form.elements.openRateThreshold.value);
    settings.clickRateThreshold = parseInt(form.elements.clickRateThreshold.value);
    settings.bounceRateThreshold = parseInt(form.elements.bounceRateThreshold.value);
    settings.unsubscribeRateThreshold = parseInt(form.elements.unsubscribeRateThreshold.value);

    settings.performanceAlerts = form.elements.performanceAlerts.checked;
    settings.deliveryAlerts = form.elements.deliveryAlerts.checked;
    settings.weeklyDigest = form.elements.weeklyDigest.checked;
    settings.campaignCompletion = form.elements.campaignCompletion.checked;

    saveData();

    // Show confirmation
    alert('Notification settings saved');
  }

  /**
   * Check for campaign updates
   */
  function checkCampaignUpdates() {
    if (!window.EmailMarketing) return;

    // Get campaigns
    const campaigns = window.EmailMarketing.getCampaigns();

    // Check each campaign
    campaigns.forEach(campaign => {
      // If campaign is completed and has stats, check performance
      if (campaign.status === 'completed' && campaign.stats) {
        checkCampaignPerformance(campaign);
      }
    });
  }

  /**
   * Check campaign performance metrics
   * @param {Object} campaign - The campaign to check
   */
  function checkCampaignPerformance(campaign) {
    if (!settings.performanceAlerts || !campaign.stats) return;

    // Check open rate
    if (campaign.stats.openRate < settings.openRateThreshold) {
      addNotification({
        type: NOTIFICATION_TYPE.WARNING,
        title: 'Low Open Rate',
        message: `Campaign "${campaign.name}" has a low open rate of ${campaign.stats.openRate}%`,
        timestamp: new Date().toISOString(),
        data: {
          campaignId: campaign.id,
          campaignName: campaign.name,
          metric: 'openRate',
          value: campaign.stats.openRate
        },
        read: false
      });
    }

    // Check click rate
    if (campaign.stats.clickRate < settings.clickRateThreshold) {
      addNotification({
        type: NOTIFICATION_TYPE.WARNING,
        title: 'Low Click Rate',
        message: `Campaign "${campaign.name}" has a low click rate of ${campaign.stats.clickRate}%`,
        timestamp: new Date().toISOString(),
        data: {
          campaignId: campaign.id,
          campaignName: campaign.name,
          metric: 'clickRate',
          value: campaign.stats.clickRate
        },
        read: false
      });
    }

    // Check bounce rate
    if (campaign.stats.bounceRate > settings.bounceRateThreshold) {
      addNotification({
        type: NOTIFICATION_TYPE.WARNING,
        title: 'High Bounce Rate',
        message: `Campaign "${campaign.name}" has a high bounce rate of ${campaign.stats.bounceRate}%`,
        timestamp: new Date().toISOString(),
        data: {
          campaignId: campaign.id,
          campaignName: campaign.name,
          metric: 'bounceRate',
          value: campaign.stats.bounceRate
        },
        read: false
      });
    }

    // Check unsubscribe rate
    if (campaign.stats.unsubscribeRate > settings.unsubscribeRateThreshold) {
      addNotification({
        type: NOTIFICATION_TYPE.WARNING,
        title: 'High Unsubscribe Rate',
        message: `Campaign "${campaign.name}" has a high unsubscribe rate of ${campaign.stats.unsubscribeRate}%`,
        timestamp: new Date().toISOString(),
        data: {
          campaignId: campaign.id,
          campaignName: campaign.name,
          metric: 'unsubscribeRate',
          value: campaign.stats.unsubscribeRate
        },
        read: false
      });
    }
  }

  /**
   * Generate a weekly performance digest
   */
  function generateWeeklyDigest() {
    if (!settings.weeklyDigest || !window.EmailMarketing) return;

    // Get campaigns from the last 7 days
    const campaigns = window.EmailMarketing.getCampaigns({
      since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    });

    if (campaigns.length === 0) return;

    // Calculate average metrics
    let totalSent = 0;
    let totalOpened = 0;
    let totalClicked = 0;
    let totalBounced = 0;
    let totalUnsubscribed = 0;

    campaigns.forEach(campaign => {
      if (campaign.stats) {
        totalSent += campaign.stats.sent || 0;
        totalOpened += campaign.stats.opened || 0;
        totalClicked += campaign.stats.clicked || 0;
        totalBounced += campaign.stats.bounced || 0;
        totalUnsubscribed += campaign.stats.unsubscribed || 0;
      }
    });

    const avgOpenRate = totalSent > 0 ? (totalOpened / totalSent * 100).toFixed(1) : 0;
    const avgClickRate = totalSent > 0 ? (totalClicked / totalSent * 100).toFixed(1) : 0;
    const avgBounceRate = totalSent > 0 ? (totalBounced / totalSent * 100).toFixed(1) : 0;
    const avgUnsubscribeRate = totalSent > 0 ? (totalUnsubscribed / totalSent * 100).toFixed(1) : 0;

    // Create digest notification
    addNotification({
      type: NOTIFICATION_TYPE.INFO,
      title: 'Weekly Performance Digest',
      message: `Last 7 days: ${campaigns.length} campaigns, ${totalSent} emails sent. Avg metrics: ${avgOpenRate}% opens, ${avgClickRate}% clicks, ${avgBounceRate}% bounces, ${avgUnsubscribeRate}% unsubscribes.`,
      timestamp: new Date().toISOString(),
      data: {
        campaigns: campaigns.length,
        sent: totalSent,
        avgOpenRate,
        avgClickRate,
        avgBounceRate,
        avgUnsubscribeRate
      },
      read: false
    });
  }

  // Schedule weekly digest every Monday at 9am
  function scheduleWeeklyDigest() {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, ...
    const hour = now.getHours();
    const minute = now.getMinutes();

    // Calculate time until next Monday at 9am
    let daysUntilMonday = (day === 1 && hour < 9) ? 0 : (8 - day) % 7;
    if (day === 1 && hour === 9 && minute < 15) {
      // It's Monday between 9:00 and 9:15, run now
      daysUntilMonday = 0;
      setTimeout(generateWeeklyDigest, 1000);
      return;
    }

    const nextMonday = new Date();
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    nextMonday.setHours(9, 0, 0, 0);

    const timeUntilNextMonday = nextMonday.getTime() - now.getTime();

    // Schedule the digest
    setTimeout(() => {
      generateWeeklyDigest();
      // Schedule next week's digest
      scheduleWeeklyDigest();
    }, timeUntilNextMonday);
  }

  // Public API
  return {
    init,
    getNotifications: () => notifications,
    getSettings: () => settings,
    updateSettings: (newSettings) => {
      settings = { ...settings, ...newSettings };
      saveData();
      return settings;
    },
    addNotification,
    markAllAsRead,
    clearAllNotifications: () => {
      notifications = [];
      saveData();
      updateNotificationBadge();
    }
  };
})();

// If running in browser context, initialize automatically
if (typeof window !== 'undefined' && !window.isTestingEnvironment) {
  document.addEventListener('DOMContentLoaded', function() {
    if (EmailNotifications && typeof EmailNotifications.init === 'function') {
      EmailNotifications.init();
    }
  });
}
