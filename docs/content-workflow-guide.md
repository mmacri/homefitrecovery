# Content Scheduling and Workflow Guide

This guide explains how to use the Content Scheduling and Publishing Workflow system in the Recovery Essentials admin dashboard.

## Overview

The Content Scheduling and Workflow system enables you to:

- Schedule content for future publication
- Create and manage content revisions
- Implement content approval workflows
- Track content status through its lifecycle
- Visualize content schedule in a calendar interface
- Manage content-related tasks efficiently

## Content Workflow States

Content in the system can exist in the following states:

| Status | Description |
|--------|-------------|
| Draft | Content is being created and is not ready for review |
| Review | Content has been submitted for editorial review |
| Revision | Content needs revisions based on review feedback |
| Approved | Content has been approved but not yet published |
| Published | Content is live on the site |
| Scheduled | Content is scheduled for future publication |
| Archived | Content has been archived (not visible on site) |

## Using the Content Calendar

The Content Calendar provides a visual interface for managing scheduled content and workflow tasks:

### Accessing the Calendar

1. Log in to the Recovery Essentials admin dashboard
2. Click on "Calendar" in the main navigation menu
3. The Content Calendar will load, showing the current month view

### Calendar Views

The calendar offers three different views:

- **Month View**: Default view showing the entire month with content items
- **Week View**: Detailed view of a single week with hourly slots
- **List View**: Text-based list of all scheduled content items

To change views, use the view dropdown at the top-right of the calendar.

### Navigation

Use the calendar controls to navigate:

- **Previous/Next**: Navigate to the previous or next month/week
- **Today**: Jump to the current date
- **Filter**: Filter content by type or status

### Adding Content to the Calendar

To add new content to the calendar:

1. Click the "Create Content" button in the calendar interface
2. Select the content type (Blog Post, Product, Page)
3. Create your content as usual
4. When saving, set the status to "Scheduled" and choose a publication date/time

### Managing Scheduled Content

From the calendar view, you can:

- **View Details**: Click on any content item to view its details
- **Edit Content**: Click the "Edit" button in the content details modal
- **Reschedule**: Change the scheduled date through the workflow feature

## Scheduling Content for Publication

You can schedule any content item to be automatically published at a future date and time:

### Scheduling a Blog Post

1. Create or edit a blog post
2. Set the status to "Scheduled"
3. A date/time picker will appear
4. Choose the future publication date and time
5. Save the post
6. The system will automatically publish it at the scheduled time

### Viewing Scheduled Content

You can view all scheduled content:

1. In the Calendar: Scheduled items appear on their scheduled date
2. In Lists: Use the status filter to see only scheduled content
3. In Tasks: Scheduled publications appear in your task list

### Rescheduling Content

To change the scheduled publication date:

1. Edit the content item
2. Click the "Workflow" button
3. Choose "Scheduled" status and select a new date/time
4. Save the changes

## Content Revision History

The system maintains a revision history for all content, allowing you to track changes and restore previous versions if needed:

### Creating a Revision

When editing content, you can explicitly save a revision:

1. Make your changes to the content
2. Click the "Save as Revision" button
3. Add a comment describing the changes (optional)
4. The system saves a snapshot of the content

### Viewing Revision History

To see the revision history for a content item:

1. Open the content for editing
2. Click the "Revision History" button
3. A modal will show all saved revisions with dates and comments

### Restoring a Previous Revision

To restore content to a previous state:

1. Open the revision history modal
2. Find the revision you want to restore
3. Click "Restore This Version"
4. Confirm the action
5. The content will be reverted to the selected revision

## Editorial Workflow

The workflow system allows for collaborative content creation with review and approval processes:

### Workflow Process

A typical content workflow follows these steps:

1. **Draft**: Author creates and edits content
2. **Review**: Author submits content for review by an editor
3. **Revision**: Editor requests changes (if needed)
4. **Approved**: Editor approves the content
5. **Published/Scheduled**: Content is published or scheduled

### Submitting for Review

To submit content for review:

1. Create or edit your content
2. Click the "Workflow" button
3. Select "Submit for Review" from the status dropdown
4. Add comments for the reviewer (optional)
5. Click "Save Changes"

### Reviewing Content

For editors reviewing content:

1. Open the content item
2. Review the content
3. Click the "Workflow" button
4. Select appropriate status:
   - "Needs Revision" (add comments explaining needed changes)
   - "Approved" (content is ready to publish)
   - "Published" (publish immediately)
   - "Scheduled" (schedule for future)
5. Click "Save Changes"

## Workflow Tasks

The system generates tasks based on workflow status changes:

### Task Types

- **Review Tasks**: Content submitted for review
- **Revision Tasks**: Content that needs revisions
- **Publishing Tasks**: Scheduled publications due soon

### Managing Tasks

Tasks appear in two places:

1. **In the Calendar**: At the bottom of the calendar page
2. **In the Dashboard**: A summary of upcoming tasks

To mark a task as completed:

1. Find the task in the task list
2. Click the "View Details" button
3. Update the content's workflow status as appropriate
4. The task will be marked as completed

## Autosave Feature

The system includes an autosave feature to prevent data loss:

### How Autosave Works

- Content is automatically saved every 60 seconds while editing
- Only drafts are autosaved
- The autosave indicator shows when the last autosave occurred

### Recovering Autosaved Content

If you navigate away or the browser closes unexpectedly:

1. When you return to edit the same content, you'll see a prompt
2. Choose whether to recover the autosaved version
3. If you recover it, you can continue working from where you left off

## Best Practices

### Content Scheduling

- **Plan Ahead**: Use the calendar to plan content publication in advance
- **Balanced Schedule**: Avoid publishing multiple pieces of content at the same time
- **Consider Timing**: Schedule content to publish when your audience is most active
- **Buffer Time**: Schedule content to be ready a day before it needs to go live

### Workflow Management

- **Clear Expectations**: Establish clear responsibilities for each workflow status
- **Meaningful Comments**: Provide detailed comments when requesting revisions
- **Regular Check-ins**: Check the task list daily for pending items
- **Template Usage**: Use content templates to maintain consistency
- **Revision Control**: Create explicit revisions for significant changes

### Revision Strategy

- **Milestone Revisions**: Create revisions at key stages of content development
- **Descriptive Comments**: Always add clear comments to revisions
- **Limit Revisions**: Keep only meaningful revisions to avoid clutter
- **Review Before Restore**: Preview revisions before restoring them

## Frequently Asked Questions

**Q: What happens if scheduled content fails to publish?**
A: The system will retry publishing and create a task for manual intervention if needed.

**Q: Can I have multiple versions of content scheduled?**
A: No, each content item can only have one scheduled publication at a time.

**Q: Are revisions included in site backups?**
A: Yes, all revisions are included in regular system backups.

**Q: Can I disable the workflow for certain content types?**
A: Yes, administrators can configure which content types use the workflow system.

**Q: How long do autosaved drafts remain available?**
A: Autosaved drafts are stored until they are either published or manually deleted.

**Q: Do I need special permissions to schedule content?**
A: No, any user who can create content can also schedule it, but publishing permissions may vary.

## Troubleshooting

### Scheduled Content Not Publishing

If scheduled content doesn't publish automatically:

1. Check that the scheduled date/time has passed
2. Verify that the autoPublishScheduled setting is enabled
3. Try manually publishing the content

### Missing Revision History

If you can't see revision history for content:

1. Ensure you've saved explicit revisions (not just autosaves)
2. Check that you have permission to view revision history
3. Verify that the content type supports revisions

### Workflow Status Changes Not Saving

If workflow status changes don't save:

1. Ensure you have the correct permissions
2. Check if the content is locked by another user
3. Try refreshing the page before making changes

## Summary

The Content Scheduling and Workflow system helps you manage the entire content lifecycle from creation to publication. By using the calendar interface, revision history, and workflow statuses, you can ensure content quality while maintaining an efficient publishing schedule.
