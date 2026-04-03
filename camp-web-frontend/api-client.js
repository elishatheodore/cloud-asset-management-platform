/**
 * Robust API Client for Cloud Asset Management Platform
 * Provides centralized API communication with error handling, retries, and validation
 */

import { API_ENDPOINTS, CONFIG, API_CONFIG, ERROR_MESSAGES, validateEndpoint } from './config.js';

class ApiClient {
    constructor() {
        this.baseUrl = CONFIG.BACKEND_URL;
        this.timeout = API_CONFIG.TIMEOUT;
        this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
        this.retryDelay = API_CONFIG.RETRY_DELAY;
    }

    /**
     * Make HTTP request with timeout and retry logic
     */
    async request(endpoint, options = {}) {
        validateEndpoint(endpoint);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        const config = {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        let lastError;
        
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                console.log(`API Request: ${options.method || 'GET'} ${endpoint} (Attempt ${attempt}/${this.retryAttempts})`);
                
                const response = await fetch(endpoint, config);
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                // Parse JSON response
                const data = await response.json();
                console.log('API Response:', data);
                
                return {
                    success: true,
                    data,
                    status: response.status,
                    headers: response.headers
                };
                
            } catch (error) {
                clearTimeout(timeoutId);
                lastError = error;
                
                console.error(`API Error (Attempt ${attempt}/${this.retryAttempts}):`, error.message);
                
                // Don't retry on certain errors
                if (error.name === 'AbortError') {
                    lastError = new Error(ERROR_MESSAGES.TIMEOUT_ERROR);
                    break;
                }
                
                if (error.message.includes('HTTP 4')) {
                    // Client errors (4xx) shouldn't be retried
                    break;
                }
                
                // Wait before retry (except on last attempt)
                if (attempt < this.retryAttempts) {
                    await this.delay(this.retryDelay * attempt);
                }
            }
        }
        
        // All attempts failed
        const errorMessage = this.getErrorMessage(lastError);
        console.error('API Request Failed:', errorMessage);
        
        return {
            success: false,
            error: errorMessage,
            details: lastError.message
        };
    }

    /**
     * GET request
     */
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    /**
     * POST request
     */
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT request
     */
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request
     */
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    /**
     * File upload with progress tracking
     */
    async uploadFile(endpoint, file, onProgress = null) {
        validateEndpoint(endpoint);
        
        if (!file) {
            throw new Error('No file provided for upload');
        }
        
        // Validate file size
        if (file.size > API_CONFIG.MAX_FILE_SIZE) {
            throw new Error(`File size exceeds maximum limit of ${API_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`);
        }
        
        // Validate file type
        if (!API_CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
            throw new Error(`File type ${file.type} is not allowed`);
        }
        
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('file', file);
            
            const xhr = new XMLHttpRequest();
            
            // Progress tracking
            if (onProgress && typeof onProgress === 'function') {
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = (event.loaded / event.total) * 100;
                        onProgress(percentComplete);
                    }
                });
            }
            
            // Timeout
            const timeoutId = setTimeout(() => {
                xhr.abort();
                reject(new Error(ERROR_MESSAGES.TIMEOUT_ERROR));
            }, this.timeout);
            
            xhr.onload = () => {
                clearTimeout(timeoutId);
                
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        resolve({
                            success: true,
                            data,
                            status: xhr.status
                        });
                    } catch (error) {
                        reject(new Error('Invalid JSON response from server'));
                    }
                } else {
                    reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                }
            };
            
            xhr.onerror = () => {
                clearTimeout(timeoutId);
                reject(new Error(ERROR_MESSAGES.NETWORK_ERROR));
            };
            
            xhr.open('POST', endpoint);
            xhr.send(formData);
        });
    }

    /**
     * Helper method to delay execution
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get user-friendly error message
     */
    getErrorMessage(error) {
        if (error.name === 'AbortError') {
            return ERROR_MESSAGES.TIMEOUT_ERROR;
        }
        
        if (error.message.includes('Failed to fetch')) {
            return ERROR_MESSAGES.NETWORK_ERROR;
        }
        
        if (error.message.includes('HTTP 404')) {
            return ERROR_MESSAGES.NOT_FOUND;
        }
        
        if (error.message.includes('HTTP 401')) {
            return ERROR_MESSAGES.UNAUTHORIZED;
        }
        
        if (error.message.includes('HTTP 403')) {
            return ERROR_MESSAGES.FORBIDDEN;
        }
        
        if (error.message.includes('HTTP 4')) {
            return ERROR_MESSAGES.VALIDATION_ERROR;
        }
        
        if (error.message.includes('HTTP 5')) {
            return ERROR_MESSAGES.SERVER_ERROR;
        }
        
        return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
    }

    /**
     * Health check with detailed status
     */
    async healthCheck() {
        const result = await this.get(API_ENDPOINTS.HEALTH);
        
        if (result.success) {
            return {
                healthy: true,
                status: result.data.status,
                version: result.data.version,
                message: result.data.message,
                auth_enabled: result.data.auth_enabled
            };
        } else {
            return {
                healthy: false,
                error: result.error,
                details: result.details
            };
        }
    }

    /**
     * Test connection to backend
     */
    async testConnection() {
        const startTime = Date.now();
        const result = await this.healthCheck();
        const responseTime = Date.now() - startTime;
        
        return {
            ...result,
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        };
    }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export convenience methods
export const api = {
    get: (endpoint) => apiClient.get(endpoint),
    post: (endpoint, data) => apiClient.post(endpoint, data),
    put: (endpoint, data) => apiClient.put(endpoint, data),
    delete: (endpoint) => apiClient.delete(endpoint),
    uploadFile: (endpoint, file, onProgress) => apiClient.uploadFile(endpoint, file, onProgress),
    healthCheck: () => apiClient.healthCheck(),
    testConnection: () => apiClient.testConnection()
};

export default api;
