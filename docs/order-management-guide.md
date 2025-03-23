# Order Management System Guide

## Overview

The Recovery Essentials Order Management System is a comprehensive solution for handling customer orders, processing payments, managing inventory, and tracking order history. This guide provides detailed information about the system's features, architecture, and usage.

## Table of Contents

1. [Key Features](#key-features)
2. [System Architecture](#system-architecture)
3. [Order Lifecycle](#order-lifecycle)
4. [Dashboard Overview](#dashboard-overview)
5. [Managing Orders](#managing-orders)
6. [Order Analytics](#order-analytics)
7. [Integration with Other Systems](#integration-with-other-systems)
8. [Technical Reference](#technical-reference)
9. [Troubleshooting](#troubleshooting)

## Key Features

The Order Management System provides the following key features:

- **Comprehensive Order Dashboard**: Real-time overview of order statistics, recent activity, and top-selling products
- **Advanced Order Processing**: Create, edit, and manage orders with multiple items, tax calculations, shipping options, and discounts
- **Order Status Tracking**: Track orders through their entire lifecycle with status updates and history logging
- **Customer Management**: Associate orders with customer profiles and store shipping/billing information
- **Payment Processing**: Handle multiple payment methods and process refunds when needed
- **Inventory Integration**: Automatically update product inventory when orders are placed or refunded
- **Reporting & Analytics**: Generate reports on sales, revenue, top products, and customer behavior
- **Export Functionality**: Export order data to CSV for external processing or backup

## System Architecture

The Order Management System is built with a modular architecture consisting of the following components:

### Core Components

- **Order Management Core** (`order-management.js`): Provides the core business logic for order operations such as creation, updating, retrieval, and deletion.
- **Order UI Controller** (`orders-ui.js`): Connects the UI elements in the dashboard to the core functionality.
- **Order Data Storage**: Uses browser localStorage for demonstration purposes, but designed to be easily connected to a backend database.

### Data Models

The system uses the following primary data models:

#### Order Object

```javascript
{
  id: String,                // Unique identifier (e.g., "ORD-1001")
  orderNumber: Number,       // Order number for display (e.g., 1001)
  customer: {                // Customer information
    id: String,              // Customer ID (optional)
    name: String,            // Customer name
    email: String,           // Customer email
    phone: String            // Customer phone (optional)
  },
  items: [                   // Array of order items
    {
      productId: String,     // Product ID
      name: String,          // Product name
      price: Number,         // Product price
      quantity: Number,      // Quantity ordered
      lineTotal: Number      // Line total (price * quantity)
    }
  ],
  subtotal: Number,          // Order subtotal
  taxAmount: Number,         // Tax amount
  shippingAmount: Number,    // Shipping amount
  discountAmount: Number,    // Discount amount
  totalAmount: Number,       // Total amount
  status: String,            // Order status
  paymentStatus: String,     // Payment status
  shippingAddress: Object,   // Shipping address
  billingAddress: Object,    // Billing address
  paymentMethod: Object,     // Payment method
  shippingMethod: Object,    // Shipping method
  notes: String,             // Order notes
  dateCreated: String,       // ISO date string
  dateUpdated: String,       // ISO date string
  history: [                 // Order history
    {
      action: String,        // Action type
      status: String,        // Status after action
      timestamp: String,     // ISO date string
      note: String           // Note about the action
    }
  ]
}
```

#### Order Status Constants

The system supports the following order statuses:

- `pending`: Order has been placed but not yet processed
- `processing`: Order is being processed
- `shipped`: Order has been shipped
- `delivered`: Order has been delivered
- `cancelled`: Order has been cancelled
- `refunded`: Order has been refunded
- `on_hold`: Order is on hold
- `backordered`: Order contains backordered items
- `completed`: Order has been completed

#### Payment Status Constants

The system supports the following payment statuses:

- `pending`: Payment is pending
- `paid`: Payment has been received
- `failed`: Payment has failed
- `refunded`: Payment has been refunded
- `partially_refunded`: Payment has been partially refunded

## Order Lifecycle

Orders typically go through the following lifecycle:

1. **Creation**: Order is created with status `pending` and payment status `pending`
2. **Payment Processing**: When payment is confirmed, payment status changes to `paid`
3. **Order Processing**: Order status changes to `processing`
4. **Fulfillment**: Order status changes to `shipped` when items are shipped
5. **Delivery**: Order status changes to `delivered` when items are received
6. **Completion**: Order status changes to `completed` when all actions are finished

Alternative paths may include:
- Order cancellation: Status changes to `cancelled`
- Order refund: Payment status changes to `refunded` or `partially_refunded`
- Order hold: Status changes to `on_hold`

Each status change is recorded in the order history for tracking and auditing purposes.

## Dashboard Overview

The Order Management Dashboard provides a comprehensive view of all orders and related metrics.

### Key Dashboard Components:

#### 1. Order Statistics

The top section of the dashboard displays key metrics:
- Total Orders
- Total Revenue
- Average Order Value
- Pending Orders

#### 2. Orders Table

The main section displays a paginated table of all orders with the following columns:
- Order Number
- Date
- Customer
- Status
- Payment Status
- Total
- Actions (View, Edit, Delete)

#### 3. Recent Activity

Shows recent order activity including status changes, new orders, and other events.

#### 4. Top Selling Products

Displays a list of the top-selling products based on quantity sold and revenue generated.

## Managing Orders

### Creating Orders

To create a new order:

1. Click the "New Order" button in the Orders table header
2. Fill in the customer information
3. Add products to the order using the "Add Item" button
4. Set the shipping amount, discount, and any other relevant fields
5. Set the order status
6. Click "Save Order"

### Viewing Order Details

To view order details:

1. Click on the order number in the orders table
2. The order details modal will show all information including:
   - Order summary
   - Customer information
   - Order items
   - Order history

### Editing Orders

To edit an existing order:

1. Click the edit icon in the actions column of the orders table
2. Modify any details as needed
3. Click "Save Order" to update the order

### Processing Refunds

To process a refund:

1. View the order details
2. Click "Edit" to open the edit modal
3. Update the payment status to "Refunded" or "Partially Refunded"
4. Enter the refund amount and reason
5. Click "Save Order"

### Deleting Orders

To delete an order:

1. Click the delete icon in the actions column
2. Confirm the deletion when prompted

## Order Analytics

The Order Management System provides several analytics features:

### Order Statistics

The system calculates and displays the following metrics:
- Total number of orders
- Total revenue
- Average order value
- Number of orders by status

### Top Selling Products

The system identifies and displays top-selling products based on:
- Quantity sold
- Revenue generated

### Time-Based Analysis

The system allows filtering data by various time periods:
- Today
- Yesterday
- Last 7 days
- Last 30 days
- This month
- Last month
- Custom date range

## Integration with Other Systems

The Order Management System integrates with the following other Recovery Essentials systems:

### Product Management

- Automatically updates product inventory when orders are created or refunded
- Pulls product information when creating or displaying orders

### Customer Management

- Associates orders with customer profiles
- Stores customer shipping and billing information for future use

### Analytics System

- Provides order data for comprehensive site analytics
- Tracks conversion rates, average order values, and other key metrics

## Technical Reference

### Core Functions

#### Creating Orders

```javascript
// Create a new order
const order = OrderManagement.createOrder({
  customer: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '555-1234'
  },
  items: [
    {
      productId: 'prod_123',
      name: 'Massage Gun',
      price: 199.99,
      quantity: 1
    }
  ],
  status: 'pending',
  paymentStatus: 'pending',
  shippingAmount: 9.99,
  discountAmount: 0,
  notes: 'Customer requested gift wrapping'
});
```

#### Updating Orders

```javascript
// Update an existing order
const updatedOrder = OrderManagement.updateOrder('ORD-1001', {
  status: 'processing',
  paymentStatus: 'paid',
  notes: 'Payment confirmed'
});
```

#### Retrieving Orders

```javascript
// Get all orders
const allOrders = OrderManagement.getOrders();

// Get orders with filters
const filteredOrders = OrderManagement.getOrders({
  status: 'pending',
  dateFrom: '2023-01-01',
  dateTo: '2023-01-31'
});

// Get a specific order by ID
const order = OrderManagement.getOrderById('ORD-1001');
```

#### Order Statistics

```javascript
// Get order statistics for a specific period
const stats = OrderManagement.getOrderStatistics('month');
console.log(stats.totalOrders);
console.log(stats.totalRevenue);
console.log(stats.averageOrderValue);
```

### Event Handling

The system uses custom events to handle user interactions:

```javascript
// Listen for order status changes
document.addEventListener('orderStatusChanged', function(event) {
  console.log('Order status changed:', event.detail);
});
```

## Troubleshooting

### Common Issues

#### Orders Not Displaying

If orders are not displaying in the dashboard:

1. Check that the `OrderManagement` module is loaded correctly
2. Verify that orders exist in the storage
3. Check for JavaScript errors in the browser console

#### Order Creation Failures

If order creation fails:

1. Ensure all required fields are provided (customer information, at least one item)
2. Check that product IDs are valid if using the product integration
3. Verify that prices and quantities are valid numbers

#### Data Persistence Issues

If order data is not being saved:

1. Check that localStorage is available and not full
2. Verify that the data being saved is valid JSON
3. Clear browser cache and try again

### Getting Help

For additional help with the Order Management System:

1. Consult the Technical Reference section of this guide
2. Check the browser console for error messages
3. Contact the Recovery Essentials development team at support@recoveryessentials.com

---

© 2025 Recovery Essentials. All rights reserved.
