# Sistema de Logs - Tributec

Documentação do sistema de logs estruturado da aplicação.

## 📊 Visão Geral

O sistema utiliza logging estruturado em formato JSON para facilitar análise e monitoramento.

## 📁 Arquivos de Log

Os logs são armazenados no diretório `logs/`:

- **tributec.log**: Todos os logs (INFO e acima)
- **errors.log**: Apenas erros (ERROR e CRITICAL)
- **audit.log**: Logs de auditoria (operações sensíveis)

## 🎯 Níveis de Log

- **DEBUG**: Informações detalhadas para debugging
- **INFO**: Informações gerais de operação
- **WARNING**: Avisos que não impedem operação
- **ERROR**: Erros que afetam funcionalidade
- **CRITICAL**: Erros críticos que podem parar o sistema

## 🔧 Uso Básico

### Importar o Logger

```python
from app.core.logging import logger

# Usar em qualquer módulo
logger.info("Operação realizada com sucesso")
logger.error("Erro ao processar dados", exc_info=True)
logger.warning("Valor acima do esperado")
```

### Log com Dados Extras

```python
from app.core.logging import logger

logger.info(
    "Pessoa criada",
    extra={
        "user_id": usuario.id,
        "pessoa_id": pessoa.id,
        "cpf": pessoa.cpf
    }
)
```

## 🔍 Sistema de Auditoria

### Usar o AuditLogger

```python
from app.core.logging import audit_logger

# Registrar operação
audit_logger.log_operation(
    operation="CRIAR_PESSOA",
    user_id=str(usuario.id),
    resource_type="PESSOA",
    resource_id=str(pessoa.id),
    action="CREATE",
    status="SUCCESS",
    details={"cpf": pessoa.cpf},
    ip_address=request.client.host
)

# Registrar login
audit_logger.log_login(
    user_id=str(usuario.id),
    email=usuario.email,
    success=True,
    ip_address=request.client.host
)

# Registrar alteração de dados
audit_logger.log_data_change(
    user_id=str(usuario.id),
    resource_type="PESSOA",
    resource_id=str(pessoa.id),
    old_value="João Silva",
    new_value="João da Silva",
    field="nome"
)
```

### Operações Auditadas

O sistema registra automaticamente:

- ✅ Logins e logouts
- ✅ Criação de registros
- ✅ Alteração de dados sensíveis
- ✅ Exclusão de registros
- ✅ Aprovações e rejeições
- ✅ Lançamentos tributários
- ✅ Emissão de guias
- ✅ Cancelamentos

## ⚡ Monitoramento de Performance

### Usar o PerformanceLogger

```python
from app.core.logging import performance_logger

# Registrar requisição HTTP
performance_logger.log_request(
    method="POST",
    path="/api/v1/pessoas",
    status_code=201,
    duration_ms=145.2,
    user_id=str(usuario.id)
)

# Registrar query SQL
performance_logger.log_query(
    query="SELECT * FROM pessoas WHERE cpf = ?",
    duration_ms=23.5,
    rows_affected=1
)
```

### Alertas Automáticos

O sistema gera alertas automáticos para:

- ⚠️ Requisições > 5 segundos
- ⚠️ Queries SQL > 1 segundo
- ⚠️ Erros repetidos
- ⚠️ Taxa de erro elevada

## 📊 Formato dos Logs

### Estrutura JSON

```json
{
  "timestamp": "2024-01-15T10:30:00.123456",
  "level": "INFO",
  "logger": "app.services.pessoa",
  "message": "Pessoa criada com sucesso",
  "module": "cadastro_service",
  "function": "criar",
  "line": 145,
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "request_id": "abc123-def456",
  "extra": {
    "pessoa_id": "223e4567-e89b-12d3-a456-426614174001",
    "cpf": "12345678901"
  }
}
```

### Formato de Auditoria

```json
{
  "timestamp": "2024-01-15T10:30:00.123456",
  "level": "INFO",
  "logger": "app.audit",
  "message": "Auditoria: CRIAR_PESSOA",
  "extra_data": {
    "audit_type": "OPERATION",
    "operation": "CRIAR_PESSOA",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "resource_type": "PESSOA",
    "resource_id": "223e4567-e89b-12d3-a456-426614174001",
    "action": "CREATE",
    "status": "SUCCESS",
    "timestamp": "2024-01-15T10:30:00.123456",
    "ip_address": "192.168.1.100",
    "details": {
      "cpf": "12345678901"
    }
  }
}
```

## 🔎 Consultar Logs

### Com grep

```bash
# Buscar por usuário específico
grep "user_id.*123e4567" logs/tributec.log

# Buscar erros
grep '"level": "ERROR"' logs/errors.log

# Buscar operação específica
grep "CRIAR_PESSOA" logs/audit.log
```

### Com jq (JSON)

```bash
# Filtrar por nível ERROR
cat logs/errors.log | jq 'select(.level == "ERROR")'

# Filtrar por usuário
cat logs/tributec.log | jq 'select(.user_id == "123e4567")'

# Agrupar por operação
cat logs/audit.log | jq -r '.extra_data.operation' | sort | uniq -c
```

### Análise de Performance

```bash
# Requisições mais lentas
cat logs/tributec.log | jq 'select(.extra_data.duration_ms > 1000)'

# Top 10 endpoints mais lentos
cat logs/tributec.log | jq -r '.extra_data | "\(.duration_ms)\t\(.path)"' | sort -rn | head -10
```

## 🛡️ Boas Práticas

### 1. Use o Nível Correto

```python
# ✅ Correto
logger.debug("Valor calculado: 123.45")  # Detalhes técnicos
logger.info("Pessoa criada")             # Operação normal
logger.warning("Valor acima do limite")  # Situação anormal
logger.error("Falha ao salvar", exc_info=True)  # Erro

# ❌ Errado
logger.info("Erro ao salvar")  # Usar ERROR
logger.error("Pessoa criada")  # Usar INFO
```

### 2. Não Logue Dados Sensíveis

```python
# ❌ Errado - Expõe senha
logger.info(f"Login: {email} / {senha}")

# ✅ Correto
logger.info(f"Login: {email}")
```

### 3. Use Dados Estruturados

```python
# ❌ Errado - String concatenada
logger.info(f"Pessoa {pessoa.id} criada por {usuario.id}")

# ✅ Correto - Estruturado
logger.info(
    "Pessoa criada",
    extra={
        "pessoa_id": pessoa.id,
        "user_id": usuario.id
    }
)
```

### 4. Sempre use exc_info em Exceções

```python
# ❌ Errado - Perde stack trace
try:
    processar()
except Exception as e:
    logger.error(f"Erro: {e}")

# ✅ Correto - Mantém stack trace
try:
    processar()
except Exception as e:
    logger.error("Erro ao processar", exc_info=True)
```

## 🔧 Configuração

### Ambiente de Desenvolvimento

No desenvolvimento, os logs são exibidos no console com cores.

### Ambiente de Produção

Em produção, os logs são escritos apenas em arquivos JSON.

### Variáveis de Ambiente

```bash
# .env
DEBUG=False              # Desabilita logs no console
DB_ECHO=False           # Desabilita logs SQL
LOG_LEVEL=INFO          # Nível mínimo de log
```

## 📈 Monitoramento

### Integração com Ferramentas

O formato JSON facilita integração com:

- **Elasticsearch + Kibana**: Análise e visualização
- **Grafana Loki**: Agregação de logs
- **Datadog**: Monitoramento APM
- **Sentry**: Rastreamento de erros

### Exemplo de Configuração (Elasticsearch)

```python
# Enviar logs para Elasticsearch
import logging
from elasticsearch import Elasticsearch

handler = logging.handlers.ElasticsearchHandler(
    hosts=['localhost:9200'],
    index_name='tributec-logs'
)
logger.addHandler(handler)
```

## 📊 Métricas Importantes

### Operacionais

- Total de requisições por endpoint
- Tempo médio de resposta
- Taxa de erro por endpoint
- Requisições mais lentas

### Auditoria

- Operações por usuário
- Operações críticas (alterações, exclusões)
- Tentativas de login
- Acessos negados

### Performance

- Queries SQL mais lentas
- Endpoints com maior latência
- Picos de uso
- Recursos mais acessados

---

**Nota**: Os logs são essenciais para debugging, auditoria e monitoramento. Use-os adequadamente!
