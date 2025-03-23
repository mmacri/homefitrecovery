/**
 * Recovery Essentials Admin - Authentication Module
 * This script handles authentication for the admin dashboard
 */

// Storage key for authentication
const AUTH_KEY = 'recoveryEssentials_auth';
const AUTH_API_URL = '/api/auth'; // This would be a real server endpoint in production

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>} Authentication status
 */
async function checkAuth() {
    const authData = JSON.parse(localStorage.getItem(AUTH_KEY) || '{"authenticated": false}');

    // Check if authenticated and not expired
    if (!authData.authenticated || authData.expires <= Date.now()) {
        // Not authenticated or expired, redirect to login
        redirectToLogin();
        return false;
    }

    try {
        // Verify session with server (prevent session forgery)
        const response = await validateSessionWithServer(authData.token);

        if (!response.valid) {
            // Invalid or expired token according to the server
            console.log('Server rejected authentication token, logging out');
            await logout();
            return false;
        }

        // Extend session if it's valid but close to expiring
        const timeRemaining = authData.expires - Date.now();
        if (timeRemaining < 3600000) { // Less than 1 hour remaining
            extendSession();
        }

        return true;
    } catch (error) {
        console.error('Error verifying authentication:', error);

        // If server is unreachable, still allow access if local token is valid
        // This allows offline usage in case of server issues
        return authData.authenticated && authData.expires > Date.now();
    }
}

/**
 * Check if user has required permission to access a feature
 * @param {string} permission - The permission to check
 * @returns {boolean} Whether user has permission
 */
function checkPermission(permission) {
    // Get current user
    const user = getCurrentUser();

    // Check if user-roles.js is loaded
    if (window.UserRoles && typeof window.UserRoles.hasPermission === 'function') {
        return window.UserRoles.hasPermission(user, permission);
    }

    // Fallback to role-based check if UserRoles module not loaded
    if (user.role === 'admin') {
        return true; // Admin has all permissions
    }

    return false;
}

/**
 * Check if user has any of the required permissions
 * @param {Array} permissions - Array of permissions to check
 * @returns {boolean} Whether user has any of the permissions
 */
function checkAnyPermission(permissions) {
    // Get current user
    const user = getCurrentUser();

    // Check if user-roles.js is loaded
    if (window.UserRoles && typeof window.UserRoles.hasAnyPermission === 'function') {
        return window.UserRoles.hasAnyPermission(user, permissions);
    }

    // Fallback to role-based check if UserRoles module not loaded
    if (user.role === 'admin') {
        return true; // Admin has all permissions
    }

    return false;
}

/**
 * Validate the session token with the server
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Validation result
 */
async function validateSessionWithServer(token) {
    // In a real implementation, this would make an API call to the server
    console.log('Validating session with server...');

    // Simulate server validation (in production, this would be a real API call)
    // const response = await fetch(`${AUTH_API_URL}/validate`, {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${token}`
    //     }
    // });
    // return await response.json();

    // For demo purposes, simulate successful validation
    return { valid: true };
}

/**
 * Attempt login with credentials
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Login result
 */
async function login(email, password) {
    try {
        // Clear any existing auth data
        localStorage.removeItem(AUTH_KEY);

        // Validate inputs
        if (!email || !password) {
            return { success: false, message: 'Email and password are required' };
        }

        // In a real implementation, this would make an API call to the server
        console.log('Authenticating with server...');

        // Simulate server authentication (in production, this would be a real API call)
        // const response = await fetch(`${AUTH_API_URL}/login`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({ email, password })
        // });
        // const result = await response.json();

        // For demo purposes, check if user exists in users storage
        let user = null;
        let foundUser = null;

        if (window.UserRoles && typeof window.UserRoles.getAllUsers === 'function') {
            const users = window.UserRoles.getAllUsers();
            foundUser = Object.values(users).find(u => u.email === email);

            // If user doesn't exist in system yet but is using the default admin credentials,
            // fall back to the default admin login for backward compatibility
            if (!foundUser && email === 'admin@recoveryessentials.com' && password === 'demo1234') {
                foundUser = {
                    id: 'admin',
                    name: 'Admin User',
                    email: email,
                    role: 'admin',
                    created: Date.now(),
                    lastLogin: Date.now()
                };

                // Add this user to users storage
                if (window.UserRoles && typeof window.UserRoles.saveUser === 'function') {
                    window.UserRoles.saveUser('admin', foundUser);
                }
            }
        } else if (email === 'admin@recoveryessentials.com' && password === 'demo1234') {
            // Fall back to hardcoded check if UserRoles module not loaded
            foundUser = {
                id: 'admin',
                name: 'Admin User',
                email: email,
                role: 'admin',
                created: Date.now(),
                lastLogin: Date.now()
            };
        }

        // If user found, simulate successful login
        if (foundUser) {
            // Create session
            const expirationTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
            const sessionToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIFVzZXIiLCJpYXQiOjE1MTYyMzkwMjJ9';

            // Update last login time
            foundUser.lastLogin = Date.now();

            // Update in storage if roles module exists
            if (window.UserRoles && typeof window.UserRoles.saveUser === 'function') {
                window.UserRoles.saveUser(foundUser.id, foundUser);
            }

            const authData = {
                authenticated: true,
                token: sessionToken,
                expires: expirationTime,
                user: foundUser
            };

            // Save auth data
            localStorage.setItem(AUTH_KEY, JSON.stringify(authData));

            return {
                success: true,
                message: 'Authentication successful',
                user: {
                    id: foundUser.id,
                    name: foundUser.name,
                    email: foundUser.email,
                    role: foundUser.role
                }
            };
        }

        return { success: false, message: 'Invalid email or password' };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Authentication failed. Please try again.' };
    }
}

/**
 * Log out the current user
 * @returns {Promise<boolean>} Logout success
 */
async function logout() {
    try {
        const authData = JSON.parse(localStorage.getItem(AUTH_KEY) || '{"authenticated": false}');

        // In a real implementation, notify the server to invalidate the token
        if (authData.authenticated && authData.token) {
            console.log('Logging out from server...');

            // Simulate server logout (in production, this would be a real API call)
            // await fetch(`${AUTH_API_URL}/logout`, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${authData.token}`
            //     }
            // });
        }

        // Clear local storage
        localStorage.removeItem(AUTH_KEY);

        // Redirect to login page
        redirectToLogin();
        return true;
    } catch (error) {
        console.error('Logout error:', error);

        // Still clear local storage even if server request fails
        localStorage.removeItem(AUTH_KEY);
        redirectToLogin();
        return false;
    }
}

/**
 * Redirect to login page
 */
function redirectToLogin() {
    const currentPath = window.location.pathname;
    if (!currentPath.includes('login.html')) {
        window.location.href = 'login.html';
    }
}

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise<Object>} Reset request result
 */
async function requestPasswordReset(email) {
    try {
        if (!email) {
            return { success: false, message: 'Email is required' };
        }

        console.log('Requesting password reset...');

        // Check if user exists (in a real system, this check would happen server-side)
        let userExists = false;

        if (window.UserRoles && typeof window.UserRoles.getAllUsers === 'function') {
            const users = window.UserRoles.getAllUsers();
            userExists = Object.values(users).some(u => u.email === email);
        } else if (email === 'admin@recoveryessentials.com') {
            userExists = true;
        }

        // Always return success to prevent email enumeration
        return {
            success: true,
            message: 'If an account exists with this email, password reset instructions will be sent'
        };
    } catch (error) {
        console.error('Password reset error:', error);
        return {
            success: false,
            message: 'Could not process your request. Please try again.'
        };
    }
}

/**
 * Reset password with token
 * @param {string} token - Reset token from email
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Password reset result
 */
async function resetPassword(token, newPassword) {
    try {
        if (!token || !newPassword) {
            return { success: false, message: 'Token and new password are required' };
        }

        console.log('Resetting password...');

        // Simulate server request (in production, this would be a real API call)
        // const response = await fetch(`${AUTH_API_URL}/reset-password/confirm`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({ token, newPassword })
        // });
        // return await response.json();

        // For demo purposes, use a hardcoded valid token
        if (token === 'valid-reset-token') {
            return { success: true, message: 'Password has been reset successfully' };
        }

        return { success: false, message: 'Invalid or expired token' };
    } catch (error) {
        console.error('Password reset confirmation error:', error);
        return { success: false, message: 'Could not reset password. Please try again.' };
    }
}

/**
 * Get current user data
 * @returns {Object} User data
 */
function getCurrentUser() {
    const authData = JSON.parse(localStorage.getItem(AUTH_KEY) || '{"authenticated": false, "user": {}}');
    return authData.user || {};
}

/**
 * Update user profile data
 * @param {Object} userData - Updated user data
 * @returns {Promise<boolean>} Update success
 */
async function updateUserProfile(userData) {
    const authData = JSON.parse(localStorage.getItem(AUTH_KEY) || '{"authenticated": false}');

    if (!authData.authenticated) {
        return false;
    }

    try {
        // In a real implementation, update the server first
        console.log('Updating user profile on server...');

        // Update in roles system if available
        if (window.UserRoles && typeof window.UserRoles.saveUser === 'function' && userData.id) {
            window.UserRoles.saveUser(userData.id, userData);
        }

        // Update user data in auth
        authData.user = {...authData.user, ...userData};

        // Save back to localStorage
        localStorage.setItem(AUTH_KEY, JSON.stringify(authData));

        return true;
    } catch (error) {
        console.error('Profile update error:', error);
        return false;
    }
}

/**
 * Extend the current session
 * @param {number} hours - Number of hours to extend
 * @returns {Promise<boolean>} Extension success
 */
async function extendSession(hours = 24) {
    const authData = JSON.parse(localStorage.getItem(AUTH_KEY) || '{"authenticated": false}');

    if (!authData.authenticated) {
        return false;
    }

    try {
        // In a real implementation, extend the session on the server first
        console.log('Extending session on server...');

        // Extend expiration locally
        authData.expires = Date.now() + (hours * 60 * 60 * 1000);

        // Save back to localStorage
        localStorage.setItem(AUTH_KEY, JSON.stringify(authData));

        return true;
    } catch (error) {
        console.error('Session extension error:', error);
        return false;
    }
}

/**
 * Initialize authentication system and integrate with user roles
 */
function initAuth() {
    // If user is authenticated but roles system is being initialized,
    // make sure the user exists in the roles system
    const authData = JSON.parse(localStorage.getItem(AUTH_KEY) || '{"authenticated": false}');

    if (authData.authenticated && authData.user && window.UserRoles) {
        const users = window.UserRoles.getAllUsers();
        const userExists = users[authData.user.id];

        if (!userExists && authData.user.id) {
            // Add user to roles system
            window.UserRoles.saveUser(authData.user.id, authData.user);
        }
    }
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Only check auth if not on login page
    if (!window.location.pathname.includes('login.html')) {
        checkAuth();
    } else {
        // On login page, set up login form handlers
        setupLoginForm();

        // Check if already authenticated
        const authData = JSON.parse(localStorage.getItem(AUTH_KEY) || '{"authenticated": false}');
        if (authData.authenticated && authData.expires > Date.now()) {
            // Already authenticated, redirect to dashboard
            window.location.href = 'index.html';
        }
    }

    // Set up logout buttons
    const logoutButtons = document.querySelectorAll('.logout-button');
    logoutButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    });

    // Set up password reset form if it exists
    const resetForm = document.getElementById('password-reset-form');
    if (resetForm) {
        resetForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('reset-email').value;
            const result = await requestPasswordReset(email);

            // Show message to user
            const notification = document.getElementById('reset-notification');
            if (notification) {
                notification.textContent = result.message;
                notification.className = result.success ? 'success-message' : 'error-message';
                notification.style.display = 'block';
            }
        });
    }

    // Initialize auth with roles system if it exists
    if (window.UserRoles) {
        initAuth();
    }
});

/**
 * Set up login form event handlers
 */
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorDisplay = document.getElementById('login-error');

            // Attempt login
            const result = await login(email, password);

            if (result.success) {
                // Redirect to dashboard
                window.location.href = 'index.html';
            } else {
                // Show error message
                if (errorDisplay) {
                    const errorMessage = errorDisplay.querySelector('.text-red-700 p');
                    if (errorMessage) {
                        errorMessage.textContent = result.message;
                    }
                    errorDisplay.classList.remove('hidden');
                }
            }
        });
    }

    // Handle forgot password link
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();

            const loginFormContainer = document.getElementById('login-form-container');
            const resetFormContainer = document.getElementById('reset-form-container');

            if (loginFormContainer && resetFormContainer) {
                loginFormContainer.classList.add('hidden');
                resetFormContainer.classList.remove('hidden');
            }
        });
    }

    // Handle back to login link
    const backToLoginLink = document.getElementById('back-to-login-link');
    if (backToLoginLink) {
        backToLoginLink.addEventListener('click', function(e) {
            e.preventDefault();

            const loginFormContainer = document.getElementById('login-form-container');
            const resetFormContainer = document.getElementById('reset-form-container');

            if (loginFormContainer && resetFormContainer) {
                resetFormContainer.classList.add('hidden');
                loginFormContainer.classList.remove('hidden');
            }
        });
    }
}
