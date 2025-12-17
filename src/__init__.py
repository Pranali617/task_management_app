from fastapi import FastAPI
from src.auth.routes import auth_router
from src.db.main import init_db
from src.users.routes import user_router
from src.tasks.routes import task_router
from .errors import register_all_errors
from .middleware import register_middleware
def init_db():
    print("Server started")
    init_db()
    yield
    print("Server stopped")

version="v1"
app=FastAPI(
    version=version,
    title="Task Delegation & Collaboration API",
    description="Task Delegation & Collaboration API"
)
register_all_errors(app)
register_middleware(app)

app.include_router(auth_router,prefix=f"/api/{version}/auth",tags=["auth"])
app.include_router(user_router,prefix=f"/api/{version}/user",tags=["user"])
app.include_router(task_router,prefix=f"/api/{version}/task",tags=["task"])



