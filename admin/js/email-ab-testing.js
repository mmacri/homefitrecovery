/**
 * Email A/B Testing - Advanced testing for email campaign optimization
 * This module provides tools for creating and analyzing A/B tests for email campaigns.
 */

// Define the EmailABTesting module
const EmailABTesting = (function() {
  // Private variables
  const AB_TESTS_KEY = 'recoveryEssentials_email_ab_tests';
  let abTests = [];
  let activeTests = new Map();

  /**
   * Initialize the A/B testing module
   */
  function init() {
    // Load existing tests
    loadTests();

    // Add event listeners for test evaluation
    setupEventListeners();

    console.log('Email A/B Testing initialized');
  }

  /**
   * Load tests from storage
   */
  function loadTests() {
    const storedTests = localStorage.getItem(AB_TESTS_KEY);
    if (storedTests) {
      abTests = JSON.parse(storedTests);
    } else {
      // Create demo test for demonstration
      createDemoTest();
      saveTests();
    }
  }

  /**
   * Save tests to storage
   */
  function saveTests() {
    localStorage.setItem(AB_TESTS_KEY, JSON.stringify(abTests));
  }

  /**
   * Create a demo A/B test for demonstration
   */
  function createDemoTest() {
    const demoTest = {
      id: 'abtest_' + Date.now(),
      name: 'Subject Line Effectiveness Test',
      status: 'completed',
      testType: 'subject',
      goal: 'open_rate',
      segmentId: 'segment_active_customers',
      sampleSize: 30, // percentage of segment to test
      variants: [
        {
          id: 'variant_1',
          name: 'Control',
          subject: 'Check out our new recovery products',
          content: null, // content is the same for both variants
          metrics: {
            sent: 500,
            delivered: 485,
            opened: 145,
            clicked: 68,
            converted: 12,
            openRate: 29.9,
            clickRate: 14.0,
            conversionRate: 2.5
          }
        },
        {
          id: 'variant_2',
          name: 'Question Format',
          subject: 'Looking for faster recovery after workouts?',
          content: null,
          metrics: {
            sent: 500,
            delivered: 490,
            opened: 182,
            clicked: 85,
            converted: 19,
            openRate: 37.1,
            clickRate: 17.3,
            conversionRate: 3.9
          }
        }
      ],
      winner: 'variant_2',
      winningMetric: 'openRate',
      improvement: 24.1, // percentage improvement
      confidence: 95.2, // statistical confidence
      startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
      endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      finalCampaignId: 'campaign_' + (Date.now() - 6 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
      lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
    };

    abTests.push(demoTest);
  }

  /**
   * Set up event listeners for test evaluation
   */
  function setupEventListeners() {
    // In a real implementation, these would listen for email opens, clicks, etc.
    // For demo purposes, we'll just log that the listeners were set up
    console.log('A/B test event listeners configured');

    // Connect to analytics system if available
    if (window.Analytics) {
      console.log('Connected to Analytics system for A/B test evaluation');
    }
  }

  /**
   * Create a new A/B test
   * @param {Object} testData - Data for the A/B test
   * @returns {Object} - The created test
   */
  function createTest(testData) {
    // Validate required fields
    if (!testData.name || !testData.testType || !testData.goal || !testData.variants || testData.variants.length < 2) {
      console.error('Invalid test data. Name, test type, goal, and at least 2 variants are required.');
      return null;
    }

    // Generate IDs for variants if not provided
    testData.variants.forEach((variant, index) => {
      if (!variant.id) {
        variant.id = `variant_${index + 1}_${Date.now()}`;
      }
    });

    // Create the test object
    const abTest = {
      id: 'abtest_' + Date.now(),
      name: testData.name,
      status: 'draft',
      testType: testData.testType,
      goal: testData.goal,
      segmentId: testData.segmentId || 'all_customers',
      sampleSize: testData.sampleSize || 20, // Default to 20% of segment
      variants: testData.variants,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    // Add the test to the collection
    abTests.push(abTest);
    saveTests();

    return abTest;
  }

  /**
   * Start an A/B test
   * @param {string} testId - The ID of the test to start
   * @returns {Object} - The updated test
   */
  function startTest(testId) {
    const test = abTests.find(t => t.id === testId);
    if (!test) {
      console.error(`Test with ID "${testId}" not found`);
      return null;
    }

    if (test.status !== 'draft') {
      console.error(`Test "${test.name}" is not in draft status and cannot be started`);
      return null;
    }

    // Check if we have the Email Marketing module to send the test
    if (!window.EmailMarketing) {
      console.error('EmailMarketing module is required to start an A/B test');
      return null;
    }

    // Set test status to running
    test.status = 'running';
    test.startDate = new Date().toISOString();
    test.lastUpdated = new Date().toISOString();

    // In a real implementation, this would create and send the variant campaigns
    // For demonstration, we'll simulate creating campaigns for each variant
    test.variants.forEach((variant, index) => {
      // Create a campaign for this variant
      variant.campaignId = `campaign_${test.id}_${variant.id}`;

      // Initialize metrics
      variant.metrics = {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        converted: 0,
        openRate: 0,
        clickRate: 0,
        conversionRate: 0
      };
    });

    saveTests();
    return test;
  }

  /**
   * Stop an active A/B test
   * @param {string} testId - The ID of the test to stop
   * @returns {Object} - The updated test
   */
  function stopTest(testId) {
    const test = abTests.find(t => t.id === testId);
    if (!test) {
      console.error(`Test with ID "${testId}" not found`);
      return null;
    }

    if (test.status !== 'running') {
      console.error(`Test "${test.name}" is not running and cannot be stopped`);
      return null;
    }

    // Set test status to stopped
    test.status = 'stopped';
    test.endDate = new Date().toISOString();
    test.lastUpdated = new Date().toISOString();

    saveTests();
    return test;
  }

  /**
   * Evaluate the results of an A/B test
   * @param {string} testId - The ID of the test to evaluate
   * @returns {Object} - The test results
   */
  function evaluateTest(testId) {
    const test = abTests.find(t => t.id === testId);
    if (!test) {
      console.error(`Test with ID "${testId}" not found`);
      return null;
    }

    if (test.status !== 'running' && test.status !== 'stopped') {
      console.error(`Test "${test.name}" is not running or stopped and cannot be evaluated`);
      return null;
    }

    // In a real implementation, this would fetch the latest metrics for each variant
    // For demonstration, we'll simulate results

    // Determine the goal metric
    let goalMetric;
    switch (test.goal) {
      case 'open_rate':
        goalMetric = 'openRate';
        break;
      case 'click_rate':
        goalMetric = 'clickRate';
        break;
      case 'conversion_rate':
        goalMetric = 'conversionRate';
        break;
      default:
        goalMetric = 'openRate';
    }

    // Find the variant with the best performance on the goal metric
    let bestVariant = null;
    let bestMetric = -1;

    test.variants.forEach(variant => {
      if (variant.metrics[goalMetric] > bestMetric) {
        bestMetric = variant.metrics[goalMetric];
        bestVariant = variant;
      }
    });

    if (bestVariant) {
      // Calculate improvement over the control variant (assumed to be the first variant)
      const controlMetric = test.variants[0].metrics[goalMetric];
      const improvement = controlMetric > 0 ?
        ((bestMetric - controlMetric) / controlMetric) * 100 : 0;

      // Set the winner
      test.winner = bestVariant.id;
      test.winningMetric = goalMetric;
      test.improvement = parseFloat(improvement.toFixed(1));

      // Simple confidence calculation (this would be more sophisticated in a real implementation)
      test.confidence = 95.0 + (Math.random() * 4.0); // 95-99% confidence for demo

      // Complete the test
      test.status = 'completed';
      test.endDate = new Date().toISOString();
      test.lastUpdated = new Date().toISOString();

      saveTests();
    }

    return test;
  }

  /**
   * Apply the winning variant to a full campaign
   * @param {string} testId - The ID of the completed test
   * @returns {Object} - The result with the final campaign
   */
  function applyWinner(testId) {
    const test = abTests.find(t => t.id === testId);
    if (!test) {
      console.error(`Test with ID "${testId}" not found`);
      return null;
    }

    if (test.status !== 'completed' || !test.winner) {
      console.error(`Test "${test.name}" is not completed or has no winner`);
      return null;
    }

    // Check if we have the Email Marketing module
    if (!window.EmailMarketing) {
      console.error('EmailMarketing module is required to apply the winner');
      return null;
    }

    // Find the winning variant
    const winner = test.variants.find(v => v.id === test.winner);
    if (!winner) {
      console.error(`Winning variant "${test.winner}" not found`);
      return null;
    }

    // In a real implementation, this would create a new campaign with the winning variant
    // For demonstration, we'll simulate creating a campaign
    const campaignId = 'campaign_' + Date.now();
    test.finalCampaignId = campaignId;
    test.lastUpdated = new Date().toISOString();

    saveTests();

    return {
      success: true,
      testId: test.id,
      campaignId: campaignId,
      variant: winner
    };
  }

  /**
   * Generate test variant ideas based on content analysis
   * @param {Object} emailData - The email content and metadata
   * @returns {Object} - Test variant suggestions
   */
  function generateTestIdeas(emailData) {
    // Check if we have the ML Recommendations module
    if (window.EmailMLRecommendations) {
      return window.EmailMLRecommendations.getABTestRecommendations(emailData);
    }

    // If ML module is not available, return basic test ideas
    return {
      subjectLineTests: [
        {
          name: 'Question Format',
          description: 'Test a question format against your original subject',
          examples: [
            'Looking for faster recovery after workouts?',
            'Want to improve your recovery time?',
            'Need better results from your recovery routine?'
          ]
        },
        {
          name: 'Urgency Format',
          description: 'Test creating a sense of urgency',
          examples: [
            'Last chance: Recovery essentials sale ends today',
            '24 hours only: Special recovery bundle',
            'Limited time offer on massage tools'
          ]
        },
        {
          name: 'Personalization',
          description: 'Test personalized subject lines',
          examples: [
            '[Name], here\'s your custom recovery plan',
            'Recovery products selected for [Name]',
            'Your personalized recovery recommendations'
          ]
        }
      ],
      contentTests: [
        {
          name: 'CTA Button Text',
          description: 'Test different call-to-action button text',
          examples: [
            'Shop Now',
            'Upgrade Your Recovery',
            'See Recovery Tools',
            'Get 20% Off Today'
          ]
        },
        {
          name: 'Content Length',
          description: 'Test short vs. detailed content',
          examples: [
            'Brief, concise content with direct messaging',
            'Detailed content with more product information and testimonials'
          ]
        },
        {
          name: 'Image Count',
          description: 'Test different numbers of images',
          examples: [
            'Single hero image with minimal text',
            'Multiple product images with descriptions'
          ]
        }
      ],
      timingTests: [
        {
          name: 'Send Time',
          description: 'Test different send times',
          examples: [
            'Morning (9-11 AM)',
            'Afternoon (1-3 PM)',
            'Evening (6-8 PM)'
          ]
        },
        {
          name: 'Day of Week',
          description: 'Test different days of the week',
          examples: [
            'Tuesday (typically high engagement)',
            'Thursday (good for weekend promotions)',
            'Sunday (often lower competition)'
          ]
        }
      ]
    };
  }

  /**
   * Get statistical significance information for a test
   * @param {Object} variantA - The first variant with metrics
   * @param {Object} variantB - The second variant with metrics
   * @param {string} metric - The metric to compare
   * @returns {Object} - Statistical significance information
   */
  function getStatisticalSignificance(variantA, variantB, metric) {
    // In a real implementation, this would perform actual statistical calculations
    // For demonstration, we'll return simulated results

    const metricA = variantA.metrics[metric];
    const metricB = variantB.metrics[metric];

    // Determine if there's a significant difference (simplified logic)
    const difference = metricB - metricA;
    const percentDifference = metricA > 0 ? (difference / metricA) * 100 : 0;

    // Simulate confidence based on sample size and difference
    let confidence = 0;
    if (Math.abs(percentDifference) < 5) {
      confidence = 70 + Math.random() * 15; // 70-85% for small differences
    } else if (Math.abs(percentDifference) < 15) {
      confidence = 85 + Math.random() * 10; // 85-95% for medium differences
    } else {
      confidence = 95 + Math.random() * 4.9; // 95-99.9% for large differences
    }

    return {
      difference: difference.toFixed(2),
      percentDifference: percentDifference.toFixed(1) + '%',
      confidence: confidence.toFixed(1) + '%',
      isSignificant: confidence >= 95,
      sampleSizeSufficient: true, // This would actually be calculated in a real implementation
      recommendation: confidence >= 95 ?
        'The difference is statistically significant. You can confidently choose the better variant.' :
        'The difference is not statistically significant yet. Consider running the test longer or with a larger sample size.'
    };
  }

  // Public API
  return {
    init: init,
    createTest: createTest,
    startTest: startTest,
    stopTest: stopTest,
    evaluateTest: evaluateTest,
    applyWinner: applyWinner,
    generateTestIdeas: generateTestIdeas,
    getStatisticalSignificance: getStatisticalSignificance,
    getTests: function() { return [...abTests]; },
    getTestById: function(id) { return abTests.find(t => t.id === id); }
  };
})();

// Make the module available globally
window.EmailABTesting = EmailABTesting;
