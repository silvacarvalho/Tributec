"""
Módulo de configuração de logging para o sistema Tributec
"""
import logging
import sys
from pathlib import Path

# Criar diretório de logs se não existir
log_dir = Path("logs")
log_dir.mkdir(exist_ok=True)

# Configurar formato de log
log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
date_format = "%Y-%m-%d %H:%M:%S"

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format=log_format,
    datefmt=date_format,
    handlers=[
        # Log para arquivo
        logging.FileHandler(log_dir / "tributec.log", encoding="utf-8"),
        # Log para console
        logging.StreamHandler(sys.stdout)
    ]
)

# Logger padrão para o sistema
logger = logging.getLogger("tributec")
logger.setLevel(logging.INFO)

# Exportar logger
__all__ = ["logger"]
