/**
 * Recovery Essentials - Email Marketing System
 * This module provides email marketing capabilities for the Recovery Essentials admin panel.
 * It integrates with the CRM system to segment customers and send targeted campaigns.
 */

// Define the EmailMarketing module
const EmailMarketing = (function() {
  // Private variables
  const CAMPAIGNS_KEY = 'recoveryEssentials_email_campaigns';
  const TEMPLATES_KEY = 'recoveryEssentials_email_templates';
  const SEGMENTS_KEY = 'recoveryEssentials_email_segments';
  const AUTOMATIONS_KEY = 'recoveryEssentials_email_automations';
  const STATS_KEY = 'recoveryEssentials_email_stats';

  let campaigns = [];
  let templates = [];
  let segments = [];
  let automations = [];
  let stats = {
    activeCampaigns: 0,
    emailsSent: 0,
    openRate: 0,
    clickRate: 0,
    lastUpdated: new Date().toISOString()
  };

  // Campaign status constants
  const CAMPAIGN_STATUS = {
    DRAFT: 'draft',
    SCHEDULED: 'scheduled',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    PAUSED: 'paused'
  };

  // Campaign type constants
  const CAMPAIGN_TYPE = {
    REGULAR: 'regular',
    AUTOMATED: 'automated',
    AB_TEST: 'ab-test'
  };

  // Template category constants
  const TEMPLATE_CATEGORY = {
    PROMOTIONAL: 'promotional',
    NEWSLETTER: 'newsletter',
    TRANSACTIONAL: 'transactional',
    WELCOME: 'welcome',
    ABANDONED_CART: 'abandoned-cart'
  };

  /**
   * Initialize the email marketing system
   */
  function init() {
    // Load data from storage
    loadData();

    // Setup UI with current data
    setupUI();

    // Connect to other systems (CRM, etc.)
    connectToSystems();

    // Add demo data if none exists
    if (campaigns.length === 0) {
      createDemoData();
      saveData();
    }

    console.log('Email Marketing System initialized');
  }

  /**
   * Load data from storage
   */
  function loadData() {
    const storedCampaigns = localStorage.getItem(CAMPAIGNS_KEY);
    const storedTemplates = localStorage.getItem(TEMPLATES_KEY);
    const storedSegments = localStorage.getItem(SEGMENTS_KEY);
    const storedAutomations = localStorage.getItem(AUTOMATIONS_KEY);
    const storedStats = localStorage.getItem(STATS_KEY);

    if (storedCampaigns) campaigns = JSON.parse(storedCampaigns);
    if (storedTemplates) templates = JSON.parse(storedTemplates);
    if (storedSegments) segments = JSON.parse(storedSegments);
    if (storedAutomations) automations = JSON.parse(storedAutomations);
    if (storedStats) stats = JSON.parse(storedStats);
  }

  /**
   * Save data to storage
   */
  function saveData() {
    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns));
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
    localStorage.setItem(SEGMENTS_KEY, JSON.stringify(segments));
    localStorage.setItem(AUTOMATIONS_KEY, JSON.stringify(automations));
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }

  /**
   * Connect to other systems like CRM
   */
  function connectToSystems() {
    // Connect to Customer Relationship Management system
    if (window.CustomerManagement) {
      console.log('Connected to CRM system');

      // Example: Listen for customer updates to trigger emails
      document.addEventListener('customerCreated', handleCustomerCreated);
      document.addEventListener('customerSegmentChanged', handleCustomerSegmentChanged);
    }

    // Connect to Order Management system
    if (window.OrderManagement) {
      console.log('Connected to Order Management system');

      // Example: Listen for order events to trigger transactional emails
      document.addEventListener('orderCreated', handleOrderCreated);
      document.addEventListener('orderStatusChanged', handleOrderStatusChanged);
    }
  }

  /**
   * Create demo data for testing
   */
  function createDemoData() {
    // Create demo templates
    templates = [
      {
        id: 'template_' + Date.now() + '_1',
        name: 'Welcome Email',
        category: TEMPLATE_CATEGORY.WELCOME,
        subject: 'Welcome to Recovery Essentials!',
        content: '<h1>Welcome to Recovery Essentials!</h1><p>We\'re excited to have you join our community of recovery enthusiasts.</p>',
        previewImage: 'https://placehold.co/600x400/e6f7ff/0072b1?text=Welcome+Email',
        created: new Date().toISOString(),
        lastUsed: null,
        usageCount: 0
      },
      {
        id: 'template_' + Date.now() + '_2',
        name: 'Monthly Newsletter',
        category: TEMPLATE_CATEGORY.NEWSLETTER,
        subject: 'Recovery Essentials Newsletter - {{month}}',
        content: '<h1>Recovery Essentials Newsletter</h1><p>Check out our latest products and recovery tips!</p>',
        previewImage: 'https://placehold.co/600x400/f2f2f2/333333?text=Monthly+Newsletter',
        created: new Date().toISOString(),
        lastUsed: null,
        usageCount: 0
      },
      {
        id: 'template_' + Date.now() + '_3',
        name: 'Product Promotion',
        category: TEMPLATE_CATEGORY.PROMOTIONAL,
        subject: 'Special Offer: 20% Off Recovery Products!',
        content: '<h1>Limited Time Offer!</h1><p>Get 20% off all recovery products this week only.</p>',
        previewImage: 'https://placehold.co/600x400/fff5e6/ff9900?text=Product+Promotion',
        created: new Date().toISOString(),
        lastUsed: null,
        usageCount: 0
      }
    ];

    // Create demo segments
    segments = [
      {
        id: 'segment_' + Date.now() + '_1',
        name: 'All Customers',
        description: 'All customers in the database',
        criteria: { type: 'all' },
        count: 128,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'segment_' + Date.now() + '_2',
        name: 'New Customers',
        description: 'Customers who registered in the last 30 days',
        criteria: { type: 'segment', value: 'new' },
        count: 42,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'segment_' + Date.now() + '_3',
        name: 'VIP Customers',
        description: 'High-value customers with multiple purchases',
        criteria: { type: 'segment', value: 'vip' },
        count: 23,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'segment_' + Date.now() + '_4',
        name: 'Inactive Customers',
        description: 'Customers who haven\'t purchased in 90+ days',
        criteria: { type: 'segment', value: 'inactive' },
        count: 37,
        lastUpdated: new Date().toISOString()
      }
    ];

    // Create demo campaigns
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    campaigns = [
      {
        id: 'campaign_' + Date.now() + '_1',
        name: 'March Newsletter',
        subject: 'Recovery Essentials Newsletter - March 2025',
        status: CAMPAIGN_STATUS.COMPLETED,
        type: CAMPAIGN_TYPE.REGULAR,
        templateId: templates[1].id,
        segmentId: segments[0].id,
        recipients: 128,
        sent: lastWeek.toISOString(),
        scheduled: null,
        stats: {
          opened: 76,
          clicked: 38,
          openRate: 59,
          clickRate: 30,
          bounced: 2,
          unsubscribed: 1
        }
      },
      {
        id: 'campaign_' + Date.now() + '_2',
        name: 'Welcome Series',
        subject: 'Welcome to Recovery Essentials!',
        status: CAMPAIGN_STATUS.ACTIVE,
        type: CAMPAIGN_TYPE.AUTOMATED,
        templateId: templates[0].id,
        segmentId: segments[1].id,
        recipients: 42,
        sent: null,
        scheduled: null,
        stats: {
          opened: 28,
          clicked: 18,
          openRate: 67,
          clickRate: 43,
          bounced: 0,
          unsubscribed: 0
        }
      },
      {
        id: 'campaign_' + Date.now() + '_3',
        name: 'Spring Sale Promotion',
        subject: 'Special Spring Offers Inside!',
        status: CAMPAIGN_STATUS.SCHEDULED,
        type: CAMPAIGN_TYPE.REGULAR,
        templateId: templates[2].id,
        segmentId: segments[0].id,
        recipients: 128,
        sent: null,
        scheduled: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3).toISOString(),
        stats: {
          opened: 0,
          clicked: 0,
          openRate: 0,
          clickRate: 0,
          bounced: 0,
          unsubscribed: 0
        }
      }
    ];

    // Create demo automations
    automations = [
      {
        id: 'automation_' + Date.now() + '_1',
        name: 'Welcome Series',
        status: 'active',
        trigger: 'customer_created',
        steps: [
          {
            delay: 0, // immediate
            templateId: templates[0].id,
            subject: 'Welcome to Recovery Essentials!'
          },
          {
            delay: 3, // 3 days
            templateId: templates[2].id,
            subject: 'Exclusive Offer for New Customers'
          }
        ],
        created: new Date().toISOString(),
        lastTriggered: yesterday.toISOString(),
        triggerCount: 42
      },
      {
        id: 'automation_' + Date.now() + '_2',
        name: 'Abandoned Cart Recovery',
        status: 'active',
        trigger: 'cart_abandoned',
        steps: [
          {
            delay: 1, // 1 day
            templateId: templates[2].id,
            subject: 'Did You Forget Something?'
          },
          {
            delay: 3, // 3 days
            templateId: templates[2].id,
            subject: 'Last Chance: Complete Your Purchase'
          }
        ],
        created: new Date().toISOString(),
        lastTriggered: today.toISOString(),
        triggerCount: 18
      }
    ];

    // Update stats
    stats = {
      activeCampaigns: campaigns.filter(c => c.status === CAMPAIGN_STATUS.ACTIVE || c.status === CAMPAIGN_STATUS.SCHEDULED).length,
      emailsSent: 189,
      openRate: 62,
      clickRate: 34,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Setup the UI with the loaded data
   */
  function setupUI() {
    // Update dashboard stats
    updateDashboardStats();

    // Setup tab navigation
    setupTabNavigation();

    // Load campaigns list
    loadCampaigns();

    // Setup event listeners
    setupEventListeners();
  }

  /**
   * Update the dashboard statistics
   */
  function updateDashboardStats() {
    document.getElementById('active-campaigns').textContent = stats.activeCampaigns;
    document.getElementById('emails-sent').textContent = stats.emailsSent;
    document.getElementById('open-rate').textContent = stats.openRate + '%';
    document.getElementById('click-rate').textContent = stats.clickRate + '%';
  }

  /**
   * Setup tab navigation
   */
  function setupTabNavigation() {
    const tabButtons = [
      document.getElementById('campaigns-tab'),
      document.getElementById('templates-tab'),
      document.getElementById('automation-tab'),
      document.getElementById('segments-tab')
    ];

    const tabContents = [
      document.getElementById('campaigns-content'),
      document.getElementById('templates-content'),
      document.getElementById('automation-content'),
      document.getElementById('segments-content')
    ];

    // Hide all tab contents except the first one
    tabContents.forEach((content, index) => {
      if (index !== 0) {
        content.classList.add('hidden');
      }
    });

    // Add click handlers to tab buttons
    tabButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
        // Update active tab button
        tabButtons.forEach(btn => {
          btn.classList.remove('border-indigo-500', 'text-indigo-600');
          btn.classList.add('border-transparent', 'text-gray-500');
        });
        button.classList.remove('border-transparent', 'text-gray-500');
        button.classList.add('border-indigo-500', 'text-indigo-600');

        // Show the selected tab content, hide others
        tabContents.forEach((content, i) => {
          if (i === index) {
            content.classList.remove('hidden');
            // Load content for the tab
            switch (i) {
              case 0:
                loadCampaigns();
                break;
              case 1:
                loadTemplates();
                break;
              case 2:
                loadAutomations();
                break;
              case 3:
                loadSegments();
                break;
            }
          } else {
            content.classList.add('hidden');
          }
        });
      });
    });
  }

  /**
   * Setup event listeners for UI interactions
   */
  function setupEventListeners() {
    // Campaign creation
    const createCampaignBtn = document.getElementById('create-campaign-btn');
    if (createCampaignBtn) {
      createCampaignBtn.addEventListener('click', showCampaignModal);
    }

    // Template creation
    const createTemplateBtn = document.getElementById('create-template-btn');
    if (createTemplateBtn) {
      createTemplateBtn.addEventListener('click', showTemplateModal);
    }

    // Campaign modal events
    const closeCampaignModal = document.getElementById('close-campaign-modal');
    if (closeCampaignModal) {
      closeCampaignModal.addEventListener('click', () => {
        document.getElementById('campaign-modal').classList.add('hidden');
      });
    }

    const cancelCampaignBtn = document.getElementById('cancel-campaign-btn');
    if (cancelCampaignBtn) {
      cancelCampaignBtn.addEventListener('click', () => {
        document.getElementById('campaign-modal').classList.add('hidden');
      });
    }

    // Campaign form submission
    const campaignForm = document.getElementById('campaign-form');
    if (campaignForm) {
      campaignForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveCampaign();
      });
    }

    // Schedule type change
    const scheduleTypeSelect = document.getElementById('campaign-schedule-type');
    if (scheduleTypeSelect) {
      scheduleTypeSelect.addEventListener('change', function() {
        const scheduleOptions = document.getElementById('schedule-options');
        if (this.value === 'schedule') {
          scheduleOptions.classList.remove('hidden');
        } else {
          scheduleOptions.classList.add('hidden');
        }
      });
    }

    // Filters
    setupFilters();
  }

  /**
   * Setup filters for campaigns, templates, etc.
   */
  function setupFilters() {
    // Campaign filters
    const campaignSearch = document.getElementById('campaign-search');
    const campaignStatusFilter = document.getElementById('campaign-status-filter');
    const campaignTypeFilter = document.getElementById('campaign-type-filter');
    const campaignSort = document.getElementById('campaign-sort');

    const filterElements = [campaignSearch, campaignStatusFilter, campaignTypeFilter, campaignSort];

    filterElements.forEach(element => {
      if (element) {
        element.addEventListener('input', applyCampaignFilters);
        element.addEventListener('change', applyCampaignFilters);
      }
    });

    // Template filters
    const templateSearch = document.getElementById('template-search');
    const templateCategoryFilter = document.getElementById('template-category-filter');
    const templateSort = document.getElementById('template-sort');

    const templateFilterElements = [templateSearch, templateCategoryFilter, templateSort];

    templateFilterElements.forEach(element => {
      if (element) {
        element.addEventListener('input', applyTemplateFilters);
        element.addEventListener('change', applyTemplateFilters);
      }
    });
  }

  /**
   * Load and display campaigns
   */
  function loadCampaigns() {
    const tableBody = document.getElementById('campaigns-table-body');
    if (!tableBody) return;

    if (campaigns.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" class="px-6 py-4 text-center text-gray-500">
            No campaigns found. Click "Create Campaign" to get started.
          </td>
        </tr>
      `;
      return;
    }

    // Sort campaigns by date (newest first by default)
    const sortedCampaigns = [...campaigns].sort((a, b) => {
      // Default to creation date if sent is null
      const dateA = a.sent || a.created || '';
      const dateB = b.sent || b.created || '';
      return dateB.localeCompare(dateA);
    });

    // Create table rows
    let html = '';
    sortedCampaigns.forEach(campaign => {
      const template = templates.find(t => t.id === campaign.templateId) || { name: 'Unknown' };
      const segment = segments.find(s => s.id === campaign.segmentId) || { name: 'Unknown' };

      // Format date
      let dateText = 'Not sent';
      if (campaign.sent) {
        const sentDate = new Date(campaign.sent);
        dateText = sentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      } else if (campaign.scheduled) {
        const scheduledDate = new Date(campaign.scheduled);
        dateText = 'Scheduled: ' + scheduledDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      }

      // Status badge
      let statusBadge = '';
      switch (campaign.status) {
        case CAMPAIGN_STATUS.DRAFT:
          statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Draft</span>';
          break;
        case CAMPAIGN_STATUS.SCHEDULED:
          statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Scheduled</span>';
          break;
        case CAMPAIGN_STATUS.ACTIVE:
          statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>';
          break;
        case CAMPAIGN_STATUS.COMPLETED:
          statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Completed</span>';
          break;
        case CAMPAIGN_STATUS.PAUSED:
          statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Paused</span>';
          break;
      }

      // Type badge
      let typeBadge = '';
      switch (campaign.type) {
        case CAMPAIGN_TYPE.REGULAR:
          typeBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">Regular</span>';
          break;
        case CAMPAIGN_TYPE.AUTOMATED:
          typeBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">Automated</span>';
          break;
        case CAMPAIGN_TYPE.AB_TEST:
          typeBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">A/B Test</span>';
          break;
      }

      html += `
        <tr data-id="${campaign.id}" data-status="${campaign.status}" data-type="${campaign.type}">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900">${campaign.name}</div>
            <div class="text-sm text-gray-500">${campaign.subject}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            ${statusBadge}
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            ${typeBadge}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            ${campaign.recipients} <span class="text-xs text-gray-400">(${segment.name})</span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            ${campaign.stats.openRate}%
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            ${campaign.stats.clickRate}%
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            ${dateText}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button class="text-indigo-600 hover:text-indigo-900 mr-3 view-campaign" data-id="${campaign.id}">
              View
            </button>
            <button class="text-gray-600 hover:text-gray-900 mr-3 duplicate-campaign" data-id="${campaign.id}">
              Duplicate
            </button>
            <button class="text-red-600 hover:text-red-900 delete-campaign" data-id="${campaign.id}">
              Delete
            </button>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = html;

    // Add event listeners to action buttons
    const viewButtons = tableBody.querySelectorAll('.view-campaign');
    viewButtons.forEach(button => {
      button.addEventListener('click', function() {
        const campaignId = this.getAttribute('data-id');
        viewCampaign(campaignId);
      });
    });

    const duplicateButtons = tableBody.querySelectorAll('.duplicate-campaign');
    duplicateButtons.forEach(button => {
      button.addEventListener('click', function() {
        const campaignId = this.getAttribute('data-id');
        duplicateCampaign(campaignId);
      });
    });

    const deleteButtons = tableBody.querySelectorAll('.delete-campaign');
    deleteButtons.forEach(button => {
      button.addEventListener('click', function() {
        const campaignId = this.getAttribute('data-id');
        deleteCampaign(campaignId);
      });
    });
  }

  // Many more functions would go here to handle:
  // - loadTemplates()
  // - loadAutomations()
  // - loadSegments()
  // - showCampaignModal()
  // - saveCampaign()
  // - viewCampaign()
  // - duplicateCampaign()
  // - deleteCampaign()
  // - applyCampaignFilters()
  // - applyTemplateFilters()
  // - handleCustomerCreated()
  // - handleCustomerSegmentChanged()
  // - handleOrderCreated()
  // - handleOrderStatusChanged()
  // And more...

  // Public API
  return {
    init: init,

    // Campaign operations
    createCampaign: function(campaignData) {
      const campaign = {
        id: 'campaign_' + Date.now(),
        created: new Date().toISOString(),
        status: CAMPAIGN_STATUS.DRAFT,
        stats: {
          opened: 0,
          clicked: 0,
          openRate: 0,
          clickRate: 0,
          bounced: 0,
          unsubscribed: 0
        },
        ...campaignData
      };

      campaigns.push(campaign);
      stats.activeCampaigns = campaigns.filter(c => c.status === CAMPAIGN_STATUS.ACTIVE || c.status === CAMPAIGN_STATUS.SCHEDULED).length;
      saveData();
      loadCampaigns();
      updateDashboardStats();

      return campaign;
    },

    sendCampaign: function(campaignId) {
      const campaign = campaigns.find(c => c.id === campaignId);
      if (!campaign) return null;

      // In a real system, this would connect to an email sending service
      campaign.status = CAMPAIGN_STATUS.COMPLETED;
      campaign.sent = new Date().toISOString();

      // Update statistics
      stats.emailsSent += campaign.recipients;

      saveData();
      loadCampaigns();
      updateDashboardStats();

      // Trigger notification
      if (window.NotificationSystem) {
        window.NotificationSystem.createNotification({
          type: 'EMAIL_CAMPAIGN_SENT',
          title: 'Email Campaign Sent',
          message: `Campaign "${campaign.name}" was sent to ${campaign.recipients} recipients.`,
          sourceId: campaign.id,
          sourceType: 'email_campaign'
        });
      }

      return campaign;
    },

    // Template operations
    createTemplate: function(templateData) {
      const template = {
        id: 'template_' + Date.now(),
        created: new Date().toISOString(),
        lastUsed: null,
        usageCount: 0,
        ...templateData
      };

      templates.push(template);
      saveData();

      return template;
    },

    // Segment operations
    createSegment: function(segmentData) {
      const segment = {
        id: 'segment_' + Date.now(),
        lastUpdated: new Date().toISOString(),
        ...segmentData
      };

      segments.push(segment);
      saveData();

      return segment;
    },

    // Getter methods
    getCampaigns: function() {
      return [...campaigns];
    },

    getTemplates: function() {
      return [...templates];
    },

    getSegments: function() {
      return [...segments];
    },

    getAutomations: function() {
      return [...automations];
    },

    getStats: function() {
      return {...stats};
    }
  };
})();

// Make the module available globally
window.EmailMarketing = EmailMarketing;
