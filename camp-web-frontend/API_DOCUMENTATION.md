# Cloud Asset Management Platform - API Documentation

## Overview

The Cloud Asset Management Platform (CAMP) provides a RESTful API for managing file assets with secure upload, storage, and retrieval capabilities.

## Base Configuration

- **Development URL**: `http://localhost:8000`
- **API Version**: `v1`
- **API Prefix**: `/api/v1`
- **Content-Type**: `application/json` (except file uploads)

## Authentication

Currently, authentication is optional for development. The API accepts requests without authentication but includes JWT authentication infrastructure for future production use.

## Endpoints

### Health & System

#### GET `/`
Root endpoint with basic system information.

**Response:**
```json
{
  "message": "Cloud Asset Management Platform (CAMP)",
  "version": "1.0.0",
  "status": "running",
  "auth_enabled": true,
  "api_version": "v1",
  "endpoints": {
    "health": "/health",
    "assets": "/api/v1/files",
    "upload": "/api/v1/upload",
    "docs": "/docs"
  }
}
```

#### GET `/health`
Detailed health check with system status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-04-03T13:00:00.000Z",
  "version": "1.0.0",
  "checks": {
    "database": "healthy",
    "uploads": "accessible",
    "api": "healthy"
  },
  "environment": "development"
}
```

### Asset Management

#### GET `/api/v1/files`
List all uploaded assets.

**Response:**
```json
{
  "assets": [
    {
      "id": 1,
      "filename": "document.pdf",
      "original_filename": "my-document.pdf",
      "file_size": 1024000,
      "content_type": "application/pdf",
      "file_path": "uploads\\abc123.pdf",
      "created_at": "2026-04-03T13:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 50
}
```

#### POST `/api/v1/upload`
Upload a new file.

**Request:** `multipart/form-data`
- `file`: The file to upload (required)

**File Constraints:**
- Maximum size: 50MB
- Allowed types: 
  - Images: jpeg, png, gif, webp
  - Documents: pdf, doc, docx, xls, xlsx
  - Text: txt, csv, json, xml

**Response:**
```json
{
  "id": 123,
  "filename": "document.pdf",
  "original_filename": "my-document.pdf",
  "file_size": 1024000,
  "content_type": "application/pdf",
  "file_path": "uploads\\abc123.pdf",
  "created_at": "2026-04-03T13:00:00.000Z"
}
```

#### GET `/api/v1/files/{asset_id}`
Get details of a specific asset.

**Parameters:**
- `asset_id` (integer): The ID of the asset

**Response:** Same as individual asset in list response

#### PUT `/api/v1/files/{asset_id}`
Update asset metadata (currently only filename).

**Parameters:**
- `asset_id` (integer): The ID of the asset

**Request Body:**
```json
{
  "filename": "new-filename.pdf"
}
```

**Response:** Updated asset details

#### DELETE `/api/v1/files/{asset_id}`
Delete an asset.

**Parameters:**
- `asset_id` (integer): The ID of the asset

**Response:**
```json
{
  "message": "Asset deleted successfully"
}
```

### File Access

#### GET `/uploads/{filename}`
Access uploaded files directly.

**Parameters:**
- `filename` (string): The filename to access

**Response:** The file content with appropriate MIME type

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": "Error message",
  "code": 400,
  "timestamp": "2026-04-03T13:00:00.000Z"
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `413 Payload Too Large`: File exceeds size limit
- `415 Unsupported Media Type`: File type not allowed
- `500 Internal Server Error`: Server error

### Specific Error Messages

- `"File size exceeds maximum limit of 50MB"`
- `"File type [type] is not allowed"`
- `"Asset not found"`
- `"Storage operation failed"`
- `"Invalid file provided"`

## Frontend Integration

### Configuration

The frontend uses a centralized configuration system:

```javascript
import { API_ENDPOINTS, CONFIG, API_CONFIG } from './config.js';

// Access endpoints
const filesUrl = API_ENDPOINTS.ASSETS_LIST;
const uploadUrl = API_ENDPOINTS.ASSET_UPLOAD;
```

### API Client

A robust API client handles retries, timeouts, and error handling:

```javascript
import { api } from './api-client.js';

// Upload file with progress
const result = await api.uploadFile(uploadUrl, file, (progress) => {
  console.log(`Upload: ${progress}%`);
});
```

### Error Handling

```javascript
if (result.success) {
  // Handle success
  console.log(result.data);
} else {
  // Handle error
  showNotification(result.error, 'error');
}
```

## Testing

### Automated API Testing

The frontend includes comprehensive API testing:

```javascript
// Run full test suite
window.runApiTests();

// Quick health check
window.quickHealthCheck();
```

### Test Coverage

- Basic connectivity
- Health endpoints
- Asset management operations
- File upload/download
- Error handling validation
- Authentication flows

## Development Notes

### Environment Configuration

- **Development**: `http://localhost:8000`
- **Production**: Configurable via environment variables
- **Staging**: Separate staging environment support

### File Storage

- Files stored in `uploads/` directory
- Unique filenames generated to prevent conflicts
- Original filenames preserved in database

### Database

- SQLite database (`camp.db`) for development
- Asset metadata stored in `assets` table
- Automatic table creation on startup

### Security

- File type validation
- Size limits enforced
- Path traversal prevention
- JWT authentication infrastructure (optional for now)

## Monitoring

### Health Monitoring

- Database connectivity checks
- File system accessibility
- API endpoint availability
- Environment status reporting

### Logging

- Structured logging with different levels
- Request/response logging in debug mode
- Error tracking and reporting

## Future Enhancements

### Authentication & Authorization

- JWT-based authentication
- Role-based access control
- User management endpoints
- API key support

### Advanced Features

- File versioning
- Bulk operations
- Search and filtering
- Metadata tagging
- Thumbnail generation

### Performance

- Caching layer
- CDN integration
- Compression
- Pagination optimization

## Support

For issues or questions:

1. Check the browser console for detailed error messages
2. Run the API test suite to diagnose connectivity issues
3. Verify backend service is running on port 8000
4. Check uploads directory permissions

## Version History

- **v1.0.0**: Initial release with basic CRUD operations
- **v1.1.0**: Added comprehensive error handling and testing
- **v1.2.0**: Improved API client and configuration management
