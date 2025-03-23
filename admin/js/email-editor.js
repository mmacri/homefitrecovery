/**
 * Email Editor - WYSIWYG editor for creating email templates
 * This module provides a rich text editing experience for creating and editing email templates.
 */

// Define the EmailEditor module
const EmailEditor = (function() {
  // Private variables
  let editorInstance = null;
  let currentTemplate = null;
  let isEditing = false;

  // Editor configuration
  const editorConfig = {
    toolbarButtons: {
      textFormatting: ['bold', 'italic', 'underline', 'strikethrough', 'fontSize', 'color', 'align'],
      paragraphFormatting: ['formatBlock', 'align', 'list', 'indent', 'outdent', 'lineHeight'],
      insertOptions: ['image', 'link', 'table', 'hr', 'emoticons'],
      advanced: ['html', 'fullscreen']
    },
    imageUploadParams: {
      id: 'image_upload'
    },
    imageInsertButtons: ['imageUpload', 'imageByURL'],
    heightMin: 400,
    heightMax: 800
  };

  /**
   * Initialize the email editor
   * @param {string} containerId - The HTML element ID where the editor should be initialized
   * @param {Object} options - Additional editor options
   */
  function init(containerId, options = {}) {
    if (!containerId) {
      console.error('Container ID is required to initialize the email editor');
      return;
    }

    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with ID "${containerId}" not found`);
      return;
    }

    // Merge default config with user options
    const config = { ...editorConfig, ...options };

    // Check if we have Froala Editor or TinyMCE available, otherwise use a simplified editor
    if (window.FroalaEditor) {
      initFroalaEditor(container, config);
    } else if (window.tinymce) {
      initTinyMCE(container, config);
    } else {
      initSimpleEditor(container);
    }

    // Setup event listeners
    setupEventListeners();

    console.log('Email Editor initialized');
  }

  /**
   * Initialize Froala Editor if available
   */
  function initFroalaEditor(container, config) {
    editorInstance = new FroalaEditor(container, {
      toolbarButtons: config.toolbarButtons,
      imageUploadURL: '/api/upload-image',
      imageUploadParams: config.imageUploadParams,
      imageInsertButtons: config.imageInsertButtons,
      heightMin: config.heightMin,
      heightMax: config.heightMax
    });
  }

  /**
   * Initialize TinyMCE if available
   */
  function initTinyMCE(container, config) {
    tinymce.init({
      selector: `#${container.id}`,
      height: config.heightMin,
      max_height: config.heightMax,
      plugins: [
        'advlist autolink lists link image charmap print preview anchor',
        'searchreplace visualblocks code fullscreen',
        'insertdatetime media table paste code help wordcount'
      ],
      toolbar: 'undo redo | formatselect | bold italic backcolor | ' +
               'alignleft aligncenter alignright alignjustify | ' +
               'bullist numlist outdent indent | removeformat | help'
    });

    editorInstance = tinymce;
  }

  /**
   * Initialize a simple contenteditable-based editor
   */
  function initSimpleEditor(container) {
    // Create toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'email-editor-toolbar p-2 bg-gray-100 border border-gray-300 rounded-t-md flex flex-wrap gap-2';
    toolbar.innerHTML = `
      <button type="button" data-command="bold" class="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
        <i class="fas fa-bold"></i>
      </button>
      <button type="button" data-command="italic" class="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
        <i class="fas fa-italic"></i>
      </button>
      <button type="button" data-command="underline" class="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
        <i class="fas fa-underline"></i>
      </button>
      <select data-command="formatBlock" class="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
        <option value="p">Paragraph</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
      </select>
      <button type="button" data-command="insertImage" class="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
        <i class="fas fa-image"></i>
      </button>
      <button type="button" data-command="createLink" class="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
        <i class="fas fa-link"></i>
      </button>
    `;

    // Create editable content area
    const editorArea = document.createElement('div');
    editorArea.className = 'email-editor-content p-4 border border-gray-300 border-t-0 rounded-b-md min-h-[400px] max-h-[800px] overflow-y-auto';
    editorArea.setAttribute('contenteditable', 'true');

    // Add drag and drop content blocks container
    const contentBlocks = document.createElement('div');
    contentBlocks.className = 'email-editor-blocks p-2 bg-gray-100 border border-gray-300 rounded-md mt-4';
    contentBlocks.innerHTML = `
      <h3 class="text-sm font-medium text-gray-700 mb-2">Content Blocks</h3>
      <div class="grid grid-cols-2 gap-2">
        <div class="block-item p-2 bg-white border border-gray-300 rounded cursor-move" draggable="true" data-block-type="text">
          <i class="fas fa-font mr-2"></i> Text Block
        </div>
        <div class="block-item p-2 bg-white border border-gray-300 rounded cursor-move" draggable="true" data-block-type="image">
          <i class="fas fa-image mr-2"></i> Image
        </div>
        <div class="block-item p-2 bg-white border border-gray-300 rounded cursor-move" draggable="true" data-block-type="button">
          <i class="fas fa-mouse-pointer mr-2"></i> Button
        </div>
        <div class="block-item p-2 bg-white border border-gray-300 rounded cursor-move" draggable="true" data-block-type="divider">
          <i class="fas fa-minus mr-2"></i> Divider
        </div>
      </div>
    `;

    // Clear container and append editor elements
    container.innerHTML = '';
    container.appendChild(toolbar);
    container.appendChild(editorArea);
    container.appendChild(contentBlocks);

    // Setup simple toolbar functionality
    toolbar.querySelectorAll('button[data-command], select[data-command]').forEach(element => {
      element.addEventListener('click', function() {
        const command = this.getAttribute('data-command');
        if (command === 'insertImage') {
          const url = prompt('Enter image URL:');
          if (url) document.execCommand(command, false, url);
        } else if (command === 'createLink') {
          const url = prompt('Enter link URL:');
          if (url) document.execCommand(command, false, url);
        } else if (command === 'formatBlock') {
          document.execCommand(command, false, this.value);
        } else {
          document.execCommand(command, false, null);
        }
      });
    });

    // Set up drag and drop
    setupDragAndDrop(editorArea, contentBlocks);

    editorInstance = {
      getContent: () => editorArea.innerHTML,
      setContent: (content) => { editorArea.innerHTML = content; }
    };
  }

  /**
   * Set up drag and drop functionality for content blocks
   */
  function setupDragAndDrop(editorArea, blocksContainer) {
    const blockItems = blocksContainer.querySelectorAll('.block-item');

    blockItems.forEach(item => {
      item.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('text/plain', this.getAttribute('data-block-type'));
        e.dataTransfer.effectAllowed = 'copy';
      });
    });

    editorArea.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      this.classList.add('bg-gray-50');
    });

    editorArea.addEventListener('dragleave', function() {
      this.classList.remove('bg-gray-50');
    });

    editorArea.addEventListener('drop', function(e) {
      e.preventDefault();
      this.classList.remove('bg-gray-50');

      const blockType = e.dataTransfer.getData('text/plain');
      let blockHTML = '';

      switch (blockType) {
        case 'text':
          blockHTML = '<div class="editable-block"><p>Add your text here</p></div>';
          break;
        case 'image':
          blockHTML = '<div class="editable-block"><img src="https://placehold.co/600x400" alt="Placeholder" style="max-width: 100%;"></div>';
          break;
        case 'button':
          blockHTML = '<div class="editable-block"><a href="#" class="inline-block px-6 py-2 bg-indigo-600 text-white rounded">Click Here</a></div>';
          break;
        case 'divider':
          blockHTML = '<div class="editable-block"><hr class="my-4"></div>';
          break;
      }

      // Create a range at the drop point
      const range = document.caretRangeFromPoint(e.clientX, e.clientY);
      if (range) {
        range.insertNode(document.createTextNode(' ')); // Insert a temporary node
        const tempNode = range.startContainer;
        tempNode.parentNode.innerHTML += blockHTML; // Add the block HTML
      } else {
        this.innerHTML += blockHTML; // Fallback to appending at the end
      }
    });
  }

  /**
   * Set up event listeners for editor actions
   */
  function setupEventListeners() {
    // Will be implemented with more specific functionality
    document.addEventListener('emailEditorSave', handleSave);
  }

  /**
   * Handle save event
   */
  function handleSave(e) {
    const templateData = e.detail;
    if (templateData && window.EmailMarketing) {
      if (isEditing && currentTemplate) {
        // Update existing template
        window.EmailMarketing.updateTemplate(currentTemplate.id, {
          ...currentTemplate,
          content: getContent(),
          lastModified: new Date().toISOString()
        });
      } else {
        // Create new template
        window.EmailMarketing.createTemplate({
          name: templateData.name,
          category: templateData.category,
          subject: templateData.subject,
          content: getContent(),
          previewImage: templateData.previewImage || null
        });
      }
    }
  }

  /**
   * Get the editor content
   */
  function getContent() {
    if (!editorInstance) return '';

    if (typeof editorInstance.getContent === 'function') {
      return editorInstance.getContent();
    } else if (window.tinymce) {
      return tinymce.activeEditor.getContent();
    } else {
      return '';
    }
  }

  /**
   * Set the editor content
   */
  function setContent(content) {
    if (!editorInstance) return;

    if (typeof editorInstance.setContent === 'function') {
      editorInstance.setContent(content);
    } else if (window.tinymce) {
      tinymce.activeEditor.setContent(content);
    }
  }

  /**
   * Load a template for editing
   */
  function loadTemplate(template) {
    if (!template) return;

    currentTemplate = template;
    isEditing = true;
    setContent(template.content);
  }

  /**
   * Create a new blank template
   */
  function newTemplate() {
    currentTemplate = null;
    isEditing = false;
    setContent('');
  }

  // Public API
  return {
    init: init,
    getContent: getContent,
    setContent: setContent,
    loadTemplate: loadTemplate,
    newTemplate: newTemplate
  };
})();

// Make the module available globally
window.EmailEditor = EmailEditor;
