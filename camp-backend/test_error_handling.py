import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_error_responses():
    """Test various error scenarios to verify consistent error responses."""
    
    print("=== Testing Error Response Format ===\n")
    
    # Test 1: Missing file (should return validation error)
    print("1. Testing missing file upload...")
    try:
        response = requests.post(f"{BASE_URL}/upload", files={})
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Request failed: {e}")
    print()
    
    # Test 2: Empty file
    print("2. Testing empty file upload...")
    try:
        files = {'file': ('empty.txt', '', 'text/plain')}
        response = requests.post(f"{BASE_URL}/upload", files=files)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Request failed: {e}")
    print()
    
    # Test 3: Invalid asset ID
    print("3. Testing invalid asset ID...")
    try:
        response = requests.delete(f"{BASE_URL}/files/99999")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Request failed: {e}")
    print()
    
    # Test 4: Invalid JSON for update
    print("4. Testing invalid JSON for update...")
    try:
        response = requests.put(
            f"{BASE_URL}/files/1",
            json={"invalid_field": "test"},
            headers={"Content-Type": "application/json"}
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Request failed: {e}")
    print()
    
    # Test 5: Missing filename in update
    print("5. Testing missing filename in update...")
    try:
        response = requests.put(
            f"{BASE_URL}/files/1",
            json={},
            headers={"Content-Type": "application/json"}
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Request failed: {e}")
    print()
    
    # Test 6: Valid upload to confirm success response unchanged
    print("6. Testing valid upload (should succeed)...")
    try:
        files = {'file': ('test.txt', 'This is a test file content', 'text/plain')}
        response = requests.post(f"{BASE_URL}/upload", files=files)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Success: {data.get('filename', 'N/A')} uploaded successfully")
        else:
            print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_error_responses()
