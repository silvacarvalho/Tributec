"""
Sistema de logs estruturado
Configuração centralizada de logging para toda a aplicação
"""
import logging
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict
import json

from app.core.config import settings


class JSONFormatter(logging.Formatter):
    """
    Formatter customizado para logs em formato JSON
    """

    def format(self, record: logging.LogRecord) -> str:
        """Formata o log em JSON"""
        log_data: Dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Adicionar informações extras se existirem
        if hasattr(record, "user_id"):
            log_data["user_id"] = record.user_id

        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id

        if hasattr(record, "ip_address"):
            log_data["ip_address"] = record.ip_address

        # Adicionar informações de exceção se existirem
        if record.exc_info:
            log_data["exception"] = {
                "type": record.exc_info[0].__name__,
                "message": str(record.exc_info[1]),
                "traceback": self.formatException(record.exc_info),
            }

        # Adicionar dados extras customizados
        if hasattr(record, "extra_data"):
            log_data["extra"] = record.extra_data

        return json.dumps(log_data, ensure_ascii=False)


class ColoredFormatter(logging.Formatter):
    """
    Formatter com cores para terminal
    """

    # Códigos de cores ANSI
    COLORS = {
        "DEBUG": "\033[36m",  # Ciano
        "INFO": "\033[32m",  # Verde
        "WARNING": "\033[33m",  # Amarelo
        "ERROR": "\033[31m",  # Vermelho
        "CRITICAL": "\033[35m",  # Magenta
        "RESET": "\033[0m",  # Reset
    }

    def format(self, record: logging.LogRecord) -> str:
        """Formata o log com cores"""
        # Adicionar cor ao level name
        levelname = record.levelname
        if levelname in self.COLORS:
            record.levelname = (
                f"{self.COLORS[levelname]}{levelname}{self.COLORS['RESET']}"
            )

        # Formatar mensagem
        formatted = super().format(record)

        return formatted


def setup_logging():
    """
    Configura o sistema de logging da aplicação
    """
    # Criar diretório de logs se não existir
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)

    # Configurar logger raiz
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)

    # Remover handlers existentes
    root_logger.handlers.clear()

    # Handler para console (desenvolvimento)
    if settings.DEBUG:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.DEBUG)
        console_formatter = ColoredFormatter(
            fmt="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        console_handler.setFormatter(console_formatter)
        root_logger.addHandler(console_handler)

    # Handler para arquivo - logs gerais (JSON)
    file_handler = logging.FileHandler(
        log_dir / "tributec.log", encoding="utf-8"
    )
    file_handler.setLevel(logging.INFO)
    json_formatter = JSONFormatter()
    file_handler.setFormatter(json_formatter)
    root_logger.addHandler(file_handler)

    # Handler para arquivo - apenas erros (JSON)
    error_handler = logging.FileHandler(
        log_dir / "errors.log", encoding="utf-8"
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(json_formatter)
    root_logger.addHandler(error_handler)

    # Handler para arquivo - auditoria (JSON)
    audit_handler = logging.FileHandler(
        log_dir / "audit.log", encoding="utf-8"
    )
    audit_handler.setLevel(logging.INFO)
    audit_handler.setFormatter(json_formatter)
    # Filtrar apenas logs do módulo de auditoria
    audit_handler.addFilter(lambda record: "audit" in record.name.lower())
    root_logger.addHandler(audit_handler)

    # Configurar loggers específicos
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("fastapi").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.INFO if settings.DB_ECHO else logging.WARNING
    )

    # Logger da aplicação
    app_logger = logging.getLogger("app")
    app_logger.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)

    return app_logger


class AuditLogger:
    """
    Logger especializado para auditoria de operações
    """

    def __init__(self):
        self.logger = logging.getLogger("app.audit")

    def log_operation(
        self,
        operation: str,
        user_id: str,
        resource_type: str,
        resource_id: str,
        action: str,
        status: str,
        details: Dict[str, Any] = None,
        ip_address: str = None,
    ):
        """
        Registra uma operação para auditoria

        Args:
            operation: Nome da operação (ex: "CRIAR_PESSOA", "LANCAR_IPTU")
            user_id: ID do usuário que executou a operação
            resource_type: Tipo do recurso (ex: "PESSOA", "IMOVEL", "LANCAMENTO_IPTU")
            resource_id: ID do recurso afetado
            action: Ação realizada (CREATE, READ, UPDATE, DELETE)
            status: Status da operação (SUCCESS, FAILED)
            details: Detalhes adicionais da operação
            ip_address: Endereço IP do usuário
        """
        log_data = {
            "audit_type": "OPERATION",
            "operation": operation,
            "user_id": user_id,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "action": action,
            "status": status,
            "timestamp": datetime.utcnow().isoformat(),
        }

        if details:
            log_data["details"] = details

        if ip_address:
            log_data["ip_address"] = ip_address

        extra = {"extra_data": log_data}
        self.logger.info(f"Auditoria: {operation}", extra=extra)

    def log_login(self, user_id: str, email: str, success: bool, ip_address: str = None):
        """Registra tentativa de login"""
        self.log_operation(
            operation="LOGIN",
            user_id=user_id if success else "UNKNOWN",
            resource_type="AUTH",
            resource_id=email,
            action="LOGIN",
            status="SUCCESS" if success else "FAILED",
            details={"email": email},
            ip_address=ip_address,
        )

    def log_data_change(
        self,
        user_id: str,
        resource_type: str,
        resource_id: str,
        old_value: Any,
        new_value: Any,
        field: str,
    ):
        """Registra alteração de dados"""
        self.log_operation(
            operation="DATA_CHANGE",
            user_id=user_id,
            resource_type=resource_type,
            resource_id=resource_id,
            action="UPDATE",
            status="SUCCESS",
            details={
                "field": field,
                "old_value": str(old_value),
                "new_value": str(new_value),
            },
        )


class PerformanceLogger:
    """
    Logger especializado para monitoramento de performance
    """

    def __init__(self):
        self.logger = logging.getLogger("app.performance")

    def log_request(
        self,
        method: str,
        path: str,
        status_code: int,
        duration_ms: float,
        user_id: str = None,
    ):
        """
        Registra métricas de uma requisição HTTP

        Args:
            method: Método HTTP (GET, POST, etc)
            path: Caminho da requisição
            status_code: Código de status HTTP
            duration_ms: Duração em milissegundos
            user_id: ID do usuário (se autenticado)
        """
        log_data = {
            "performance_type": "HTTP_REQUEST",
            "method": method,
            "path": path,
            "status_code": status_code,
            "duration_ms": duration_ms,
            "timestamp": datetime.utcnow().isoformat(),
        }

        if user_id:
            log_data["user_id"] = user_id

        extra = {"extra_data": log_data}

        # Log como warning se a requisição demorou muito
        if duration_ms > 5000:  # Mais de 5 segundos
            self.logger.warning(
                f"Requisição lenta: {method} {path} ({duration_ms}ms)",
                extra=extra,
            )
        else:
            self.logger.info(
                f"Requisição: {method} {path} ({duration_ms}ms)",
                extra=extra,
            )

    def log_query(self, query: str, duration_ms: float, rows_affected: int = None):
        """
        Registra métricas de uma query SQL

        Args:
            query: Query SQL (resumida)
            duration_ms: Duração em milissegundos
            rows_affected: Número de linhas afetadas
        """
        log_data = {
            "performance_type": "DATABASE_QUERY",
            "query": query[:200],  # Primeiros 200 caracteres
            "duration_ms": duration_ms,
            "timestamp": datetime.utcnow().isoformat(),
        }

        if rows_affected is not None:
            log_data["rows_affected"] = rows_affected

        extra = {"extra_data": log_data}

        # Log como warning se a query demorou muito
        if duration_ms > 1000:  # Mais de 1 segundo
            self.logger.warning(
                f"Query lenta ({duration_ms}ms): {query[:100]}",
                extra=extra,
            )
        else:
            self.logger.debug(
                f"Query ({duration_ms}ms): {query[:100]}",
                extra=extra,
            )


# Instâncias globais
logger = setup_logging()
audit_logger = AuditLogger()
performance_logger = PerformanceLogger()
