from fastapi import APIRouter,Depends,HTTPException,status
from fastapi.responses import JSONResponse
from .schemas import UserCreateModel,UserModel,UserLoginModel,EmailSchema,PasswordResetSchema,PasswordResetConfirmSchema
from .service import AuthService
from src.db.main import get_session
from sqlmodel.ext.asyncio.session import AsyncSession
from .utils import create_access_token,decode_token,verify_password,create_url_safe_token,decode_url_safe_token,generate_password_hash
from datetime import timedelta,datetime
from fastapi.responses import JSONResponse
from .dependencies import RefreshTokenBearer,AccessTokenBearer,get_current_user,RoleChecker
from src.db.redis import add_jti_to_blocklist
from src.mail import mail,create_message
from src.config import Config
from src.errors import UserNotFound,InvalidCredentials,InsufficientPermission,InvalidToken,RefreshTokenRequired

auth_router=APIRouter()
user_service=AuthService()
role_checker=RoleChecker(['admin','user'])


REFRESH_TOKEN_EXPIRY=2

@auth_router.post("/send_mail")
async def send_mail(emails:EmailSchema):
    emails=emails.addresses
    html="<h1>welcome to Task Collabration App</h1>"
    message=create_message(
        recipients=emails,
        subject="Welcome",
        body=html
    )
    await mail.send_message(message)
    return {"message":"Email sent successfully"}

@auth_router.post("/signup",status_code=status.HTTP_201_CREATED)
async def create_user(user_data:UserCreateModel,session:AsyncSession=Depends(get_session)):
    email=user_data.email

    user_exists=await user_service.user_exists(email,session)
    if user_exists:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="User with email already exists")
    new_user=await user_service.create_user(user_data,session)
    token=create_url_safe_token({"email":email})
    link=f"http://{Config.DOMAIN}/api/v1/auth/verify/{token}"
    html_message=f"""<h1>Verify your email</h1><p>Please click this <a href='{link}'>link</a> to verify your email"""
    message=create_message(recipients=[email],subject="Verify Your Email",body=html_message)
    await mail.send_message(message)
    return {"message":"Account created! Check email to verify your account",
            "user":new_user
            }

@auth_router.get("/verify/{token}")
async def verify_user_account(token:str,session:AsyncSession=Depends(get_session)):
    token_data=decode_url_safe_token(token)
    user_email=token_data.get('email')
    if user_email:
        user=await user_service.get_user_by_email(user_email,session)
        if not user:
            raise UserNotFound()
        await user_service.update_user(user,{'is_verified':True},session)

        return JSONResponse(content={
            "message":"Account has been successfully verified",
            
        },
        status_code=status.HTTP_200_OK)
    return JSONResponse(content={"message":"Error occured during verification"},status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@auth_router.post("/login")
async def login_users(
    login_data: UserLoginModel, session: AsyncSession = Depends(get_session)
):
    email = login_data.email
    password = login_data.password

    user = await user_service.get_user_by_email(email, session)

    if user is not None:
        password_valid = verify_password(password, user.password_hash)

        if password_valid:
            access_token = create_access_token(
                user_data={"email": user.email, "user_uid": str(user.uid),"role":user.role}
            )

            refresh_token = create_access_token(
                user_data={"email": user.email, "user_uid": str(user.uid)},
                refresh=True,
                expiry=timedelta(days=REFRESH_TOKEN_EXPIRY),
            )

            return JSONResponse(
                content={
                    "message": "Login successful",
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                    "user": {"email": user.email, "uid": str(user.uid)},
                }
            )

    raise InvalidCredentials()

@auth_router.get("/refresh_token")
async def get_new_access_token(token_details:dict=Depends(RefreshTokenBearer())):
    expiry_timestamp=token_details['exp']
    print(expiry_timestamp)
    if datetime.fromtimestamp(expiry_timestamp)>datetime.now():
        new_access_token=create_access_token(user_data=token_details['user'])
        return JSONResponse(content={
            "access_token":new_access_token
        })
    return InvalidToken()

@auth_router.get("/me")
async def get_current_user(user=Depends(get_current_user),_:bool=Depends(role_checker)):
    return user

@auth_router.get("/logout")
async def revoke_token(token_details:dict=Depends(AccessTokenBearer())):
    jti=token_details['jti']
    await add_jti_to_blocklist(jti)

    return JSONResponse(content={"message":"Logout successfully"},status_code=status.HTTP_200_OK)

"""
1.provide the email ->pasword reset request
2.send password reset link
3.reset password-> password  reset confirm
"""
@auth_router.post('/password-reset-request')
async def password_reset_request(email_data:PasswordResetSchema,session: AsyncSession = Depends(get_session)):
    email=email_data.email
 
    token=create_url_safe_token({"email":email})
   # In your password-reset-request endpoint
    link = f"http://localhost:3000/reset-password/{token}"  # Match your frontend route  # or your frontend domain
    html_message=f"""<h1>Reset Your Password</h1><p>Please click this <a href='{link}'>link</a> to Reset your password"""
    message=create_message(recipients=[email],subject="Reset Your Password",body=html_message)
    await mail.send_message(message)
    return JSONResponse(content={"message":"Please checj your email for instructionsto reset password",
            },status_code=status.HTTP_200_OK)



@auth_router.post("/password-reset-confirm/{token}")
async def reset_account_password(token:str,passwords:PasswordResetConfirmSchema,session:AsyncSession=Depends(get_session)):
    new_password=passwords.new_password
    confirm_password=passwords.confirm_password
    if new_password!=confirm_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="Password do not match")
    token_data=decode_url_safe_token(token)
    user_email=token_data.get('email')
    if user_email:
        user=await user_service.get_user_by_email(user_email,session)
        if not user:
            raise UserNotFound()
        password_hash=generate_password_hash(new_password)
        await user_service.update_user(user,{'password_hash':password_hash},session)

        return JSONResponse(content={
            "message":"Password has been successfully verified",
            
        },
        status_code=status.HTTP_200_OK)
    return JSONResponse(content={"message":"Error occured during password reset"},status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)