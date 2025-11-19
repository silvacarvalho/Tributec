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

    def inativar(self, imovel_id: UUID) -> None:
        """
        Inativa um imóvel (soft delete)

        Args:
            imovel_id: ID do imóvel

        Raises:
            HTTPException: Se imóvel não for encontrado
        """
        imovel = self.obter_por_id(imovel_id)
        imovel.ativo = False

        self.db.commit()


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

    def obter_por_ccm(self, ccm: str) -> Estabelecimento:
        """
        Busca estabelecimento por inscrição municipal (CCM)

        Args:
            ccm: Inscrição municipal (CCM)

        Returns:
            Estabelecimento encontrado

        Raises:
            HTTPException: Se estabelecimento não for encontrado
        """
        estabelecimento = self.db.query(Estabelecimento).filter(
            Estabelecimento.inscricao_municipal == ccm
        ).first()

        if not estabelecimento:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Estabelecimento não encontrado"
            )

        return estabelecimento

    def atualizar(self, estabelecimento_id: UUID, estabelecimento_update: EstabelecimentoUpdate) -> Estabelecimento:
        """
        Atualiza dados de um estabelecimento

        Args:
            estabelecimento_id: ID do estabelecimento
            estabelecimento_update: Dados a atualizar

        Returns:
            Estabelecimento atualizado

        Raises:
            HTTPException: Se estabelecimento não for encontrado
        """
        estabelecimento = self.obter_por_id(estabelecimento_id)

        update_data = estabelecimento_update.model_dump(exclude_unset=True)

        for campo, valor in update_data.items():
            setattr(estabelecimento, campo, valor)

        self.db.commit()
        self.db.refresh(estabelecimento)

        return estabelecimento

    def inativar(self, estabelecimento_id: UUID) -> None:
        """
        Inativa um estabelecimento (soft delete)

        Args:
            estabelecimento_id: ID do estabelecimento

        Raises:
            HTTPException: Se estabelecimento não for encontrado
        """
        estabelecimento = self.obter_por_id(estabelecimento_id)
        estabelecimento.ativo = False

        self.db.commit()


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

    def obter_por_id(self, logradouro_id: int) -> Logradouro:
        """
        Obtém logradouro por ID

        Args:
            logradouro_id: ID do logradouro

        Returns:
            Logradouro encontrado

        Raises:
            HTTPException: Se logradouro não for encontrado
        """
        logradouro = self.db.query(Logradouro).filter(
            Logradouro.id == logradouro_id
        ).first()

        if not logradouro:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Logradouro não encontrado"
            )

        return logradouro

    def obter_por_codigo(self, codigo: str) -> Logradouro:
        """
        Busca logradouro por código

        Args:
            codigo: Código do logradouro

        Returns:
            Logradouro encontrado

        Raises:
            HTTPException: Se logradouro não for encontrado
        """
        logradouro = self.db.query(Logradouro).filter(
            Logradouro.codigo == codigo
        ).first()

        if not logradouro:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Logradouro não encontrado"
            )

        return logradouro

    def atualizar(self, logradouro_id: int, logradouro_update: LogradouroCreate) -> Logradouro:
        """
        Atualiza dados de um logradouro

        Args:
            logradouro_id: ID do logradouro
            logradouro_update: Dados a atualizar

        Returns:
            Logradouro atualizado

        Raises:
            HTTPException: Se logradouro não for encontrado
        """
        logradouro = self.obter_por_id(logradouro_id)

        update_data = logradouro_update.model_dump(exclude_unset=True)

        for campo, valor in update_data.items():
            setattr(logradouro, campo, valor)

        self.db.commit()
        self.db.refresh(logradouro)

        return logradouro

    def excluir(self, logradouro_id: int) -> None:
        """
        Exclui um logradouro

        Args:
            logradouro_id: ID do logradouro

        Raises:
            HTTPException: Se logradouro não for encontrado ou estiver em uso
        """
        logradouro = self.obter_por_id(logradouro_id)

        # Verificar se o logradouro está sendo utilizado por algum imóvel ou endereço
        imoveis_usando = self.db.query(Imovel).filter(
            Imovel.logradouro_id == logradouro_id
        ).count()

        enderecos_usando = self.db.query(Endereco).filter(
            Endereco.logradouro_id == logradouro_id
        ).count()

        if imoveis_usando > 0 or enderecos_usando > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Logradouro não pode ser excluído pois está em uso por {imoveis_usando} imóveis e {enderecos_usando} endereços"
            )

        self.db.delete(logradouro)
        self.db.commit()


class EnderecoService:
    """Service para operações com Endereços"""

    def __init__(self, db: Session):
        self.db = db

    def criar(self, pessoa_id: UUID, endereco_data) -> Endereco:
        """
        Adiciona um novo endereço a uma pessoa

        Args:
            pessoa_id: ID da pessoa
            endereco_data: Dados do endereço (EnderecoCreate)

        Returns:
            Endereco criado

        Raises:
            HTTPException: Se pessoa não for encontrada ou logradouro inválido
        """
        # Verificar se pessoa existe
        pessoa = self.db.query(Pessoa).filter(Pessoa.id == pessoa_id).first()
        if not pessoa:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pessoa não encontrada"
            )

        # Verificar se logradouro existe (se fornecido)
        if hasattr(endereco_data, 'logradouro_id') and endereco_data.logradouro_id:
            logradouro = self.db.query(Logradouro).filter(
                Logradouro.id == endereco_data.logradouro_id
            ).first()
            if not logradouro:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Logradouro não encontrado"
                )

        # Se é o primeiro endereço, definir como principal automaticamente
        enderecos_existentes = self.db.query(Endereco).filter(
            Endereco.pessoa_id == pessoa_id
        ).count()

        endereco_dict = endereco_data.model_dump(exclude_unset=True)
        endereco_dict['pessoa_id'] = pessoa_id

        # Se for o primeiro endereço, marca como principal
        if enderecos_existentes == 0:
            endereco_dict['endereco_principal'] = True
        elif endereco_dict.get('endereco_principal', False):
            # Se está marcando como principal, desmarcar os outros
            self.db.query(Endereco).filter(
                Endereco.pessoa_id == pessoa_id,
                Endereco.endereco_principal == True
            ).update({'endereco_principal': False})

        novo_endereco = Endereco(**endereco_dict)

        self.db.add(novo_endereco)
        self.db.commit()
        self.db.refresh(novo_endereco)

        return novo_endereco

    def obter_por_id(self, endereco_id: int) -> Endereco:
        """
        Obtém endereço por ID

        Args:
            endereco_id: ID do endereço

        Returns:
            Endereco encontrado

        Raises:
            HTTPException: Se endereço não for encontrado
        """
        endereco = self.db.query(Endereco).filter(
            Endereco.id == endereco_id
        ).first()

        if not endereco:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Endereço não encontrado"
            )

        return endereco

    def atualizar(self, endereco_id: int, endereco_update) -> Endereco:
        """
        Atualiza um endereço

        Args:
            endereco_id: ID do endereço
            endereco_update: Dados a atualizar (EnderecoCreate)

        Returns:
            Endereco atualizado

        Raises:
            HTTPException: Se endereço não for encontrado
        """
        endereco = self.obter_por_id(endereco_id)

        update_data = endereco_update.model_dump(exclude_unset=True)

        # Se está marcando como principal, desmarcar os outros da mesma pessoa
        if update_data.get('endereco_principal', False):
            self.db.query(Endereco).filter(
                Endereco.pessoa_id == endereco.pessoa_id,
                Endereco.id != endereco_id,
                Endereco.endereco_principal == True
            ).update({'endereco_principal': False})

        for campo, valor in update_data.items():
            setattr(endereco, campo, valor)

        self.db.commit()
        self.db.refresh(endereco)

        return endereco

    def excluir(self, endereco_id: int) -> None:
        """
        Remove um endereço

        Args:
            endereco_id: ID do endereço

        Raises:
            HTTPException: Se endereço não for encontrado ou for o único endereço principal
        """
        endereco = self.obter_por_id(endereco_id)

        # Verificar se é o endereço principal e único
        if endereco.endereco_principal:
            outros_enderecos = self.db.query(Endereco).filter(
                Endereco.pessoa_id == endereco.pessoa_id,
                Endereco.id != endereco_id
            ).count()

            if outros_enderecos > 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Não é possível excluir o endereço principal. Defina outro endereço como principal primeiro."
                )

        self.db.delete(endereco)
        self.db.commit()

    def definir_principal(self, endereco_id: int) -> Endereco:
        """
        Define um endereço como principal (desativa outros endereços principais da mesma pessoa)

        Args:
            endereco_id: ID do endereço

        Returns:
            Endereco atualizado

        Raises:
            HTTPException: Se endereço não for encontrado
        """
        endereco = self.obter_por_id(endereco_id)

        # Desmarcar outros endereços principais da mesma pessoa
        self.db.query(Endereco).filter(
            Endereco.pessoa_id == endereco.pessoa_id,
            Endereco.id != endereco_id,
            Endereco.endereco_principal == True
        ).update({'endereco_principal': False})

        # Marcar este como principal
        endereco.endereco_principal = True

        self.db.commit()
        self.db.refresh(endereco)

        return endereco
