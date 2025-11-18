# 🚀 Guia de Início Rápido - Tributec API

Comece a usar a API Tributec em 5 minutos!

## ⚡ Setup Rápido

### 1. Clone e Instale

```bash
# Clone o repositório
git clone https://github.com/silvacarvalho/Tributec.git
cd Tributec/backend

# Crie o ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate (Windows)

# Instale dependências
pip install -r requirements.txt
```

### 2. Configure o Banco de Dados

```bash
# Crie o banco PostgreSQL
createdb tributec

# Ative PostGIS
psql tributec -c "CREATE EXTENSION postgis;"

# Execute as migrações
alembic upgrade head
```

### 3. Configure Variáveis de Ambiente

Crie o arquivo `.env`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/tributec"
SECRET_KEY="chave-secreta-minimo-32-caracteres-aleatórios"
DEBUG=true
```

### 4. Inicie o Servidor

```bash
uvicorn app.main:app --reload
```

Acesse: **http://localhost:8000/docs** 🎉

---

## 📝 Primeiros Passos

### Passo 1: Criar Usuário Administrativo

Execute o script de seed (criar usuário padrão):

```bash
python scripts/seed_database.py
```

**Credenciais padrão**:
- Email: `admin@tributec.gov.br`
- Senha: `admin123` (altere imediatamente!)

### Passo 2: Fazer Login

**Requisição**:
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tributec.gov.br",
    "senha": "admin123"
  }'
```

**Resposta**:
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

⚠️ **Salve o `access_token`!** Você precisará em todas as próximas requisições.

### Passo 3: Testar Autenticação

```bash
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN_AQUI"
```

---

## 🏗️ Workflow Típico

### 1. Cadastrar Contribuinte

```bash
curl -X POST http://localhost:8000/api/v1/cadastro/pessoas \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_pessoa": "F",
    "cpf": "12345678901",
    "nome_completo": "Maria Silva",
    "email": "maria@email.com",
    "telefone": "(11) 98765-4321"
  }'
```

**Anote o `id` retornado!**

### 2. Cadastrar Logradouro

```bash
curl -X POST http://localhost:8000/api/v1/cadastro/logradouros \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_logradouro": "RUA",
    "nome": "das Flores",
    "bairro": "Centro",
    "cep": "01310-100",
    "setor_fiscal": 12
  }'
```

**Anote o `id` do logradouro!**

### 3. Cadastrar Imóvel

```bash
curl -X POST http://localhost:8000/api/v1/cadastro/imoveis \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "inscricao_cadastral": "12.34.567.0001-8",
    "proprietario_id": "ID_DA_PESSOA",
    "logradouro_id": ID_DO_LOGRADOURO,
    "numero": "100",
    "area_terreno": 250.00,
    "area_edificada": 180.00,
    "tipo_uso": "RESIDENCIAL",
    "padrao_construtivo": "MEDIO"
  }'
```

### 4. Configurar PGV (Valor do m² de Terreno)

```bash
curl -X POST http://localhost:8000/api/v1/tributario/pgv \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "setor_fiscal_id": 12,
    "ano_vigencia": 2025,
    "data_inicio_vigencia": "2025-01-01",
    "valor_m2_terreno": 500.00
  }'
```

### 5. Configurar TPC (Valor do m² de Edificação)

```bash
curl -X POST http://localhost:8000/api/v1/tributario/tpc \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "ano_vigencia": 2025,
    "mes_vigencia": 1,
    "data_inicio_vigencia": "2025-01-01",
    "padrao_construtivo": "MEDIO",
    "valor_m2_edificacao": 1000.00
  }'
```

### 6. Configurar Alíquota de IPTU

```bash
curl -X POST http://localhost:8000/api/v1/tributario/aliquotas \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_tributo": "IPTU",
    "categoria": "RESIDENCIAL",
    "aliquota": 0.0100,
    "ano_vigencia": 2025,
    "data_inicio_vigencia": "2025-01-01"
  }'
```

### 7. Calcular IPTU

```bash
curl -X POST http://localhost:8000/api/v1/tributario/iptu/calcular \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "imovel_id": "ID_DO_IMOVEL",
    "ano_exercicio": 2025,
    "numero_parcelas": 10
  }'
```

**Resultado**:
```json
{
  "valor_venal_terreno": 125000.00,
  "valor_venal_edificacao": 180000.00,
  "valor_venal_total": 305000.00,
  "aliquota_aplicada": 0.0100,
  "valor_iptu": 3050.00,
  "numero_parcelas": 10,
  "valor_parcela": 305.00
}
```

### 8. Lançar IPTU Oficialmente

```bash
curl -X POST http://localhost:8000/api/v1/tributario/iptu/lancar \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "imovel_id": "ID_DO_IMOVEL",
    "ano_exercicio": 2025,
    "numero_parcelas": 10
  }'
```

🎉 **IPTU lançado com sucesso!**

---

## 🔥 Casos de Uso Rápidos

### Emitir Guia de ITBI

```bash
curl -X POST http://localhost:8000/api/v1/tributario/itbi/emitir-guia \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "imovel_id": "ID_DO_IMOVEL",
    "transmitente_id": "ID_VENDEDOR",
    "adquirente_id": "ID_COMPRADOR",
    "tipo_transmissao": "COMPRA_VENDA",
    "valor_declarado": 450000.00,
    "valor_financiado_sfh": 350000.00
  }'
```

### Criar Declaração de ISSQN

Primeiro cadastre um estabelecimento:

```bash
curl -X POST http://localhost:8000/api/v1/cadastro/estabelecimentos \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "proprietario_id": "ID_DA_PESSOA_JURIDICA",
    "inscricao_municipal": "123456789",
    "nome_fantasia": "Consultoria ABC",
    "atividade_principal": "Consultoria Empresarial",
    "cnae": "7020400"
  }'
```

Depois declare o ISSQN:

```bash
curl -X POST http://localhost:8000/api/v1/tributario/issqn/declarar \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "estabelecimento_id": "ID_DO_ESTABELECIMENTO",
    "mes_competencia": 10,
    "ano_competencia": 2025,
    "regime_tributacao": "VARIAVEL",
    "receita_bruta_total": 50000.00
  }'
```

### Criar Isenção para Idoso

```bash
curl -X POST http://localhost:8000/api/v1/tributario/isencoes \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "beneficiario_id": "ID_DA_PESSOA",
    "tipo_tributo": "IPTU",
    "tipo_isencao": "TOTAL",
    "percentual_isencao": 100.00,
    "fundamento_legal": "Lei Municipal 1234/2020",
    "motivo": "IDOSO",
    "data_inicio": "2025-01-01",
    "imovel_id": "ID_DO_IMOVEL"
  }'
```

Depois aprove:

```bash
curl -X PUT http://localhost:8000/api/v1/tributario/isencoes/ID_ISENCAO/aprovar \
  -H "Authorization: Bearer ${TOKEN}"
```

---

## 🐛 Solução de Problemas

### Erro: "ModuleNotFoundError"

```bash
# Verifique se está no ambiente virtual
which python
# Deve retornar: /caminho/para/venv/bin/python

# Reinstale as dependências
pip install -r requirements.txt
```

### Erro: "Database does not exist"

```bash
# Crie o banco
createdb tributec

# Verifique a string de conexão no .env
cat .env | grep DATABASE_URL
```

### Erro: "Could not validate credentials"

- Seu token expirou (válido por 30 minutos)
- Faça login novamente: `POST /api/v1/auth/login`

### Erro: "Você não tem permissão"

- Verifique se seu usuário tem o perfil correto (ADMIN, FISCAL, ARRECADACAO)
- Consulte `/api/v1/auth/me` para ver seus perfis

### Erro de Validação (422)

```json
{
  "detail": [
    {
      "loc": ["body", "cpf"],
      "msg": "field required"
    }
  ]
}
```

- Verifique os campos obrigatórios na documentação
- Use a documentação interativa (Swagger) para ver os schemas

---

## 📚 Próximos Passos

1. **Explore a Documentação Interativa**: http://localhost:8000/docs
   - Teste todos os endpoints
   - Veja os schemas de dados
   - Execute requisições diretamente

2. **Leia a Documentação Completa**: [README.md](README.md)
   - Todos os 80+ endpoints
   - Exemplos detalhados
   - Boas práticas

3. **Configure Relatórios**:
   ```bash
   GET /api/v1/tributario/relatorios/arrecadacao?data_inicio=2025-01-01&data_fim=2025-12-31
   ```

4. **Teste Parcelamentos**:
   ```bash
   POST /api/v1/tributario/parcelamentos
   ```

5. **Gere PDFs**:
   ```bash
   GET /api/v1/tributario/itbi/guias/{id}/pdf
   GET /api/v1/tributario/issqn/declaracoes/{id}/pdf
   ```

---

## 🎯 Checklist de Produção

Antes de colocar em produção:

- [ ] Altere `SECRET_KEY` para valor seguro (min. 32 caracteres aleatórios)
- [ ] Configure `DEBUG=false`
- [ ] Use HTTPS (SSL/TLS)
- [ ] Configure backup automático do PostgreSQL
- [ ] Altere senha do usuário admin padrão
- [ ] Configure SMTP para emails de recuperação de senha
- [ ] Configure CORS apenas para domínios autorizados
- [ ] Configure logs (arquivo + Sentry/CloudWatch)
- [ ] Configure rate limiting (ex: nginx)
- [ ] Configure firewall (apenas portas 80/443)
- [ ] Use supervisor/systemd para manter o processo rodando
- [ ] Configure monitoramento (Prometheus/Grafana)

---

## 💡 Dicas Úteis

### Usar Variável de Token no Terminal

```bash
# Salve o token em uma variável
export TOKEN="seu_access_token_aqui"

# Use nas requisições
curl -H "Authorization: Bearer ${TOKEN}" http://localhost:8000/api/v1/auth/me
```

### Formatar JSON na Saída

```bash
# Linux/Mac
curl ... | python -m json.tool

# Com jq (mais bonito)
curl ... | jq .
```

### Testar com HTTPie (alternativa ao curl)

```bash
# Instalar
pip install httpie

# Usar
http POST localhost:8000/api/v1/auth/login email=admin@tributec.gov.br senha=admin123

# Com token
http GET localhost:8000/api/v1/auth/me Authorization:"Bearer ${TOKEN}"
```

### Exportar OpenAPI Spec

Quando o servidor estiver rodando:

```bash
curl http://localhost:8000/api/v1/openapi.json > openapi.json
```

---

## 🆘 Ajuda

- **Documentação**: http://localhost:8000/docs
- **README Completo**: [README.md](README.md)
- **Issues**: https://github.com/silvacarvalho/Tributec/issues
- **Email**: contato@tributec.gov.br

---

**Boa sorte! 🚀**
