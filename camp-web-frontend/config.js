/**
 * API Configuration for Cloud Asset Management Platform
 * Centralized endpoint management to prevent configuration errors
 */

// Environment configuration
const ENV = {
    development: {
        BACKEND_URL: 'http://localhost:8000',
        API_PREFIX: '/api/v1',
        UPLOADS_URL: 'http://localhost:8000/uploads'
    },
    production: {
        BACKEND_URL: 'https://your-production-domain.com',
        API_PREFIX: '/api/v1',
        UPLOADS_URL: 'https://your-production-domain.com/uploads'
    },
    staging: {
        BACKEND_URL: 'https://staging.your-domain.com',
        API_PREFIX: '/api/v1',
        UPLOADS_URL: 'https://staging.your-domain.com/uploads'
    }
};

// Current environment (auto-detect or override)
const CURRENT_ENV = window.location.hostname === 'localhost' ? 'development' : 'production';
const config = ENV[CURRENT_ENV] || ENV.development;

// API Endpoints
export const API_ENDPOINTS = {
    // Health and system endpoints
    HEALTH: `${config.BACKEND_URL}/`,
    HEALTH_DASHBOARD: `${config.BACKEND_URL}/health`,
    
    // Asset management endpoints
    ASSETS_LIST: `${config.BACKEND_URL}${config.API_PREFIX}/files`,
    ASSET_UPLOAD: `${config.BACKEND_URL}${config.API_PREFIX}/upload`,
    ASSET_GET: (id) => `${config.BACKEND_URL}${config.API_PREFIX}/files/${id}`,
    ASSET_UPDATE: (id) => `${config.BACKEND_URL}${config.API_PREFIX}/files/${id}`,
    ASSET_DELETE: (id) => `${config.BACKEND_URL}${config.API_PREFIX}/files/${id}`,
    ASSET_DOWNLOAD: (id) => `${config.BACKEND_URL}${config.API_PREFIX}/files/${id}/download`,
    
    // File access endpoints
    UPLOADS_BASE: config.UPLOADS_URL,
    FILE_ACCESS: (filename) => `${config.UPLOADS_URL}/${filename}`,
    
    // Debug endpoints (development only)
    DEBUG_UPLOADS: `${config.BACKEND_URL}/debug/uploads`,
    TEST_ERROR: `${config.BACKEND_URL}${config.API_PREFIX}/test-error`
};

// Export configuration
export const CONFIG = {
    ...config,
    ENVIRONMENT: CURRENT_ENV,
    IS_DEVELOPMENT: CURRENT_ENV === 'development',
    IS_PRODUCTION: CURRENT_ENV === 'production'
};

// API Request configuration
export const API_CONFIG = {
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
    
    // File upload limits
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    ALLOWED_FILE_TYPES: [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain', 'text/csv',
        'application/json', 'application/xml',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
};

// Validation helpers
export const validateEndpoint = (endpoint) => {
    if (!endpoint || typeof endpoint !== 'string') {
        throw new Error('Invalid endpoint: must be a non-empty string');
    }
    
    if (!endpoint.startsWith('http')) {
        throw new Error('Invalid endpoint: must be a full URL');
    }
    
    return true;
};

// Error messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
    TIMEOUT_ERROR: 'Request timed out. Please try again.',
    SERVER_ERROR: 'Server error occurred. Please try again later.',
    NOT_FOUND: 'Requested resource not found.',
    UNAUTHORIZED: 'Authentication required. Please log in.',
    FORBIDDEN: 'Access denied. You do not have permission to perform this action.',
    VALIDATION_ERROR: 'Invalid data provided. Please check your input.',
    UPLOAD_ERROR: 'File upload failed. Please check the file and try again.',
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
};

export default {
    API_ENDPOINTS,
    CONFIG,
    API_CONFIG,
    validateEndpoint,
    ERROR_MESSAGES
};
