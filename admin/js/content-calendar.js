/**
 * Recovery Essentials - Content Calendar
 * Manages the content calendar and scheduling interface
 */

// Current calendar state
let currentView = 'month'; // 'month', 'week', or 'list'
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Initialize the calendar on document load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize view
    initializeCalendar();

    // Set up event listeners
    setupEventListeners();

    // Load scheduled content
    loadScheduledContent();

    // Load workflow tasks
    loadWorkflowTasks();
});

/**
 * Initialize the calendar view
 */
function initializeCalendar() {
    // Set calendar title
    updateCalendarTitle();

    // Render the current view
    renderCalendarView();
}

/**
 * Set up event listeners for calendar controls
 */
function setupEventListeners() {
    // View dropdown
    const viewDropdownBtn = document.getElementById('view-dropdown-btn');
    const viewDropdown = document.getElementById('view-dropdown');

    if (viewDropdownBtn) {
        viewDropdownBtn.addEventListener('click', function() {
            viewDropdown.classList.toggle('hidden');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            if (!viewDropdownBtn.contains(event.target) && !viewDropdown.contains(event.target)) {
                viewDropdown.classList.add('hidden');
            }
        });
    }

    // View options
    const viewOptions = document.querySelectorAll('#view-dropdown a');
    viewOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            const view = this.getAttribute('data-view');
            changeView(view);
            viewDropdown.classList.add('hidden');
        });
    });

    // Navigation buttons
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const todayBtn = document.getElementById('today-btn');

    if (prevBtn) {
        prevBtn.addEventListener('click', navigatePrevious);
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', navigateNext);
    }

    if (todayBtn) {
        todayBtn.addEventListener('click', navigateToday);
    }
}

/**
 * Load scheduled content
 */
function loadScheduledContent() {
    // This function will be implemented once we have the workflow system
    renderCalendarView();
}

/**
 * Load workflow tasks
 */
function loadWorkflowTasks() {
    // Placeholder for workflow tasks
    const taskList = document.getElementById('task-list');
    if (taskList) {
        taskList.innerHTML = '<div class="text-center text-gray-500 py-4">No upcoming tasks</div>';
    }
}

/**
 * Update the calendar title based on current view and date
 */
function updateCalendarTitle() {
    const calendarTitle = document.getElementById('calendar-title');
    if (!calendarTitle) return;

    const options = { month: 'long', year: 'numeric' };

    if (currentView === 'month') {
        calendarTitle.textContent = new Date(currentYear, currentMonth).toLocaleDateString(undefined, options);
    } else if (currentView === 'week') {
        // Get the first and last day of the current week
        const startDate = getStartOfWeek(new Date(currentYear, currentMonth, currentDate.getDate()));
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);

        // Format the date range (e.g., "March 15-21, 2024")
        const startMonth = startDate.toLocaleDateString(undefined, { month: 'long' });
        const endMonth = endDate.toLocaleDateString(undefined, { month: 'long' });

        if (startMonth === endMonth) {
            calendarTitle.textContent = `${startMonth} ${startDate.getDate()}-${endDate.getDate()}, ${currentYear}`;
        } else {
            calendarTitle.textContent = `${startMonth} ${startDate.getDate()} - ${endMonth} ${endDate.getDate()}, ${currentYear}`;
        }
    } else if (currentView === 'list') {
        // For list view, just show the current month and year
        calendarTitle.textContent = new Date(currentYear, currentMonth).toLocaleDateString(undefined, options);
    }
}

/**
 * Render the appropriate calendar view
 */
function renderCalendarView() {
    // Hide all views first
    document.getElementById('month-view').classList.add('hidden');
    document.getElementById('week-view').classList.add('hidden');
    document.getElementById('list-view').classList.add('hidden');

    // Update current view text
    document.getElementById('current-view').textContent = capitalizeFirstLetter(currentView);

    if (currentView === 'month') {
        renderMonthView();
        document.getElementById('month-view').classList.remove('hidden');
    } else if (currentView === 'week') {
        renderWeekView();
        document.getElementById('week-view').classList.remove('hidden');
    } else if (currentView === 'list') {
        renderListView();
        document.getElementById('list-view').classList.remove('hidden');
    }
}

/**
 * Render the month view calendar
 */
function renderMonthView() {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;

    // Clear existing content
    grid.innerHTML = '';

    // Get the first day of the month
    const firstDay = new Date(currentYear, currentMonth, 1);
    // Get the day of the week (0-6)
    const startingDay = firstDay.getDay();

    // Get the last day of the month
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Get the previous month's days to display
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();

    // Create grid cells for days
    let dayCount = 1;
    let nextMonthDayCount = 1;

    // Calculate weeks needed (5 or 6 rows)
    const totalCells = Math.ceil((startingDay + daysInMonth) / 7) * 7;

    // Create grid cells
    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        cell.className = 'border border-gray-200 p-2 min-h-[100px] relative';

        if (i < startingDay) {
            // Previous month days
            const prevMonthDay = prevMonthLastDay - startingDay + i + 1;
            cell.innerHTML = `
                <div class="text-gray-400 text-right text-sm mb-1">${prevMonthDay}</div>
                <div class="content-items"></div>
            `;
            cell.classList.add('bg-gray-50');
        } else if (i >= startingDay && i < startingDay + daysInMonth) {
            // Current month days
            const isToday = isCurrentDate(dayCount);

            cell.innerHTML = `
                <div class="text-right mb-1 ${isToday ? 'bg-indigo-100 text-indigo-700 font-medium rounded-full w-6 h-6 flex items-center justify-center ml-auto' : ''}">${dayCount}</div>
                <div class="content-items space-y-1"></div>
            `;

            const date = new Date(currentYear, currentMonth, dayCount);
            cell.setAttribute('data-date', date.toISOString().split('T')[0]);

            if (isToday) {
                cell.classList.add('bg-indigo-50', 'border-indigo-200');
            }

            dayCount++;
        } else {
            // Next month days
            cell.innerHTML = `
                <div class="text-gray-400 text-right text-sm mb-1">${nextMonthDayCount}</div>
                <div class="content-items"></div>
            `;
            cell.classList.add('bg-gray-50');
            nextMonthDayCount++;
        }

        grid.appendChild(cell);
    }
}

/**
 * Render the week view
 */
function renderWeekView() {
    const grid = document.getElementById('week-grid');
    if (!grid) return;

    // Clear existing content
    grid.innerHTML = '';

    // Get the first day of the week
    const startOfWeek = getStartOfWeek(new Date(currentYear, currentMonth, currentDate.getDate()));

    // Create time column
    const timeColumn = document.createElement('div');
    timeColumn.className = 'border-r border-gray-200';

    // Add hour markers (9am - 6pm)
    for (let hour = 9; hour <= 18; hour++) {
        const hourMarker = document.createElement('div');
        hourMarker.className = 'text-xs text-gray-500 p-2 border-b border-gray-200 h-24';
        hourMarker.textContent = hour > 12 ? `${hour - 12}pm` : (hour === 12 ? '12pm' : `${hour}am`);
        timeColumn.appendChild(hourMarker);
    }

    grid.appendChild(timeColumn);

    // Create day columns
    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(startOfWeek);
        dayDate.setDate(startOfWeek.getDate() + i);

        const dayColumn = document.createElement('div');
        dayColumn.className = 'border-r border-gray-200';
        dayColumn.setAttribute('data-date', dayDate.toISOString().split('T')[0]);

        // Add hour slots
        for (let hour = 9; hour <= 18; hour++) {
            const hourSlot = document.createElement('div');
            hourSlot.className = 'border-b border-gray-200 h-24 content-items';
            hourSlot.setAttribute('data-hour', hour);
            hourSlot.setAttribute('data-date', dayDate.toISOString().split('T')[0]);
            dayColumn.appendChild(hourSlot);
        }

        grid.appendChild(dayColumn);
    }
}

/**
 * Render the list view
 */
function renderListView() {
    const contentList = document.getElementById('content-list');
    if (!contentList) return;

    // Clear existing content
    contentList.innerHTML = '';

    // Placeholder for list view
    contentList.innerHTML = `
        <tr>
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">No scheduled content found</td>
        </tr>
    `;
}

/**
 * Change the calendar view
 * @param {string} view - The view to change to ('month', 'week', or 'list')
 */
function changeView(view) {
    if (view === 'month' || view === 'week' || view === 'list') {
        currentView = view;
        updateCalendarTitle();
        renderCalendarView();
    }
}

/**
 * Navigate to the previous month or week
 */
function navigatePrevious() {
    if (currentView === 'month') {
        // Go to previous month
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
    } else if (currentView === 'week') {
        // Go to previous week
        const newDate = new Date(currentYear, currentMonth, currentDate.getDate() - 7);
        currentYear = newDate.getFullYear();
        currentMonth = newDate.getMonth();
        currentDate = new Date(newDate);
    } else if (currentView === 'list') {
        // Go to previous month for list view too
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
    }

    updateCalendarTitle();
    renderCalendarView();
}

/**
 * Navigate to the next month or week
 */
function navigateNext() {
    if (currentView === 'month') {
        // Go to next month
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
    } else if (currentView === 'week') {
        // Go to next week
        const newDate = new Date(currentYear, currentMonth, currentDate.getDate() + 7);
        currentYear = newDate.getFullYear();
        currentMonth = newDate.getMonth();
        currentDate = new Date(newDate);
    } else if (currentView === 'list') {
        // Go to next month for list view too
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
    }

    updateCalendarTitle();
    renderCalendarView();
}

/**
 * Navigate to today
 */
function navigateToday() {
    const today = new Date();
    currentYear = today.getFullYear();
    currentMonth = today.getMonth();
    currentDate = new Date(today);

    updateCalendarTitle();
    renderCalendarView();
}

/**
 * Check if a date is the current date
 * @param {number} day - The day to check
 * @param {number} month - The month to check (optional, defaults to currentMonth)
 * @param {number} year - The year to check (optional, defaults to currentYear)
 * @returns {boolean} True if the date is today
 */
function isCurrentDate(day, month = currentMonth, year = currentYear) {
    const today = new Date();
    return (
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()
    );
}

/**
 * Get the start of the week for a given date
 * @param {Date} date - The date to get the start of the week for
 * @returns {Date} The start of the week (Sunday)
 */
function getStartOfWeek(date) {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - dayOfWeek);
    return startOfWeek;
}

/**
 * Capitalize the first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
