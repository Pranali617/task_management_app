from pydantic import BaseModel,Field
import uuid
from datetime import datetime
from typing import List
class UserCreateModel(BaseModel):
   username:str
   email:str
   firstname:str
   lastname:str
   password:str
   role:str="user"

class UserModel(BaseModel):
   uid:uuid.UUID
   username:str
   email:str
   firstname:str
   lastname:str
   is_verified:bool
   role:str
   password_hash:str=Field(exclude=True)
   created_at:datetime
   updated_at:datetime

class UserLoginModel(BaseModel):
   email:str
   password:str

class EmailSchema(BaseModel):
   addresses:List[str]

class PasswordResetSchema(BaseModel):
   email:str

class PasswordResetConfirmSchema(BaseModel):
   new_password:str
   confirm_password:str
      
