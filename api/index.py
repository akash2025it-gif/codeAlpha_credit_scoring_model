"""Vercel entry point for the credit-scoring FastAPI service."""

import os
from pathlib import Path
import sys
import traceback

# Ensure all search paths for backend/src and project root are registered
CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent

for candidate in [
    PROJECT_ROOT / "backend" / "src",
    PROJECT_ROOT,
    Path("/var/task/backend/src"),
    Path("/var/task"),
    Path.cwd() / "backend" / "src",
]:
    p_str = str(candidate)
    if candidate.exists() and p_str not in sys.path:
        sys.path.insert(0, p_str)

_init_error = None

try:
    from main import app as app
except Exception as exc:
    _init_error = f"{type(exc).__name__}: {str(exc)}\n{traceback.format_exc()}"
    print(f"[Vercel Init Error] {_init_error}")

    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse

    app = FastAPI(title="Credit Scoring API Error Fallback")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/api/health")
    @app.get("/health")
    @app.get("/")
    def health_fallback():
        return JSONResponse(
            status_code=500,
            content={
                "status": "initialization_failed",
                "error": _init_error,
                "hint": "Check Vercel deployment logs and dependencies."
            }
        )
