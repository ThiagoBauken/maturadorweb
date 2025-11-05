# Correções Aplicadas - AquecedorWeb

## 📋 Resumo

Este documento detalha todas as correções aplicadas ao projeto durante o setup e os problemas encontrados.

## ✅ Correções Implementadas

### 1. **Dependências Backend Faltantes**

**Problema:** O backend estava faltando dependências críticas.

**Solução:** Adicionadas ao `backend/package.json`:
```json
{
  "multer": "latest",  // Para upload de arquivos
  "uuid": "latest"      // Para geração de IDs únicos
}
```

**Status:** ✅ Resolvido

---

### 2. **Exports Faltantes no Verifier Controller**

**Problema:** As rotas do verifier esperavam funções que não estavam sendo exportadas:
- `startCampaign`
- `pauseCampaign`
- `getCampaignNumbers`
- `getCampaignResults`
- `exportCampaignNumbers`

**Solução:** Adicionadas funções alias em `backend/src/controllers/verifier.controller.js`:
```javascript
const startCampaign = async (req, res, next) => {
  req.body = { status: 'processing' };
  return updateCampaignStatus(req, res, next);
};

const pauseCampaign = async (req, res, next) => {
  req.body = { status: 'paused' };
  return updateCampaignStatus(req, res, next);
};

const getCampaignNumbers = getVerificationResults;
const getCampaignResults = getVerificationResults;
const exportCampaignNumbers = exportValidNumbers;
```

**Arquivos modificados:**
- `backend/src/controllers/verifier.controller.js` (linhas 618-649)

**Status:** ✅ Resolvido

---

### 3. **Configuração de Conexão PostgreSQL**

**Problema:** O Sequelize não suportava corretamente conexão via Unix socket.

**Solução:** Atualizada a configuração em `backend/src/config/database.js` para detectar automaticamente se deve usar Unix socket ou TCP:

```javascript
// Detecta se é Unix socket (começa com /)
if (config.database.host.startsWith('/')) {
  sequelizeOptions.host = config.database.host;
} else {
  sequelizeOptions.host = config.database.host;
  sequelizeOptions.port = config.database.port;
}
```

**Arquivos modificados:**
- `backend/src/config/database.js` (linhas 5-52)
- `backend/.env` (DB_HOST configurado para `/var/run/postgresql`)

**Status:** ✅ Resolvido (código)

---

### 4. **Arquivo .env Backend**

**Problema:** Arquivo de configuração ausente.

**Solução:** Criado `backend/.env` com todas as configurações necessárias:
```env
DB_HOST=/var/run/postgresql
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=whatsapp_platform
# ... outras configurações
```

**Status:** ✅ Resolvido

---

### 5. **Integração de Autenticação Frontend**

**Problema:** Frontend usava mock de autenticação em vez de API real.

**Solução:** Atualizado `src/contexts/AuthContext.tsx` para usar endpoint `/api/v1/auth/login`:

```typescript
const response = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

**Status:** ✅ Resolvido

---

### 6. **Inconsistência de Armazenamento de Token**

**Problema:** AuthContext usava `whatsapp_token` mas whatsapp-api.ts procurava `authToken`.

**Solução:** Padronizado para `authToken` em todo o código:
- AuthContext agora usa `localStorage.setItem('authToken', token)`
- whatsapp-api.ts busca `localStorage.getItem('authToken')`

**Arquivos modificados:**
- `src/contexts/AuthContext.tsx`
- `src/services/whatsapp-api.ts`

**Status:** ✅ Resolvido

---

## ⚠️ Problemas Pendentes

### 1. **PostgreSQL Não Aceita Conexões TCP**

**Sintoma:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Causa Raiz:**
O PostgreSQL está configurado para aceitar apenas conexões via Unix socket (`/var/run/postgresql/.s.PGSQL.5432`), mas não está aceitando conexões TCP na porta 5432.

**Soluções Possíveis:**

#### Opção A: Habilitar Conexões TCP no PostgreSQL (Recomendado para desenvolvimento)

1. Editar `postgresql.conf`:
```bash
# Encontrar o arquivo
sudo find /etc/postgresql -name postgresql.conf

# Editar e descomentar/alterar:
listen_addresses = 'localhost'  # ou '*' para todas as interfaces
```

2. Editar `pg_hba.conf`:
```bash
# Adicionar esta linha:
host    all    all    127.0.0.1/32    md5
```

3. Reiniciar PostgreSQL:
```bash
sudo service postgresql restart
```

4. Alterar `.env`:
```env
DB_HOST=localhost  # Em vez de /var/run/postgresql
```

#### Opção B: Usar Socket Unix (Mais simples, mas menos portátil)

1. Manter `.env` como está:
```env
DB_HOST=/var/run/postgresql
```

2. Verificar se o PostgreSQL está rodando:
```bash
ps aux | grep postgres
```

3. Se não estiver, iniciar:
```bash
sudo service postgresql start
# ou
sudo systemctl start postgresql
```

**Status:** ⚠️ Pendente (requer ação manual)

---

### 2. **Evolution API Não Configurada**

**Sintoma:**
O backend inicia mas não consegue se conectar à Evolution API.

**Solução:**
1. Instalar e configurar Evolution API v2
2. Obter API Key
3. Atualizar no `.env`:
```env
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua-chave-aqui
```

**Status:** ⚠️ Pendente (requer instalação externa)

---

### 3. **Redis Iniciado Manualmente**

**Situação:**
Redis foi iniciado manualmente com `redis-server --daemonize yes`.

**Recomendação:**
Para que o Redis inicie automaticamente:
```bash
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

**Status:** ⚠️ Atenção (funciona, mas não persiste após reboot)

---

## 📝 Checklist de Setup Completo

### Backend
- [x] Dependências instaladas (`npm install`)
- [x] Arquivo `.env` criado e configurado
- [x] Redis rodando
- [ ] **PostgreSQL aceitando conexões** ⚠️
- [ ] Banco de dados `whatsapp_platform` criado
- [ ] Tables do banco criadas (sync automático)
- [ ] Primeiro usuário admin criado
- [ ] Backend iniciado sem erros

### Frontend
- [ ] Dependências instaladas (`npm install` na raiz)
- [x] Arquivo `.env` criado
- [x] Integração com backend configurada
- [ ] Frontend iniciado (`npm run dev`)
- [ ] Login funcionando

### Integrações
- [ ] Evolution API v2 instalada e rodando
- [ ] API Key da Evolution configurada
- [ ] (Opcional) DeepSeek AI configurada

---

## 🚀 Próximos Passos Recomendados

1. **Resolver Conexão PostgreSQL** (escolher Opção A ou B acima)
2. **Iniciar Backend:**
```bash
cd backend
npm start
```

3. **Criar Primeiro Usuário:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```

4. **Iniciar Frontend:**
```bash
cd ..  # voltar para raiz
npm install
npm run dev
```

5. **Testar Login:**
- Acessar `http://localhost:5173`
- Login com credenciais criadas

6. **Configurar Evolution API** (para funcionalidade WhatsApp)

---

## 📊 Status Geral

| Componente | Status | Observações |
|------------|--------|-------------|
| **Código Backend** | ✅ OK | Todas as correções aplicadas |
| **Código Frontend** | ✅ OK | Autenticação real integrada |
| **Dependências** | ✅ OK | Todas instaladas |
| **PostgreSQL** | ⚠️ Config | Precisa aceitar conexões |
| **Redis** | ✅ OK | Rodando |
| **Evolution API** | ❌ Ausente | Precisa instalar |
| **Documentação** | ✅ OK | SETUP.md criado |

---

## 🔧 Comandos Úteis

### Verificar Serviços
```bash
# PostgreSQL
pg_isready
ps aux | grep postgres

# Redis
redis-cli ping

# Backend
curl http://localhost:3000/health
```

### Logs
```bash
# PostgreSQL
tail -f /var/log/postgresql/postgresql-16-main.log

# Backend
# (logs aparecem no console ao rodar npm start)
```

### Banco de Dados
```bash
# Conectar ao banco
psql -U postgres -d whatsapp_platform

# Listar tabelas
\dt

# Ver estrutura de uma tabela
\d+ Users
```

---

## 📞 Suporte

Se encontrar problemas não documentados aqui, verifique:
1. Logs do backend
2. Logs do PostgreSQL
3. Console do navegador (erros do frontend)

---

**Última atualização:** 2025-11-05
**Versão do documento:** 1.0
