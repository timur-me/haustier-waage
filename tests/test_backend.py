import requests
import json
from datetime import datetime, timedelta
from typing import Dict, Optional
import sys

# Configuration
BASE_URL = "http://localhost:8000"  # Change this to your server URL
TEST_USER = {
    "username": "sarah_pet_lover",
    "password": "SecurePass123!"
}


class BackendTester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.token: Optional[str] = None
        self.headers: Dict[str, str] = {
            "Content-Type": "application/json"
        }
        self.current_user = None
        self.test_animal_id = None
        self.test_weight_id = None

    def print_result(self, test_name: str, success: bool, response: requests.Response = None, error: str = None):
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"\n{test_name}: {status}")
        if response:
            print(f"Status Code: {response.status_code}")
            try:
                print(f"Response: {json.dumps(response.json(), indent=2)}")
            except:
                print(f"Response: {response.text}")
        if error:
            print(f"Error: {error}")

    def test_login(self) -> bool:
        print("\n🔑 Testing Authentication...")
        try:
            response = requests.post(
                f"{self.base_url}/auth/login",
                headers={"Content-Type": "application/json"},
                json={
                    "username": TEST_USER["username"],
                    "password": TEST_USER["password"]
                }
            )
            success = response.status_code == 200
            self.print_result("Login", success, response)

            if success:
                data = response.json()
                self.token = data["access_token"]
                self.headers.update({"Authorization": f"Bearer {self.token}"})
            return success
        except Exception as e:
            self.print_result("Login", False, error=str(e))
            return False

    def test_get_current_user(self) -> bool:
        try:
            response = requests.get(
                f"{self.base_url}/api/users/me",
                headers=self.headers
            )
            success = response.status_code == 200
            self.print_result("Get Current User", success, response)

            if success:
                self.current_user = response.json()
            return success
        except Exception as e:
            self.print_result("Get Current User", False, error=str(e))
            return False

    def test_get_animals(self) -> bool:
        print("\n🐾 Testing Animal Management...")
        try:
            response = requests.get(
                f"{self.base_url}/api/animals",
                headers=self.headers
            )
            success = response.status_code == 200
            self.print_result("Get Animals", success, response)

            if success and response.json():
                self.test_animal_id = response.json()[0]["id"]
            return success
        except Exception as e:
            self.print_result("Get Animals", False, error=str(e))
            return False

    def test_get_single_animal(self) -> bool:
        if not self.test_animal_id:
            self.print_result("Get Single Animal", False,
                              error="No test animal ID available")
            return False

        try:
            response = requests.get(
                f"{self.base_url}/api/animals/{self.test_animal_id}",
                headers=self.headers
            )
            success = response.status_code == 200
            self.print_result("Get Single Animal", success, response)
            return success
        except Exception as e:
            self.print_result("Get Single Animal", False, error=str(e))
            return False

    def test_get_animal_weights(self) -> bool:
        print("\n⚖️ Testing Weight Management...")
        if not self.test_animal_id:
            self.print_result("Get Animal Weights", False,
                              error="No test animal ID available")
            return False

        try:
            response = requests.get(
                f"{self.base_url}/api/weights/animal/{self.test_animal_id}",
                headers=self.headers
            )
            success = response.status_code == 200
            self.print_result("Get Animal Weights", success, response)

            if success and response.json():
                self.test_weight_id = response.json()[0]["id"]
            return success
        except Exception as e:
            self.print_result("Get Animal Weights", False, error=str(e))
            return False

    def test_add_weight(self) -> bool:
        if not self.test_animal_id:
            self.print_result("Add Weight", False,
                              error="No test animal ID available")
            return False

        try:
            weight_data = {
                "animal_id": self.test_animal_id,
                "weight": 25.5,
                "date": datetime.now().isoformat()
            }
            response = requests.post(
                f"{self.base_url}/api/weights/",
                headers=self.headers,
                json=weight_data
            )
            success = response.status_code == 200
            self.print_result("Add Weight", success, response)
            return success
        except Exception as e:
            self.print_result("Add Weight", False, error=str(e))
            return False

    def test_update_weight(self) -> bool:
        if not self.test_weight_id:
            self.print_result("Update Weight", False,
                              error="No test weight ID available")
            return False

        try:
            weight_data = {
                "weight": 26.0,
                "date": datetime.now().isoformat()
            }
            response = requests.put(
                f"{self.base_url}/api/weights/{self.test_weight_id}",
                headers=self.headers,
                json=weight_data
            )
            success = response.status_code == 200
            self.print_result("Update Weight", success, response)
            return success
        except Exception as e:
            self.print_result("Update Weight", False, error=str(e))
            return False

    def test_websocket(self) -> bool:
        print("\n🔌 Testing WebSocket Connection...")
        try:
            import websocket
            # Convert http:// to ws:// or https:// to wss://
            ws_base_url = self.base_url.replace(
                "http://", "ws://").replace("https://", "wss://")
            ws_url = f"{ws_base_url}/ws/{self.token}"
            print(f"Connecting to WebSocket at: {ws_url}")

            ws = websocket.create_connection(ws_url)

            # Wait for connection message
            result = ws.recv()
            ws.close()

            success = True
            self.print_result("WebSocket Connection", success,
                              error=f"Received: {result}")
            return success
        except Exception as e:
            self.print_result("WebSocket Connection", False, error=str(e))
            return False

    def run_all_tests(self):
        print("\n🚀 Starting Backend API Tests...")
        print(f"Testing against: {self.base_url}")

        # Authentication tests
        if not self.test_login():
            print("\n❌ Login failed. Stopping tests.")
            return

        if not self.test_get_current_user():
            print("\n❌ User verification failed. Stopping tests.")
            return

        # Run all other tests
        tests = [
            self.test_get_animals,
            self.test_get_single_animal,
            self.test_get_animal_weights,
            self.test_add_weight,
            self.test_update_weight,
            self.test_websocket
        ]

        results = []
        for test in tests:
            results.append(test())

        # Print summary
        print("\n📊 Test Summary:")
        # +2 for login and user tests
        print(f"Total Tests: {len(results) + 2}")
        print(f"Passed: {sum([1 for r in results if r]) + 2}")
        print(f"Failed: {len([1 for r in results if not r])}")


def main():
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    else:
        base_url = BASE_URL

    tester = BackendTester(base_url)
    tester.run_all_tests()


if __name__ == "__main__":
    main()
