"""Vercel entry point for the credit-scoring FastAPI service."""

import os
from pathlib import Path
import sys
import traceback

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Add backend/src to path
PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT / "backend" / "src"))

app = FastAPI(title="Credit Scoring API", version="1.0.0")

# Enable wide CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_init_error = None

try:
    from database import init_db
    try:
        init_db()
    except Exception as db_err:
        print(f"[Vercel Init] Database init notice: {db_err}")

    from main import app as credit_scoring_app

    # Mount credit_scoring_app at /api for requests with /api prefix
    app.mount("/api", credit_scoring_app)

    # Also include the router at root for requests where /api was stripped by rewrites
    app.include_router(credit_scoring_app.router)

except Exception as exc:
    _init_error = f"{type(exc).__name__}: {str(exc)}\n{traceback.format_exc()}"
    print(f"[Vercel Init Error] {_init_error}")

    @app.get("/api/health")
    @app.get("/health")
    def health_fallback():
        return JSONResponse(
            status_code=500,
            content={
                "status": "initialization_failed",
                "error": _init_error,
                "hint": "Check Vercel deployment logs and dependencies."
            }
        )

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "AI-Based Credit Scoring and Creditworthiness Prediction System",
        "endpoints": {
            "health": "/api/health",
            "predict": "/api/predict",
            "model_metrics": "/api/model-metrics",
            "history": "/api/prediction-history",
            "docs": "/docs"
        }
    }
