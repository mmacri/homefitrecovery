/**
 * Email Sequence Templates - Predefined email sequences for different customer journeys
 * This module provides ready-to-use email sequence templates for common customer journeys.
 */

// Define the EmailSequenceTemplates module
const EmailSequenceTemplates = (function() {
  // Private variables
  const sequences = {
    // New Customer Onboarding Journey
    newCustomerOnboarding: {
      name: "New Customer Onboarding",
      description: "Welcome series for new customers to introduce them to Recovery Essentials",
      triggerEvent: "newCustomerCreated",
      emails: [
        {
          id: "welcome_email",
          name: "Welcome Email",
          subject: "Welcome to Recovery Essentials, {{firstName}}!",
          templateId: "template_welcome",
          delay: 0, // Send immediately
          description: "Initial welcome email with account details and getting started information"
        },
        {
          id: "product_recommendations",
          name: "Product Recommendations",
          subject: "Personalized Recovery Recommendations Just for You",
          templateId: "template_recommendations",
          delay: 3 * 24 * 60 * 60 * 1000, // 3 days after welcome
          description: "Personalized product recommendations based on customer preferences"
        },
        {
          id: "recovery_guide",
          name: "Recovery Guide",
          subject: "Your Complete Recovery Guide is Here",
          templateId: "template_guide",
          delay: 7 * 24 * 60 * 60 * 1000, // 7 days after welcome
          description: "Educational content about recovery techniques and best practices"
        },
        {
          id: "feedback_request",
          name: "Feedback Request",
          subject: "How's Your Recovery Journey Going?",
          templateId: "template_feedback",
          delay: 14 * 24 * 60 * 60 * 1000, // 14 days after welcome
          description: "Request for feedback about their experience so far"
        }
      ]
    },

    // Post-Purchase Journey
    postPurchaseFollowup: {
      name: "Post-Purchase Follow-up",
      description: "Follow-up sequence after a customer makes a purchase",
      triggerEvent: "orderCompleted",
      emails: [
        {
          id: "order_confirmation",
          name: "Order Confirmation",
          subject: "Your Recovery Essentials Order #{{orderNumber}} Confirmation",
          templateId: "template_order_confirmation",
          delay: 0, // Send immediately
          description: "Order confirmation with details and tracking information"
        },
        {
          id: "shipping_notification",
          name: "Shipping Notification",
          subject: "Your Order Has Shipped!",
          templateId: "template_shipping",
          delay: 1 * 24 * 60 * 60 * 1000, // 1 day after order (or when shipping event occurs)
          description: "Notification that the order has shipped with tracking details"
        },
        {
          id: "usage_tips",
          name: "Product Usage Tips",
          subject: "Get the Most Out of Your {{productName}}",
          templateId: "template_usage_tips",
          delay: 3 * 24 * 60 * 60 * 1000, // 3 days after order
          description: "Tips and best practices for using their purchased products"
        },
        {
          id: "review_request",
          name: "Review Request",
          subject: "How Are You Enjoying Your {{productName}}?",
          templateId: "template_review_request",
          delay: 10 * 24 * 60 * 60 * 1000, // 10 days after order
          description: "Request for a product review"
        },
        {
          id: "cross_sell",
          name: "Cross-Sell Recommendations",
          subject: "Products That Pair Perfectly With Your Recent Purchase",
          templateId: "template_cross_sell",
          delay: 14 * 24 * 60 * 60 * 1000, // 14 days after order
          description: "Recommendations for complementary products"
        }
      ]
    },

    // Cart Abandonment Journey
    cartAbandonment: {
      name: "Cart Abandonment Recovery",
      description: "Sequence to recover abandoned shopping carts",
      triggerEvent: "cartAbandoned",
      emails: [
        {
          id: "cart_reminder",
          name: "Cart Reminder",
          subject: "You Left Something Behind...",
          templateId: "template_abandoned_cart",
          delay: 1 * 60 * 60 * 1000, // 1 hour after abandonment
          description: "Gentle reminder about items left in cart"
        },
        {
          id: "cart_incentive",
          name: "Special Offer",
          subject: "10% Off to Complete Your Purchase",
          templateId: "template_cart_incentive",
          delay: 24 * 60 * 60 * 1000, // 24 hours after abandonment
          description: "Discount incentive to complete purchase",
          condition: {
            type: "cartStillAbandoned",
            value: true
          }
        },
        {
          id: "final_reminder",
          name: "Final Reminder",
          subject: "Last Chance: Your Cart Will Expire Soon",
          templateId: "template_cart_expiration",
          delay: 3 * 24 * 60 * 60 * 1000, // 3 days after abandonment
          description: "Final reminder that cart items may not remain reserved",
          condition: {
            type: "cartStillAbandoned",
            value: true
          }
        }
      ]
    },

    // Re-engagement Journey
    customerReengagement: {
      name: "Customer Re-engagement",
      description: "Re-engage customers who haven't purchased in a while",
      triggerEvent: "customerInactive",
      triggerCondition: {
        type: "daysSinceLastPurchase",
        value: 60 // Trigger for customers who haven't purchased in 60 days
      },
      emails: [
        {
          id: "we_miss_you",
          name: "We Miss You",
          subject: "We Miss You, {{firstName}}!",
          templateId: "template_miss_you",
          delay: 0,
          description: "Initial re-engagement email mentioning we haven't seen them in a while"
        },
        {
          id: "whats_new",
          name: "What's New",
          subject: "New Recovery Products You'll Love",
          templateId: "template_whats_new",
          delay: 7 * 24 * 60 * 60 * 1000, // 7 days after first email
          description: "Showcase new products and innovations since their last visit"
        },
        {
          id: "special_comeback_offer",
          name: "Special Comeback Offer",
          subject: "A Special Offer to Welcome You Back",
          templateId: "template_comeback",
          delay: 14 * 24 * 60 * 60 * 1000, // 14 days after first email
          description: "Special discount to incentivize a return purchase"
        },
        {
          id: "feedback_survey",
          name: "Feedback Survey",
          subject: "Help Us Serve You Better",
          templateId: "template_feedback_survey",
          delay: 21 * 24 * 60 * 60 * 1000, // 21 days after first email
          description: "Survey to understand why they haven't engaged recently"
        }
      ]
    },

    // Product Education Journey
    productEducation: {
      name: "Product Education Series",
      description: "Educational content about recovery techniques and products",
      triggerEvent: "subscribeToEducation",
      emails: [
        {
          id: "recovery_basics",
          name: "Recovery Basics",
          subject: "Recovery 101: The Essentials You Need to Know",
          templateId: "template_recovery_basics",
          delay: 0,
          description: "Introduction to recovery principles and importance"
        },
        {
          id: "muscle_recovery",
          name: "Muscle Recovery Guide",
          subject: "The Science Behind Muscle Recovery",
          templateId: "template_muscle_recovery",
          delay: 3 * 24 * 60 * 60 * 1000, // 3 days after first email
          description: "Detailed guide on muscle recovery science and techniques"
        },
        {
          id: "recovery_tools",
          name: "Recovery Tools Explained",
          subject: "Finding the Right Recovery Tools for Your Needs",
          templateId: "template_tools_guide",
          delay: 7 * 24 * 60 * 60 * 1000, // 7 days after first email
          description: "Overview of different recovery tools and their benefits"
        },
        {
          id: "nutrition_recovery",
          name: "Nutrition for Recovery",
          subject: "Fuel Your Recovery: Nutrition Tips",
          templateId: "template_nutrition",
          delay: 10 * 24 * 60 * 60 * 1000, // 10 days after first email
          description: "Nutritional guidance for optimal recovery"
        },
        {
          id: "recovery_routines",
          name: "Recovery Routines",
          subject: "Recovery Routines for Different Activity Levels",
          templateId: "template_routines",
          delay: 14 * 24 * 60 * 60 * 1000, // 14 days after first email
          description: "Sample recovery routines for different activity types and intensities"
        }
      ]
    },

    // VIP Customer Journey
    vipCustomer: {
      name: "VIP Customer Appreciation",
      description: "Special sequence for high-value customers",
      triggerEvent: "customerSegmentChanged",
      triggerCondition: {
        type: "customerSegment",
        value: "vip" // Trigger for customers in the VIP segment
      },
      emails: [
        {
          id: "vip_welcome",
          name: "VIP Welcome",
          subject: "Welcome to VIP Status, {{firstName}}!",
          templateId: "template_vip_welcome",
          delay: 0,
          description: "Welcome to VIP status with exclusive benefits"
        },
        {
          id: "vip_exclusive_offer",
          name: "Exclusive VIP Offer",
          subject: "An Exclusive Offer Just for Our VIPs",
          templateId: "template_vip_offer",
          delay: 7 * 24 * 60 * 60 * 1000, // 7 days after welcome
          description: "Special offer exclusive to VIP customers"
        },
        {
          id: "early_access",
          name: "Early Access",
          subject: "Early Access: Be the First to Try Our Newest Products",
          templateId: "template_early_access",
          delay: 30 * 24 * 60 * 60 * 1000, // 30 days after welcome
          description: "Early access to new product releases"
        },
        {
          id: "vip_anniversary",
          name: "VIP Anniversary",
          subject: "Celebrating One Year of Your VIP Status",
          templateId: "template_vip_anniversary",
          delay: 365 * 24 * 60 * 60 * 1000, // 1 year after becoming VIP
          description: "Anniversary celebration of VIP status with special gift"
        }
      ]
    }
  };

  /**
   * Get all available sequence templates
   * @returns {Object} - All sequence templates
   */
  function getAllSequences() {
    return {...sequences};
  }

  /**
   * Get a specific sequence template by ID
   * @param {string} id - The sequence ID
   * @returns {Object|null} - The sequence template or null if not found
   */
  function getSequenceById(id) {
    return sequences[id] || null;
  }

  /**
   * Get sequences by trigger event
   * @param {string} triggerEvent - The trigger event name
   * @returns {Array} - Array of sequences with the specified trigger
   */
  function getSequencesByTrigger(triggerEvent) {
    return Object.values(sequences).filter(sequence => sequence.triggerEvent === triggerEvent);
  }

  /**
   * Create a new sequence from a template
   * @param {string} templateId - The template ID
   * @param {Object} customization - Custom properties to override
   * @returns {Object} - New sequence object
   */
  function createSequenceFromTemplate(templateId, customization = {}) {
    const template = getSequenceById(templateId);

    if (!template) {
      throw new Error(`Sequence template not found: ${templateId}`);
    }

    // Create a deep copy of the template
    const newSequence = JSON.parse(JSON.stringify(template));

    // Apply customizations
    Object.keys(customization).forEach(key => {
      if (key === 'emails') {
        // Handle email customizations separately to preserve structure
        customization.emails.forEach((emailCustomization, index) => {
          if (index < newSequence.emails.length) {
            newSequence.emails[index] = {
              ...newSequence.emails[index],
              ...emailCustomization
            };
          }
        });
      } else {
        newSequence[key] = customization[key];
      }
    });

    // Generate a unique ID
    newSequence.id = `sequence_${Date.now()}`;
    newSequence.createdAt = new Date().toISOString();

    return newSequence;
  }

  // Public API
  return {
    getAllSequences: getAllSequences,
    getSequenceById: getSequenceById,
    getSequencesByTrigger: getSequencesByTrigger,
    createSequenceFromTemplate: createSequenceFromTemplate
  };
})();

// Make the module available globally
window.EmailSequenceTemplates = EmailSequenceTemplates;
