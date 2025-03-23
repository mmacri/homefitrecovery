# Content Templates System Documentation

## Overview

The Recovery Essentials Content Templates System is a comprehensive solution for creating structured, consistent content across the website. This system helps content creators produce high-quality content faster while maintaining a uniform style and organization.

This document explains how the templates system works, its key components, and how to use it effectively.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Template Types](#template-types)
3. [Using Templates](#using-templates)
4. [Creating Custom Templates](#creating-custom-templates)
5. [Technical Details](#technical-details)
6. [Best Practices](#best-practices)

## System Architecture

The templates system consists of several key components:

### 1. Content Templates Library (`content-templates.js`)

This is the core library that defines all template types and their HTML structures. The library provides:

- Template type constants
- Template friendly names
- Template HTML content generation
- Template field requirements

### 2. Template Selector Component (`template-selector.js`)

A reusable UI component that provides:

- Template selection dropdown
- Template preview functionality
- Template application to content areas
- Dynamic field display based on template type

### 3. Template Management Interface (`templates.html`)

An admin interface for:

- Browsing available templates
- Previewing template structures
- Copying template HTML
- Accessing templates documentation

### 4. Blog Editor Integration

The blog editing interface is integrated with the templates system:

- Dynamic field display based on selected template
- Content structuring based on templates
- Template switching with content preservation when possible

## Template Types

The system includes the following template types:

### 1. Standard Article

A basic article template with:
- Introduction
- Multiple main sections
- Conclusion

Best for: General articles, news, announcements

### 2. Product Review

A detailed product evaluation template with:
- Product introduction
- Specifications
- Pros and cons
- Performance testing
- Value assessment
- Conclusion with rating

Best for: Individual product reviews

### 3. How-To Guide

A step-by-step instructional template with:
- Introduction explaining the goal
- Materials/prerequisites list
- Numbered steps with details
- Troubleshooting section
- Tips for success
- Conclusion

Best for: Tutorials, guides, instructional content

### 4. Comparison Article

A template for comparing multiple products:
- Introduction to the compared items
- Comparison table
- Feature-by-feature breakdown
- Recommendations for different use cases
- Final verdict

Best for: Product comparisons, versus articles

### 5. Listicle (List Article)

A numbered list format:
- Introduction explaining the list
- Numbered items with descriptions
- Conclusion summarizing the list

Best for: "Top X" lists, ranked items, collections

### 6. Product Page

A comprehensive product detail page:
- Hero section with product image
- Key features
- Detailed specifications
- Pros and cons
- Customer reviews section
- Call-to-action with affiliate links

Best for: Main product pages in the catalog

### 7. Category Page

A template for product category landing pages:
- Category overview
- Buying guide
- Featured products
- Comparison table
- FAQs
- Conclusion

Best for: Product category pages

### 8. Landing Page

A conversion-focused template:
- Hero section with headline
- Benefits section
- Featured products
- Testimonials
- Strong call-to-action

Best for: Marketing campaigns, special offers

## Using Templates

### In the Blog Editor

1. Navigate to the blog editor (Admin → Blog)
2. Select a template from the "Template" dropdown
3. The editor will display template-specific fields
4. Fill in the basic information and template-specific fields
5. The editor will be pre-populated with template structure
6. Replace placeholder content with your actual content
7. Save or publish when complete

### In Other Content Areas

1. Go to the admin Templates page (Admin → Templates)
2. Browse and preview available templates
3. Use the "Copy HTML" button to copy the template code
4. Paste into your content editor
5. Replace placeholder content with your actual content

### Template-Specific Fields

Each template type requires different metadata fields:

- **Standard Article**: title, excerpt, featured image, SEO fields
- **Product Review**: all standard fields plus product name, brand, price, rating, affiliate links, pros, cons
- **How-To Guide**: all standard fields plus difficulty level, time required, materials needed
- **Comparison**: all standard fields plus product names, comparison criteria
- **Listicle**: all standard fields plus list count, list type
- **Product Page**: all standard fields plus detailed product specifications
- **Category Page**: all standard fields plus featured products, buying guide points, FAQs
- **Landing Page**: all standard fields plus headline, subheadline, benefits, testimonials, CTA

## Creating Custom Templates

To create a custom template:

1. Open `content-templates.js`
2. Add a new template type constant
3. Add the template name to the `TEMPLATE_NAMES` object
4. Add a new case in the `getTemplateHtml()` function with your HTML structure
5. Add required fields to `getTemplateFields()` function
6. Update the template management page to display the new template

Example of adding a new template:

```javascript
// Add to TEMPLATE_TYPES
const TEMPLATE_TYPES = {
    // Existing types...
    MY_CUSTOM: 'my-custom-template'
};

// Add to TEMPLATE_NAMES
const TEMPLATE_NAMES = {
    // Existing names...
    [TEMPLATE_TYPES.MY_CUSTOM]: 'My Custom Template'
};

// In getTemplateHtml function:
case TEMPLATE_TYPES.MY_CUSTOM:
    templateHtml = `
        <h2>Custom Section 1</h2>
        <p>Custom content here.</p>

        <h2>Custom Section 2</h2>
        <p>More custom content here.</p>
    `;
    break;

// In getTemplateFields function:
case TEMPLATE_TYPES.MY_CUSTOM:
    requiredFields.push(
        'custom_field_1',
        'custom_field_2'
    );
    break;
```

## Technical Details

### How Templates Are Applied

1. The template selector fetches the HTML structure from `getTemplateHtml()`
2. The HTML is inserted into the editor
3. The template type is stored in the post metadata
4. Template-specific fields are collected from form inputs
5. On post save, both the content and template metadata are saved
6. On post edit, the template type is loaded and applied to the form

### Content Data Model

Posts with templates use this data structure:

```javascript
{
    id: "unique-id",
    title: "Post Title",
    slug: "post-slug",
    template: "template-type-key",
    content: "HTML content",
    excerpt: "Short description",
    // Standard fields...

    // Template-specific data
    templateFields: {
        // Fields specific to the template type
        productName: "Example Product",
        pros: ["Pro 1", "Pro 2"],
        // etc.
    }
}
```

### Template Selector API

The `TemplateSelector` class provides these methods:

- `constructor(options)`: Initialize with options
- `selectTemplate(templateType)`: Switch to a template
- `getSelectedTemplate()`: Get current template
- `showPreview()`: Show template preview
- `getRequiredFields()`: Get fields for current template

Options include:

- `containerSelector`: Where to mount the selector
- `onSelect`: Callback when template is selected
- `allowedTemplates`: Array of template types to show
- `initialTemplate`: Default template

## Best Practices

### When to Use Templates

- **Always use templates** for recurring content types
- Use the most specific template for your content
- Don't force content into an inappropriate template

### Template Customization

- Templates provide structure but allow customization
- You can add or remove sections as needed
- Maintain the core structure for consistency
- Add custom CSS classes for special formatting

### Content Writing Tips

- Replace all placeholder text
- Expand sections that deserve more detail
- Remove sections that aren't relevant
- Add images where appropriate
- Maintain a consistent tone across templates
- Use the template as a starting point, not a constraint

### SEO Considerations

- Templates include proper heading hierarchy (H2, H3, etc.)
- Fill in all SEO fields (title, meta description)
- Add relevant keywords to each major section
- Use the structure to emphasize important information

## Troubleshooting

**Issue**: Template not displaying correctly
**Solution**: Check that all required JavaScript files are loaded

**Issue**: Template fields not saving
**Solution**: Ensure you're using the correct field names in the form

**Issue**: Cannot select templates
**Solution**: Verify the template selector is properly initialized

**Issue**: Custom template not appearing
**Solution**: Check you've added it to both TEMPLATE_TYPES and TEMPLATE_NAMES

---

For additional help, contact the site administrator or refer to the technical documentation in the codebase.
