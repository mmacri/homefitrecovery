/**
 * Recovery Essentials - Customer Relationship Management UI
 * This module connects the UI elements to the customer management core functionality
 */

// Global variables
let currentPage = 1;
let itemsPerPage = 10;
let totalPages = 1;
let currentFilters = {};
let chartInstances = {};

// DOM loaded event
document.addEventListener('DOMContentLoaded', function() {
  // Initialize the UI
  initializeUI();

  // Load customer statistics
  loadCustomerStatistics();

  // Load customers data
  loadCustomersData();

  // Initialize charts
  initializeCharts();

  // Set up event listeners
  setupEventListeners();
});

/**
 * Initialize the UI components
 */
function initializeUI() {
  console.log('Initializing customer management UI...');

  // Hide the custom date range selector by default
  const dateRangeFilter = document.getElementById('date-range-filter');
  const customDateRange = document.getElementById('custom-date-range');

  if (dateRangeFilter && customDateRange) {
    dateRangeFilter.addEventListener('change', function() {
      if (this.value === 'custom') {
        customDateRange.classList.remove('hidden');
      } else {
        customDateRange.classList.add('hidden');
      }
    });
  }

  // Setup pagination
  setupPagination();
}

/**
 * Setup event listeners for interactive elements
 */
function setupEventListeners() {
  console.log('Setting up event listeners...');

  // Filter controls
  const applyFiltersButton = document.getElementById('apply-filters');
  if (applyFiltersButton) {
    applyFiltersButton.addEventListener('click', function() {
      applyFilters();
    });
  }

  // Customer search
  const customerSearch = document.getElementById('customer-search');
  if (customerSearch) {
    customerSearch.addEventListener('keyup', function(e) {
      if (e.key === 'Enter') {
        currentFilters.searchTerm = this.value.trim();
        currentPage = 1;
        loadCustomersData();
      }
    });
  }

  // Create customer button
  const createCustomerBtn = document.getElementById('create-customer-btn');
  if (createCustomerBtn) {
    createCustomerBtn.addEventListener('click', function() {
      showCreateCustomerModal();
    });
  }

  // Export customers button
  const exportCustomersBtn = document.getElementById('export-customers-btn');
  if (exportCustomersBtn) {
    exportCustomersBtn.addEventListener('click', function() {
      exportCustomers();
    });
  }

  // Modal close buttons
  const closeModal = document.getElementById('close-modal');
  if (closeModal) {
    closeModal.addEventListener('click', function() {
      document.getElementById('customer-detail-modal').classList.add('hidden');
    });
  }

  const closeCreateEditModal = document.getElementById('close-create-edit-modal');
  if (closeCreateEditModal) {
    closeCreateEditModal.addEventListener('click', function() {
      document.getElementById('create-edit-customer-modal').classList.add('hidden');
    });
  }

  // Cancel button in forms
  const cancelCustomerBtn = document.getElementById('cancel-customer-btn');
  if (cancelCustomerBtn) {
    cancelCustomerBtn.addEventListener('click', function() {
      document.getElementById('create-edit-customer-modal').classList.add('hidden');
    });
  }

  // Customer form submission
  const customerForm = document.getElementById('customer-form');
  if (customerForm) {
    customerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      saveCustomer();
    });
  }

  // Set up pagination buttons
  setupPaginationEventListeners();
}

/**
 * Set up pagination event listeners
 */
function setupPaginationEventListeners() {
  // Pagination controls
  const prevPage = document.getElementById('prev-page');
  if (prevPage) {
    prevPage.addEventListener('click', function() {
      if (currentPage > 1) {
        currentPage--;
        loadCustomersData();
      }
    });
  }

  const nextPage = document.getElementById('next-page');
  if (nextPage) {
    nextPage.addEventListener('click', function() {
      if (currentPage < totalPages) {
        currentPage++;
        loadCustomersData();
      }
    });
  }

  // Mobile pagination
  const prevPageMobile = document.getElementById('prev-page-mobile');
  if (prevPageMobile) {
    prevPageMobile.addEventListener('click', function() {
      if (currentPage > 1) {
        currentPage--;
        loadCustomersData();
      }
    });
  }

  const nextPageMobile = document.getElementById('next-page-mobile');
  if (nextPageMobile) {
    nextPageMobile.addEventListener('click', function() {
      if (currentPage < totalPages) {
        currentPage++;
        loadCustomersData();
      }
    });
  }
}

/**
 * Apply filters from the filter controls
 */
function applyFilters() {
  console.log('Applying filters...');

  // Reset to first page
  currentPage = 1;

  // Get segment filter
  const segmentFilter = document.getElementById('customer-segment-filter');
  if (segmentFilter) {
    currentFilters.segment = segmentFilter.value || '';
  }

  // Get date range filter
  const dateRangeFilter = document.getElementById('date-range-filter');
  if (dateRangeFilter) {
    const dateRangeValue = dateRangeFilter.value;

    if (dateRangeValue === 'custom') {
      // Get custom date range
      const dateFrom = document.getElementById('date-from').value;
      const dateTo = document.getElementById('date-to').value;

      if (dateFrom) {
        currentFilters.dateFrom = new Date(dateFrom);
      } else {
        delete currentFilters.dateFrom;
      }

      if (dateTo) {
        currentFilters.dateTo = new Date(dateTo);
      } else {
        delete currentFilters.dateTo;
      }
    } else {
      setDateRangeFilter(dateRangeValue);
    }
  }

  // Reload customers with new filters
  loadCustomersData();

  // Reload statistics with the same time period
  loadCustomerStatistics(dateRangeFilter ? dateRangeFilter.value : 'last30');
}

/**
 * Set date range filter based on selected option
 * @param {string} dateRangeValue - Selected date range value
 */
function setDateRangeFilter(dateRangeValue) {
  delete currentFilters.dateFrom;
  delete currentFilters.dateTo;

  switch (dateRangeValue) {
    case 'today':
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      currentFilters.dateFrom = today;
      break;
    case 'yesterday':
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      currentFilters.dateFrom = yesterday;

      const endOfYesterday = new Date();
      endOfYesterday.setDate(endOfYesterday.getDate() - 1);
      endOfYesterday.setHours(23, 59, 59, 999);
      currentFilters.dateTo = endOfYesterday;
      break;
    case 'last7':
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);
      currentFilters.dateFrom = last7Days;
      break;
    case 'last30':
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);
      currentFilters.dateFrom = last30Days;
      break;
    case 'thisMonth':
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);
      currentFilters.dateFrom = firstDayOfMonth;
      break;
    case 'lastMonth':
      const firstDayOfLastMonth = new Date();
      firstDayOfLastMonth.setMonth(firstDayOfLastMonth.getMonth() - 1);
      firstDayOfLastMonth.setDate(1);
      firstDayOfLastMonth.setHours(0, 0, 0, 0);
      currentFilters.dateFrom = firstDayOfLastMonth;

      const lastDayOfLastMonth = new Date();
      lastDayOfLastMonth.setDate(0);
      lastDayOfLastMonth.setHours(23, 59, 59, 999);
      currentFilters.dateTo = lastDayOfLastMonth;
      break;
  }
}

/**
 * Load customer data with current filters and pagination
 */
function loadCustomersData() {
  console.log('Loading customer data...');

  try {
    // Get all customers with current filters
    const customers = CustomerManagement.getCustomers(currentFilters);

    // Setup pagination
    const totalCustomers = customers.length;
    totalPages = Math.ceil(totalCustomers / itemsPerPage);

    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalCustomers);
    const paginatedCustomers = customers.slice(startIndex, endIndex);

    // Update pagination UI
    updatePaginationUI(startIndex, endIndex, totalCustomers);

    // Render customers in the table
    renderCustomersTable(paginatedCustomers);
  } catch (error) {
    console.error('Error loading customers:', error);
    // Show error message to user
    const tableBody = document.getElementById('customers-table-body');
    if (tableBody) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="px-6 py-4 text-center text-red-500">
            Error loading customers. Please try again later.
          </td>
        </tr>
      `;
    }
  }
}

/**
 * Update customer statistics in the UI
 */
function loadCustomerStatistics(period = 'last30') {
  console.log('Loading customer statistics...');

  try {
    const stats = CustomerManagement.getCustomerStatistics(getTimePeriodForStats(period));

    // Update statistics cards
    const totalCustomersElement = document.getElementById('total-customers');
    if (totalCustomersElement) {
      totalCustomersElement.textContent = stats.totalCustomers;
    }

    const avgCustomerLtvElement = document.getElementById('avg-customer-ltv');
    if (avgCustomerLtvElement) {
      avgCustomerLtvElement.textContent = `$${stats.averageLTV.toFixed(2)}`;
    }

    const activeCustomersElement = document.getElementById('active-customers');
    if (activeCustomersElement) {
      activeCustomersElement.textContent = stats.activeCustomers;
    }

    const retentionRateElement = document.getElementById('retention-rate');
    if (retentionRateElement) {
      retentionRateElement.textContent = `${stats.retentionRate.toFixed(1)}%`;
    }

    // Update charts
    updateCharts();
  } catch (error) {
    console.error('Error loading customer statistics:', error);
  }
}

/**
 * Convert UI date period to statistics time period
 * @param {string} period - UI date period
 * @returns {string} Statistics time period
 */
function getTimePeriodForStats(period) {
  switch (period) {
    case 'today':
    case 'yesterday':
      return 'day';
    case 'last7':
      return 'week';
    case 'last30':
    case 'thisMonth':
    case 'lastMonth':
      return 'month';
    case 'custom':
      return 'all';
    default:
      return 'month';
  }
}

/**
 * Mock function to initialize charts
 * In a real implementation, this would create actual charts
 */
function initializeCharts() {
  console.log('Initializing charts...');
  // This function would create actual charts in a real implementation
}

/**
 * Mock function to update charts
 * In a real implementation, this would update chart data
 */
function updateCharts() {
  console.log('Updating charts...');
  // This function would update chart data in a real implementation
}

/**
 * Setup pagination component
 */
function setupPagination() {
  console.log('Setting up pagination...');

  const paginationNumbers = document.getElementById('pagination-numbers');
  if (paginationNumbers) {
    paginationNumbers.innerHTML = '';

    const pageButton = document.createElement('button');
    pageButton.className = 'relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium bg-indigo-50 text-indigo-600 z-10';
    pageButton.textContent = '1';
    paginationNumbers.appendChild(pageButton);
  }
}

/**
 * Update pagination UI elements
 * @param {number} startIndex - Start index of current page
 * @param {number} endIndex - End index of current page
 * @param {number} totalItems - Total number of items
 */
function updatePaginationUI(startIndex, endIndex, totalItems) {
  // Update page info text
  const pageStart = document.getElementById('page-start');
  const pageEnd = document.getElementById('page-end');
  const totalItemsElement = document.getElementById('total-items');

  if (pageStart) pageStart.textContent = totalItems ? startIndex + 1 : 0;
  if (pageEnd) pageEnd.textContent = endIndex;
  if (totalItemsElement) totalItemsElement.textContent = totalItems;

  // Generate page numbers
  const paginationNumbers = document.getElementById('pagination-numbers');
  if (paginationNumbers) {
    paginationNumbers.innerHTML = '';

    // Create page buttons
    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement('button');
      pageButton.className = `relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${i === currentPage ? 'bg-indigo-50 text-indigo-600 z-10' : 'text-gray-500 hover:bg-gray-50'}`;
      pageButton.textContent = i;
      pageButton.addEventListener('click', function() {
        currentPage = i;
        loadCustomersData();
      });
      paginationNumbers.appendChild(pageButton);
    }
  }
}

/**
 * Render customers in the table
 * @param {Array<Object>} customers - Array of customer objects
 */
function renderCustomersTable(customers) {
  console.log('Rendering customers table...');

  const tableBody = document.getElementById('customers-table-body');
  if (!tableBody) return;

  // Clear existing rows
  tableBody.innerHTML = '';

  // If no customers, show message
  if (!customers || customers.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="px-6 py-4 text-center text-gray-500">
          No customers found matching the criteria
        </td>
      </tr>
    `;
    return;
  }

  // Render customer rows
  customers.forEach(customer => {
    const row = document.createElement('tr');

    // Format the data for display
    const formattedData = formatCustomerDataForDisplay(customer);

    // Create row HTML
    row.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="flex items-center">
          <div>
            <div class="text-sm font-medium text-gray-900">${customer.name}</div>
          </div>
        </div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-sm text-gray-900">${customer.email}</div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        ${customer.totalOrders || 0}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        $${(customer.totalSpent || 0).toFixed(2)}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        ${formattedData.lastOrderDate}
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSegmentColorClass(customer.segment)}">
          ${formattedData.segmentLabel}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button class="text-indigo-600 hover:text-indigo-900 mr-3 view-customer" data-id="${customer.id}">
          <i class="fas fa-eye"></i>
        </button>
        <button class="text-blue-600 hover:text-blue-900 mr-3 edit-customer" data-id="${customer.id}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="text-red-600 hover:text-red-900 delete-customer" data-id="${customer.id}">
          <i class="fas fa-trash-alt"></i>
        </button>
      </td>
    `;

    // Add row to table
    tableBody.appendChild(row);

    // Add event listeners to buttons
    setupRowActionButtons(row, customer.id, customer.name);
  });
}

/**
 * Setup action buttons in customer table row
 * @param {HTMLElement} row - Table row element
 * @param {string} customerId - Customer ID
 * @param {string} customerName - Customer name
 */
function setupRowActionButtons(row, customerId, customerName) {
  // View button
  const viewBtn = row.querySelector('.view-customer');
  if (viewBtn) {
    viewBtn.addEventListener('click', function() {
      // This function would show customer details in a real implementation
      alert(`Viewing details for customer: ${customerName}`);
    });
  }

  // Edit button
  const editBtn = row.querySelector('.edit-customer');
  if (editBtn) {
    editBtn.addEventListener('click', function() {
      // This function would show edit form in a real implementation
      alert(`Editing customer: ${customerName}`);
    });
  }

  // Delete button
  const deleteBtn = row.querySelector('.delete-customer');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', function() {
      // This function would confirm deletion in a real implementation
      if (confirm(`Are you sure you want to delete customer: ${customerName}?`)) {
        alert(`Customer deleted: ${customerName}`);
      }
    });
  }
}

/**
 * Format customer data for display
 * @param {Object} customer - Customer object
 * @returns {Object} Formatted data
 */
function formatCustomerDataForDisplay(customer) {
  // Format last order date
  const lastOrderDate = customer.lastOrderDate
    ? new Date(customer.lastOrderDate).toLocaleDateString()
    : 'N/A';

  // Format segment label
  const segmentLabel = customer.segment
    ? customer.segment.charAt(0).toUpperCase() + customer.segment.slice(1).replace('_', ' ')
    : 'New';

  return {
    lastOrderDate,
    segmentLabel
  };
}

/**
 * Get color classes for different customer segments
 * @param {string} segment - Customer segment
 * @returns {string} Tailwind CSS color classes
 */
function getSegmentColorClass(segment) {
  switch (segment) {
    case 'new':
      return 'bg-green-100 text-green-800';
    case 'returning':
      return 'bg-blue-100 text-blue-800';
    case 'vip':
      return 'bg-purple-100 text-purple-800';
    case 'at_risk':
      return 'bg-yellow-100 text-yellow-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Export customers to CSV
 */
function exportCustomers() {
  console.log('Exporting customers...');

  try {
    // Get all customers
    const customers = CustomerManagement.getCustomers(currentFilters);

    // Generate CSV
    const csv = CustomerManagement.exportCustomersToCSV(customers);

    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'customers.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error exporting customers:', error);
    alert('Failed to export customers. Please try again.');
  }
}

/**
 * Show create customer modal
 */
function showCreateCustomerModal() {
  console.log('Showing create customer modal...');

  // Clear form
  const form = document.getElementById('customer-form');
  if (form) form.reset();

  // Reset hidden ID field
  const idField = document.getElementById('edit-customer-id');
  if (idField) idField.value = '';

  // Update modal title
  const modalTitle = document.getElementById('create-edit-modal-title');
  if (modalTitle) modalTitle.textContent = 'Create New Customer';

  // Show modal
  const modal = document.getElementById('create-edit-customer-modal');
  if (modal) modal.classList.remove('hidden');
}

/**
 * Save customer (create or update)
 */
function saveCustomer() {
  console.log('Saving customer...');

  // Get form data
  const form = document.getElementById('customer-form');
  if (!form) return;

  // Validate form (basic validation)
  const name = document.getElementById('customer-name').value.trim();
  const email = document.getElementById('customer-email').value.trim();

  if (!name || !email) {
    alert('Name and email are required');
    return;
  }

  try {
    // Get customer data
    const customerId = document.getElementById('edit-customer-id').value;
    const customer = {
      name,
      email,
      phone: document.getElementById('customer-phone').value.trim(),
      segment: document.getElementById('customer-segment').value,
      address: {
        street: document.getElementById('customer-address').value.trim(),
        city: document.getElementById('customer-city').value.trim(),
        state: document.getElementById('customer-state').value.trim(),
        zip: document.getElementById('customer-zip').value.trim(),
        country: document.getElementById('customer-country').value.trim()
      },
      preferences: {
        emailOptIn: document.getElementById('email-opt-in').checked,
        smsOptIn: document.getElementById('sms-opt-in').checked
      },
      notes: document.getElementById('customer-notes').value.trim()
    };

    // Create or update customer
    if (customerId) {
      // Update existing customer
      CustomerManagement.updateCustomer(customerId, customer);
      alert('Customer updated successfully');
    } else {
      // Create new customer
      CustomerManagement.createCustomer(customer);
      alert('Customer created successfully');
    }

    // Close modal
    const modal = document.getElementById('create-edit-customer-modal');
    if (modal) modal.classList.add('hidden');

    // Reload customer data
    loadCustomersData();
    loadCustomerStatistics();
  } catch (error) {
    console.error('Error saving customer:', error);
    alert(`Failed to save customer: ${error.message}`);
  }
}
