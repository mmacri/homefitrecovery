/**
 * Email Workflow Builder - Visual workflow creation tool for email automation
 * This module provides a visual drag-and-drop interface for creating email workflows.
 */

// Define the EmailWorkflowBuilder module
const EmailWorkflowBuilder = (function() {
  // Private variables
  let canvas;
  let toolbar;
  let properties;
  let currentWorkflow = null;
  let draggingElement = null;
  let selectedNode = null;
  let nodes = [];
  let connections = [];
  let nextNodeId = 1;

  /**
   * Initialize the workflow builder
   * @param {Object} containers - DOM elements for the builder
   */
  function init(containers) {
    if (!containers || !containers.canvas || !containers.toolbar || !containers.properties) {
      console.error('Container elements are required for the workflow builder');
      return;
    }

    canvas = containers.canvas;
    toolbar = containers.toolbar;
    properties = containers.properties;

    // Set up the canvas
    setupCanvas();

    // Set up the toolbar
    setupToolbar();

    // Set up the properties panel
    setupProperties();

    // Set up event handlers
    setupEventHandlers();

    console.log('Email Workflow Builder initialized');
  }

  /**
   * Set up the canvas for workflow editing
   */
  function setupCanvas() {
    canvas.classList.add('workflow-canvas');
    canvas.innerHTML = `
      <div class="workflow-canvas-inner">
        <div class="workflow-grid"></div>
        <div class="workflow-nodes"></div>
        <svg class="workflow-connections"></svg>
      </div>
    `;
  }

  /**
   * Set up the toolbar with available node types
   */
  function setupToolbar() {
    toolbar.classList.add('workflow-toolbar');
    toolbar.innerHTML = `
      <div class="workflow-toolbar-title">Elements</div>
      <div class="workflow-toolbar-items">
        <div class="workflow-toolbar-item" draggable="true" data-node-type="trigger">
          <i class="fas fa-play-circle"></i>
          <span>Trigger</span>
        </div>
        <div class="workflow-toolbar-item" draggable="true" data-node-type="email">
          <i class="fas fa-envelope"></i>
          <span>Send Email</span>
        </div>
        <div class="workflow-toolbar-item" draggable="true" data-node-type="condition">
          <i class="fas fa-question-circle"></i>
          <span>Condition</span>
        </div>
        <div class="workflow-toolbar-item" draggable="true" data-node-type="delay">
          <i class="fas fa-clock"></i>
          <span>Delay</span>
        </div>
        <div class="workflow-toolbar-item" draggable="true" data-node-type="action">
          <i class="fas fa-bolt"></i>
          <span>Action</span>
        </div>
      </div>
    `;
  }

  /**
   * Set up the properties panel
   */
  function setupProperties() {
    properties.classList.add('workflow-properties');
    properties.innerHTML = `
      <div class="workflow-properties-title">Properties</div>
      <div class="workflow-properties-content">
        <div class="workflow-properties-empty">
          Select an element to view and edit its properties
        </div>
      </div>
    `;
  }

  /**
   * Set up event handlers for drag and drop, selection, etc.
   */
  function setupEventHandlers() {
    // Toolbar drag start
    const toolbarItems = toolbar.querySelectorAll('.workflow-toolbar-item');
    toolbarItems.forEach(item => {
      item.addEventListener('dragstart', handleToolbarDragStart);
    });

    // Canvas drag and drop
    const canvasInner = canvas.querySelector('.workflow-canvas-inner');
    canvasInner.addEventListener('dragover', handleCanvasDragOver);
    canvasInner.addEventListener('drop', handleCanvasDrop);
    canvasInner.addEventListener('click', handleCanvasClick);

    // Properties panel events will be set up when a node is selected
  }

  /**
   * Handle dragstart event on toolbar items
   * @param {Event} e - The drag event
   */
  function handleToolbarDragStart(e) {
    const nodeType = e.target.getAttribute('data-node-type');
    e.dataTransfer.setData('application/workflow-node-type', nodeType);
    e.dataTransfer.effectAllowed = 'copy';
    draggingElement = e.target;
  }

  /**
   * Handle dragover event on canvas
   * @param {Event} e - The drag event
   */
  function handleCanvasDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }

  /**
   * Handle drop event on canvas
   * @param {Event} e - The drop event
   */
  function handleCanvasDrop(e) {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData('application/workflow-node-type');
    if (!nodeType) return;

    // Create a new node
    const nodeId = `node_${nextNodeId++}`;
    const rect = canvas.getBoundingClientRect();
    const node = {
      id: nodeId,
      type: nodeType,
      label: getDefaultLabelForType(nodeType),
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      properties: getDefaultPropertiesForType(nodeType)
    };

    nodes.push(node);

    // Add the node to the canvas
    addNodeToCanvas(node);

    // Select the new node
    selectNode(nodeId);
  }

  /**
   * Handle click event on canvas
   * @param {Event} e - The click event
   */
  function handleCanvasClick(e) {
    const target = e.target;

    // Check if a node was clicked
    const nodeElement = target.closest('.workflow-node');
    if (nodeElement) {
      const nodeId = nodeElement.getAttribute('data-node-id');
      selectNode(nodeId);
    } else {
      // Click on empty canvas, deselect
      deselectNode();
    }
  }

  /**
   * Add a node to the canvas
   * @param {Object} node - The node data
   */
  function addNodeToCanvas(node) {
    const nodesContainer = canvas.querySelector('.workflow-nodes');

    const nodeElement = document.createElement('div');
    nodeElement.className = `workflow-node workflow-node-${node.type}`;
    nodeElement.setAttribute('data-node-id', node.id);
    nodeElement.style.left = `${node.x}px`;
    nodeElement.style.top = `${node.y}px`;

    nodeElement.innerHTML = `
      <div class="workflow-node-header">
        <span class="workflow-node-title">${node.label}</span>
      </div>
      <div class="workflow-node-body">
        ${getNodeBodyContent(node)}
      </div>
      <div class="workflow-node-connectors">
        <div class="workflow-node-connector workflow-node-input" data-connector-type="input"></div>
        <div class="workflow-node-connector workflow-node-output" data-connector-type="output"></div>
      </div>
    `;

    // Make node draggable
    nodeElement.setAttribute('draggable', 'true');
    nodeElement.addEventListener('dragstart', handleNodeDragStart);
    nodeElement.addEventListener('dragend', handleNodeDragEnd);

    // Add connector handlers
    const connectors = nodeElement.querySelectorAll('.workflow-node-connector');
    connectors.forEach(connector => {
      connector.addEventListener('mousedown', handleConnectorMouseDown);
      connector.addEventListener('mouseup', handleConnectorMouseUp);
    });

    nodesContainer.appendChild(nodeElement);
  }

  /**
   * Handle dragstart event on nodes
   * @param {Event} e - The drag event
   */
  function handleNodeDragStart(e) {
    const nodeId = e.target.getAttribute('data-node-id');
    e.dataTransfer.setData('application/workflow-node-id', nodeId);
    e.dataTransfer.effectAllowed = 'move';

    // Add a class to style the node while dragging
    e.target.classList.add('dragging');
  }

  /**
   * Handle dragend event on nodes
   * @param {Event} e - The drag event
   */
  function handleNodeDragEnd(e) {
    e.target.classList.remove('dragging');
  }

  /**
   * Handle mousedown event on connectors
   * @param {Event} e - The mouse event
   */
  function handleConnectorMouseDown(e) {
    // Start drawing a connection line
    // Implementation will depend on the visual representation of connections
  }

  /**
   * Handle mouseup event on connectors
   * @param {Event} e - The mouse event
   */
  function handleConnectorMouseUp(e) {
    // Complete drawing a connection line
    // Implementation will depend on the visual representation of connections
  }

  /**
   * Select a node
   * @param {string} nodeId - The ID of the node to select
   */
  function selectNode(nodeId) {
    // Deselect previous node
    deselectNode();

    // Find the node data
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Select the node
    selectedNode = node;

    // Add selected class to the node element
    const nodeElement = canvas.querySelector(`.workflow-node[data-node-id="${nodeId}"]`);
    if (nodeElement) {
      nodeElement.classList.add('selected');
    }

    // Update properties panel
    updatePropertiesPanel(node);
  }

  /**
   * Deselect the currently selected node
   */
  function deselectNode() {
    if (selectedNode) {
      const nodeElement = canvas.querySelector(`.workflow-node[data-node-id="${selectedNode.id}"]`);
      if (nodeElement) {
        nodeElement.classList.remove('selected');
      }

      selectedNode = null;

      // Clear properties panel
      properties.querySelector('.workflow-properties-content').innerHTML = `
        <div class="workflow-properties-empty">
          Select an element to view and edit its properties
        </div>
      `;
    }
  }

  /**
   * Update the properties panel for a node
   * @param {Object} node - The node data
   */
  function updatePropertiesPanel(node) {
    const content = properties.querySelector('.workflow-properties-content');

    // Generate properties form based on node type
    let html = `
      <div class="workflow-property">
        <label>Name</label>
        <input type="text" class="workflow-property-input" data-property="label" value="${node.label}">
      </div>
    `;

    // Add type-specific properties
    switch (node.type) {
      case 'trigger':
        html += `
          <div class="workflow-property">
            <label>Trigger Type</label>
            <select class="workflow-property-input" data-property="triggerType">
              <option value="event" ${node.properties.triggerType === 'event' ? 'selected' : ''}>Event</option>
              <option value="schedule" ${node.properties.triggerType === 'schedule' ? 'selected' : ''}>Schedule</option>
            </select>
          </div>
          <div class="workflow-property trigger-event-property" style="display: ${node.properties.triggerType === 'event' ? 'block' : 'none'}">
            <label>Event</label>
            <select class="workflow-property-input" data-property="event">
              <option value="customerCreated" ${node.properties.event === 'customerCreated' ? 'selected' : ''}>Customer Created</option>
              <option value="orderPlaced" ${node.properties.event === 'orderPlaced' ? 'selected' : ''}>Order Placed</option>
              <option value="cartAbandoned" ${node.properties.event === 'cartAbandoned' ? 'selected' : ''}>Cart Abandoned</option>
            </select>
          </div>
          <div class="workflow-property trigger-schedule-property" style="display: ${node.properties.triggerType === 'schedule' ? 'block' : 'none'}">
            <label>Frequency</label>
            <select class="workflow-property-input" data-property="frequency">
              <option value="daily" ${node.properties.frequency === 'daily' ? 'selected' : ''}>Daily</option>
              <option value="weekly" ${node.properties.frequency === 'weekly' ? 'selected' : ''}>Weekly</option>
              <option value="monthly" ${node.properties.frequency === 'monthly' ? 'selected' : ''}>Monthly</option>
            </select>
          </div>
        `;
        break;

      case 'email':
        html += `
          <div class="workflow-property">
            <label>Email Template</label>
            <select class="workflow-property-input" data-property="templateId">
              ${getTemplateOptions(node.properties.templateId)}
            </select>
          </div>
          <div class="workflow-property">
            <label>Subject</label>
            <input type="text" class="workflow-property-input" data-property="subject" value="${node.properties.subject || ''}">
          </div>
        `;
        break;

      case 'condition':
        html += `
          <div class="workflow-property">
            <label>Condition Type</label>
            <select class="workflow-property-input" data-property="conditionType">
              <option value="openedEmail" ${node.properties.conditionType === 'openedEmail' ? 'selected' : ''}>Opened Email</option>
              <option value="clickedLink" ${node.properties.conditionType === 'clickedLink' ? 'selected' : ''}>Clicked Link</option>
              <option value="madeAPurchase" ${node.properties.conditionType === 'madeAPurchase' ? 'selected' : ''}>Made a Purchase</option>
            </select>
          </div>
        `;
        break;

      case 'delay':
        html += `
          <div class="workflow-property">
            <label>Delay Duration</label>
            <div class="workflow-property-group">
              <input type="number" class="workflow-property-input" data-property="delayValue" value="${node.properties.delayValue || 1}" min="1" style="width: 80px">
              <select class="workflow-property-input" data-property="delayUnit">
                <option value="minutes" ${node.properties.delayUnit === 'minutes' ? 'selected' : ''}>Minutes</option>
                <option value="hours" ${node.properties.delayUnit === 'hours' ? 'selected' : ''}>Hours</option>
                <option value="days" ${node.properties.delayUnit === 'days' ? 'selected' : ''}>Days</option>
                <option value="weeks" ${node.properties.delayUnit === 'weeks' ? 'selected' : ''}>Weeks</option>
              </select>
            </div>
          </div>
        `;
        break;

      case 'action':
        html += `
          <div class="workflow-property">
            <label>Action Type</label>
            <select class="workflow-property-input" data-property="actionType">
              <option value="addTag" ${node.properties.actionType === 'addTag' ? 'selected' : ''}>Add Tag</option>
              <option value="updateProperty" ${node.properties.actionType === 'updateProperty' ? 'selected' : ''}>Update Property</option>
              <option value="webhook" ${node.properties.actionType === 'webhook' ? 'selected' : ''}>Webhook</option>
            </select>
          </div>
        `;
        break;
    }

    content.innerHTML = html;

    // Add event listeners to property inputs
    const inputs = content.querySelectorAll('.workflow-property-input');
    inputs.forEach(input => {
      input.addEventListener('change', function() {
        updateNodeProperty(node.id, this.getAttribute('data-property'), this.value);
      });
    });

    // Special handler for trigger type change
    const triggerTypeSelect = content.querySelector('select[data-property="triggerType"]');
    if (triggerTypeSelect) {
      triggerTypeSelect.addEventListener('change', function() {
        const eventProps = content.querySelector('.trigger-event-property');
        const scheduleProps = content.querySelector('.trigger-schedule-property');

        if (this.value === 'event') {
          eventProps.style.display = 'block';
          scheduleProps.style.display = 'none';
        } else {
          eventProps.style.display = 'none';
          scheduleProps.style.display = 'block';
        }
      });
    }
  }

  /**
   * Update a property of a node
   * @param {string} nodeId - The ID of the node
   * @param {string} property - The property name
   * @param {any} value - The new property value
   */
  function updateNodeProperty(nodeId, property, value) {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Handle special properties
    if (property === 'label') {
      node.label = value;

      // Update the node element
      const nodeElement = canvas.querySelector(`.workflow-node[data-node-id="${nodeId}"]`);
      if (nodeElement) {
        const titleElement = nodeElement.querySelector('.workflow-node-title');
        if (titleElement) {
          titleElement.textContent = value;
        }
      }
    } else {
      // Other properties go into the properties object
      node.properties[property] = value;
    }
  }

  /**
   * Get default label for a node type
   * @param {string} type - The node type
   * @returns {string} - The default label
   */
  function getDefaultLabelForType(type) {
    switch (type) {
      case 'trigger': return 'Trigger';
      case 'email': return 'Send Email';
      case 'condition': return 'Condition';
      case 'delay': return 'Delay';
      case 'action': return 'Action';
      default: return 'Node';
    }
  }

  /**
   * Get default properties for a node type
   * @param {string} type - The node type
   * @returns {Object} - The default properties
   */
  function getDefaultPropertiesForType(type) {
    switch (type) {
      case 'trigger':
        return {
          triggerType: 'event',
          event: 'customerCreated',
          frequency: 'daily'
        };
      case 'email':
        return {
          templateId: '',
          subject: 'Email Subject'
        };
      case 'condition':
        return {
          conditionType: 'openedEmail',
          value: true
        };
      case 'delay':
        return {
          delayValue: 1,
          delayUnit: 'days'
        };
      case 'action':
        return {
          actionType: 'addTag',
          value: ''
        };
      default:
        return {};
    }
  }

  /**
   * Get HTML content for a node body
   * @param {Object} node - The node data
   * @returns {string} - The HTML content
   */
  function getNodeBodyContent(node) {
    switch (node.type) {
      case 'trigger':
        return node.properties.triggerType === 'event'
          ? `<div>Event: ${node.properties.event}</div>`
          : `<div>Schedule: ${node.properties.frequency}</div>`;
      case 'email':
        return `<div>Template: ${getTemplateName(node.properties.templateId)}</div>`;
      case 'condition':
        return `<div>If: ${node.properties.conditionType}</div>`;
      case 'delay':
        return `<div>Wait: ${node.properties.delayValue} ${node.properties.delayUnit}</div>`;
      case 'action':
        return `<div>Action: ${node.properties.actionType}</div>`;
      default:
        return '';
    }
  }

  /**
   * Get template options HTML
   * @param {string} selectedId - The currently selected template ID
   * @returns {string} - The HTML options
   */
  function getTemplateOptions(selectedId) {
    if (!window.EmailMarketing) return '<option value="">No templates available</option>';

    const templates = window.EmailMarketing.getTemplates();
    if (!templates || templates.length === 0) {
      return '<option value="">No templates available</option>';
    }

    return templates.map(template =>
      `<option value="${template.id}" ${template.id === selectedId ? 'selected' : ''}>${template.name}</option>`
    ).join('');
  }

  /**
   * Get template name by ID
   * @param {string} templateId - The template ID
   * @returns {string} - The template name
   */
  function getTemplateName(templateId) {
    if (!window.EmailMarketing || !templateId) return 'None';

    const templates = window.EmailMarketing.getTemplates();
    const template = templates.find(t => t.id === templateId);

    return template ? template.name : 'Unknown';
  }

  /**
   * Load a workflow into the builder
   * @param {Object} workflow - The workflow data
   */
  function loadWorkflow(workflow) {
    if (!workflow) return;

    // Clear current workflow
    clearWorkflow();

    // Set current workflow
    currentWorkflow = workflow;

    // Add nodes to canvas
    if (workflow.steps) {
      workflow.steps.forEach(step => {
        const node = {
          id: step.id,
          type: step.type,
          label: step.name,
          x: step.x || 100,
          y: step.y || 100,
          properties: { ...step }
        };

        nodes.push(node);
        addNodeToCanvas(node);
      });
    }

    // Add connections
    if (workflow.connections) {
      workflow.connections.forEach(connection => {
        connections.push(connection);
        addConnectionToCanvas(connection);
      });
    }
  }

  /**
   * Clear the current workflow
   */
  function clearWorkflow() {
    // Clear nodes and connections
    nodes = [];
    connections = [];

    // Clear the UI
    const nodesContainer = canvas.querySelector('.workflow-nodes');
    const connectionsContainer = canvas.querySelector('.workflow-connections');

    nodesContainer.innerHTML = '';
    connectionsContainer.innerHTML = '';

    // Reset selected node
    selectedNode = null;

    // Clear properties panel
    properties.querySelector('.workflow-properties-content').innerHTML = `
      <div class="workflow-properties-empty">
        Select an element to view and edit its properties
      </div>
    `;
  }

  /**
   * Add a connection to the canvas
   * @param {Object} connection - The connection data
   */
  function addConnectionToCanvas(connection) {
    // Implementation depends on the visual representation of connections
    // This is a placeholder for the actual implementation
  }

  /**
   * Save the current workflow
   * @returns {Object} - The workflow data
   */
  function saveWorkflow() {
    if (!currentWorkflow) {
      currentWorkflow = {
        id: 'workflow_' + Date.now(),
        name: 'New Workflow',
        description: '',
        createdAt: new Date().toISOString()
      };
    }

    // Update workflow with current nodes and connections
    currentWorkflow.steps = nodes.map(node => ({
      id: node.id,
      type: node.type,
      name: node.label,
      x: node.x,
      y: node.y,
      ...node.properties
    }));

    currentWorkflow.connections = [...connections];
    currentWorkflow.lastUpdated = new Date().toISOString();

    // If we have the EmailAutomation module, save it there
    if (window.EmailAutomation) {
      if (currentWorkflow.id.startsWith('workflow_')) {
        // This is a new workflow
        window.EmailAutomation.createWorkflow(currentWorkflow);
      } else {
        // This is an existing workflow
        window.EmailAutomation.updateWorkflow(currentWorkflow.id, currentWorkflow);
      }
    }

    return currentWorkflow;
  }

  // Public API
  return {
    init: init,
    loadWorkflow: loadWorkflow,
    saveWorkflow: saveWorkflow,
    clearWorkflow: clearWorkflow
  };
})();

// Make the module available globally
window.EmailWorkflowBuilder = EmailWorkflowBuilder;
