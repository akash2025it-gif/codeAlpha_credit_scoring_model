"""
Authentication and User Account Management Router.
Provides registration, login, profile retrieval, and session verification.
"""

import re
from typing import Optional
from fastapi import APIRouter, HTTPException, Header, status, Depends
from pydantic import BaseModel, Field, field_validator

from database import (
    create_user,
    get_user_by_username,
    get_user_by_email,
    get_user_by_id,
    verify_password,
    update_user_last_login,
    update_user_profile,
    update_user_password,
    create_session,
    get_session_user,
    delete_session
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

def validate_email_format(email: str) -> str:
    cleaned = email.strip().lower()
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    if not re.match(pattern, cleaned):
        raise ValueError("Invalid email address format.")
    return cleaned

class UserRegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=30, description="Unique username")
    email: str = Field(description="Valid email address")
    password: str = Field(min_length=6, max_length=100, description="Password (min 6 characters)")
    full_name: str = Field(min_length=2, max_length=60, description="Full name")
    role: Optional[str] = Field(default="Credit Risk Analyst")
    department: Optional[str] = Field(default="Underwriting & Risk")

    @field_validator("email")
    @classmethod
    def check_email(cls, v: str) -> str:
        return validate_email_format(v)

class UserLoginRequest(BaseModel):
    username_or_email: str = Field(description="Username or Email")
    password: str = Field(description="Password")

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str
    department: str
    created_at: str
    last_login: Optional[str] = None

class AuthResponse(BaseModel):
    token: str
    user: UserResponse
    message: str

class UpdateProfileRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=60)
    email: str
    department: Optional[str] = Field(default="Underwriting & Risk")

    @field_validator("email")
    @classmethod
    def check_email(cls, v: str) -> str:
        return validate_email_format(v)

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6, max_length=100)

# -------------------------------------------------------------
# Dependency: Extract Current User from Bearer Token
# -------------------------------------------------------------

def get_current_user_optional(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    """Extracts authenticated user from Authorization header if present."""
    if not authorization:
        return None
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    token = parts[1]
    return get_session_user(token)

def get_current_user_required(authorization: Optional[str] = Header(None)) -> dict:
    """Enforces authentication and returns user or raises 401 Unauthorized."""
    user = get_current_user_optional(authorization)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Valid authentication token required. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return user

# -------------------------------------------------------------
# Endpoints
# -------------------------------------------------------------

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(req: UserRegisterRequest):
    """Registers a new user account and creates an authenticated session."""
    # Check if username exists
    if get_user_by_username(req.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Username '{req.username}' is already registered. Please choose another."
        )
    # Check if email exists
    if get_user_by_email(req.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email '{req.email}' is already registered. Please sign in."
        )

    user = create_user(
        username=req.username,
        email=req.email,
        password=req.password,
        full_name=req.full_name,
        role=req.role or "Credit Risk Analyst",
        department=req.department or "Underwriting & Risk"
    )
    token = create_session(user["id"])
    update_user_last_login(user["id"])
    return AuthResponse(
        token=token,
        user=UserResponse(**user),
        message="Registration successful. Welcome to CrediScore AI."
    )

@router.post("/login", response_model=AuthResponse)
def login(req: UserLoginRequest):
    """Authenticates user with username or email and password."""
    identifier = req.username_or_email.strip()
    user = get_user_by_username(identifier) or get_user_by_email(identifier)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username/email or password."
        )
    
    if not verify_password(req.password, user["password_hash"], user["salt"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username/email or password."
        )

    token = create_session(user["id"])
    update_user_last_login(user["id"])
    user["last_login"] = user.get("last_login")
    return AuthResponse(
        token=token,
        user=UserResponse(
            id=user["id"],
            username=user["username"],
            email=user["email"],
            full_name=user["full_name"],
            role=user["role"],
            department=user.get("department", "Underwriting & Risk"),
            created_at=user["created_at"],
            last_login=user.get("last_login")
        ),
        message="Login successful."
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(user: dict = Depends(get_current_user_required)):
    """Returns the profile of the currently signed-in user."""
    return UserResponse(**user)

@router.put("/profile", response_model=UserResponse)
def update_profile(req: UpdateProfileRequest, user: dict = Depends(get_current_user_required)):
    """Updates user full name, email, and department."""
    # If email changed, check for conflict
    if req.email.lower() != user["email"].lower():
        existing = get_user_by_email(req.email)
        if existing and existing["id"] != user["id"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email '{req.email}' is already in use by another account."
            )

    updated = update_user_profile(
        user_id=user["id"],
        full_name=req.full_name,
        email=req.email,
        department=req.department or user.get("department", "Underwriting & Risk")
    )
    return UserResponse(**updated)

@router.post("/change-password")
def change_password(req: ChangePasswordRequest, user: dict = Depends(get_current_user_required)):
    """Changes password after verifying current password."""
    full_user = get_user_by_username(user["username"])
    if not full_user or not verify_password(req.current_password, full_user["password_hash"], full_user["salt"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect."
        )
    update_user_password(user["id"], req.new_password)
    return {"status": "success", "message": "Password changed successfully."}

@router.post("/logout")
def logout(authorization: Optional[str] = Header(None)):
    """Invalidates current user session token."""
    if authorization:
        parts = authorization.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            delete_session(parts[1])
    return {"status": "success", "message": "Logged out successfully."}
