from .models import Tasks
from .schemas import TaskCreateSchema,TaskUpdateSchema
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.main import get_session
from typing import Optional
from sqlmodel import select
from .utils import TaskPriority,TaskStatus
from fastapi import HTTPException,status
from src.auth.service import AuthService
from src.mail import mail,create_message


auth_service=AuthService()

class TaskService:
    async def create_task(self, task_data: TaskCreateSchema, user_uid: str, session: AsyncSession):
        task_data_dict = task_data.model_dump()
        
        # Handle assigned_to email conversion
        assigned_to_uid = None
        if task_data_dict.get('assigned_to'):
            email = task_data_dict['assigned_to']
            user = await auth_service.get_user_by_email(email, session)
            if not user:
                raise HTTPException(
                    status_code=400,
                    detail=f"User with email {email} not found"
                )
            assigned_to_uid = user.uid
        
        # Remove email from dict (model expects UUID)
        task_data_dict.pop('assigned_to', None)
        
        # Create task
        new_task = Tasks(
            **task_data_dict,
            created_by=user_uid,
            assigned_to=assigned_to_uid
        )

        session.add(new_task)
        await session.commit()
        await session.refresh(new_task)

        if assigned_to_uid:
            await self.send_assignment_email(new_task, assigned_to_uid, session)

        return new_task

    
    async def get_tasks(
        self,
        session: AsyncSession,
        user_uid: str,
        is_admin: bool,
        status: Optional[TaskStatus] = None,
        priority: Optional[TaskPriority] = None,
        assigned_to: Optional[str] = None,
        limit: int = 10,
        offset: int = 0
    ):
        query = select(Tasks)

        # if not admin → show only user-created tasks or assigned tasks
        if not is_admin:
            query = query.where((Tasks.created_by == user_uid) | (Tasks.assigned_to == user_uid))

        # Filters
        if status:
            query = query.where(Tasks.status == status)

        if priority:
            query = query.where(Tasks.priority == priority)

        if assigned_to:
            # Convert email to UUID for filtering
            user = await auth_service.get_user_by_email(assigned_to, session)
            if user:
                query = query.where(Tasks.assigned_to == user.uid)


        query = query.limit(limit).offset(offset)

        result = await session.exec(query)
        tasks= result.all()
         # Convert tasks to response format with email strings
        response_tasks = []
        for task in tasks:
            task_dict = task.model_dump()
            
            # Convert assigned_to UUID to email string
            if task.assigned_to:
                user = await auth_service.get_user_by_uid(task.assigned_to, session)
                if user:
                    task_dict['assigned_to'] = user.email
                    task_dict['assigned_to_name'] = user.firstname
                else:
                    task_dict['assigned_to'] = None
                    task_dict['assigned_to_name'] = None
            
            response_tasks.append(task_dict)
        
        return response_tasks

    
    async def get_task_by_id(self,task_id:str,session:AsyncSession,user_uid:str,is_admin:bool):
        statement=select(Tasks).where(Tasks.uid==task_id)
        result=await session.exec(statement)
        task=result.first()
        if not task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail={"Task not found"})
        
        if not is_admin and task.created_by!=user_uid and task.assigned_to!=user_uid:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail={"You are not authorized to view this task"})
        return task
    async def get_task_by_id(self,task_id:str,session:AsyncSession):
        statement=select(Tasks).where(Tasks.uid==task_id)
        result=await session.exec(statement)
        task=result.first()
        if task:
            return task
    async def update_task(self, task_id: str, task_data: TaskUpdateSchema, session: AsyncSession):
        task = await self.get_task_by_id(task_id, session)
        if not task:
            return None

        old_assigned_to = task.assigned_to
        update_data = task_data.model_dump(exclude_unset=True)

        # 🔧 CRITICAL FIX: Convert email to UUID if assigned_to is provided
        if 'assigned_to' in update_data:
            assigned_email = update_data['assigned_to']
            if assigned_email:
                # Convert email to UUID
                user = await auth_service.get_user_by_email(assigned_email, session)
                if not user:
                    raise HTTPException(
                        status_code=400,
                        detail=f"User with email {assigned_email} not found"
                    )
                update_data['assigned_to'] = user.uid  # Store UUID
            else:
                # If empty string, set to None
                update_data['assigned_to'] = None

        # Update task fields
        for key, value in update_data.items():
            setattr(task, key, value)

        await session.commit()
        await session.refresh(task)

        # 🔔 EMAIL TRIGGER LOGIC
        new_assigned_to = update_data.get("assigned_to")
        if "assigned_to" in update_data and new_assigned_to != old_assigned_to:
            if new_assigned_to is not None:
                await self.send_assignment_email(task, new_assigned_to, session)

        return task
        
    async def delete_task(
        self,
        task_id: str,
        session: AsyncSession,
        user_uid: str,
        is_admin: bool
    ):
        task = await self.get_task_by_id(task_id, session)

        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        if not is_admin and task.created_by != user_uid:
            raise HTTPException(status_code=403, detail="Not allowed")

        await session.delete(task)
        await session.commit()

    async def send_assignment_email(self, task, user_uid: str, session: AsyncSession):
        user = await auth_service.get_user_by_uid(user_uid,session)

        if not user:
            return

        html = f"""
        <h2>New Task Assigned</h2>
        <p>Hello {user.firstname},</p>
        <p>You have been assigned a new task:</p>
        <ul>
            <li><b>Title:</b> {task.title}</li>
            <li><b>Due Date:</b> {task.due_date}</li>
            <li><b>Status:</b> {task.status}</li>
        </ul>
        """

        message = create_message(
            recipients=[user.email],
            subject="You have been assigned a task",
            body=html
        )

        await mail.send_message(message)