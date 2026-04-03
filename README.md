# Cloud Asset Management Platform (CAMP)

A full-stack application for managing cloud assets with file upload, storage, and management capabilities.

## 📁 Project Structure

```
cloud-asset-management-platform/
├── camp-backend/           # FastAPI Python backend
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   ├── core/          # Core functionality
│   │   ├── db/            # Database models
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   └── services/      # Business logic
│   ├── uploads/           # File storage directory
│   ├── camp.db           # SQLite database
│   └── run.py            # Backend entry point
└── camp-web-frontend/     # HTML/CSS/JS frontend
    ├── index.html         # Main application
    ├── app.js            # JavaScript logic
    └── README.md         # Frontend documentation
```

## 🚀 Quick Start

### 1. Start the Backend
```bash
cd camp-backend
python run.py
```
Backend will run on: `http://localhost:8000`

### 2. Open the Frontend
```bash
# Simply open index.html in your browser
cd camp-web-frontend
# Double-click index.html or serve it:
python -m http.server 5173
```
Frontend will be available at: `http://localhost:5173`

### 3. Use the Application
- Upload files via drag & drop
- View all uploaded files
- Rename and delete files
- Monitor storage usage

## ✨ Features

### Backend (FastAPI)
- ✅ File upload with validation
- ✅ File listing with metadata
- ✅ File renaming and deletion
- ✅ SQLite database storage
- ✅ Consistent error handling
- ✅ Proper logging
- ✅ CORS support

### Frontend (HTML/CSS/JS)
- ✅ Modern responsive UI
- ✅ Drag & drop file upload
- ✅ File management grid
- ✅ Real-time statistics
- ✅ Success/error notifications
- ✅ Mobile-friendly design

## 🔧 Technical Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Database ORM
- **SQLite** - File-based database
- **Pydantic** - Data validation
- **Python** - Programming language

### Frontend
- **HTML5** - Markup
- **Tailwind CSS** - Styling framework
- **JavaScript** - Interactivity
- **Font Awesome** - Icons

## 📡 API Endpoints

- `GET /api/v1/health` - Health check
- `POST /api/v1/upload` - Upload file
- `GET /api/v1/files` - List all files
- `PUT /api/v1/files/{id}` - Update file
- `DELETE /api/v1/files/{id}` - Delete file

## 🗄 Database

- **SQLite database**: `camp.db`
- **Table**: `assets` with columns for file metadata
- **Auto-created** on first run

## 📁 File Storage

- **Upload directory**: `camp-backend/uploads/`
- **Supported formats**: All file types
- **Size limit**: 50MB per file
- **Automatic organization** by filename

## 🔒 Security

- File size validation
- Input sanitization
- CORS configuration
- Error handling without exposing internals

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🛠 Development

### Backend Development
```bash
cd camp-backend
# Install dependencies
pip install -r requirements.txt
# Run development server
python run.py
```

### Frontend Development
```bash
cd camp-web-frontend
# Open index.html in browser
# Or serve with static server
python -m http.server 5173
```

## 📚 Documentation

- **Backend**: See `camp-backend/README.md` (if exists)
- **Frontend**: See `camp-web-frontend/README.md`
- **API**: Available at `http://localhost:8000/docs` when backend is running

## 🚀 Deployment

### Backend Deployment
1. Install Python dependencies
2. Configure environment variables
3. Run with production server (Gunicorn/Uvicorn)
4. Set up reverse proxy (Nginx)

### Frontend Deployment
1. Copy `camp-web-frontend` files to web server
2. Configure CORS on backend
3. Update API URL if needed

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make your changes
4. Test thoroughly
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ using FastAPI, HTML, CSS, and JavaScript**
