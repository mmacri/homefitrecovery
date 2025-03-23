/**
 * Email Personalization Engine
 * This module provides advanced personalization capabilities for email content.
 */

// Define the EmailPersonalization module
const EmailPersonalization = (function() {
  // Private variables
  const personalizedTags = new Map();
  const personalizedSections = new Map();
  let customerData = null;

  /**
   * Initialize the personalization engine
   * @param {Object} options - Configuration options
   */
  function init(options = {}) {
    // Register built-in personalization tags
    registerDefaultTags();

    // Load customer data if we have access to CRM
    if (window.CustomerManagement) {
      customerData = window.CustomerManagement.getCustomers();
    }

    console.log('Email Personalization Engine initialized');
  }

  /**
   * Register default personalization tags
   */
  function registerDefaultTags() {
    // Basic customer information
    registerTag('firstName', (customer) => customer.name?.split(' ')[0] || 'Valued Customer');
    registerTag('fullName', (customer) => customer.name || 'Valued Customer');
    registerTag('email', (customer) => customer.email || '');

    // Date-based tags
    registerTag('currentDate', () => new Date().toLocaleDateString());
    registerTag('currentMonth', () => new Date().toLocaleString('default', { month: 'long' }));
    registerTag('currentYear', () => new Date().getFullYear().toString());

    // Order-related tags (if we have OrderManagement access)
    if (window.OrderManagement) {
      registerTag('lastOrderDate', (customer) => {
        const orders = window.OrderManagement.getOrdersByCustomer(customer.id);
        if (orders && orders.length > 0) {
          const lastOrder = orders.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
          return new Date(lastOrder.date).toLocaleDateString();
        }
        return 'your last order';
      });

      registerTag('lastOrderAmount', (customer) => {
        const orders = window.OrderManagement.getOrdersByCustomer(customer.id);
        if (orders && orders.length > 0) {
          const lastOrder = orders.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
          return `$${lastOrder.total.toFixed(2)}`;
        }
        return 'your last purchase';
      });
    }
  }

  /**
   * Register a new personalization tag
   * @param {string} tagName - The tag name (without braces)
   * @param {Function} valueFunction - Function that returns the tag value given customer data
   */
  function registerTag(tagName, valueFunction) {
    personalizedTags.set(tagName, valueFunction);
  }

  /**
   * Register a conditional content section
   * @param {string} sectionName - The section name
   * @param {Function} conditionFunction - Function that returns true/false to show section
   */
  function registerSection(sectionName, conditionFunction) {
    personalizedSections.set(sectionName, conditionFunction);
  }

  /**
   * Process an email template with personalization for a specific customer
   * @param {string} template - The email template with personalization tags
   * @param {Object} customer - The customer data
   * @returns {string} - The personalized email content
   */
  function processTemplate(template, customer) {
    if (!template) return '';
    if (!customer) return template;

    let processedContent = template;

    // Replace all personalization tags
    personalizedTags.forEach((valueFunction, tagName) => {
      const tagRegex = new RegExp(`{{\\s*${tagName}\\s*}}`, 'g');
      try {
        const replacement = valueFunction(customer);
        processedContent = processedContent.replace(tagRegex, replacement);
      } catch (error) {
        console.error(`Error processing tag ${tagName}:`, error);
        processedContent = processedContent.replace(tagRegex, `[Error: ${tagName}]`);
      }
    });

    // Process conditional sections
    processedContent = processConditionalSections(processedContent, customer);

    return processedContent;
  }

  /**
   * Process conditional sections in the template
   * @param {string} template - The template content
   * @param {Object} customer - The customer data
   * @returns {string} - Processed template with conditional sections
   */
  function processConditionalSections(template, customer) {
    let processedContent = template;

    // Pattern: {{#if condition}}...content...{{/if}}
    const conditionalPattern = /{{#if\s+([^}]+)}}([\s\S]*?){{\/if}}/g;
    processedContent = processedContent.replace(conditionalPattern, (match, condition, content) => {
      try {
        // Check if this is a registered condition
        if (personalizedSections.has(condition)) {
          const conditionFunction = personalizedSections.get(condition);
          return conditionFunction(customer) ? content : '';
        }

        // Handle specific customer properties
        if (condition.includes('.')) {
          const parts = condition.split('.');
          let value = customer;
          for (const part of parts) {
            value = value?.[part];
          }
          return value ? content : '';
        }

        // Simple property check
        return customer[condition] ? content : '';
      } catch (error) {
        console.error(`Error processing conditional section ${condition}:`, error);
        return '';
      }
    });

    // Pattern: {{#each items}}...content with {{this}}...{{/each}}
    const loopPattern = /{{#each\s+([^}]+)}}([\s\S]*?){{\/each}}/g;
    processedContent = processedContent.replace(loopPattern, (match, itemsName, content) => {
      try {
        let items = [];

        // Check if this is a special items collection
        if (itemsName === 'orders' && window.OrderManagement) {
          items = window.OrderManagement.getOrdersByCustomer(customer.id) || [];
        } else if (itemsName === 'recentProducts') {
          // Get recently viewed or purchased products
          items = getRecentProducts(customer) || [];
        } else if (customer[itemsName] && Array.isArray(customer[itemsName])) {
          items = customer[itemsName];
        }

        if (!items.length) return '';

        let result = '';
        items.forEach(item => {
          let itemContent = content;
          // Replace {{this}} with the item
          if (typeof item === 'string' || typeof item === 'number') {
            itemContent = itemContent.replace(/{{this}}/g, item);
          } else if (typeof item === 'object') {
            // Replace {{this.property}} with item properties
            const propPattern = /{{this\.([^}]+)}}/g;
            itemContent = itemContent.replace(propPattern, (propMatch, propName) => {
              return item[propName] || '';
            });
          }
          result += itemContent;
        });

        return result;
      } catch (error) {
        console.error(`Error processing loop section ${itemsName}:`, error);
        return '';
      }
    });

    return processedContent;
  }

  /**
   * Get recently viewed or purchased products for a customer
   * @param {Object} customer - The customer data
   * @returns {Array} - List of recent products
   */
  function getRecentProducts(customer) {
    if (!customer || !window.OrderManagement) return [];

    const orders = window.OrderManagement.getOrdersByCustomer(customer.id) || [];
    if (!orders.length) return [];

    // Get products from recent orders
    const recentOrders = orders.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
    let products = [];

    recentOrders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          // Avoid duplicates
          if (!products.some(p => p.id === item.productId)) {
            products.push({
              id: item.productId,
              name: item.name,
              price: item.price,
              image: item.image
            });
          }
        });
      }
    });

    return products.slice(0, 5); // Return up to 5 products
  }

  /**
   * Generate personalized recommendations for a customer
   * @param {Object} customer - The customer data
   * @param {number} count - Number of recommendations to generate
   * @returns {Array} - List of recommended products
   */
  function generateRecommendations(customer, count = 3) {
    if (!customer || !window.ProductManager) return [];

    // Get all products
    const allProducts = window.ProductManager.getProducts() || [];
    if (!allProducts.length) return [];

    // Get customer purchase history
    const purchasedProductIds = new Set();
    if (window.OrderManagement) {
      const orders = window.OrderManagement.getOrdersByCustomer(customer.id) || [];
      orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            purchasedProductIds.add(item.productId);
          });
        }
      });
    }

    // Get products in the same categories as purchased products
    const purchasedCategories = new Set();
    allProducts.forEach(product => {
      if (purchasedProductIds.has(product.id) && product.category) {
        purchasedCategories.add(product.category);
      }
    });

    // Filter products in the same categories that haven't been purchased
    let recommendations = allProducts.filter(product =>
      !purchasedProductIds.has(product.id) &&
      product.category &&
      purchasedCategories.has(product.category)
    );

    // If we don't have enough recommendations, add some popular products
    if (recommendations.length < count) {
      const popularProducts = allProducts
        .filter(p => !purchasedProductIds.has(p.id) && !recommendations.some(r => r.id === p.id))
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, count - recommendations.length);

      recommendations = [...recommendations, ...popularProducts];
    }

    return recommendations.slice(0, count);
  }

  // Public API
  return {
    init: init,
    registerTag: registerTag,
    registerSection: registerSection,
    processTemplate: processTemplate,
    generateRecommendations: generateRecommendations
  };
})();

// Make the module available globally
window.EmailPersonalization = EmailPersonalization;
