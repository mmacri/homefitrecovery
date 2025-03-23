// Add after document ready function and initialization code

// Initialize content workflow integration
function initWorkflowIntegration() {
    // Check if the ContentWorkflow module is available
    if (!window.ContentWorkflow) {
        console.error('Content Workflow module not loaded');
        return;
    }

    // Set up event listeners for workflow controls
    const workflowBtn = document.getElementById('workflow-btn');
    if (workflowBtn) {
        workflowBtn.addEventListener('click', openWorkflowModal);
    }

    const closeWorkflowModalBtn = document.getElementById('close-workflow-modal-btn');
    if (closeWorkflowModalBtn) {
        closeWorkflowModalBtn.addEventListener('click', closeWorkflowModal);
    }

    const cancelWorkflowBtn = document.getElementById('cancel-workflow-btn');
    if (cancelWorkflowBtn) {
        cancelWorkflowBtn.addEventListener('click', closeWorkflowModal);
    }

    const saveWorkflowBtn = document.getElementById('save-workflow-btn');
    if (saveWorkflowBtn) {
        saveWorkflowBtn.addEventListener('click', saveWorkflowChanges);
    }

    // Set up event listeners for revision history
    const showRevisionsBtn = document.getElementById('show-revisions-btn');
    if (showRevisionsBtn) {
        showRevisionsBtn.addEventListener('click', openRevisionsModal);
    }

    const closeRevisionsModalBtn = document.getElementById('close-revisions-modal-btn');
    if (closeRevisionsModalBtn) {
        closeRevisionsModalBtn.addEventListener('click', closeRevisionsModal);
    }

    const closeRevisionsBtn = document.getElementById('close-revisions-btn');
    if (closeRevisionsBtn) {
        closeRevisionsBtn.addEventListener('click', closeRevisionsModal);
    }

    const saveRevisionBtn = document.getElementById('save-revision-btn');
    if (saveRevisionBtn) {
        saveRevisionBtn.addEventListener('click', saveCurrentRevision);
    }

    // Add workflow status listener
    const workflowStatus = document.getElementById('workflow-status');
    if (workflowStatus) {
        workflowStatus.addEventListener('change', handleWorkflowStatusChange);
    }

    // Add post status listener to handle scheduled content
    const postStatus = document.getElementById('post-status');
    if (postStatus) {
        postStatus.addEventListener('change', function() {
            const scheduledDatetimeContainer = document.getElementById('scheduled-datetime-container');
            if (this.value === 'scheduled') {
                scheduledDatetimeContainer.classList.remove('hidden');

                // Set minimum date to now
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');

                const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
                document.getElementById('scheduled-datetime').min = minDateTime;

                // Set default value to tomorrow at same time
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const tYear = tomorrow.getFullYear();
                const tMonth = String(tomorrow.getMonth() + 1).padStart(2, '0');
                const tDay = String(tomorrow.getDate()).padStart(2, '0');

                const defaultDateTime = `${tYear}-${tMonth}-${tDay}T${hours}:${minutes}`;
                document.getElementById('scheduled-datetime').value = defaultDateTime;
            } else {
                scheduledDatetimeContainer.classList.add('hidden');
            }
        });
    }

    // Check for autosaved content
    checkForAutosavedContent();
}

/**
 * Open the workflow modal
 */
function openWorkflowModal() {
    const workflowModal = document.getElementById('workflow-modal');
    if (!workflowModal) return;

    // Get current post status
    const currentStatus = document.getElementById('post-status').value;

    // Update the current status display
    const currentWorkflowStatus = document.getElementById('current-workflow-status');
    currentWorkflowStatus.textContent = formatStatusLabel(currentStatus);
    currentWorkflowStatus.className = `inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColorClass(currentStatus)}`;

    // Set the workflow status dropdown to current value
    document.getElementById('workflow-status').value = currentStatus;

    // Trigger the change event to show/hide schedule container
    handleWorkflowStatusChange();

    // Show the modal
    workflowModal.classList.remove('hidden');
}

/**
 * Close the workflow modal
 */
function closeWorkflowModal() {
    const workflowModal = document.getElementById('workflow-modal');
    if (workflowModal) {
        workflowModal.classList.add('hidden');
    }
}

/**
 * Handle workflow status change
 */
function handleWorkflowStatusChange() {
    const workflowStatus = document.getElementById('workflow-status');
    const workflowScheduleContainer = document.getElementById('workflow-schedule-container');

    if (workflowStatus.value === 'scheduled') {
        workflowScheduleContainer.classList.remove('hidden');

        // Set minimum date to now
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        document.getElementById('workflow-schedule-date').min = minDateTime;

        // Set default value to tomorrow at same time
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tYear = tomorrow.getFullYear();
        const tMonth = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const tDay = String(tomorrow.getDate()).padStart(2, '0');

        const defaultDateTime = `${tYear}-${tMonth}-${tDay}T${hours}:${minutes}`;
        document.getElementById('workflow-schedule-date').value = defaultDateTime;
    } else {
        workflowScheduleContainer.classList.add('hidden');
    }
}

/**
 * Save workflow changes
 */
function saveWorkflowChanges() {
    // Get form values
    const newStatus = document.getElementById('workflow-status').value;
    const workflowComment = document.getElementById('workflow-comment').value;
    const postId = document.getElementById('post-id').value;
    const postTitle = document.getElementById('post-title').value;

    // Get current status
    const currentStatus = document.getElementById('post-status').value;

    // Create metadata
    const metadata = {
        previousStatus: currentStatus,
        title: postTitle,
        comments: workflowComment,
        showNotification: true
    };

    // If scheduled, add publish date
    if (newStatus === 'scheduled') {
        const scheduleDate = document.getElementById('workflow-schedule-date').value;
        if (!scheduleDate) {
            showNotification('Please select a schedule date and time', 'error');
            return;
        }
        metadata.publishDate = new Date(scheduleDate);
    }

    // Update workflow status
    if (window.ContentWorkflow) {
        window.ContentWorkflow.updateWorkflowStatus(
            'blog_post',
            postId || 'new',
            newStatus,
            metadata
        );
    }

    // Update post status in the form
    document.getElementById('post-status').value = newStatus;

    // If status is scheduled, update the scheduled datetime
    if (newStatus === 'scheduled' && metadata.publishDate) {
        const scheduledInput = document.getElementById('scheduled-datetime');
        if (scheduledInput) {
            const dateString = metadata.publishDate.toISOString().slice(0, 16);
            scheduledInput.value = dateString;
            document.getElementById('scheduled-datetime-container').classList.remove('hidden');
        }
    }

    // If the new status is published, publish the post
    if (newStatus === 'published') {
        savePost();
    }

    // Close the modal
    closeWorkflowModal();

    // Show a confirmation message
    showNotification(`Post status changed to ${formatStatusLabel(newStatus)}`, 'success');
}

/**
 * Open the revisions modal
 */
function openRevisionsModal() {
    const revisionsModal = document.getElementById('revisions-modal');
    if (!revisionsModal) return;

    const postId = document.getElementById('post-id').value;

    // If no post ID, this is a new post
    if (!postId) {
        showNotification('Save the post first to view revision history', 'info');
        return;
    }

    // Load revisions
    loadRevisionHistory(postId);

    // Show the modal
    revisionsModal.classList.remove('hidden');
}

/**
 * Close the revisions modal
 */
function closeRevisionsModal() {
    const revisionsModal = document.getElementById('revisions-modal');
    if (revisionsModal) {
        revisionsModal.classList.add('hidden');
    }
}

/**
 * Load revision history
 * @param {string} postId - Post ID
 */
function loadRevisionHistory(postId) {
    if (!window.ContentWorkflow) return;

    const revisions = window.ContentWorkflow.getContentRevisionsForItem('blog_post', postId);
    const revisionsList = document.getElementById('revisions-list');

    if (revisions.length === 0) {
        revisionsList.innerHTML = '<div class="text-center text-gray-500 py-10">No revisions available</div>';
        return;
    }

    let html = '<div class="space-y-4">';

    revisions.forEach((revision, index) => {
        const date = new Date(revision.timestamp);
        const formattedDate = date.toLocaleString();

        html += `
            <div class="border border-gray-200 rounded-md p-4 ${index === 0 ? 'bg-blue-50' : 'bg-white'}">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h4 class="font-medium text-gray-900">${formattedDate}</h4>
                        <p class="text-sm text-gray-500">By: ${revision.userId}</p>
                    </div>
                    <div>
                        <button type="button" class="text-indigo-600 hover:text-indigo-800 text-sm restore-revision-btn" data-revision-id="${revision.id}">
                            Restore This Version
                        </button>
                    </div>
                </div>
                ${revision.comment ? `<p class="text-sm text-gray-700 mt-2 p-2 bg-gray-50 rounded italic">${revision.comment}</p>` : ''}
            </div>
        `;
    });

    html += '</div>';
    revisionsList.innerHTML = html;

    // Add event listeners to restore buttons
    const restoreButtons = revisionsList.querySelectorAll('.restore-revision-btn');
    restoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            const revisionId = this.getAttribute('data-revision-id');
            restoreRevision(postId, revisionId);
        });
    });
}

/**
 * Restore a revision
 * @param {string} postId - Post ID
 * @param {string} revisionId - Revision ID
 */
function restoreRevision(postId, revisionId) {
    if (!window.ContentWorkflow) return;

    // Get the revision data
    const revisionData = window.ContentWorkflow.restoreRevision('blog_post', postId, revisionId);

    if (!revisionData) {
        showNotification('Failed to restore revision', 'error');
        return;
    }

    // Populate form with revision data
    if (revisionData.title) document.getElementById('post-title').value = revisionData.title;
    if (revisionData.slug) document.getElementById('post-slug').value = revisionData.slug;
    if (revisionData.template) document.getElementById('post-template').value = revisionData.template;
    if (revisionData.content) {
        const editor = document.getElementById('blog-editor');
        if (editor) editor.innerHTML = revisionData.content;
        document.getElementById('post-content').value = revisionData.content;
    }
    if (revisionData.excerpt) document.getElementById('post-excerpt').value = revisionData.excerpt;
    if (revisionData.imageUrl) document.getElementById('post-image').value = revisionData.imageUrl;
    if (revisionData.seoTitle) document.getElementById('seo-title').value = revisionData.seoTitle;
    if (revisionData.seoDescription) document.getElementById('seo-description').value = revisionData.seoDescription;

    // Close the modal
    closeRevisionsModal();

    // Show a confirmation message
    showNotification('Revision restored successfully', 'success');
}

/**
 * Save current revision
 */
function saveCurrentRevision() {
    if (!window.ContentWorkflow) return;

    const postId = document.getElementById('post-id').value;

    // If no post ID, this is a new post - need to save first
    if (!postId) {
        showNotification('Save the post first to create a revision', 'info');
        return;
    }

    // Get current post data
    const title = document.getElementById('post-title').value;
    const slug = document.getElementById('post-slug').value;
    const template = document.getElementById('post-template').value;
    const status = document.getElementById('post-status').value;
    const content = document.getElementById('post-content').value;
    const excerpt = document.getElementById('post-excerpt').value;
    const imageUrl = document.getElementById('post-image').value;
    const seoTitle = document.getElementById('seo-title').value;
    const seoDescription = document.getElementById('seo-description').value;

    // Prompt for revision comment
    const revisionComment = prompt('Enter a comment for this revision (optional):');

    // Create post object for revision
    const postData = {
        id: postId,
        title,
        slug,
        template,
        status,
        content,
        excerpt,
        imageUrl,
        seoTitle,
        seoDescription,
        revisionDate: new Date().toISOString()
    };

    // Save the revision
    const revision = window.ContentWorkflow.saveContentRevision(
        'blog_post',
        postId,
        postData,
        revisionComment || ''
    );

    if (revision) {
        showNotification('Revision saved successfully', 'success');

        // Update last saved time
        const revisionStatus = document.getElementById('revision-status');
        const lastSavedTime = document.getElementById('last-saved-time');

        if (revisionStatus && lastSavedTime) {
            revisionStatus.classList.remove('hidden');
            lastSavedTime.textContent = new Date().toLocaleTimeString();
        }
    } else {
        showNotification('Failed to save revision', 'error');
    }
}

/**
 * Check for autosaved content
 */
function checkForAutosavedContent() {
    if (!window.ContentWorkflow) return;

    const postId = document.getElementById('post-id').value;
    const autosaved = window.ContentWorkflow.checkForAutosavedContent('blog_post', postId || 'new');

    if (autosaved) {
        const isRecover = confirm(`Found autosaved content from ${new Date(autosaved.autosavedAt).toLocaleString()}. Would you like to recover it?`);

        if (isRecover) {
            // Restore autosaved content
            if (autosaved.title) document.getElementById('post-title').value = autosaved.title;
            if (autosaved.slug) document.getElementById('post-slug').value = autosaved.slug;
            if (autosaved.template) document.getElementById('post-template').value = autosaved.template;
            if (autosaved.content) {
                const editor = document.getElementById('blog-editor');
                if (editor) editor.innerHTML = autosaved.content;
                document.getElementById('post-content').value = autosaved.content;
            }

            showNotification('Autosaved content recovered', 'success');
        } else {
            // Clear autosave data
            window.ContentWorkflow.clearAutosavedContent('blog_post', postId || 'new');
        }
    }
}

/**
 * Format status label
 * @param {string} status - Status code
 * @returns {string} Formatted status label
 */
function formatStatusLabel(status) {
    const labels = {
        draft: 'Draft',
        review: 'In Review',
        revision: 'Needs Revision',
        approved: 'Approved',
        published: 'Published',
        scheduled: 'Scheduled',
        archived: 'Archived'
    };

    return labels[status] || status;
}

/**
 * Get status color class
 * @param {string} status - Status code
 * @returns {string} Tailwind CSS class for the status
 */
function getStatusColorClass(status) {
    const colorClasses = {
        draft: 'bg-gray-100 text-gray-800',
        review: 'bg-yellow-100 text-yellow-800',
        revision: 'bg-red-100 text-red-800',
        approved: 'bg-green-100 text-green-800',
        published: 'bg-blue-100 text-blue-800',
        scheduled: 'bg-purple-100 text-purple-800',
        archived: 'bg-gray-300 text-gray-800'
    };

    return colorClasses[status] || 'bg-gray-100 text-gray-800';
}

// Initialize workflow integration
document.addEventListener('DOMContentLoaded', function() {
    initWorkflowIntegration();
});
