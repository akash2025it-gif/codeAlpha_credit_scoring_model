"""
Dataset Loader and Downloader for UCI German Credit Data (Statlog German Credit).
Public benchmark dataset from the UCI Machine Learning Repository:
https://archive.ics.uci.edu/ml/machine-learning-databases/statlog/german/german.data
"""

import os
import urllib.request
import pandas as pd
import numpy as np

# Column mapping for raw german.data (1000 rows, 20 attributes + 1 class label)
RAW_COLUMNS = [
    "status_existing_checking_account",      # A11 - A14
    "duration_in_month",                     # numerical
    "credit_history",                        # A30 - A34
    "purpose",                               # A40 - A410
    "credit_amount",                         # numerical
    "savings_account_bonds",                 # A61 - A65
    "present_employment_since",               # A71 - A75
    "installment_rate_percent_income",       # numerical 1 - 4
    "personal_status_and_sex",               # A91 - A95
    "other_debtors_guarantors",              # A101 - A103
    "present_residence_since",               # numerical 1 - 4
    "property",                              # A121 - A124
    "age_in_years",                          # numerical
    "other_installment_plans",               # A141 - A143
    "housing",                               # A151 - A153
    "number_existing_credits",               # numerical
    "job",                                   # A171 - A174
    "number_people_liable_maintenance",      # numerical
    "telephone",                             # A191 - A192
    "foreign_worker",                        # A201 - A202
    "credit_risk"                            # 1 = Good, 2 = Bad
]

# Human-readable value maps for clear domain understanding & intuitive frontend forms
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

UCI_URL = "https://archive.ics.uci.edu/ml/machine-learning-databases/statlog/german/german.data"
BACKUP_UCI_URL = "https://raw.githubusercontent.com/stedy/Machine-Learning-with-R-datasets/master/credit.csv"

def download_and_prepare_dataset(data_dir: str = None) -> pd.DataFrame:
    """
    Downloads or verifies the German Credit dataset and formats it.
    Target variable: credit_risk -> 1 for Creditworthy, 0 for Non-Creditworthy.
    """
    if data_dir is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        data_dir = os.path.join(base_dir, "data")
    
    os.makedirs(data_dir, exist_ok=True)
    csv_path = os.path.join(data_dir, "german_credit.csv")
    raw_path = os.path.join(data_dir, "german.data")
    
    if os.path.exists(csv_path):
        print(f"Dataset already exists at: {csv_path}")
        df = pd.read_csv(csv_path)
        return df

    # Download raw dataset from UCI
    print("Downloading German Credit dataset from UCI Machine Learning Repository...")
    try:
        req = urllib.request.Request(
            UCI_URL,
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req, timeout=15) as response, open(raw_path, 'wb') as out_file:
            out_file.write(response.read())
        print(f"Downloaded raw dataset to: {raw_path}")
    except Exception as e:
        print(f"UCI primary download failed: {e}. Trying fallback...")
        try:
            req = urllib.request.Request(
                BACKUP_UCI_URL,
                headers={'User-Agent': 'Mozilla/5.0'}
            )
            with urllib.request.urlopen(req, timeout=15) as response:
                df_fallback = pd.read_csv(response)
                print(f"Successfully loaded fallback dataset with shape {df_fallback.shape}")
                # We can standardize columns if fallback used
        except Exception as e2:
            print(f"Fallback download error: {e2}")

    if os.path.exists(raw_path):
        # Load space-separated raw file
        df_raw = pd.read_csv(raw_path, sep=r'\s+', names=RAW_COLUMNS, header=None)
        
        # Map coded categories to human-readable labels
        for col, mapping in VALUE_MAPS.items():
            if col in df_raw.columns:
                df_raw[col] = df_raw[col].map(mapping).fillna(df_raw[col])
        
        # Map Target: 1 = Good (Creditworthy) -> 1, 2 = Bad (Non-Creditworthy) -> 0
        df_raw["credit_risk"] = df_raw["credit_risk"].map({1: 1, 2: 0})
        
        # Save processed clean CSV
        df_raw.to_csv(csv_path, index=False)
        print(f"Saved processed German Credit dataset to: {csv_path} (Shape: {df_raw.shape})")
        return df_raw
    else:
        raise FileNotFoundError(f"Could not download or find dataset at {raw_path} or {csv_path}")

if __name__ == "__main__":
    df = download_and_prepare_dataset()
    print("\nDataset Info:")
    print(df.info())
    print("\nTarget Class Distribution:")
    print(df["credit_risk"].value_counts(normalize=True))
    print("\nSample records:")
    print(df.head(3))
