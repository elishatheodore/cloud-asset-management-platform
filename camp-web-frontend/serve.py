#!/usr/bin/env python3
"""
Simple web server to serve the frontend
"""
import http.server
import socketserver
import os
import sys
from pathlib import Path

# Change to the frontend directory
frontend_dir = Path(__file__).parent
os.chdir(frontend_dir)

PORT = 3000
Handler = http.server.SimpleHTTPRequestHandler

class CustomHandler(Handler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(frontend_dir), **kwargs)
    
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def run_server():
    """Run the frontend development server"""
    try:
        with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
            print(f"🚀 Frontend server running at:")
            print(f"   http://localhost:{PORT}")
            print(f"   http://127.0.0.1:{PORT}")
            print(f"")
            print(f"📁 Serving directory: {frontend_dir}")
            print(f"")
            print(f"🔗 Backend API: http://localhost:8000")
            print(f"")
            print(f"Press Ctrl+C to stop the server")
            print("=" * 50)
            
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
        sys.exit(0)
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {PORT} is already in use")
            print(f"   Try stopping the other server or use a different port")
            sys.exit(1)
        else:
            print(f"❌ Error starting server: {e}")
            sys.exit(1)

if __name__ == "__main__":
    run_server()
