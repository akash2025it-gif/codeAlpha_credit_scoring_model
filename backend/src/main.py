"""
FastAPI Application for AI-Based Credit Scoring and Creditworthiness Prediction System.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from database import init_db, get_recent_predictions, clear_prediction_history
from prediction import prediction_engine, PredictionRequest, PredictionResponse

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database schema
    init_db()
    prediction_engine.load_artifacts()
    print("[API] System ready. SQLite DB and trained ML models initialized.")
    yield

app = FastAPI(
    title="AI Credit Scoring API",
    description="Machine Learning Creditworthiness Prediction Engine",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        "models_available": list(prediction_engine.all_models.keys()),
        "database": "SQLite connected"
    }

@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
def predict(request: PredictionRequest):
    """
    Submits applicant financial parameters and returns:
    - prediction: "Creditworthy" / "Not Creditworthy"
    - probability: Confidence percentage
    - risk_level: "Low", "Medium", "High"
    - risk_score: FICO-like 300-850 score
    - explanation: Clear rationale
    - key_drivers: Identified positive and negative contributors
    - financial_ratios: DTI, LTI, resilience score
    - disclaimer: Educational purpose notice
    """
    try:
        return prediction_engine.predict(request)
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
def prediction_history(limit: int = 50):
    """Retrieves SQLite audit log of past creditworthiness assessments."""
    try:
        records = get_recent_predictions(limit=limit)
        return {
            "count": len(records),
            "history": records
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

# Backward-compatibility alias
@app.get("/history", tags=["Prediction History"], include_in_schema=False)
def get_history_alias(limit: int = 50):
    return prediction_history(limit=limit)

@app.delete("/prediction-history", tags=["Prediction History"])
def delete_prediction_history():
    """Clears SQLite demonstration history."""
    try:
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
