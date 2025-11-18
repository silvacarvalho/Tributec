"""
Configurações centralizadas da aplicação
"""
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Configurações da aplicação"""

    # Aplicação
    APP_NAME: str = "Sistema de Gestão Tributária Municipal - Tributec"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"

    # Banco de Dados
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    DB_ECHO: bool = False

    # Segurança
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0

    # Celery
    CELERY_BROKER_URL: str = Field(..., env="CELERY_BROKER_URL")
    CELERY_RESULT_BACKEND: str = Field(..., env="CELERY_RESULT_BACKEND")

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # Parâmetros Fiscais
    UFM_VALOR: float = 14.01
    UFM_ANO: int = 2024

    # Upload
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB
    UPLOAD_DIR: str = "/app/uploads"

    # Email
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = ""

    # PIX
    PIX_API_URL: str = ""
    PIX_CLIENT_ID: str = ""
    PIX_CLIENT_SECRET: str = ""

    # Certificado Digital
    CERT_A1_PATH: str = ""
    CERT_A1_PASSWORD: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True


# Instância global de configurações
settings = Settings()
