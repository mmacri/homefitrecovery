/**
 * Recovery Essentials - Customer Relationship Management System
 * This module handles customer data, segmentation, analysis, and interactions with orders
 */

// Storage keys
const CUSTOMERS_KEY = 'recoveryEssentials_customers';
const CUSTOMER_COUNTER_KEY = 'recoveryEssentials_customerCounter';
const CUSTOMER_SETTINGS_KEY = 'recoveryEssentials_customerSettings';

// Customer segment constants
const CUSTOMER_SEGMENT = {
  NEW: 'new',
  RETURNING: 'returning',
  VIP: 'vip',
  AT_RISK: 'at_risk',
  INACTIVE: 'inactive'
};

/**
 * Initialize the customer management system
 */
function initCustomerManagement() {
  // Initialize customers storage if it doesn't exist
  let customers = JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || 'null');
  if (!customers) {
    customers = [];
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  }

  // Initialize customer counter if it doesn't exist
  let customerCounter = parseInt(localStorage.getItem(CUSTOMER_COUNTER_KEY) || '0');
  if (!customerCounter) {
    customerCounter = 1000; // Start from customer #1000
    localStorage.setItem(CUSTOMER_COUNTER_KEY, customerCounter.toString());
  }

  // Initialize customer settings if they don't exist
  let customerSettings = JSON.parse(localStorage.getItem(CUSTOMER_SETTINGS_KEY) || 'null');
  if (!customerSettings) {
    customerSettings = {
      autoSegmentation: true,
      sendWelcomeEmail: true,
      sendBirthdayEmail: true,
      segmentThresholds: {
        vipOrderCount: 3,
        vipTotalSpent: 500,
        inactiveDays: 90,
        atRiskDays: 60
      }
    };
    localStorage.setItem(CUSTOMER_SETTINGS_KEY, JSON.stringify(customerSettings));
  }
}

/**
 * Get the next customer ID and increment the counter
 * @returns {number} Next customer ID
 */
function getNextCustomerId() {
  let customerCounter = parseInt(localStorage.getItem(CUSTOMER_COUNTER_KEY) || '1000');
  customerCounter++;
  localStorage.setItem(CUSTOMER_COUNTER_KEY, customerCounter.toString());
  return customerCounter;
}

/**
 * Create a new customer
 * @param {Object} customerData - Customer data
 * @returns {Object} The created customer
 */
function createCustomer(customerData) {
  // Validate required fields
  if (!customerData.name || !customerData.email) {
    throw new Error('Customer name and email are required');
  }

  // Get the next customer ID
  const customerId = getNextCustomerId();

  // Get the customer settings
  const customerSettings = getCustomerSettings();

  // Create new customer object
  const customer = {
    id: `CUST-${customerId}`,
    name: customerData.name,
    email: customerData.email,
    phone: customerData.phone || '',
    address: customerData.address || null,
    segment: customerData.segment || CUSTOMER_SEGMENT.NEW,
    preferences: customerData.preferences || {
      emailOptIn: true,
      smsOptIn: false
    },
    notes: customerData.notes || '',
    dateCreated: new Date().toISOString(),
    dateUpdated: new Date().toISOString(),
    lastOrderDate: null,
    totalOrders: 0,
    totalSpent: 0,
    orderIds: []
  };

  // Get existing customers
  const customers = getCustomers();

  // Add new customer to the beginning of the array
  customers.unshift(customer);

  // Save customers
  saveCustomers(customers);

  // Send welcome email if enabled
  if (customerSettings.sendWelcomeEmail) {
    sendCustomerNotification(customer, 'welcome');
  }

  return customer;
}

/**
 * Update an existing customer
 * @param {string} customerId - Customer ID
 * @param {Object} updateData - Data to update
 * @returns {Object|null} The updated customer or null if not found
 */
function updateCustomer(customerId, updateData) {
  // Get all customers
  const customers = getCustomers();

  // Find the customer to update
  const customerIndex = customers.findIndex(customer => customer.id === customerId);
  if (customerIndex === -1) {
    return null;
  }

  const customer = customers[customerIndex];

  // Update customer fields
  const updatedCustomer = {
    ...customer,
    ...updateData,
    dateUpdated: new Date().toISOString()
  };

  // Save updated customer
  customers[customerIndex] = updatedCustomer;
  saveCustomers(customers);

  return updatedCustomer;
}

/**
 * Delete a customer
 * @param {string} customerId - Customer ID to delete
 * @returns {boolean} True if deleted, false if not found
 */
function deleteCustomer(customerId) {
  // Get all customers
  const customers = getCustomers();

  // Find the customer to delete
  const initialLength = customers.length;
  const filteredCustomers = customers.filter(customer => customer.id !== customerId);

  // If nothing was filtered out, the customer wasn't found
  if (filteredCustomers.length === initialLength) {
    return false;
  }

  // Save the filtered customers
  saveCustomers(filteredCustomers);
  return true;
}

/**
 * Get all customers, optionally filtered by criteria
 * @param {Object} [filters] - Optional filters to apply
 * @returns {Array<Object>} Array of customer objects
 */
function getCustomers(filters = {}) {
  const customers = JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || '[]');

  // Return all customers if no filters provided
  if (!filters || Object.keys(filters).length === 0) {
    return customers;
  }

  // Apply filters
  return customers.filter(customer => {
    let matches = true;

    // Filter by segment
    if (filters.segment && customer.segment !== filters.segment) {
      matches = false;
    }

    // Filter by search term
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      const searchFields = [
        customer.name,
        customer.email,
        customer.phone,
        customer.notes
      ].filter(Boolean);

      const matchesSearch = searchFields.some(field =>
        field.toLowerCase().includes(searchTerm)
      );

      if (!matchesSearch) {
        matches = false;
      }
    }

    // Filter by date range
    if (filters.dateFrom || filters.dateTo) {
      const customerDate = new Date(customer.dateCreated);

      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        if (customerDate < fromDate) {
          matches = false;
        }
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        if (customerDate > toDate) {
          matches = false;
        }
      }
    }

    return matches;
  });
}

/**
 * Get a customer by ID
 * @param {string} customerId - Customer ID
 * @returns {Object|null} Customer object or null if not found
 */
function getCustomerById(customerId) {
  const customers = getCustomers();
  return customers.find(customer => customer.id === customerId) || null;
}

/**
 * Save customers to storage
 * @param {Array<Object>} customers - Customer objects to save
 */
function saveCustomers(customers) {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}

/**
 * Get customer settings
 * @returns {Object} Customer settings
 */
function getCustomerSettings() {
  return JSON.parse(localStorage.getItem(CUSTOMER_SETTINGS_KEY) || '{}');
}

/**
 * Update customer settings
 * @param {Object} settings - New settings to save
 * @returns {Object} Updated settings
 */
function updateCustomerSettings(settings) {
  const currentSettings = getCustomerSettings();
  const updatedSettings = {
    ...currentSettings,
    ...settings
  };
  localStorage.setItem(CUSTOMER_SETTINGS_KEY, JSON.stringify(updatedSettings));
  return updatedSettings;
}

/**
 * Get customer statistics
 * @param {string} [period='all'] - Time period ('day', 'week', 'month', 'year', 'all')
 * @returns {Object} Customer statistics
 */
function getCustomerStatistics(period = 'all') {
  const customers = getCustomers();
  const stats = {
    totalCustomers: customers.length,
    activeCustomers: 0,
    newCustomers: 0,
    returningCustomers: 0,
    vipCustomers: 0,
    atRiskCustomers: 0,
    inactiveCustomers: 0,
    averageLTV: 0,
    retentionRate: 0
  };

  // Filter by time period if needed
  let filteredCustomers = customers;
  if (period !== 'all') {
    const now = new Date();
    let cutoffDate;

    switch (period) {
      case 'day':
        cutoffDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'week':
        cutoffDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
    }

    filteredCustomers = customers.filter(customer =>
      new Date(customer.dateCreated) >= cutoffDate
    );
  }

  // Count customers by segment
  filteredCustomers.forEach(customer => {
    switch (customer.segment) {
      case CUSTOMER_SEGMENT.NEW:
        stats.newCustomers++;
        break;
      case CUSTOMER_SEGMENT.RETURNING:
        stats.returningCustomers++;
        break;
      case CUSTOMER_SEGMENT.VIP:
        stats.vipCustomers++;
        break;
      case CUSTOMER_SEGMENT.AT_RISK:
        stats.atRiskCustomers++;
        break;
      case CUSTOMER_SEGMENT.INACTIVE:
        stats.inactiveCustomers++;
        break;
    }
  });

  // Calculate active customers (new, returning, and VIP)
  stats.activeCustomers = stats.newCustomers + stats.returningCustomers + stats.vipCustomers;

  // Calculate average LTV (Lifetime Value)
  const totalSpent = filteredCustomers.reduce((sum, customer) => sum + (customer.totalSpent || 0), 0);
  stats.averageLTV = filteredCustomers.length ? totalSpent / filteredCustomers.length : 0;

  // Calculate retention rate
  // (returningCustomers + vipCustomers) / (totalCustomers - newCustomers)
  const denominator = stats.totalCustomers - stats.newCustomers;
  stats.retentionRate = denominator > 0 ?
    ((stats.returningCustomers + stats.vipCustomers) / denominator) * 100 : 0;

  return stats;
}

/**
 * Update customer data when a new order is created
 * @param {Object} order - Order object
 */
function updateCustomerFromOrder(order) {
  if (!order || !order.customer || !order.customer.email) {
    return null;
  }

  // Get all customers
  const customers = getCustomers();

  // Find if customer already exists by email
  let customer = customers.find(c => c.email.toLowerCase() === order.customer.email.toLowerCase());
  let isNewCustomer = false;

  // If customer doesn't exist, create one
  if (!customer) {
    isNewCustomer = true;
    const customerId = getNextCustomerId();

    customer = {
      id: `CUST-${customerId}`,
      name: order.customer.name || '',
      email: order.customer.email,
      phone: order.customer.phone || '',
      address: order.shippingAddress || null,
      segment: CUSTOMER_SEGMENT.NEW,
      preferences: {
        emailOptIn: true,
        smsOptIn: false
      },
      notes: '',
      dateCreated: new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
      lastOrderDate: order.dateCreated,
      totalOrders: 1,
      totalSpent: order.totalAmount,
      orderIds: [order.id]
    };

    customers.unshift(customer);
  }
  // If customer exists, update their info
  else {
    const customerIndex = customers.findIndex(c => c.id === customer.id);

    // Update customer data
    customer.lastOrderDate = order.dateCreated;
    customer.totalOrders += 1;
    customer.totalSpent += order.totalAmount;
    customer.dateUpdated = new Date().toISOString();

    // Add order ID if not already in the list
    if (!customer.orderIds.includes(order.id)) {
      customer.orderIds.push(order.id);
    }

    // Update customer segment if auto-segmentation is enabled
    const settings = getCustomerSettings();
    if (settings.autoSegmentation) {
      customer.segment = calculateCustomerSegment(customer, settings);
    }

    customers[customerIndex] = customer;
  }

  // Save updated customers
  saveCustomers(customers);

  return {
    customer,
    isNewCustomer
  };
}

/**
 * Calculate customer segment based on their activities and settings
 * @param {Object} customer - Customer object
 * @param {Object} settings - Customer settings with thresholds
 * @returns {string} Customer segment
 */
function calculateCustomerSegment(customer, settings) {
  // Default to new customer
  if (customer.totalOrders === 1) {
    return CUSTOMER_SEGMENT.NEW;
  }

  // VIP customers (based on order count or total spent)
  if (customer.totalOrders >= settings.segmentThresholds.vipOrderCount ||
      customer.totalSpent >= settings.segmentThresholds.vipTotalSpent) {
    return CUSTOMER_SEGMENT.VIP;
  }

  // Inactive customers (haven't ordered in X days)
  if (customer.lastOrderDate) {
    const lastOrderDate = new Date(customer.lastOrderDate);
    const daysSinceLastOrder = Math.floor((new Date() - lastOrderDate) / (1000 * 60 * 60 * 24));

    if (daysSinceLastOrder >= settings.segmentThresholds.inactiveDays) {
      return CUSTOMER_SEGMENT.INACTIVE;
    }

    if (daysSinceLastOrder >= settings.segmentThresholds.atRiskDays) {
      return CUSTOMER_SEGMENT.AT_RISK;
    }
  }

  // Otherwise, they're a returning customer
  return CUSTOMER_SEGMENT.RETURNING;
}

/**
 * Export customer data to CSV
 * @param {Array<Object>} [customersToExport] - Customers to export (defaults to all)
 * @returns {string} CSV data
 */
function exportCustomersToCSV(customersToExport) {
  const customers = customersToExport || getCustomers();

  // Define CSV headers
  const headers = [
    'ID', 'Name', 'Email', 'Phone', 'Segment', 'Date Created',
    'Last Order Date', 'Total Orders', 'Total Spent', 'Notes'
  ];

  // Create CSV content
  let csv = headers.join(',') + '\n';

  // Add customer data
  customers.forEach(customer => {
    const row = [
      customer.id,
      `"${customer.name.replace(/"/g, '""')}"`,
      `"${customer.email.replace(/"/g, '""')}"`,
      `"${customer.phone.replace(/"/g, '""')}"`,
      customer.segment,
      customer.dateCreated,
      customer.lastOrderDate || '',
      customer.totalOrders,
      customer.totalSpent.toFixed(2),
      `"${(customer.notes || '').replace(/"/g, '""')}"`
    ];

    csv += row.join(',') + '\n';
  });

  return csv;
}

/**
 * Send notification to customer
 * @param {Object} customer - Customer object
 * @param {string} notificationType - Type of notification ('welcome', 'order_confirmation', etc.)
 * @returns {boolean} Success status
 */
function sendCustomerNotification(customer, notificationType) {
  // This is a placeholder function that would connect to an email API
  // In a real implementation, this would send emails through a service like SendGrid or Mailchimp
  console.log(`Sending ${notificationType} notification to ${customer.email}`);

  // For demo purposes, just return true
  return true;
}

/**
 * Get customers by segment with percentage breakdown
 * @returns {Array<Object>} Segment data with count and percentage
 */
function getCustomerSegmentBreakdown() {
  const customers = getCustomers();
  const totalCustomers = customers.length;

  // Initialize counts for each segment
  const segmentCounts = {
    [CUSTOMER_SEGMENT.NEW]: 0,
    [CUSTOMER_SEGMENT.RETURNING]: 0,
    [CUSTOMER_SEGMENT.VIP]: 0,
    [CUSTOMER_SEGMENT.AT_RISK]: 0,
    [CUSTOMER_SEGMENT.INACTIVE]: 0
  };

  // Count customers in each segment
  customers.forEach(customer => {
    if (segmentCounts.hasOwnProperty(customer.segment)) {
      segmentCounts[customer.segment]++;
    }
  });

  // Calculate percentages and format for display
  const segmentData = Object.keys(segmentCounts).map(segment => {
    const count = segmentCounts[segment];
    const percentage = totalCustomers > 0 ? (count / totalCustomers) * 100 : 0;

    return {
      segment,
      count,
      percentage: parseFloat(percentage.toFixed(1)),
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace('_', ' ')
    };
  });

  return segmentData;
}

/**
 * Get customer lifetime value data by segment
 * @returns {Array<Object>} LTV data by segment
 */
function getCustomerLTVBySegment() {
  const customers = getCustomers();

  // Initialize data structure to track total spent and count for each segment
  const segmentData = {
    [CUSTOMER_SEGMENT.NEW]: { totalSpent: 0, count: 0 },
    [CUSTOMER_SEGMENT.RETURNING]: { totalSpent: 0, count: 0 },
    [CUSTOMER_SEGMENT.VIP]: { totalSpent: 0, count: 0 },
    [CUSTOMER_SEGMENT.AT_RISK]: { totalSpent: 0, count: 0 },
    [CUSTOMER_SEGMENT.INACTIVE]: { totalSpent: 0, count: 0 }
  };

  // Sum up spending by segment
  customers.forEach(customer => {
    if (segmentData.hasOwnProperty(customer.segment)) {
      segmentData[customer.segment].totalSpent += customer.totalSpent || 0;
      segmentData[customer.segment].count++;
    }
  });

  // Calculate average LTV for each segment
  return Object.keys(segmentData).map(segment => {
    const { totalSpent, count } = segmentData[segment];
    const averageLTV = count > 0 ? totalSpent / count : 0;

    return {
      segment,
      averageLTV: parseFloat(averageLTV.toFixed(2)),
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace('_', ' ')
    };
  });
}

// Initialize the system when the module is loaded
initCustomerManagement();

// Export the customer management functionality
const CustomerManagement = {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomers,
  getCustomerById,
  getCustomerSettings,
  updateCustomerSettings,
  getCustomerStatistics,
  updateCustomerFromOrder,
  exportCustomersToCSV,
  getCustomerSegmentBreakdown,
  getCustomerLTVBySegment,
  CUSTOMER_SEGMENT
};
