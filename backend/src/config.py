"""
Global Configuration and Directory Paths for AI Credit Scoring System.
"""

import os
from pathlib import Path

# Base Paths
SRC_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SRC_DIR.parent
PROJECT_ROOT = BACKEND_DIR.parent

DATA_DIR = BACKEND_DIR / "data"
MODELS_DIR = BACKEND_DIR / "models"

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# File Paths
DATASET_CSV = DATA_DIR / "german_credit.csv"
DATASET_RAW = DATA_DIR / "german.data"
DB_PATH = DATA_DIR / "predictions.db"

BEST_MODEL_PATH = MODELS_DIR / "best_model.joblib"
PREPROCESSOR_PATH = MODELS_DIR / "preprocessor.joblib"
ALL_MODELS_PATH = MODELS_DIR / "all_models.joblib"
METRICS_JSON_PATH = MODELS_DIR / "model_metrics.json"

# UCI Dataset URLs
UCI_DATA_URL = "https://archive.ics.uci.edu/ml/machine-learning-databases/statlog/german/german.data"

# Risk Thresholds (Educational Demonstration)
RISK_THRESHOLD_LOW = 0.70       # Probability >= 0.70 -> Low risk
RISK_THRESHOLD_MEDIUM = 0.50    # 0.50 <= Probability < 0.70 -> Medium risk
# Probability < 0.50 -> High risk

EDUCATIONAL_DISCLAIMER = (
    "This application is an educational machine-learning project and is not a "
    "substitute for an official credit bureau score, lender decision, or financial advice."
)
