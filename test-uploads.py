#!/usr/bin/env python3
"""
Test script to verify uploads directory and file serving
"""
import os
import requests
from pathlib import Path

def test_uploads_directory():
    """Test if uploads directory exists and has files"""
    print("=== Testing Uploads Directory ===")
    
    uploads_dir = Path("uploads")
    
    if not uploads_dir.exists():
        print(f"❌ Uploads directory does not exist: {uploads_dir.absolute()}")
        return False
    
    print(f"✅ Uploads directory exists: {uploads_dir.absolute()}")
    
    # List files in uploads directory
    files = list(uploads_dir.glob("*"))
    print(f"📁 Found {len(files)} files in uploads directory:")
    
    for file in files:
        size = file.stat().st_size
        print(f"  - {file.name} ({size} bytes)")
    
    return len(files) > 0

def test_api_endpoints():
    """Test API endpoints"""
    print("\n=== Testing API Endpoints ===")
    
    base_url = "http://localhost:8000"
    
    try:
        # Test health check
        response = requests.get(f"{base_url}/api/v1/", timeout=5)
        print(f"✅ Health check: {response.status_code}")
        
        # Test list files
        response = requests.get(f"{base_url}/api/v1/files", timeout=5)
        print(f"✅ List files: {response.status_code}")
        
        if response.ok:
            data = response.json()
            print(f"📋 API returned {data.get('total', 0)} files")
            
            # Check for image files
            image_files = [f for f in data.get('assets', []) if f.get('content_type', '').startswith('image/')]
            print(f"🖼️ Found {len(image_files)} image files")
            
            for file in image_files:
                print(f"  - {file.get('filename')} -> {file.get('image_url')}")
        
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ API Error: {e}")
        return False

def test_static_file_serving():
    """Test static file serving"""
    print("\n=== Testing Static File Serving ===")
    
    base_url = "http://localhost:8000"
    
    try:
        # Test uploads directory access
        response = requests.get(f"{base_url}/uploads/", timeout=5)
        print(f"✅ Uploads directory: {response.status_code}")
        
        # Get list of files from uploads directory
        uploads_dir = Path("uploads")
        files = list(uploads_dir.glob("*"))
        
        if files:
            # Test first file
            test_file = files[0]
            file_url = f"{base_url}/uploads/{test_file.name}"
            
            print(f"🔍 Testing file: {file_url}")
            response = requests.get(file_url, timeout=5)
            print(f"✅ File access: {response.status_code}")
            
            if response.ok:
                print(f"📄 File size: {len(response.content)} bytes")
                print(f"📄 Content type: {response.headers.get('content-type', 'Unknown')}")
                
                # Test if it's an image
                content_type = response.headers.get('content-type', '')
                if content_type.startswith('image/'):
                    print("🖼️ This is an image file!")
                    # Save test image
                    with open("test-downloaded-image.jpg", "wb") as f:
                        f.write(response.content)
                    print("💾 Saved test image as 'test-downloaded-image.jpg'")
                
                return True
            else:
                print(f"❌ Failed to access file: {response.status_code}")
                return False
        else:
            print("❌ No files found in uploads directory")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Static file serving error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting CAMP Image Loading Tests")
    print("=" * 50)
    
    # Test 1: Uploads directory
    uploads_ok = test_uploads_directory()
    
    # Test 2: API endpoints
    api_ok = test_api_endpoints()
    
    # Test 3: Static file serving
    static_ok = test_static_file_serving()
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"  Uploads Directory: {'✅' if uploads_ok else '❌'}")
    print(f"  API Endpoints: {'✅' if api_ok else '❌'}")
    print(f"  Static File Serving: {'✅' if static_ok else '❌'}")
    
    if uploads_ok and api_ok and static_ok:
        print("\n🎉 All tests passed! Images should be working.")
    else:
        print("\n⚠️  Some tests failed. Check the details above.")
    
    print("\n💡 Next steps:")
    print("  1. Open test-image.html in your browser")
    print("  2. Test with the URLs shown above")
    print("  3. Check browser console for errors")

if __name__ == "__main__":
    main()
