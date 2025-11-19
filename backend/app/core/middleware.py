"""
Middlewares da aplicação
"""
import time
import uuid
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from app.core.logging import performance_logger, logger


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware para logging de requisições HTTP
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Processa requisição e adiciona logging
        """
        # Gerar ID único para a requisição
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        # Registrar início da requisição
        start_time = time.time()

        # Log de início
        logger.info(
            f"Iniciando requisição: {request.method} {request.url.path}",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "query_params": str(request.query_params),
                "client_host": request.client.host if request.client else None,
            },
        )

        # Processar requisição
        try:
            response = await call_next(request)

            # Calcular duração
            duration_ms = (time.time() - start_time) * 1000

            # Obter user_id se existir (de auth)
            user_id = getattr(request.state, "user_id", None)

            # Log de performance
            performance_logger.log_request(
                method=request.method,
                path=request.url.path,
                status_code=response.status_code,
                duration_ms=duration_ms,
                user_id=user_id,
            )

            # Adicionar headers customizados
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Process-Time"] = f"{duration_ms:.2f}ms"

            return response

        except Exception as e:
            # Log de erro
            duration_ms = (time.time() - start_time) * 1000
            logger.error(
                f"Erro na requisição: {request.method} {request.url.path}",
                extra={
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "duration_ms": duration_ms,
                    "error": str(e),
                },
                exc_info=True,
            )
            raise


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware para adicionar headers de segurança
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Adiciona headers de segurança na resposta
        """
        response = await call_next(request)

        # Headers de segurança
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )

        return response
