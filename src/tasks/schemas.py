from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid
from datetime import datetime, date

class TaskCreateSchema(BaseModel):
    title: str
    description: str
    priority: str = "medium"  # Accept string directly
    due_date: date
    assigned_to: Optional[EmailStr] = None  # Accept email instead of UUID
    status: str = "pending"  # Add default status

class TaskUpdateSchema(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[date] = None
    assigned_to: Optional[EmailStr] = None

class TaskResponseSchema(BaseModel):
    uid: uuid.UUID
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    due_date: Optional[date] = None
    assigned_to: Optional[str] = None  # Email as string
    assigned_to_name: Optional[str] = None  # Optional: user's name
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime