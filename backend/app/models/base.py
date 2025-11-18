"""
Modelo base para todas as entidades
"""
from datetime import datetime
from sqlalchemy import Column, DateTime
from sqlalchemy.ext.declarative import declared_attr
from app.db.base import Base


class ModeloBase(Base):
    """
    Classe base abstrata para todos os modelos
    Fornece campos comuns de auditoria
    """
    __abstract__ = True

    criado_em = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        comment="Data e hora de criação do registro"
    )
    atualizado_em = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
        comment="Data e hora da última atualização"
    )

    @declared_attr
    def __tablename__(cls):
        """Gera nome da tabela automaticamente baseado no nome da classe"""
        return cls.__name__.lower()
