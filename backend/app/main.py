"""
Ponto de entrada da aplicação FastAPI
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# Criação da aplicação FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Plataforma full-stack para digitalização e automação de TODOS os processos tributários, fiscais, de arrecadação e contenciosos do município.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """
    Endpoint raiz - Informações da API
    """
    return {
        "aplicacao": settings.APP_NAME,
        "versao": settings.APP_VERSION,
        "status": "online",
        "documentacao": "/docs"
    }


@app.get("/health")
async def health_check():
    """
    Health check da aplicação
    """
    return {
        "status": "healthy",
        "ambiente": settings.ENVIRONMENT
    }


# TODO: Importar e incluir routers dos módulos
# from app.api import cadastros, tributario, arrecadacao, ...
# app.include_router(cadastros.router)
# app.include_router(tributario.router)
# ...


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
