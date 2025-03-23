/**
 * Email and SMS Integration - Multi-channel messaging capabilities
 * This module provides SMS messaging capability that integrates with the email marketing system.
 */

// Define the EmailSMSIntegration module
const EmailSMSIntegration = (function() {
  // Private variables
  const SMS_TEMPLATES_KEY = 'recoveryEssentials_sms_templates';
  const SMS_CAMPAIGNS_KEY = 'recoveryEssentials_sms_campaigns';
  let smsTemplates = [];
  let smsCampaigns = [];
  let smsProviders = [
    {
      id: 'twilio',
      name: 'Twilio',
      isConfigured: false,
      config: {
        accountSid: '',
        authToken: '',
        fromNumber: ''
      }
    },
    {
      id: 'aws_sns',
      name: 'AWS SNS',
      isConfigured: false,
      config: {
        accessKeyId: '',
        secretAccessKey: '',
        region: 'us-east-1'
      }
    },
    {
      id: 'sendgrid',
      name: 'SendGrid',
      isConfigured: false,
      config: {
        apiKey: '',
        fromNumber: ''
      }
    }
  ];
  let activeProvider = null;
  let smsCredits = 1000; // Demo credits

  /**
   * Initialize the SMS integration module
   * @param {Object} options - Configuration options
   */
  function init(options = {}) {
    // Load saved data
    loadData();

    // Set the active provider if specified in options
    if (options.provider) {
      setActiveProvider(options.provider);
    }

    // Create demo templates if none exist
    if (smsTemplates.length === 0) {
      createDemoTemplates();
      saveData();
    }

    console.log('Email SMS Integration initialized');
  }

  /**
   * Load data from storage
   */
  function loadData() {
    const storedTemplates = localStorage.getItem(SMS_TEMPLATES_KEY);
    const storedCampaigns = localStorage.getItem(SMS_CAMPAIGNS_KEY);
    const storedProviders = localStorage.getItem('recoveryEssentials_sms_providers');
    const storedCredits = localStorage.getItem('recoveryEssentials_sms_credits');

    if (storedTemplates) smsTemplates = JSON.parse(storedTemplates);
    if (storedCampaigns) smsCampaigns = JSON.parse(storedCampaigns);
    if (storedProviders) smsProviders = JSON.parse(storedProviders);
    if (storedCredits) smsCredits = parseInt(storedCredits, 10);

    // Set active provider
    const activeProviderID = localStorage.getItem('recoveryEssentials_active_sms_provider');
    if (activeProviderID) {
      const provider = smsProviders.find(p => p.id === activeProviderID);
      if (provider && provider.isConfigured) {
        activeProvider = provider;
      }
    }
  }

  /**
   * Save data to storage
   */
  function saveData() {
    localStorage.setItem(SMS_TEMPLATES_KEY, JSON.stringify(smsTemplates));
    localStorage.setItem(SMS_CAMPAIGNS_KEY, JSON.stringify(smsCampaigns));
    localStorage.setItem('recoveryEssentials_sms_providers', JSON.stringify(smsProviders));
    localStorage.setItem('recoveryEssentials_sms_credits', smsCredits.toString());

    if (activeProvider) {
      localStorage.setItem('recoveryEssentials_active_sms_provider', activeProvider.id);
    }
  }

  /**
   * Create demo SMS templates
   */
  function createDemoTemplates() {
    smsTemplates = [
      {
        id: 'sms_template_' + Date.now() + '_1',
        name: 'Order Confirmation',
        content: 'Your order #{{orderNumber}} has been confirmed! Track your delivery at: {{trackingUrl}}',
        category: 'transactional',
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
      },
      {
        id: 'sms_template_' + Date.now() + '_2',
        name: 'Shipping Notification',
        content: 'Great news! Your order #{{orderNumber}} has shipped and will arrive on {{deliveryDate}}. Track it here: {{trackingUrl}}',
        category: 'transactional',
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
      },
      {
        id: 'sms_template_' + Date.now() + '_3',
        name: 'Abandoned Cart Reminder',
        content: 'Hey {{firstName}}! You left items in your cart. Complete your purchase now and get 10% off with code COMEBACK10. Shop now: {{cartUrl}}',
        category: 'promotional',
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
      },
      {
        id: 'sms_template_' + Date.now() + '_4',
        name: 'Flash Sale',
        content: '🔥 FLASH SALE! 24 hours only: 20% off all recovery products! Use code FLASH20 at checkout: {{saleUrl}}',
        category: 'promotional',
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
      },
      {
        id: 'sms_template_' + Date.now() + '_5',
        name: 'Feedback Request',
        content: 'Hi {{firstName}}, how did you like your recent purchase? Reply with a number 1-5 to let us know! 5=Loved it, 1=Not satisfied',
        category: 'engagement',
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
    ];

    // Create a demo SMS campaign
    smsCampaigns = [
      {
        id: 'sms_campaign_' + Date.now(),
        name: 'Flash Sale Announcement',
        templateId: smsTemplates[3].id,
        status: 'completed',
        segmentId: 'segment_all_customers',
        recipients: 250,
        sent: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        stats: {
          delivered: 243,
          failed: 7,
          clicked: 87,
          responses: 12,
          conversionRate: 8.2
        },
        created: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
        lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
      }
    ];
  }

  /**
   * Set the active SMS provider
   * @param {string} providerId - The ID of the provider to set as active
   * @returns {boolean} - Whether the provider was set successfully
   */
  function setActiveProvider(providerId) {
    const provider = smsProviders.find(p => p.id === providerId);
    if (!provider) {
      console.error(`SMS provider with ID "${providerId}" not found`);
      return false;
    }

    if (!provider.isConfigured) {
      console.error(`SMS provider "${provider.name}" is not configured`);
      return false;
    }

    activeProvider = provider;
    saveData();
    return true;
  }

  /**
   * Configure an SMS provider
   * @param {string} providerId - The ID of the provider to configure
   * @param {Object} config - The provider configuration
   * @returns {boolean} - Whether the provider was configured successfully
   */
  function configureProvider(providerId, config) {
    const providerIndex = smsProviders.findIndex(p => p.id === providerId);
    if (providerIndex === -1) {
      console.error(`SMS provider with ID "${providerId}" not found`);
      return false;
    }

    // Validate config (simplified validation)
    let isValid = false;

    switch (providerId) {
      case 'twilio':
        isValid = config.accountSid && config.authToken && config.fromNumber;
        break;
      case 'aws_sns':
        isValid = config.accessKeyId && config.secretAccessKey;
        break;
      case 'sendgrid':
        isValid = config.apiKey && config.fromNumber;
        break;
    }

    if (!isValid) {
      console.error('Invalid provider configuration');
      return false;
    }

    // Update provider config
    smsProviders[providerIndex].config = config;
    smsProviders[providerIndex].isConfigured = true;

    // If this is the first configured provider, set it as active
    if (!activeProvider) {
      activeProvider = smsProviders[providerIndex];
    }

    saveData();
    return true;
  }

  /**
   * Create a new SMS template
   * @param {Object} templateData - The template data
   * @returns {Object} - The created template
   */
  function createTemplate(templateData) {
    if (!templateData.name || !templateData.content) {
      console.error('Template name and content are required');
      return null;
    }

    const template = {
      id: 'sms_template_' + Date.now(),
      name: templateData.name,
      content: templateData.content,
      category: templateData.category || 'general',
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    smsTemplates.push(template);
    saveData();

    return template;
  }

  /**
   * Update an existing SMS template
   * @param {string} templateId - The ID of the template to update
   * @param {Object} templateData - The new template data
   * @returns {Object} - The updated template
   */
  function updateTemplate(templateId, templateData) {
    const templateIndex = smsTemplates.findIndex(t => t.id === templateId);
    if (templateIndex === -1) {
      console.error(`Template with ID "${templateId}" not found`);
      return null;
    }

    // Preserve created date and ID
    const created = smsTemplates[templateIndex].created;
    const id = smsTemplates[templateIndex].id;

    // Update the template
    smsTemplates[templateIndex] = {
      ...templateData,
      id,
      created,
      lastModified: new Date().toISOString()
    };

    saveData();

    return smsTemplates[templateIndex];
  }

  /**
   * Delete an SMS template
   * @param {string} templateId - The ID of the template to delete
   * @returns {boolean} - Whether the template was deleted successfully
   */
  function deleteTemplate(templateId) {
    const templateIndex = smsTemplates.findIndex(t => t.id === templateId);
    if (templateIndex === -1) {
      console.error(`Template with ID "${templateId}" not found`);
      return false;
    }

    // Remove the template
    smsTemplates.splice(templateIndex, 1);
    saveData();

    return true;
  }

  /**
   * Send an SMS message
   * @param {Object} messageData - The message data
   * @returns {Object} - The result of the send operation
   */
  function sendSMS(messageData) {
    // Validate the message data
    if (!messageData.to || !messageData.content) {
      return {
        success: false,
        error: 'Recipient and content are required'
      };
    }

    // Check if we have an active provider
    if (!activeProvider) {
      return {
        success: false,
        error: 'No active SMS provider configured'
      };
    }

    // Check if we have enough credits
    if (smsCredits <= 0) {
      return {
        success: false,
        error: 'Insufficient SMS credits'
      };
    }

    // In a real implementation, this would connect to the SMS provider's API
    // For demonstration, we'll simulate a successful send most of the time
    const isSuccess = Math.random() < 0.95; // 95% success rate

    if (isSuccess) {
      // Deduct credits
      smsCredits -= 1;
      saveData();

      // Generate a message ID
      const messageId = 'sms_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

      // Add notification if available
      if (window.NotificationSystem) {
        window.NotificationSystem.createNotification({
          type: 'SMS_SENT',
          title: 'SMS Sent Successfully',
          message: `SMS sent to ${messageData.to} (${messageData.content.substring(0, 30)}...)`,
          sourceId: messageId,
          sourceType: 'sms'
        });
      }

      return {
        success: true,
        messageId,
        statusCode: 200,
        providerResponse: {
          deliveryStatus: 'sent',
          timestamp: new Date().toISOString()
        }
      };
    } else {
      // Simulate a failure
      return {
        success: false,
        error: 'Failed to send SMS',
        statusCode: 500,
        providerResponse: {
          errorCode: 'DELIVERY_FAILURE',
          message: 'The message could not be delivered to the recipient'
        }
      };
    }
  }

  /**
   * Create and send an SMS campaign
   * @param {Object} campaignData - The campaign data
   * @returns {Object} - The campaign with send results
   */
  function createCampaign(campaignData) {
    // Validate campaign data
    if (!campaignData.name || !campaignData.templateId || !campaignData.segmentId) {
      return {
        success: false,
        error: 'Campaign name, template ID, and segment ID are required'
      };
    }

    // Find the template
    const template = smsTemplates.find(t => t.id === campaignData.templateId);
    if (!template) {
      return {
        success: false,
        error: `Template with ID "${campaignData.templateId}" not found`
      };
    }

    // In a real implementation, we would get the segment from the CRM
    // For demonstration, we'll use a fixed number of recipients
    const recipientCount = campaignData.recipientCount || 100;

    // Check if we have enough credits
    if (smsCredits < recipientCount) {
      return {
        success: false,
        error: `Insufficient SMS credits (have ${smsCredits}, need ${recipientCount})`
      };
    }

    // Create the campaign
    const campaign = {
      id: 'sms_campaign_' + Date.now(),
      name: campaignData.name,
      templateId: campaignData.templateId,
      status: 'pending',
      segmentId: campaignData.segmentId,
      recipients: recipientCount,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    // If scheduled, add scheduled date
    if (campaignData.scheduled) {
      campaign.scheduled = campaignData.scheduled;
      campaign.status = 'scheduled';
    }

    // Add to campaigns list
    smsCampaigns.push(campaign);
    saveData();

    // If not scheduled, send immediately
    if (!campaignData.scheduled) {
      return sendCampaign(campaign.id);
    }

    return {
      success: true,
      campaign
    };
  }

  /**
   * Send an SMS campaign
   * @param {string} campaignId - The ID of the campaign to send
   * @returns {Object} - The campaign with send results
   */
  function sendCampaign(campaignId) {
    const campaignIndex = smsCampaigns.findIndex(c => c.id === campaignId);
    if (campaignIndex === -1) {
      return {
        success: false,
        error: `Campaign with ID "${campaignId}" not found`
      };
    }

    const campaign = smsCampaigns[campaignIndex];

    // Check if the campaign is already sent
    if (campaign.status === 'completed') {
      return {
        success: false,
        error: 'Campaign has already been sent'
      };
    }

    // Check if we have enough credits
    if (smsCredits < campaign.recipients) {
      return {
        success: false,
        error: `Insufficient SMS credits (have ${smsCredits}, need ${campaign.recipients})`
      };
    }

    // In a real implementation, this would send SMS messages to all recipients
    // For demonstration, we'll simulate sending with some random statistics

    // Deduct credits
    smsCredits -= campaign.recipients;

    // Update campaign status
    campaign.status = 'completed';
    campaign.sent = new Date().toISOString();

    // Generate random stats for demonstration
    const delivered = Math.floor(campaign.recipients * (0.95 + Math.random() * 0.05)); // 95-100% delivery rate
    const failed = campaign.recipients - delivered;
    const clicked = Math.floor(delivered * (0.2 + Math.random() * 0.3)); // 20-50% click rate
    const responses = Math.floor(clicked * (0.1 + Math.random() * 0.2)); // 10-30% of clicks respond
    const conversionRate = parseFloat((responses / delivered * 100).toFixed(1));

    campaign.stats = {
      delivered,
      failed,
      clicked,
      responses,
      conversionRate
    };

    // Update the campaign
    smsCampaigns[campaignIndex] = campaign;
    saveData();

    // Add notification if available
    if (window.NotificationSystem) {
      window.NotificationSystem.createNotification({
        type: 'SMS_CAMPAIGN_COMPLETED',
        title: 'SMS Campaign Completed',
        message: `Campaign "${campaign.name}" sent to ${delivered} recipients with ${failed} failures`,
        sourceId: campaignId,
        sourceType: 'sms_campaign'
      });
    }

    return {
      success: true,
      campaign
    };
  }

  /**
   * Integrate an SMS with an email campaign
   * @param {string} emailCampaignId - The ID of the email campaign
   * @param {Object} smsData - The SMS data
   * @returns {Object} - The integration result
   */
  function integrateWithEmailCampaign(emailCampaignId, smsData) {
    // Validate email campaign ID
    if (!emailCampaignId) {
      return {
        success: false,
        error: 'Email campaign ID is required'
      };
    }

    // In a real implementation, we would validate that the email campaign exists
    // For demonstration, we'll assume it exists

    // Create an SMS template if not provided
    let templateId = smsData.templateId;
    if (!templateId) {
      // Create a new template based on the email campaign
      const templateData = {
        name: `${smsData.name || 'SMS for Email Campaign'} Template`,
        content: smsData.content || 'Follow up to our email: Check out our latest offers! {{url}}',
        category: 'follow_up'
      };

      const template = createTemplate(templateData);
      if (!template) {
        return {
          success: false,
          error: 'Failed to create SMS template'
        };
      }

      templateId = template.id;
    }

    // Create the SMS campaign
    const campaignData = {
      name: smsData.name || `SMS Follow-up for Email Campaign ${emailCampaignId}`,
      templateId,
      segmentId: smsData.segmentId || 'all_customers', // Default to all customers
      recipientCount: smsData.recipientCount || 100,
      scheduled: smsData.scheduled || null // Schedule or send immediately
    };

    // Link to the email campaign
    campaignData.linkedEmailCampaignId = emailCampaignId;
    campaignData.followUpDelay = smsData.followUpDelay || 86400000; // Default to 24 hours (in ms)

    // Create the campaign
    const result = createCampaign(campaignData);

    if (result.success) {
      // Add notification if available
      if (window.NotificationSystem) {
        window.NotificationSystem.createNotification({
          type: 'SMS_EMAIL_INTEGRATION',
          title: 'SMS Integrated with Email Campaign',
          message: `SMS campaign "${campaignData.name}" created as follow-up to email campaign`,
          sourceId: result.campaign.id,
          sourceType: 'sms_email_integration'
        });
      }
    }

    return result;
  }

  /**
   * Create a multi-channel campaign (email + SMS)
   * @param {Object} campaignData - The campaign data
   * @returns {Object} - The multi-channel campaign result
   */
  function createMultiChannelCampaign(campaignData) {
    // Validate campaign data
    if (!campaignData.name || !campaignData.emailTemplate || !campaignData.smsTemplate || !campaignData.segmentId) {
      return {
        success: false,
        error: 'Campaign name, email template, SMS template, and segment ID are required'
      };
    }

    // In a real implementation, we would validate templates and segment
    // For demonstration, we'll assume they exist

    // Create result object
    const result = {
      success: true,
      campaignId: 'multi_' + Date.now(),
      name: campaignData.name,
      components: []
    };

    // Create email campaign if EmailMarketing is available
    if (window.EmailMarketing) {
      const emailCampaign = window.EmailMarketing.createCampaign({
        name: `${campaignData.name} (Email)`,
        subject: campaignData.emailSubject || 'New message from Recovery Essentials',
        templateId: campaignData.emailTemplate,
        segmentId: campaignData.segmentId,
        status: 'draft',
        scheduled: campaignData.scheduled || null
      });

      if (emailCampaign) {
        result.components.push({
          type: 'email',
          id: emailCampaign.id,
          status: emailCampaign.status
        });
      }
    }

    // Create SMS campaign
    const smsCampaignData = {
      name: `${campaignData.name} (SMS)`,
      templateId: campaignData.smsTemplate,
      segmentId: campaignData.segmentId,
      recipientCount: campaignData.recipientCount || 100,
      scheduled: campaignData.scheduled || null
    };

    // If this is a follow-up campaign, schedule it to follow the email
    if (campaignData.smsAsFollowUp && result.components.length > 0) {
      const emailComponent = result.components.find(c => c.type === 'email');
      if (emailComponent) {
        // Schedule SMS to follow email by specified delay
        const followUpDelay = campaignData.followUpDelay || 86400000; // Default to 24 hours (in ms)

        if (campaignData.scheduled) {
          // Calculate follow-up time based on scheduled time
          const scheduledDate = new Date(campaignData.scheduled);
          smsCampaignData.scheduled = new Date(scheduledDate.getTime() + followUpDelay).toISOString();
        } else {
          // Schedule relative to now
          smsCampaignData.scheduled = new Date(Date.now() + followUpDelay).toISOString();
        }

        // Link to email campaign
        smsCampaignData.linkedEmailCampaignId = emailComponent.id;
      }
    }

    const smsResult = createCampaign(smsCampaignData);
    if (smsResult.success) {
      result.components.push({
        type: 'sms',
        id: smsResult.campaign.id,
        status: smsResult.campaign.status
      });
    }

    // Store multi-channel campaign metadata
    const multiChannelCampaign = {
      id: result.campaignId,
      name: result.name,
      components: result.components,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    // In a real implementation, we would store this in a database
    // For demonstration, we'll store it in localStorage
    const multiChannelCampaigns = JSON.parse(localStorage.getItem('recoveryEssentials_multi_channel_campaigns') || '[]');
    multiChannelCampaigns.push(multiChannelCampaign);
    localStorage.setItem('recoveryEssentials_multi_channel_campaigns', JSON.stringify(multiChannelCampaigns));

    return result;
  }

  // Public API
  return {
    init: init,
    getProviders: function() { return [...smsProviders]; },
    getActiveProvider: function() { return activeProvider; },
    setActiveProvider: setActiveProvider,
    configureProvider: configureProvider,
    getCredits: function() { return smsCredits; },
    addCredits: function(amount) {
      smsCredits += amount;
      saveData();
      return smsCredits;
    },

    // Template operations
    createTemplate: createTemplate,
    updateTemplate: updateTemplate,
    deleteTemplate: deleteTemplate,
    getTemplates: function() { return [...smsTemplates]; },
    getTemplateById: function(id) { return smsTemplates.find(t => t.id === id); },

    // Messaging operations
    sendSMS: sendSMS,
    createCampaign: createCampaign,
    sendCampaign: sendCampaign,
    getCampaigns: function() { return [...smsCampaigns]; },
    getCampaignById: function(id) { return smsCampaigns.find(c => c.id === id); },

    // Integration operations
    integrateWithEmailCampaign: integrateWithEmailCampaign,
    createMultiChannelCampaign: createMultiChannelCampaign
  };
})();

// Make the module available globally
window.EmailSMSIntegration = EmailSMSIntegration;
