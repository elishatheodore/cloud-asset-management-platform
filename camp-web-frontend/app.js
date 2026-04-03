/**
 * Cloud Asset Management Platform - Frontend Application
 * Updated with robust API client and centralized configuration
 */

import { API_ENDPOINTS, CONFIG, API_CONFIG, ERROR_MESSAGES } from './config.js';
import { api } from './api-client.js';

// Application state
let selectedFile = null;
let files = [];
let isUploading = false;

// Notification system
function showNotification(message, type = 'info') {
    const container = document.getElementById('notifications-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// API functions with robust error handling
async function checkHealth() {
    try {
        showNotification('Checking API health...', 'info');
        const result = await api.healthCheck();
        
        if (result.healthy) {
            showNotification(`API is healthy: ${result.status} (v${result.version})`, 'success');
        } else {
            showNotification(`Health check failed: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('Health check failed:', error);
        showNotification(`Health check failed: ${error.message}`, 'error');
    }
}

async function listFiles() {
    const loadingState = document.getElementById('loading-state');
    const filesGrid = document.getElementById('files-grid');
    
    loadingState.style.display = 'block';
    filesGrid.innerHTML = '';
    
    try {
        const result = await api.get(API_ENDPOINTS.ASSETS_LIST);
        
        if (result.success) {
            files = result.data.assets || [];
            displayFiles();
            showNotification(`Loaded ${files.length} files`, 'success');
        } else {
            showNotification(`Failed to load files: ${result.error}`, 'error');
            files = [];
            displayFiles();
        }
    } catch (error) {
        console.error('Failed to load files:', error);
        showNotification(`Failed to load files: ${error.message}`, 'error');
        files = [];
        displayFiles();
    } finally {
        loadingState.style.display = 'none';
    }
}

function displayFiles() {
    const filesGrid = document.getElementById('files-grid');
    const filesCount = document.getElementById('files-count');
    
    filesCount.textContent = files.length;
    
    if (files.length === 0) {
        filesGrid.innerHTML = '<p style="text-align: center; color: #666;">No files found. Upload a file to get started.</p>';
        return;
    }
    
    filesGrid.innerHTML = files.map(file => `
        <div class="file-card" data-file-id="${file.id}">
            <div class="file-header">
                <div class="file-icon">
                    ${getFileIcon(file.content_type)}
                </div>
                <div class="file-actions">
                    <button onclick="editFile(${file.id}, '${file.filename}')" title="Edit">✏️</button>
                    <button onclick="deleteFile(${file.id}, '${file.filename}')" title="Delete">🗑️</button>
                </div>
            </div>
            <div class="file-info">
                <h4>${file.filename}</h4>
                <p>${formatFileSize(file.file_size)} • ${formatDate(file.created_at)}</p>
            </div>
        </div>
    `).join('');
}

function getFileIcon(contentType) {
    if (contentType?.startsWith('image/')) return '🖼️';
    if (contentType?.includes('pdf')) return '📄';
    if (contentType?.includes('text')) return '📝';
    if (contentType?.includes('document')) return '📄';
    if (contentType?.includes('spreadsheet')) return '📊';
    if (contentType?.includes('audio')) return '🎵';
    if (contentType?.includes('video')) return '🎬';
    return '📎';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// File upload functions
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        selectFile(file);
    }
}

function selectFile(file) {
    // Validate file size
    if (file.size > API_CONFIG.MAX_FILE_SIZE) {
        showNotification(`File size must be less than ${API_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`, 'error');
        return;
    }
    
    // Validate file type
    if (!API_CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
        showNotification(`File type ${file.type} is not allowed`, 'error');
        return;
    }
    
    selectedFile = file;
    
    document.getElementById('selected-filename').textContent = file.name;
    document.getElementById('selected-size').textContent = formatFileSize(file.size);
    document.getElementById('upload-controls').style.display = 'block';
}

function clearFileSelection() {
    selectedFile = null;
    document.getElementById('file-input').value = '';
    document.getElementById('upload-controls').style.display = 'none';
    
    // Reset upload content
    document.getElementById('upload-content').innerHTML = `
        <i class="fas fa-cloud-upload-alt upload-icon"></i>
        <h3>Drag & Drop Your File Here</h3>
        <p>or</p>
        <button class="btn btn-primary" onclick="document.getElementById('file-input').click()">
            <i class="fas fa-folder-open"></i>
            Browse Files
        </button>
    `;
}

async function uploadFile() {
    if (!selectedFile) {
        showNotification('Please select a file first', 'error');
        return;
    }
    
    if (isUploading) {
        showNotification('Upload already in progress...', 'warning');
        return;
    }
    
    isUploading = true;
    
    try {
        showNotification('Uploading file...', 'info');
        
        const result = await api.uploadFile(
            API_ENDPOINTS.ASSET_UPLOAD, 
            selectedFile,
            (progress) => {
                showNotification(`Uploading: ${Math.round(progress)}%`, 'info');
            }
        );
        
        if (result.success) {
            showNotification(`File "${result.data.filename}" uploaded successfully`, 'success');
            clearFileSelection();
            listFiles(); // Refresh file list
        } else {
            showNotification(`Upload failed: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('Upload failed:', error);
        showNotification(`Upload failed: ${error.message}`, 'error');
    } finally {
        isUploading = false;
    }
}

// File operations
function editFile(id, currentName) {
    // Remove any existing modals
    const existingModals = document.querySelectorAll('.custom-modal');
    existingModals.forEach(modal => modal.remove());
    
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.innerHTML = `
        <div class="custom-modal-overlay"></div>
        <div class="custom-modal-content">
            <button class="custom-modal-close">&times;</button>
            <h3>Rename File</h3>
            <input type="text" id="edit-input-${id}" value="${currentName}" placeholder="Enter new filename">
            <p>Press Enter to save or Escape to cancel</p>
            <div class="custom-modal-buttons">
                <button class="btn btn-secondary" id="cancel-edit-${id}">Cancel</button>
                <button class="btn btn-primary" id="confirm-edit-${id}">Save</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Get elements
    const overlay = modal.querySelector('.custom-modal-overlay');
    const closeBtn = modal.querySelector('.custom-modal-close');
    const input = document.getElementById(`edit-input-${id}`);
    const cancelBtn = document.getElementById(`cancel-edit-${id}`);
    const confirmBtn = document.getElementById(`confirm-edit-${id}`);
    
    // Focus and select input
    setTimeout(() => {
        input.focus();
        input.select();
    }, 100);
    
    // Event listeners
    const closeModal = () => {
        modal.remove();
    };
    
    overlay.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const newName = input.value.trim();
            if (newName && newName !== currentName) {
                updateFile(id, newName);
            }
            closeModal();
        } else if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    confirmBtn.addEventListener('click', () => {
        const newName = input.value.trim();
        if (newName && newName !== currentName) {
            updateFile(id, newName);
        }
        closeModal();
    });
    
    // Add escape key listener
    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    });
}

async function updateFile(id, filename) {
    try {
        showNotification('Updating file...', 'info');
        const result = await api.put(API_ENDPOINTS.ASSET_UPDATE(id), { filename });
        
        if (result.success) {
            showNotification('File renamed successfully', 'success');
            listFiles(); // Refresh file list
        } else {
            showNotification(`Rename failed: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('Rename failed:', error);
        showNotification(`Rename failed: ${error.message}`, 'error');
    }
}

function deleteFile(id, filename) {
    // Remove any existing modals
    const existingModals = document.querySelectorAll('.custom-modal');
    existingModals.forEach(modal => modal.remove());
    
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.innerHTML = `
        <div class="custom-modal-overlay"></div>
        <div class="custom-modal-content">
            <button class="custom-modal-close">&times;</button>
            <div class="delete-warning">⚠️</div>
            <h3>Delete File</h3>
            <p>Are you sure you want to delete</p>
            <p class="delete-filename">"${filename}"?</p>
            <p class="delete-warning-text">This action cannot be undone.</p>
            <div class="custom-modal-buttons">
                <button class="btn btn-secondary" id="cancel-delete-${id}">Cancel</button>
                <button class="btn btn-danger" id="confirm-delete-${id}">Delete</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Get elements
    const overlay = modal.querySelector('.custom-modal-overlay');
    const closeBtn = modal.querySelector('.custom-modal-close');
    const cancelBtn = document.getElementById(`cancel-delete-${id}`);
    const confirmBtn = document.getElementById(`confirm-delete-${id}`);
    
    // Event listeners
    const closeModal = () => {
        modal.remove();
    };
    
    overlay.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    confirmBtn.addEventListener('click', () => {
        confirmDelete(id);
        closeModal();
    });
    
    // Add escape key listener
    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    });
}

async function confirmDelete(id) {
    try {
        showNotification('Deleting file...', 'info');
        const result = await api.delete(API_ENDPOINTS.ASSET_DELETE(id));
        
        if (result.success) {
            showNotification('File deleted successfully', 'success');
            listFiles(); // Refresh file list
        } else {
            showNotification(`Delete failed: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('Delete failed:', error);
        showNotification(`Delete failed: ${error.message}`, 'error');
    }
}

// Drag and drop
function setupDragAndDrop() {
    const dropZone = document.getElementById('drop-zone');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    dropZone.addEventListener('dragenter', () => {
        dropZone.classList.add('drag-active');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-active');
    });
    
    dropZone.addEventListener('drop', (e) => {
        dropZone.classList.remove('drag-active');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            selectFile(files[0]);
        }
    });
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}


// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    setupDragAndDrop();
    
    // Set up file input
    document.getElementById('file-input').addEventListener('change', handleFileSelect);
    
    // Show welcome message
    showNotification('Welcome to Cloud Asset Management Platform!', 'info');
    
    // Load files on startup
    listFiles();
});

// Global functions for onclick handlers
window.listFiles = listFiles;
window.checkHealth = checkHealth;
window.uploadFile = uploadFile;
window.clearFileSelection = clearFileSelection;
window.editFile = editFile;
window.deleteFile = deleteFile;
window.confirmDelete = confirmDelete;
