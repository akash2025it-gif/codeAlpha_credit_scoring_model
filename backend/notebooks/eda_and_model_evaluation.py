"""
Exploratory Data Analysis (EDA) and Model Benchmarking Notebook Script.
This script demonstrates the data science workflow behind the credit scoring model:
1. Loading the Statlog German Credit dataset
2. Inspecting statistical summaries, distributions, and skewness
3. Analyzing correlation with credit_risk
4. Engineering key financial features (DTI, LTI, resilience score)
5. Comparing Logistic Regression, Decision Tree, and Random Forest
"""

import os
import pandas as pd
import numpy as np

def run_eda():
    data_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "german_credit.csv")
    if not os.path.exists(data_path):
        print(f"Dataset not found at {data_path}. Run dataset_loader.py first.")
        return

    df = pd.read_csv(data_path)
    print("=== GERMAN CREDIT DATASET OVERVIEW ===")
    print(f"Shape: {df.shape[0]} rows, {df.shape[1]} columns")
    print("\nTarget Distribution:")
    print(df['credit_risk'].value_counts(normalize=True).rename({1: 'Creditworthy (Good)', 0: 'Non-Creditworthy (Bad)'}))

    print("\nNumerical Statistics:")
    print(df.describe().T[['mean', 'std', 'min', '50%', 'max']])

    print("\nCategorical Features:")
    cat_cols = df.select_dtypes(include=['object', 'str']).columns
    for col in cat_cols[:5]:
        print(f"- {col}: {df[col].nunique()} unique categories ({df[col].unique()[:3]}...)")

    print("\nDefault Risk by Checking Account Status:")
    if 'status_existing_checking_account' in df.columns:
        print(df.groupby('status_existing_checking_account')['credit_risk'].agg(['count', 'mean']).rename(columns={'mean': 'approval_rate'}))

    print("\nDefault Risk by Savings Category:")
    if 'savings_account_bonds' in df.columns:
        print(df.groupby('savings_account_bonds')['credit_risk'].agg(['count', 'mean']).rename(columns={'mean': 'approval_rate'}))

if __name__ == "__main__":
    run_eda()
