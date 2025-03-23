# Customer Relationship Management System Guide

## Overview

The Recovery Essentials Customer Relationship Management (CRM) System is a comprehensive solution for managing customer data, tracking customer interactions, analyzing customer behavior, and segmenting customers for targeted marketing and service. This guide provides detailed information about the system's features, architecture, and usage.

## Table of Contents

1. [Key Features](#key-features)
2. [System Architecture](#system-architecture)
3. [Customer Lifecycle](#customer-lifecycle)
4. [Dashboard Overview](#dashboard-overview)
5. [Managing Customers](#managing-customers)
6. [Customer Segmentation](#customer-segmentation)
7. [Integration with Other Systems](#integration-with-other-systems)
8. [Technical Reference](#technical-reference)
9. [Troubleshooting](#troubleshooting)

## Key Features

The Customer Relationship Management System provides the following key features:

- **Comprehensive Customer Dashboard**: Real-time overview of customer statistics, recent activity, and customer segments
- **Advanced Customer Management**: Create, edit, and manage customer profiles with detailed information
- **Customer Segmentation**: Automatically categorize customers into segments based on their behavior and value
- **Customer Activity Tracking**: Monitor customer orders, interactions, and history
- **Customer Lifetime Value Analysis**: Track and analyze the lifetime value (LTV) of customers
- **Retention Analysis**: Measure and improve customer retention rates
- **Export Functionality**: Export customer data to CSV for external processing or backup

## System Architecture

The Customer Relationship Management System is built with a modular architecture consisting of the following components:

### Core Components

- **Customer Management Core** (`customer-management.js`): Provides the core business logic for customer operations such as creation, updating, retrieval, and deletion.
- **Customer UI Controller** (`customers-ui.js`): Connects the UI elements in the dashboard to the core functionality.
- **Customer Data Storage**: Uses browser localStorage for demonstration purposes, but designed to be easily connected to a backend database.

### Data Models

The system uses the following primary data models:

#### Customer Object

```javascript
{
  id: String,                // Unique identifier (e.g., "CUST-1001")
  name: String,              // Customer name
  email: String,             // Customer email
  phone: String,             // Customer phone (optional)
  address: {                 // Customer address (optional)
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },
  segment: String,           // Customer segment
  preferences: {             // Customer preferences
    emailOptIn: Boolean,     // Email marketing opt-in
    smsOptIn: Boolean        // SMS marketing opt-in
  },
  notes: String,             // Customer notes
  dateCreated: String,       // ISO date string
  dateUpdated: String,       // ISO date string
  lastOrderDate: String,     // ISO date string (optional)
  totalOrders: Number,       // Total number of orders
  totalSpent: Number,        // Total amount spent
  orderIds: Array            // Array of order IDs
}
```

#### Customer Segment Constants

The system supports the following customer segments:

- `new`: First-time customers who have placed one order
- `returning`: Customers who have placed multiple orders and are actively engaging
- `vip`: High-value customers who have placed many orders or spent a significant amount
- `at_risk`: Customers who haven't ordered in a while and may be at risk of churning
- `inactive`: Customers who haven't ordered in a long time and are considered churned

## Customer Lifecycle

Customers typically go through the following lifecycle:

1. **Acquisition**: Customer places their first order and is categorized as a `new` customer
2. **Engagement**: Customer places additional orders and becomes a `returning` customer
3. **Growth**: Customer continues to order and may become a `vip` customer based on spending or order frequency
4. **Retention/Churn Risk**: If a customer hasn't ordered in a while, they become `at_risk`
5. **Churn**: If a customer doesn't return after an extended period, they become `inactive`

Each customer's progress through this lifecycle is tracked and managed through the segmentation system.

## Dashboard Overview

The Customer Management Dashboard provides a comprehensive view of all customers and related metrics.

### Key Dashboard Components:

#### 1. Customer Statistics

The top section of the dashboard displays key metrics:
- Total Customers
- Average Customer Lifetime Value (LTV)
- Active Customers
- Retention Rate

#### 2. Customers Table

The main section displays a paginated table of all customers with the following columns:
- Name
- Email
- Orders
- Total Spent
- Last Order Date
- Segment
- Actions (View, Edit, Delete)

#### 3. Customer Insights

The bottom section shows visualizations of:
- Customer segments distribution
- Customer lifetime value by segment

## Managing Customers

### Creating Customers

To create a new customer:

1. Click the "New Customer" button in the Customers table header
2. Fill in the customer information in the modal form:
   - Basic Information (name, email, phone, segment)
   - Address Information (street, city, state, ZIP code, country)
   - Preferences (marketing opt-ins)
   - Notes
3. Click "Save Customer"

### Viewing Customer Details

To view customer details:

1. Click on the eye icon in the actions column of the customers table
2. The customer details modal will show all information including:
   - Customer information
   - Address
   - Account summary
   - Order history
   - Notes

### Editing Customers

To edit an existing customer:

1. Click the edit icon in the actions column of the customers table
2. Modify any details as needed in the modal form
3. Click "Save Customer" to update the customer

### Deleting Customers

To delete a customer:

1. Click the delete icon in the actions column
2. Confirm the deletion when prompted

## Customer Segmentation

The system automatically segments customers based on their order history and spending patterns. The segmentation logic can be customized in the Customer Settings.

### Default Segmentation Rules

- **New Customers**: Customers with exactly 1 order
- **VIP Customers**: Customers with 3+ orders OR total spending of $500+
- **At-Risk Customers**: Customers who haven't ordered in 60+ days
- **Inactive Customers**: Customers who haven't ordered in 90+ days
- **Returning Customers**: All other customers with 2+ orders

### Manual Segmentation

Customers can also be manually assigned to segments by editing their profile and selecting the desired segment.

## Integration with Other Systems

The Customer Relationship Management System integrates with the following other Recovery Essentials systems:

### Order Management

- Automatically creates or updates customer profiles when orders are placed
- Links orders to customer profiles for order history tracking
- Updates customer metrics (total orders, total spent, last order date) when orders change

### Analytics System

- Provides customer data for comprehensive site analytics
- Tracks customer acquisition, retention rates, and lifetime value
- Monitors segment distributions and customer health

## Technical Reference

### Core Functions

#### Creating Customers

```javascript
// Create a new customer
const customer = CustomerManagement.createCustomer({
  name: 'Jane Smith',
  email: 'jane@example.com',
  phone: '555-5678',
  segment: 'new',
  preferences: {
    emailOptIn: true,
    smsOptIn: false
  }
});
```

#### Updating Customers

```javascript
// Update an existing customer
const updatedCustomer = CustomerManagement.updateCustomer('CUST-1001', {
  phone: '555-9876',
  segment: 'vip',
  notes: 'Prefers email contact'
});
```

#### Retrieving Customers

```javascript
// Get all customers
const allCustomers = CustomerManagement.getCustomers();

// Get customers with filters
const filteredCustomers = CustomerManagement.getCustomers({
  segment: 'vip',
  dateFrom: '2023-01-01',
  dateTo: '2023-01-31'
});

// Get a specific customer by ID
const customer = CustomerManagement.getCustomerById('CUST-1001');
```

#### Customer Statistics

```javascript
// Get customer statistics for a specific period
const stats = CustomerManagement.getCustomerStatistics('month');
console.log(stats.totalCustomers);
console.log(stats.averageLTV);
console.log(stats.retentionRate);
```

#### Exporting Customers

```javascript
// Export all customers to CSV
const csv = CustomerManagement.exportCustomersToCSV();

// Export filtered customers to CSV
const vipCustomers = CustomerManagement.getCustomers({ segment: 'vip' });
const vipCsv = CustomerManagement.exportCustomersToCSV(vipCustomers);
```

## Troubleshooting

### Common Issues

#### Customers Not Displaying

If customers are not displaying in the dashboard:

1. Check that the `CustomerManagement` module is loaded correctly
2. Verify that customers exist in the storage
3. Check for JavaScript errors in the browser console

#### Customer Creation Failures

If customer creation fails:

1. Ensure all required fields are provided (name and email)
2. Verify that email addresses are valid
3. Check for duplicate email addresses (each email must be unique)

#### Data Persistence Issues

If customer data is not being saved:

1. Check that localStorage is available and not full
2. Verify that the data being saved is valid JSON
3. Clear browser cache and try again

### Getting Help

For additional help with the Customer Relationship Management System:

1. Consult the Technical Reference section of this guide
2. Check the browser console for error messages
3. Contact the Recovery Essentials development team at support@recoveryessentials.com

---

© 2025 Recovery Essentials. All rights reserved.
