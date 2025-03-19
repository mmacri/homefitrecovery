# Recovery Essentials Website

A complete affiliate marketing website for fitness recovery products, featuring detailed product reviews, comparisons, and affiliate links.

## Site Structure

### Product Pages
- **Massage Guns** (`products/massage-guns.html`): Detailed comparison of percussion therapy devices
- **Foam Rollers** (`products/foam-rollers.html`): Reviews and comparisons of foam rolling products
- **Fitness Bands** (`products/fitness-bands.html`): Resistance band reviews and buying guide
- **Compression Gear** (`products/compression-gear.html`): Compression clothing for recovery

### Blog Content
- Blog Index (`blog/index.html`): Main blog page with article listings
- Massage Gun Techniques (`blog/massage-gun-techniques.html`): Detailed tutorial
- Foam Rolling Guide (`blog/foam-rolling-guide.html`): Step-by-step techniques

### Company Pages
- Home Page (`index.html`): Main landing page
- About Us (`about.html`): Company information and team profiles
- Contact (`contact.html`): Contact form and company information
- Privacy Policy (`privacy.html`): Privacy details and data practices
- Affiliate Disclosure (`affiliate-disclosure.html`): Information about affiliate relationships
- Newsletter Signup (`newsletter.html`): Email subscription page

### Admin Area
- Admin Dashboard (`admin/index.html`): Product and content management

## Technology Stack

This site is built with:
- HTML5
- TailwindCSS (2.2.19) for styling
- Font Awesome (6.0.0-beta3) for icons
- Vanilla JavaScript for interactive elements

## Setting Up Amazon Affiliate Integration

This site is designed to work with Amazon's Product Advertising API. To integrate your Amazon affiliate links:

1. Sign up for the [Amazon Associates Program](https://affiliate-program.amazon.com/)
2. Generate your affiliate links through the Amazon Associates dashboard
3. Update product links in the product pages with your affiliate links
4. For automated integration, modify the admin dashboard to use your API credentials

## Hosting on GitHub Pages

To host this site on GitHub Pages:

1. Create a new GitHub repository
2. Initialize Git in your project folder:
   ```
   cd recovery-site
   git init
   git add .
   git commit -m "Initial commit"
   ```
3. Connect to your GitHub repository:
   ```
   git remote add origin https://github.com/yourusername/recovery-essentials.git
   git branch -M main
   git push -u origin main
   ```
4. Go to your repository settings on GitHub
5. Scroll down to the "GitHub Pages" section
6. Select the "main" branch as the source
7. Click "Save" and your site will be published at `https://yourusername.github.io/recovery-essentials/`

## Hosting on GoDaddy

To host this site on GoDaddy:

1. Purchase hosting and a domain from GoDaddy
2. Log in to your GoDaddy account
3. Access your cPanel or hosting dashboard
4. Use the File Manager or FTP to upload:
   - For File Manager: Navigate to the public_html directory and upload all files from your recovery-site folder
   - For FTP:
     ```
     Install an FTP client like FileZilla
     Connect to your GoDaddy server using your credentials
     Upload all files from your recovery-site folder to the public_html directory
     ```
5. Your site will be live at your domain

## Adding New Products

### Method 1: Using the Admin Dashboard
1. Navigate to `your-domain.com/admin/index.html`
2. Fill out the product form with:
   - Product name
   - Category
   - Description
   - Price
   - Rating and review count
   - Product image URL
   - Amazon affiliate link
   - Features/benefits
3. Click "Save Product" to add the product to the site

### Method 2: Manual HTML Editing
1. Open the relevant product category page (e.g., `products/massage-guns.html`)
2. Copy an existing product section
3. Update the HTML with your new product information
4. Update the comparison table if applicable
5. Save the file and upload it to your server

## Customization

### Changing Colors
The site uses TailwindCSS for styling. The primary color theme is indigo with purple accents.
- To modify colors, edit the class names in the HTML files
- Primary color classes follow the pattern: `bg-indigo-600`, `text-indigo-800`, etc.

### Adding New Categories
1. Create a new HTML file in the `products` directory
2. Use an existing product page as a template
3. Update all content to reflect the new category
4. Add links to the new category in the navigation menus of all pages

## Maintenance

Regularly check for broken affiliate links and update product information to ensure:
1. Products are still available for purchase
2. Pricing information is current
3. Ratings and reviews are up-to-date
4. Featured products reflect the latest market options

## Analytics Integration

To track visitor behavior and affiliate link performance:
1. Create a Google Analytics account
2. Add your Google Analytics tracking code to each page, just before the closing `</head>` tag
3. Set up goal tracking for affiliate link clicks
4. Consider adding Facebook Pixel or other marketing pixels for retargeting

## Support

For questions or assistance with the website, contact:
- Email: support@recoveryessentials.com
- Contact form: [Contact Us](contact.html)

---

© 2023 Recovery Essentials. All rights reserved.
