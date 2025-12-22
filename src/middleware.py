from fastapi import FastAPI
from fastapi.requests import Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
def register_middleware(app:FastAPI):

    
    app.add_middleware(CORSMiddleware,
            allow_origins=["https://task-collab-frontend.onrender.com","http://localhost:3000"],
            allow_methods=["*"],
            allow_headers=["*"],
            allow_credentials=True,  
                        )

    app.add_middleware(TrustedHostMiddleware,
                        allowed_hosts=[
    "task-management-api-x1xo.onrender.com",
    "*.onrender.com",
    "localhost",
    "127.0.0.1"
]
)