/**
 * Content Templates Library
 *
 * This library provides reusable content templates for different types of content
 * across the Recovery Essentials website.
 */

// Template types
const TEMPLATE_TYPES = {
    STANDARD: 'standard',
    PRODUCT_REVIEW: 'product-review',
    HOW_TO_GUIDE: 'how-to-guide',
    COMPARISON: 'comparison',
    LISTICLE: 'listicle',
    PRODUCT_PAGE: 'product-page',
    CATEGORY_PAGE: 'category-page',
    LANDING_PAGE: 'landing-page'
};

// Template friendly names
const TEMPLATE_NAMES = {
    [TEMPLATE_TYPES.STANDARD]: 'Standard Article',
    [TEMPLATE_TYPES.PRODUCT_REVIEW]: 'Product Review',
    [TEMPLATE_TYPES.HOW_TO_GUIDE]: 'How-To Guide',
    [TEMPLATE_TYPES.COMPARISON]: 'Comparison Article',
    [TEMPLATE_TYPES.LISTICLE]: 'List Article',
    [TEMPLATE_TYPES.PRODUCT_PAGE]: 'Product Page',
    [TEMPLATE_TYPES.CATEGORY_PAGE]: 'Category Page',
    [TEMPLATE_TYPES.LANDING_PAGE]: 'Landing Page'
};

// Get template HTML content based on template type
function getTemplateHtml(templateType) {
    let templateHtml = '';

    switch (templateType) {
        case TEMPLATE_TYPES.PRODUCT_REVIEW:
            templateHtml = `
                <h2>Introduction</h2>
                <p>Brief introduction about the product and its purpose.</p>

                <h2>Product Overview</h2>
                <p>Detailed description of the product, including its key features and specifications.</p>

                <h2>Pros and Cons</h2>
                <h3>What We Like</h3>
                <ul>
                    <li>Pro point 1</li>
                    <li>Pro point 2</li>
                    <li>Pro point 3</li>
                </ul>

                <h3>What Could Be Better</h3>
                <ul>
                    <li>Con point 1</li>
                    <li>Con point 2</li>
                </ul>

                <h2>Performance</h2>
                <p>How does the product perform in real-world use.</p>

                <h2>Value for Money</h2>
                <p>Is the product worth its price compared to alternatives?</p>

                <h2>Conclusion</h2>
                <p>Final thoughts and recommendations.</p>
            `;
            break;

        case TEMPLATE_TYPES.HOW_TO_GUIDE:
            templateHtml = `
                <h2>Introduction</h2>
                <p>Brief introduction explaining what this guide will teach.</p>

                <h2>What You'll Need</h2>
                <ul>
                    <li>Item 1</li>
                    <li>Item 2</li>
                    <li>Item 3</li>
                </ul>

                <h2>Step 1: Getting Started</h2>
                <p>Description of the first step.</p>

                <h2>Step 2: The Process</h2>
                <p>Description of the second step.</p>

                <h2>Step 3: Finishing Up</h2>
                <p>Description of the final step.</p>

                <h2>Tips and Troubleshooting</h2>
                <p>Common issues and how to solve them.</p>

                <h2>Conclusion</h2>
                <p>Summary and final thoughts.</p>
            `;
            break;

        case TEMPLATE_TYPES.COMPARISON:
            templateHtml = `
                <h2>Introduction</h2>
                <p>Brief introduction comparing the two products and why this comparison matters.</p>

                <h2>Key Differences at a Glance</h2>
                <p>Quick summary of the main differences between the products.</p>

                <div class="comparison-table">
                    <table class="w-full border-collapse">
                        <thead>
                            <tr>
                                <th class="border border-gray-300 px-4 py-2"></th>
                                <th class="border border-gray-300 px-4 py-2">Product 1</th>
                                <th class="border border-gray-300 px-4 py-2">Product 2</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="border border-gray-300 px-4 py-2 font-medium">Price</td>
                                <td class="border border-gray-300 px-4 py-2">$XX.XX</td>
                                <td class="border border-gray-300 px-4 py-2">$XX.XX</td>
                            </tr>
                            <tr>
                                <td class="border border-gray-300 px-4 py-2 font-medium">Feature 1</td>
                                <td class="border border-gray-300 px-4 py-2">Description</td>
                                <td class="border border-gray-300 px-4 py-2">Description</td>
                            </tr>
                            <tr>
                                <td class="border border-gray-300 px-4 py-2 font-medium">Feature 2</td>
                                <td class="border border-gray-300 px-4 py-2">Description</td>
                                <td class="border border-gray-300 px-4 py-2">Description</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h2>Detailed Comparison</h2>
                <h3>Feature 1: [Feature Name]</h3>
                <p>How Product 1 compares to Product 2 on this feature.</p>

                <h3>Feature 2: [Feature Name]</h3>
                <p>How Product 1 compares to Product 2 on this feature.</p>

                <h3>Feature 3: [Feature Name]</h3>
                <p>How Product 1 compares to Product 2 on this feature.</p>

                <h2>Which One Should You Choose?</h2>
                <p>Recommendations based on different user needs.</p>

                <h2>Conclusion</h2>
                <p>Final verdict and summary.</p>
            `;
            break;

        case TEMPLATE_TYPES.LISTICLE:
            templateHtml = `
                <h2>Introduction</h2>
                <p>Brief introduction explaining the purpose of this list and why these items were selected.</p>

                <h2>1. [Item One]</h2>
                <p>Description of the first item.</p>

                <h2>2. [Item Two]</h2>
                <p>Description of the second item.</p>

                <h2>3. [Item Three]</h2>
                <p>Description of the third item.</p>

                <h2>4. [Item Four]</h2>
                <p>Description of the fourth item.</p>

                <h2>5. [Item Five]</h2>
                <p>Description of the fifth item.</p>

                <h2>Conclusion</h2>
                <p>Final thoughts and recommendations.</p>
            `;
            break;

        case TEMPLATE_TYPES.PRODUCT_PAGE:
            templateHtml = `
                <div class="product-hero">
                    <div class="product-image">
                        <img src="[Product Image URL]" alt="[Product Name]" class="w-full rounded-lg shadow-md">
                    </div>
                    <div class="product-intro">
                        <h1>[Product Name]</h1>
                        <div class="product-rating">
                            <span class="stars">★★★★☆</span>
                            <span class="rating-count">(XX reviews)</span>
                        </div>
                        <div class="product-price">$XX.XX</div>
                        <div class="product-cta mt-4">
                            <a href="[Affiliate Link]" class="btn bg-indigo-600 text-white px-6 py-3 rounded-md inline-block">View on Amazon</a>
                        </div>
                    </div>
                </div>

                <div class="product-details mt-8">
                    <h2>Product Overview</h2>
                    <p>Detailed description of the product, including its purpose and benefits.</p>

                    <h2>Key Features</h2>
                    <ul class="feature-list">
                        <li>Feature 1</li>
                        <li>Feature 2</li>
                        <li>Feature 3</li>
                        <li>Feature 4</li>
                    </ul>

                    <h2>Specifications</h2>
                    <div class="specs-table">
                        <div class="spec-row">
                            <div class="spec-label">Dimension</div>
                            <div class="spec-value">XX" x XX" x XX"</div>
                        </div>
                        <div class="spec-row">
                            <div class="spec-label">Weight</div>
                            <div class="spec-value">XX lbs</div>
                        </div>
                        <div class="spec-row">
                            <div class="spec-label">Material</div>
                            <div class="spec-value">[Material type]</div>
                        </div>
                        <div class="spec-row">
                            <div class="spec-label">Warranty</div>
                            <div class="spec-value">X year</div>
                        </div>
                    </div>

                    <h2>Pros and Cons</h2>
                    <div class="pros-cons-grid">
                        <div class="pros">
                            <h3>What We Like</h3>
                            <ul>
                                <li>Pro point 1</li>
                                <li>Pro point 2</li>
                                <li>Pro point 3</li>
                            </ul>
                        </div>
                        <div class="cons">
                            <h3>What Could Be Better</h3>
                            <ul>
                                <li>Con point 1</li>
                                <li>Con point 2</li>
                            </ul>
                        </div>
                    </div>

                    <h2>Customer Reviews</h2>
                    <div class="review-summary">
                        <p>Summary of what customers are saying about this product.</p>
                    </div>

                    <h2>Conclusion</h2>
                    <p>Final thoughts and recommendations.</p>

                    <div class="product-cta-bottom text-center mt-8">
                        <a href="[Affiliate Link]" class="btn bg-indigo-600 text-white px-8 py-4 rounded-md inline-block text-lg">Check Price on Amazon</a>
                    </div>
                </div>
            `;
            break;

        case TEMPLATE_TYPES.CATEGORY_PAGE:
            templateHtml = `
                <div class="category-header">
                    <h1>[Category Name]</h1>
                    <p class="category-description">Overview of this product category and why it's important for recovery.</p>
                </div>

                <div class="buying-guide">
                    <h2>Buying Guide</h2>
                    <p>Introduction to key factors to consider when buying products in this category.</p>

                    <h3>What to Look For</h3>
                    <ul>
                        <li><strong>Feature 1:</strong> Why this feature matters.</li>
                        <li><strong>Feature 2:</strong> Why this feature matters.</li>
                        <li><strong>Feature 3:</strong> Why this feature matters.</li>
                        <li><strong>Feature 4:</strong> Why this feature matters.</li>
                    </ul>
                </div>

                <div class="top-picks">
                    <h2>Our Top Picks</h2>

                    <div class="product-card best-overall">
                        <div class="product-badge">Best Overall</div>
                        <div class="product-image">
                            <img src="[Product Image URL]" alt="[Product Name]">
                        </div>
                        <h3>[Product Name]</h3>
                        <div class="product-rating">★★★★☆ (XX reviews)</div>
                        <div class="product-price">$XX.XX</div>
                        <p class="product-summary">Brief summary of why this product is recommended.</p>
                        <a href="[Product Page URL]" class="btn">View Details</a>
                    </div>

                    <div class="product-card best-value">
                        <div class="product-badge">Best Value</div>
                        <div class="product-image">
                            <img src="[Product Image URL]" alt="[Product Name]">
                        </div>
                        <h3>[Product Name]</h3>
                        <div class="product-rating">★★★★☆ (XX reviews)</div>
                        <div class="product-price">$XX.XX</div>
                        <p class="product-summary">Brief summary of why this product is recommended.</p>
                        <a href="[Product Page URL]" class="btn">View Details</a>
                    </div>

                    <div class="product-card premium-pick">
                        <div class="product-badge">Premium Pick</div>
                        <div class="product-image">
                            <img src="[Product Image URL]" alt="[Product Name]">
                        </div>
                        <h3>[Product Name]</h3>
                        <div class="product-rating">★★★★☆ (XX reviews)</div>
                        <div class="product-price">$XX.XX</div>
                        <p class="product-summary">Brief summary of why this product is recommended.</p>
                        <a href="[Product Page URL]" class="btn">View Details</a>
                    </div>
                </div>

                <div class="product-comparison">
                    <h2>Comparison Table</h2>
                    <table class="comparison-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Rating</th>
                                <th>Price</th>
                                <th>Feature 1</th>
                                <th>Feature 2</th>
                                <th>Feature 3</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Product 1</td>
                                <td>★★★★☆</td>
                                <td>$XX.XX</td>
                                <td>Details</td>
                                <td>Details</td>
                                <td>Details</td>
                            </tr>
                            <tr>
                                <td>Product 2</td>
                                <td>★★★★☆</td>
                                <td>$XX.XX</td>
                                <td>Details</td>
                                <td>Details</td>
                                <td>Details</td>
                            </tr>
                            <tr>
                                <td>Product 3</td>
                                <td>★★★★☆</td>
                                <td>$XX.XX</td>
                                <td>Details</td>
                                <td>Details</td>
                                <td>Details</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="faq-section">
                    <h2>Frequently Asked Questions</h2>

                    <div class="faq-item">
                        <h3>Question 1?</h3>
                        <p>Answer to question 1.</p>
                    </div>

                    <div class="faq-item">
                        <h3>Question 2?</h3>
                        <p>Answer to question 2.</p>
                    </div>

                    <div class="faq-item">
                        <h3>Question 3?</h3>
                        <p>Answer to question 3.</p>
                    </div>
                </div>

                <div class="conclusion">
                    <h2>Conclusion</h2>
                    <p>Final thoughts on this product category and general recommendations.</p>
                </div>
            `;
            break;

        case TEMPLATE_TYPES.LANDING_PAGE:
            templateHtml = `
                <div class="hero-section bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-20 px-4">
                    <div class="container mx-auto max-w-5xl">
                        <h1 class="text-4xl md:text-5xl font-bold mb-6">[Main Headline]</h1>
                        <p class="text-xl md:text-2xl mb-8">[Compelling subheadline about recovery benefits]</p>
                        <div class="cta-buttons">
                            <a href="#products" class="btn bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3 rounded-md font-medium mr-4">View Products</a>
                            <a href="#learn-more" class="btn border border-white text-white hover:bg-white hover:bg-opacity-20 px-8 py-3 rounded-md font-medium">Learn More</a>
                        </div>
                    </div>
                </div>

                <div id="learn-more" class="benefits-section py-16 px-4 bg-gray-50">
                    <div class="container mx-auto max-w-5xl">
                        <h2 class="text-3xl font-bold text-center mb-12">Why Recovery Matters</h2>

                        <div class="grid md:grid-cols-3 gap-8">
                            <div class="benefit-card text-center p-6 bg-white rounded-lg shadow-sm">
                                <div class="icon-circle bg-indigo-100 text-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i class="fas fa-bolt text-2xl"></i>
                                </div>
                                <h3 class="text-xl font-semibold mb-2">Benefit 1</h3>
                                <p class="text-gray-600">Description of this benefit and how it helps with recovery.</p>
                            </div>

                            <div class="benefit-card text-center p-6 bg-white rounded-lg shadow-sm">
                                <div class="icon-circle bg-indigo-100 text-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i class="fas fa-heartbeat text-2xl"></i>
                                </div>
                                <h3 class="text-xl font-semibold mb-2">Benefit 2</h3>
                                <p class="text-gray-600">Description of this benefit and how it helps with recovery.</p>
                            </div>

                            <div class="benefit-card text-center p-6 bg-white rounded-lg shadow-sm">
                                <div class="icon-circle bg-indigo-100 text-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i class="fas fa-brain text-2xl"></i>
                                </div>
                                <h3 class="text-xl font-semibold mb-2">Benefit 3</h3>
                                <p class="text-gray-600">Description of this benefit and how it helps with recovery.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="products" class="featured-products py-16 px-4">
                    <div class="container mx-auto max-w-5xl">
                        <h2 class="text-3xl font-bold text-center mb-12">Featured Recovery Products</h2>

                        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div class="product-card bg-white rounded-lg shadow-sm overflow-hidden">
                                <div class="product-image h-48 bg-gray-200">
                                    <!-- Product image here -->
                                </div>
                                <div class="p-6">
                                    <h3 class="text-xl font-semibold mb-2">[Product Name]</h3>
                                    <div class="flex items-center mb-2">
                                        <div class="text-amber-400">★★★★☆</div>
                                        <div class="text-gray-500 text-sm ml-1">(XX reviews)</div>
                                    </div>
                                    <p class="text-gray-600 mb-4">Brief description of this product.</p>
                                    <div class="flex justify-between items-center">
                                        <span class="text-lg font-bold">$XX.XX</span>
                                        <a href="[Product Page URL]" class="btn bg-indigo-600 text-white px-4 py-2 rounded">View Details</a>
                                    </div>
                                </div>
                            </div>

                            <div class="product-card bg-white rounded-lg shadow-sm overflow-hidden">
                                <div class="product-image h-48 bg-gray-200">
                                    <!-- Product image here -->
                                </div>
                                <div class="p-6">
                                    <h3 class="text-xl font-semibold mb-2">[Product Name]</h3>
                                    <div class="flex items-center mb-2">
                                        <div class="text-amber-400">★★★★☆</div>
                                        <div class="text-gray-500 text-sm ml-1">(XX reviews)</div>
                                    </div>
                                    <p class="text-gray-600 mb-4">Brief description of this product.</p>
                                    <div class="flex justify-between items-center">
                                        <span class="text-lg font-bold">$XX.XX</span>
                                        <a href="[Product Page URL]" class="btn bg-indigo-600 text-white px-4 py-2 rounded">View Details</a>
                                    </div>
                                </div>
                            </div>

                            <div class="product-card bg-white rounded-lg shadow-sm overflow-hidden">
                                <div class="product-image h-48 bg-gray-200">
                                    <!-- Product image here -->
                                </div>
                                <div class="p-6">
                                    <h3 class="text-xl font-semibold mb-2">[Product Name]</h3>
                                    <div class="flex items-center mb-2">
                                        <div class="text-amber-400">★★★★☆</div>
                                        <div class="text-gray-500 text-sm ml-1">(XX reviews)</div>
                                    </div>
                                    <p class="text-gray-600 mb-4">Brief description of this product.</p>
                                    <div class="flex justify-between items-center">
                                        <span class="text-lg font-bold">$XX.XX</span>
                                        <a href="[Product Page URL]" class="btn bg-indigo-600 text-white px-4 py-2 rounded">View Details</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="text-center mt-12">
                            <a href="/products" class="btn bg-indigo-600 text-white px-8 py-3 rounded-md inline-block">View All Products</a>
                        </div>
                    </div>
                </div>

                <div class="testimonials-section py-16 px-4 bg-gray-50">
                    <div class="container mx-auto max-w-5xl">
                        <h2 class="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>

                        <div class="grid md:grid-cols-2 gap-8">
                            <div class="testimonial-card bg-white p-6 rounded-lg shadow-sm">
                                <div class="text-amber-400 mb-4">★★★★★</div>
                                <p class="text-gray-600 italic mb-4">"Testimonial text here. A customer sharing their positive experience with recovery products."</p>
                                <div class="flex items-center">
                                    <div class="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                                    <div>
                                        <div class="font-medium">Customer Name</div>
                                        <div class="text-gray-500 text-sm">Product Used</div>
                                    </div>
                                </div>
                            </div>

                            <div class="testimonial-card bg-white p-6 rounded-lg shadow-sm">
                                <div class="text-amber-400 mb-4">★★★★★</div>
                                <p class="text-gray-600 italic mb-4">"Testimonial text here. A customer sharing their positive experience with recovery products."</p>
                                <div class="flex items-center">
                                    <div class="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                                    <div>
                                        <div class="font-medium">Customer Name</div>
                                        <div class="text-gray-500 text-sm">Product Used</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="cta-section py-20 px-4 bg-indigo-600 text-white text-center">
                    <div class="container mx-auto max-w-3xl">
                        <h2 class="text-3xl font-bold mb-6">Ready to Improve Your Recovery?</h2>
                        <p class="text-xl mb-8">Start optimizing your recovery today with products that work.</p>
                        <a href="/products" class="btn bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3 rounded-md font-medium inline-block">Explore Products</a>
                    </div>
                </div>
            `;
            break;

        case TEMPLATE_TYPES.STANDARD:
        default:
            templateHtml = `
                <h2>Introduction</h2>
                <p>Start with an engaging introduction to your topic.</p>

                <h2>Main Section 1</h2>
                <p>Detailed information about your first main point.</p>

                <h2>Main Section 2</h2>
                <p>Detailed information about your second main point.</p>

                <h2>Main Section 3</h2>
                <p>Detailed information about your third main point.</p>

                <h2>Conclusion</h2>
                <p>Summarize your key points and provide a final thought.</p>
            `;
            break;
    }

    return templateHtml;
}

// Get template meta fields (fields that should be collected for the template)
function getTemplateFields(templateType) {
    let fields = {
        standard: ['title', 'excerpt', 'featured_image', 'seo_title', 'seo_description'],
    };

    // Standard fields for all templates
    let requiredFields = [...fields.standard];

    // Add template-specific fields
    switch (templateType) {
        case TEMPLATE_TYPES.PRODUCT_REVIEW:
            requiredFields.push(
                'product_name',
                'product_brand',
                'product_price',
                'product_rating',
                'product_affiliate_link',
                'pros',
                'cons'
            );
            break;

        case TEMPLATE_TYPES.HOW_TO_GUIDE:
            requiredFields.push(
                'difficulty_level',
                'time_required',
                'materials_needed'
            );
            break;

        case TEMPLATE_TYPES.COMPARISON:
            requiredFields.push(
                'product1',
                'product2',
                'comparison_criteria'
            );
            break;

        case TEMPLATE_TYPES.LISTICLE:
            requiredFields.push(
                'list_count',
                'list_type'
            );
            break;

        case TEMPLATE_TYPES.PRODUCT_PAGE:
            requiredFields.push(
                'product_name',
                'product_brand',
                'product_price',
                'product_rating',
                'product_review_count',
                'product_images',
                'product_features',
                'product_specifications',
                'pros',
                'cons',
                'affiliate_link'
            );
            break;

        case TEMPLATE_TYPES.CATEGORY_PAGE:
            requiredFields.push(
                'category_name',
                'featured_products',
                'buying_guide_points',
                'faq_items'
            );
            break;

        case TEMPLATE_TYPES.LANDING_PAGE:
            requiredFields.push(
                'headline',
                'subheadline',
                'benefits',
                'featured_products',
                'testimonials',
                'cta_text'
            );
            break;
    }

    return requiredFields;
}

// Export functions and constants
// Note: In a browser environment without ES modules, these will be global
window.ContentTemplates = {
    TEMPLATE_TYPES,
    TEMPLATE_NAMES,
    getTemplateHtml,
    getTemplateFields
};
