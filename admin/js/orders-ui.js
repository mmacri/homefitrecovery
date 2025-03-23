/**
 * Recovery Essentials - Orders UI Controller
 * This file connects the orders.html UI with the order-management.js functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize and check if OrderManagement module is available
    if (!window.OrderManagement) {
        console.error('Order Management module not found!');
        document.getElementById('orders-table-body').innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-4 text-center text-red-500">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    Error: Order Management system failed to load.
                </td>
            </tr>
        `;
        return;
    }

    // Initialize variables
    let currentPage = 1;
    const pageSize = 10;
    let totalOrders = 0;
    let allOrders = [];
    let filteredOrders = [];
    let currentFilters = {};

    // DOM Elements - Tables and containers
    const ordersTableBody = document.getElementById('orders-table-body');
    const topProductsTable = document.getElementById('top-products-table');
    const recentActivityContainer = document.getElementById('recent-activity');
    const paginationNumbers = document.getElementById('pagination-numbers');

    // DOM Elements - Statistic displays
    const totalOrdersElement = document.getElementById('total-orders');
    const totalRevenueElement = document.getElementById('total-revenue');
    const avgOrderValueElement = document.getElementById('avg-order-value');
    const pendingOrdersElement = document.getElementById('pending-orders');

    // DOM Elements - Filters
    const orderStatusFilter = document.getElementById('order-status-filter');
    const dateRangeFilter = document.getElementById('date-range-filter');
    const dateFromInput = document.getElementById('date-from');
    const dateToInput = document.getElementById('date-to');
    const customDateRangeDiv = document.getElementById('custom-date-range');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const orderSearchInput = document.getElementById('order-search');

    // DOM Elements - Pagination
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const prevPageMobileBtn = document.getElementById('prev-page-mobile');
    const nextPageMobileBtn = document.getElementById('next-page-mobile');
    const pageStart = document.getElementById('page-start');
    const pageEnd = document.getElementById('page-end');
    const totalItems = document.getElementById('total-items');

    // DOM Elements - Modals
    const orderDetailModal = document.getElementById('order-detail-modal');
    const orderDetailContent = document.getElementById('order-detail-content');
    const closeModalBtn = document.getElementById('close-modal');
    const modalTitle = document.getElementById('modal-title');
    const printOrderBtn = document.getElementById('print-order');
    const editOrderBtn = document.getElementById('edit-order');

    const createEditOrderModal = document.getElementById('create-edit-order-modal');
    const closeCreateEditModalBtn = document.getElementById('close-create-edit-modal');
    const createEditModalTitle = document.getElementById('create-edit-modal-title');
    const orderForm = document.getElementById('order-form');
    const editOrderIdInput = document.getElementById('edit-order-id');

    const addItemModal = document.getElementById('add-item-modal');
    const closeAddItemModalBtn = document.getElementById('close-add-item-modal');
    const addItemForm = document.getElementById('add-item-form');

    // DOM Elements - Buttons
    const createOrderBtn = document.getElementById('create-order-btn');
    const exportOrdersBtn = document.getElementById('export-orders-btn');
    const addItemBtn = document.getElementById('add-item-btn');
    const cancelOrderBtn = document.getElementById('cancel-order-btn');
    const cancelAddItemBtn = document.getElementById('cancel-add-item-btn');

    // Initialize data
    init();

    // Initialize the dashboard
    function init() {
        // Load all orders
        loadOrders();

        // Load order statistics
        updateOrderStatistics();

        // Load top selling products
        updateTopSellingProducts();

        // Load recent activity
        updateRecentActivity();

        // Set up event listeners
        setupEventListeners();
    }

    // Set up all event listeners
    function setupEventListeners() {
        // Filter event listeners
        dateRangeFilter.addEventListener('change', handleDateRangeChange);
        applyFiltersBtn.addEventListener('click', applyFilters);
        orderSearchInput.addEventListener('input', handleSearch);

        // Pagination event listeners
        prevPageBtn.addEventListener('click', () => navigateToPage(currentPage - 1));
        nextPageBtn.addEventListener('click', () => navigateToPage(currentPage + 1));
        prevPageMobileBtn.addEventListener('click', () => navigateToPage(currentPage - 1));
        nextPageMobileBtn.addEventListener('click', () => navigateToPage(currentPage + 1));

        // Modal event listeners
        closeModalBtn.addEventListener('click', () => toggleModal(orderDetailModal, false));
        closeCreateEditModalBtn.addEventListener('click', () => toggleModal(createEditOrderModal, false));
        closeAddItemModalBtn.addEventListener('click', () => toggleModal(addItemModal, false));

        // Button event listeners
        createOrderBtn.addEventListener('click', openCreateOrderModal);
        exportOrdersBtn.addEventListener('click', exportOrders);
        addItemBtn.addEventListener('click', openAddItemModal);
        cancelOrderBtn.addEventListener('click', () => toggleModal(createEditOrderModal, false));
        cancelAddItemBtn.addEventListener('click', () => toggleModal(addItemModal, false));

        // Form submissions
        orderForm.addEventListener('submit', handleOrderFormSubmit);
        addItemForm.addEventListener('submit', handleAddItemSubmit);

        // Other button actions
        printOrderBtn.addEventListener('click', printOrderDetails);
        editOrderBtn.addEventListener('click', handleEditOrderClick);

        // Add event listeners for custom events from global function calls
        document.addEventListener('showOrderDetails', function(event) {
            if (event.detail && event.detail.orderId) {
                showOrderDetails(event.detail.orderId);
            }
        });

        document.addEventListener('editOrder', function(event) {
            if (event.detail && event.detail.orderId) {
                editOrder(event.detail.orderId);
            }
        });

        document.addEventListener('deleteOrder', function(event) {
            if (event.detail && event.detail.orderId) {
                deleteOrder(event.detail.orderId);
            }
        });
    }

    // Handle date range filter change
    function handleDateRangeChange() {
        const selectedValue = dateRangeFilter.value;
        if (selectedValue === 'custom') {
            customDateRangeDiv.classList.remove('hidden');
        } else {
            customDateRangeDiv.classList.add('hidden');
        }
    }

    // Apply filters to orders
    function applyFilters() {
        currentFilters = {};

        // Get status filter
        const status = orderStatusFilter.value;
        if (status) {
            currentFilters.status = status;
        }

        // Get date range
        const dateRange = dateRangeFilter.value;
        if (dateRange === 'custom') {
            if (dateFromInput.value) {
                currentFilters.dateFrom = dateFromInput.value;
            }
            if (dateToInput.value) {
                currentFilters.dateTo = dateToInput.value;
            }
        } else if (dateRange) {
            const now = new Date();
            let fromDate;

            switch (dateRange) {
                case 'today':
                    fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'yesterday':
                    fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
                    break;
                case 'last7':
                    fromDate = new Date(now);
                    fromDate.setDate(now.getDate() - 7);
                    break;
                case 'last30':
                    fromDate = new Date(now);
                    fromDate.setDate(now.getDate() - 30);
                    break;
                case 'thisMonth':
                    fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case 'lastMonth':
                    fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    break;
            }

            if (fromDate) {
                currentFilters.dateFrom = fromDate.toISOString();
            }
        }

        // Reset to first page and reload with filters
        currentPage = 1;
        loadOrders();
    }

    // Handle search input
    function handleSearch() {
        const searchTerm = orderSearchInput.value.toLowerCase().trim();

        if (searchTerm === '') {
            // If search is cleared, just apply other filters
            currentPage = 1;
            loadOrders();
            return;
        }

        // Filter all orders by search term (client-side filtering)
        filteredOrders = allOrders.filter(order => {
            // Search in order number
            if (order.orderNumber.toString().includes(searchTerm)) return true;

            // Search in customer name or email
            if (order.customer.name.toLowerCase().includes(searchTerm)) return true;
            if (order.customer.email.toLowerCase().includes(searchTerm)) return true;

            // Search in order items
            if (order.items.some(item => item.name.toLowerCase().includes(searchTerm))) return true;

            return false;
        });

        // Update pagination
        updatePagination();

        // Render filtered orders
        renderOrders();
    }

    // Toggle modal visibility
    function toggleModal(modal, show) {
        if (show) {
            modal.classList.remove('hidden');
        } else {
            modal.classList.add('hidden');
        }
    }

    // Load orders from the management system
    function loadOrders() {
        // Show loading state
        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                    <i class="fas fa-spinner fa-spin mr-2"></i>
                    Loading orders...
                </td>
            </tr>
        `;

        // Get orders with or without filters
        if (Object.keys(currentFilters).length > 0) {
            filteredOrders = OrderManagement.getOrders(currentFilters);
        } else {
            allOrders = OrderManagement.getOrders();
            filteredOrders = [...allOrders];
        }

        // Sort orders by date (newest first)
        filteredOrders.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));

        // Update total count
        totalOrders = filteredOrders.length;

        // Update pagination
        updatePagination();

        // Render orders
        renderOrders();
    }

    // Update pagination display and controls
    function updatePagination() {
        const totalPages = Math.ceil(totalOrders / pageSize);

        // Update page indicators
        totalItems.textContent = totalOrders;

        // Calculate start and end record for current page
        const start = (currentPage - 1) * pageSize + 1;
        const end = Math.min(start + pageSize - 1, totalOrders);

        // Update range display
        pageStart.textContent = totalOrders > 0 ? start : 0;
        pageEnd.textContent = end;

        // Enable/disable prev/next buttons
        prevPageBtn.disabled = currentPage <= 1;
        prevPageMobileBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= totalPages;
        nextPageMobileBtn.disabled = currentPage >= totalPages;

        if (prevPageBtn.disabled) {
            prevPageBtn.classList.add('opacity-50', 'cursor-not-allowed');
            prevPageMobileBtn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            prevPageBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            prevPageMobileBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }

        if (nextPageBtn.disabled) {
            nextPageBtn.classList.add('opacity-50', 'cursor-not-allowed');
            nextPageMobileBtn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            nextPageBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            nextPageMobileBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }

        // Generate pagination numbers
        generatePaginationNumbers(totalPages);
    }

    // Generate pagination number buttons
    function generatePaginationNumbers(totalPages) {
        paginationNumbers.innerHTML = '';

        // Determine range of pages to show
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);

        // Adjust if we're near the end
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        // Generate page buttons
        for (let i = startPage; i <= endPage; i++) {
            const isActive = i === currentPage;
            const pageBtn = document.createElement('button');

            pageBtn.className = isActive
                ? 'relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                : 'relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0';

            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => navigateToPage(i));

            paginationNumbers.appendChild(pageBtn);
        }
    }

    // Navigate to a specific page
    function navigateToPage(page) {
        const totalPages = Math.ceil(totalOrders / pageSize);

        if (page < 1 || page > totalPages) {
            return;
        }

        currentPage = page;
        updatePagination();
        renderOrders();
    }

    // Render orders for the current page
    function renderOrders() {
        // Calculate slice indices for current page
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        // Get orders for current page
        const ordersToDisplay = filteredOrders.slice(startIndex, endIndex);

        // Check if we have orders to display
        if (ordersToDisplay.length === 0) {
            ordersTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                        No orders found matching your criteria.
                    </td>
                </tr>
            `;
            return;
        }

        // Render each order
        let html = '';

        ordersToDisplay.forEach(order => {
            const orderDate = new Date(order.dateCreated).toLocaleDateString();
            const customerName = order.customer?.name || 'Unknown';

            // Determine status class
            let statusClass = '';
            let statusIcon = '';

            switch (order.status) {
                case 'pending':
                    statusClass = 'bg-yellow-100 text-yellow-800';
                    statusIcon = '<i class="fas fa-clock mr-1"></i>';
                    break;
                case 'processing':
                    statusClass = 'bg-blue-100 text-blue-800';
                    statusIcon = '<i class="fas fa-cog mr-1"></i>';
                    break;
                case 'shipped':
                    statusClass = 'bg-purple-100 text-purple-800';
                    statusIcon = '<i class="fas fa-shipping-fast mr-1"></i>';
                    break;
                case 'delivered':
                    statusClass = 'bg-green-100 text-green-800';
                    statusIcon = '<i class="fas fa-check mr-1"></i>';
                    break;
                case 'cancelled':
                    statusClass = 'bg-red-100 text-red-800';
                    statusIcon = '<i class="fas fa-ban mr-1"></i>';
                    break;
                case 'refunded':
                    statusClass = 'bg-orange-100 text-orange-800';
                    statusIcon = '<i class="fas fa-undo mr-1"></i>';
                    break;
                case 'on_hold':
                    statusClass = 'bg-gray-100 text-gray-800';
                    statusIcon = '<i class="fas fa-pause mr-1"></i>';
                    break;
                case 'backordered':
                    statusClass = 'bg-indigo-100 text-indigo-800';
                    statusIcon = '<i class="fas fa-dolly mr-1"></i>';
                    break;
                case 'completed':
                    statusClass = 'bg-green-100 text-green-800';
                    statusIcon = '<i class="fas fa-check-circle mr-1"></i>';
                    break;
                default:
                    statusClass = 'bg-gray-100 text-gray-800';
                    statusIcon = '';
            }

            // Determine payment status class
            let paymentStatusClass = '';
            let paymentStatusIcon = '';

            switch (order.paymentStatus) {
                case 'pending':
                    paymentStatusClass = 'bg-yellow-100 text-yellow-800';
                    paymentStatusIcon = '<i class="fas fa-clock mr-1"></i>';
                    break;
                case 'paid':
                    paymentStatusClass = 'bg-green-100 text-green-800';
                    paymentStatusIcon = '<i class="fas fa-check mr-1"></i>';
                    break;
                case 'failed':
                    paymentStatusClass = 'bg-red-100 text-red-800';
                    paymentStatusIcon = '<i class="fas fa-times mr-1"></i>';
                    break;
                case 'refunded':
                    paymentStatusClass = 'bg-orange-100 text-orange-800';
                    paymentStatusIcon = '<i class="fas fa-undo mr-1"></i>';
                    break;
                case 'partially_refunded':
                    paymentStatusClass = 'bg-orange-100 text-orange-800';
                    paymentStatusIcon = '<i class="fas fa-undo-alt mr-1"></i>';
                    break;
                default:
                    paymentStatusClass = 'bg-gray-100 text-gray-800';
                    paymentStatusIcon = '';
            }

            html += `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <a href="#" class="text-indigo-600 hover:text-indigo-900 font-medium"
                           data-order-id="${order.id}"
                           onclick="event.preventDefault(); showOrderDetails('${order.id}')">
                            #${order.orderNumber}
                        </a>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${orderDate}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${customerName}</div>
                        <div class="text-sm text-gray-500">${order.customer?.email || ''}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                            ${statusIcon}${order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${paymentStatusClass}">
                            ${paymentStatusIcon}${order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1).replace('_', ' ')}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        $${order.totalAmount.toFixed(2)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div class="flex justify-end space-x-2">
                            <button class="text-indigo-600 hover:text-indigo-900"
                                   onclick="showOrderDetails('${order.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="text-indigo-600 hover:text-indigo-900"
                                   onclick="editOrder('${order.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="text-red-600 hover:text-red-900"
                                   onclick="deleteOrder('${order.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        ordersTableBody.innerHTML = html;

        // Attach event handlers to action buttons
        attachOrderActionHandlers();
    }

    // Attach handlers to order action buttons
    function attachOrderActionHandlers() {
        // Get all view buttons and attach handlers
        document.querySelectorAll('[data-order-id]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const orderId = button.getAttribute('data-order-id');
                showOrderDetails(orderId);
            });
        });
    }

    // Export orders to CSV
    function exportOrders() {
        // Prepare CSV header
        let csv = 'Order Number,Date,Customer,Email,Status,Payment Status,Subtotal,Tax,Shipping,Discount,Total\n';

        // Add each order as a row
        filteredOrders.forEach(order => {
            const date = new Date(order.dateCreated).toLocaleDateString();
            const customerName = order.customer?.name?.replace(/,/g, ' ') || 'Unknown';
            const customerEmail = order.customer?.email || '';

            csv += `${order.orderNumber},${date},${customerName},${customerEmail},${order.status},${order.paymentStatus},${order.subtotal},${order.taxAmount},${order.shippingAmount},${order.discountAmount},${order.totalAmount}\n`;
        });

        // Create download link
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `orders-export-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // Update order statistics
    function updateOrderStatistics() {
        // Get statistics for the last month (default)
        const stats = OrderManagement.getOrderStatistics('month');

        // Update stats display
        totalOrdersElement.textContent = stats.totalOrders;
        totalRevenueElement.textContent = `$${stats.totalRevenue.toFixed(2)}`;
        avgOrderValueElement.textContent = `$${stats.averageOrderValue.toFixed(2)}`;

        // Count pending orders (from current orders list)
        const pendingOrders = allOrders.filter(order => order.status === 'pending').length;
        pendingOrdersElement.textContent = pendingOrders;
    }

    // Update top selling products
    function updateTopSellingProducts() {
        // Get statistics for the last month
        const stats = OrderManagement.getOrderStatistics('month');
        const topProducts = stats.topSellingProducts;

        // Check if we have products to display
        if (topProducts.length === 0) {
            topProductsTable.innerHTML = `
                <tr>
                    <td colspan="3" class="px-6 py-4 text-center text-gray-500">
                        No products sold in the selected period.
                    </td>
                </tr>
            `;
            return;
        }

        // Render each product
        let html = '';

        // If we have product data, try to get full product info
        const hasProductManager = typeof window.ProductManager !== 'undefined';

        topProducts.forEach(product => {
            let productName = `Product #${product.productId}`;

            // Try to get product name if product manager is available
            if (hasProductManager && window.ProductManager.getProductById) {
                const productInfo = window.ProductManager.getProductById(product.productId);
                if (productInfo) {
                    productName = productInfo.name;
                }
            }

            html += `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${productName}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${product.quantity}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        $${product.revenue.toFixed(2)}
                    </td>
                </tr>
            `;
        });

        topProductsTable.innerHTML = html;
    }

    // Update recent activity
    function updateRecentActivity() {
        // Get the most recent 10 orders
        const recentOrders = filteredOrders.slice(0, 10);

        // Check if we have activity to display
        if (recentOrders.length === 0) {
            recentActivityContainer.innerHTML = `
                <div class="text-center text-gray-500 py-4">
                    No recent order activity found.
                </div>
            `;
            return;
        }

        // Render recent activity
        let html = '';

        recentOrders.forEach(order => {
            const orderDate = new Date(order.dateCreated);
            const timeAgo = getTimeAgo(orderDate);
            const customerName = order.customer?.name || 'Unknown';

            // Determine icon based on status
            let statusIcon = '';
            let statusClass = '';

            switch (order.status) {
                case 'pending':
                    statusIcon = 'clock';
                    statusClass = 'bg-yellow-100 text-yellow-800';
                    break;
                case 'processing':
                    statusIcon = 'cog';
                    statusClass = 'bg-blue-100 text-blue-800';
                    break;
                case 'shipped':
                    statusIcon = 'shipping-fast';
                    statusClass = 'bg-purple-100 text-purple-800';
                    break;
                case 'delivered':
                case 'completed':
                    statusIcon = 'check-circle';
                    statusClass = 'bg-green-100 text-green-800';
                    break;
                case 'cancelled':
                    statusIcon = 'ban';
                    statusClass = 'bg-red-100 text-red-800';
                    break;
                case 'refunded':
                    statusIcon = 'undo';
                    statusClass = 'bg-orange-100 text-orange-800';
                    break;
                default:
                    statusIcon = 'shopping-cart';
                    statusClass = 'bg-gray-100 text-gray-800';
            }

            html += `
                <div class="flex items-start">
                    <div class="flex-shrink-0 h-8 w-8 rounded-full ${statusClass} flex items-center justify-center">
                        <i class="fas fa-${statusIcon} text-sm"></i>
                    </div>
                    <div class="ml-3 flex-1">
                        <p class="text-sm text-gray-900">
                            <a href="#" class="font-medium text-indigo-600 hover:text-indigo-900"
                               onclick="event.preventDefault(); showOrderDetails('${order.id}')">
                                Order #${order.orderNumber}
                            </a>
                            (${order.status}) by ${customerName}
                        </p>
                        <p class="mt-1 text-sm text-gray-500">
                            ${timeAgo} · $${order.totalAmount.toFixed(2)}
                        </p>
                    </div>
                </div>
            `;
        });

        recentActivityContainer.innerHTML = html;
    }

    // Helper function to format time ago
    function getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.round(diffMs / 1000);
        const diffMin = Math.round(diffSec / 60);
        const diffHour = Math.round(diffMin / 60);
        const diffDay = Math.round(diffHour / 24);

        if (diffSec < 60) {
            return 'Just now';
        } else if (diffMin < 60) {
            return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
        } else if (diffHour < 24) {
            return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
        } else if (diffDay < 30) {
            return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    // Make functions globally accessible
    window.showOrderDetails = showOrderDetails;
    window.editOrder = editOrder;
    window.deleteOrder = deleteOrder;

    // Function to show order details
    function showOrderDetails(orderId) {
        // Get order details
        const order = OrderManagement.getOrderById(orderId);
        if (!order) {
            alert('Order not found');
            return;
        }

        // Update modal title
        modalTitle.textContent = `Order Details: #${order.orderNumber}`;

        // Generate order details HTML
        const detailsHtml = generateOrderDetailsHtml(order);

        // Update modal content
        orderDetailContent.innerHTML = detailsHtml;

        // Show modal
        toggleModal(orderDetailModal, true);
    }

    // Function to generate the HTML for order details
    function generateOrderDetailsHtml(order) {
        const orderDate = new Date(order.dateCreated).toLocaleDateString();
        const orderTime = new Date(order.dateCreated).toLocaleTimeString();

        // Format status with color
        let statusClass = 'bg-gray-100 text-gray-800';
        let paymentStatusClass = 'bg-gray-100 text-gray-800';

        switch (order.status) {
            case 'pending': statusClass = 'bg-yellow-100 text-yellow-800'; break;
            case 'processing': statusClass = 'bg-blue-100 text-blue-800'; break;
            case 'shipped': statusClass = 'bg-purple-100 text-purple-800'; break;
            case 'delivered': statusClass = 'bg-green-100 text-green-800'; break;
            case 'cancelled': statusClass = 'bg-red-100 text-red-800'; break;
            case 'refunded': statusClass = 'bg-orange-100 text-orange-800'; break;
            case 'completed': statusClass = 'bg-green-100 text-green-800'; break;
        }

        switch (order.paymentStatus) {
            case 'pending': paymentStatusClass = 'bg-yellow-100 text-yellow-800'; break;
            case 'paid': paymentStatusClass = 'bg-green-100 text-green-800'; break;
            case 'failed': paymentStatusClass = 'bg-red-100 text-red-800'; break;
            case 'refunded': paymentStatusClass = 'bg-orange-100 text-orange-800'; break;
            case 'partially_refunded': paymentStatusClass = 'bg-orange-100 text-orange-800'; break;
        }

        // Generate order items HTML
        let itemsHtml = '';
        order.items.forEach(item => {
            itemsHtml += `
                <tr>
                    <td class="px-4 py-2 border">${item.name}</td>
                    <td class="px-4 py-2 border text-center">${item.quantity}</td>
                    <td class="px-4 py-2 border text-right">$${item.price.toFixed(2)}</td>
                    <td class="px-4 py-2 border text-right">$${item.lineTotal.toFixed(2)}</td>
                </tr>
            `;
        });

        // Generate order history HTML
        let historyHtml = '';
        if (order.history && order.history.length) {
            order.history.forEach(entry => {
                const entryDate = new Date(entry.timestamp).toLocaleString();
                historyHtml += `
                    <div class="border-b border-gray-200 pb-2 mb-2">
                        <div class="flex justify-between">
                            <span class="text-sm font-medium">${entry.action.replace(/_/g, ' ')}</span>
                            <span class="text-sm text-gray-500">${entryDate}</span>
                        </div>
                        <p class="text-sm text-gray-700 mt-1">${entry.note || ''}</p>
                    </div>
                `;
            });
        } else {
            historyHtml = '<p class="text-gray-500">No history available</p>';
        }

        return `
            <div class="space-y-6">
                <!-- Order Summary -->
                <div class="bg-gray-50 rounded-lg p-4">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <h3 class="text-sm font-medium text-gray-500">Order Date</h3>
                            <p class="mt-1 text-sm text-gray-900">${orderDate}<br>${orderTime}</p>
                        </div>
                        <div>
                            <h3 class="text-sm font-medium text-gray-500">Status</h3>
                            <p class="mt-1">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                                    ${order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                                </span>
                            </p>
                        </div>
                        <div>
                            <h3 class="text-sm font-medium text-gray-500">Payment</h3>
                            <p class="mt-1">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${paymentStatusClass}">
                                    ${order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1).replace('_', ' ')}
                                </span>
                            </p>
                        </div>
                        <div>
                            <h3 class="text-sm font-medium text-gray-500">Total</h3>
                            <p class="mt-1 text-sm font-medium text-gray-900">$${order.totalAmount.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <!-- Customer Information -->
                <div>
                    <h2 class="text-lg font-medium text-gray-900 mb-3">Customer Information</h2>
                    <div class="bg-white rounded-lg border border-gray-200 p-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 class="text-sm font-medium text-gray-500">Customer</h3>
                                <p class="mt-1 text-sm text-gray-900">${order.customer.name || 'N/A'}</p>
                                <p class="mt-1 text-sm text-gray-900">${order.customer.email || 'N/A'}</p>
                                <p class="mt-1 text-sm text-gray-900">${order.customer.phone || 'N/A'}</p>
                            </div>
                            <div>
                                <h3 class="text-sm font-medium text-gray-500">Shipping Address</h3>
                                ${order.shippingAddress ? `
                                    <p class="mt-1 text-sm text-gray-900">${order.shippingAddress.line1}</p>
                                    ${order.shippingAddress.line2 ? `<p class="text-sm text-gray-900">${order.shippingAddress.line2}</p>` : ''}
                                    <p class="text-sm text-gray-900">${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}</p>
                                    <p class="text-sm text-gray-900">${order.shippingAddress.country}</p>
                                ` : '<p class="mt-1 text-sm text-gray-500">No shipping address provided</p>'}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Order Items -->
                <div>
                    <h2 class="text-lg font-medium text-gray-900 mb-3">Order Items</h2>
                    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                    <th scope="col" class="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                    <th scope="col" class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                                    <th scope="col" class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                ${itemsHtml}
                            </tbody>
                            <tfoot class="bg-gray-50">
                                <tr>
                                    <td colspan="3" class="px-4 py-2 text-right text-sm font-medium text-gray-900">Subtotal:</td>
                                    <td class="px-4 py-2 text-right text-sm font-medium text-gray-900">$${order.subtotal.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td colspan="3" class="px-4 py-2 text-right text-sm text-gray-500">Tax:</td>
                                    <td class="px-4 py-2 text-right text-sm text-gray-500">$${order.taxAmount.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td colspan="3" class="px-4 py-2 text-right text-sm text-gray-500">Shipping:</td>
                                    <td class="px-4 py-2 text-right text-sm text-gray-500">$${order.shippingAmount.toFixed(2)}</td>
                                </tr>
                                ${order.discountAmount > 0 ? `
                                <tr>
                                    <td colspan="3" class="px-4 py-2 text-right text-sm text-gray-500">Discount:</td>
                                    <td class="px-4 py-2 text-right text-sm text-gray-500">-$${order.discountAmount.toFixed(2)}</td>
                                </tr>
                                ` : ''}
                                <tr>
                                    <td colspan="3" class="px-4 py-2 text-right text-sm font-medium text-gray-900">Total:</td>
                                    <td class="px-4 py-2 text-right text-sm font-medium text-gray-900">$${order.totalAmount.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <!-- Order History -->
                <div>
                    <h2 class="text-lg font-medium text-gray-900 mb-3">Order History</h2>
                    <div class="bg-white rounded-lg border border-gray-200 p-4">
                        ${historyHtml}
                    </div>
                </div>
            </div>
        `;
    }

    // Function to edit an order
    function editOrder(orderId) {
        // Get order details
        const order = OrderManagement.getOrderById(orderId);
        if (!order) {
            alert('Order not found');
            return;
        }

        // Update modal title
        createEditModalTitle.textContent = `Edit Order #${order.orderNumber}`;

        // Populate form fields
        editOrderIdInput.value = order.id;

        // Set customer information
        document.getElementById('customer-name').value = order.customer?.name || '';
        document.getElementById('customer-email').value = order.customer?.email || '';
        document.getElementById('customer-phone').value = order.customer?.phone || '';

        // Set order status
        document.getElementById('order-status').value = order.status;

        // Set order notes
        document.getElementById('order-notes').value = order.notes || '';

        // Clear existing items
        const orderItemsBody = document.getElementById('order-items-body');
        const noItemsRow = document.getElementById('no-items-row');

        // Remove all rows except the "no items" row
        while (orderItemsBody.firstChild) {
            if (orderItemsBody.firstChild.id === 'no-items-row') {
                break;
            }
            orderItemsBody.removeChild(orderItemsBody.firstChild);
        }

        // Add order items
        if (order.items && order.items.length > 0) {
            noItemsRow.classList.add('hidden');

            // Add each item to the table
            order.items.forEach((item, index) => {
                addItemToTable(item, index);
            });
        } else {
            noItemsRow.classList.remove('hidden');
        }

        // Set totals
        document.getElementById('order-subtotal').textContent = `$${order.subtotal.toFixed(2)}`;
        document.getElementById('order-tax').textContent = `$${order.taxAmount.toFixed(2)}`;
        document.getElementById('order-shipping').value = order.shippingAmount.toFixed(2);
        document.getElementById('order-discount').value = order.discountAmount.toFixed(2);
        document.getElementById('order-total').textContent = `$${order.totalAmount.toFixed(2)}`;

        // Show modal
        toggleModal(createEditOrderModal, true);
    }

    // Function to delete an order
    function deleteOrder(orderId) {
        if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
            // Get all orders
            const orders = OrderManagement.getOrders();

            // Find the order index
            const orderIndex = orders.findIndex(order => order.id === orderId);

            if (orderIndex !== -1) {
                // Remove the order
                orders.splice(orderIndex, 1);

                // Save updated orders
                localStorage.setItem('recoveryEssentials_orders', JSON.stringify(orders));

                // Reload orders
                loadOrders();

                // Update statistics and other displays
                updateOrderStatistics();
                updateTopSellingProducts();
                updateRecentActivity();

                // Show success message
                alert('Order deleted successfully');
            } else {
                alert('Order not found');
            }
        }
    }

    // Function to add an item to the edit form table
    function addItemToTable(item, index) {
        const orderItemsBody = document.getElementById('order-items-body');

        // Create a new row
        const newRow = document.createElement('tr');
        newRow.className = 'item-row';
        newRow.dataset.index = index;

        // Create cells for the row
        newRow.innerHTML = `
            <td class="px-4 py-2">
                <div class="text-sm font-medium text-gray-900">${item.name}</div>
                <input type="hidden" name="item-id-${index}" value="${item.productId || ''}">
                <input type="hidden" name="item-name-${index}" value="${item.name}">
            </td>
            <td class="px-4 py-2">
                <input type="number" name="item-price-${index}" value="${item.price.toFixed(2)}"
                       class="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                       onchange="updateItemTotal(${index})">
            </td>
            <td class="px-4 py-2">
                <input type="number" name="item-quantity-${index}" value="${item.quantity}" min="1"
                       class="w-16 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                       onchange="updateItemTotal(${index})">
            </td>
            <td class="px-4 py-2">
                <span class="item-total text-sm font-medium text-gray-900">$${item.lineTotal.toFixed(2)}</span>
            </td>
            <td class="px-4 py-2 text-right">
                <button type="button" class="text-red-600 hover:text-red-900" onclick="removeItem(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        // Insert before the "no items" row
        const noItemsRow = document.getElementById('no-items-row');
        orderItemsBody.insertBefore(newRow, noItemsRow);
    }

    // Function to print order details
    function printOrderDetails() {
        const orderDetails = orderDetailContent.innerHTML;

        // Create print window
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Order Details</title>
                <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                <style>
                    body { padding: 20px; }
                    @media print {
                        body { padding: 0; }
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="container mx-auto">
                    <div class="flex justify-between items-center mb-6">
                        <h1 class="text-2xl font-bold">${modalTitle.textContent}</h1>
                        <button onclick="window.print()" class="px-4 py-2 bg-indigo-600 text-white rounded-md">
                            Print
                        </button>
                    </div>
                    ${orderDetails}
                </div>
            </body>
            </html>
        `);

        printWindow.document.close();
    }

    // Handle edit order button click
    function handleEditOrderClick() {
        // Get order ID from modal title
        const orderNumber = modalTitle.textContent.match(/#(\d+)/)[1];

        // Find the order by order number
        const order = allOrders.find(o => o.orderNumber.toString() === orderNumber);

        if (order) {
            // Hide details modal
            toggleModal(orderDetailModal, false);

            // Show edit modal
            editOrder(order.id);
        }
    }

    // Handle order form submission
    function handleOrderFormSubmit(e) {
        e.preventDefault();
        // Form submission logic here
        console.log('Order form submitted');
    }

    // Handle add item form submission
    function handleAddItemSubmit(e) {
        e.preventDefault();
        // Add item logic here
        console.log('Add item form submitted');
    }

    // Open create order modal
    function openCreateOrderModal() {
        // Reset form
        orderForm.reset();
        editOrderIdInput.value = '';
        createEditModalTitle.textContent = 'Create New Order';

        // Show modal
        toggleModal(createEditOrderModal, true);
    }

    // Open add item modal
    function openAddItemModal() {
        // Reset form
        addItemForm.reset();

        // Show modal
        toggleModal(addItemModal, true);
    }
});

// Global functions to be called from HTML onclick attributes
function showOrderDetails(orderId) {
    console.log(`Show order details for ${orderId}`);
    // Find the controller and call the internal function
    const event = new CustomEvent('showOrderDetails', { detail: { orderId } });
    document.dispatchEvent(event);
}

function editOrder(orderId) {
    console.log(`Edit order ${orderId}`);
    // Find the controller and call the internal function
    const event = new CustomEvent('editOrder', { detail: { orderId } });
    document.dispatchEvent(event);
}

function deleteOrder(orderId) {
    console.log(`Delete order ${orderId}`);
    // Find the controller and call the internal function
    const event = new CustomEvent('deleteOrder', { detail: { orderId } });
    document.dispatchEvent(event);
}

// Helper functions for the edit form
function updateItemTotal(index) {
    console.log(`Update item total for index ${index}`);
    // Logic to update item total
}

function removeItem(index) {
    console.log(`Remove item at index ${index}`);
    // Logic to remove item from order form
}
