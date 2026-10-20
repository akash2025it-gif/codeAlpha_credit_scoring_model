"""
SQLite Database module for persisting credit scoring prediction history.
"""

import os
import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Any

DB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
DB_PATH = os.path.join(DB_DIR, "predictions.db")

def get_db_connection():
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the SQLite database schema if not present."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS prediction_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        applicant_name TEXT,
        credit_amount REAL NOT NULL,
        duration_in_month INTEGER NOT NULL,
        estimated_annual_income REAL,
        debt_to_income_ratio REAL,
        loan_to_income_ratio REAL,
        checking_status TEXT,
        savings_account TEXT,
        credit_history TEXT,
        model_used TEXT NOT NULL,
        prediction INTEGER NOT NULL,
        prediction_label TEXT NOT NULL,
        probability REAL NOT NULL,
        risk_category TEXT NOT NULL,
        explanation_summary TEXT,
        raw_input_json TEXT
    )
    """)
    conn.commit()
    conn.close()

def save_prediction(
    applicant_name: str,
    credit_amount: float,
    duration_in_month: int,
    estimated_annual_income: float,
    debt_to_income_ratio: float,
    loan_to_income_ratio: float,
    checking_status: str,
    savings_account: str,
    credit_history: str,
    model_used: str,
    prediction: int,
    prediction_label: str,
    probability: float,
    risk_category: str,
    explanation_summary: str,
    raw_input: dict
) -> int:
    """Inserts a new credit scoring record into the SQLite database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    now_iso = datetime.now().isoformat()
    cursor.execute("""
        INSERT INTO prediction_history (
            timestamp,
            applicant_name,
            credit_amount,
            duration_in_month,
            estimated_annual_income,
            debt_to_income_ratio,
            loan_to_income_ratio,
            checking_status,
            savings_account,
            credit_history,
            model_used,
            prediction,
            prediction_label,
            probability,
            risk_category,
            explanation_summary,
            raw_input_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        now_iso,
        applicant_name or "Anonymous Applicant",
        credit_amount,
        duration_in_month,
        estimated_annual_income,
        debt_to_income_ratio,
        loan_to_income_ratio,
        checking_status,
        savings_account,
        credit_history,
        model_used,
        prediction,
        prediction_label,
        probability,
        risk_category,
        explanation_summary,
        json.dumps(raw_input)
    ))
    record_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return record_id

def get_recent_predictions(limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieves the most recent predictions ordered by latest first."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM prediction_history ORDER BY id DESC LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    for row in rows:
        item = dict(row)
        try:
            item["raw_input_json"] = json.loads(item["raw_input_json"]) if item["raw_input_json"] else {}
        except Exception:
            pass
        results.append(item)
    return results

def clear_prediction_history():
    """Clears all prediction records."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM prediction_history")
    conn.commit()
    conn.close()
