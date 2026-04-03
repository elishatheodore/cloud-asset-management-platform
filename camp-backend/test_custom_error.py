import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_custom_error():
    """Test our custom test endpoint to verify error handlers work."""
    
    print("=== Testing Custom Error Endpoint ===\n")
    
    # Test our custom test endpoint
    print("1. Testing /test-error endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/test-error")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_custom_error()
