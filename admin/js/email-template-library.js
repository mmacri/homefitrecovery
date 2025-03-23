/**
 * Email Template Library - Provides pre-designed templates for common email scenarios
 * This module manages a collection of ready-to-use email templates.
 */

// Define the EmailTemplateLibrary module
const EmailTemplateLibrary = (function() {
  // Private variables
  let templates = [];
  const templatePaths = {
    'welcome': 'email-templates/welcome-template.html',
    'promotion': 'email-templates/promotion-template.html',
    'abandoned-cart': 'email-templates/abandoned-cart-template.html'
  };

  /**
   * Initialize the template library
   */
  function init() {
    // Load the template metadata
    loadTemplateMetadata();
    console.log('Email Template Library initialized');
  }

  /**
   * Load template metadata
   */
  function loadTemplateMetadata() {
    templates = [
      {
        id: 'template_welcome',
        name: 'Welcome Email',
        description: 'Sent to new customers after registration',
        category: 'onboarding',
        path: templatePaths.welcome,
        thumbnail: 'img/templates/welcome-thumbnail.jpg',
        sampleVariables: {
          firstName: 'John',
          accountUrl: '#',
          shopUrl: '#',
          guideUrl: '#',
          blogUrl: '#',
          communityUrl: '#',
          preferencesUrl: '#',
          unsubscribeUrl: '#',
          privacyUrl: '#'
        }
      },
      {
        id: 'template_promotion',
        name: 'Flash Sale Promotion',
        description: 'Limited-time promotional offers',
        category: 'promotional',
        path: templatePaths.promotion,
        thumbnail: 'img/templates/promotion-thumbnail.jpg',
        sampleVariables: {
          firstName: 'Sarah',
          saleEndDate: '5/15/2025',
          saleEndTime: '11:59 PM EST',
          shopUrl: '#',
          originalPrice1: '199.99',
          salePrice1: '119.99',
          productUrl1: '#',
          originalPrice2: '89.99',
          salePrice2: '53.99',
          productUrl2: '#',
          originalPrice3: '299.99',
          salePrice3: '179.99',
          productUrl3: '#',
          promoCode: 'FLASH40',
          viewAllDealsUrl: '#',
          saleStartDate: '5/12/2025',
          preferencesUrl: '#',
          unsubscribeUrl: '#',
          privacyUrl: '#'
        }
      },
      {
        id: 'template_abandoned_cart',
        name: 'Abandoned Cart Recovery',
        description: 'Sent to customers who left items in their cart',
        category: 'transactional',
        path: templatePaths['abandoned-cart'],
        thumbnail: 'img/templates/cart-thumbnail.jpg',
        sampleVariables: {
          firstName: 'Michael',
          cartUrl: '#',
          itemCount: '3',
          cartItems: [
            {
              imageUrl: 'https://same-assets.com/product-massage-gun.jpg',
              title: 'Professional Percussion Massage Gun',
              variant: 'Black / 5 Speeds',
              price: '119.99'
            },
            {
              imageUrl: 'https://same-assets.com/product-roller.jpg',
              title: 'Premium Vibrating Foam Roller',
              variant: 'Blue / Standard',
              price: '53.99'
            }
          ],
          subtotal: '173.98',
          shipping: '0.00',
          discount: '17.40',
          total: '156.58',
          promoCode: 'COMEBACK10',
          hoursLeft: '23',
          minutesLeft: '59',
          secondsLeft: '59',
          relatedPrice1: '34.99',
          relatedPrice2: '29.99',
          preferencesUrl: '#',
          unsubscribeUrl: '#',
          privacyUrl: '#'
        }
      },
      {
        id: 'template_order_confirmation',
        name: 'Order Confirmation',
        description: 'Sent when a customer completes an order',
        category: 'transactional',
        path: '',
        thumbnail: 'img/templates/order-thumbnail.jpg'
      },
      {
        id: 'template_review_request',
        name: 'Product Review Request',
        description: 'Ask customers for reviews after purchase',
        category: 'engagement',
        path: '',
        thumbnail: 'img/templates/review-thumbnail.jpg'
      },
      {
        id: 'template_newsletter',
        name: 'Monthly Newsletter',
        description: 'Regular newsletter with tips and updates',
        category: 'content',
        path: '',
        thumbnail: 'img/templates/newsletter-thumbnail.jpg'
      }
    ];
  }

  /**
   * Get all templates
   * @returns {Array} - All templates
   */
  function getTemplates() {
    return [...templates];
  }

  /**
   * Get templates by category
   * @param {string} category - The template category
   * @returns {Array} - Templates in the category
   */
  function getTemplatesByCategory(category) {
    if (!category) return [...templates];
    return templates.filter(template => template.category === category);
  }

  /**
   * Get a template by ID
   * @param {string} id - The template ID
   * @returns {Object} - The template or null if not found
   */
  function getTemplateById(id) {
    return templates.find(template => template.id === id) || null;
  }

  /**
   * Load a template's HTML content
   * @param {string} templateId - The template ID to load
   * @returns {Promise<string>} - Promise resolving to the template HTML
   */
  async function loadTemplateContent(templateId) {
    const template = getTemplateById(templateId);
    if (!template || !template.path) {
      return Promise.reject(new Error('Template not found or has no path'));
    }

    try {
      const response = await fetch(template.path);
      if (!response.ok) {
        throw new Error('Failed to load template');
      }
      return await response.text();
    } catch (error) {
      console.error(`Error loading template ${templateId}:`, error);
      return Promise.reject(error);
    }
  }

  /**
   * Apply template variables to HTML content
   * @param {string} html - The template HTML
   * @param {Object} variables - The variables to apply
   * @returns {string} - The HTML with variables applied
   */
  function applyTemplateVariables(html, variables) {
    if (!html || !variables) return html;

    let result = html;

    // Handle simple variable replacements
    for (const [key, value] of Object.entries(variables)) {
      if (typeof value === 'string' || typeof value === 'number') {
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, value);
      }
    }

    // Handle loops with {{#each}} syntax
    // This is a simplified implementation
    const eachRegex = /{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g;
    result = result.replace(eachRegex, (match, arrayName, template) => {
      if (!variables[arrayName] || !Array.isArray(variables[arrayName])) {
        return '';
      }

      return variables[arrayName].map(item => {
        let itemTemplate = template;
        for (const [key, value] of Object.entries(item)) {
          const regex = new RegExp(`{{${key}}}`, 'g');
          itemTemplate = itemTemplate.replace(regex, value);
        }
        return itemTemplate;
      }).join('');
    });

    // Handle conditionals with {{#if}} syntax
    const ifRegex = /{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g;
    result = result.replace(ifRegex, (match, condition, content) => {
      return variables[condition] ? content : '';
    });

    return result;
  }

  /**
   * Get sample variables for a template
   * @param {string} templateId - The template ID
   * @returns {Object} - Sample variables or empty object
   */
  function getSampleVariables(templateId) {
    const template = getTemplateById(templateId);
    return template && template.sampleVariables ? { ...template.sampleVariables } : {};
  }

  /**
   * Create an email from a template
   * @param {string} templateId - The template ID
   * @param {Object} variables - The variables to apply
   * @returns {Promise<string>} - Promise resolving to the final HTML
   */
  async function createEmailFromTemplate(templateId, variables = {}) {
    try {
      const html = await loadTemplateContent(templateId);
      return applyTemplateVariables(html, variables);
    } catch (error) {
      console.error('Error creating email from template:', error);
      return Promise.reject(error);
    }
  }

  // Public API
  return {
    init: init,
    getTemplates: getTemplates,
    getTemplatesByCategory: getTemplatesByCategory,
    getTemplateById: getTemplateById,
    loadTemplateContent: loadTemplateContent,
    applyTemplateVariables: applyTemplateVariables,
    getSampleVariables: getSampleVariables,
    createEmailFromTemplate: createEmailFromTemplate
  };
})();

// Make the module available globally
window.EmailTemplateLibrary = EmailTemplateLibrary;
