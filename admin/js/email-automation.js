/**
 * Email Automation - Advanced drip campaign and workflow automation
 * This module provides sophisticated email workflow automation capabilities.
 */

// Define the EmailAutomation module
const EmailAutomation = (function() {
  // Private variables
  const WORKFLOWS_KEY = 'recoveryEssentials_email_workflows';
  let workflows = [];
  let activeTimers = new Map();
  let isProcessing = false;

  /**
   * Initialize the automation module
   */
  function init() {
    // Load existing workflows
    loadWorkflows();

    // Start active workflows
    startActiveWorkflows();

    // Set up event listeners
    setupEventListeners();

    console.log('Email Automation initialized');
  }

  /**
   * Load workflows from storage
   */
  function loadWorkflows() {
    const storedWorkflows = localStorage.getItem(WORKFLOWS_KEY);
    if (storedWorkflows) {
      workflows = JSON.parse(storedWorkflows);
    } else {
      // Create demo workflows for testing
      createDemoWorkflows();
      saveWorkflows();
    }
  }

  /**
   * Save workflows to storage
   */
  function saveWorkflows() {
    localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(workflows));
  }

  /**
   * Create demo workflows for testing
   */
  function createDemoWorkflows() {
    const welcomeWorkflow = {
      id: 'workflow_' + Date.now() + '_1',
      name: 'Welcome Series',
      description: 'A series of welcome emails for new customers',
      trigger: {
        type: 'event',
        event: 'customerCreated',
        delay: 0 // immediate
      },
      isActive: true,
      steps: [
        {
          id: 'step_1',
          name: 'Welcome Email',
          type: 'email',
          delay: 0, // immediate
          templateId: 'template_welcome',
          subject: 'Welcome to Recovery Essentials!',
          condition: null // no condition, always send
        },
        {
          id: 'step_2',
          name: 'Product Recommendations',
          type: 'email',
          delay: 3 * 24 * 60 * 60 * 1000, // 3 days in milliseconds
          templateId: 'template_recommendations',
          subject: 'Products We Think You\'ll Love',
          condition: {
            type: 'openedPreviousEmail',
            value: true
          }
        },
        {
          id: 'step_3',
          name: 'Special Offer',
          type: 'email',
          delay: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
          templateId: 'template_special_offer',
          subject: '15% Off Your First Order!',
          condition: null // no condition, always send if previous steps proceeded
        }
      ],
      stats: {
        started: 0,
        completed: 0,
        conversions: 0
      },
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    const abandonedCartWorkflow = {
      id: 'workflow_' + Date.now() + '_2',
      name: 'Abandoned Cart Recovery',
      description: 'Follow-up emails for customers who left items in their cart',
      trigger: {
        type: 'event',
        event: 'cartAbandoned',
        delay: 1 * 60 * 60 * 1000 // 1 hour in milliseconds
      },
      isActive: true,
      steps: [
        {
          id: 'step_1',
          name: 'Cart Reminder',
          type: 'email',
          delay: 0, // immediate after trigger delay
          templateId: 'template_cart_reminder',
          subject: 'You Left Something Behind!',
          condition: null
        },
        {
          id: 'step_2',
          name: 'Limited Time Offer',
          type: 'email',
          delay: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
          templateId: 'template_cart_discount',
          subject: '10% Off to Complete Your Purchase',
          condition: {
            type: 'clickedPreviousEmail',
            value: false // Only send if they didn't click the previous email
          }
        },
        {
          id: 'step_3',
          name: 'Final Reminder',
          type: 'email',
          delay: 3 * 24 * 60 * 60 * 1000, // 3 days in milliseconds
          templateId: 'template_last_chance',
          subject: 'Last Chance: Your Cart Will Expire Soon',
          condition: {
            type: 'madeAPurchase',
            value: false // Only send if they haven't made a purchase
          }
        }
      ],
      stats: {
        started: 0,
        completed: 0,
        conversions: 0
      },
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    workflows = [welcomeWorkflow, abandonedCartWorkflow];
  }

  /**
   * Start active workflows to listen for triggers
   */
  function startActiveWorkflows() {
    workflows.forEach(workflow => {
      if (workflow.isActive) {
        activateWorkflow(workflow.id);
      }
    });
  }

  /**
   * Activate a workflow to listen for its trigger
   * @param {string} workflowId - The workflow ID to activate
   */
  function activateWorkflow(workflowId) {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    // Mark the workflow as active
    workflow.isActive = true;
    saveWorkflows();

    // Set up event listeners based on trigger type
    if (workflow.trigger.type === 'event') {
      // For event-based triggers (e.g., customer created, cart abandoned)
      const eventName = workflow.trigger.event;
      document.addEventListener(eventName, (e) => handleWorkflowTrigger(workflow.id, e));
    } else if (workflow.trigger.type === 'schedule') {
      // For schedule-based triggers (e.g., monthly newsletter)
      scheduleWorkflow(workflow);
    }
  }

  /**
   * Deactivate a workflow
   * @param {string} workflowId - The workflow ID to deactivate
   */
  function deactivateWorkflow(workflowId) {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    // Mark the workflow as inactive
    workflow.isActive = false;
    saveWorkflows();

    // Clear any active timers for this workflow
    clearWorkflowTimers(workflowId);
  }

  /**
   * Schedule a time-based workflow
   * @param {Object} workflow - The workflow to schedule
   */
  function scheduleWorkflow(workflow) {
    if (!workflow.trigger || workflow.trigger.type !== 'schedule') return;

    // Calculate next run time based on schedule
    const nextRunTime = calculateNextRunTime(workflow.trigger);

    // Schedule the workflow
    const timerId = setTimeout(() => {
      // Execute the workflow
      startWorkflowForTarget(workflow.id, { type: 'scheduled' });

      // Re-schedule for next run
      scheduleWorkflow(workflow);
    }, nextRunTime - Date.now());

    // Store the timer ID so we can cancel if needed
    const workflowTimers = activeTimers.get(workflow.id) || [];
    workflowTimers.push(timerId);
    activeTimers.set(workflow.id, workflowTimers);
  }

  /**
   * Calculate the next run time for a scheduled workflow
   * @param {Object} trigger - The workflow trigger configuration
   * @returns {number} - Timestamp for next run
   */
  function calculateNextRunTime(trigger) {
    const now = new Date();
    let nextRun = new Date();

    switch (trigger.frequency) {
      case 'daily':
        // Set to specified time next day
        nextRun.setDate(now.getDate() + 1);
        nextRun.setHours(trigger.hour || 9, trigger.minute || 0, 0, 0);
        break;
      case 'weekly':
        // Set to specified day of week
        const dayOffset = (trigger.dayOfWeek - now.getDay() + 7) % 7;
        nextRun.setDate(now.getDate() + (dayOffset === 0 ? 7 : dayOffset));
        nextRun.setHours(trigger.hour || 9, trigger.minute || 0, 0, 0);
        break;
      case 'monthly':
        // Set to specified day of month
        nextRun.setMonth(now.getMonth() + 1);
        nextRun.setDate(Math.min(trigger.dayOfMonth || 1, daysInMonth(nextRun.getMonth(), nextRun.getFullYear())));
        nextRun.setHours(trigger.hour || 9, trigger.minute || 0, 0, 0);
        break;
      default:
        // Default to tomorrow at 9 AM
        nextRun.setDate(now.getDate() + 1);
        nextRun.setHours(9, 0, 0, 0);
    }

    // If next run time is in the past (e.g., it's already past the time today),
    // adjust to the next occurrence
    if (nextRun <= now) {
      return calculateNextRunTime({
        ...trigger,
        startDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() // Add one day
      });
    }

    return nextRun.getTime();
  }

  /**
   * Get the number of days in a month
   * @param {number} month - Month (0-11)
   * @param {number} year - Full year
   * @returns {number} - Number of days in the month
   */
  function daysInMonth(month, year) {
    return new Date(year, month + 1, 0).getDate();
  }

  /**
   * Clear all timers for a workflow
   * @param {string} workflowId - The workflow ID
   */
  function clearWorkflowTimers(workflowId) {
    const timers = activeTimers.get(workflowId) || [];
    timers.forEach(timerId => clearTimeout(timerId));
    activeTimers.delete(workflowId);
  }

  /**
   * Set up event listeners for workflow triggers
   */
  function setupEventListeners() {
    // Connect to CRM system for customer events
    if (window.CustomerManagement) {
      console.log('Connected to CRM system for workflow triggers');
    }

    // Connect to Order Management system for order events
    if (window.OrderManagement) {
      console.log('Connected to Order Management system for workflow triggers');
    }
  }

  /**
   * Handle a workflow trigger event
   * @param {string} workflowId - The workflow ID
   * @param {Event} event - The trigger event
   */
  function handleWorkflowTrigger(workflowId, event) {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow || !workflow.isActive) return;

    const targetData = event.detail;
    if (!targetData) return;

    console.log(`Workflow "${workflow.name}" triggered for target:`, targetData);

    // Apply trigger delay if specified
    if (workflow.trigger.delay > 0) {
      const timerId = setTimeout(() => {
        startWorkflowForTarget(workflowId, targetData);
      }, workflow.trigger.delay);

      const workflowTimers = activeTimers.get(workflowId) || [];
      workflowTimers.push(timerId);
      activeTimers.set(workflowId, workflowTimers);
    } else {
      // Start workflow immediately
      startWorkflowForTarget(workflowId, targetData);
    }
  }

  /**
   * Start a workflow for a specific target (customer, order, etc.)
   * @param {string} workflowId - The workflow ID
   * @param {Object} targetData - Data about the target entity
   */
  function startWorkflowForTarget(workflowId, targetData) {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow || !workflow.isActive) return;

    // Create a workflow instance for this target
    const workflowInstance = {
      id: `instance_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      workflowId: workflowId,
      targetData: targetData,
      status: 'active',
      currentStepIndex: 0,
      stepResults: [],
      startedAt: new Date().toISOString()
    };

    // Store the workflow instance
    saveWorkflowInstance(workflowInstance);

    // Update workflow stats
    workflow.stats.started += 1;
    saveWorkflows();

    // Schedule the first step
    scheduleWorkflowStep(workflowInstance);
  }

  /**
   * Save a workflow instance to storage
   * @param {Object} instance - The workflow instance
   */
  function saveWorkflowInstance(instance) {
    const key = `workflow_instance_${instance.id}`;
    localStorage.setItem(key, JSON.stringify(instance));
  }

  /**
   * Schedule the next step in a workflow
   * @param {Object} instance - The workflow instance
   */
  function scheduleWorkflowStep(instance) {
    const workflow = workflows.find(w => w.id === instance.workflowId);
    if (!workflow || instance.status !== 'active') return;

    // Get the current step
    const step = workflow.steps[instance.currentStepIndex];
    if (!step) {
      // No more steps, mark workflow as completed
      completeWorkflowInstance(instance);
      return;
    }

    // Check if the step condition is met
    if (step.condition) {
      if (!evaluateStepCondition(step.condition, instance)) {
        // Condition not met, skip to next step
        instance.stepResults.push({
          stepId: step.id,
          status: 'skipped',
          reason: 'condition_not_met',
          timestamp: new Date().toISOString()
        });

        saveWorkflowInstance(instance);

        // Move to next step
        instance.currentStepIndex += 1;
        scheduleWorkflowStep(instance);
        return;
      }
    }

    // Schedule the step execution after the delay
    const timerId = setTimeout(() => {
      executeWorkflowStep(instance, step);
    }, step.delay);

    // Store the timer ID
    const workflowTimers = activeTimers.get(instance.workflowId) || [];
    workflowTimers.push(timerId);
    activeTimers.set(instance.workflowId, workflowTimers);
  }

  /**
   * Evaluate a step condition to determine if the step should run
   * @param {Object} condition - The condition to evaluate
   * @param {Object} instance - The workflow instance
   * @returns {boolean} - Whether the condition is met
   */
  function evaluateStepCondition(condition, instance) {
    if (!condition) return true;

    switch (condition.type) {
      case 'openedPreviousEmail':
        // Check if the previous email was opened
        if (instance.stepResults.length > 0) {
          const previousResult = instance.stepResults[instance.stepResults.length - 1];
          const wasOpened = previousResult.opened === true;
          return condition.value === wasOpened;
        }
        return false;

      case 'clickedPreviousEmail':
        // Check if the previous email was clicked
        if (instance.stepResults.length > 0) {
          const previousResult = instance.stepResults[instance.stepResults.length - 1];
          const wasClicked = previousResult.clicked === true;
          return condition.value === wasClicked;
        }
        return false;

      case 'madeAPurchase':
        // Check if the customer has made a purchase
        if (window.OrderManagement && instance.targetData.customerId) {
          const customerId = instance.targetData.customerId;
          const orders = window.OrderManagement.getOrdersByCustomer(customerId);
          const hasPurchase = orders && orders.length > 0;
          return condition.value === hasPurchase;
        }
        return false;

      case 'customerSegment':
        // Check if customer is in a specific segment
        if (window.CustomerManagement && instance.targetData.customerId) {
          const customerId = instance.targetData.customerId;
          const customer = window.CustomerManagement.getCustomerById(customerId);
          return customer && customer.segment === condition.value;
        }
        return false;

      default:
        return true;
    }
  }

  /**
   * Execute a workflow step
   * @param {Object} instance - The workflow instance
   * @param {Object} step - The workflow step to execute
   */
  function executeWorkflowStep(instance, step) {
    const workflow = workflows.find(w => w.id === instance.workflowId);
    if (!workflow || instance.status !== 'active') return;

    // Process the step based on its type
    switch (step.type) {
      case 'email':
        sendWorkflowEmail(instance, step);
        break;
      case 'tag':
        addCustomerTag(instance, step);
        break;
      case 'webhook':
        triggerWebhook(instance, step);
        break;
      default:
        console.error(`Unknown step type: ${step.type}`);

        // Record the result
        instance.stepResults.push({
          stepId: step.id,
          status: 'error',
          reason: 'unknown_step_type',
          timestamp: new Date().toISOString()
        });

        saveWorkflowInstance(instance);

        // Move to next step
        instance.currentStepIndex += 1;
        scheduleWorkflowStep(instance);
    }
  }

  /**
   * Send an email as part of a workflow
   * @param {Object} instance - The workflow instance
   * @param {Object} step - The workflow step
   */
  function sendWorkflowEmail(instance, step) {
    if (!window.EmailMarketing) {
      console.error('EmailMarketing module not available for sending workflow email');

      // Record the result
      instance.stepResults.push({
        stepId: step.id,
        status: 'error',
        reason: 'email_marketing_unavailable',
        timestamp: new Date().toISOString()
      });

      saveWorkflowInstance(instance);

      // Move to next step
      instance.currentStepIndex += 1;
      scheduleWorkflowStep(instance);
      return;
    }

    // Get the customer ID from the target data
    const customerId = instance.targetData.customerId;
    if (!customerId) {
      console.error('No customer ID found for workflow email');

      // Record the result
      instance.stepResults.push({
        stepId: step.id,
        status: 'error',
        reason: 'customer_id_missing',
        timestamp: new Date().toISOString()
      });

      saveWorkflowInstance(instance);

      // Move to next step
      instance.currentStepIndex += 1;
      scheduleWorkflowStep(instance);
      return;
    }

    // Get the customer data
    const customer = window.CustomerManagement.getCustomerById(customerId);
    if (!customer) {
      console.error(`Customer not found for ID: ${customerId}`);

      // Record the result
      instance.stepResults.push({
        stepId: step.id,
        status: 'error',
        reason: 'customer_not_found',
        timestamp: new Date().toISOString()
      });

      saveWorkflowInstance(instance);

      // Move to next step
      instance.currentStepIndex += 1;
      scheduleWorkflowStep(instance);
      return;
    }

    // Get the email template
    const template = window.EmailMarketing.getTemplateById(step.templateId);
    if (!template) {
      console.error(`Template not found for ID: ${step.templateId}`);

      // Record the result
      instance.stepResults.push({
        stepId: step.id,
        status: 'error',
        reason: 'template_not_found',
        timestamp: new Date().toISOString()
      });

      saveWorkflowInstance(instance);

      // Move to next step
      instance.currentStepIndex += 1;
      scheduleWorkflowStep(instance);
      return;
    }

    // Personalize the email content if PersonalizationEngine is available
    let emailContent = template.content;
    let emailSubject = step.subject || template.subject;

    if (window.EmailPersonalization) {
      emailContent = window.EmailPersonalization.processTemplate(emailContent, customer);
      emailSubject = window.EmailPersonalization.processTemplate(emailSubject, customer);
    }

    // Create a campaign for this workflow email
    const campaign = window.EmailMarketing.createCampaign({
      name: `${workflow.name} - ${step.name}`,
      subject: emailSubject,
      content: emailContent,
      type: 'automated',
      status: 'active',
      recipients: 1,
      segmentId: 'workflow-segment', // Special segment for workflow emails
      workflowId: workflow.id,
      workflowStepId: step.id
    });

    // Track the email send in a way that allows us to track opens and clicks
    const trackingId = `${instance.id}_${step.id}`;

    // Send the email with tracking
    window.EmailMarketing.sendEmail({
      campaignId: campaign.id,
      to: customer.email,
      subject: emailSubject,
      content: emailContent,
      trackingId: trackingId
    });

    // Record the result
    instance.stepResults.push({
      stepId: step.id,
      status: 'executed',
      campaignId: campaign.id,
      trackingId: trackingId,
      timestamp: new Date().toISOString()
    });

    saveWorkflowInstance(instance);

    // Move to next step
    instance.currentStepIndex += 1;
    scheduleWorkflowStep(instance);
  }

  /**
   * Add a tag to a customer as part of a workflow
   * @param {Object} instance - The workflow instance
   * @param {Object} step - The workflow step
   */
  function addCustomerTag(instance, step) {
    if (!window.CustomerManagement) {
      console.error('CustomerManagement module not available for adding customer tag');

      // Record the result
      instance.stepResults.push({
        stepId: step.id,
        status: 'error',
        reason: 'customer_management_unavailable',
        timestamp: new Date().toISOString()
      });

      saveWorkflowInstance(instance);

      // Move to next step
      instance.currentStepIndex += 1;
      scheduleWorkflowStep(instance);
      return;
    }

    // Get the customer ID from the target data
    const customerId = instance.targetData.customerId;
    if (!customerId) {
      console.error('No customer ID found for adding tag');

      // Record the result
      instance.stepResults.push({
        stepId: step.id,
        status: 'error',
        reason: 'customer_id_missing',
        timestamp: new Date().toISOString()
      });

      saveWorkflowInstance(instance);

      // Move to next step
      instance.currentStepIndex += 1;
      scheduleWorkflowStep(instance);
      return;
    }

    // Add the tag to the customer
    window.CustomerManagement.addCustomerTag(customerId, step.tag);

    // Record the result
    instance.stepResults.push({
      stepId: step.id,
      status: 'executed',
      tag: step.tag,
      timestamp: new Date().toISOString()
    });

    saveWorkflowInstance(instance);

    // Move to next step
    instance.currentStepIndex += 1;
    scheduleWorkflowStep(instance);
  }

  /**
   * Trigger a webhook as part of a workflow
   * @param {Object} instance - The workflow instance
   * @param {Object} step - The workflow step
   */
  function triggerWebhook(instance, step) {
    // In a real implementation, this would make an HTTP request to the webhook URL
    console.log(`Triggering webhook for workflow ${instance.workflowId}, step ${step.id}`);

    // Record the result
    instance.stepResults.push({
      stepId: step.id,
      status: 'executed',
      webhookUrl: step.webhookUrl,
      timestamp: new Date().toISOString()
    });

    saveWorkflowInstance(instance);

    // Move to next step
    instance.currentStepIndex += 1;
    scheduleWorkflowStep(instance);
  }

  /**
   * Complete a workflow instance
   * @param {Object} instance - The workflow instance
   */
  function completeWorkflowInstance(instance) {
    // Mark the instance as completed
    instance.status = 'completed';
    instance.completedAt = new Date().toISOString();
    saveWorkflowInstance(instance);

    // Update workflow stats
    const workflow = workflows.find(w => w.id === instance.workflowId);
    if (workflow) {
      workflow.stats.completed += 1;

      // Check if this workflow resulted in a conversion
      const hasConversion = checkForConversion(instance);
      if (hasConversion) {
        workflow.stats.conversions += 1;
      }

      saveWorkflows();
    }

    console.log(`Workflow "${workflow.name}" completed for instance ${instance.id}`);
  }

  /**
   * Check if a workflow instance resulted in a conversion
   * @param {Object} instance - The workflow instance
   * @returns {boolean} - Whether a conversion occurred
   */
  function checkForConversion(instance) {
    // In a real implementation, this would check various conversion criteria
    // such as purchases, registrations, etc.
    // For now, we'll just return a random result for demonstration
    return Math.random() < 0.3; // 30% conversion rate for demo
  }

  /**
   * Create a new workflow
   * @param {Object} workflowData - The workflow data
   * @returns {Object} - The created workflow
   */
  function createWorkflow(workflowData) {
    const workflow = {
      id: 'workflow_' + Date.now(),
      name: workflowData.name,
      description: workflowData.description,
      trigger: workflowData.trigger,
      isActive: false, // Start inactive by default
      steps: workflowData.steps || [],
      stats: {
        started: 0,
        completed: 0,
        conversions: 0
      },
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    workflows.push(workflow);
    saveWorkflows();

    return workflow;
  }

  /**
   * Update an existing workflow
   * @param {string} workflowId - The workflow ID
   * @param {Object} workflowData - The new workflow data
   * @returns {Object} - The updated workflow
   */
  function updateWorkflow(workflowId, workflowData) {
    const index = workflows.findIndex(w => w.id === workflowId);
    if (index === -1) return null;

    // Preserve stats and creation date
    const stats = workflows[index].stats;
    const createdAt = workflows[index].createdAt;

    // Check if activation status changed
    const wasActive = workflows[index].isActive;
    const willBeActive = workflowData.isActive;

    // Update the workflow
    workflows[index] = {
      ...workflowData,
      id: workflowId, // Ensure ID doesn't change
      stats: stats,
      createdAt: createdAt,
      lastUpdated: new Date().toISOString()
    };

    saveWorkflows();

    // Handle activation/deactivation if changed
    if (wasActive && !willBeActive) {
      deactivateWorkflow(workflowId);
    } else if (!wasActive && willBeActive) {
      activateWorkflow(workflowId);
    }

    return workflows[index];
  }

  /**
   * Delete a workflow
   * @param {string} workflowId - The workflow ID to delete
   * @returns {boolean} - Whether the deletion was successful
   */
  function deleteWorkflow(workflowId) {
    const index = workflows.findIndex(w => w.id === workflowId);
    if (index === -1) return false;

    // Deactivate the workflow first
    deactivateWorkflow(workflowId);

    // Remove the workflow
    workflows.splice(index, 1);
    saveWorkflows();

    return true;
  }

  // Public API
  return {
    init: init,
    createWorkflow: createWorkflow,
    updateWorkflow: updateWorkflow,
    deleteWorkflow: deleteWorkflow,
    activateWorkflow: activateWorkflow,
    deactivateWorkflow: deactivateWorkflow,
    getWorkflows: function() { return [...workflows]; },
    getWorkflowById: function(id) { return workflows.find(w => w.id === id); }
  };
})();

// Make the module available globally
window.EmailAutomation = EmailAutomation;
