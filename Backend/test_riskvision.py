import unittest
import json
import os
import tempfile
import shutil

# Configure test environment prior to importing the Flask app
temp_dir = tempfile.mkdtemp(prefix="riskvision_test_")
test_users_file = os.path.join(temp_dir, "test_users.json")
test_alert_file = os.path.join(temp_dir, "test_alerts.json")

os.environ["USERS_FILE"] = test_users_file
os.environ["ALERT_LOG_FILE"] = test_alert_file
os.environ["JWT_SECRET_KEY"] = "test-secret-key-for-unit-testing-1234567890"
os.environ["FLASK_DEBUG"] = "False"

from Backend.riskvision import app, USERS_FILE, ALERT_LOG_FILE, load_users, save_users, create_user, verify_password, hash_password

class RiskVisionBackendTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        app.config["TESTING"] = True
        cls.client = app.test_client()

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(temp_dir, ignore_errors=True)

    def setUp(self):
        # Reset test users before each test
        with open(USERS_FILE, "w", encoding="utf-8") as f:
            json.dump({}, f)

    def test_health_check(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data.get("status"), "online")
        self.assertEqual(data.get("service"), "RiskVision.ai Backend")
        self.assertIn("camera_active", data)
        self.assertIn("model_loaded", data)

    def test_register_and_login_flow(self):
        # 1. Valid Registration
        reg_payload = {
            "email": "tester@example.com",
            "password": "strongPassword123",
            "firstName": "Jane",
            "lastName": "Doe"
        }
        res = self.client.post("/auth/register", json=reg_payload)
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["email"], "tester@example.com")
        token = data["access_token"]

        # 2. Duplicate Registration Rejection
        dup_res = self.client.post("/auth/register", json=reg_payload)
        self.assertEqual(dup_res.status_code, 409)

        # 3. Valid Login
        login_payload = {
            "email": "tester@example.com",
            "password": "strongPassword123"
        }
        login_res = self.client.post("/auth/login", json=login_payload)
        self.assertEqual(login_res.status_code, 200)
        login_data = login_res.get_json()
        self.assertIn("access_token", login_data)

        # 4. Invalid Login (wrong password)
        bad_login = self.client.post("/auth/login", json={"email": "tester@example.com", "password": "wrong"})
        self.assertEqual(bad_login.status_code, 401)

        # 5. Access Protected Profile
        prof_res = self.client.get("/auth/profile", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(prof_res.status_code, 200)
        self.assertEqual(prof_res.get_json()["user"]["first_name"], "Jane")

        # 6. Access Protected Analytics
        analytics_res = self.client.get("/auth/analytics", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(analytics_res.status_code, 200)
        adata = analytics_res.get_json()
        self.assertIn("userSpecific", adata)
        self.assertIn("global", adata)
        self.assertIn("loginTrend", adata["global"])

    def test_input_validation(self):
        # Missing fields
        res1 = self.client.post("/auth/register", json={})
        self.assertEqual(res1.status_code, 400)

        # Invalid email format
        res2 = self.client.post("/auth/register", json={"email": "notanemail", "password": "password123"})
        self.assertEqual(res2.status_code, 400)

        # Too short password
        res3 = self.client.post("/auth/register", json={"email": "test@example.com", "password": "123"})
        self.assertEqual(res3.status_code, 400)

    def test_unauthenticated_protected_routes(self):
        res1 = self.client.get("/auth/profile")
        self.assertEqual(res1.status_code, 401)

        res2 = self.client.get("/auth/analytics")
        self.assertEqual(res2.status_code, 401)

    def test_alerts_endpoint(self):
        res = self.client.get("/alerts")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("alerts", data)
        self.assertIsInstance(data["alerts"], list)

    def test_history_clips_endpoint(self):
        res = self.client.get("/history_clips")
        self.assertEqual(res.status_code, 200)
        self.assertIsInstance(res.get_json(), list)

if __name__ == "__main__":
    unittest.main()
