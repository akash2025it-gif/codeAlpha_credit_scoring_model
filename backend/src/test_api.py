"""
Smoke test for Credit Scoring Backend Service and SQLite.
"""

from service import scoring_service
from schemas import CreditPredictionRequest
from database import init_db, get_recent_predictions

def run_tests():
    print("1. Initializing DB...")
    init_db()
    
    print("2. Checking model loading...")
    metrics = scoring_service.get_metrics()
    print(f"   Best model: {metrics.get('best_model_name')}")
    print(f"   Available models: {list(scoring_service.all_models.keys())}")
    
    print("\n3. Testing Prediction for a Creditworthy applicant...")
    good_req = CreditPredictionRequest(
        applicant_name="Alice Smith (Stable)",
        duration_in_month=12,
        credit_amount=1500.0,
        installment_rate_percent_income=2,
        present_residence_since=3,
        age_in_years=40,
        number_existing_credits=1,
        number_people_liable_maintenance=1,
        status_existing_checking_account="high_balance_over_200",
        credit_history="existing_credits_paid_duly",
        purpose="car_new",
        savings_account_bonds="over_1000",
        present_employment_since="over_7_years",
        personal_status_and_sex="female_single",
        other_debtors_guarantors="none",
        property="real_estate",
        other_installment_plans="none",
        housing="own",
        job="skilled_employee_official",
        telephone="registered",
        foreign_worker="no"
    )
    good_res = scoring_service.predict(good_req)
    print(f"   Alice Result: {good_res.prediction_label} (Prob: {good_res.probability}, Score: {good_res.risk_score}, Category: {good_res.risk_category})")
    print(f"   DTI: {good_res.financial_ratios.debt_to_income_ratio}%, LTI: {good_res.financial_ratios.loan_to_income_ratio}")
    print(f"   Drivers count: {len(good_res.key_drivers)}")

    print("\n4. Testing Prediction for a High-Risk applicant...")
    risky_req = CreditPredictionRequest(
        applicant_name="Bob Miller (Strained)",
        duration_in_month=48,
        credit_amount=12000.0,
        installment_rate_percent_income=4,
        present_residence_since=1,
        age_in_years=22,
        number_existing_credits=3,
        number_people_liable_maintenance=2,
        status_existing_checking_account="negative_balance",
        credit_history="critical_account",
        purpose="other",
        savings_account_bonds="unknown_or_no_savings",
        present_employment_since="unemployed",
        personal_status_and_sex="male_single",
        other_debtors_guarantors="none",
        property="unknown_no_property",
        other_installment_plans="bank",
        housing="rent",
        job="unemployed_unskilled_non_resident",
        telephone="none",
        foreign_worker="yes"
    )
    risky_res = scoring_service.predict(risky_req)
    print(f"   Bob Result: {risky_res.prediction_label} (Prob: {risky_res.probability}, Score: {risky_res.risk_score}, Category: {risky_res.risk_category})")
    print(f"   DTI: {risky_res.financial_ratios.debt_to_income_ratio}%, LTI: {risky_res.financial_ratios.loan_to_income_ratio}")

    print("\n5. Checking SQLite history persistence...")
    history = get_recent_predictions(limit=5)
    print(f"   Total stored records: {len(history)}")
    for h in history:
        print(f"   - ID {h['id']}: {h['applicant_name']} -> {h['prediction_label']} ({h['risk_category']})")

    print("\nALL BACKEND UNIT TESTS PASSED!")

if __name__ == "__main__":
    run_tests()
