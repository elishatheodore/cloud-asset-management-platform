// Simple Cloud Asset Management Platform
const API_BASE_URL = 'http://localhost:8000/api/v1';

let selectedFile = null;
let files = [];

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

// API functions
async function checkHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/`);
        const data = await response.json();
        showNotification(`API is healthy: ${data.status}`, 'success');
    } catch (error) {
        showNotification(`Health check failed: ${error.message}`, 'error');
    }
}

async function listFiles() {
    const loadingState = document.getElementById('loading-state');
    const filesGrid = document.getElementById('files-grid');
    
    loadingState.style.display = 'block';
    filesGrid.innerHTML = '';
    
    try {
        const response = await fetch(`${API_BASE_URL}/files`);
        const data = await response.json();
        files = data.assets || [];
        
        displayFiles();
        showNotification(`Loaded ${files.length} files`, 'success');
    } catch (error) {
        showNotification(`Failed to load files: ${error.message}`, 'error');
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
    if (file.size > 50 * 1024 * 1024) {
        showNotification('File size must be less than 50MB', 'error');
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
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    try {
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
            showNotification(`File "${data.filename}" uploaded successfully`, 'success');
            clearFileSelection();
            listFiles(); // Refresh file list
        } else {
            const errorData = await response.json();
            showNotification(`Upload failed: ${errorData.error || 'Unknown error'}`, 'error');
        }
    } catch (error) {
        showNotification(`Upload failed: ${error.message}`, 'error');
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
        const response = await fetch(`${API_BASE_URL}/files/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filename })
        });
        
        if (response.ok) {
            showNotification('File renamed successfully', 'success');
            listFiles(); // Refresh file list
        } else {
            const errorData = await response.json();
            showNotification(`Rename failed: ${errorData.error || 'Unknown error'}`, 'error');
        }
    } catch (error) {
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
        const response = await fetch(`${API_BASE_URL}/files/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('File deleted successfully', 'success');
            listFiles(); // Refresh file list
        } else {
            const errorData = await response.json();
            showNotification(`Delete failed: ${errorData.error || 'Unknown error'}`, 'error');
        }
    } catch (error) {
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

// Test if uploads directory is accessible and test image loading
async function testUploadsAccess() {
    try {
        console.log('🔍 Starting comprehensive image loading test...');
        
        // Test 1: Backend health
        try {
            const healthResponse = await fetch('http://localhost:8000/api/v1/');
            if (healthResponse.ok) {
                console.log('✅ Backend health check passed');
            } else {
                console.error('❌ Backend health check failed:', healthResponse.status);
            }
        } catch (error) {
            console.error('❌ Backend connection failed:', error.message);
            showNotification('Backend server is not running on port 8000', 'error');
            return;
        }
        
        // Test 2: API files
        try {
            const apiResponse = await fetch('http://localhost:8000/api/v1/files');
            if (apiResponse.ok) {
                const data = await apiResponse.json();
                console.log('✅ API files endpoint working');
                console.log(`📁 Found ${data.total} files`);
                
                const imageFiles = data.assets.filter(f => f.content_type && f.content_type.startsWith('image/'));
                console.log(`🖼️ Found ${imageFiles.length} image files`);
                
                if (imageFiles.length > 0) {
                    // Test first image
                    const testFile = imageFiles[0];
                    const filename = testFile.file_path.split(/[\\\/]/).pop();
                    const testUrl = `http://localhost:8000/uploads/${filename}`;
                    
                    console.log('🔍 Testing image URL:', testUrl);
                    
                    const imgResponse = await fetch(testUrl);
                    if (imgResponse.ok) {
                        console.log('✅ Image URL accessible');
                        const blob = await imgResponse.blob();
                        console.log(`📊 Image size: ${blob.size} bytes`);
                        console.log(`📊 Image type: ${blob.type}`);
                    } else {
                        console.error('❌ Image URL failed:', imgResponse.status);
                        const errorText = await imgResponse.text();
                        console.error('Error details:', errorText);
                    }
                } else {
                    console.log('ℹ️ No image files found to test');
                }
            } else {
                console.error('❌ API files endpoint failed:', apiResponse.status);
            }
        } catch (error) {
            console.error('❌ API test failed:', error.message);
        }
        
        // Test 3: Uploads directory
        try {
            const uploadsResponse = await fetch('http://localhost:8000/uploads/');
            if (uploadsResponse.ok) {
                console.log('✅ Uploads directory accessible');
            } else {
                console.error('❌ Uploads directory not accessible:', uploadsResponse.status);
            }
        } catch (error) {
            console.error('❌ Uploads directory test failed:', error.message);
        }
        
        console.log('🔍 Test complete. Check console for details.');
        
    } catch (error) {
        console.error('❌ Comprehensive test failed:', error);
    }
}

// Add test function to global scope
window.testUploadsAccess = testUploadsAccess;

// Add simple image test function
window.testImage = function(filename) {
    const url = `http://localhost:8000/uploads/${filename}`;
    console.log('Testing image:', url);
    
    // Open in new tab
    window.open(url, '_blank');
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    setupDragAndDrop();
    
    // Set up file input
    document.getElementById('file-input').addEventListener('change', handleFileSelect);
    
    // Show initial message
    showNotification('Welcome to Cloud Asset Management Platform', 'info');
    
    // Test uploads access after a short delay
    setTimeout(testUploadsAccess, 2000);
});

// Global functions for onclick handlers
window.listFiles = listFiles;
window.checkHealth = checkHealth;
window.uploadFile = uploadFile;
window.clearFileSelection = clearFileSelection;
window.editFile = editFile;
window.deleteFile = deleteFile;
window.confirmDelete = confirmDelete;
