"""Vercel entry point for the credit-scoring FastAPI service."""

from pathlib import Path
import sys

from fastapi import FastAPI

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT / "backend" / "src"))

from main import app as credit_scoring_app  # noqa: E402
from database import init_db  # noqa: E402

init_db()

# Vercel exposes this function under /api. Mounting keeps the existing backend
# routes intact, e.g. POST /api/predict and GET /api/health.
app = FastAPI(title="Credit Scoring API")
app.mount("/api", credit_scoring_app)
