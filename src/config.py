from pydantic_settings import BaseSettings,SettingsConfigDict

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
TEMPLATE_FOLDER = BASE_DIR / "templates"


class Settings(BaseSettings):
    DATABASE_URL:str
    JWT_SECRET:str
    JWT_ALGORITHM:str
    REDIS_HOST:str="localhost"
    REDIS_PORT:int=6379
    model_config=SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_PORT: int
    MAIL_SERVER: str
    MAIL_STARTTLS: bool
    MAIL_SSL_TLS: bool
    MAIL_FROM: str
    MAIL_FROM_NAME:str
    USE_CREDENTIALS: bool = True
    VALIDATE_CERTS: bool = True
    DOMAIN:str



Config=Settings()