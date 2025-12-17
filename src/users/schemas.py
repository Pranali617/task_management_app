from pydantic import BaseModel
import uuid

class UserResponse(BaseModel):
    uid: uuid.UUID
    username: str
    email: str
    firstname: str
    lastname: str
    role: str

