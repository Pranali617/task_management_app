from fastapi import APIRouter,Depends,HTTPException,status
from src.auth.dependencies import RoleChecker
from .schemas import TaskCreateSchema,TaskResponseSchema,TaskUpdateSchema
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.main import get_session
from src.auth.dependencies import AccessTokenBearer
from .service import TaskService
from typing import Optional
from src.errors import TaskNotFound
from src.auth.service import AuthService
task_router=APIRouter()
task_service=TaskService()
auth_service=AuthService()
role_checker = Depends(RoleChecker(["admin"]))


@task_router.post("/tasks/", response_model=TaskResponseSchema, dependencies=[role_checker])
async def create_task(
    task_data: TaskCreateSchema,
    session: AsyncSession = Depends(get_session),
    token_details: dict = Depends(AccessTokenBearer())
):
    user_uid = token_details["user"]["user_uid"]

    task = await task_service.create_task(task_data, user_uid, session)

    assigned_email = None
    assigned_name = None

    if task.assigned_to:
        user = await auth_service.get_user_by_uid(task.assigned_to, session)
        if user:
            assigned_email = user.email
            assigned_name = user.firstname

    return {
        **task.model_dump(),
        "assigned_to": assigned_email,
        "assigned_to_name": assigned_name
    }

@task_router.get("/tasks/", response_model=list[TaskResponseSchema])
async def get_tasks(
    session: AsyncSession = Depends(get_session),
    token_details: dict = Depends(AccessTokenBearer()),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assigned_to: Optional[str] = None,
    limit: int = 10,
    offset: int = 0
):
    user_uid = token_details["user"]["user_uid"]
    user_role = token_details["user"].get("role", "user")
    is_admin = user_role == "admin"

    tasks = await task_service.get_tasks(
        session=session,
        user_uid=user_uid,
        is_admin=is_admin,
        status=status,
        priority=priority,
        assigned_to=assigned_to,
        limit=limit,
        offset=offset
    )
    
    return tasks

@task_router.get("/task/{task_id}",response_model=TaskResponseSchema)
async def get_task_by_id(task_id:str,session:AsyncSession=Depends(get_session), token_details: dict = Depends(AccessTokenBearer())):
    user_uid = token_details["user"]["user_uid"]
    user_role = token_details["user"].get("role", "user")
    is_admin = user_role == "admin"

    task=await task_service.get_task_by_id(
        task_id=task_id,
        session=session,
        user_uid=user_uid,
        is_admin=is_admin
    )

    return task

@task_router.patch("/tasks/{task_id}")
async def update_task(task_id:str,task_update_data:TaskUpdateSchema,session:AsyncSession=Depends(get_session),token_details:dict=Depends(AccessTokenBearer())):
    
    updated_task=await task_service.update_task(task_id,task_update_data,session)
    if updated_task:
        return updated_task
    else:
        return TaskNotFound()


@task_router.delete("/tasks/{task_id}", status_code=204)
async def delete_task(
    task_id: str,
    session: AsyncSession = Depends(get_session),
    token_details: dict = Depends(AccessTokenBearer())
):
    user_uid = token_details["user"]["user_uid"]
    user_role = token_details["user"].get("role", "user")
    is_admin = user_role == "admin"

    await task_service.delete_task(task_id, session, user_uid, is_admin)
