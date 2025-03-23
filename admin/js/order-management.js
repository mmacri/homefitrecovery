/**
 * Recovery Essentials - Order Management System
 * This module handles customer orders, processing, and order history
 */

// Storage keys
const ORDERS_KEY = 'recoveryEssentials_orders';
const ORDER_COUNTER_KEY = 'recoveryEssentials_orderCounter';
const ORDER_SETTINGS_KEY = 'recoveryEssentials_orderSettings';

// Order status constants
const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  ON_HOLD: 'on_hold',
  BACKORDERED: 'backordered',
  COMPLETED: 'completed'
};

// Payment status constants
const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded'
};

/**
 * Initialize the order management system
 */
function initOrderManagement() {
  // Initialize orders storage if it doesn't exist
  let orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || 'null');
  if (!orders) {
    orders = [];
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }

  // Initialize order counter if it doesn't exist
  let orderCounter = parseInt(localStorage.getItem(ORDER_COUNTER_KEY) || '0');
  if (!orderCounter) {
    orderCounter = 1000; // Start from order #1000
    localStorage.setItem(ORDER_COUNTER_KEY, orderCounter.toString());
  }

  // Initialize order settings if they don't exist
  let orderSettings = JSON.parse(localStorage.getItem(ORDER_SETTINGS_KEY) || 'null');
  if (!orderSettings) {
    orderSettings = {
      autoUpdateInventory: true,
      sendEmailNotifications: true,
      defaultOrderStatus: ORDER_STATUS.PENDING,
      taxRate: 0.0825, // 8.25% default tax rate
      defaultShippingOptions: [
        { id: 'standard', name: 'Standard Shipping', price: 5.99, days: '5-7' },
        { id: 'express', name: 'Express Shipping', price: 12.99, days: '2-3' },
        { id: 'overnight', name: 'Overnight Shipping', price: 24.99, days: '1' }
      ]
    };
    localStorage.setItem(ORDER_SETTINGS_KEY, JSON.stringify(orderSettings));
  }
}

/**
 * Get the next order number and increment the counter
 * @returns {number} Next order number
 */
function getNextOrderNumber() {
  let orderCounter = parseInt(localStorage.getItem(ORDER_COUNTER_KEY) || '1000');
  orderCounter++;
  localStorage.setItem(ORDER_COUNTER_KEY, orderCounter.toString());
  return orderCounter;
}

/**
 * Create a new order
 * @param {Object} orderData - Order data
 * @returns {Object} The created order
 */
function createOrder(orderData) {
  // Validate required fields
  if (!orderData.customer || !orderData.items || !orderData.items.length) {
    throw new Error('Customer and at least one item are required to create an order');
  }

  // Get the next order number
  const orderNumber = getNextOrderNumber();

  // Get the order settings
  const orderSettings = getOrderSettings();

  // Prepare items with additional calculated fields
  const items = orderData.items.map(item => {
    // Calculate line total (price * quantity)
    const lineTotal = (item.price || 0) * (item.quantity || 1);

    return {
      ...item,
      lineTotal
    };
  });

  // Calculate order subtotal
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  // Calculate tax amount
  const taxAmount = orderData.taxAmount || (subtotal * orderSettings.taxRate);

  // Calculate shipping amount
  const shippingAmount = orderData.shippingAmount || 0;

  // Calculate discount amount
  const discountAmount = orderData.discountAmount || 0;

  // Calculate total amount
  const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

  // Create new order object
  const order = {
    id: `ORD-${orderNumber}`,
    orderNumber,
    customer: orderData.customer,
    items,
    subtotal,
    taxAmount,
    shippingAmount,
    discountAmount,
    totalAmount,
    status: orderData.status || orderSettings.defaultOrderStatus,
    paymentStatus: orderData.paymentStatus || PAYMENT_STATUS.PENDING,
    shippingAddress: orderData.shippingAddress || null,
    billingAddress: orderData.billingAddress || null,
    paymentMethod: orderData.paymentMethod || null,
    shippingMethod: orderData.shippingMethod || null,
    notes: orderData.notes || '',
    dateCreated: new Date().toISOString(),
    dateUpdated: new Date().toISOString(),
    history: [
      {
        action: 'order_created',
        status: orderData.status || orderSettings.defaultOrderStatus,
        timestamp: new Date().toISOString(),
        note: 'Order created'
      }
    ]
  };

  // Get existing orders
  const orders = getOrders();

  // Add new order to the beginning of the array
  orders.unshift(order);

  // Save orders
  saveOrders(orders);

  // Update inventory if enabled
  if (orderSettings.autoUpdateInventory) {
    updateProductInventory(order);
  }

  // Send email notification if enabled
  if (orderSettings.sendEmailNotifications) {
    sendOrderNotification(order, 'new_order');
  }

  return order;
}

/**
 * Update an existing order
 * @param {string} orderId - Order ID
 * @param {Object} updateData - Data to update
 * @returns {Object|null} The updated order or null if not found
 */
function updateOrder(orderId, updateData) {
  // Get all orders
  const orders = getOrders();

  // Find the order to update
  const orderIndex = orders.findIndex(order => order.id === orderId);
  if (orderIndex === -1) {
    return null;
  }

  const order = orders[orderIndex];
  const previousStatus = order.status;

  // Update order fields
  const updatedOrder = {
    ...order,
    ...updateData,
    dateUpdated: new Date().toISOString()
  };

  // Add history entry for status change
  if (updateData.status && updateData.status !== previousStatus) {
    updatedOrder.history = [
      ...order.history,
      {
        action: 'status_changed',
        status: updateData.status,
        previousStatus,
        timestamp: new Date().toISOString(),
        note: updateData.statusNote || `Status changed from ${previousStatus} to ${updateData.status}`
      }
    ];

    // Send notification for status change
    const orderSettings = getOrderSettings();
    if (orderSettings.sendEmailNotifications) {
      sendOrderNotification(updatedOrder, 'status_update');
    }
  }

  // Update the order in the array
  orders[orderIndex] = updatedOrder;

  // Save orders
  saveOrders(orders);

  return updatedOrder;
}

/**
 * Get all orders
 * @param {Object} filters - Filters to apply
 * @returns {Array} Array of orders
 */
function getOrders(filters = {}) {
  const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');

  // Return all orders if no filters
  if (!filters || Object.keys(filters).length === 0) {
    return orders;
  }

  // Apply filters
  return orders.filter(order => {
    let match = true;

    // Filter by status
    if (filters.status && order.status !== filters.status) {
      match = false;
    }

    // Filter by payment status
    if (filters.paymentStatus && order.paymentStatus !== filters.paymentStatus) {
      match = false;
    }

    // Filter by customer ID
    if (filters.customerId && order.customer.id !== filters.customerId) {
      match = false;
    }

    // Filter by date range
    if (filters.dateFrom || filters.dateTo) {
      const orderDate = new Date(order.dateCreated);

      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        if (orderDate < fromDate) {
          match = false;
        }
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        if (orderDate > toDate) {
          match = false;
        }
      }
    }

    // Filter by minimum order amount
    if (filters.minAmount && order.totalAmount < filters.minAmount) {
      match = false;
    }

    // Filter by maximum order amount
    if (filters.maxAmount && order.totalAmount > filters.maxAmount) {
      match = false;
    }

    return match;
  });
}

/**
 * Get a single order by ID
 * @param {string} orderId - Order ID
 * @returns {Object|null} Order object or null if not found
 */
function getOrderById(orderId) {
  const orders = getOrders();
  return orders.find(order => order.id === orderId) || null;
}

/**
 * Save orders to storage
 * @param {Array} orders - Array of order objects
 */
function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

/**
 * Get order settings
 * @returns {Object} Order settings
 */
function getOrderSettings() {
  return JSON.parse(localStorage.getItem(ORDER_SETTINGS_KEY) || '{}');
}

/**
 * Update order settings
 * @param {Object} settings - New settings
 * @returns {Object} Updated settings
 */
function updateOrderSettings(settings) {
  const currentSettings = getOrderSettings();
  const updatedSettings = {
    ...currentSettings,
    ...settings
  };
  localStorage.setItem(ORDER_SETTINGS_KEY, JSON.stringify(updatedSettings));
  return updatedSettings;
}

/**
 * Update product inventory based on order
 * @param {Object} order - Order object
 */
function updateProductInventory(order) {
  // Check if product inventory management is available
  if (!window.ProductAnalytics) {
    console.warn('Product Analytics module not available. Inventory not updated.');
    return;
  }

  // Get product inventory data
  const productInventory = JSON.parse(localStorage.getItem('recoveryEssentials_inventory') || '{}');

  // Update inventory for each item in the order
  order.items.forEach(item => {
    if (!item.productId) return;

    const inventoryItem = productInventory[item.productId];
    if (inventoryItem && inventoryItem.manageStock) {
      // Reduce stock quantity
      inventoryItem.stockQuantity = Math.max(0, inventoryItem.stockQuantity - (item.quantity || 1));
      inventoryItem.lastUpdated = new Date().toISOString();
    }
  });

  // Save updated inventory
  localStorage.setItem('recoveryEssentials_inventory', JSON.stringify(productInventory));
}

/**
 * Add note to an order
 * @param {string} orderId - Order ID
 * @param {string} note - Note text
 * @param {boolean} isPrivate - Whether the note is private (admin only)
 * @returns {Object|null} Updated order or null if not found
 */
function addOrderNote(orderId, note, isPrivate = true) {
  // Get order
  const order = getOrderById(orderId);
  if (!order) return null;

  // Add note to history
  const updatedOrder = {
    ...order,
    history: [
      ...order.history,
      {
        action: 'note_added',
        timestamp: new Date().toISOString(),
        note,
        isPrivate
      }
    ],
    dateUpdated: new Date().toISOString()
  };

  // Update order
  return updateOrder(orderId, updatedOrder);
}

/**
 * Process refund for an order
 * @param {string} orderId - Order ID
 * @param {number} amount - Refund amount
 * @param {string} reason - Refund reason
 * @returns {Object|null} Updated order or null if not found
 */
function processRefund(orderId, amount, reason) {
  // Get order
  const order = getOrderById(orderId);
  if (!order) return null;

  // Validate refund amount
  if (amount <= 0 || amount > order.totalAmount) {
    throw new Error('Invalid refund amount');
  }

  // Determine new payment status
  let newPaymentStatus;
  if (amount === order.totalAmount) {
    newPaymentStatus = PAYMENT_STATUS.REFUNDED;
  } else {
    newPaymentStatus = PAYMENT_STATUS.PARTIALLY_REFUNDED;
  }

  // Create refund record
  const refund = {
    id: `REF-${Date.now()}`,
    orderId,
    amount,
    reason,
    date: new Date().toISOString()
  };

  // Update order
  const updatedOrder = {
    ...order,
    paymentStatus: newPaymentStatus,
    refunds: [...(order.refunds || []), refund],
    refundedAmount: (order.refundedAmount || 0) + amount,
    history: [
      ...order.history,
      {
        action: 'refund_processed',
        timestamp: new Date().toISOString(),
        amount,
        reason,
        paymentStatus: newPaymentStatus
      }
    ],
    dateUpdated: new Date().toISOString()
  };

  // Send notification
  const orderSettings = getOrderSettings();
  if (orderSettings.sendEmailNotifications) {
    sendOrderNotification(updatedOrder, 'refund_processed');
  }

  // Update order
  return updateOrder(orderId, updatedOrder);
}

/**
 * Send order notification
 * @param {Object} order - Order object
 * @param {string} type - Notification type
 */
function sendOrderNotification(order, type) {
  // This is a placeholder function since we can't send real emails in the demo
  console.log(`[Notification] Order ${order.id} - Type: ${type}`);

  // In a real implementation, this would connect to an email service
  // or notification system to send emails to customers and/or admins
}

/**
 * Generate order invoice
 * @param {string} orderId - Order ID
 * @returns {string} Invoice HTML
 */
function generateOrderInvoice(orderId) {
  // Get order
  const order = getOrderById(orderId);
  if (!order) return null;

  // This is a simplified invoice generator
  let invoiceHtml = `
    <div class="invoice">
      <div class="invoice-header">
        <h1>Invoice</h1>
        <p>Order #: ${order.orderNumber}</p>
        <p>Date: ${new Date(order.dateCreated).toLocaleDateString()}</p>
      </div>

      <div class="customer-info">
        <h2>Customer</h2>
        <p>${order.customer.name}</p>
        <p>${order.customer.email}</p>
        ${order.billingAddress ? `
          <h3>Billing Address</h3>
          <p>${order.billingAddress.line1}</p>
          ${order.billingAddress.line2 ? `<p>${order.billingAddress.line2}</p>` : ''}
          <p>${order.billingAddress.city}, ${order.billingAddress.state} ${order.billingAddress.zip}</p>
          <p>${order.billingAddress.country}</p>
        ` : ''}

        ${order.shippingAddress ? `
          <h3>Shipping Address</h3>
          <p>${order.shippingAddress.line1}</p>
          ${order.shippingAddress.line2 ? `<p>${order.shippingAddress.line2}</p>` : ''}
          <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}</p>
          <p>${order.shippingAddress.country}</p>
        ` : ''}
      </div>

      <div class="order-items">
        <h2>Items</h2>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>$${item.lineTotal.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="order-totals">
        <div class="total-line">
          <span>Subtotal:</span>
          <span>$${order.subtotal.toFixed(2)}</span>
        </div>
        <div class="total-line">
          <span>Tax:</span>
          <span>$${order.taxAmount.toFixed(2)}</span>
        </div>
        <div class="total-line">
          <span>Shipping:</span>
          <span>$${order.shippingAmount.toFixed(2)}</span>
        </div>
        ${order.discountAmount > 0 ? `
        <div class="total-line">
          <span>Discount:</span>
          <span>-$${order.discountAmount.toFixed(2)}</span>
        </div>
        ` : ''}
        <div class="total-line total">
          <span>Total:</span>
          <span>$${order.totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  `;

  return invoiceHtml;
}

/**
 * Get order statistics
 * @param {string} period - Time period (today, week, month, year)
 * @returns {Object} Order statistics
 */
function getOrderStatistics(period = 'month') {
  // Get all orders
  const orders = getOrders();

  // Determine date range
  const now = new Date();
  let startDate;

  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
  }

  // Filter orders by date
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.dateCreated);
    return orderDate >= startDate && orderDate <= now;
  });

  // Calculate statistics
  const totalOrders = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Count orders by status
  const ordersByStatus = {};
  ORDER_STATUS.forEach(status => {
    ordersByStatus[status] = filteredOrders.filter(order => order.status === status).length;
  });

  // Count orders by payment status
  const ordersByPaymentStatus = {};
  PAYMENT_STATUS.forEach(status => {
    ordersByPaymentStatus[status] = filteredOrders.filter(order => order.paymentStatus === status).length;
  });

  // Get top selling products
  const productSales = {};
  filteredOrders.forEach(order => {
    order.items.forEach(item => {
      if (!item.productId) return;

      if (!productSales[item.productId]) {
        productSales[item.productId] = {
          quantity: 0,
          revenue: 0
        };
      }

      productSales[item.productId].quantity += item.quantity || 1;
      productSales[item.productId].revenue += item.lineTotal;
    });
  });

  // Convert to array and sort by quantity
  const topSellingProducts = Object.entries(productSales)
    .map(([productId, data]) => ({
      productId,
      quantity: data.quantity,
      revenue: data.revenue
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return {
    period,
    totalOrders,
    totalRevenue,
    averageOrderValue,
    ordersByStatus,
    ordersByPaymentStatus,
    topSellingProducts
  };
}

// Initialize the order management system
document.addEventListener('DOMContentLoaded', function() {
  initOrderManagement();
});

// Export functionality
window.OrderManagement = {
  // Order management
  createOrder,
  updateOrder,
  getOrders,
  getOrderById,
  addOrderNote,
  processRefund,

  // Utilities
  generateOrderInvoice,
  getOrderStatistics,
  updateOrderSettings,
  getOrderSettings,

  // Constants
  ORDER_STATUS,
  PAYMENT_STATUS
};
