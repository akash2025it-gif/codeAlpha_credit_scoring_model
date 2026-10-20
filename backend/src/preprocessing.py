"""
Data Preprocessing and Feature Engineering Module.
Ensures identical transformations between model training and live prediction.
"""

import os
import urllib.request
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer

from config import DATASET_CSV, DATASET_RAW, UCI_DATA_URL

# Raw dataset column order (Statlog German Credit from UCI)
RAW_COLUMNS = [
    "status_existing_checking_account",
    "duration_in_month",
    "credit_history",
    "purpose",
    "credit_amount",
    "savings_account_bonds",
    "present_employment_since",
    "installment_rate_percent_income",
    "personal_status_and_sex",
    "other_debtors_guarantors",
    "present_residence_since",
    "property",
    "age_in_years",
    "other_installment_plans",
    "housing",
    "number_existing_credits",
    "job",
    "number_people_liable_maintenance",
    "telephone",
    "foreign_worker",
    "credit_risk"
]

# Human-readable value maps
VALUE_MAPS = {
    "status_existing_checking_account": {
        "A11": "negative_balance",
        "A12": "low_balance_under_200",
        "A13": "high_balance_over_200",
        "A14": "no_checking_account"
    },
    "credit_history": {
        "A30": "no_credits_all_paid",
        "A31": "all_credits_paid_bank",
        "A32": "existing_credits_paid_duly",
        "A33": "delay_in_paying_past",
        "A34": "critical_account"
    },
    "purpose": {
        "A40": "car_new",
        "A41": "car_used",
        "A42": "furniture_equipment",
        "A43": "radio_television",
        "A44": "domestic_appliances",
        "A45": "repairs",
        "A46": "education",
        "A47": "vacation",
        "A48": "retraining",
        "A49": "business",
        "A410": "other"
    },
    "savings_account_bonds": {
        "A61": "under_100",
        "A62": "100_to_500",
        "A63": "500_to_1000",
        "A64": "over_1000",
        "A65": "unknown_or_no_savings"
    },
    "present_employment_since": {
        "A71": "unemployed",
        "A72": "under_1_year",
        "A73": "1_to_4_years",
        "A74": "4_to_7_years",
        "A75": "over_7_years"
    },
    "personal_status_and_sex": {
        "A91": "male_divorced_separated",
        "A92": "female_divorced_separated_married",
        "A93": "male_single",
        "A94": "male_married_widowed",
        "A95": "female_single"
    },
    "other_debtors_guarantors": {
        "A101": "none",
        "A102": "co_applicant",
        "A103": "guarantor"
    },
    "property": {
        "A121": "real_estate",
        "A122": "building_society_life_insurance",
        "A123": "car_or_other",
        "A124": "unknown_no_property"
    },
    "other_installment_plans": {
        "A141": "bank",
        "A142": "stores",
        "A143": "none"
    },
    "housing": {
        "A151": "rent",
        "A152": "own",
        "A153": "for_free"
    },
    "job": {
        "A171": "unemployed_unskilled_non_resident",
        "A172": "unskilled_resident",
        "A173": "skilled_employee_official",
        "A174": "management_self_employed_high_qualification"
    },
    "telephone": {
        "A191": "none",
        "A192": "registered"
    },
    "foreign_worker": {
        "A201": "yes",
        "A202": "no"
    }
}

SAVINGS_SCORE_MAP = {
    "unknown_or_no_savings": 0,
    "under_100": 1,
    "100_to_500": 2,
    "500_to_1000": 3,
    "over_1000": 4
}

CHECKING_SCORE_MAP = {
    "negative_balance": 0,
    "low_balance_under_200": 1,
    "no_checking_account": 2,
    "high_balance_over_200": 3
}

def load_dataset() -> pd.DataFrame:
    """Loads or automatically fetches the official Statlog German Credit dataset."""
    if DATASET_CSV.exists():
        return pd.read_csv(DATASET_CSV)

    print("[Preprocessing] Dataset not found locally. Downloading from UCI Machine Learning Repository...")
    try:
        req = urllib.request.Request(
            UCI_DATA_URL,
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req, timeout=15) as resp, open(DATASET_RAW, 'wb') as out_f:
            out_f.write(resp.read())
    except Exception as e:
        print(f"[Preprocessing] UCI download warning: {e}")

    if DATASET_RAW.exists():
        df_raw = pd.read_csv(DATASET_RAW, sep=r'\s+', names=RAW_COLUMNS, header=None)
        for col, mapping in VALUE_MAPS.items():
            if col in df_raw.columns:
                df_raw[col] = df_raw[col].map(mapping).fillna(df_raw[col])
        df_raw["credit_risk"] = df_raw["credit_risk"].map({1: 1, 2: 0})
        df_raw.to_csv(DATASET_CSV, index=False)
        return df_raw
    else:
        raise FileNotFoundError(f"German Credit dataset missing at {DATASET_CSV}")

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Removes duplicates and handles missing values."""
    df_clean = df.copy()
    duplicates = int(df_clean.duplicated().sum())
    if duplicates > 0:
        df_clean = df_clean.drop_duplicates().reset_index(drop=True)
    df_clean = df_clean.dropna().reset_index(drop=True)
    return df_clean

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes domain-specific financial features:
    - monthly_installment: periodic debt service obligation
    - estimated_annual_income: proxy income derived from installment rate
    - debt_to_income_ratio: percentage of disposable income committed to debt
    - loan_to_income_ratio: ratio of credit amount to annual income
    - financial_resilience_score: composite liquidity index (0 to 10 scale)
    - credit_burden_factor: debt burden relative to applicant life stage
    """
    df = df.copy()
    duration = df["duration_in_month"].replace(0, 1)
    df["monthly_installment"] = (df["credit_amount"] / duration).round(2)
    
    rate_pct = (df["installment_rate_percent_income"] * 0.08).clip(lower=0.05, upper=0.50)
    monthly_income = df["monthly_installment"] / rate_pct
    df["estimated_annual_income"] = (monthly_income * 12.0).round(2)
    
    df["loan_to_income_ratio"] = (df["credit_amount"] / df["estimated_annual_income"]).clip(lower=0.01, upper=5.0).round(4)
    df["debt_to_income_ratio"] = ((df["monthly_installment"] / monthly_income) * 100.0).clip(lower=1.0, upper=80.0).round(2)
    
    savings_scores = df["savings_account_bonds"].map(SAVINGS_SCORE_MAP).fillna(1)
    checking_scores = df["status_existing_checking_account"].map(CHECKING_SCORE_MAP).fillna(1)
    base_resilience = (savings_scores * 1.5) + (checking_scores * 1.0)
    credit_penalty = (df["number_existing_credits"] - 1).clip(lower=0) * 0.5
    df["financial_resilience_score"] = (base_resilience - credit_penalty + 2.0).clip(lower=0.0, upper=10.0).round(2)
    
    age = df["age_in_years"].clip(lower=18)
    df["credit_burden_factor"] = (df["credit_amount"] / (age * 100)).round(3)
    return df

def build_preprocessor(numerical_cols: list, categorical_cols: list) -> ColumnTransformer:
    """Creates a ColumnTransformer to scale numbers and one-hot encode categories."""
    return ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numerical_cols),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_cols)
        ]
    )
