# Navigation Management System Tutorial

This step-by-step tutorial demonstrates how to use the Navigation Management system in the Recovery Essentials Admin Dashboard. By following this guide, you'll learn how to add, edit, and organize navigation items for your website.

## Prerequisites

- Access to the Recovery Essentials Admin Dashboard
- Basic understanding of website navigation structure

## Tutorial Objectives

In this tutorial, you will:
1. Access the Navigation Management section
2. Add a new main navigation item
3. Create child navigation items
4. Reorder navigation items
5. Apply changes to the front-end

## Step 1: Access the Navigation Management Section

1. Log in to the Recovery Essentials Admin Dashboard
2. In the left sidebar, click on "Navigation"
3. The Navigation Management interface will load, showing:
   - Navigation Item Form (top section)
   - Navigation Structure Table (middle section)
   - Apply Changes button (bottom section)

## Step 2: Add "Compression Gear" as a New Navigation Item

Let's add a new main navigation category for "Compression Gear" products:

1. In the Navigation Item Form, make sure it's in "Add New Item" mode (the form should be empty)
2. Enter the following information:
   - **Label**: `Compression Gear`
   - **Slug**: Leave empty (it will auto-generate as `compression-gear`)
   - **URL**: `/categories/compression-gear.html`
   - **Parent**: Leave as "None (Top Level)"
   - **Order**: `4` (since we want it to appear after Massage Guns, Foam Rollers, and Fitness Bands)
   - **Show in Main Navigation**: Checked
   - **CSS Classes**: Leave empty

3. Click the "Add Navigation Item" button
4. You should see a success notification and the new item appears in the Navigation Structure Table

## Step 3: Add Child Items to Massage Guns

Now, let's add child items to create a dropdown menu for the Compression Gear category:

1. In the Navigation Item Form, enter the following for the first child item:
   - **Label**: `Compression Socks`
   - **Slug**: Leave empty (it will auto-generate)
   - **URL**: `/categories/compression-socks.html`
   - **Parent**: Select "Compression Gear" from the dropdown
   - **Order**: `1` (first item in the dropdown)
   - **Show in Main Navigation**: Unchecked (since it's a dropdown item)
   - **CSS Classes**: Leave empty

2. Click the "Add Navigation Item" button

3. Now add a second child item with this information:
   - **Label**: `Compression Sleeves`
   - **Slug**: Leave empty
   - **URL**: `/categories/compression-sleeves.html`
   - **Parent**: Select "Compression Gear" again
   - **Order**: `2` (second item in the dropdown)
   - **Show in Main Navigation**: Unchecked
   - **CSS Classes**: Leave empty

4. Click the "Add Navigation Item" button

5. Add a third child item:
   - **Label**: `Compression Tights`
   - **Slug**: Leave empty
   - **URL**: `/categories/compression-tights.html`
   - **Parent**: Select "Compression Gear"
   - **Order**: `3` (third item in the dropdown)
   - **Show in Main Navigation**: Unchecked
   - **CSS Classes**: Leave empty

6. Click the "Add Navigation Item" button

## Step 4: Reorganize the Navigation Structure

Let's change the order of the main navigation items to put Compression Gear before Fitness Bands:

1. Find "Compression Gear" in the Navigation Structure Table
2. Click the "Up" arrow button next to its order number
3. This will swap positions with the item above it (Fitness Bands)
4. Now "Compression Gear" should be third in the order, before "Fitness Bands"

Alternatively, you can:
1. Click "Edit" on the Compression Gear item
2. Change its Order value from 4 to 3
3. Click "Update Navigation Item"
4. Then edit the Fitness Bands item and change its order from 3 to 4

## Step 5: Preview the Navigation Changes

1. Click the "Preview Navigation" button in the top-right of the Navigation Management section
2. A preview panel will appear showing how the navigation will look on the front-end
3. Verify that:
   - The main navigation items appear in the correct order: Massage Guns, Foam Rollers, Compression Gear, Fitness Bands
   - Compression Gear has a dropdown with three items in the correct order
   - The styling looks good

## Step 6: Apply Changes to the Front-End

1. Scroll down to the "Apply Changes to Site" section
2. Click the "Apply Navigation Changes" button
3. Wait for the success notification confirming that the navigation has been updated on all pages
4. The system will update the navigation code on these pages:
   - index.html (homepage)
   - All category pages
   - Blog pages
   - About and Contact pages

## Step 7: Verify the Changes

1. Open a new browser tab and navigate to the website's homepage
2. Check that the navigation bar shows the new structure:
   - Massage Guns (with dropdown)
   - Foam Rollers
   - Compression Gear (with dropdown)
   - Fitness Bands
3. Hover over "Compression Gear" to verify that the dropdown shows all three child items
4. Click on "Compression Gear" to navigate to the compression gear category page
5. Check that the navigation is also updated on this page

## Additional Navigation Management Tasks

### Editing an Existing Navigation Item

1. Find the item you want to edit in the Navigation Structure Table
2. Click the "Edit" button
3. The form will be populated with the item's current values
4. Make your changes
5. Click "Update Navigation Item"

### Deleting a Navigation Item

1. Find the item you want to delete
2. Click the "Delete" button
3. If the item has children, you'll be asked what to do with them:
   - Delete all children too
   - Move children up to the parent's level
   - Assign children to another parent
4. Confirm the deletion
5. Apply changes to the front-end

### Temporarily Hiding a Navigation Item

If you want to keep an item but hide it from the main navigation:
1. Edit the item
2. Uncheck "Show in Main Navigation"
3. Update the item
4. Apply changes to the front-end

## Conclusion

You have now successfully:
- Added a new main navigation category
- Created child items for a dropdown menu
- Reordered navigation items
- Applied the changes to all front-end pages

The Navigation Management system makes it easy to control the structure and organization of your site's navigation without having to edit HTML code directly. Remember to always preview your changes and apply them to the front-end when you're satisfied with them.

## Troubleshooting

If you encounter any issues:
- Make sure you've applied changes to the front-end after making modifications
- Check for any error messages in the notification system
- Verify that all URLs are correct and the target pages exist
- Try refreshing the page if the preview doesn't update correctly
- Look at the browser console for any JavaScript errors
