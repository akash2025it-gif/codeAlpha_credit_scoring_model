"""
End-to-End Machine Learning Training Pipeline for Credit Scoring.
Trains, evaluates, and compares:
1. Logistic Regression
2. Decision Tree
3. Random Forest

Generates comprehensive evaluation metrics:
- Accuracy, Precision, Recall, F1-Score, ROC-AUC, Confusion Matrix
Saves the best pipeline and metrics to disk.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
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

from dataset_loader import download_and_prepare_dataset
from feature_engineering import engineer_features

def run_training_pipeline(save_dir: str = None) -> dict:
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    data_dir = os.path.join(base_dir, "data")
    if save_dir is None:
        save_dir = os.path.join(base_dir, "models")
    os.makedirs(save_dir, exist_ok=True)
    
    print("=" * 60)
    print("Step 1 & 2: Dataset Loading and Inspection")
    print("=" * 60)
    df = download_and_prepare_dataset(data_dir=data_dir)
    print(f"Loaded raw dataset with shape: {df.shape}")
    
    # Step 3 & 4: Missing values & Duplicate handling
    print("\nStep 3 & 4: Handling Missing Values & Duplicates")
    duplicates_count = int(df.duplicated().sum())
    if duplicates_count > 0:
        print(f"Removing {duplicates_count} duplicate rows...")
        df = df.drop_duplicates().reset_index(drop=True)
    else:
        print("No duplicate records found.")
        
    missing_counts = df.isnull().sum()
    total_missing = int(missing_counts.sum())
    print(f"Total missing values across columns: {total_missing}")
    if total_missing > 0:
        df = df.dropna().reset_index(drop=True)
        
    # Step 5 & 7: Feature Engineering
    print("\nStep 5 & 7: Applying Financial Feature Engineering")
    df_feat = engineer_features(df)
    print(f"Engineered features added. New shape: {df_feat.shape}")
    
    # Define Target and Feature sets
    target_col = "credit_risk"
    X = df_feat.drop(columns=[target_col])
    y = df_feat[target_col].astype(int)
    
    class_distribution = y.value_counts(normalize=True).to_dict()
    print(f"Target distribution: {class_distribution} (1=Creditworthy, 0=Non-Creditworthy)")
    
    # Identify numerical and categorical columns
    numerical_cols = X.select_dtypes(include=["int64", "float64"]).columns.tolist()
    categorical_cols = X.select_dtypes(include=["object", "str", "string"]).columns.tolist()
    
    print(f"\nNumerical features ({len(numerical_cols)}): {numerical_cols}")
    print(f"Categorical features ({len(categorical_cols)}): {categorical_cols}")
    
    # Step 8: Train/Test Split (Stratified 80/20)
    print("\nStep 8: Splitting data (80% train, 20% test, stratified)")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"Training set: {X_train.shape[0]} samples, Test set: {X_test.shape[0]} samples")
    
    # Step 6: Preprocessing with ColumnTransformer
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numerical_cols),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_cols)
        ]
    )
    
    # Step 9: Define models to train and compare
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
    best_roc_auc = -1.0
    
    print("\n" + "=" * 60)
    print("Step 9 & 10: Model Training and Multi-Metric Evaluation")
    print("=" * 60)
    
    for name, clf in models.items():
        print(f"\n---> Training {name}...")
        pipeline = Pipeline([
            ("preprocessor", preprocessor),
            ("classifier", clf)
        ])
        
        # Train
        pipeline.fit(X_train, y_train)
        trained_pipelines[name] = pipeline
        
        # Predict on Test set
        y_pred = pipeline.predict(X_test)
        y_prob = pipeline.predict_proba(X_test)[:, 1]
        
        # Calculate Required Metrics
        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))
        roc = float(roc_auc_score(y_test, y_prob))
        cm = confusion_matrix(y_test, y_pred).tolist()  # [[TN, FP], [FN, TP]]
        
        # Compute ROC Curve points for charts (sample points for compact JSON)
        fpr, tpr, _ = roc_curve(y_test, y_prob)
        # Sample down to 20 representative points
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
        
        print(f"Results for {name}:")
        print(f"  Accuracy : {acc:.4f}")
        print(f"  Precision: {prec:.4f}")
        print(f"  Recall   : {rec:.4f}")
        print(f"  F1-Score : {f1:.4f}")
        print(f"  ROC-AUC  : {roc:.4f}")
        print(f"  Confusion Matrix: {cm}")
        
        # Track best model based on ROC-AUC & F1 combination
        composite_score = (roc * 0.6) + (f1 * 0.4)
        if composite_score > best_roc_auc:
            best_roc_auc = composite_score
            best_model_name = name

    # Extract feature importance from Random Forest or Decision Tree for interpretability
    rf_pipeline = trained_pipelines["Random Forest"]
    rf_clf = rf_pipeline.named_steps["classifier"]
    
    # Get feature names after one-hot encoding
    cat_encoder = rf_pipeline.named_steps["preprocessor"].named_transformers_["cat"]
    cat_feature_names = cat_encoder.get_feature_names_out(categorical_cols).tolist()
    all_feature_names = numerical_cols + cat_feature_names
    
    importances = rf_clf.feature_importances_
    feature_importance_list = [
        {"feature": feat, "importance": round(float(imp), 4)}
        for feat, imp in sorted(zip(all_feature_names, importances), key=lambda x: x[1], reverse=True)[:15]
    ]
    
    print("\n" + "=" * 60)
    print(f"Step 11 & 12: Best Model Selection: >>> {best_model_name} <<<")
    print("=" * 60)
    
    metadata = {
        "dataset_name": "Statlog (German Credit Data) - UCI Machine Learning Repository",
        "total_samples": len(df_feat),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "class_distribution": {
            "creditworthy_ratio": round(float(class_distribution.get(1, 0.7)), 3),
            "non_creditworthy_ratio": round(float(class_distribution.get(0, 0.3)), 3)
        },
        "numerical_features": numerical_cols,
        "categorical_features": categorical_cols,
        "best_model_name": best_model_name,
        "models_evaluated": list(models.keys()),
        "metrics": metrics_summary,
        "top_feature_importances": feature_importance_list
    }
    
    # Step 13: Save Best Model & Metadata
    best_model_path = os.path.join(save_dir, "best_model.joblib")
    all_models_path = os.path.join(save_dir, "all_models.joblib")
    metrics_path = os.path.join(save_dir, "model_metrics.json")
    
    print(f"\nStep 13: Saving best model pipeline to: {best_model_path}")
    joblib.dump(trained_pipelines[best_model_name], best_model_path)
    joblib.dump(trained_pipelines, all_models_path)
    
    with open(metrics_path, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"Saved evaluation metrics to: {metrics_path}")
    
    print("\nML Pipeline executed successfully!")
    return metadata

if __name__ == "__main__":
    run_training_pipeline()
