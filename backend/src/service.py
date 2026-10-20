"""
Credit Scoring Inference Engine and Prediction Service.
Integrates trained scikit-learn models, feature engineering, and risk categorization.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, List

from ml.feature_engineering import engineer_features
from database import save_prediction
from schemas import CreditPredictionRequest, CreditPredictionResponse, FinancialRatios, KeyDriver

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")
BEST_MODEL_PATH = os.path.join(MODELS_DIR, "best_model.joblib")
ALL_MODELS_PATH = os.path.join(MODELS_DIR, "all_models.joblib")
METRICS_PATH = os.path.join(MODELS_DIR, "model_metrics.json")

class CreditScoringService:
    def __init__(self):
        self.best_model = None
        self.all_models: Dict[str, Any] = {}
        self.metrics_metadata: Dict[str, Any] = {}
        self.load_models()

    def load_models(self):
        """Loads serialized models and evaluation metrics from disk."""
        if os.path.exists(BEST_MODEL_PATH):
            self.best_model = joblib.load(BEST_MODEL_PATH)
            print(f"[Service] Loaded best model pipeline from: {BEST_MODEL_PATH}")
        else:
            print(f"[Service] Warning: {BEST_MODEL_PATH} not found.")

        if os.path.exists(ALL_MODELS_PATH):
            self.all_models = joblib.load(ALL_MODELS_PATH)
            print(f"[Service] Loaded {len(self.all_models)} comparison models.")

        if os.path.exists(METRICS_PATH):
            with open(METRICS_PATH, "r") as f:
                self.metrics_metadata = json.load(f)

    def get_metrics(self) -> dict:
        return self.metrics_metadata

    def generate_key_drivers(self, req: CreditPredictionRequest, ratios: FinancialRatios) -> List[KeyDriver]:
        """Analyzes customer parameters and produces explainable financial risk drivers."""
        drivers = []
        
        # 1. Checking account driver
        if req.status_existing_checking_account == "negative_balance":
            drivers.append(KeyDriver(
                feature="Checking Account Status",
                impact="negative",
                description="Overdrawn or negative balance checking account signals acute cashflow strain."
            ))
        elif req.status_existing_checking_account in ["high_balance_over_200", "low_balance_under_200"]:
            drivers.append(KeyDriver(
                feature="Checking Account Status",
                impact="positive",
                description="Active checking account with sustained positive liquid cash balance."
            ))

        # 2. Credit history driver
        if req.credit_history in ["delay_in_paying_past", "critical_account"]:
            drivers.append(KeyDriver(
                feature="Historical Credit Performance",
                impact="negative",
                description="Prior payment delays or critical account status suggest recurring delinquency risk."
            ))
        elif req.credit_history in ["existing_credits_paid_duly", "all_credits_paid_bank", "no_credits_all_paid"]:
            drivers.append(KeyDriver(
                feature="Historical Credit Performance",
                impact="positive",
                description="Strong track record of servicing obligations and honoring previous credit commitments."
            ))

        # 3. Debt to Income
        if ratios.debt_to_income_ratio >= 30.0:
            drivers.append(KeyDriver(
                feature="Debt-to-Income (DTI)",
                impact="negative",
                description=f"DTI ratio is elevated at {ratios.debt_to_income_ratio}%, reducing monthly financial leeway."
            ))
        else:
            drivers.append(KeyDriver(
                feature="Debt-to-Income (DTI)",
                impact="positive",
                description=f"Healthy DTI ratio of {ratios.debt_to_income_ratio}% well within safe lending guidelines."
            ))

        # 4. Savings reserve buffer
        if req.savings_account_bonds in ["over_1000", "500_to_1000"]:
            drivers.append(KeyDriver(
                feature="Emergency Liquidity Reserves",
                impact="positive",
                description="Substantial savings account balance offers strong downside shock absorption."
            ))
        elif req.savings_account_bonds in ["unknown_or_no_savings", "under_100"]:
            drivers.append(KeyDriver(
                feature="Emergency Liquidity Reserves",
                impact="negative",
                description="Limited personal savings creates vulnerability to unexpected life events."
            ))

        # 5. Employment tenure
        if req.present_employment_since in ["over_7_years", "4_to_7_years"]:
            drivers.append(KeyDriver(
                feature="Employment Stability",
                impact="positive",
                description="Multi-year employment tenure indicates consistent earning predictability."
            ))
        elif req.present_employment_since == "unemployed":
            drivers.append(KeyDriver(
                feature="Employment Stability",
                impact="negative",
                description="Current unemployment status severely restricts regular income flow."
            ))

        return drivers

    def predict(self, req: CreditPredictionRequest) -> CreditPredictionResponse:
        """Executes full ML prediction pipeline, applies feature engineering, calculates risk score."""
        # Select model pipeline
        model_name = req.model_name
        if not model_name or model_name not in self.all_models:
            model_name = self.metrics_metadata.get("best_model_name", "Random Forest")
        
        pipeline = self.all_models.get(model_name, self.best_model)
        if pipeline is None:
            raise RuntimeError("Model pipeline has not been trained or loaded yet.")

        # Convert request to single-row DataFrame
        raw_dict = {
            "duration_in_month": [req.duration_in_month],
            "credit_amount": [req.credit_amount],
            "installment_rate_percent_income": [req.installment_rate_percent_income],
            "present_residence_since": [req.present_residence_since],
            "age_in_years": [req.age_in_years],
            "number_existing_credits": [req.number_existing_credits],
            "number_people_liable_maintenance": [req.number_people_liable_maintenance],
            "status_existing_checking_account": [req.status_existing_checking_account],
            "credit_history": [req.credit_history],
            "purpose": [req.purpose],
            "savings_account_bonds": [req.savings_account_bonds],
            "present_employment_since": [req.present_employment_since],
            "personal_status_and_sex": [req.personal_status_and_sex],
            "other_debtors_guarantors": [req.other_debtors_guarantors],
            "property": [req.property],
            "other_installment_plans": [req.other_installment_plans],
            "housing": [req.housing],
            "job": [req.job],
            "telephone": [req.telephone],
            "foreign_worker": [req.foreign_worker]
        }
        df_raw = pd.DataFrame(raw_dict)

        # Apply Feature Engineering
        df_engineered = engineer_features(df_raw)

        # Extract engineered ratios
        monthly_inst = float(df_engineered["monthly_installment"].iloc[0])
        est_income = float(df_engineered["estimated_annual_income"].iloc[0])
        dti = float(df_engineered["debt_to_income_ratio"].iloc[0])
        lti = float(df_engineered["loan_to_income_ratio"].iloc[0])
        resilience = float(df_engineered["financial_resilience_score"].iloc[0])

        ratios = FinancialRatios(
            monthly_installment=round(monthly_inst, 2),
            estimated_annual_income=round(est_income, 2),
            debt_to_income_ratio=round(dti, 2),
            loan_to_income_ratio=round(lti, 4),
            financial_resilience_score=round(resilience, 2)
        )

        # Run inference via scikit-learn pipeline
        pred_class = int(pipeline.predict(df_engineered)[0])
        pred_probs = pipeline.predict_proba(df_engineered)[0]
        creditworthy_prob = float(pred_probs[1])

        # Standard credit score mapping (300 to 850 FICO equivalent)
        risk_score = int(round(300 + (creditworthy_prob * 550)))
        risk_score = max(300, min(850, risk_score))

        # Risk categorization based on model probability
        if creditworthy_prob >= 0.70:
            risk_category = "Low Risk"
            pred_label = "Creditworthy"
        elif creditworthy_prob >= 0.50:
            risk_category = "Moderate Risk"
            pred_label = "Creditworthy"
        else:
            risk_category = "High Risk"
            pred_label = "Not Creditworthy"

        # Generate explainability key drivers
        key_drivers = self.generate_key_drivers(req, ratios)

        explanation_summary = (
            f"The customer is evaluated as '{pred_label}' under the {model_name} model "
            f"with an approval confidence of {round(creditworthy_prob * 100, 1)}% "
            f"(Credit Score: {risk_score}, Category: {risk_category}). "
            f"Primary factors include checking liquidity, debt-to-income ratio ({dti}%), "
            f"and prior repayment history."
        )

        # Persist to SQLite
        try:
            record_id = save_prediction(
                applicant_name=req.applicant_name,
                credit_amount=req.credit_amount,
                duration_in_month=req.duration_in_month,
                estimated_annual_income=est_income,
                debt_to_income_ratio=dti,
                loan_to_income_ratio=lti,
                checking_status=req.status_existing_checking_account,
                savings_account=req.savings_account_bonds,
                credit_history=req.credit_history,
                model_used=model_name,
                prediction=pred_class,
                prediction_label=pred_label,
                probability=round(creditworthy_prob, 4),
                risk_category=risk_category,
                explanation_summary=explanation_summary,
                raw_input=raw_dict
            )
        except Exception as e:
            print(f"[Service] Warning: SQLite persistence failed: {e}")
            record_id = None

        return CreditPredictionResponse(
            prediction=pred_class,
            prediction_label=pred_label,
            probability=round(creditworthy_prob, 4),
            risk_score=risk_score,
            risk_category=risk_category,
            model_used=model_name,
            financial_ratios=ratios,
            explanation_summary=explanation_summary,
            key_drivers=key_drivers,
            history_record_id=record_id
        )

# Global service singleton
scoring_service = CreditScoringService()
