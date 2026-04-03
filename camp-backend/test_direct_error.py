import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_direct_error():
    """Test direct exception to verify error handlers work."""
    
    print("=== Testing Direct Exception ===\n")
    
    # Test our custom exceptions by triggering them directly
    print("1. Testing direct HTTPException...")
    try:
        response = requests.get(f"{BASE_URL}/nonexistent-endpoint")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Request failed: {e}")
    print()
    
    # Test asset not found (should trigger our custom exception)
    print("2. Testing asset not found (custom exception)...")
    try:
        response = requests.delete(f"{BASE_URL}/files/99999")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Request failed: {e}")
    print()

if __name__ == "__main__":
    test_direct_error()
