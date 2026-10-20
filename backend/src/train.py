"""
Machine Learning Training Pipeline for Credit Scoring.
Usage:
    python backend/src/train.py
"""

import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    roc_curve
)

from config import (
    BEST_MODEL_PATH,
    PREPROCESSOR_PATH,
    ALL_MODELS_PATH,
    METRICS_JSON_PATH
)
from preprocessing import (
    load_dataset,
    clean_data,
    engineer_features,
    build_preprocessor
)

def train_and_evaluate():
    print("=" * 65)
    print("AI CREDIT SCORING - MODEL TRAINING & COMPARISON PIPELINE")
    print("=" * 65)

    # 1. Load Dataset
    print("\n[Step 1] Loading benchmark dataset...")
    df = load_dataset()
    print(f"Dataset successfully loaded: {df.shape[0]} rows, {df.shape[1]} columns")

    # 2. Clean Data (Check missing & duplicates)
    print("\n[Step 2] Auditing data quality...")
    df_clean = clean_data(df)
    print(f"Cleaned dataset: {df_clean.shape[0]} rows (0 duplicates, 0 missing values)")

    # 3. Apply Feature Engineering
    print("\n[Step 3] Applying domain-informed financial feature engineering...")
    df_feat = engineer_features(df_clean)
    print(f"Engineered dataset shape: {df_feat.shape}")

    # 4. Define Target and Features
    target_col = "credit_risk"
    X = df_feat.drop(columns=[target_col])
    y = df_feat[target_col].astype(int)

    numerical_cols = X.select_dtypes(include=["int64", "float64"]).columns.tolist()
    categorical_cols = X.select_dtypes(include=["object", "str", "string"]).columns.tolist()

    print(f"Numerical features ({len(numerical_cols)}): {numerical_cols}")
    print(f"Categorical features ({len(categorical_cols)}): {categorical_cols}")
    print(f"Target distribution: Good={int(sum(y==1))} ({sum(y==1)/len(y)*100:.1f}%), Bad={int(sum(y==0))} ({sum(y==0)/len(y)*100:.1f}%)")

    # 5. Train / Test Split (Stratified 80/20)
    print("\n[Step 4] Stratified 80/20 Train/Test split...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"Train samples: {len(X_train)} | Test samples: {len(X_test)}")

    # 6. Build Preprocessing ColumnTransformer
    print("\n[Step 5] Building ColumnTransformer preprocessor...")
    preprocessor = build_preprocessor(numerical_cols, categorical_cols)

    # 7. Define Algorithms to Compare
    models = {
        "Logistic Regression": LogisticRegression(
            max_iter=1000,
            C=0.5,
            class_weight="balanced",
            random_state=42
        ),
        "Decision Tree": DecisionTreeClassifier(
            max_depth=5,
            min_samples_split=10,
            min_samples_leaf=5,
            class_weight="balanced",
            random_state=42
        ),
        "Random Forest": RandomForestClassifier(
            n_estimators=120,
            max_depth=8,
            min_samples_split=6,
            min_samples_leaf=3,
            class_weight="balanced",
            random_state=42
        )
    }

    trained_pipelines = {}
    metrics_summary = {}
    best_model_name = None
    best_score = -1.0

    print("\n" + "=" * 65)
    print("[Step 6 & 7] Model Training and Evaluation on 20% Holdout Test Set")
    print("=" * 65)

    for name, clf in models.items():
        print(f"\n---> Training: {name}...")
        pipeline = Pipeline([
            ("preprocessor", preprocessor),
            ("classifier", clf)
        ])
        
        # Fit strictly on training set to prevent data leakage
        pipeline.fit(X_train, y_train)
        trained_pipelines[name] = pipeline

        # Predict on holdout test set
        y_pred = pipeline.predict(X_test)
        y_prob = pipeline.predict_proba(X_test)[:, 1]

        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))
        roc = float(roc_auc_score(y_test, y_prob))
        cm = confusion_matrix(y_test, y_pred).tolist()

        fpr, tpr, _ = roc_curve(y_test, y_prob)
        indices = np.linspace(0, len(fpr) - 1, min(20, len(fpr)), dtype=int)
        roc_points = [
            {"fpr": round(float(fpr[i]), 4), "tpr": round(float(tpr[i]), 4)}
            for i in indices
        ]

        metrics_summary[name] = {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(roc, 4),
            "confusion_matrix": {
                "true_negative": int(cm[0][0]),
                "false_positive": int(cm[0][1]),
                "false_negative": int(cm[1][0]),
                "true_positive": int(cm[1][1])
            },
            "roc_curve": roc_points
        }

        print(f"     Accuracy : {acc * 100:.2f}%")
        print(f"     Precision: {prec * 100:.2f}%")
        print(f"     Recall   : {rec * 100:.2f}%")
        print(f"     F1-Score : {f1 * 100:.2f}%")
        print(f"     ROC-AUC  : {roc * 100:.2f}%")
        print(f"     Confusion Matrix: TN={cm[0][0]}, FP={cm[0][1]}, FN={cm[1][0]}, TP={cm[1][1]}")

        # Best model selection criterion: composite of ROC-AUC (60%) and F1 (40%)
        # Balancing ranking discrimination and trade-off between False Positives & Negatives
        composite = (roc * 0.6) + (f1 * 0.4)
        if composite > best_score:
            best_score = composite
            best_model_name = name

    # Feature Importance Extraction from Random Forest
    rf_pipeline = trained_pipelines["Random Forest"]
    rf_clf = rf_pipeline.named_steps["classifier"]
    cat_encoder = rf_pipeline.named_steps["preprocessor"].named_transformers_["cat"]
    cat_feature_names = cat_encoder.get_feature_names_out(categorical_cols).tolist()
    all_feature_names = numerical_cols + cat_feature_names
    importances = rf_clf.feature_importances_

    top_features = [
        {"feature": feat, "importance": round(float(imp), 4)}
        for feat, imp in sorted(zip(all_feature_names, importances), key=lambda x: x[1], reverse=True)[:15]
    ]

    print("\n" + "=" * 65)
    print(f"[Step 8] Selected Champion Model: >>> {best_model_name} <<<")
    print("=" * 65)

    metadata = {
        "dataset_name": "Statlog (German Credit Data) - UCI Machine Learning Repository",
        "total_samples": len(df_feat),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "class_distribution": {
            "creditworthy_ratio": round(float(sum(y == 1) / len(y)), 3),
            "non_creditworthy_ratio": round(float(sum(y == 0) / len(y)), 3)
        },
        "numerical_features": numerical_cols,
        "categorical_features": categorical_cols,
        "best_model_name": best_model_name,
        "models_evaluated": list(models.keys()),
        "metrics": metrics_summary,
        "top_feature_importances": top_features
    }

    # Step 9, 10, 11: Save Artifacts
    print(f"\n[Step 9 & 10] Saving model and preprocessor to disk...")
    joblib.dump(trained_pipelines[best_model_name], BEST_MODEL_PATH)
    joblib.dump(preprocessor, PREPROCESSOR_PATH)
    joblib.dump(trained_pipelines, ALL_MODELS_PATH)

    with open(METRICS_JSON_PATH, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"Artifacts saved:")
    print(f"  - Best Model Pipeline: {BEST_MODEL_PATH}")
    print(f"  - Preprocessor:        {PREPROCESSOR_PATH}")
    print(f"  - Comparison Models:   {ALL_MODELS_PATH}")
    print(f"  - Metrics Metadata:    {METRICS_JSON_PATH}")
    print("\nModel training workflow completed successfully!")

if __name__ == "__main__":
    train_and_evaluate()
