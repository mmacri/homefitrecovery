/**
 * Recovery Essentials - Content Scheduling and Publishing Workflow Module
 * This script handles content scheduling, workflow, revisions, and publishing automation
 */

// Storage keys
const SCHEDULED_CONTENT_KEY = 'recoveryEssentials_scheduledContent';
const CONTENT_REVISIONS_KEY = 'recoveryEssentials_contentRevisions';
const WORKFLOW_CONFIG_KEY = 'recoveryEssentials_workflowConfig';
const WORKFLOW_TASKS_KEY = 'recoveryEssentials_workflowTasks';

// Content types
const CONTENT_TYPES = {
  BLOG_POST: 'blog_post',
  PRODUCT: 'product',
  PAGE: 'page'
};

// Workflow status options
const WORKFLOW_STATUS = {
  DRAFT: 'draft',           // Initial draft status
  REVIEW: 'review',         // Pending review by editor
  REVISION: 'revision',     // Needs revisions
  APPROVED: 'approved',     // Approved, ready to publish
  PUBLISHED: 'published',   // Live content
  SCHEDULED: 'scheduled',   // Scheduled for future publishing
  ARCHIVED: 'archived'      // Archived (not published but saved)
};

// Default config
const DEFAULT_WORKFLOW_CONFIG = {
  requireApproval: true,    // Require editorial approval before publishing
  autoPublishScheduled: true, // Automatically publish scheduled content
  maxRevisionCount: 10,     // Maximum number of revisions to keep per content item
  notifyOnStatusChange: true, // Show notifications on status changes
  autosaveDrafts: true,     // Autosave drafts periodically
  autosaveInterval: 60,     // Autosave interval in seconds
  workflowEnabled: true     // Overall workflow system enabled/disabled
};

// Initialize Workflow Module
function initWorkflow() {
  // Initialize scheduled content storage if needed
  let scheduledContent = getScheduledContent();
  if (!scheduledContent) {
    scheduledContent = {};
    saveScheduledContent(scheduledContent);
  }

  // Initialize content revisions storage if needed
  let contentRevisions = getContentRevisions();
  if (!contentRevisions) {
    contentRevisions = {};
    saveContentRevisions(contentRevisions);
  }

  // Initialize workflow config if needed
  let workflowConfig = getWorkflowConfig();
  if (!workflowConfig) {
    workflowConfig = DEFAULT_WORKFLOW_CONFIG;
    saveWorkflowConfig(workflowConfig);
  }

  // Initialize workflow tasks if needed
  let workflowTasks = getWorkflowTasks();
  if (!workflowTasks) {
    workflowTasks = [];
    saveWorkflowTasks(workflowTasks);
  }

  // Set up scheduled content processing
  setupScheduledContentProcessor();

  // Set up autosave if enabled
  if (workflowConfig.autosaveDrafts) {
    setupAutosave(workflowConfig.autosaveInterval);
  }

  return workflowConfig;
}

/**
 * Schedule content for future publishing
 * @param {string} contentType - Type of content (blog_post, product, page)
 * @param {string} contentId - ID of the content
 * @param {Date} publishDate - Date and time to publish
 * @param {Object} metadata - Additional metadata about the scheduled content
 * @returns {Object} Scheduled content entry
 */
function scheduleContent(contentType, contentId, publishDate, metadata = {}) {
  // Validate inputs
  if (!contentType || !contentId || !publishDate) {
    console.error('Invalid scheduling parameters');
    return null;
  }

  // Convert to Date object if string
  if (typeof publishDate === 'string') {
    publishDate = new Date(publishDate);
  }

  // Ensure future date
  if (publishDate <= new Date()) {
    console.error('Schedule date must be in the future');
    return null;
  }

  // Create scheduled content entry
  const scheduledEntry = {
    id: generateScheduleId(contentType, contentId),
    contentType,
    contentId,
    publishDate: publishDate.toISOString(),
    status: WORKFLOW_STATUS.SCHEDULED,
    created: new Date().toISOString(),
    metadata
  };

  // Save to scheduled content storage
  const scheduledContent = getScheduledContent();
  scheduledContent[scheduledEntry.id] = scheduledEntry;
  saveScheduledContent(scheduledContent);

  // Create workflow task for this scheduled item
  createWorkflowTask(
    `Publish ${contentType}`,
    `Scheduled publishing of ${contentType} "${metadata.title || contentId}"`,
    new Date(publishDate),
    {
      type: 'publish_scheduled',
      contentType,
      contentId
    }
  );

  return scheduledEntry;
}

/**
 * Cancel scheduled content publishing
 * @param {string} scheduleId - ID of the scheduled content entry
 * @returns {boolean} Success status
 */
function cancelScheduledContent(scheduleId) {
  const scheduledContent = getScheduledContent();

  if (!scheduledContent[scheduleId]) {
    return false;
  }

  // Remove the scheduled entry
  delete scheduledContent[scheduleId];
  saveScheduledContent(scheduledContent);

  // Remove any associated workflow tasks
  removeWorkflowTasksForContent(scheduleId);

  return true;
}

/**
 * Update workflow status for content
 * @param {string} contentType - Type of content
 * @param {string} contentId - Content ID
 * @param {string} newStatus - New workflow status
 * @param {Object} metadata - Additional metadata about the status change
 * @returns {boolean} Success status
 */
function updateWorkflowStatus(contentType, contentId, newStatus, metadata = {}) {
  // Validate new status
  if (!Object.values(WORKFLOW_STATUS).includes(newStatus)) {
    console.error('Invalid workflow status:', newStatus);
    return false;
  }

  // Create status change record
  const statusChange = {
    contentType,
    contentId,
    previousStatus: metadata.previousStatus || 'unknown',
    newStatus,
    timestamp: new Date().toISOString(),
    userId: metadata.userId || getCurrentUserId(),
    comments: metadata.comments || ''
  };

  // If changing to scheduled, ensure we have a publishDate
  if (newStatus === WORKFLOW_STATUS.SCHEDULED && metadata.publishDate) {
    scheduleContent(contentType, contentId, metadata.publishDate, metadata);
  }

  // If changing from scheduled, remove scheduled entry
  if (statusChange.previousStatus === WORKFLOW_STATUS.SCHEDULED) {
    const scheduleId = generateScheduleId(contentType, contentId);
    cancelScheduledContent(scheduleId);
  }

  // Create workflow task based on new status
  let taskDueDate = new Date();
  taskDueDate.setDate(taskDueDate.getDate() + 3); // Default 3 days due date

  switch (newStatus) {
    case WORKFLOW_STATUS.REVIEW:
      createWorkflowTask(
        'Review Content',
        `Review ${contentType} "${metadata.title || contentId}"`,
        taskDueDate,
        { type: 'review', contentType, contentId }
      );
      break;
    case WORKFLOW_STATUS.REVISION:
      createWorkflowTask(
        'Make Revisions',
        `Make revisions to ${contentType} "${metadata.title || contentId}"`,
        taskDueDate,
        { type: 'revision', contentType, contentId }
      );
      break;
  }

  // Show notification if enabled
  const config = getWorkflowConfig();
  if (config.notifyOnStatusChange && metadata.showNotification !== false) {
    if (typeof showNotification === 'function') {
      showNotification(`Workflow status updated to "${newStatus}"`, 'info');
    }
  }

  return true;
}

/**
 * Save a content revision
 * @param {string} contentType - Type of content
 * @param {string} contentId - Content ID
 * @param {Object} contentData - Content data to save as revision
 * @param {string} revisionComment - Comment about the revision
 * @returns {Object} Saved revision
 */
function saveContentRevision(contentType, contentId, contentData, revisionComment = '') {
  const revisions = getContentRevisions();

  // Create content key
  const contentKey = `${contentType}_${contentId}`;

  // Initialize revisions array for this content if it doesn't exist
  if (!revisions[contentKey]) {
    revisions[contentKey] = [];
  }

  // Create revision object
  const revision = {
    id: generateId(),
    contentType,
    contentId,
    timestamp: new Date().toISOString(),
    data: contentData,
    comment: revisionComment,
    userId: getCurrentUserId()
  };

  // Add revision to the beginning of the array (newest first)
  revisions[contentKey].unshift(revision);

  // Limit number of revisions
  const config = getWorkflowConfig();
  if (revisions[contentKey].length > config.maxRevisionCount) {
    revisions[contentKey] = revisions[contentKey].slice(0, config.maxRevisionCount);
  }

  // Save revisions
  saveContentRevisions(revisions);

  return revision;
}

/**
 * Get content revisions
 * @param {string} contentType - Type of content
 * @param {string} contentId - Content ID
 * @returns {Array} Array of revisions, newest first
 */
function getContentRevisionsForItem(contentType, contentId) {
  const revisions = getContentRevisions();
  const contentKey = `${contentType}_${contentId}`;

  return revisions[contentKey] || [];
}

/**
 * Restore a specific revision
 * @param {string} contentType - Type of content
 * @param {string} contentId - Content ID
 * @param {string} revisionId - Revision ID to restore
 * @returns {Object|null} The restored revision data or null if not found
 */
function restoreRevision(contentType, contentId, revisionId) {
  const revisions = getContentRevisionsForItem(contentType, contentId);

  // Find the revision
  const revision = revisions.find(rev => rev.id === revisionId);

  if (!revision) {
    return null;
  }

  return revision.data;
}

/**
 * Create a workflow task
 * @param {string} title - Task title
 * @param {string} description - Task description
 * @param {Date} dueDate - Due date for the task
 * @param {Object} metadata - Additional metadata about the task
 * @returns {Object} Created task
 */
function createWorkflowTask(title, description, dueDate, metadata = {}) {
  const tasks = getWorkflowTasks();

  // Create task object
  const task = {
    id: generateId(),
    title,
    description,
    dueDate: dueDate.toISOString(),
    created: new Date().toISOString(),
    status: 'open',
    assignedTo: metadata.assignedTo || null,
    metadata
  };

  // Add task to list
  tasks.push(task);

  // Save tasks
  saveWorkflowTasks(tasks);

  return task;
}

/**
 * Update a workflow task
 * @param {string} taskId - Task ID
 * @param {Object} updates - Properties to update
 * @returns {Object|null} Updated task or null if not found
 */
function updateWorkflowTask(taskId, updates) {
  const tasks = getWorkflowTasks();
  const taskIndex = tasks.findIndex(task => task.id === taskId);

  if (taskIndex === -1) {
    return null;
  }

  // Update task
  tasks[taskIndex] = {...tasks[taskIndex], ...updates};

  // Save tasks
  saveWorkflowTasks(tasks);

  return tasks[taskIndex];
}

/**
 * Delete a workflow task
 * @param {string} taskId - Task ID to delete
 * @returns {boolean} Success status
 */
function deleteWorkflowTask(taskId) {
  let tasks = getWorkflowTasks();
  const initialLength = tasks.length;

  tasks = tasks.filter(task => task.id !== taskId);

  if (tasks.length === initialLength) {
    return false;
  }

  // Save updated tasks
  saveWorkflowTasks(tasks);

  return true;
}

/**
 * Remove all workflow tasks related to specific content
 * @param {string} contentIdentifier - Content identifier (type_id or scheduleId)
 * @returns {number} Number of tasks removed
 */
function removeWorkflowTasksForContent(contentIdentifier) {
  let tasks = getWorkflowTasks();
  const initialCount = tasks.length;

  tasks = tasks.filter(task => {
    // Check if task is related to this content
    if (task.metadata &&
        (task.metadata.contentId === contentIdentifier ||
         task.metadata.scheduleId === contentIdentifier)) {
      return false;
    }
    return true;
  });

  saveWorkflowTasks(tasks);

  return initialCount - tasks.length;
}

/**
 * Get all open workflow tasks
 * @returns {Array} Array of open tasks
 */
function getOpenWorkflowTasks() {
  const tasks = getWorkflowTasks();
  return tasks.filter(task => task.status === 'open');
}

/**
 * Get all tasks assigned to a user
 * @param {string} userId - User ID
 * @returns {Array} Array of assigned tasks
 */
function getTasksAssignedToUser(userId) {
  const tasks = getWorkflowTasks();
  return tasks.filter(task => task.assignedTo === userId);
}

/**
 * Get all scheduled content
 * @returns {Object} All scheduled content
 */
function getScheduledContent() {
  return JSON.parse(localStorage.getItem(SCHEDULED_CONTENT_KEY) || '{}');
}

/**
 * Save scheduled content
 * @param {Object} scheduledContent - Scheduled content to save
 */
function saveScheduledContent(scheduledContent) {
  localStorage.setItem(SCHEDULED_CONTENT_KEY, JSON.stringify(scheduledContent));
}

/**
 * Get all content revisions
 * @returns {Object} All content revisions
 */
function getContentRevisions() {
  return JSON.parse(localStorage.getItem(CONTENT_REVISIONS_KEY) || '{}');
}

/**
 * Save content revisions
 * @param {Object} contentRevisions - Content revisions to save
 */
function saveContentRevisions(contentRevisions) {
  localStorage.setItem(CONTENT_REVISIONS_KEY, JSON.stringify(contentRevisions));
}

/**
 * Get workflow configuration
 * @returns {Object} Workflow configuration
 */
function getWorkflowConfig() {
  return JSON.parse(localStorage.getItem(WORKFLOW_CONFIG_KEY) || JSON.stringify(DEFAULT_WORKFLOW_CONFIG));
}

/**
 * Save workflow configuration
 * @param {Object} workflowConfig - Workflow configuration to save
 */
function saveWorkflowConfig(workflowConfig) {
  localStorage.setItem(WORKFLOW_CONFIG_KEY, JSON.stringify(workflowConfig));
}

/**
 * Get all workflow tasks
 * @returns {Array} All workflow tasks
 */
function getWorkflowTasks() {
  return JSON.parse(localStorage.getItem(WORKFLOW_TASKS_KEY) || '[]');
}

/**
 * Save workflow tasks
 * @param {Array} workflowTasks - Workflow tasks to save
 */
function saveWorkflowTasks(workflowTasks) {
  localStorage.setItem(WORKFLOW_TASKS_KEY, JSON.stringify(workflowTasks));
}

/**
 * Generate a schedule ID
 * @param {string} contentType - Content type
 * @param {string} contentId - Content ID
 * @returns {string} Schedule ID
 */
function generateScheduleId(contentType, contentId) {
  return `schedule_${contentType}_${contentId}`;
}

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Get current user ID
 * @returns {string} Current user ID
 */
function getCurrentUserId() {
  try {
    const authData = JSON.parse(localStorage.getItem('recoveryEssentials_auth') || '{}');
    return authData.user?.id || 'unknown';
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return 'unknown';
  }
}

/**
 * Set up scheduled content processor
 */
function setupScheduledContentProcessor() {
  // Check for content ready to publish every minute
  setInterval(processScheduledContent, 60000);

  // Also check on initialization
  processScheduledContent();
}

/**
 * Process scheduled content
 */
function processScheduledContent() {
  // Skip if auto-publishing is disabled
  const config = getWorkflowConfig();
  if (!config.autoPublishScheduled) {
    return;
  }

  // Get all scheduled content
  const scheduledContent = getScheduledContent();
  const now = new Date();

  // Check each scheduled item
  Object.values(scheduledContent).forEach(item => {
    const publishDate = new Date(item.publishDate);

    // If publish date has passed, publish the content
    if (publishDate <= now) {
      publishScheduledContent(item);
    }
  });
}

/**
 * Publish scheduled content
 * @param {Object} scheduledItem - Scheduled content item
 */
function publishScheduledContent(scheduledItem) {
  console.log('Publishing scheduled content:', scheduledItem);

  // For blog posts
  if (scheduledItem.contentType === CONTENT_TYPES.BLOG_POST) {
    // Get blog post
    const posts = JSON.parse(localStorage.getItem('recoveryEssentials_blogPosts') || '[]');
    const postIndex = posts.findIndex(post => post.id === scheduledItem.contentId);

    if (postIndex !== -1) {
      // Update post status
      posts[postIndex].status = WORKFLOW_STATUS.PUBLISHED;
      posts[postIndex].publishedDate = new Date().toISOString();

      // Save updated posts
      localStorage.setItem('recoveryEssentials_blogPosts', JSON.stringify(posts));

      console.log('Published blog post:', posts[postIndex].title);
    }
  }

  // For other content types, implement similar logic

  // Remove from scheduled content
  const scheduleId = scheduledItem.id;
  cancelScheduledContent(scheduleId);

  // Create a record that this was auto-published
  createWorkflowTask(
    'Auto-Published Content',
    `Content "${scheduledItem.metadata.title || scheduledItem.contentId}" was automatically published as scheduled`,
    new Date(),
    {
      type: 'auto_published',
      contentType: scheduledItem.contentType,
      contentId: scheduledItem.contentId,
      status: 'completed'
    }
  );
}

/**
 * Set up autosave functionality
 * @param {number} intervalSeconds - Autosave interval in seconds
 */
function setupAutosave(intervalSeconds) {
  if (typeof window !== 'undefined') {
    window.autosaveInterval = setInterval(() => {
      // Check if we're in an editor
      if (document.getElementById('post-form')) {
        autosaveDraft();
      }
    }, intervalSeconds * 1000);
  }
}

/**
 * Autosave the current draft
 */
function autosaveDraft() {
  const postForm = document.getElementById('post-form');

  if (!postForm) {
    return;
  }

  const postId = document.getElementById('post-id').value;
  const title = document.getElementById('post-title').value;

  // Only autosave if there's at least a title
  if (!title) {
    return;
  }

  console.log('Autosaving draft...');

  // Get common post fields
  const status = WORKFLOW_STATUS.DRAFT;
  const slug = document.getElementById('post-slug').value;
  const template = document.getElementById('post-template').value;
  const content = document.getElementById('post-content').value;

  // Create or update autosave data
  const autosaveKey = postId ? `autosave_blog_post_${postId}` : 'autosave_blog_post_new';

  const autosaveData = {
    id: postId || 'new',
    title,
    slug,
    template,
    status,
    content,
    autosavedAt: new Date().toISOString()
  };

  // Save to localStorage
  localStorage.setItem(autosaveKey, JSON.stringify(autosaveData));

  // Show indicator that autosave happened
  const autosaveIndicator = document.getElementById('autosave-indicator');
  if (autosaveIndicator) {
    autosaveIndicator.textContent = `Autosaved at ${new Date().toLocaleTimeString()}`;
    autosaveIndicator.style.display = 'block';

    // Hide after 3 seconds
    setTimeout(() => {
      autosaveIndicator.style.display = 'none';
    }, 3000);
  }
}

/**
 * Check for autosaved content
 * @param {string} contentType - Content type
 * @param {string} contentId - Content ID (optional, for editing existing content)
 * @returns {Object|null} Autosaved content or null if none exists
 */
function checkForAutosavedContent(contentType, contentId) {
  const autosaveKey = contentId ?
    `autosave_${contentType}_${contentId}` :
    `autosave_${contentType}_new`;

  const autosaveData = localStorage.getItem(autosaveKey);

  if (!autosaveData) {
    return null;
  }

  try {
    return JSON.parse(autosaveData);
  } catch (error) {
    console.error('Error parsing autosaved content:', error);
    return null;
  }
}

/**
 * Clear autosaved content
 * @param {string} contentType - Content type
 * @param {string} contentId - Content ID (optional)
 */
function clearAutosavedContent(contentType, contentId) {
  const autosaveKey = contentId ?
    `autosave_${contentType}_${contentId}` :
    `autosave_${contentType}_new`;

  localStorage.removeItem(autosaveKey);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
  initWorkflow();
});

// Export functions
window.ContentWorkflow = {
  // Constants
  CONTENT_TYPES,
  WORKFLOW_STATUS,

  // Core functions
  getWorkflowConfig,
  saveWorkflowConfig,

  // Content scheduling
  scheduleContent,
  cancelScheduledContent,

  // Workflow status management
  updateWorkflowStatus,

  // Revisions
  saveContentRevision,
  getContentRevisionsForItem,
  restoreRevision,

  // Tasks
  createWorkflowTask,
  updateWorkflowTask,
  deleteWorkflowTask,
  getOpenWorkflowTasks,
  getTasksAssignedToUser,

  // Autosave
  checkForAutosavedContent,
  clearAutosavedContent
};
