/**
 * Email Marketing UI Controller - Handles UI interactions for email marketing
 * This module controls the tab switching and other UI interactions for the Email Marketing page.
 */

class EmailMarketingUIController {
  constructor() {
    this.activeTab = 'campaigns';
    this.tabContentPrefix = '';
    this.setupEventListeners();
    this.initIntegrationsUI();
    this.initNotificationUI();
  }

  /**
   * Set up event listeners for UI interactions
   */
  setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.email-tabs .nav-link').forEach(tab => {
      tab.addEventListener('click', this.handleTabClick.bind(this));
    });

    // Create campaign button
    const createCampaignBtn = document.getElementById('create-campaign-btn');
    if (createCampaignBtn) {
      createCampaignBtn.addEventListener('click', () => {
        // Show campaign creation form or modal
        if (window.EmailMarketing) {
          window.EmailMarketing.showCampaignForm();
        }
      });
    }

    // Create template button
    const createTemplateBtn = document.getElementById('create-template-btn');
    if (createTemplateBtn) {
      createTemplateBtn.addEventListener('click', () => {
        // Show template creation form or modal
        if (window.EmailMarketing) {
          window.EmailMarketing.showTemplateForm();
        }
      });
    }
  }

  /**
   * Handle tab click events
   * @param {Event} event - The click event
   */
  handleTabClick(event) {
    const tabId = event.currentTarget.id;
    const tabName = tabId.replace('-tab', '');

    // Update active tab styling
    document.querySelectorAll('.email-tabs .nav-link').forEach(tab => {
      tab.classList.remove('active', 'border-indigo-500', 'text-indigo-600');
      tab.classList.add('border-transparent', 'text-gray-500');
    });

    event.currentTarget.classList.remove('border-transparent', 'text-gray-500');
    event.currentTarget.classList.add('active', 'border-indigo-500', 'text-indigo-600');

    // Show corresponding content
    this.showTabContent(tabName);
  }

  /**
   * Show the content for the selected tab
   * @param {string} tabName - The name of the tab to show
   */
  showTabContent(tabName) {
    this.activeTab = tabName;

    // Hide all tab content
    document.querySelectorAll('#tab-content > div').forEach(content => {
      content.classList.add('hidden');
    });

    // Show active tab content
    const contentId = `${tabName}-content`;
    const contentElement = document.getElementById(contentId);

    if (contentElement) {
      contentElement.classList.remove('hidden');
    } else {
      console.log(`Content for tab ${tabName} not found`);
    }
  }

  /**
   * Initialize the Integrations UI
   */
  initIntegrationsUI() {
    // Set up event listeners for integrations tab
    this.setupMailchimpIntegration();
  }

  /**
   * Initialize the notification UI elements
   */
  initNotificationUI() {
    // Set up event listeners for notification-related UI elements
    this.setupNotificationTrigger();
    this.setupNotificationSettingsModal();
    this.setupTestNotifications();
  }

  /**
   * Set up the notification trigger button
   */
  setupNotificationTrigger() {
    const triggerBtn = document.getElementById('notification-trigger');
    const panel = document.getElementById('notification-panel');
    const markAllReadBtn = document.getElementById('mark-all-read-btn');
    const settingsBtn = document.getElementById('notification-settings-btn');

    if (!triggerBtn || !panel) return;

    // Toggle panel on trigger button click
    triggerBtn.addEventListener('click', () => {
      panel.classList.toggle('hidden');

      // If showing panel, update notifications
      if (!panel.classList.contains('hidden') && window.EmailNotifications) {
        // Mark all as read
        window.EmailNotifications.markAllAsRead();

        // Re-render notifications
        this.renderNotifications();
      }
    });

    // Close panel when clicking outside
    document.addEventListener('click', (event) => {
      if (!triggerBtn.contains(event.target) && !panel.contains(event.target) && !panel.classList.contains('hidden')) {
        panel.classList.add('hidden');
      }
    });

    // Mark all as read button
    if (markAllReadBtn && window.EmailNotifications) {
      markAllReadBtn.addEventListener('click', () => {
        window.EmailNotifications.markAllAsRead();
        this.renderNotifications();
      });
    }

    // Settings button
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        this.openNotificationSettingsModal();
        panel.classList.add('hidden');
      });
    }
  }

  /**
   * Render notifications in the panel
   */
  renderNotifications() {
    if (!window.EmailNotifications) return;

    const container = document.getElementById('notification-list');
    if (!container) return;

    const notifications = window.EmailNotifications.getNotifications();

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
        case 'success':
          iconClass = 'text-green-500 fa-check-circle';
          break;
        case 'warning':
          iconClass = 'text-yellow-500 fa-exclamation-triangle';
          break;
        case 'error':
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
   * Set up the notification settings modal
   */
  setupNotificationSettingsModal() {
    const modal = document.getElementById('notification-settings-modal');
    const settingsBtn = document.getElementById('settings-btn');
    const notificationSettingsBtn = document.getElementById('notification-settings-btn');
    const closeBtn = document.getElementById('close-notification-settings');
    const cancelBtn = document.getElementById('cancel-notification-settings');
    const form = document.getElementById('notification-settings-form');

    if (!modal || !form) return;

    // Open modal when settings button is clicked
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        this.openNotificationSettingsModal();
      });
    }

    // Close modal when close button is clicked
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
      });
    }

    // Close modal when cancel button is clicked
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
      });
    }

    // Handle form submission
    if (form && window.EmailNotifications) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();

        // Get settings from form
        const settings = {
          enabled: form.elements.enableNotifications.checked,
          desktop: form.elements.enableDesktopNotifications.checked,
          browser: form.elements.enableBrowserNotifications.checked,
          email: form.elements.enableEmailNotifications.checked,
          emailAddress: form.elements.notificationEmail.value,
          openRateThreshold: parseInt(form.elements.openRateThreshold.value),
          clickRateThreshold: parseInt(form.elements.clickRateThreshold.value),
          bounceRateThreshold: parseInt(form.elements.bounceRateThreshold.value),
          unsubscribeRateThreshold: parseInt(form.elements.unsubscribeRateThreshold.value),
          performanceAlerts: form.elements.performanceAlerts.checked,
          deliveryAlerts: form.elements.deliveryAlerts.checked,
          weeklyDigest: form.elements.weeklyDigest.checked,
          campaignCompletion: form.elements.campaignCompletion.checked
        };

        // Update settings
        window.EmailNotifications.updateSettings(settings);

        // Close modal
        modal.classList.add('hidden');

        // Show confirmation
        alert('Notification settings saved');
      });
    }
  }

  /**
   * Open the notification settings modal and populate with current settings
   */
  openNotificationSettingsModal() {
    if (!window.EmailNotifications) return;

    const modal = document.getElementById('notification-settings-modal');
    const form = document.getElementById('notification-settings-form');

    if (!modal || !form) return;

    // Get current settings
    const settings = window.EmailNotifications.getSettings();

    // Populate form with current settings
    form.elements.enableNotifications.checked = settings.enabled;
    form.elements.enableDesktopNotifications.checked = settings.desktop;
    form.elements.enableBrowserNotifications.checked = settings.browser;
    form.elements.enableEmailNotifications.checked = settings.email;
    form.elements.notificationEmail.value = settings.emailAddress;
    form.elements.openRateThreshold.value = settings.openRateThreshold;
    form.elements.clickRateThreshold.value = settings.clickRateThreshold;
    form.elements.bounceRateThreshold.value = settings.bounceRateThreshold;
    form.elements.unsubscribeRateThreshold.value = settings.unsubscribeRateThreshold;
    form.elements.performanceAlerts.checked = settings.performanceAlerts;
    form.elements.deliveryAlerts.checked = settings.deliveryAlerts;
    form.elements.weeklyDigest.checked = settings.weeklyDigest;
    form.elements.campaignCompletion.checked = settings.campaignCompletion;

    // Show modal
    modal.classList.remove('hidden');
  }

  /**
   * Set up test notifications for demonstration purposes
   */
  setupTestNotifications() {
    // Add a button in dev environments for testing notifications
    if (process.env.NODE_ENV === 'development' && window.EmailNotifications) {
      const testBtn = document.createElement('button');
      testBtn.textContent = 'Test Notification';
      testBtn.className = 'mt-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-md text-sm';
      testBtn.style.position = 'fixed';
      testBtn.style.bottom = '10px';
      testBtn.style.right = '10px';
      testBtn.style.zIndex = '9999';

      testBtn.addEventListener('click', () => {
        // Create a test notification
        window.EmailNotifications.addNotification({
          type: 'success',
          title: 'Test Notification',
          message: 'This is a test notification from the Email Marketing system',
          timestamp: new Date().toISOString(),
          data: {},
          read: false
        });
      });

      document.body.appendChild(testBtn);
    }

    // In all environments, add a context menu option for testing notifications
    document.addEventListener('contextmenu', (event) => {
      if (window.EmailNotifications && event.ctrlKey) {
        event.preventDefault();

        // Create a test notification when control + right-click
        window.EmailNotifications.addNotification({
          type: 'info',
          title: 'Debug Notification',
          message: 'This is a debug notification created with Ctrl+Right-Click',
          timestamp: new Date().toISOString(),
          data: {},
          read: false
        });
      }
    });
  }

  /**
   * Set up Mailchimp integration UI
   */
  setupMailchimpIntegration() {
    // Provider card selection
    const mailchimpCard = document.querySelector('[data-provider="mailchimp"]');
    if (mailchimpCard) {
      mailchimpCard.addEventListener('click', () => {
        // Highlight selected provider
        document.querySelectorAll('.provider-card').forEach(card => {
          card.classList.remove('border-indigo-500');
        });
        mailchimpCard.classList.add('border-indigo-500');

        // Show Mailchimp configuration form
        document.getElementById('mailchimp-integration-form').classList.remove('hidden');
      });
    }

    // Connect button
    const connectBtn = document.getElementById('connect-mailchimp-btn');
    if (connectBtn) {
      connectBtn.addEventListener('click', this.handleMailchimpConnect.bind(this));
    }

    // Disconnect button
    const disconnectBtn = document.getElementById('disconnect-mailchimp-btn');
    if (disconnectBtn) {
      disconnectBtn.addEventListener('click', this.handleMailchimpDisconnect.bind(this));
    }

    // Lists refresh button
    const refreshListsBtn = document.getElementById('refresh-lists-btn');
    if (refreshListsBtn) {
      refreshListsBtn.addEventListener('click', this.handleMailchimpListsRefresh.bind(this));
    }

    // Templates refresh button
    const refreshTemplatesBtn = document.getElementById('refresh-templates-btn');
    if (refreshTemplatesBtn) {
      refreshTemplatesBtn.addEventListener('click', this.handleMailchimpTemplatesRefresh.bind(this));
    }

    // Sync templates button
    const syncTemplatesBtn = document.getElementById('sync-templates-btn');
    if (syncTemplatesBtn) {
      syncTemplatesBtn.addEventListener('click', this.handleMailchimpTemplatesSync.bind(this));
    }

    // Campaigns refresh button
    const refreshCampaignsBtn = document.getElementById('refresh-campaigns-btn');
    if (refreshCampaignsBtn) {
      refreshCampaignsBtn.addEventListener('click', this.handleMailchimpCampaignsRefresh.bind(this));
    }

    // Create campaign button
    const createCampaignBtn = document.getElementById('create-mailchimp-campaign-btn');
    if (createCampaignBtn) {
      createCampaignBtn.addEventListener('click', this.handleCreateMailchimpCampaign.bind(this));
    }

    // Check if we already have a configured Mailchimp connection
    this.checkExistingMailchimpConnection();
  }

  /**
   * Check if Mailchimp is already connected
   */
  checkExistingMailchimpConnection() {
    if (window.EmailServiceIntegrations) {
      const provider = window.EmailServiceIntegrations.getActiveProvider();

      if (provider && provider.id === 'mailchimp' && provider.isConfigured && provider.isActive) {
        this.updateMailchimpConnectionStatus(true);
        this.loadMailchimpData();
      }
    }
  }

  /**
   * Handle the Mailchimp connect button click
   */
  async handleMailchimpConnect() {
    const apiKeyInput = document.getElementById('mailchimp-api-key');
    const serverPrefixInput = document.getElementById('mailchimp-server-prefix');
    const statusElement = document.getElementById('mailchimp-connection-status');

    if (!apiKeyInput.value || !serverPrefixInput.value) {
      statusElement.textContent = 'Please provide both API Key and Server Prefix';
      statusElement.classList.add('text-red-500');
      return;
    }

    // Update UI to show connecting status
    const connectBtn = document.getElementById('connect-mailchimp-btn');
    connectBtn.disabled = true;
    connectBtn.textContent = 'Connecting...';
    statusElement.textContent = 'Connecting to Mailchimp...';
    statusElement.classList.add('text-blue-500');
    statusElement.classList.remove('text-red-500', 'text-green-500');

    try {
      // Connect to Mailchimp
      if (!window.EmailServiceIntegrations) {
        throw new Error('Email Service Integrations module not available');
      }

      const result = await window.EmailServiceIntegrations.mailchimp.connect(
        apiKeyInput.value,
        serverPrefixInput.value
      );

      if (result.success) {
        // Update UI to show success
        statusElement.textContent = result.message || 'Connected to Mailchimp successfully';
        statusElement.classList.add('text-green-500');
        statusElement.classList.remove('text-red-500', 'text-blue-500');

        // Update connection status
        this.updateMailchimpConnectionStatus(true);

        // Load Mailchimp data
        this.loadMailchimpData();
      } else {
        // Update UI to show error
        statusElement.textContent = result.message || 'Failed to connect to Mailchimp';
        statusElement.classList.add('text-red-500');
        statusElement.classList.remove('text-green-500', 'text-blue-500');

        // Reset connect button
        connectBtn.disabled = false;
        connectBtn.textContent = 'Connect to Mailchimp';
      }
    } catch (error) {
      console.error('Error connecting to Mailchimp:', error);

      // Update UI to show error
      statusElement.textContent = error.message || 'An error occurred while connecting to Mailchimp';
      statusElement.classList.add('text-red-500');
      statusElement.classList.remove('text-green-500', 'text-blue-500');

      // Reset connect button
      connectBtn.disabled = false;
      connectBtn.textContent = 'Connect to Mailchimp';
    }
  }

  /**
   * Update the Mailchimp connection status in the UI
   * @param {boolean} isConnected - Whether Mailchimp is connected
   */
  updateMailchimpConnectionStatus(isConnected) {
    const statusBadge = document.getElementById('mailchimp-status');
    const connectBtn = document.getElementById('connect-mailchimp-btn');
    const disconnectBtn = document.getElementById('disconnect-mailchimp-btn');
    const actionsContainer = document.getElementById('mailchimp-actions');
    const mailchimpCard = document.querySelector('[data-provider="mailchimp"]');

    if (isConnected) {
      // Update status badge
      statusBadge.textContent = 'Connected';
      statusBadge.classList.remove('bg-gray-200', 'text-gray-700');
      statusBadge.classList.add('bg-green-100', 'text-green-700');

      // Update connect/disconnect buttons
      connectBtn.classList.add('hidden');
      disconnectBtn.classList.remove('hidden');

      // Show actions container
      actionsContainer.classList.remove('hidden');

      // Update provider card
      mailchimpCard.classList.add('border-green-500');
    } else {
      // Update status badge
      statusBadge.textContent = 'Not Connected';
      statusBadge.classList.remove('bg-green-100', 'text-green-700');
      statusBadge.classList.add('bg-gray-200', 'text-gray-700');

      // Update connect/disconnect buttons
      connectBtn.classList.remove('hidden');
      disconnectBtn.classList.add('hidden');

      // Hide actions container
      actionsContainer.classList.add('hidden');

      // Update provider card
      mailchimpCard.classList.remove('border-green-500');

      // Reset form
      document.getElementById('mailchimp-api-key').value = '';
      document.getElementById('mailchimp-server-prefix').value = '';
      document.getElementById('mailchimp-connection-status').textContent = '';
    }
  }

  /**
   * Handle the Mailchimp disconnect button click
   */
  handleMailchimpDisconnect() {
    // Update UI
    this.updateMailchimpConnectionStatus(false);

    // Clear provider in storage
    if (window.EmailServiceIntegrations) {
      // Set active provider to null (implementation would need to be updated)
      // For now, just log a message
      console.log('Disconnected from Mailchimp');
    }
  }

  /**
   * Load Mailchimp data (lists, templates, campaigns)
   */
  async loadMailchimpData() {
    if (!window.EmailServiceIntegrations) return;

    try {
      // Load lists
      this.handleMailchimpListsRefresh();

      // Load templates
      this.handleMailchimpTemplatesRefresh();

      // Load campaigns
      this.handleMailchimpCampaignsRefresh();
    } catch (error) {
      console.error('Error loading Mailchimp data:', error);
    }
  }

  /**
   * Handle Mailchimp lists refresh
   */
  async handleMailchimpListsRefresh() {
    if (!window.EmailServiceIntegrations) return;

    const listsContainer = document.getElementById('mailchimp-lists-body');
    listsContainer.innerHTML = '<div class="p-4 text-gray-500 text-sm">Loading lists...</div>';

    try {
      const result = await window.EmailServiceIntegrations.mailchimp.getLists();

      if (result.success && result.data) {
        if (result.data.length === 0) {
          listsContainer.innerHTML = '<div class="p-4 text-gray-500 text-sm italic">No lists found</div>';
        } else {
          listsContainer.innerHTML = '';

          result.data.forEach(list => {
            const listRow = document.createElement('div');
            listRow.className = 'grid grid-cols-4 gap-4 p-4 text-sm';
            listRow.innerHTML = `
              <div class="font-medium text-gray-900">${list.name}</div>
              <div>${list.memberCount} subscribers</div>
              <div class="text-gray-500">${list.id}</div>
              <div>
                <button class="sync-to-list-btn px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200" data-list-id="${list.id}">
                  Sync Contacts
                </button>
              </div>
            `;
            listsContainer.appendChild(listRow);
          });

          // Add event listeners for sync buttons
          document.querySelectorAll('.sync-to-list-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
              const listId = e.currentTarget.getAttribute('data-list-id');
              this.handleSyncToList(listId);
            });
          });
        }
      } else {
        listsContainer.innerHTML = `<div class="p-4 text-red-500 text-sm">${result.message || 'Failed to load lists'}</div>`;
      }
    } catch (error) {
      console.error('Error refreshing Mailchimp lists:', error);
      listsContainer.innerHTML = `<div class="p-4 text-red-500 text-sm">${error.message || 'An error occurred while loading lists'}</div>`;
    }
  }

  /**
   * Handle Mailchimp templates refresh
   */
  async handleMailchimpTemplatesRefresh() {
    if (!window.EmailServiceIntegrations) return;

    const templatesContainer = document.getElementById('mailchimp-templates-body');
    templatesContainer.innerHTML = '<div class="p-4 text-gray-500 text-sm">Loading templates...</div>';

    try {
      const result = await window.EmailServiceIntegrations.mailchimp.getTemplates();

      if (result.success && result.data) {
        if (result.data.length === 0) {
          templatesContainer.innerHTML = '<div class="p-4 text-gray-500 text-sm italic">No templates found</div>';
        } else {
          templatesContainer.innerHTML = '';

          result.data.forEach(template => {
            const templateRow = document.createElement('div');
            templateRow.className = 'grid grid-cols-4 gap-4 p-4 text-sm';
            templateRow.innerHTML = `
              <div class="font-medium text-gray-900">${template.name}</div>
              <div class="capitalize">${template.category}</div>
              <div class="text-gray-500">${template.id}</div>
              <div>
                <button class="use-template-btn px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 mr-1" data-template-id="${template.id}">
                  Use
                </button>
                <button class="preview-template-btn px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200" data-template-id="${template.id}">
                  Preview
                </button>
              </div>
            `;
            templatesContainer.appendChild(templateRow);
          });
        }
      } else {
        templatesContainer.innerHTML = `<div class="p-4 text-red-500 text-sm">${result.message || 'Failed to load templates'}</div>`;
      }
    } catch (error) {
      console.error('Error refreshing Mailchimp templates:', error);
      templatesContainer.innerHTML = `<div class="p-4 text-red-500 text-sm">${error.message || 'An error occurred while loading templates'}</div>`;
    }
  }

  /**
   * Handle Mailchimp campaigns refresh
   */
  async handleMailchimpCampaignsRefresh() {
    if (!window.EmailServiceIntegrations) return;

    const campaignsContainer = document.getElementById('mailchimp-campaigns-body');
    campaignsContainer.innerHTML = '<div class="p-4 text-gray-500 text-sm">Loading campaigns...</div>';

    try {
      const result = await window.EmailServiceIntegrations.mailchimp.getCampaigns();

      if (result.success && result.data) {
        if (result.data.length === 0) {
          campaignsContainer.innerHTML = '<div class="p-4 text-gray-500 text-sm italic">No campaigns found</div>';
        } else {
          campaignsContainer.innerHTML = '';

          result.data.forEach(campaign => {
            const campaignRow = document.createElement('div');
            campaignRow.className = 'grid grid-cols-5 gap-4 p-4 text-sm';

            // Format send time
            const sendTime = campaign.sendTime ? new Date(campaign.sendTime).toLocaleDateString() : 'Not scheduled';

            // Format status with color
            let statusHtml = '';
            switch(campaign.status) {
              case 'sent':
                statusHtml = '<span class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Sent</span>';
                break;
              case 'scheduled':
                statusHtml = '<span class="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">Scheduled</span>';
                break;
              case 'draft':
                statusHtml = '<span class="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">Draft</span>';
                break;
              default:
                statusHtml = `<span class="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">${campaign.status}</span>`;
            }

            // Format performance metrics
            let performanceHtml = 'No data available';

            if (campaign.stats) {
              performanceHtml = `
                <div class="flex flex-col">
                  <span>Opens: ${campaign.stats.openRate}%</span>
                  <span>Clicks: ${campaign.stats.clickRate}%</span>
                </div>
              `;
            }

            campaignRow.innerHTML = `
              <div class="font-medium text-gray-900">${campaign.name}</div>
              <div>${statusHtml}</div>
              <div>${sendTime}</div>
              <div>${performanceHtml}</div>
              <div>
                <button class="view-campaign-btn px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 mr-1" data-campaign-id="${campaign.id}">
                  View
                </button>
                <button class="duplicate-campaign-btn px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200" data-campaign-id="${campaign.id}">
                  Duplicate
                </button>
              </div>
            `;
            campaignsContainer.appendChild(campaignRow);
          });
        }
      } else {
        campaignsContainer.innerHTML = `<div class="p-4 text-red-500 text-sm">${result.message || 'Failed to load campaigns'}</div>`;
      }
    } catch (error) {
      console.error('Error refreshing Mailchimp campaigns:', error);
      campaignsContainer.innerHTML = `<div class="p-4 text-red-500 text-sm">${error.message || 'An error occurred while loading campaigns'}</div>`;
    }
  }

  /**
   * Handle Mailchimp templates sync
   */
  async handleMailchimpTemplatesSync() {
    if (!window.EmailServiceIntegrations || !window.EmailTemplateLibrary) return;

    try {
      // Get local templates
      const localTemplates = window.EmailTemplateLibrary.getAllTemplates();

      // Sync with Mailchimp
      const result = await window.EmailServiceIntegrations.mailchimp.syncTemplates(localTemplates);

      if (result.success) {
        // Show success message
        alert(`Templates synced successfully: ${result.data.created} created, ${result.data.updated} updated`);

        // Refresh templates
        this.handleMailchimpTemplatesRefresh();
      } else {
        alert(result.message || 'Failed to sync templates');
      }
    } catch (error) {
      console.error('Error syncing templates with Mailchimp:', error);
      alert(error.message || 'An error occurred while syncing templates');
    }
  }

  /**
   * Handle sync contacts to Mailchimp list
   * @param {string} listId - The Mailchimp list ID
   */
  async handleSyncToList(listId) {
    if (!window.EmailServiceIntegrations) return;

    try {
      // In a real implementation, this would get customers from the CRM
      // For demonstration, create some example subscribers
      const subscribers = [
        { email: 'customer1@example.com', firstName: 'John', lastName: 'Doe' },
        { email: 'customer2@example.com', firstName: 'Jane', lastName: 'Smith' },
        { email: 'customer3@example.com', firstName: 'Robert', lastName: 'Johnson' }
      ];

      // Import subscribers to Mailchimp
      const result = await window.EmailServiceIntegrations.mailchimp.importSubscribers(listId, subscribers);

      if (result.success) {
        alert(`Subscribers imported successfully: ${result.data.imported} imported, ${result.data.updated} updated, ${result.data.failed} failed`);
      } else {
        alert(result.message || 'Failed to import subscribers');
      }
    } catch (error) {
      console.error('Error importing subscribers to Mailchimp:', error);
      alert(error.message || 'An error occurred while importing subscribers');
    }
  }

  /**
   * Handle create Mailchimp campaign
   */
  async handleCreateMailchimpCampaign() {
    if (!window.EmailServiceIntegrations) return;

    // In a real implementation, this would show a form to configure the campaign
    // For demonstration, create a campaign with default values
    const campaignData = {
      name: `Campaign ${new Date().toLocaleDateString()}`,
      subject: 'New Campaign from Recovery Essentials',
      fromName: 'Recovery Essentials',
      fromEmail: 'marketing@recoveryessentials.com',
      replyTo: 'support@recoveryessentials.com',
      content: '<h1>Hello from Recovery Essentials!</h1><p>This is a test campaign.</p>'
    };

    try {
      const result = await window.EmailServiceIntegrations.mailchimp.createCampaign(campaignData);

      if (result.success) {
        alert('Campaign created successfully!');

        // Refresh campaigns
        this.handleMailchimpCampaignsRefresh();
      } else {
        alert(result.message || 'Failed to create campaign');
      }
    } catch (error) {
      console.error('Error creating Mailchimp campaign:', error);
      alert(error.message || 'An error occurred while creating campaign');
    }
  }
}

// Make the module available globally
window.EmailMarketingUIController = EmailMarketingUIController;
