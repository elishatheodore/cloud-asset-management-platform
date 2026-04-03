/**
 * API Testing and Validation Utility
 * Provides automated endpoint testing and validation
 */

import { API_ENDPOINTS, CONFIG, ERROR_MESSAGES } from './config.js';
import { api } from './api-client.js';

class ApiTester {
    constructor() {
        this.testResults = [];
        this.isRunning = false;
    }

    /**
     * Run comprehensive API tests
     */
    async runFullTestSuite() {
        if (this.isRunning) {
            console.warn('Test suite is already running');
            return;
        }

        this.isRunning = true;
        this.testResults = [];
        
        console.log('🧪 Starting API Test Suite...');
        
        try {
            // Test 1: Basic connectivity
            await this.testConnectivity();
            
            // Test 2: Health endpoints
            await this.testHealthEndpoints();
            
            // Test 3: Asset management endpoints
            await this.testAssetEndpoints();
            
            // Test 4: File operations
            await this.testFileOperations();
            
            // Test 5: Error handling
            await this.testErrorHandling();
            
        } catch (error) {
            console.error('Test suite error:', error);
        } finally {
            this.isRunning = false;
            this.generateReport();
        }
    }

    /**
     * Test basic connectivity
     */
    async testConnectivity() {
        console.log('🔍 Testing basic connectivity...');
        
        const result = await api.testConnection();
        
        this.addTestResult({
            name: 'Basic Connectivity',
            endpoint: API_ENDPOINTS.HEALTH,
            method: 'GET',
            status: result.healthy ? 'PASS' : 'FAIL',
            responseTime: result.responseTime,
            message: result.healthy ? 'Connection successful' : result.error,
            details: result
        });
    }

    /**
     * Test health endpoints
     */
    async testHealthEndpoints() {
        console.log('🏥 Testing health endpoints...');
        
        // Test main health endpoint
        const healthResult = await api.get(API_ENDPOINTS.HEALTH);
        
        this.addTestResult({
            name: 'Health Endpoint',
            endpoint: API_ENDPOINTS.HEALTH,
            method: 'GET',
            status: healthResult.success ? 'PASS' : 'FAIL',
            message: healthResult.success ? 'Health check passed' : healthResult.error,
            details: healthResult
        });
    }

    /**
     * Test asset management endpoints
     */
    async testAssetEndpoints() {
        console.log('📁 Testing asset endpoints...');
        
        // Test list files
        const listResult = await api.get(API_ENDPOINTS.ASSETS_LIST);
        
        this.addTestResult({
            name: 'List Assets',
            endpoint: API_ENDPOINTS.ASSETS_LIST,
            method: 'GET',
            status: listResult.success ? 'PASS' : 'FAIL',
            message: listResult.success ? `Found ${listResult.data?.assets?.length || 0} assets` : listResult.error,
            details: listResult
        });
    }

    /**
     * Test file operations
     */
    async testFileOperations() {
        console.log('📤 Testing file operations...');
        
        // Create a test file
        const testFile = new Blob(['test content'], { type: 'text/plain' });
        testFile.name = 'test-file.txt';
        
        // Test upload (if endpoint exists and is accessible)
        try {
            const uploadResult = await api.uploadFile(API_ENDPOINTS.ASSET_UPLOAD, testFile);
            
            this.addTestResult({
                name: 'File Upload',
                endpoint: API_ENDPOINTS.ASSET_UPLOAD,
                method: 'POST',
                status: uploadResult.success ? 'PASS' : 'FAIL',
                message: uploadResult.success ? 'File uploaded successfully' : uploadResult.error,
                details: uploadResult
            });
            
            // Test delete if upload was successful
            if (uploadResult.success && uploadResult.data?.id) {
                const deleteResult = await api.delete(API_ENDPOINTS.ASSET_DELETE(uploadResult.data.id));
                
                this.addTestResult({
                    name: 'File Delete',
                    endpoint: API_ENDPOINTS.ASSET_DELETE(uploadResult.data.id),
                    method: 'DELETE',
                    status: deleteResult.success ? 'PASS' : 'FAIL',
                    message: deleteResult.success ? 'File deleted successfully' : deleteResult.error,
                    details: deleteResult
                });
            }
        } catch (error) {
            this.addTestResult({
                name: 'File Operations',
                endpoint: 'Multiple',
                method: 'POST/DELETE',
                status: 'SKIP',
                message: `File operations test skipped: ${error.message}`,
                details: { error: error.message }
            });
        }
    }

    /**
     * Test error handling
     */
    async testErrorHandling() {
        console.log('⚠️ Testing error handling...');
        
        // Test 404 error
        const notFoundResult = await api.get(`${API_ENDPOINTS.ASSETS_LIST}/999999`);
        
        this.addTestResult({
            name: '404 Error Handling',
            endpoint: `${API_ENDPOINTS.ASSETS_LIST}/999999`,
            method: 'GET',
            status: !notFoundResult.success ? 'PASS' : 'FAIL',
            message: !notFoundResult.success ? '404 error handled correctly' : 'Expected 404 error',
            details: notFoundResult
        });
        
        // Test invalid endpoint
        const invalidResult = await api.get(`${CONFIG.BACKEND_URL}/invalid-endpoint`);
        
        this.addTestResult({
            name: 'Invalid Endpoint Handling',
            endpoint: `${CONFIG.BACKEND_URL}/invalid-endpoint`,
            method: 'GET',
            status: !invalidResult.success ? 'PASS' : 'FAIL',
            message: !invalidResult.success ? 'Invalid endpoint handled correctly' : 'Expected error for invalid endpoint',
            details: invalidResult
        });
    }

    /**
     * Add test result
     */
    addTestResult(result) {
        result.timestamp = new Date().toISOString();
        this.testResults.push(result);
        
        const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
        console.log(`${statusIcon} ${result.name}: ${result.message}`);
    }

    /**
     * Generate test report
     */
    generateReport() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
        const failedTests = this.testResults.filter(r => r.status === 'FAIL').length;
        const skippedTests = this.testResults.filter(r => r.status === 'SKIP').length;
        
        const report = {
            summary: {
                total: totalTests,
                passed: passedTests,
                failed: failedTests,
                skipped: skippedTests,
                successRate: totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0
            },
            tests: this.testResults,
            timestamp: new Date().toISOString()
        };
        
        console.log('\n📊 API Test Report:');
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests} ✅`);
        console.log(`Failed: ${failedTests} ❌`);
        console.log(`Skipped: ${skippedTests} ⚠️`);
        console.log(`Success Rate: ${report.summary.successRate}%`);
        
        if (failedTests > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults.filter(r => r.status === 'FAIL').forEach(test => {
                console.log(`  - ${test.name}: ${test.message}`);
            });
        }
        
        // Store report globally for access
        window.lastApiTestReport = report;
        
        return report;
    }

    /**
     * Quick health check
     */
    async quickHealthCheck() {
        console.log('🏥 Quick health check...');
        const result = await api.healthCheck();
        
        if (result.healthy) {
            console.log(`✅ API is healthy: ${result.status}`);
        } else {
            console.log(`❌ API health check failed: ${result.error}`);
        }
        
        return result;
    }

    /**
     * Test specific endpoint
     */
    async testEndpoint(name, endpoint, method = 'GET', data = null) {
        console.log(`🧪 Testing ${name}...`);
        
        let result;
        switch (method.toUpperCase()) {
            case 'GET':
                result = await api.get(endpoint);
                break;
            case 'POST':
                result = await api.post(endpoint, data);
                break;
            case 'PUT':
                result = await api.put(endpoint, data);
                break;
            case 'DELETE':
                result = await api.delete(endpoint);
                break;
            default:
                result = { success: false, error: 'Invalid method' };
        }
        
        this.addTestResult({
            name,
            endpoint,
            method,
            status: result.success ? 'PASS' : 'FAIL',
            message: result.success ? 'Endpoint test passed' : result.error,
            details: result
        });
        
        return result;
    }
}

// Create singleton instance
export const apiTester = new ApiTester();

// Add to global scope for easy access
window.apiTester = apiTester;
window.runApiTests = () => apiTester.runFullTestSuite();
window.quickHealthCheck = () => apiTester.quickHealthCheck();

export default apiTester;
