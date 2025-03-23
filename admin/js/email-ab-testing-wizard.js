/**
 * Email A/B Testing Wizard - Guided interface for creating and running A/B tests
 * This module provides a step-by-step wizard for creating email A/B tests.
 */

const EmailABTestingWizard = (function() {
  // Private variables
  let currentStep = 1;
  let totalSteps = 5;
  let testData = {
    name: '',
    testType: '',
    goal: '',
    segmentId: '',
    sampleSize: 20,
    variants: [
      {
        id: 'variant_1',
        name: 'Control',
        subject: '',
        content: null
      },
      {
        id: 'variant_2',
        name: 'Variant B',
        subject: '',
        content: null
      }
    ]
  };

  /**
   * Initialize the wizard
   * @param {Object} options - Configuration options
   */
  function init(options = {}) {
    setupUI();
    setupEventListeners();
    console.log('Email A/B Testing Wizard initialized');
  }

  /**
   * Set up the wizard UI
   */
  function setupUI() {
    // Check if wizard container exists
    const wizardContainer = document.getElementById('ab-testing-wizard');
    if (!wizardContainer) {
      console.error('A/B Testing Wizard container not found');
      return;
    }

    // Set up progress indicators
    updateStepIndicators();

    // Show the first step
    showStep(1);
  }

  /**
   * Set up event listeners for the wizard
   */
  function setupEventListeners() {
    // Next buttons
    document.querySelectorAll('.wizard-next-btn').forEach(button => {
      button.addEventListener('click', handleNextStep);
    });

    // Previous buttons
    document.querySelectorAll('.wizard-prev-btn').forEach(button => {
      button.addEventListener('click', handlePrevStep);
    });

    // Test type selection
    const testTypeRadios = document.querySelectorAll('input[name="test-type"]');
    if (testTypeRadios) {
      testTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
          testData.testType = this.value;
          updateTestTypeUI(this.value);
        });
      });
    }

    // Goal selection
    const goalRadios = document.querySelectorAll('input[name="test-goal"]');
    if (goalRadios) {
      goalRadios.forEach(radio => {
        radio.addEventListener('change', function() {
          testData.goal = this.value;
        });
      });
    }

    // Test name input
    const testNameInput = document.getElementById('test-name');
    if (testNameInput) {
      testNameInput.addEventListener('input', function() {
        testData.name = this.value;
      });
    }

    // Segment selection
    const segmentSelect = document.getElementById('test-segment');
    if (segmentSelect) {
      segmentSelect.addEventListener('change', function() {
        testData.segmentId = this.value;
      });
    }

    // Sample size input
    const sampleSizeInput = document.getElementById('sample-size');
    if (sampleSizeInput) {
      sampleSizeInput.addEventListener('input', function() {
        testData.sampleSize = parseInt(this.value) || 20;
      });
    }

    // Variant inputs
    setupVariantInputListeners();

    // Add variant button
    const addVariantBtn = document.getElementById('add-variant-btn');
    if (addVariantBtn) {
      addVariantBtn.addEventListener('click', addVariant);
    }

    // Create test button
    const createTestBtn = document.getElementById('create-test-btn');
    if (createTestBtn) {
      createTestBtn.addEventListener('click', createTest);
    }

    // Cancel button
    const cancelBtn = document.getElementById('cancel-wizard-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', cancelWizard);
    }
  }

  /**
   * Set up listeners for variant inputs
   */
  function setupVariantInputListeners() {
    // Variant name inputs
    document.querySelectorAll('.variant-name-input').forEach((input, index) => {
      input.addEventListener('input', function() {
        if (testData.variants[index]) {
          testData.variants[index].name = this.value;
        }
      });
    });

    // Variant subject inputs
    document.querySelectorAll('.variant-subject-input').forEach((input, index) => {
      input.addEventListener('input', function() {
        if (testData.variants[index]) {
          testData.variants[index].subject = this.value;
        }
      });
    });

    // Variant content editors (if using a rich text editor)
    // This would connect to a rich text editor in a real implementation
  }

  /**
   * Handle next button click
   */
  function handleNextStep() {
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep < totalSteps) {
      currentStep++;
      showStep(currentStep);
      updateStepIndicators();
    }
  }

  /**
   * Handle previous button click
   */
  function handlePrevStep() {
    if (currentStep > 1) {
      currentStep--;
      showStep(currentStep);
      updateStepIndicators();
    }
  }

  /**
   * Show a specific step in the wizard
   * @param {number} stepNumber - The step number to show
   */
  function showStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.wizard-step').forEach(step => {
      step.classList.add('hidden');
    });

    // Show the requested step
    const stepToShow = document.getElementById(`wizard-step-${stepNumber}`);
    if (stepToShow) {
      stepToShow.classList.remove('hidden');
    }

    // Update buttons
    updateNavigationButtons();
  }

  /**
   * Update the step indicators
   */
  function updateStepIndicators() {
    const indicators = document.querySelectorAll('.step-indicator');
    indicators.forEach((indicator, index) => {
      const stepNum = index + 1;

      // Clear existing classes
      indicator.classList.remove('bg-indigo-600', 'border-indigo-600', 'text-white', 'border-gray-300', 'text-gray-500');

      if (stepNum === currentStep) {
        // Current step
        indicator.classList.add('bg-indigo-600', 'text-white');
      } else if (stepNum < currentStep) {
        // Completed step
        indicator.classList.add('border-indigo-600', 'text-indigo-600');
      } else {
        // Upcoming step
        indicator.classList.add('border-gray-300', 'text-gray-500');
      }
    });
  }

  /**
   * Update navigation buttons based on current step
   */
  function updateNavigationButtons() {
    const prevButtons = document.querySelectorAll('.wizard-prev-btn');
    const nextButtons = document.querySelectorAll('.wizard-next-btn');
    const createButton = document.getElementById('create-test-btn');

    // Prev button is disabled on first step
    prevButtons.forEach(button => {
      button.disabled = currentStep === 1;
      if (currentStep === 1) {
        button.classList.add('opacity-50', 'cursor-not-allowed');
      } else {
        button.classList.remove('opacity-50', 'cursor-not-allowed');
      }
    });

    // Next button is hidden on last step
    nextButtons.forEach(button => {
      if (currentStep === totalSteps) {
        button.classList.add('hidden');
      } else {
        button.classList.remove('hidden');
      }
    });

    // Create button is only shown on last step
    if (createButton) {
      if (currentStep === totalSteps) {
        createButton.classList.remove('hidden');
      } else {
        createButton.classList.add('hidden');
      }
    }
  }

  /**
   * Validate the current step
   * @returns {boolean} - Whether the current step is valid
   */
  function validateCurrentStep() {
    switch (currentStep) {
      case 1: // Test type & goal
        return validateTestTypeAndGoal();
      case 2: // Test details
        return validateTestDetails();
      case 3: // Audience
        return validateAudience();
      case 4: // Variants
        return validateVariants();
      case 5: // Review
        return true; // Nothing to validate on review step
      default:
        return true;
    }
  }

  /**
   * Validate test type and goal step
   * @returns {boolean} - Whether the step is valid
   */
  function validateTestTypeAndGoal() {
    if (!testData.testType) {
      alert('Please select a test type');
      return false;
    }

    if (!testData.goal) {
      alert('Please select a test goal');
      return false;
    }

    return true;
  }

  /**
   * Validate test details step
   * @returns {boolean} - Whether the step is valid
   */
  function validateTestDetails() {
    if (!testData.name.trim()) {
      alert('Please enter a test name');
      return false;
    }

    return true;
  }

  /**
   * Validate audience step
   * @returns {boolean} - Whether the step is valid
   */
  function validateAudience() {
    if (!testData.segmentId) {
      alert('Please select an audience segment');
      return false;
    }

    if (isNaN(testData.sampleSize) || testData.sampleSize < 1 || testData.sampleSize > 100) {
      alert('Please enter a valid sample size between 1 and 100');
      return false;
    }

    return true;
  }

  /**
   * Validate variants step
   * @returns {boolean} - Whether the step is valid
   */
  function validateVariants() {
    if (testData.variants.length < 2) {
      alert('You need at least 2 variants for an A/B test');
      return false;
    }

    // Validate variant data based on test type
    if (testData.testType === 'subject') {
      // Check that all variants have subjects
      const missingSubject = testData.variants.some(variant => !variant.subject.trim());
      if (missingSubject) {
        alert('All variants must have a subject line');
        return false;
      }
    } else if (testData.testType === 'content') {
      // Check that all variants have content
      const missingContent = testData.variants.some(variant => !variant.content);
      if (missingContent) {
        alert('All variants must have content');
        return false;
      }
    }

    return true;
  }

  /**
   * Update the UI based on the selected test type
   * @param {string} testType - The selected test type
   */
  function updateTestTypeUI(testType) {
    const subjectFields = document.querySelectorAll('.subject-field');
    const contentFields = document.querySelectorAll('.content-field');

    if (testType === 'subject') {
      subjectFields.forEach(field => field.classList.remove('hidden'));
      contentFields.forEach(field => field.classList.add('hidden'));
    } else if (testType === 'content') {
      subjectFields.forEach(field => field.classList.add('hidden'));
      contentFields.forEach(field => field.classList.remove('hidden'));
    } else if (testType === 'subject_and_content') {
      subjectFields.forEach(field => field.classList.remove('hidden'));
      contentFields.forEach(field => field.classList.remove('hidden'));
    }
  }

  /**
   * Add a new variant to the test
   */
  function addVariant() {
    const newIndex = testData.variants.length + 1;

    // Create new variant data
    const newVariant = {
      id: `variant_${newIndex}`,
      name: `Variant ${String.fromCharCode(65 + newIndex - 1)}`, // A, B, C, ...
      subject: '',
      content: null
    };

    // Add to test data
    testData.variants.push(newVariant);

    // Add to UI
    renderVariants();

    // Set up listeners for the new variant
    setupVariantInputListeners();
  }

  /**
   * Render the variants in the UI
   */
  function renderVariants() {
    const variantsContainer = document.getElementById('variants-container');
    if (!variantsContainer) return;

    variantsContainer.innerHTML = '';

    testData.variants.forEach((variant, index) => {
      const variantEl = document.createElement('div');
      variantEl.className = 'variant-item p-4 border border-gray-200 rounded-md mb-4';

      variantEl.innerHTML = `
        <div class="flex justify-between items-center mb-3">
          <div class="font-medium text-gray-700">
            <input type="text" class="variant-name-input px-2 py-1 border border-gray-300 rounded"
                   value="${variant.name}" placeholder="Variant Name">
          </div>
          ${index > 1 ? `<button class="remove-variant-btn text-red-600 hover:text-red-800" data-index="${index}">
                         <i class="fas fa-trash"></i>
                       </button>` : ''}
        </div>

        <div class="subject-field ${testData.testType !== 'content' ? '' : 'hidden'}">
          <label class="block text-sm text-gray-700 mb-1">Subject Line</label>
          <input type="text" class="variant-subject-input w-full px-3 py-2 border border-gray-300 rounded-md"
                 value="${variant.subject}" placeholder="Enter subject line">
        </div>

        <div class="content-field ${testData.testType !== 'subject' ? '' : 'hidden'} mt-3">
          <label class="block text-sm text-gray-700 mb-1">Email Content</label>
          <div class="border border-gray-300 rounded-md p-2 bg-gray-50">
            <p class="text-gray-500 text-sm italic">Content editor would be here in a real implementation</p>
          </div>
        </div>
      `;

      variantsContainer.appendChild(variantEl);
    });

    // Add remove variant listeners
    document.querySelectorAll('.remove-variant-btn').forEach(button => {
      button.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        removeVariant(index);
      });
    });
  }

  /**
   * Remove a variant from the test
   * @param {number} index - The index of the variant to remove
   */
  function removeVariant(index) {
    if (index < testData.variants.length && testData.variants.length > 2) {
      testData.variants.splice(index, 1);
      renderVariants();
      setupVariantInputListeners();
    }
  }

  /**
   * Create the A/B test
   */
  function createTest() {
    if (!window.EmailABTesting) {
      alert('A/B Testing module is not available');
      return;
    }

    // Create the test
    const test = window.EmailABTesting.createTest(testData);

    if (test) {
      // Reset wizard
      resetWizard();

      // Close wizard
      closeWizard();

      // Notify user
      alert(`A/B Test "${test.name}" created successfully!`);

      // If there's an onTestCreated callback, call it
      if (typeof window.onABTestCreated === 'function') {
        window.onABTestCreated(test);
      }
    }
  }

  /**
   * Cancel the wizard
   */
  function cancelWizard() {
    if (confirm('Are you sure you want to cancel? All unsaved test data will be lost.')) {
      resetWizard();
      closeWizard();
    }
  }

  /**
   * Close the wizard
   */
  function closeWizard() {
    const wizardContainer = document.getElementById('ab-testing-wizard-container');
    if (wizardContainer) {
      wizardContainer.classList.add('hidden');
    }
  }

  /**
   * Reset the wizard state
   */
  function resetWizard() {
    currentStep = 1;
    testData = {
      name: '',
      testType: '',
      goal: '',
      segmentId: '',
      sampleSize: 20,
      variants: [
        {
          id: 'variant_1',
          name: 'Control',
          subject: '',
          content: null
        },
        {
          id: 'variant_2',
          name: 'Variant B',
          subject: '',
          content: null
        }
      ]
    };

    // Reset UI
    const form = document.getElementById('ab-testing-wizard-form');
    if (form) {
      form.reset();
    }

    showStep(1);
    updateStepIndicators();
  }

  /**
   * Open the wizard
   * @param {Object} options - Initial options for the wizard
   */
  function openWizard(options = {}) {
    // Reset wizard state
    resetWizard();

    // Apply any provided options
    if (options.testType) {
      testData.testType = options.testType;
      document.querySelector(`input[name="test-type"][value="${options.testType}"]`).checked = true;
      updateTestTypeUI(options.testType);
    }

    if (options.goal) {
      testData.goal = options.goal;
      document.querySelector(`input[name="test-goal"][value="${options.goal}"]`).checked = true;
    }

    if (options.name) {
      testData.name = options.name;
      document.getElementById('test-name').value = options.name;
    }

    // Show the wizard
    const wizardContainer = document.getElementById('ab-testing-wizard-container');
    if (wizardContainer) {
      wizardContainer.classList.remove('hidden');
    }
  }

  // Public API
  return {
    init,
    openWizard,
    closeWizard
  };
})();

// If running in browser context, initialize when DOM is ready
if (typeof window !== 'undefined' && !window.isTestingEnvironment) {
  document.addEventListener('DOMContentLoaded', function() {
    if (EmailABTestingWizard && typeof EmailABTestingWizard.init === 'function') {
      EmailABTestingWizard.init();
    }
  });
}
