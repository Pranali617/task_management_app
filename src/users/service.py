from src.auth.models import User
from .schemas import UserResponse
from sqlmodel import select,desc
from sqlmodel.ext.asyncio.session import AsyncSession
from src.auth.service import AuthService
auth_service=AuthService()
class UserService:
    async def get_all_users(self,session:AsyncSession):
        statement=select(User).order_by(desc(User.created_at))
        result=await session.exec(statement)

        return result.all()

    async def get_own_profile(self,user_details:User,session:AsyncSession):
        email=user_details.email
        user=await auth_service.get_user_by_email(email,session)
        return user
    

    async def get_user_by_id(self,uid:str,session:AsyncSession):
        
        statement=select(User).where(User.uid==uid)

        result=await session.exec(statement)
        user= result.first()
        return user
        