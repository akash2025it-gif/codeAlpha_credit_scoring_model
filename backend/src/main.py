"""
FastAPI Application for AI-Based Credit Scoring and Creditworthiness Prediction System.
"""

from contextlib import asynccontextmanager
from typing import Optional
from fastapi import FastAPI, HTTPException, Header, Query, status, Depends
from fastapi.middleware.cors import CORSMiddleware

from database import (
    init_db,
    get_recent_predictions,
    get_prediction_by_id,
    clear_prediction_history
)
from prediction import prediction_engine, PredictionRequest, PredictionResponse
from auth import router as auth_router, get_current_user_optional

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database schema
    init_db()
    prediction_engine.load_artifacts()
    print("[API] System ready. SQLite DB, Auth system, and trained ML models initialized.")
    yield

app = FastAPI(
    title="CrediScore AI - Credit Scoring API",
    description="Machine Learning Creditworthiness Prediction & Risk Underwriting Engine",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local development and cross-origin hosting
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Authentication router
app.include_router(auth_router)

@app.get("/health", tags=["Health"])
def health():
    """
    Returns health status of the API and active machine learning model.
    Format specified in requirements: {"status": "healthy"}
    """
    best_model = prediction_engine.metrics_metadata.get("best_model_name", "Random Forest")
    return {
        "status": "healthy",
        "service": "AI-Based Credit Scoring and Creditworthiness Prediction System",
        "active_model": best_model,
        "active_best_model": best_model,          # used by Navbar status badge
        "models_available": list(prediction_engine.all_models.keys()),
        "database": "SQLite connected"
    }

@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
def predict(request: PredictionRequest, authorization: Optional[str] = Header(None)):
    """
    Submits applicant financial parameters and returns:
    - prediction: "Creditworthy" / "Not Creditworthy"
    - probability: Confidence percentage
    - risk_level: "Low", "Medium", "High"
    - risk_score: FICO-like 300-850 standardized score
    - explanation: Clear rationale
    - key_drivers: Identified positive and negative contributors
    - financial_ratios: DTI, LTI, resilience score
    - disclaimer: Educational purpose notice
    """
    try:
        user = get_current_user_optional(authorization)
        user_id = user["id"] if user else None
        return prediction_engine.predict(request, user_id=user_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction error: {str(e)}"
        )

@app.get("/model-metrics", tags=["Model Evaluation"])
def model_metrics():
    """
    Returns genuine holdout test evaluation metrics for:
    - Logistic Regression
    - Decision Tree
    - Random Forest
    Includes Accuracy, Precision, Recall, F1-Score, ROC-AUC, and Confusion Matrix.
    """
    metrics = prediction_engine.metrics_metadata
    if not metrics:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model metrics not found. Please run train.py first."
        )
    return metrics

@app.get("/prediction-history", tags=["Prediction History"])
def prediction_history(
    limit: int = Query(default=50, ge=1, le=500),
    user_only: bool = Query(default=False),
    authorization: Optional[str] = Header(None)
):
    """Retrieves SQLite audit log of past creditworthiness assessments."""
    try:
        user = get_current_user_optional(authorization) if user_only else None
        user_id = user["id"] if (user and user_only) else None
        records = get_recent_predictions(limit=limit, user_id=user_id)
        return {
            "count": len(records),
            "history": records
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

@app.get("/prediction-history/{prediction_id}", tags=["Prediction History"])
def get_prediction_detail(prediction_id: int):
    """Retrieves a single credit assessment audit record by its unique ID."""
    record = get_prediction_by_id(prediction_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prediction record #{prediction_id} not found."
        )
    return record

# Backward-compatibility alias
@app.get("/history", tags=["Prediction History"], include_in_schema=False)
def get_history_alias(limit: int = 50):
    return prediction_history(limit=limit)

@app.delete("/prediction-history", tags=["Prediction History"])
def delete_prediction_history(authorization: Optional[str] = Header(None)):
    """Clears SQLite demonstration history."""
    try:
        user = get_current_user_optional(authorization)
        # If user is logged in, optionally only clear user's or clear all demo
        clear_prediction_history()
        return {"status": "success", "message": "Prediction history cleared."}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

@app.delete("/history", tags=["Prediction History"], include_in_schema=False)
def delete_history_alias():
    return delete_prediction_history()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
