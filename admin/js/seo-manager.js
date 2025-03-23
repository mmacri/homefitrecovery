/**
 * Recovery Essentials - SEO Management System
 * Handles SEO analysis, recommendations, and optimization for content
 */

// Storage keys
const SEO_CONFIG_KEY = 'recoveryEssentials_seoConfig';
const SEO_DATA_KEY = 'recoveryEssentials_seoData';
const KEYWORD_ANALYSIS_KEY = 'recoveryEssentials_keywordAnalysis';

// Default SEO configuration
const DEFAULT_SEO_CONFIG = {
    // Content analysis settings
    analysis: {
        minContentLength: 300,        // Minimum content length for adequate SEO
        optimalContentLength: 1500,   // Optimal content length for good SEO
        keywordDensityMin: 0.5,       // Minimum keyword density (percentage)
        keywordDensityMax: 2.5,       // Maximum keyword density (percentage)
        maxMetaDescriptionLength: 160 // Maximum recommended meta description length
    },

    // On-page SEO settings
    onPage: {
        checkHeadings: true,          // Check for proper heading hierarchy (H1, H2, etc.)
        checkImages: true,            // Check for image alt text
        checkLinks: true,             // Check for internal and external links
        checkReadability: true        // Check for content readability
    },

    // Technical SEO settings
    technical: {
        generateSitemap: true,        // Auto-generate XML sitemap
        canonicalUrls: true,          // Use canonical URLs
        useSchemaMarkup: true         // Use schema.org markup for rich snippets
    }
};

// Initialize the SEO Management System
function initSEOManager() {
    // Load or create config
    let config = getSEOConfig();
    if (!config) {
        config = DEFAULT_SEO_CONFIG;
        saveSEOConfig(config);
    }

    // Initialize SEO data storage if needed
    let seoData = getSEOData();
    if (!seoData) {
        seoData = {
            pageSEOScores: {},
            siteIssues: [],
            lastAnalysis: null
        };
        saveSEOData(seoData);
    }

    // Initialize keyword analysis storage if needed
    let keywordAnalysis = getKeywordAnalysis();
    if (!keywordAnalysis) {
        keywordAnalysis = {
            keywords: {},
            keywordPerformance: {},
            lastUpdated: null
        };
        saveKeywordAnalysis(keywordAnalysis);
    }

    return config;
}

/**
 * Analyze content for SEO
 * @param {Object} content - Content object with title, content, etc.
 * @param {string} focusKeyword - Primary keyword to focus analysis on
 * @returns {Object} Analysis results with scores and recommendations
 */
function analyzeContent(content, focusKeyword) {
    if (!content || !content.content) {
        return {
            score: 0,
            issues: ['No content provided for analysis'],
            recommendations: ['Add content to analyze for SEO']
        };
    }

    // Get config for analysis
    const config = getSEOConfig();

    // Initialize results object
    const results = {
        score: 0,
        issues: [],
        recommendations: [],
        keywordAnalysis: {},
        contentAnalysis: {},
        metaAnalysis: {}
    };

    // Check content length
    const contentLength = content.content.length;
    results.contentAnalysis.length = contentLength;

    if (contentLength < config.analysis.minContentLength) {
        results.issues.push(`Content is too short (${contentLength} chars, minimum recommended is ${config.analysis.minContentLength})`);
        results.recommendations.push(`Expand your content to at least ${config.analysis.minContentLength} characters for better SEO`);
    } else if (contentLength < config.analysis.optimalContentLength) {
        results.recommendations.push(`Consider expanding your content to ${config.analysis.optimalContentLength} characters for optimal SEO`);
    }

    // Analyze focus keyword if provided
    if (focusKeyword && focusKeyword.trim()) {
        const cleanKeyword = focusKeyword.trim().toLowerCase();
        const cleanContent = content.content.toLowerCase();

        // Count keyword occurrences
        const keywordCount = (cleanContent.match(new RegExp(cleanKeyword, 'g')) || []).length;
        const keywordDensity = (keywordCount / contentLength) * 100;

        results.keywordAnalysis = {
            keyword: cleanKeyword,
            occurrences: keywordCount,
            density: keywordDensity.toFixed(2)
        };

        // Check keyword density
        if (keywordDensity < config.analysis.keywordDensityMin) {
            results.issues.push(`Keyword density is too low (${keywordDensity.toFixed(2)}%)`);
            results.recommendations.push(`Increase the frequency of your focus keyword (${cleanKeyword}) in the content`);
        } else if (keywordDensity > config.analysis.keywordDensityMax) {
            results.issues.push(`Keyword density is too high (${keywordDensity.toFixed(2)}%)`);
            results.recommendations.push(`Reduce keyword stuffing for "${cleanKeyword}" to avoid search engine penalties`);
        }

        // Check keyword in title
        if (content.title && !content.title.toLowerCase().includes(cleanKeyword)) {
            results.issues.push('Focus keyword is not present in the title');
            results.recommendations.push(`Include your focus keyword "${cleanKeyword}" in the title`);
        }

        // Check keyword in meta description
        if (content.seoDescription && !content.seoDescription.toLowerCase().includes(cleanKeyword)) {
            results.issues.push('Focus keyword is not present in the meta description');
            results.recommendations.push(`Include your focus keyword "${cleanKeyword}" in the meta description`);
        }

        // Check keyword in URL/slug
        if (content.slug && !content.slug.toLowerCase().includes(cleanKeyword.replace(/\s+/g, '-'))) {
            results.recommendations.push(`Consider including your focus keyword in the URL slug`);
        }
    } else {
        results.issues.push('No focus keyword provided');
        results.recommendations.push('Define a focus keyword to improve SEO analysis');
    }

    // Analyze meta description
    if (content.seoDescription) {
        const descriptionLength = content.seoDescription.length;
        results.metaAnalysis.descriptionLength = descriptionLength;

        if (descriptionLength > config.analysis.maxMetaDescriptionLength) {
            results.issues.push(`Meta description is too long (${descriptionLength} chars, maximum recommended is ${config.analysis.maxMetaDescriptionLength})`);
            results.recommendations.push(`Shorten your meta description to ${config.analysis.maxMetaDescriptionLength} characters to avoid truncation in search results`);
        } else if (descriptionLength < 70) {
            results.recommendations.push('Consider making your meta description longer for better search result appearance');
        }
    } else {
        results.issues.push('No meta description provided');
        results.recommendations.push('Add a meta description to improve click-through rates from search results');
    }

    // Analyze headings if HTML content
    if (content.content.includes('<h')) {
        // Check for h1
        if (!content.content.includes('<h1')) {
            results.issues.push('No H1 heading found in content');
            results.recommendations.push('Add an H1 heading to your content for proper heading hierarchy');
        }

        // Check for heading order
        const headings = content.content.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/g) || [];
        let previousLevel = 0;
        let headingIssue = false;

        headings.forEach(heading => {
            const level = parseInt(heading.match(/<h([1-6])/)[1]);

            if (previousLevel > 0 && level > previousLevel + 1) {
                headingIssue = true;
            }

            previousLevel = level;
        });

        if (headingIssue) {
            results.issues.push('Heading structure has skipped levels');
            results.recommendations.push('Ensure proper heading hierarchy (H1 → H2 → H3) without skipping levels');
        }
    }

    // Analyze images if needed and html content
    if (config.onPage.checkImages && content.content.includes('<img')) {
        const images = content.content.match(/<img[^>]*>/g) || [];
        let missingAlt = 0;

        images.forEach(img => {
            if (!img.includes('alt=') || img.includes('alt=""')) {
                missingAlt++;
            }
        });

        if (missingAlt > 0) {
            results.issues.push(`${missingAlt} images missing alt text`);
            results.recommendations.push('Add descriptive alt text to all images for better accessibility and SEO');
        }
    }

    // Calculate overall score based on issues
    const issueCount = results.issues.length;
    if (issueCount === 0) {
        results.score = 100;
    } else if (issueCount <= 2) {
        results.score = 85;
    } else if (issueCount <= 5) {
        results.score = 70;
    } else if (issueCount <= 8) {
        results.score = 50;
    } else {
        results.score = 30;
    }

    // Save results to SEO data
    if (content.id) {
        const seoData = getSEOData();
        seoData.pageSEOScores[content.id] = {
            score: results.score,
            lastAnalyzed: new Date().toISOString(),
            focusKeyword
        };
        saveSEOData(seoData);

        // Update keyword analysis
        if (focusKeyword) {
            updateKeywordTracking(focusKeyword, content.id, results.score);
        }
    }

    return results;
}

/**
 * Update keyword tracking data
 * @param {string} keyword - The keyword to update
 * @param {string} contentId - Content ID that uses this keyword
 * @param {number} score - SEO score for this content/keyword
 */
function updateKeywordTracking(keyword, contentId, score) {
    const keywordData = getKeywordAnalysis();
    const cleanKeyword = keyword.trim().toLowerCase();

    // Initialize keyword entry if it doesn't exist
    if (!keywordData.keywords[cleanKeyword]) {
        keywordData.keywords[cleanKeyword] = {
            usedInContent: [],
            firstTracked: new Date().toISOString(),
            totalUses: 0
        };
    }

    // Update keyword usage
    const keywordInfo = keywordData.keywords[cleanKeyword];
    if (!keywordInfo.usedInContent.includes(contentId)) {
        keywordInfo.usedInContent.push(contentId);
        keywordInfo.totalUses++;
    }

    // Update performance data
    if (!keywordData.keywordPerformance[cleanKeyword]) {
        keywordData.keywordPerformance[cleanKeyword] = {
            averageScore: score,
            contentScores: {}
        };
    }

    // Update score for this content
    keywordData.keywordPerformance[cleanKeyword].contentScores[contentId] = score;

    // Recalculate average score
    const scores = Object.values(keywordData.keywordPerformance[cleanKeyword].contentScores);
    const avgScore = scores.reduce((sum, val) => sum + val, 0) / scores.length;
    keywordData.keywordPerformance[cleanKeyword].averageScore = Math.round(avgScore);

    // Update timestamp
    keywordData.lastUpdated = new Date().toISOString();

    // Save updated data
    saveKeywordAnalysis(keywordData);
}

/**
 * Get keyword performance data
 * @param {string} keyword - Optional specific keyword to get data for
 * @returns {Object} Keyword performance data
 */
function getKeywordPerformance(keyword = null) {
    const keywordData = getKeywordAnalysis();

    if (keyword) {
        const cleanKeyword = keyword.trim().toLowerCase();
        return {
            keyword: cleanKeyword,
            data: keywordData.keywords[cleanKeyword] || null,
            performance: keywordData.keywordPerformance[cleanKeyword] || null
        };
    }

    // Return overview of all keywords
    const result = {
        totalKeywords: Object.keys(keywordData.keywords).length,
        topKeywords: [],
        lastUpdated: keywordData.lastUpdated
    };

    // Sort keywords by frequency
    const sortedKeywords = Object.keys(keywordData.keywords)
        .map(kw => ({
            keyword: kw,
            uses: keywordData.keywords[kw].totalUses,
            score: keywordData.keywordPerformance[kw]?.averageScore || 0
        }))
        .sort((a, b) => b.uses - a.uses);

    result.topKeywords = sortedKeywords.slice(0, 20);

    return result;
}

/**
 * Generate SEO recommendations for site improvement
 * @returns {Object} Overall site SEO recommendations
 */
function generateSiteRecommendations() {
    const seoData = getSEOData();
    const keywordData = getKeywordAnalysis();

    // Look for patterns in page scores
    const scores = Object.values(seoData.pageSEOScores).map(page => page.score);
    const avgScore = scores.length > 0
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
        : 0;

    const recommendations = {
        overallScore: avgScore,
        generalRecommendations: [],
        contentRecommendations: [],
        keywordRecommendations: [],
        technicalRecommendations: []
    };

    // Add general recommendations based on average score
    if (avgScore < 50) {
        recommendations.generalRecommendations.push('Your site SEO needs significant improvement');
        recommendations.generalRecommendations.push('Focus on fixing critical issues first, particularly in top-traffic pages');
    } else if (avgScore < 70) {
        recommendations.generalRecommendations.push('Your site SEO is average and could use improvement');
        recommendations.generalRecommendations.push('Address the most common issues across your pages to improve overall score');
    } else if (avgScore < 90) {
        recommendations.generalRecommendations.push('Your site SEO is good but can still be improved');
        recommendations.generalRecommendations.push('Fine-tune your pages to reach excellent SEO status');
    } else {
        recommendations.generalRecommendations.push('Your site SEO is excellent');
        recommendations.generalRecommendations.push('Maintain your current practices and keep content updated');
    }

    // Look at low-scoring pages
    const lowScoringPages = Object.entries(seoData.pageSEOScores)
        .filter(([id, data]) => data.score < 60)
        .map(([id, data]) => id);

    if (lowScoringPages.length > 0) {
        recommendations.contentRecommendations.push(`You have ${lowScoringPages.length} pages with poor SEO scores that need attention`);
        if (lowScoringPages.length <= 3) {
            recommendations.contentRecommendations.push(`Focus on improving these pages: ${lowScoringPages.join(', ')}`);
        }
    }

    // Keywords with poor performance
    const poorKeywords = Object.entries(keywordData.keywordPerformance)
        .filter(([kw, data]) => data.averageScore < 60)
        .map(([kw, data]) => kw);

    if (poorKeywords.length > 0) {
        recommendations.keywordRecommendations.push(`You have ${poorKeywords.length} keywords with poor optimization scores`);
        if (poorKeywords.length <= 5) {
            recommendations.keywordRecommendations.push(`Improve optimization for these keywords: ${poorKeywords.join(', ')}`);
        }
    }

    // Keyword cannibalization check
    const potentialCannibalization = [];

    Object.entries(keywordData.keywords).forEach(([kw, data]) => {
        if (data.usedInContent.length > 1) {
            potentialCannibalization.push({
                keyword: kw,
                pages: data.usedInContent.length
            });
        }
    });

    if (potentialCannibalization.length > 0) {
        recommendations.keywordRecommendations.push('Potential keyword cannibalization detected on your site');
        recommendations.keywordRecommendations.push('Consider focusing each primary keyword on a single dedicated page');
    }

    // Add some standard technical recommendations
    recommendations.technicalRecommendations = [
        'Ensure your site has a valid XML sitemap submitted to search engines',
        'Verify that all pages use HTTPS and have proper canonical URLs set',
        'Implement schema markup for rich snippets in search results',
        'Check for and fix any broken links on your site',
        'Optimize your site for mobile devices and page speed'
    ];

    return recommendations;
}

/**
 * Get SEO config
 * @returns {Object} SEO configuration
 */
function getSEOConfig() {
    return JSON.parse(localStorage.getItem(SEO_CONFIG_KEY) || JSON.stringify(DEFAULT_SEO_CONFIG));
}

/**
 * Save SEO config
 * @param {Object} config - SEO config to save
 */
function saveSEOConfig(config) {
    localStorage.setItem(SEO_CONFIG_KEY, JSON.stringify(config));
}

/**
 * Get SEO data
 * @returns {Object} Stored SEO data
 */
function getSEOData() {
    return JSON.parse(localStorage.getItem(SEO_DATA_KEY) || '{"pageSEOScores":{},"siteIssues":[],"lastAnalysis":null}');
}

/**
 * Save SEO data
 * @param {Object} data - SEO data to save
 */
function saveSEOData(data) {
    localStorage.setItem(SEO_DATA_KEY, JSON.stringify(data));
}

/**
 * Get keyword analysis data
 * @returns {Object} Keyword analysis data
 */
function getKeywordAnalysis() {
    return JSON.parse(localStorage.getItem(KEYWORD_ANALYSIS_KEY) || '{"keywords":{},"keywordPerformance":{},"lastUpdated":null}');
}

/**
 * Save keyword analysis data
 * @param {Object} data - Keyword data to save
 */
function saveKeywordAnalysis(data) {
    localStorage.setItem(KEYWORD_ANALYSIS_KEY, JSON.stringify(data));
}

/**
 * Generate SEO friendly slug from text
 * @param {string} text - Text to convert to slug
 * @returns {string} SEO-friendly slug
 */
function generateSlug(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/&/g, '-and-')      // Replace & with 'and'
        .replace(/[^\w\-]+/g, '')    // Remove all non-word characters
        .replace(/\-\-+/g, '-')      // Replace multiple - with single -
        .replace(/^-+/, '')          // Trim - from start of text
        .replace(/-+$/, '');         // Trim - from end of text
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    initSEOManager();
});

// Export functions
window.SEOManager = {
    // Core functions
    analyzeContent,
    generateSiteRecommendations,

    // Keyword functions
    getKeywordPerformance,

    // Configuration
    getSEOConfig,
    saveSEOConfig,

    // Utility functions
    generateSlug
};
