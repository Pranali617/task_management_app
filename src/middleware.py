from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

def register_middleware(app: FastAPI):
    # Option 1: Allow all origins for testing (then restrict for production)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Temporarily allow all for testing
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Option 2: Or use regex pattern for origins
    # app.add_middleware(
    #     CORSMiddleware,
    #     allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|task-collab.*\.onrender\.com):?\d*",
    #     allow_credentials=True,
    #     allow_methods=["*"],
    #     allow_headers=["*"],
    # )