"""
Inference, Pydantic Schemas, and Risk Level Classification Module.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

from config import (
    BEST_MODEL_PATH,
    ALL_MODELS_PATH,
    METRICS_JSON_PATH,
    RISK_THRESHOLD_LOW,
    RISK_THRESHOLD_MEDIUM,
    EDUCATIONAL_DISCLAIMER
)
from preprocessing import engineer_features
from database import save_prediction

class PredictionRequest(BaseModel):
    applicant_name: Optional[str] = Field(default="Applicant Demo", description="Applicant Name or ID")
    duration_in_month: int = Field(default=24, ge=4, le=72, description="Loan Duration in months")
    credit_amount: float = Field(default=4000.0, ge=250.0, le=50000.0, description="Requested Credit Amount")
    installment_rate_percent_income: int = Field(default=3, ge=1, le=4, description="Installment rate bracket (1-4)")
    present_residence_since: int = Field(default=2, ge=1, le=4, description="Years at present address (1-4)")
    age_in_years: int = Field(default=35, ge=18, le=95, description="Applicant Age")
    number_existing_credits: int = Field(default=1, ge=1, le=6, description="Number of existing credits")
    number_people_liable_maintenance: int = Field(default=1, ge=1, le=5, description="Number of dependents liable")
    
    # Categorical domain features
    status_existing_checking_account: str = Field(default="low_balance_under_200")
    credit_history: str = Field(default="existing_credits_paid_duly")
    purpose: str = Field(default="car_new")
    savings_account_bonds: str = Field(default="100_to_500")
    present_employment_since: str = Field(default="1_to_4_years")
    personal_status_and_sex: str = Field(default="male_single")
    other_debtors_guarantors: str = Field(default="none")
    property: str = Field(default="car_or_other")
    other_installment_plans: str = Field(default="none")
    housing: str = Field(default="own")
    job: str = Field(default="skilled_employee_official")
    telephone: str = Field(default="registered")
    foreign_worker: str = Field(default="no")
    
    # Optional model selection
    model_name: Optional[str] = Field(default="Random Forest")

class FinancialRatios(BaseModel):
    monthly_installment: float
    estimated_annual_income: float
    debt_to_income_ratio: float
    loan_to_income_ratio: float
    financial_resilience_score: float

class KeyDriver(BaseModel):
    feature: str
    impact: str  # "positive", "negative"
    description: str

class PredictionResponse(BaseModel):
    prediction: str              # "Creditworthy" or "Not Creditworthy"
    prediction_code: int         # 1 or 0
    probability: float           # e.g. 0.87
    risk_level: str              # "Low", "Medium", "High"
    risk_score: int              # Standard 300 to 850 score
    model_used: str              # e.g. "Random Forest"
    explanation: str             # Clear textual explanation
    key_drivers: List[KeyDriver] # Contributing positive/negative factors
    financial_ratios: FinancialRatios
    disclaimer: str              # Educational disclaimer
    record_id: Optional[int] = None

class PredictionEngine:
    def __init__(self):
        self.best_model = None
        self.all_models: Dict[str, Any] = {}
        self.metrics_metadata: Dict[str, Any] = {}
        self.load_artifacts()

    def load_artifacts(self):
        """Loads serialized models and metadata."""
        if BEST_MODEL_PATH.exists():
            self.best_model = joblib.load(BEST_MODEL_PATH)
        if ALL_MODELS_PATH.exists():
            self.all_models = joblib.load(ALL_MODELS_PATH)
        if METRICS_JSON_PATH.exists():
            with open(METRICS_JSON_PATH, "r") as f:
                self.metrics_metadata = json.load(f)

    def determine_risk_level(self, probability: float) -> str:
        """Classifies risk level based on model probability."""
        if probability >= RISK_THRESHOLD_LOW:
            return "Low"
        elif probability >= RISK_THRESHOLD_MEDIUM:
            return "Medium"
        else:
            return "High"

    def generate_key_drivers(self, req: PredictionRequest, dti: float) -> List[KeyDriver]:
        """Identifies primary positive and negative factors for explainability."""
        drivers = []
        if req.status_existing_checking_account == "negative_balance":
            drivers.append(KeyDriver(
                feature="Checking Balance",
                impact="negative",
                description="Overdrawn checking balance represents elevated default probability."
            ))
        elif req.status_existing_checking_account in ["high_balance_over_200", "low_balance_under_200"]:
            drivers.append(KeyDriver(
                feature="Checking Balance",
                impact="positive",
                description="Sustained positive liquid checking balance."
            ))

        if req.credit_history in ["delay_in_paying_past", "critical_account"]:
            drivers.append(KeyDriver(
                feature="Repayment History",
                impact="negative",
                description="Past delinquency or critical account flags historical credit strain."
            ))
        elif req.credit_history in ["existing_credits_paid_duly", "all_credits_paid_bank", "no_credits_all_paid"]:
            drivers.append(KeyDriver(
                feature="Repayment History",
                impact="positive",
                description="Consistent track record of fulfilling credit obligations on time."
            ))

        if dti >= 30.0:
            drivers.append(KeyDriver(
                feature="Debt-to-Income (DTI)",
                impact="negative",
                description=f"DTI ratio is elevated at {dti}%, reducing monthly financial cushion."
            ))
        else:
            drivers.append(KeyDriver(
                feature="Debt-to-Income (DTI)",
                impact="positive",
                description=f"Healthy DTI ratio of {dti}%, indicating strong debt servicing capacity."
            ))

        if req.savings_account_bonds in ["over_1000", "500_to_1000"]:
            drivers.append(KeyDriver(
                feature="Savings Liquidity",
                impact="positive",
                description="Substantial savings buffer provides shock absorption against cashflow disruptions."
            ))
        elif req.savings_account_bonds in ["unknown_or_no_savings", "under_100"]:
            drivers.append(KeyDriver(
                feature="Savings Liquidity",
                impact="negative",
                description="Minimal personal savings reserves."
            ))

        if req.present_employment_since in ["over_7_years", "4_to_7_years"]:
            drivers.append(KeyDriver(
                feature="Employment Stability",
                impact="positive",
                description="Prolonged employment tenure indicates stable earnings predictability."
            ))
        elif req.present_employment_since == "unemployed":
            drivers.append(KeyDriver(
                feature="Employment Stability",
                impact="negative",
                description="Current unemployment status restricts monthly repayment cashflow."
            ))

        return drivers

    def predict(self, req: PredictionRequest) -> PredictionResponse:
        """Executes full ML prediction pipeline and returns structured response."""
        model_name = req.model_name or self.metrics_metadata.get("best_model_name", "Random Forest")
        pipeline = self.all_models.get(model_name, self.best_model)
        if pipeline is None:
            raise RuntimeError("Model pipeline not loaded. Please run train.py first.")

        # Convert request to single-row DataFrame
        df_raw = pd.DataFrame([{
            "duration_in_month": req.duration_in_month,
            "credit_amount": req.credit_amount,
            "installment_rate_percent_income": req.installment_rate_percent_income,
            "present_residence_since": req.present_residence_since,
            "age_in_years": req.age_in_years,
            "number_existing_credits": req.number_existing_credits,
            "number_people_liable_maintenance": req.number_people_liable_maintenance,
            "status_existing_checking_account": req.status_existing_checking_account,
            "credit_history": req.credit_history,
            "purpose": req.purpose,
            "savings_account_bonds": req.savings_account_bonds,
            "present_employment_since": req.present_employment_since,
            "personal_status_and_sex": req.personal_status_and_sex,
            "other_debtors_guarantors": req.other_debtors_guarantors,
            "property": req.property,
            "other_installment_plans": req.other_installment_plans,
            "housing": req.housing,
            "job": req.job,
            "telephone": req.telephone,
            "foreign_worker": req.foreign_worker
        }])

        # Feature Engineering
        df_eng = engineer_features(df_raw)

        # Extract engineered ratios
        monthly_inst = float(df_eng["monthly_installment"].iloc[0])
        est_income = float(df_eng["estimated_annual_income"].iloc[0])
        dti = float(df_eng["debt_to_income_ratio"].iloc[0])
        lti = float(df_eng["loan_to_income_ratio"].iloc[0])
        resilience = float(df_eng["financial_resilience_score"].iloc[0])

        ratios = FinancialRatios(
            monthly_installment=round(monthly_inst, 2),
            estimated_annual_income=round(est_income, 2),
            debt_to_income_ratio=round(dti, 2),
            loan_to_income_ratio=round(lti, 4),
            financial_resilience_score=round(resilience, 2)
        )

        # Inference
        pred_code = int(pipeline.predict(df_eng)[0])
        probs = pipeline.predict_proba(df_eng)[0]
        creditworthy_prob = float(probs[1])

        # Standard credit score mapping (300 to 850 scale)
        risk_score = max(300, min(850, int(round(300 + (creditworthy_prob * 550)))))
        risk_level = self.determine_risk_level(creditworthy_prob)
        prediction_label = "Creditworthy" if pred_code == 1 else "Not Creditworthy"

        # Drivers & Explanation
        key_drivers = self.generate_key_drivers(req, dti)
        explanation = (
            f"Applicant evaluated as '{prediction_label}' with {creditworthy_prob * 100:.1f}% confidence "
            f"under the {model_name} model (Risk Level: {risk_level}, Score: {risk_score}). "
            f"Assessment is driven primarily by liquid checking status, historical discipline, "
            f"and a DTI of {dti}%."
        )

        # SQLite persistence
        try:
            record_id = save_prediction(
                applicant_name=req.applicant_name or "Anonymous Applicant",
                credit_amount=req.credit_amount,
                duration_in_month=req.duration_in_month,
                estimated_annual_income=est_income,
                debt_to_income_ratio=dti,
                loan_to_income_ratio=lti,
                checking_status=req.status_existing_checking_account,
                savings_account=req.savings_account_bonds,
                credit_history=req.credit_history,
                model_used=model_name,
                prediction=pred_code,
                prediction_label=prediction_label,
                probability=round(creditworthy_prob, 4),
                risk_category=risk_level,
                explanation_summary=explanation,
                raw_input=req.dict()
            )
        except Exception as e:
            print(f"[PredictionEngine] SQLite persistence warning: {e}")
            record_id = None

        return PredictionResponse(
            prediction=prediction_label,
            prediction_code=pred_code,
            probability=round(creditworthy_prob, 4),
            risk_level=risk_level,
            risk_score=risk_score,
            model_used=model_name,
            explanation=explanation,
            key_drivers=key_drivers,
            financial_ratios=ratios,
            disclaimer=EDUCATIONAL_DISCLAIMER,
            record_id=record_id
        )

# Global engine singleton
prediction_engine = PredictionEngine()
