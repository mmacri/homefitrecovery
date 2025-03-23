/**
 * Email ML Recommendations - Machine learning based recommendations for email content
 * This module provides AI-powered suggestions to optimize email content and campaigns.
 */

// Define the EmailMLRecommendations module
const EmailMLRecommendations = (function() {
  // Private variables
  let modelLoaded = false;
  let cachedRecommendations = {};
  let cachedSubjectLines = [];
  let cachedImprovedContent = {};
  let userPreferences = {
    industryType: 'health_fitness',
    contentStyle: 'professional',
    goalPriority: 'conversion' // Options: conversion, engagement, retention
  };

  /**
   * Initialize the ML recommendations engine
   * @param {Object} options - Configuration options
   */
  function init(options = {}) {
    // Set user preferences if provided
    if (options.preferences) {
      userPreferences = { ...userPreferences, ...options.preferences };
    }

    // Load pre-trained model data (this would connect to an actual ML model in production)
    loadModel();

    // Pre-cache some common recommendations
    generateCommonRecommendations();

    console.log('Email ML Recommendations initialized');
  }

  /**
   * Load the recommendation model
   */
  function loadModel() {
    // In a real implementation, this would load a machine learning model
    // For this demo, we'll simulate loading model data
    setTimeout(() => {
      modelLoaded = true;
      console.log('ML model loaded successfully');
    }, 1000);
  }

  /**
   * Generate common recommendations to pre-cache
   */
  function generateCommonRecommendations() {
    // Subject line suggestions
    cachedSubjectLines = [
      {
        type: 'question',
        examples: [
          'Looking for faster recovery after workouts?',
          'Ready to take your recovery to the next level?',
          'Have you tried these recovery techniques yet?',
          'Tired of slow post-workout recovery?',
          'Need better recovery tools for your fitness routine?'
        ],
        performance: {
          openRate: 28.5,
          confidence: 0.92
        }
      },
      {
        type: 'urgency',
        examples: [
          'Last day: 20% off all recovery essentials',
          'Ending soon: Special recovery bundle offer',
          'Limited time offer on massage guns',
          'Only 24 hours left: Recovery essentials sale',
          'Flash sale: Recovery tools at lowest prices of the season'
        ],
        performance: {
          openRate: 26.8,
          confidence: 0.89
        }
      },
      {
        type: 'personalized',
        examples: [
          '[FirstName], here\'s how to improve your recovery',
          'Your personalized recovery plan is ready',
          'Custom recovery recommendations for [FirstName]',
          'We picked these recovery products for you',
          'Your recovery routine could use these tools'
        ],
        performance: {
          openRate: 31.2,
          confidence: 0.94
        }
      },
      {
        type: 'curiosity',
        examples: [
          'The recovery secret pro athletes use',
          'This recovery tool changes everything',
          'The surprising truth about muscle recovery',
          'You\'ve been recovering wrong all along',
          '3 recovery mistakes you\'re probably making'
        ],
        performance: {
          openRate: 29.7,
          confidence: 0.91
        }
      },
      {
        type: 'value_proposition',
        examples: [
          'Recover twice as fast with these techniques',
          'Science-backed recovery tools for better results',
          'Enhance your recovery in 10 minutes a day',
          'Professional recovery methods now available for everyone',
          'Better recovery, better performance: Here\'s how'
        ],
        performance: {
          openRate: 27.9,
          confidence: 0.87
        }
      }
    ];

    // Content improvement suggestions
    cachedImprovedContent = {
      // Improvement suggestions for intro paragraphs
      'intro': [
        {
          original: 'We are excited to announce our new products.',
          improved: 'We're thrilled to introduce our revolutionary new recovery tools designed specifically for your post-workout needs.',
          reasoning: 'More specific, emotional, and benefit-focused'
        },
        {
          original: 'Here are some products you might like.',
          improved: 'Based on your recent interest in massage therapy, we've handpicked these premium recovery tools we think you'll love.',
          reasoning: 'Adds personalization and reasoning for the recommendations'
        },
        {
          original: 'Check out our sale items this week.',
          improved: 'For the next 48 hours only, save up to 30% on our most popular recovery essentials that help you bounce back faster.',
          reasoning: 'Adds urgency, specific discount, and benefit'
        }
      ],

      // Improvement suggestions for call-to-action
      'cta': [
        {
          original: 'Click here',
          improved: 'Upgrade Your Recovery Routine',
          reasoning: 'Specific benefit-focused button text performs better than generic commands'
        },
        {
          original: 'Buy now',
          improved: 'Get 20% Off Today',
          reasoning: 'Includes the specific value proposition in the CTA'
        },
        {
          original: 'Learn more',
          improved: 'See How It Works',
          reasoning: 'More specific about what the user will discover'
        },
        {
          original: 'Shop',
          improved: 'Find Your Perfect Recovery Tool',
          reasoning: 'Personalized and goal-oriented CTA'
        }
      ],

      // Improvement suggestions for product descriptions
      'product': [
        {
          original: 'This massage gun is powerful and effective.',
          improved: 'With 5 adjustable speed settings and whisper-quiet operation, this professional-grade massage gun targets deep tissue to reduce recovery time by up to 30%.',
          reasoning: 'Adds specific features and quantifiable benefits'
        },
        {
          original: 'Our foam roller helps with muscle recovery.',
          improved: 'Designed with high-density foam and precision-molded texture points, this durable foam roller releases muscle knots and enhances blood flow for faster post-workout recovery.',
          reasoning: 'Adds specific product details and explains the mechanism of benefit'
        }
      ]
    };

    // Email structure recommendations
    cachedRecommendations.emailStructure = [
      {
        recommendation: 'Use a single-column layout for better mobile responsiveness',
        reasoning: 'Multiple columns often break on mobile devices, leading to 23% lower click-through rates',
        confidence: 0.95
      },
      {
        recommendation: 'Place your primary CTA above the fold',
        reasoning: 'CTAs above the fold receive 41% more clicks than those placed lower in the email',
        confidence: 0.89
      },
      {
        recommendation: 'Keep subject lines between 4-7 words',
        reasoning: 'Analysis shows optimal open rates for subject lines in this length range',
        confidence: 0.87
      },
      {
        recommendation: 'Use a descriptive sender name that includes both brand and person',
        reasoning: 'E.g., "Sarah from Recovery Essentials" performs 31% better than just "Recovery Essentials"',
        confidence: 0.92
      },
      {
        recommendation: 'Use no more than 2-3 images in the email body',
        reasoning: 'Emails with 2-3 images have the highest click rates, while too many images can trigger spam filters',
        confidence: 0.85
      }
    ];

    // Best send time recommendations
    cachedRecommendations.sendTime = [
      {
        dayOfWeek: 'Tuesday',
        timeRange: '10:00 AM - 11:00 AM',
        openRateImprovement: '17%',
        confidence: 0.88
      },
      {
        dayOfWeek: 'Thursday',
        timeRange: '1:00 PM - 3:00 PM',
        openRateImprovement: '14%',
        confidence: 0.86
      },
      {
        dayOfWeek: 'Wednesday',
        timeRange: '6:00 PM - 8:00 PM',
        openRateImprovement: '11%',
        confidence: 0.83
      }
    ];
  }

  /**
   * Get subject line recommendations
   * @param {string} industry - The industry context
   * @param {string} goal - The email goal (conversion, engagement, etc.)
   * @returns {Array} - Subject line recommendations
   */
  function getSubjectLineRecommendations(industry = userPreferences.industryType, goal = userPreferences.goalPriority) {
    if (!modelLoaded) {
      console.warn('ML model not fully loaded, returning cached recommendations');
      return cachedSubjectLines;
    }

    // In a real implementation, this would use the model to generate recommendations
    // based on the industry and goal, and perhaps previous campaign performance

    // Filter the cached recommendations based on goal
    let recommendations = [...cachedSubjectLines];

    // For demonstration, prioritize different types based on goal
    if (goal === 'conversion') {
      // Prioritize urgency and value proposition for conversion
      recommendations = recommendations.sort((a, b) => {
        if (a.type === 'urgency' || a.type === 'value_proposition') return -1;
        if (b.type === 'urgency' || b.type === 'value_proposition') return 1;
        return b.performance.openRate - a.performance.openRate;
      });
    } else if (goal === 'engagement') {
      // Prioritize questions and curiosity for engagement
      recommendations = recommendations.sort((a, b) => {
        if (a.type === 'question' || a.type === 'curiosity') return -1;
        if (b.type === 'question' || b.type === 'curiosity') return 1;
        return b.performance.openRate - a.performance.openRate;
      });
    } else if (goal === 'retention') {
      // Prioritize personalized for retention
      recommendations = recommendations.sort((a, b) => {
        if (a.type === 'personalized') return -1;
        if (b.type === 'personalized') return 1;
        return b.performance.openRate - a.performance.openRate;
      });
    }

    return recommendations;
  }

  /**
   * Get content improvement recommendations
   * @param {string} contentType - The type of content to improve (intro, cta, product)
   * @param {string} originalContent - The original content to improve
   * @returns {Object} - Content improvement recommendation
   */
  function getContentImprovementRecommendation(contentType, originalContent) {
    if (!modelLoaded) {
      console.warn('ML model not fully loaded, returning cached recommendations');

      // Return a cached improvement if it matches the original content
      const improvements = cachedImprovedContent[contentType] || [];
      const match = improvements.find(item => item.original === originalContent);

      if (match) {
        return match;
      } else if (improvements.length > 0) {
        // Return a random improvement from the cache
        return improvements[Math.floor(Math.random() * improvements.length)];
      } else {
        return {
          original: originalContent,
          improved: originalContent,
          reasoning: 'No specific improvements available for this content'
        };
      }
    }

    // In a real implementation, this would use NLP to analyze the content and suggest improvements

    // For now, return a simulated improvement
    let improvement;

    switch (contentType) {
      case 'intro':
        // Add personalization and benefits
        improvement = {
          original: originalContent,
          improved: originalContent
            .replace(/we are/i, "we're")
            .replace(/our products/i, "our specialized recovery tools")
            .replace(/check out/i, "discover")
            .replace(/new items/i, "new professional-grade recovery essentials"),
          reasoning: 'Added personalization, stronger verbs, and specific product value'
        };
        break;

      case 'cta':
        // Make CTA more specific and benefit-focused
        improvement = {
          original: originalContent,
          improved: originalContent
            .replace(/click here/i, "Enhance Your Recovery")
            .replace(/buy now/i, "Get Your Recovery Kit")
            .replace(/learn more/i, "See How It Works")
            .replace(/shop/i, "Find Your Perfect Match"),
          reasoning: 'Made CTA more specific to the value proposition and less generic'
        };
        break;

      case 'product':
        // Add features, benefits and social proof
        improvement = {
          original: originalContent,
          improved: originalContent + " Used by professional athletes, this recovery tool helps reduce recovery time and prevent injuries.",
          reasoning: 'Added social proof and specific benefits'
        };
        break;

      default:
        improvement = {
          original: originalContent,
          improved: originalContent,
          reasoning: 'No specific improvements for this content type'
        };
    }

    // If the improvement didn't change anything, provide a generic improvement
    if (improvement.original === improvement.improved) {
      improvement.improved = originalContent + " (This would be improved by our ML model in a real implementation)";
      improvement.reasoning = 'Generic improvement placeholder';
    }

    return improvement;
  }

  /**
   * Get email structure recommendations
   * @returns {Array} - Structure recommendations
   */
  function getEmailStructureRecommendations() {
    if (!modelLoaded) {
      console.warn('ML model not fully loaded, returning cached recommendations');
      return cachedRecommendations.emailStructure;
    }

    // In a real implementation, this would analyze previous campaigns and customer data
    // to provide personalized structure recommendations

    return cachedRecommendations.emailStructure;
  }

  /**
   * Get send time recommendations
   * @param {string} segment - The customer segment to target
   * @returns {Array} - Send time recommendations
   */
  function getSendTimeRecommendations(segment = 'all') {
    if (!modelLoaded) {
      console.warn('ML model not fully loaded, returning cached recommendations');
      return cachedRecommendations.sendTime;
    }

    // In a real implementation, this would analyze open rates by day and time
    // for the specified customer segment

    // For demonstration, return slightly different recommendations based on segment
    if (segment === 'new') {
      return [
        {
          dayOfWeek: 'Monday',
          timeRange: '9:00 AM - 11:00 AM',
          openRateImprovement: '21%',
          confidence: 0.89
        },
        ...cachedRecommendations.sendTime.slice(1)
      ];
    } else if (segment === 'vip') {
      return [
        {
          dayOfWeek: 'Sunday',
          timeRange: '10:00 AM - 12:00 PM',
          openRateImprovement: '19%',
          confidence: 0.91
        },
        ...cachedRecommendations.sendTime.slice(0, 2)
      ];
    }

    return cachedRecommendations.sendTime;
  }

  /**
   * Analyze email content to provide holistic recommendations
   * @param {Object} emailData - The email content and metadata to analyze
   * @returns {Object} - Comprehensive recommendations
   */
  function analyzeEmailContent(emailData) {
    if (!emailData) return null;

    // Extract data from the email
    const { subject, content, templateId, segment } = emailData;

    // Get all types of recommendations
    const subjectRecommendations = getSubjectLineRecommendations();
    const structureRecommendations = getEmailStructureRecommendations();
    const sendTimeRecommendations = getSendTimeRecommendations(segment);

    // Perform content analysis (in a real implementation, this would be much more sophisticated)
    const contentAnalysis = {
      readability: calculateReadabilityScore(content),
      sentiment: analyzeSentiment(content),
      wordCount: countWords(content),
      estimatedReadTime: Math.ceil(countWords(content) / 200) // ~200 words per minute reading speed
    };

    // Analyze the subject line
    const subjectAnalysis = {
      length: subject.split(' ').length,
      hasEmoji: /[\p{Emoji}]/u.test(subject),
      isQuestion: subject.endsWith('?'),
      hasNumber: /\d/.test(subject),
      sentiment: analyzeSentiment(subject)
    };

    // Generate holistic recommendations
    const recommendations = {
      subject: {
        analysis: subjectAnalysis,
        recommendations: subjectRecommendations.slice(0, 3).map(rec => rec.examples[0]),
        reasoning: 'Based on your audience and industry, these subject lines are likely to perform better'
      },
      content: {
        analysis: contentAnalysis,
        improvements: []
      },
      structure: structureRecommendations.slice(0, 3),
      sendTime: sendTimeRecommendations[0],
      overallScore: calculateOverallScore(subjectAnalysis, contentAnalysis)
    };

    // Add specific content improvement suggestions
    if (content.indexOf('<p>') !== -1) {
      const firstParagraph = content.substring(
        content.indexOf('<p>') + 3,
        content.indexOf('</p>')
      );

      recommendations.content.improvements.push(
        getContentImprovementRecommendation('intro', firstParagraph)
      );
    }

    if (content.indexOf('<button') !== -1 || content.indexOf('<a ') !== -1) {
      let ctaMatch = content.match(/<button[^>]*>(.*?)<\/button>/);
      if (!ctaMatch) {
        ctaMatch = content.match(/<a [^>]*>(.*?)<\/a>/);
      }

      if (ctaMatch && ctaMatch[1]) {
        recommendations.content.improvements.push(
          getContentImprovementRecommendation('cta', ctaMatch[1])
        );
      }
    }

    // Product description improvement
    if (content.indexOf('product') !== -1 || content.indexOf('item') !== -1) {
      const productMatch = content.match(/<p[^>]*>([^<]*(?:product|item)[^<]*)<\/p>/i);
      if (productMatch && productMatch[1]) {
        recommendations.content.improvements.push(
          getContentImprovementRecommendation('product', productMatch[1])
        );
      }
    }

    return recommendations;
  }

  /**
   * Calculate readability score for content
   * @param {string} content - The content to analyze
   * @returns {Object} - Readability metrics
   */
  function calculateReadabilityScore(content) {
    // Strip HTML tags
    const plainText = content.replace(/<[^>]*>/g, '');

    // Count sentences (simple approximation)
    const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = sentences.length;

    // Count words
    const wordCount = countWords(plainText);

    // Count syllables (very simple approximation)
    const syllableCount = countSyllables(plainText);

    // Calculate Flesch-Kincaid Grade Level (approximation)
    const fkGL = 0.39 * (wordCount / sentenceCount) + 11.8 * (syllableCount / wordCount) - 15.59;

    // Calculate Flesch Reading Ease
    const fkRE = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount);

    return {
      fleschKincaidGradeLevel: Math.round(fkGL * 10) / 10,
      fleschReadingEase: Math.round(fkRE * 10) / 10,
      averageSentenceLength: Math.round(wordCount / sentenceCount),
      totalWords: wordCount
    };
  }

  /**
   * Count words in text
   * @param {string} text - The text to analyze
   * @returns {number} - Word count
   */
  function countWords(text) {
    return text.trim().split(/\s+/).length;
  }

  /**
   * Count syllables in text (simplified approximation)
   * @param {string} text - The text to analyze
   * @returns {number} - Syllable count
   */
  function countSyllables(text) {
    // This is a very simplified syllable counter
    // In a real implementation, this would be much more accurate
    const words = text.toLowerCase().split(/\s+/);
    let count = 0;

    for (const word of words) {
      // Count vowel groups as syllables
      const syllables = word.match(/[aeiouy]{1,2}/g);
      if (syllables) {
        count += syllables.length;
      } else {
        // Even words without vowels have at least one syllable
        count += 1;
      }
    }

    return count;
  }

  /**
   * Analyze sentiment of text (very simple approximation)
   * @param {string} text - The text to analyze
   * @returns {Object} - Sentiment analysis
   */
  function analyzeSentiment(text) {
    // This is a very simplified sentiment analyzer
    // In a real implementation, this would use a proper NLP model

    // Simple positive and negative word lists
    const positiveWords = [
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'best', 'love',
      'benefit', 'perfect', 'easy', 'simple', 'effective', 'proven', 'guaranteed',
      'save', 'discount', 'free', 'new', 'improved', 'exclusive'
    ];

    const negativeWords = [
      'bad', 'worst', 'terrible', 'awful', 'poor', 'hate', 'difficult',
      'complicated', 'expensive', 'problem', 'issue', 'fail', 'sorry'
    ];

    const lowerText = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;

    for (const word of positiveWords) {
      if (lowerText.includes(word)) {
        positiveCount++;
      }
    }

    for (const word of negativeWords) {
      if (lowerText.includes(word)) {
        negativeCount++;
      }
    }

    const score = (positiveCount - negativeCount) / Math.max(1, positiveCount + negativeCount);

    let sentiment;
    if (score > 0.5) sentiment = 'very positive';
    else if (score > 0) sentiment = 'positive';
    else if (score === 0) sentiment = 'neutral';
    else if (score > -0.5) sentiment = 'negative';
    else sentiment = 'very negative';

    return {
      score: Math.round(score * 100) / 100,
      sentiment,
      positiveWords: positiveCount,
      negativeWords: negativeCount
    };
  }

  /**
   * Calculate overall email quality score
   * @param {Object} subjectAnalysis - Subject line analysis
   * @param {Object} contentAnalysis - Content analysis
   * @returns {number} - Overall score (0-100)
   */
  function calculateOverallScore(subjectAnalysis, contentAnalysis) {
    let score = 70; // Start with a baseline score

    // Subject factors
    if (subjectAnalysis.length >= 4 && subjectAnalysis.length <= 7) score += 5;
    if (subjectAnalysis.hasEmoji) score += 2;
    if (subjectAnalysis.isQuestion) score += 3;
    if (subjectAnalysis.hasNumber) score += 2;
    if (subjectAnalysis.sentiment.score > 0) score += 3;

    // Content factors
    if (contentAnalysis.readability.fleschReadingEase > 60) score += 5;
    if (contentAnalysis.readability.averageSentenceLength < 20) score += 3;
    if (contentAnalysis.estimatedReadTime <= 1) score += 2; // 1 minute or less
    if (contentAnalysis.sentiment.score > 0.3) score += 5;

    // Cap at 100
    return Math.min(100, score);
  }

  /**
   * Get A/B test recommendations for an email
   * @param {Object} emailData - The email content and metadata
   * @returns {Object} - A/B test recommendations
   */
  function getABTestRecommendations(emailData) {
    if (!emailData) return null;

    // Generate recommendations based on the email content
    const analysis = analyzeEmailContent(emailData);

    // Create A/B test variants based on the analysis
    const variants = [
      {
        name: 'Subject Line Test',
        description: 'Test different subject line approaches',
        variants: [
          {
            name: 'Original',
            subject: emailData.subject,
            content: emailData.content
          },
          {
            name: 'Question Format',
            subject: analysis.subject.recommendations[0] || 'Have you tried our recovery essentials yet?',
            content: emailData.content
          },
          {
            name: 'Urgency Format',
            subject: analysis.subject.recommendations[1] || 'Last chance: 24 hours left on our recovery sale',
            content: emailData.content
          }
        ],
        expectedLift: '15-25% open rate improvement',
        confidence: 0.91
      },
      {
        name: 'CTA Test',
        description: 'Test different call-to-action approaches',
        variants: [
          {
            name: 'Original',
            subject: emailData.subject,
            content: emailData.content
          }
        ],
        expectedLift: '5-10% click rate improvement',
        confidence: 0.87
      },
      {
        name: 'Send Time Test',
        description: 'Test optimal send times',
        variants: [
          {
            name: 'Morning',
            subject: emailData.subject,
            content: emailData.content,
            sendTime: '9:00 AM Tuesday'
          },
          {
            name: 'Afternoon',
            subject: emailData.subject,
            content: emailData.content,
            sendTime: '1:00 PM Thursday'
          },
          {
            name: 'Evening',
            subject: emailData.subject,
            content: emailData.content,
            sendTime: '7:00 PM Wednesday'
          }
        ],
        expectedLift: '10-20% open rate improvement',
        confidence: 0.89
      }
    ];

    // If we have content improvements, create a content test
    if (analysis.content.improvements.length > 0) {
      const contentTest = {
        name: 'Content Improvement Test',
        description: 'Test improved content against original',
        variants: [
          {
            name: 'Original',
            subject: emailData.subject,
            content: emailData.content
          }
        ],
        expectedLift: '10-15% engagement improvement',
        confidence: 0.85
      };

      // Create an improved content variant
      let improvedContent = emailData.content;
      analysis.content.improvements.forEach(improvement => {
        improvedContent = improvedContent.replace(
          improvement.original,
          improvement.improved
        );
      });

      contentTest.variants.push({
        name: 'Improved Content',
        subject: emailData.subject,
        content: improvedContent
      });

      variants.push(contentTest);
    }

    return {
      analysis: analysis,
      recommendations: variants
    };
  }

  // Public API
  return {
    init: init,
    getSubjectLineRecommendations: getSubjectLineRecommendations,
    getContentImprovementRecommendation: getContentImprovementRecommendation,
    getEmailStructureRecommendations: getEmailStructureRecommendations,
    getSendTimeRecommendations: getSendTimeRecommendations,
    analyzeEmailContent: analyzeEmailContent,
    getABTestRecommendations: getABTestRecommendations,
    setPreferences: function(preferences) {
      userPreferences = { ...userPreferences, ...preferences };
    }
  };
})();

// Make the module available globally
window.EmailMLRecommendations = EmailMLRecommendations;
