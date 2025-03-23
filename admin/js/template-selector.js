/**
 * Template Selector Component
 *
 * This file provides a reusable template selector component that can be
 * used across the admin area for selecting and previewing content templates.
 */

class TemplateSelector {
    /**
     * Create a new TemplateSelector instance
     * @param {Object} options - Configuration options
     * @param {string} options.containerSelector - CSS selector for the container element
     * @param {Function} options.onSelect - Callback for when a template is selected
     * @param {Array} options.allowedTemplates - Array of template types to show (defaults to all)
     * @param {string} options.initialTemplate - Initial template to select
     */
    constructor(options) {
        this.options = Object.assign({
            containerSelector: '#template-selector',
            onSelect: () => {},
            allowedTemplates: Object.values(ContentTemplates.TEMPLATE_TYPES),
            initialTemplate: ContentTemplates.TEMPLATE_TYPES.STANDARD
        }, options);

        this.container = document.querySelector(this.options.containerSelector);
        if (!this.container) {
            console.error(`Container element ${this.options.containerSelector} not found`);
            return;
        }

        this.selectedTemplate = this.options.initialTemplate;
        this.initialize();
    }

    /**
     * Initialize the template selector
     */
    initialize() {
        // Create UI elements
        this.createUI();

        // Set up event listeners
        this.setupEvents();

        // Set initial template
        this.selectTemplate(this.selectedTemplate, false);
    }

    /**
     * Create UI elements
     */
    createUI() {
        // Clear container
        this.container.innerHTML = '';

        // Create template selector dropdown
        const selectorContainer = document.createElement('div');
        selectorContainer.className = 'template-selector-container mb-6';

        // Add heading
        const heading = document.createElement('h3');
        heading.className = 'text-lg font-medium text-gray-900 mb-2';
        heading.textContent = 'Choose a Content Template';
        selectorContainer.appendChild(heading);

        // Add description
        const description = document.createElement('p');
        description.className = 'text-sm text-gray-500 mb-4';
        description.textContent = 'Select a template to structure your content';
        selectorContainer.appendChild(description);

        // Create dropdown
        const selectGroup = document.createElement('div');
        selectGroup.className = 'flex items-center';

        const select = document.createElement('select');
        select.id = 'template-type-select';
        select.className = 'block w-full max-w-md pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md';

        // Add template options
        this.options.allowedTemplates.forEach(templateType => {
            const option = document.createElement('option');
            option.value = templateType;
            option.textContent = ContentTemplates.TEMPLATE_NAMES[templateType];
            select.appendChild(option);
        });

        selectGroup.appendChild(select);

        // Add preview button
        const previewBtn = document.createElement('button');
        previewBtn.id = 'template-preview-btn';
        previewBtn.type = 'button';
        previewBtn.className = 'ml-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500';
        previewBtn.innerHTML = '<i class="far fa-eye mr-1"></i> Preview';
        selectGroup.appendChild(previewBtn);

        selectorContainer.appendChild(selectGroup);
        this.container.appendChild(selectorContainer);

        // Create template preview section
        const previewContainer = document.createElement('div');
        previewContainer.id = 'template-preview-container';
        previewContainer.className = 'hidden';

        // Template preview header
        const previewHeader = document.createElement('div');
        previewHeader.className = 'flex justify-between items-center mb-4 pb-2 border-b border-gray-200';

        const previewTitle = document.createElement('h3');
        previewTitle.id = 'preview-template-name';
        previewTitle.className = 'text-lg font-medium text-gray-900';
        previewTitle.textContent = 'Template Preview';
        previewHeader.appendChild(previewTitle);

        const closePreviewBtn = document.createElement('button');
        closePreviewBtn.id = 'close-preview-btn';
        closePreviewBtn.type = 'button';
        closePreviewBtn.className = 'text-gray-400 hover:text-gray-500';
        closePreviewBtn.innerHTML = '<i class="fas fa-times"></i>';
        previewHeader.appendChild(closePreviewBtn);

        previewContainer.appendChild(previewHeader);

        // Template preview content
        const previewContent = document.createElement('div');
        previewContent.id = 'template-preview-content';
        previewContent.className = 'bg-white p-4 border border-gray-200 rounded-md overflow-auto max-h-96';
        previewContainer.appendChild(previewContent);

        // Template action buttons
        const previewActions = document.createElement('div');
        previewActions.className = 'flex justify-end mt-4';

        const useTemplateBtn = document.createElement('button');
        useTemplateBtn.id = 'use-template-btn';
        useTemplateBtn.type = 'button';
        useTemplateBtn.className = 'px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500';
        useTemplateBtn.textContent = 'Use This Template';
        previewActions.appendChild(useTemplateBtn);

        previewContainer.appendChild(previewActions);
        this.container.appendChild(previewContainer);

        // Store references to elements
        this.elements = {
            select,
            previewBtn,
            previewContainer,
            previewContent,
            previewTitle,
            closePreviewBtn,
            useTemplateBtn
        };
    }

    /**
     * Set up event listeners
     */
    setupEvents() {
        // Template dropdown change
        this.elements.select.addEventListener('change', () => {
            const templateType = this.elements.select.value;
            this.selectTemplate(templateType);
        });

        // Preview button click
        this.elements.previewBtn.addEventListener('click', () => {
            this.showPreview();
        });

        // Close preview button
        this.elements.closePreviewBtn.addEventListener('click', () => {
            this.hidePreview();
        });

        // Use template button
        this.elements.useTemplateBtn.addEventListener('click', () => {
            this.useTemplate();
        });
    }

    /**
     * Select a template type
     * @param {string} templateType - The template type to select
     * @param {boolean} triggerCallback - Whether to trigger the onSelect callback
     */
    selectTemplate(templateType, triggerCallback = true) {
        // Set the dropdown value
        this.elements.select.value = templateType;

        // Update selected template
        this.selectedTemplate = templateType;

        // Update preview content
        this.updatePreviewContent();

        // Trigger callback if needed
        if (triggerCallback) {
            this.options.onSelect(templateType);
        }
    }

    /**
     * Update the preview content based on selected template
     */
    updatePreviewContent() {
        const templateHtml = ContentTemplates.getTemplateHtml(this.selectedTemplate);
        this.elements.previewContent.innerHTML = templateHtml;
        this.elements.previewTitle.textContent = `Template Preview: ${ContentTemplates.TEMPLATE_NAMES[this.selectedTemplate]}`;
    }

    /**
     * Show the template preview
     */
    showPreview() {
        this.elements.previewContainer.classList.remove('hidden');
        this.updatePreviewContent();
    }

    /**
     * Hide the template preview
     */
    hidePreview() {
        this.elements.previewContainer.classList.add('hidden');
    }

    /**
     * Use the selected template and trigger callback
     */
    useTemplate() {
        this.options.onSelect(this.selectedTemplate, ContentTemplates.getTemplateHtml(this.selectedTemplate));
        this.hidePreview();
    }

    /**
     * Get the currently selected template
     * @returns {string} The selected template type
     */
    getSelectedTemplate() {
        return this.selectedTemplate;
    }

    /**
     * Get the required fields for the current template
     * @returns {Array} Array of required field names
     */
    getRequiredFields() {
        return ContentTemplates.getTemplateFields(this.selectedTemplate);
    }
}

// Make it available globally
window.TemplateSelector = TemplateSelector;
