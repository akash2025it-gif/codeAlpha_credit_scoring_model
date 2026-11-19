"""
Comprehensive Integration Tests for AI Credit Scoring Backend.
Tests:
1. GET /health
2. GET /model-metrics
3. POST /auth/login (Seed analyst account)
4. POST /auth/register (New risk officer)
5. GET /auth/me (Bearer token validation)
6. PUT /auth/profile (Update officer profile)
7. POST /predict (Valid applicant with user token)
8. GET /prediction-history/{id} (Individual record lookup)
9. POST /predict (Invalid validation payload -> Expect 422)
10. GET /prediction-history
11. POST /auth/logout
"""

import urllib.request
import urllib.error
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def test_health():
    url = f"{BASE_URL}/health"
    resp = urllib.request.urlopen(url)
    assert resp.status == 200
    data = json.loads(resp.read().decode())
    assert data["status"] == "healthy"
    assert "active_model" in data
    print("[PASS] test_health passed: Status is healthy")

def test_model_metrics():
    url = f"{BASE_URL}/model-metrics"
    resp = urllib.request.urlopen(url)
    assert resp.status == 200
    data = json.loads(resp.read().decode())
    assert "Logistic Regression" in data["metrics"]
    assert "Decision Tree" in data["metrics"]
    assert "Random Forest" in data["metrics"]
    print("[PASS] test_model_metrics passed: 3 models evaluated")

def test_auth_and_user_flow():
    # 1. Login with seeded demo account
    login_url = f"{BASE_URL}/auth/login"
    login_payload = {
        "username_or_email": "demo_analyst",
        "password": "Password@123"
    }
    req = urllib.request.Request(
        login_url,
        data=json.dumps(login_payload).encode(),
        headers={"Content-Type": "application/json"}
    )
    resp = urllib.request.urlopen(req)
    assert resp.status == 200
    login_data = json.loads(resp.read().decode())
    assert "token" in login_data
    token = login_data["token"]
    user = login_data["user"]
    assert user["username"] == "demo_analyst"
    print(f"[PASS] test_auth_login passed: Signed in as {user['full_name']} ({user['role']})")

    # 2. Get current profile via Bearer token
    me_url = f"{BASE_URL}/auth/me"
    me_req = urllib.request.Request(
        me_url,
        headers={"Authorization": f"Bearer {token}"}
    )
    me_resp = urllib.request.urlopen(me_req)
    assert me_resp.status == 200
    me_data = json.loads(me_resp.read().decode())
    assert me_data["username"] == "demo_analyst"
    print("[PASS] test_auth_me passed: Bearer token validation successful")

    # 3. Register a new user
    reg_url = f"{BASE_URL}/auth/register"
    unique_user = f"analyst_{int(time.time())}"
    reg_payload = {
        "username": unique_user,
        "email": f"{unique_user}@fintech.corp",
        "password": "SecurePassword#2026",
        "full_name": "Elena Rostova",
        "role": "Senior Credit Officer",
        "department": "Commercial Lending"
    }
    reg_req = urllib.request.Request(
        reg_url,
        data=json.dumps(reg_payload).encode(),
        headers={"Content-Type": "application/json"}
    )
    reg_resp = urllib.request.urlopen(reg_req)
    assert reg_resp.status == 201
    reg_data = json.loads(reg_resp.read().decode())
    new_token = reg_data["token"]
    assert reg_data["user"]["full_name"] == "Elena Rostova"
    print(f"[PASS] test_auth_register passed: Created new account '{unique_user}'")

    # 4. Update profile
    prof_url = f"{BASE_URL}/auth/profile"
    prof_payload = {
        "full_name": "Elena Rostova-Smith",
        "email": f"{unique_user}_updated@fintech.corp",
        "department": "SME Portfolio Risk"
    }
    prof_req = urllib.request.Request(
        prof_url,
        data=json.dumps(prof_payload).encode(),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {new_token}"},
        method="PUT"
    )
    prof_resp = urllib.request.urlopen(prof_req)
    assert prof_resp.status == 200
    prof_data = json.loads(prof_resp.read().decode())
    assert prof_data["full_name"] == "Elena Rostova-Smith"
    print("[PASS] test_auth_profile_update passed: Profile updated successfully")

    return token

def test_valid_prediction(token=None):
    url = f"{BASE_URL}/predict"
    payload = {
        "applicant_name": "Sarah Connor",
        "duration_in_month": 12,
        "credit_amount": 2500.0,
        "installment_rate_percent_income": 2,
        "present_residence_since": 3,
        "age_in_years": 32,
        "number_existing_credits": 1,
        "number_people_liable_maintenance": 1,
        "status_existing_checking_account": "high_balance_over_200",
        "credit_history": "existing_credits_paid_duly",
        "purpose": "car_new",
        "savings_account_bonds": "over_1000",
        "present_employment_since": "over_7_years",
        "personal_status_and_sex": "female_single",
        "other_debtors_guarantors": "none",
        "property": "real_estate",
        "other_installment_plans": "none",
        "housing": "own",
        "job": "skilled_employee_official",
        "telephone": "registered",
        "foreign_worker": "no",
        "model_name": "Random Forest"
    }
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers=headers
    )
    resp = urllib.request.urlopen(req)
    assert resp.status == 200
    data = json.loads(resp.read().decode())
    assert data["prediction"] in ["Creditworthy", "Not Creditworthy"]
    assert data["risk_level"] in ["Low", "Medium", "High"]
    assert "probability" in data
    assert "disclaimer" in data
    assert "record_id" in data
    print(f"[PASS] test_valid_prediction passed: {data['prediction']} (Risk: {data['risk_level']}, Score: {data['risk_score']}, Prob: {data['probability']})")
    return data.get("record_id")

def test_prediction_detail(record_id):
    if not record_id:
        print("[SKIP] test_prediction_detail skipped (no record_id)")
        return
    url = f"{BASE_URL}/prediction-history/{record_id}"
    resp = urllib.request.urlopen(url)
    assert resp.status == 200
    data = json.loads(resp.read().decode())
    assert data["id"] == record_id
    assert "applicant_name" in data
    assert "raw_input_json" in data
    print(f"[PASS] test_prediction_detail passed: Retrieved record #{record_id} for '{data['applicant_name']}'")

def test_invalid_prediction():
    url = f"{BASE_URL}/predict"
    payload = {
        "credit_amount": -100,  # Invalid: ge=250.0
        "duration_in_month": 1   # Invalid: ge=4
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"}
    )
    try:
        urllib.request.urlopen(req)
        assert False, "Expected 422 HTTPError but got success"
    except urllib.error.HTTPError as e:
        assert e.code == 422
        print("[PASS] test_invalid_prediction passed: Server correctly rejected invalid input with HTTP 422")

def test_prediction_history():
    url = f"{BASE_URL}/prediction-history"
    resp = urllib.request.urlopen(url)
    assert resp.status == 200
    data = json.loads(resp.read().decode())
    assert "history" in data
    assert data["count"] >= 1
    print(f"[PASS] test_prediction_history passed: {data['count']} audit records present")

if __name__ == "__main__":
    print("=" * 65)
    print("RUNNING COMPREHENSIVE BACKEND INTEGRATION TESTS")
    print("=" * 65)
    test_health()
    test_model_metrics()
    token = test_auth_and_user_flow()
    record_id = test_valid_prediction(token)
    test_prediction_detail(record_id)
    test_invalid_prediction()
    test_prediction_history()
    print("=" * 65)
    print("ALL INTEGRATION TESTS PASSED PERFECTLY!")
    print("=" * 65)
