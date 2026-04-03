// CAMP Auth Frontend - Login Validation Logic
// Security-focused authentication system

class AuthManager {
    constructor() {
        // Hardcoded credentials for demo (in production, use secure backend)
        this.validCredentials = {
            username: 'admin',
            password: 'admin123'
        };
        
        // Security settings
        this.maxLoginAttempts = 5;
        this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        
        this.initializeEventListeners();
        this.checkSecurityStatus();
    }

    initializeEventListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }

        // Add input validation feedback
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        
        if (usernameInput) {
            usernameInput.addEventListener('input', this.clearMessages.bind(this));
        }
        
        if (passwordInput) {
            passwordInput.addEventListener('input', this.clearMessages.bind(this));
        }
    }

    handleLogin(event) {
        event.preventDefault();
        
        // Check if user is locked out
        if (this.isLockedOut()) {
            this.showMessage('Account temporarily locked. Please try again later.', 'error');
            return;
        }
        
        const username = this.sanitizeInput(document.getElementById('username').value);
        const password = this.sanitizeInput(document.getElementById('password').value);
        
        // Clear previous messages
        this.clearMessages();
        
        // Enhanced input validation
        const validationResult = this.validateInputs(username, password);
        if (!validationResult.isValid) {
            this.showMessage(validationResult.message, 'error');
            this.updateAriaError(validationResult.field, validationResult.message);
            return;
        }
        
        // Show loading state
        this.setLoadingState(true);
        
        // Simulate API call delay with security considerations
        setTimeout(() => {
            // Validate credentials
            if (this.validateCredentials(username, password)) {
                this.handleSuccessfulLogin(username);
            } else {
                this.handleFailedLogin();
            }
            
            this.setLoadingState(false);
        }, 1000 + Math.random() * 500); // Add random delay to prevent timing attacks
    }

    // Security-focused input sanitization
    sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        return input.trim().replace(/[<>"'&]/g, '');
    }
    
    // Enhanced input validation
    validateInputs(username, password) {
        if (!username || username.length === 0) {
            return { isValid: false, message: 'Username is required.', field: 'username' };
        }
        
        if (username.length > 50) {
            return { isValid: false, message: 'Username must be 50 characters or less.', field: 'username' };
        }
        
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return { isValid: false, message: 'Username can only contain letters, numbers, and underscores.', field: 'username' };
        }
        
        if (!password || password.length === 0) {
            return { isValid: false, message: 'Password is required.', field: 'password' };
        }
        
        if (password.length < 6) {
            return { isValid: false, message: 'Password must be at least 6 characters long.', field: 'password' };
        }
        
        if (password.length > 128) {
            return { isValid: false, message: 'Password must be 128 characters or less.', field: 'password' };
        }
        
        return { isValid: true, message: '', field: null };
    }
    
    // Update ARIA error messages
    updateAriaError(field, message) {
        const errorElement = document.getElementById(`${field}-error`);
        if (errorElement) {
            errorElement.textContent = message;
        }
    }
    
    // Check if user is locked out
    isLockedOut() {
        const lockoutData = localStorage.getItem('camp_lockout');
        if (!lockoutData) return false;
        
        const lockout = JSON.parse(lockoutData);
        const now = Date.now();
        
        if (now > lockout.expires) {
            localStorage.removeItem('camp_lockout');
            return false;
        }
        
        return true;
    }
    
    // Check security status
    checkSecurityStatus() {
        const userData = localStorage.getItem('camp_user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                if (user.isAuthenticated && user.loginTime) {
                    const now = Date.now();
                    if (now - new Date(user.loginTime).getTime() > this.sessionTimeout) {
                        this.logout();
                    }
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('camp_user');
            }
        }
    }
    
    validateCredentials(username, password) {
        return username === this.validCredentials.username && 
               password === this.validCredentials.password;
    }

    handleSuccessfulLogin(username) {
        // Clear any failed attempts
        localStorage.removeItem('camp_login_attempts');
        localStorage.removeItem('camp_lockout');
        
        // Store login state (in real app, this would be a JWT token)
        const userData = {
            username: username,
            loginTime: new Date().toISOString(),
            isAuthenticated: true,
            sessionExpires: Date.now() + this.sessionTimeout
        };
        
        localStorage.setItem('camp_user', JSON.stringify(userData));
        
        this.showMessage(`Welcome back, ${username}! Redirecting to dashboard...`, 'success');
        this.updateAriaStatus(`Login successful. Welcome, ${username}. Redirecting to dashboard.`);
        
        // Redirect to the main frontend app after successful login
        setTimeout(() => {
            window.location.href = 'http://localhost:3004';
        }, 1500);
    }

    handleFailedLogin() {
        this.showMessage('Invalid username or password. Please try again.', 'error');
        
        // Track failed attempts
        this.trackFailedAttempt();
        
        // Shake animation for the form
        const form = document.getElementById('loginForm');
        if (form) {
            form.classList.add('shake');
            setTimeout(() => {
                form.classList.remove('shake');
            }, 500);
        }
        
        // Clear password field for security
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.value = '';
            passwordInput.focus();
        }
        
        // Update ARIA status
        this.updateAriaStatus('Login failed. Please check your credentials and try again.');
    }
    
    // Track failed login attempts
    trackFailedAttempt() {
        const attemptsKey = 'camp_login_attempts';
        const attempts = parseInt(localStorage.getItem(attemptsKey) || '0') + 1;
        
        if (attempts >= this.maxLoginAttempts) {
            // Lock the account
            const lockoutData = {
                attempts: attempts,
                timestamp: Date.now(),
                expires: Date.now() + this.lockoutDuration
            };
            localStorage.setItem('camp_lockout', JSON.stringify(lockoutData));
            localStorage.removeItem(attemptsKey);
            this.showMessage('Account locked due to too many failed attempts. Please try again in 15 minutes.', 'error');
        } else {
            localStorage.setItem(attemptsKey, attempts.toString());
            const remaining = this.maxLoginAttempts - attempts;
            this.showMessage(`Invalid credentials. ${remaining} attempts remaining.`, 'error');
        }
    }
    
    // Update ARIA status
    updateAriaStatus(message) {
        const statusElement = document.getElementById('login-status');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    showMessage(message, type) {
        const messageContainer = document.getElementById('messageContainer');
        const messageContent = document.getElementById('messageContent');
        
        if (!messageContainer || !messageContent) return;
        
        // Set message content and styling
        messageContent.textContent = message;
        messageContent.className = `p-4 rounded-md text-sm font-medium fade-in ${
            type === 'success' ? 'success-message' : 'error-message'
        }`;
        
        // Show message container
        messageContainer.classList.remove('hidden');
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                this.clearMessages();
            }, 5000);
        }
    }

    clearMessages() {
        const messageContainer = document.getElementById('messageContainer');
        if (messageContainer) {
            messageContainer.classList.add('hidden');
        }
    }

    setLoadingState(isLoading) {
        const submitButton = document.querySelector('button[type="submit"]');
        const form = document.getElementById('loginForm');
        
        if (isLoading) {
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <span class="spinner"></span>
                Signing in...
            `;
            form.classList.add('loading');
        } else {
            submitButton.disabled = false;
            submitButton.innerHTML = `
                <i class="fas fa-sign-in-alt"></i>
                Sign in
            `;
            form.classList.remove('loading');
        }
    }

    // Check if user is already authenticated
    checkAuthenticationStatus() {
        const userData = localStorage.getItem('camp_user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                if (user.isAuthenticated && user.sessionExpires) {
                    const now = Date.now();
                    if (now < user.sessionExpires) {
                        console.log('User already authenticated:', user.username);
                        // In a real app, you might redirect to dashboard
                        // For demo, we'll allow re-login
                    } else {
                        // Session expired
                        this.logout();
                    }
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('camp_user');
            }
        }
    }
    
    // Logout function with cleanup
    logout() {
        localStorage.removeItem('camp_user');
        localStorage.removeItem('camp_login_attempts');
        localStorage.removeItem('camp_lockout');
        location.reload();
    }
}

// Initialize the auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const authManager = new AuthManager();
    authManager.checkAuthenticationStatus();
    
    // Make authManager available globally for debugging
    window.authManager = authManager;
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}
