"""
Financial Feature Engineering for Credit Scoring and Risk Assessment.
Calculates domain-specific credit and financial health indicators from raw attributes.
"""

import pandas as pd
import numpy as np

# Ordinal savings tier score (0 to 4)
SAVINGS_SCORE_MAP = {
    "unknown_or_no_savings": 0,
    "under_100": 1,
    "100_to_500": 2,
    "500_to_1000": 3,
    "over_1000": 4
}

# Checking account risk score (0 to 3)
CHECKING_SCORE_MAP = {
    "negative_balance": 0,
    "low_balance_under_200": 1,
    "no_checking_account": 2,
    "high_balance_over_200": 3
}

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes domain-specific financial features:
    1. monthly_installment: credit_amount / duration_in_month
    2. estimated_annual_income: derived from monthly installment and installment percentage
    3. loan_to_income_ratio: credit_amount / estimated_annual_income
    4. debt_to_income_ratio: percentage of monthly income spent on credit payments
    5. financial_resilience_score: composite score based on checking status, savings tier, and credit history
    6. credit_utilization_burden: monthly installment relative to age and active credits
    """
    df = df.copy()
    
    # 1. Monthly Installment amount
    # Avoid division by zero
    duration = df["duration_in_month"].replace(0, 1)
    df["monthly_installment"] = (df["credit_amount"] / duration).round(2)
    
    # 2. Estimated Annual Income
    # installment_rate_percent_income is 1..4 representing ~ 10%, 20%, 30%, 40% income bracket
    # rate_pct = rate * 10%
    rate_pct = (df["installment_rate_percent_income"] * 0.08).clip(lower=0.05, upper=0.50)
    monthly_income = df["monthly_installment"] / rate_pct
    df["estimated_annual_income"] = (monthly_income * 12.0).round(2)
    
    # 3. Loan-to-Income Ratio (LTI)
    df["loan_to_income_ratio"] = (df["credit_amount"] / df["estimated_annual_income"]).clip(lower=0.01, upper=5.0).round(4)
    
    # 4. Debt-to-Income Ratio (DTI percentage)
    df["debt_to_income_ratio"] = ((df["monthly_installment"] / monthly_income) * 100.0).clip(lower=1.0, upper=80.0).round(2)
    
    # 5. Financial Resilience Score (0 to 10 scale)
    savings_scores = df["savings_account_bonds"].map(SAVINGS_SCORE_MAP).fillna(1)
    checking_scores = df["status_existing_checking_account"].map(CHECKING_SCORE_MAP).fillna(1)
    
    # Positive bonus for savings and stable checking, penalty for having > 2 credits without high savings
    base_resilience = (savings_scores * 1.5) + (checking_scores * 1.0)
    credit_penalty = (df["number_existing_credits"] - 1).clip(lower=0) * 0.5
    df["financial_resilience_score"] = (base_resilience - credit_penalty + 2.0).clip(lower=0.0, upper=10.0).round(2)
    
    # 6. Credit Burden per Life Stage
    age = df["age_in_years"].clip(lower=18)
    df["credit_burden_factor"] = (df["credit_amount"] / (age * 100)).round(3)
    
    return df
