"""
Comprehensive Integration Tests for AI Credit Scoring Backend.
Tests:
1. GET /health
2. GET /model-metrics
3. POST /predict (Valid applicant)
4. POST /predict (Invalid validation payload -> Expect 422)
5. GET /prediction-history
"""

import urllib.request
import urllib.error
import json

BASE_URL = "http://127.0.0.1:8000"

def test_health():
    url = f"{BASE_URL}/health"
    resp = urllib.request.urlopen(url)
    assert resp.status == 200
    data = json.loads(resp.read().decode())
    assert data["status"] == "healthy"
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

def test_valid_prediction():
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
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"}
    )
    resp = urllib.request.urlopen(req)
    assert resp.status == 200
    data = json.loads(resp.read().decode())
    assert data["prediction"] in ["Creditworthy", "Not Creditworthy"]
    assert data["risk_level"] in ["Low", "Medium", "High"]
    assert "probability" in data
    assert "disclaimer" in data
    print(f"[PASS] test_valid_prediction passed: {data['prediction']} (Risk: {data['risk_level']}, Prob: {data['probability']})")

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
    print("Running integration tests against live FastAPI backend...")
    test_health()
    test_model_metrics()
    test_valid_prediction()
    test_invalid_prediction()
    test_prediction_history()
    print("\nALL 5 INTEGRATION TESTS PASSED PERFECTLY!")
