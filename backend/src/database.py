"""
SQLite Database module for persisting credit scoring prediction history and authenticated users.
"""

import os
import sqlite3
import json
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

# Vercel function deployments have a read-only project filesystem. Store the
# best-effort SQLite audit log in its writable temporary directory there.
DB_DIR = (
    os.path.join("/tmp", "credit_scoring_data")
    if os.environ.get("VERCEL")
    else os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
)
DB_PATH = os.path.join(DB_DIR, "predictions.db")

def get_db_connection():
    global DB_PATH
    try:
        os.makedirs(DB_DIR, exist_ok=True)
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn
    except Exception:
        # Fallback to writable /tmp directory if local data dir is read-only (e.g. serverless)
        tmp_dir = os.path.join("/tmp", "credit_scoring_data")
        os.makedirs(tmp_dir, exist_ok=True)
        DB_PATH = os.path.join(tmp_dir, "predictions.db")
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    """Generates a secure PBKDF2-HMAC-SHA256 password hash and salt."""
    if not salt:
        salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100_000
    )
    return key.hex(), salt

def verify_password(password: str, password_hash: str, salt: str) -> bool:
    """Verifies a candidate password against the stored hash and salt."""
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100_000
    )
    return secrets.compare_digest(key.hex(), password_hash)

def init_db():
    """Initializes SQLite tables for predictions, users, and user sessions."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Prediction History table
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
        raw_input_json TEXT,
        user_id INTEGER
    )
    """)

    # Check if user_id column exists (for backward compatibility)
    cursor.execute("PRAGMA table_info(prediction_history)")
    cols = [row["name"] for row in cursor.fetchall()]
    if "user_id" not in cols:
        try:
            cursor.execute("ALTER TABLE prediction_history ADD COLUMN user_id INTEGER")
        except Exception:
            pass

    # 2. Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'Credit Risk Analyst',
        department TEXT DEFAULT 'Underwriting & Risk',
        created_at TEXT NOT NULL,
        last_login TEXT
    )
    """)

    # 3. User Sessions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    conn.commit()

    # 4. Seed default demo user if table is empty
    cursor.execute("SELECT COUNT(*) as count FROM users")
    user_count = cursor.fetchone()["count"]
    if user_count == 0:
        demo_pwd_hash, demo_salt = hash_password("Password@123")
        now_iso = datetime.now().isoformat()
        cursor.execute("""
        INSERT INTO users (
            username, email, password_hash, salt, full_name, role, department, created_at, last_login
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "demo_analyst",
            "analyst@crediscore.ai",
            demo_pwd_hash,
            demo_salt,
            "Alexander Vance",
            "Senior Risk Analyst",
            "Credit Underwriting & Risk",
            now_iso,
            now_iso
        ))
        conn.commit()
        print("[Database] Seeded initial demonstration analyst account: demo_analyst")

    conn.close()

# -------------------------------------------------------------
# User Account Operations
# -------------------------------------------------------------

def create_user(username: str, email: str, password: str, full_name: str, role: str = "Credit Risk Analyst", department: str = "Underwriting & Risk") -> Dict[str, Any]:
    """Creates a new user record with hashed password."""
    pwd_hash, salt = hash_password(password)
    now_iso = datetime.now().isoformat()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO users (username, email, password_hash, salt, full_name, role, department, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (username.strip().lower(), email.strip().lower(), pwd_hash, salt, full_name.strip(), role.strip(), department.strip(), now_iso))
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return get_user_by_id(user_id)

def get_user_by_username(username: str) -> Optional[Dict[str, Any]]:
    """Retrieves a user by username."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (username.strip().lower(),))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Retrieves a user by email address."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email.strip().lower(),))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    """Retrieves a user by internal ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, email, full_name, role, department, created_at, last_login FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def update_user_profile(user_id: int, full_name: str, email: str, department: str) -> Optional[Dict[str, Any]]:
    """Updates user profile details."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE users SET full_name = ?, email = ?, department = ? WHERE id = ?
    """, (full_name.strip(), email.strip().lower(), department.strip(), user_id))
    conn.commit()
    conn.close()
    return get_user_by_id(user_id)

def update_user_password(user_id: int, new_password: str) -> bool:
    """Updates a user's password with a fresh hash and salt."""
    pwd_hash, salt = hash_password(new_password)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET password_hash = ?, salt = ? WHERE id = ?", (pwd_hash, salt, user_id))
    conn.commit()
    conn.close()
    return True

def update_user_last_login(user_id: int):
    """Records the timestamp of successful login."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET last_login = ? WHERE id = ?", (datetime.now().isoformat(), user_id))
    conn.commit()
    conn.close()

# -------------------------------------------------------------
# Session Operations
# -------------------------------------------------------------

def create_session(user_id: int, days_valid: int = 7) -> str:
    """Creates a new authenticated session token."""
    token = secrets.token_urlsafe(32)
    now = datetime.now()
    expires = now + timedelta(days=days_valid)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO user_sessions (token, user_id, created_at, expires_at)
    VALUES (?, ?, ?, ?)
    """, (token, user_id, now.isoformat(), expires.isoformat()))
    conn.commit()
    conn.close()
    return token

def get_session_user(token: str) -> Optional[Dict[str, Any]]:
    """Validates session token and returns associated user profile if unexpired."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT s.token, s.expires_at, u.id, u.username, u.email, u.full_name, u.role, u.department, u.created_at, u.last_login
    FROM user_sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ?
    """, (token,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    session_dict = dict(row)
    expires_at = datetime.fromisoformat(session_dict["expires_at"])
    if datetime.now() > expires_at:
        delete_session(token)
        return None
    return {
        "id": session_dict["id"],
        "username": session_dict["username"],
        "email": session_dict["email"],
        "full_name": session_dict["full_name"],
        "role": session_dict["role"],
        "department": session_dict["department"],
        "created_at": session_dict["created_at"],
        "last_login": session_dict["last_login"]
    }

def delete_session(token: str):
    """Invalidates and deletes a session token."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM user_sessions WHERE token = ?", (token,))
    conn.commit()
    conn.close()

# -------------------------------------------------------------
# Prediction Persistence
# -------------------------------------------------------------

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
    raw_input: dict,
    user_id: Optional[int] = None
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
            raw_input_json,
            user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        json.dumps(raw_input),
        user_id
    ))
    record_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return record_id

def get_recent_predictions(limit: int = 50, user_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """Retrieves the most recent predictions ordered by latest first."""
    conn = get_db_connection()
    cursor = conn.cursor()
    if user_id is not None:
        cursor.execute("""
            SELECT * FROM prediction_history WHERE user_id = ? ORDER BY id DESC LIMIT ?
        """, (user_id, limit))
    else:
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

def get_prediction_by_id(prediction_id: int) -> Optional[Dict[str, Any]]:
    """Retrieves a single prediction by its primary ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM prediction_history WHERE id = ?", (prediction_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    item = dict(row)
    try:
        item["raw_input_json"] = json.loads(item["raw_input_json"]) if item["raw_input_json"] else {}
    except Exception:
        pass
    return item

def clear_prediction_history(user_id: Optional[int] = None):
    """Clears prediction records, optionally filtered by user_id."""
    conn = get_db_connection()
    cursor = conn.cursor()
    if user_id is not None:
        cursor.execute("DELETE FROM prediction_history WHERE user_id = ?", (user_id,))
    else:
        cursor.execute("DELETE FROM prediction_history")
    conn.commit()
    conn.close()
