"""
Pydantic schemas for Credit Scoring API requests, responses, and validation.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class CreditPredictionRequest(BaseModel):
    applicant_name: Optional[str] = Field(default="John Doe", description="Applicant Name or ID")
    duration_in_month: int = Field(default=24, ge=4, le=72, description="Duration of loan in months")
    credit_amount: float = Field(default=4000.0, ge=250.0, le=50000.0, description="Requested Credit Amount ($ / DM)")
    installment_rate_percent_income: int = Field(default=3, ge=1, le=4, description="Installment rate (1: <20%, 2: 20-25%, 3: 25-35%, 4: >35% of income)")
    present_residence_since: int = Field(default=2, ge=1, le=4, description="Years at current address (1: <1yr, 2: 1-4yrs, 3: 4-7yrs, 4: >7yrs)")
    age_in_years: int = Field(default=35, ge=18, le=95, description="Applicant Age in years")
    number_existing_credits: int = Field(default=1, ge=1, le=6, description="Number of existing credits at this institution")
    number_people_liable_maintenance: int = Field(default=1, ge=1, le=5, description="Number of dependents liable for maintenance")
    
    # Categorical features with domain values matching dataset mapping
    status_existing_checking_account: str = Field(
        default="low_balance_under_200",
        description="Status of checking account: negative_balance, low_balance_under_200, high_balance_over_200, no_checking_account"
    )
    credit_history: str = Field(
        default="existing_credits_paid_duly",
        description="Credit track record: critical_account, delay_in_paying_past, existing_credits_paid_duly, all_credits_paid_bank, no_credits_all_paid"
    )
    purpose: str = Field(
        default="car_new",
        description="Loan purpose: car_new, car_used, furniture_equipment, radio_television, domestic_appliances, repairs, education, business, other"
    )
    savings_account_bonds: str = Field(
        default="100_to_500",
        description="Savings balance tier: under_100, 100_to_500, 500_to_1000, over_1000, unknown_or_no_savings"
    )
    present_employment_since: str = Field(
        default="1_to_4_years",
        description="Current employment length: unemployed, under_1_year, 1_to_4_years, 4_to_7_years, over_7_years"
    )
    personal_status_and_sex: str = Field(
        default="male_single",
        description="Personal status: male_single, male_married_widowed, male_divorced_separated, female_divorced_separated_married, female_single"
    )
    other_debtors_guarantors: str = Field(
        default="none",
        description="Other debtors or guarantors: none, co_applicant, guarantor"
    )
    property: str = Field(
        default="car_or_other",
        description="Property owned: real_estate, building_society_life_insurance, car_or_other, unknown_no_property"
    )
    other_installment_plans: str = Field(
        default="none",
        description="Other ongoing installment plans: bank, stores, none"
    )
    housing: str = Field(
        default="own",
        description="Housing arrangement: rent, own, for_free"
    )
    job: str = Field(
        default="skilled_employee_official",
        description="Employment skill category: unemployed_unskilled_non_resident, unskilled_resident, skilled_employee_official, management_self_employed_high_qualification"
    )
    telephone: str = Field(
        default="registered",
        description="Telephone status: registered, none"
    )
    foreign_worker: str = Field(
        default="no",
        description="Foreign worker status: yes, no"
    )
    
    # Model selection (optional, defaults to best model)
    model_name: Optional[str] = Field(
        default=None,
        description="Model to use: 'Random Forest', 'Logistic Regression', or 'Decision Tree'"
    )

class FinancialRatios(BaseModel):
    monthly_installment: float
    estimated_annual_income: float
    debt_to_income_ratio: float
    loan_to_income_ratio: float
    financial_resilience_score: float

class KeyDriver(BaseModel):
    feature: str
    impact: str  # "positive", "negative", "neutral"
    description: str

class CreditPredictionResponse(BaseModel):
    prediction: int  # 1 = Creditworthy, 0 = Non-creditworthy
    prediction_label: str  # "Creditworthy" or "Not Creditworthy"
    probability: float  # Approval probability (0.0 to 1.0)
    risk_score: int  # 300 to 850 standardized FICO-like credit score
    risk_category: str  # "Low Risk", "Moderate Risk", "High Risk"
    model_used: str
    financial_ratios: FinancialRatios
    explanation_summary: str
    key_drivers: List[KeyDriver]
    history_record_id: Optional[int] = None
