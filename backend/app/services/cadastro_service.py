"""
Services do Módulo de Cadastros
Lógica de negócio para Pessoas, Imóveis, Estabelecimentos
"""
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.cadastro import (
    Pessoa, Endereco, Imovel, ImovelTerreno, ImovelEdificacao,
    Estabelecimento, Logradouro, SituacaoCadastral
)
from app.schemas.cadastro import (
    PessoaCreate, PessoaUpdate, PessoaResponse,
    ImovelCreate, ImovelUpdate,
    EstabelecimentoCreate, EstabelecimentoUpdate,
    LogradouroCreate
)
from app.utils.validators import validar_cpf, validar_cnpj, limpar_documento
from app.utils.generators import (
    gerar_inscricao_imobiliaria,
    gerar_inscricao_municipal
)


class PessoaService:
    """Service para operações com Pessoas"""

    def __init__(self, db: Session):
        self.db = db

    def criar(self, pessoa_data: PessoaCreate) -> Pessoa:
        """
        Cria uma nova pessoa

        Args:
            pessoa_data: Dados da pessoa

        Returns:
            Pessoa criada

        Raises:
            HTTPException: Se validação falhar ou documento já existir
        """
        # Validar tipo e documento
        if pessoa_data.tipo_pessoa == "F":
            if not pessoa_data.cpf:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="CPF é obrigatório para pessoa física"
                )

            cpf_limpo = limpar_documento(pessoa_data.cpf)
            if not validar_cpf(cpf_limpo):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="CPF inválido"
                )

            # Verificar se CPF já existe
            existe = self.db.query(Pessoa).filter(Pessoa.cpf == cpf_limpo).first()
            if existe:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="CPF já cadastrado"
                )

            pessoa_data.cpf = cpf_limpo

        elif pessoa_data.tipo_pessoa == "J":
            if not pessoa_data.cnpj:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="CNPJ é obrigatório para pessoa jurídica"
                )

            cnpj_limpo = limpar_documento(pessoa_data.cnpj)
            if not validar_cnpj(cnpj_limpo):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="CNPJ inválido"
                )

            # Verificar se CNPJ já existe
            existe = self.db.query(Pessoa).filter(Pessoa.cnpj == cnpj_limpo).first()
            if existe:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="CNPJ já cadastrado"
                )

            pessoa_data.cnpj = cnpj_limpo

        # Criar pessoa
        pessoa_dict = pessoa_data.model_dump(exclude_unset=True)
        nova_pessoa = Pessoa(**pessoa_dict)
        nova_pessoa.situacao_cadastral = SituacaoCadastral.ATIVO

        self.db.add(nova_pessoa)
        self.db.commit()
        self.db.refresh(nova_pessoa)

        return nova_pessoa

    def listar(
        self,
        skip: int = 0,
        limit: int = 20,
        tipo_pessoa: Optional[str] = None,
        situacao: Optional[str] = None
    ) -> tuple[List[Pessoa], int]:
        """
        Lista pessoas com filtros e paginação

        Args:
            skip: Quantidade de registros a pular
            limit: Quantidade máxima de registros
            tipo_pessoa: Filtrar por tipo (F ou J)
            situacao: Filtrar por situação cadastral

        Returns:
            Tupla (lista de pessoas, total de registros)
        """
        query = self.db.query(Pessoa)

        if tipo_pessoa:
            query = query.filter(Pessoa.tipo_pessoa == tipo_pessoa)

        if situacao:
            query = query.filter(Pessoa.situacao_cadastral == situacao)

        # Contar total antes de aplicar paginação
        total = query.count()

        # Aplicar paginação
        pessoas = query.offset(skip).limit(limit).all()

        return pessoas, total

    def obter_por_id(self, pessoa_id: UUID) -> Pessoa:
        """
        Obtém pessoa por ID

        Args:
            pessoa_id: ID da pessoa

        Returns:
            Pessoa encontrada

        Raises:
            HTTPException: Se pessoa não for encontrada
        """
        pessoa = self.db.query(Pessoa).filter(Pessoa.id == pessoa_id).first()

        if not pessoa:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pessoa não encontrada"
            )

        return pessoa

    def obter_por_cpf(self, cpf: str) -> Pessoa:
        """
        Busca pessoa por CPF

        Args:
            cpf: CPF da pessoa

        Returns:
            Pessoa encontrada

        Raises:
            HTTPException: Se pessoa não for encontrada
        """
        cpf_limpo = limpar_documento(cpf)

        pessoa = self.db.query(Pessoa).filter(Pessoa.cpf == cpf_limpo).first()

        if not pessoa:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pessoa não encontrada"
            )

        return pessoa

    def obter_por_cnpj(self, cnpj: str) -> Pessoa:
        """
        Busca pessoa por CNPJ

        Args:
            cnpj: CNPJ da pessoa

        Returns:
            Pessoa encontrada

        Raises:
            HTTPException: Se pessoa não for encontrada
        """
        cnpj_limpo = limpar_documento(cnpj)

        pessoa = self.db.query(Pessoa).filter(Pessoa.cnpj == cnpj_limpo).first()

        if not pessoa:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pessoa não encontrada"
            )

        return pessoa

    def atualizar(self, pessoa_id: UUID, pessoa_update: PessoaUpdate) -> Pessoa:
        """
        Atualiza dados de uma pessoa

        Args:
            pessoa_id: ID da pessoa
            pessoa_update: Dados a atualizar

        Returns:
            Pessoa atualizada

        Raises:
            HTTPException: Se pessoa não for encontrada
        """
        pessoa = self.obter_por_id(pessoa_id)

        update_data = pessoa_update.model_dump(exclude_unset=True)

        for campo, valor in update_data.items():
            setattr(pessoa, campo, valor)

        self.db.commit()
        self.db.refresh(pessoa)

        return pessoa

    def inativar(self, pessoa_id: UUID) -> Pessoa:
        """
        Inativa uma pessoa

        Args:
            pessoa_id: ID da pessoa

        Returns:
            Pessoa inativada

        Raises:
            HTTPException: Se pessoa não for encontrada
        """
        pessoa = self.obter_por_id(pessoa_id)

        pessoa.situacao_cadastral = SituacaoCadastral.INATIVO

        self.db.commit()
        self.db.refresh(pessoa)

        return pessoa


class ImovelService:
    """Service para operações com Imóveis"""

    def __init__(self, db: Session):
        self.db = db

    def criar(self, imovel_data: ImovelCreate) -> Imovel:
        """
        Cria um novo imóvel

        Args:
            imovel_data: Dados do imóvel

        Returns:
            Imóvel criado

        Raises:
            HTTPException: Se validação falhar
        """
        # Verificar se inscrição já existe
        existe = self.db.query(Imovel).filter(
            Imovel.inscricao_imobiliaria == imovel_data.inscricao_imobiliaria
        ).first()

        if existe:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Inscrição imobiliária já cadastrada"
            )

        # Verificar se proprietário existe
        proprietario = self.db.query(Pessoa).filter(
            Pessoa.id == imovel_data.proprietario_id
        ).first()

        if not proprietario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Proprietário não encontrado"
            )

        # Criar imóvel
        imovel_dict = imovel_data.model_dump(
            exclude={'terreno', 'edificacoes'},
            exclude_unset=True
        )
        novo_imovel = Imovel(**imovel_dict)

        self.db.add(novo_imovel)
        self.db.flush()  # Para obter o ID do imóvel

        # Criar terreno se fornecido
        if imovel_data.terreno:
            terreno_dict = imovel_data.terreno.model_dump(exclude_unset=True)
            terreno = ImovelTerreno(**terreno_dict, imovel_id=novo_imovel.id)
            self.db.add(terreno)

        # Criar edificações se fornecidas
        if imovel_data.edificacoes:
            for edif_data in imovel_data.edificacoes:
                edif_dict = edif_data.model_dump(exclude_unset=True)
                edificacao = ImovelEdificacao(**edif_dict, imovel_id=novo_imovel.id)
                self.db.add(edificacao)

        self.db.commit()
        self.db.refresh(novo_imovel)

        return novo_imovel

    def listar(
        self,
        skip: int = 0,
        limit: int = 20,
        tipo_imovel: Optional[str] = None,
        tipo_uso: Optional[str] = None,
        setor_fiscal_id: Optional[int] = None
    ) -> tuple[List[Imovel], int]:
        """
        Lista imóveis com filtros e paginação

        Args:
            skip: Quantidade de registros a pular
            limit: Quantidade máxima de registros
            tipo_imovel: Filtrar por tipo
            tipo_uso: Filtrar por tipo de uso
            setor_fiscal_id: Filtrar por setor fiscal

        Returns:
            Tupla (lista de imóveis, total de registros)
        """
        query = self.db.query(Imovel)

        if tipo_imovel:
            query = query.filter(Imovel.tipo_imovel == tipo_imovel)

        if tipo_uso:
            query = query.filter(Imovel.tipo_uso == tipo_uso)

        if setor_fiscal_id:
            query = query.filter(Imovel.setor_fiscal_id == setor_fiscal_id)

        total = query.count()
        imoveis = query.offset(skip).limit(limit).all()

        return imoveis, total

    def obter_por_id(self, imovel_id: UUID) -> Imovel:
        """
        Obtém imóvel por ID com todas as relações

        Args:
            imovel_id: ID do imóvel

        Returns:
            Imóvel encontrado

        Raises:
            HTTPException: Se imóvel não for encontrado
        """
        imovel = self.db.query(Imovel).filter(Imovel.id == imovel_id).first()

        if not imovel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Imóvel não encontrado"
            )

        return imovel

    def obter_por_inscricao(self, inscricao: str) -> Imovel:
        """
        Busca imóvel por inscrição imobiliária

        Args:
            inscricao: Inscrição imobiliária

        Returns:
            Imóvel encontrado

        Raises:
            HTTPException: Se imóvel não for encontrado
        """
        imovel = self.db.query(Imovel).filter(
            Imovel.inscricao_imobiliaria == inscricao
        ).first()

        if not imovel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Imóvel não encontrado"
            )

        return imovel

    def atualizar(self, imovel_id: UUID, imovel_update: ImovelUpdate) -> Imovel:
        """
        Atualiza dados de um imóvel

        Args:
            imovel_id: ID do imóvel
            imovel_update: Dados a atualizar

        Returns:
            Imóvel atualizado

        Raises:
            HTTPException: Se imóvel não for encontrado
        """
        imovel = self.obter_por_id(imovel_id)

        update_data = imovel_update.model_dump(exclude_unset=True)

        for campo, valor in update_data.items():
            setattr(imovel, campo, valor)

        self.db.commit()
        self.db.refresh(imovel)

        return imovel


class EstabelecimentoService:
    """Service para operações com Estabelecimentos"""

    def __init__(self, db: Session):
        self.db = db

    def criar(self, estabelecimento_data: EstabelecimentoCreate) -> Estabelecimento:
        """
        Cria um novo estabelecimento (CCM)

        Args:
            estabelecimento_data: Dados do estabelecimento

        Returns:
            Estabelecimento criado

        Raises:
            HTTPException: Se validação falhar
        """
        # Verificar se inscrição já existe
        existe = self.db.query(Estabelecimento).filter(
            Estabelecimento.inscricao_municipal == estabelecimento_data.inscricao_municipal
        ).first()

        if existe:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Inscrição municipal (CCM) já cadastrada"
            )

        # Verificar se pessoa existe e é jurídica
        pessoa = self.db.query(Pessoa).filter(
            Pessoa.id == estabelecimento_data.pessoa_id
        ).first()

        if not pessoa:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pessoa jurídica não encontrada"
            )

        if pessoa.tipo_pessoa != "J":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Estabelecimento deve estar vinculado a uma pessoa jurídica"
            )

        # Criar estabelecimento
        estab_dict = estabelecimento_data.model_dump(exclude_unset=True)
        novo_estabelecimento = Estabelecimento(**estab_dict)

        self.db.add(novo_estabelecimento)
        self.db.commit()
        self.db.refresh(novo_estabelecimento)

        return novo_estabelecimento

    def listar(
        self,
        skip: int = 0,
        limit: int = 20,
        regime_issqn: Optional[str] = None
    ) -> tuple[List[Estabelecimento], int]:
        """
        Lista estabelecimentos com filtros e paginação
        """
        query = self.db.query(Estabelecimento)

        if regime_issqn:
            query = query.filter(Estabelecimento.regime_issqn == regime_issqn)

        total = query.count()
        estabelecimentos = query.offset(skip).limit(limit).all()

        return estabelecimentos, total

    def obter_por_id(self, estabelecimento_id: UUID) -> Estabelecimento:
        """
        Obtém estabelecimento por ID
        """
        estabelecimento = self.db.query(Estabelecimento).filter(
            Estabelecimento.id == estabelecimento_id
        ).first()

        if not estabelecimento:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Estabelecimento não encontrado"
            )

        return estabelecimento


class LogradouroService:
    """Service para operações com Logradouros"""

    def __init__(self, db: Session):
        self.db = db

    def criar(self, logradouro_data: LogradouroCreate) -> Logradouro:
        """
        Cria um novo logradouro
        """
        logr_dict = logradouro_data.model_dump(exclude_unset=True)
        novo_logradouro = Logradouro(**logr_dict)

        self.db.add(novo_logradouro)
        self.db.commit()
        self.db.refresh(novo_logradouro)

        return novo_logradouro

    def listar(
        self,
        skip: int = 0,
        limit: int = 20,
        nome: Optional[str] = None,
        bairro: Optional[str] = None
    ) -> tuple[List[Logradouro], int]:
        """
        Lista logradouros com filtros
        """
        query = self.db.query(Logradouro)

        if nome:
            query = query.filter(Logradouro.nome.ilike(f"%{nome}%"))

        if bairro:
            query = query.filter(Logradouro.bairro.ilike(f"%{bairro}%"))

        total = query.count()
        logradouros = query.offset(skip).limit(limit).all()

        return logradouros, total
