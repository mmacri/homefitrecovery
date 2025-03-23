/**
 * Initialize the dashboard UI
 */
function initializeDashboard() {
    // Initialize tabs
    const tabButtons = document.querySelectorAll('[role="tab"]');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active state from all tabs
            tabButtons.forEach(btn => {
                btn.classList.remove('text-indigo-600', 'border-indigo-600', 'active');
                btn.classList.add('text-gray-500', 'border-transparent');
            });

            // Add active state to clicked tab
            this.classList.remove('text-gray-500', 'border-transparent');
            this.classList.add('text-indigo-600', 'border-indigo-600', 'active');

            // Hide all tab content
            const tabPanes = document.querySelectorAll('.tab-pane');
            tabPanes.forEach(pane => {
                pane.classList.add('hidden');
            });

            // Show the corresponding tab content
            const tabId = this.id;
            const contentId = tabId + '-content';
            document.getElementById(contentId).classList.remove('hidden');
        });
    });

    // Set up SEO score circle
    updateSEOScore(0); // Start with 0, will be updated when data loads
}

/**
 * Update the SEO score visualization
 * @param {number} score - SEO score (0-100)
 */
function updateSEOScore(score) {
    // Default to 0 if no score provided
    const scoreValue = score || 0;

    // Update the score text
    const scoreText = document.querySelector('.score-text');
    if (scoreText) {
        scoreText.textContent = scoreValue;
    }

    // Update the circle stroke
    const scoreCircle = document.getElementById('score-circle');
    if (scoreCircle) {
        scoreCircle.setAttribute('stroke-dasharray', `${scoreValue}, 100`);

        // Update the circle color based on score
        let strokeColor = '#ef4444'; // Red for low scores

        if (scoreValue >= 80) {
            strokeColor = '#4ade80'; // Green for good scores
        } else if (scoreValue >= 60) {
            strokeColor = '#facc15'; // Yellow for medium scores
        } else if (scoreValue >= 40) {
            strokeColor = '#fb923c'; // Orange for low-medium scores
        }

        scoreCircle.setAttribute('stroke', strokeColor);
    }
}

/**
 * Run site analysis from user action
 */
function runSiteAnalysis() {
    showNotification('Running site analysis...', 'info');

    // Simulate analysis with a slight delay to show loading
    setTimeout(() => {
        loadSiteAnalysis(true);
        showNotification('Site analysis completed', 'success');
    }, 1500);
}
