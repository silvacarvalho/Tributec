"""
Exemplos para documentação OpenAPI/Swagger
"""

# Exemplos de Pessoa Física
PESSOA_FISICA_CREATE_EXAMPLE = {
    "tipo_pessoa": "F",
    "nome": "João da Silva",
    "cpf": "123.456.789-01",
    "rg": "12.345.678-9",
    "data_nascimento": "1980-01-15",
    "telefone": "(11) 98765-4321",
    "email": "joao.silva@email.com",
    "logradouro": "Rua das Flores",
    "numero": "100",
    "complemento": "Apto 201",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "uf": "SP",
    "cep": "01234-567"
}

PESSOA_FISICA_RESPONSE_EXAMPLE = {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "tipo_pessoa": "F",
    "nome": "João da Silva",
    "cpf": "12345678901",
    "rg": "123456789",
    "data_nascimento": "1980-01-15",
    "telefone": "(11) 98765-4321",
    "email": "joao.silva@email.com",
    "situacao_cadastral": "ATIVO",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
}

# Exemplos de Pessoa Jurídica
PESSOA_JURIDICA_CREATE_EXAMPLE = {
    "tipo_pessoa": "J",
    "razao_social": "Empresa Exemplo LTDA",
    "nome_fantasia": "Empresa Exemplo",
    "cnpj": "12.345.678/0001-90",
    "inscricao_estadual": "123.456.789.012",
    "telefone": "(11) 3456-7890",
    "email": "contato@empresa.com.br",
    "logradouro": "Av. Paulista",
    "numero": "1000",
    "bairro": "Bela Vista",
    "cidade": "São Paulo",
    "uf": "SP",
    "cep": "01310-100"
}

# Exemplos de Imóvel
IMOVEL_CREATE_EXAMPLE = {
    "inscricao_imobiliaria": "12.345.678-9",
    "setor_fiscal": "001",
    "quadra": "A",
    "lote": "010",
    "area_terreno": 250.00,
    "area_construida": 150.00,
    "tipo_imovel": "RESIDENCIAL",
    "situacao_terreno": "MEIO",
    "topografia": "PLANO",
    "pedologia": "NORMAL",
    "logradouro": "Rua das Acácias",
    "numero": "123",
    "bairro": "Jardim América",
    "cep": "12345-678",
    "proprietario_id": "123e4567-e89b-12d3-a456-426614174000"
}

IMOVEL_RESPONSE_EXAMPLE = {
    "id": "223e4567-e89b-12d3-a456-426614174001",
    "inscricao_imobiliaria": "123456789",
    "setor_fiscal": "001",
    "quadra": "A",
    "lote": "010",
    "area_terreno": 250.00,
    "area_construida": 150.00,
    "tipo_imovel": "RESIDENCIAL",
    "situacao_cadastral": "ATIVO",
    "created_at": "2024-01-15T10:30:00Z"
}

# Exemplos de IPTU
IPTU_CALCULO_REQUEST_EXAMPLE = {
    "imovel_id": "223e4567-e89b-12d3-a456-426614174001",
    "ano_exercicio": 2024
}

IPTU_CALCULO_RESPONSE_EXAMPLE = {
    "imovel_id": "223e4567-e89b-12d3-a456-426614174001",
    "ano_exercicio": 2024,
    "area_terreno": 250.00,
    "area_construida": 150.00,
    "valor_m2_terreno": 500.00,
    "valor_m2_construcao": 800.00,
    "fator_correcao_terreno": 1.00,
    "fator_correcao_edificacao": 1.00,
    "valor_venal_terreno": 125000.00,
    "valor_venal_edificacao": 120000.00,
    "valor_venal_total": 245000.00,
    "aliquota": 1.2,
    "valor_iptu": 2940.00,
    "detalhamento": {
        "fct": {
            "fator_situacao": 1.00,
            "fator_topografia": 1.00,
            "fator_pedologia": 1.00,
            "fct_total": 1.00
        },
        "fce": {
            "fator_padrao": 1.00,
            "fator_estrutura": 1.00,
            "fator_parede": 1.00,
            "fator_conservacao": 1.00,
            "fce_total": 1.00
        }
    }
}

IPTU_LANCAMENTO_REQUEST_EXAMPLE = {
    "imovel_id": "223e4567-e89b-12d3-a456-426614174001",
    "ano_exercicio": 2024,
    "numero_parcelas": 10,
    "data_vencimento_primeira_parcela": "2024-03-10"
}

IPTU_LANCAMENTO_RESPONSE_EXAMPLE = {
    "id": "323e4567-e89b-12d3-a456-426614174002",
    "imovel_id": "223e4567-e89b-12d3-a456-426614174001",
    "ano_exercicio": 2024,
    "valor_venal": 245000.00,
    "valor_iptu": 2940.00,
    "numero_parcelas": 10,
    "valor_parcela": 294.00,
    "situacao": "LANCADO",
    "created_at": "2024-01-15T10:30:00Z"
}

# Exemplos de ITBI
ITBI_GUIA_REQUEST_EXAMPLE = {
    "imovel_id": "223e4567-e89b-12d3-a456-426614174001",
    "adquirente_id": "123e4567-e89b-12d3-a456-426614174000",
    "transmitente_id": "423e4567-e89b-12d3-a456-426614174003",
    "tipo_transacao": "COMPRA_VENDA",
    "valor_transacao": 300000.00,
    "data_transacao": "2024-01-10"
}

ITBI_GUIA_RESPONSE_EXAMPLE = {
    "id": "523e4567-e89b-12d3-a456-426614174004",
    "numero_guia": "ITBI-2024-000123",
    "imovel_id": "223e4567-e89b-12d3-a456-426614174001",
    "adquirente_id": "123e4567-e89b-12d3-a456-426614174000",
    "tipo_transacao": "COMPRA_VENDA",
    "valor_transacao": 300000.00,
    "valor_venal": 245000.00,
    "base_calculo": 300000.00,
    "aliquota": 2.0,
    "valor_itbi": 6000.00,
    "situacao": "EMITIDA",
    "data_vencimento": "2024-02-10",
    "created_at": "2024-01-15T10:30:00Z"
}

# Exemplos de ISSQN
ISSQN_DECLARACAO_REQUEST_EXAMPLE = {
    "estabelecimento_id": "623e4567-e89b-12d3-a456-426614174005",
    "competencia": "2024-01",
    "valor_servicos": 15000.00,
    "aliquota": 3.0,
    "codigo_servico": "01.01",
    "descricao_servicos": "Consultoria em tecnologia da informação"
}

ISSQN_DECLARACAO_RESPONSE_EXAMPLE = {
    "id": "723e4567-e89b-12d3-a456-426614174006",
    "numero_declaracao": "ISSQN-2024-01-00456",
    "estabelecimento_id": "623e4567-e89b-12d3-a456-426614174005",
    "competencia": "2024-01",
    "valor_servicos": 15000.00,
    "aliquota": 3.0,
    "valor_issqn": 450.00,
    "situacao": "DECLARADA",
    "data_vencimento": "2024-02-10",
    "created_at": "2024-01-15T10:30:00Z"
}

# Exemplos de Isenção
ISENCAO_REQUEST_EXAMPLE = {
    "imovel_id": "223e4567-e89b-12d3-a456-426614174001",
    "requerente_id": "123e4567-e89b-12d3-a456-426614174000",
    "motivo": "IDOSO",
    "percentual": 100.0,
    "ano_inicial": 2024,
    "ano_final": 2029,
    "observacoes": "Proprietário com mais de 65 anos"
}

ISENCAO_RESPONSE_EXAMPLE = {
    "id": "823e4567-e89b-12d3-a456-426614174007",
    "numero_processo": "ISENCAO-2024-00123",
    "imovel_id": "223e4567-e89b-12d3-a456-426614174001",
    "requerente_id": "123e4567-e89b-12d3-a456-426614174000",
    "motivo": "IDOSO",
    "percentual": 100.0,
    "ano_inicial": 2024,
    "ano_final": 2029,
    "situacao": "ANALISE",
    "created_at": "2024-01-15T10:30:00Z"
}

# Exemplos de Parcelamento
PARCELAMENTO_REQUEST_EXAMPLE = {
    "contribuinte_id": "123e4567-e89b-12d3-a456-426614174000",
    "debitos": [
        {
            "tipo": "IPTU",
            "lancamento_id": "323e4567-e89b-12d3-a456-426614174002",
            "valor": 2940.00
        }
    ],
    "numero_parcelas": 12,
    "data_primeira_parcela": "2024-02-10"
}

PARCELAMENTO_RESPONSE_EXAMPLE = {
    "id": "923e4567-e89b-12d3-a456-426614174008",
    "numero_acordo": "PARC-2024-00789",
    "contribuinte_id": "123e4567-e89b-12d3-a456-426614174000",
    "valor_total": 2940.00,
    "numero_parcelas": 12,
    "valor_parcela": 245.00,
    "situacao": "ATIVO",
    "created_at": "2024-01-15T10:30:00Z"
}

# Exemplos de Erro
ERROR_400_EXAMPLE = {
    "detail": "Dados inválidos: CPF já cadastrado"
}

ERROR_401_EXAMPLE = {
    "detail": "Não autenticado. Token inválido ou expirado."
}

ERROR_403_EXAMPLE = {
    "detail": "Sem permissão para acessar este recurso"
}

ERROR_404_EXAMPLE = {
    "detail": "Recurso não encontrado"
}

ERROR_409_EXAMPLE = {
    "detail": "Conflito: Inscrição imobiliária já cadastrada"
}

ERROR_422_EXAMPLE = {
    "detail": [
        {
            "loc": ["body", "cpf"],
            "msg": "field required",
            "type": "value_error.missing"
        }
    ]
}

ERROR_500_EXAMPLE = {
    "detail": "Erro interno do servidor"
}
