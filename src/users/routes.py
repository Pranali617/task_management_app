from fastapi import APIRouter,Depends,HTTPException,status
from src.db.main import get_session
from sqlmodel.ext.asyncio.session import AsyncSession
from .service import UserService
from .schemas import UserResponse
from src.auth.dependencies import RoleChecker,AccessTokenBearer,get_current_user
from typing import List

user_router=APIRouter()
user_service=UserService()
role_checker = Depends(RoleChecker(["admin"]))

@user_router.get("/users/",response_model=List[UserResponse],dependencies=[role_checker])
async def get_all_users(session:AsyncSession=Depends(get_session),token_details:dict=Depends(AccessTokenBearer())):
    users=await user_service.get_all_users(session)

    return users


@user_router.get("/users/me")
async def get_own_profile(user=Depends(get_current_user)):
    return user

@user_router.get("/users/{uid}",dependencies=[role_checker])
async def get_user_by_id(user_uid:str,session:AsyncSession=Depends(get_session),token_details:dict=Depends(AccessTokenBearer())):
    user=await user_service.get_user_by_id(user_uid,session)
    return user