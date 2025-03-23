git commit -m "Your descriptive commit message"# Getting Started with Recovery Essentials Admin Dashboard

This guide will help you set up and start using the Recovery Essentials Admin Dashboard for managing your fitness recovery affiliate website.

## Installation

### Prerequisites

- Web server with PHP 7.4+ or Node.js 14+ (depending on your backend choice)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Text editor for customization
- GitHub account (for deployment to GitHub Pages)

### Option 1: Direct Download

1. Download the latest release from GitHub
2. Extract the files to your web server directory
3. Navigate to the admin directory in your browser

### Option 2: Clone from GitHub

```bash
# Clone the repository
git clone https://github.com/yourusername/recovery-essentials.git

# Navigate to the project directory
cd recovery-essentials

# If using npm packages
npm install
# OR if using Bun
bun install
```

## Directory Structure

After installation, your project structure will look like this:

```
recovery-site/
│── index.html              # Main website homepage
│── about.html              # About page
│── contact.html            # Contact page
│── products/               # Product category pages
│── blog/                   # Blog section
│── admin/                  # Admin dashboard
│   ├── index.html          # Admin dashboard main page
│   ├── products.html       # Products section template
│   ├── blog.html           # Blog section template
│   ├── affiliate.html      # Affiliate links template
│   ├── settings.html       # Settings template
│   ├── navigation.html     # Navigation manager template
│   ├── js/
│   │   ├── admin.js           # Core admin functionality
│   │   ├── blog-admin.js      # Blog management
│   │   ├── affiliate-admin.js # Affiliate link management
│   │   ├── navigation-admin.js # Navigation management
│   ├── css/
│   │   ├── styles.css         # Custom admin styles
│── js/                     # Front-end JavaScript
│── css/                    # Front-end styles
│── assets/                 # Images and other assets
│── docs/                   # Documentation
```

## First Login

### Default Credentials

For the demo version using localStorage, no actual authentication is required. In a production environment, you should replace the authentication system with proper backend validation.

### Setting Up Amazon API Credentials

For the affiliate link functionality to work with the Amazon Product Advertising API:

1. Visit the Amazon Associates Program and sign up if you haven't already
2. Navigate to the Product Advertising API section
3. Create a new set of credentials (Access Key and Secret Key)
4. In the admin dashboard, go to Settings
5. Enter your credentials in the Amazon API Settings section
6. Save the settings

## Initial Configuration

When you first access the dashboard, follow these steps to set up your site:

### 1. Configure Site Settings

1. Navigate to the Settings section
2. Set your site name, tagline, and description
3. Configure Amazon API settings
4. Save your settings

### 2. Set Up Navigation Structure

1. Go to the Navigation section
2. Create your main navigation categories (e.g., Massage Guns, Foam Rollers, etc.)
3. Organize them in the desired order
4. Apply changes to your front-end

### 3. Add Initial Products

1. Navigate to the Products section
2. Add your first product with all details
3. Make sure to include high-quality images and compelling descriptions
4. Don't forget to add your affiliate links

### 4. Create Some Blog Content

1. Go to the Blog section
2. Create a few initial blog posts
3. Use relevant categories and tags
4. Publish the posts or save as drafts for later

## Dashboard Navigation

The admin dashboard is organized into several main sections, accessible from both the top navigation bar and the sidebar:

- **Dashboard**: Overview and quick stats
- **Products**: Manage your product catalog
- **Blog Posts**: Create and manage blog content
- **Affiliate Links**: Track and manage affiliate links
- **Navigation**: Control site navigation structure
- **Settings**: Configure site-wide settings

## Demo Mode vs. Production Mode

The default installation uses localStorage for data storage (Demo Mode). To switch to Production Mode:

1. Set up a backend API for data storage
2. Edit the JavaScript files to replace localStorage calls with API calls
3. Implement proper authentication
4. Update the deployment configuration

## Next Steps

- Explore the detailed documentation for each section
- Customize the look and feel to match your brand
- Add your products and content
- Configure your affiliate links
- Deploy your site to a production environment

For more detailed information about specific features, refer to the dedicated documentation sections.

## Troubleshooting First-Time Setup

### Common Issues

**Dashboard Not Loading**
- Check for JavaScript console errors
- Verify all required files are present
- Try clearing your browser cache

**Can't Save Changes**
- In Demo Mode, make sure localStorage is enabled in your browser
- Check for available storage space in localStorage
- In Production Mode, verify API connectivity

**Images Not Displaying**
- Verify image URLs are correct and accessible
- Check for CORS issues if using external image sources
- Ensure the images directory has proper permissions

**Navigation Not Applying to Front-End**
- Verify you clicked "Apply Changes to Site"
- Check file permissions on front-end templates
- Look for error messages in the console

## Getting Help

If you encounter any issues not covered in this guide or the detailed documentation:

- Check the GitHub repository issues section
- Consult the troubleshooting guides
- Contact support at support@recoveryessentials.com
