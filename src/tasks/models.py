from sqlmodel import SQLModel,Field,Column
from datetime import datetime,date
import uuid
import sqlalchemy.dialects.postgresql as pg
from src.tasks.utils import TaskStatus, TaskPriority
from sqlalchemy import ForeignKey   

class Tasks(SQLModel, table=True):
    __tablename__ = "tasks"

    uid: uuid.UUID = Field(
        sa_column=Column(pg.UUID, primary_key=True, nullable=False, default=uuid.uuid4)
    )

    title: str
    description: str

    status: TaskStatus = Field(default=TaskStatus.pending)
    priority: TaskPriority = Field(default=TaskPriority.medium)

    due_date:date

    created_by: uuid.UUID = Field(
        sa_column=Column(pg.UUID, ForeignKey("users.uid", ondelete="CASCADE"))
    )

    assigned_to: uuid.UUID | None = Field(
        sa_column=Column(pg.UUID, ForeignKey("users.uid", ondelete="SET NULL")),
        default=None
    )

    created_at:datetime=Field(sa_column=Column(pg.TIMESTAMP,default=datetime.now))
    updated_at:datetime=Field(sa_column=Column(pg.TIMESTAMP,default=datetime.now))
