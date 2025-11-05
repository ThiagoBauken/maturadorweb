# 🐳 Docker Setup - AquecedorWeb

## ⚡ Quick Start (Recomendado!)

Execute apenas **2 comandos** para rodar o projeto completo:

```bash
# 1. Subir todos os serviços
docker-compose up -d

# 2. Criar primeiro usuário admin
docker-compose exec backend sh -c '
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Admin\",
    \"email\": \"admin@example.com\",
    \"password\": \"admin123\",
    \"role\": \"admin\"
  }"
'
```

**Pronto!** Acesse:
- 🌐 **Frontend:** http://localhost
- 🔌 **Backend API:** http://localhost:3000
- 📊 **Health Check:** http://localhost:3000/health

**Login:**
- Email: `admin@example.com`
- Senha: `admin123`

---

## 🎯 O Que o Docker Faz Por Você

✅ **Instala e configura automaticamente:**
- PostgreSQL 16 (banco de dados)
- Redis 7 (cache e filas)
- Backend Node.js (API)
- Frontend React (interface web)

✅ **Resolve todos os problemas de:**
- Configuração de banco de dados
- Instalação de dependências
- Conflitos de versão
- Configuração de rede

✅ **Tudo já vem configurado:**
- Variáveis de ambiente
- Conexões entre serviços
- Health checks
- Volumes persistentes

---

## 📦 Estrutura dos Containers

```
┌─────────────────────────────────────────┐
│           Frontend (Nginx)              │
│        http://localhost:80              │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Backend (Node.js)               │
│      http://localhost:3000              │
└─────┬───────────────────────┬───────────┘
      │                       │
┌─────▼──────────┐   ┌────────▼──────────┐
│   PostgreSQL   │   │      Redis        │
│   (Database)   │   │   (Cache/Queue)   │
└────────────────┘   └───────────────────┘
```

---

## 🚀 Comandos Principais

### Iniciar o Projeto

```bash
# Construir e iniciar todos os serviços
docker-compose up -d

# Ver logs em tempo real
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Parar o Projeto

```bash
# Parar todos os serviços (mantém dados)
docker-compose stop

# Parar e remover containers (mantém dados)
docker-compose down

# Parar e remover TUDO incluindo dados
docker-compose down -v
```

### Recompilar Após Mudanças

```bash
# Recompilar e reiniciar
docker-compose up -d --build

# Recompilar apenas o backend
docker-compose up -d --build backend

# Recompilar apenas o frontend
docker-compose up -d --build frontend
```

### Acessar Container

```bash
# Acessar terminal do backend
docker-compose exec backend sh

# Acessar terminal do PostgreSQL
docker-compose exec postgres psql -U postgres -d whatsapp_platform

# Acessar Redis CLI
docker-compose exec redis redis-cli
```

---

## 🔧 Desenvolvimento

### Modo Desenvolvimento (Hot Reload)

Para desenvolver com **hot reload** (mudanças refletem automaticamente):

**Backend:**
```bash
# Parar backend em container
docker-compose stop backend

# Rodar localmente em modo dev
cd backend
npm run dev
```

**Frontend:**
```bash
# Parar frontend em container
docker-compose stop frontend

# Rodar localmente em modo dev
npm run dev
```

**Manter PostgreSQL e Redis rodando:**
```bash
docker-compose up -d postgres redis
```

---

## 📊 Monitoramento

### Ver Status dos Serviços

```bash
# Status de todos os containers
docker-compose ps

# Ver uso de recursos
docker stats
```

### Health Checks

```bash
# Backend
curl http://localhost:3000/health

# Frontend
curl http://localhost/

# PostgreSQL
docker-compose exec postgres pg_isready -U postgres

# Redis
docker-compose exec redis redis-cli ping
```

### Verificar Logs

```bash
# Todos os serviços
docker-compose logs

# Últimas 100 linhas
docker-compose logs --tail=100

# Seguir logs em tempo real
docker-compose logs -f --tail=50
```

---

## 🗄️ Gerenciamento de Banco de Dados

### Acessar Banco de Dados

```bash
# Abrir psql
docker-compose exec postgres psql -U postgres -d whatsapp_platform

# Listar tabelas
\dt

# Ver estrutura de uma tabela
\d+ "Users"

# Executar query
SELECT * FROM "Users";

# Sair
\q
```

### Backup do Banco

```bash
# Criar backup
docker-compose exec postgres pg_dump -U postgres whatsapp_platform > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U postgres whatsapp_platform < backup.sql
```

### Reset do Banco (CUIDADO!)

```bash
# Para e remove tudo
docker-compose down -v

# Sobe novamente (cria banco novo)
docker-compose up -d

# Cria usuário admin novamente
docker-compose exec backend sh -c 'curl -X POST http://localhost:3000/api/v1/auth/register ...'
```

---

## 🔑 Criar Usuários

### Usuário Admin

```bash
docker-compose exec backend sh -c '
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Admin User\",
    \"email\": \"admin@example.com\",
    \"password\": \"admin123\",
    \"role\": \"admin\"
  }"
'
```

### Usuário Regular

```bash
docker-compose exec backend sh -c '
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Regular User\",
    \"email\": \"user@example.com\",
    \"password\": \"user123\",
    \"role\": \"user\"
  }"
'
```

---

## ⚙️ Variáveis de Ambiente

### Customizar Configurações

Edite o `docker-compose.yml` na seção `environment` do backend:

```yaml
environment:
  # Alterar porta do backend
  PORT: 3000

  # Alterar secret do JWT
  JWT_SECRET: seu-secret-super-seguro-aqui

  # Configurar Evolution API
  EVOLUTION_API_URL: http://seu-evolution-api:8080
  EVOLUTION_API_KEY: sua-chave-aqui

  # Configurar DeepSeek AI
  DEEPSEEK_API_KEY: sua-chave-deepseek
```

### Frontend API URL

Para alterar a URL da API do frontend, edite o `docker-compose.yml`:

```yaml
frontend:
  build:
    args:
      VITE_API_URL: http://localhost:3000/api/v1  # Alterar aqui
```

---

## 🔌 Portas Utilizadas

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| Frontend | 80 | Interface web |
| Backend | 3000 | API REST |
| PostgreSQL | 5432 | Banco de dados |
| Redis | 6379 | Cache e filas |

**Conflito de Portas?**

Se alguma porta já estiver em uso, altere no `docker-compose.yml`:

```yaml
services:
  backend:
    ports:
      - "3001:3000"  # Usar porta 3001 no host
```

---

## 🐛 Troubleshooting

### Porta Já em Uso

```bash
# Ver o que está usando a porta
lsof -i :3000
lsof -i :5432

# Matar processo
kill -9 <PID>

# Ou alterar porta no docker-compose.yml
```

### Container Não Inicia

```bash
# Ver logs detalhados
docker-compose logs backend

# Reiniciar container específico
docker-compose restart backend

# Recriar container
docker-compose up -d --force-recreate backend
```

### Erro de Conexão com Banco

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Ver logs do PostgreSQL
docker-compose logs postgres

# Reiniciar PostgreSQL
docker-compose restart postgres
```

### Limpar Tudo e Recomeçar

```bash
# Parar tudo
docker-compose down -v

# Remover imagens antigas
docker-compose down --rmi all

# Limpar cache do Docker
docker system prune -a

# Subir novamente
docker-compose up -d --build
```

---

## 📝 Volumes (Dados Persistentes)

Os seguintes dados são persistidos mesmo quando você para os containers:

- 📁 **postgres_data** - Banco de dados PostgreSQL
- 📁 **redis_data** - Cache e filas Redis
- 📁 **backend/uploads** - Arquivos de mídia enviados
- 📁 **backend/logs** - Logs da aplicação

**Localização:**
```bash
# Ver volumes
docker volume ls | grep maturadorweb

# Inspecionar volume
docker volume inspect maturadorweb_postgres_data
```

---

## 🚢 Deploy em Produção

### Configurar para Produção

1. **Alterar senhas padrão** no `docker-compose.yml`:
   ```yaml
   POSTGRES_PASSWORD: senha-super-segura
   JWT_SECRET: secret-key-muito-seguro
   ```

2. **Habilitar SSL** para o banco:
   ```yaml
   DB_SSL: true
   ```

3. **Alterar NODE_ENV**:
   ```yaml
   NODE_ENV: production
   ```

4. **Configurar domínio** no CORS:
   ```yaml
   CORS_ORIGINS: https://seu-dominio.com
   ```

### Usar Docker Compose em Produção

```bash
# Usar arquivo de produção
docker-compose -f docker-compose.prod.yml up -d

# Com Traefik/Nginx Proxy Manager
# (adicionar configuração de proxy reverso)
```

---

## 💡 Dicas e Boas Práticas

✅ **Use `docker-compose logs -f`** para debug em tempo real

✅ **Faça backup regular** do volume do PostgreSQL

✅ **Use `.env` file** para secrets em produção

✅ **Monitore recursos** com `docker stats`

✅ **Atualize imagens** regularmente:
```bash
docker-compose pull
docker-compose up -d
```

---

## 📚 Recursos Adicionais

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [PostgreSQL Docker](https://hub.docker.com/_/postgres)
- [Redis Docker](https://hub.docker.com/_/redis)
- [Nginx Docker](https://hub.docker.com/_/nginx)

---

## ✅ Checklist Completo

- [ ] Docker e Docker Compose instalados
- [ ] `docker-compose up -d` executado
- [ ] Todos os 4 containers rodando (`docker-compose ps`)
- [ ] Health checks passando
- [ ] Usuário admin criado
- [ ] Login funcionando no frontend
- [ ] Backend respondendo na API

**Tudo OK?** Você está pronto para usar o AquecedorWeb! 🎉

---

**Última atualização:** 2025-11-05
**Versão:** 1.0
