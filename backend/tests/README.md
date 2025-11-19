# Testes - Sistema Tributec

Este diretório contém todos os testes automatizados do sistema.

## 📁 Estrutura

```
tests/
├── unit/                   # Testes unitários (services, utils)
│   ├── test_cadastro_service.py
│   ├── test_calculo_tributario.py
│   └── ...
├── integration/            # Testes de integração (API endpoints)
│   ├── test_auth_api.py
│   ├── test_cadastro_api.py
│   ├── test_tributario_api.py
│   └── ...
├── conftest.py            # Fixtures compartilhadas
└── README.md              # Este arquivo
```

## 🚀 Executando os Testes

### Todos os testes
```bash
pytest
```

### Apenas testes unitários
```bash
pytest tests/unit -v
```

### Apenas testes de integração
```bash
pytest tests/integration -v
```

### Testes de um módulo específico
```bash
pytest tests/unit/test_cadastro_service.py -v
```

### Com cobertura
```bash
pytest --cov=app --cov-report=html
```

### Testes por markers
```bash
# Apenas testes de cadastro
pytest -m cadastro

# Apenas testes tributários
pytest -m tributario

# Apenas testes lentos
pytest -m slow
```

## 🏷️ Markers Disponíveis

- `unit`: Testes unitários
- `integration`: Testes de integração
- `slow`: Testes que demoram mais tempo
- `database`: Testes que precisam de banco de dados
- `auth`: Testes de autenticação
- `cadastro`: Testes do módulo de cadastro
- `tributario`: Testes do módulo tributário
- `fiscal`: Testes do módulo fiscal

## 📊 Relatórios de Cobertura

Após executar os testes com cobertura, os relatórios ficam em:

- **HTML**: `htmlcov/index.html`
- **XML**: `coverage.xml`
- **Terminal**: Exibido automaticamente

## 🛠️ Fixtures Disponíveis

### Banco de Dados
- `db`: Sessão de banco de dados em memória (SQLite)

### Cliente HTTP
- `client`: Cliente de testes FastAPI (TestClient)

### Autenticação
- `auth_headers`: Headers com token de autenticação válido
- `usuario_admin`: Usuário admin para testes
- `usuario_fiscal`: Usuário fiscal para testes

### Dados de Teste
- `pessoa_fisica_data`: Dados de pessoa física
- `pessoa_juridica_data`: Dados de pessoa jurídica
- `imovel_data`: Dados de imóvel
- `estabelecimento_data`: Dados de estabelecimento

## ✅ Boas Práticas

### 1. Organização dos Testes

```python
@pytest.mark.unit
@pytest.mark.cadastro
class TestPessoaService:
    """Testes para PessoaService"""

    def test_criar_pessoa_valida(self, db: Session):
        """Testa criação de pessoa com dados válidos"""
        # Arrange
        service = PessoaService(db)
        pessoa_data = PessoaCreate(...)

        # Act
        pessoa = service.criar(pessoa_data)

        # Assert
        assert pessoa.id is not None
        assert pessoa.nome == "João da Silva"
```

### 2. Nomear Testes Claramente

- Use nomes descritivos: `test_criar_pessoa_cpf_duplicado`
- Evite nomes genéricos: `test_1`, `test_pessoa`

### 3. Um Teste, Uma Asserção Principal

Cada teste deve verificar uma funcionalidade específica.

### 4. Usar Fixtures

Reutilize fixtures ao invés de duplicar código de setup.

### 5. Testar Casos de Erro

Sempre teste tanto o caminho feliz quanto os casos de erro:

```python
def test_criar_pessoa_cpf_invalido(self, db: Session):
    """Testa que CPF inválido deve falhar"""
    service = PessoaService(db)

    with pytest.raises(HTTPException) as exc_info:
        service.criar(pessoa_data)

    assert exc_info.value.status_code == 400
```

## 📈 Metas de Cobertura

- **Geral**: Mínimo 80%
- **Services**: Mínimo 90%
- **Models**: Mínimo 70%
- **Utils**: Mínimo 95%

## 🐛 Debugging Testes

### Executar com output detalhado
```bash
pytest -vv -s
```

### Parar no primeiro erro
```bash
pytest -x
```

### Executar apenas testes que falharam
```bash
pytest --lf
```

### Modo debug (pdb)
```bash
pytest --pdb
```

## 📝 Adicionando Novos Testes

1. Crie o arquivo de teste no diretório apropriado (`unit/` ou `integration/`)
2. Nomeie o arquivo com prefixo `test_`
3. Adicione os markers apropriados
4. Use as fixtures disponíveis
5. Documente o propósito de cada teste

## 🔧 Configurações

As configurações dos testes estão em:

- `pytest.ini`: Configuração geral do pytest
- `.coveragerc`: Configuração de cobertura
- `conftest.py`: Fixtures e configurações compartilhadas

## 📚 Recursos

- [Pytest Documentation](https://docs.pytest.org/)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [Coverage.py](https://coverage.readthedocs.io/)

---

**Nota**: Sempre execute os testes antes de fazer commit!

```bash
# Antes de commitar
pytest
```
