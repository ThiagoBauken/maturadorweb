# 🚀 AquecedorWeb - WhatsApp Automation Platform

Uma plataforma completa de automação e gerenciamento de WhatsApp para campanhas de marketing, verificação de números e aquecimento de contas.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Quick Start com Docker](#-quick-start-com-docker-recomendado)
- [Instalação Manual](#instalação-manual)
- [Tecnologias](#tecnologias)
- [Documentação](#documentação)
- [Contribuindo](#contribuindo)

---

## 🎯 Sobre o Projeto

**AquecedorWeb** é uma plataforma empresarial para gerenciar operações em massa no WhatsApp, incluindo:

- 📱 Gerenciamento de múltiplas sessões WhatsApp
- ✅ Verificação em lote de números de telefone (até 2.500 por sessão)
- 🔥 Aquecimento inteligente de contas com IA
- 📨 Envio de mensagens em massa com rate limiting
- 📊 Analytics e métricas em tempo real
- 🤖 Geração de mensagens com IA (DeepSeek)

---

## ✨ Funcionalidades

### 🔐 Autenticação e Controle de Acesso
- Sistema JWT completo
- Roles: Admin, Manager, User
- Gerenciamento de usuários

### 📱 Gerenciamento de Sessões WhatsApp
- Múltiplas instâncias simultâneas
- Conexão via QR Code
- Monitoramento de saúde
- Reconexão automática
- Métricas por sessão

### ✅ Verificação de Números
- Import CSV/Excel
- Batch processing (50-100 números por vez)
- Limite: 2.500 números/sessão/12h
- Export de resultados
- Status tracking (valid/invalid/pending)

### 🔥 Account Warming
- Warming padrão (número para número)
- Warming de grupos
- Mensagens com IA
- Delays inteligentes (30-90s)
- Pausas periódicas para simular uso natural

### 📨 Bulk Messaging
- Templates com variáveis
- Variações de mensagem com IA
- Anexos de mídia
- Agendamento inteligente
- Rate limiting (40-200s entre mensagens)
- Tracking de entrega

### 📊 Analytics
- Dashboard com KPIs
- Métricas de campanha
- Saúde das sessões
- Uso e estatísticas

---

## 🐳 Quick Start com Docker (Recomendado!)

### Pré-requisitos
- [Docker](https://docs.docker.com/get-docker/) instalado
- [Docker Compose](https://docs.docker.com/compose/install/) instalado

### Iniciar Projeto (2 comandos!)

```bash
# 1. Subir todos os serviços (PostgreSQL, Redis, Backend, Frontend)
docker-compose up -d

# 2. Criar usuário admin
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

**Pronto! 🎉**

Acesse:
- 🌐 **Frontend:** http://localhost
- 🔌 **API:** http://localhost:3000
- 📊 **Health:** http://localhost:3000/health

**Login:**
- Email: `admin@example.com`
- Senha: `admin123`

### Comandos Úteis

```bash
# Ver logs
docker-compose logs -f

# Parar
docker-compose stop

# Reiniciar
docker-compose restart

# Resetar tudo
docker-compose down -v
docker-compose up -d
```

📚 **[Documentação Completa do Docker](DOCKER_SETUP.md)**

---

## 💻 Instalação Manual

Se preferir rodar sem Docker, siga o guia completo: **[SETUP.md](SETUP.md)**

### Resumo

1. **Instalar Dependências:**
   - Node.js 18+
   - PostgreSQL 12+
   - Redis 6+
   - Evolution API v2

2. **Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Editar .env com suas configurações
npm start
```

3. **Frontend:**
```bash
npm install
cp .env.example .env
npm run dev
```

---

## 🛠️ Tecnologias

### Frontend
- **Framework:** React 18 + TypeScript
- **Build:** Vite
- **UI:** shadcn/ui + Tailwind CSS
- **State:** Context API + TanStack Query
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts

### Backend
- **Runtime:** Node.js 18
- **Framework:** Express.js
- **Database:** PostgreSQL + Sequelize ORM
- **Cache:** Redis
- **Auth:** JWT + bcrypt
- **Validation:** express-validator
- **Logging:** Winston

### DevOps
- **Containers:** Docker + Docker Compose
- **Web Server:** Nginx (produção)
- **Proxy:** Evolution API v2

### Integrações
- **WhatsApp:** Evolution API v2
- **IA:** OpenAI / DeepSeek

---

## 📚 Documentação

- 📖 **[Setup Manual](SETUP.md)** - Instalação sem Docker
- 🐳 **[Docker Setup](DOCKER_SETUP.md)** - Guia completo Docker
- 🔧 **[Fixes Applied](FIXES_APPLIED.md)** - Correções aplicadas
- 📡 **[API Endpoints](SETUP.md#-api-endpoints)** - Documentação da API

---

## 🗂️ Estrutura do Projeto

```
maturadorweb/
├── backend/              # API Backend
│   ├── src/
│   │   ├── config/      # Configurações
│   │   ├── controllers/ # Controllers da API
│   │   ├── models/      # Models Sequelize
│   │   ├── routes/      # Rotas Express
│   │   ├── middleware/  # Middlewares
│   │   ├── lib/         # Bibliotecas (API clients, queue)
│   │   └── utils/       # Utilidades
│   ├── Dockerfile
│   └── package.json
├── src/                 # Frontend React
│   ├── components/      # Componentes React
│   ├── pages/          # Páginas
│   ├── contexts/       # Context providers
│   ├── services/       # API clients
│   └── lib/            # Utilidades
├── docker-compose.yml  # Configuração Docker
├── Dockerfile          # Frontend Dockerfile
└── package.json
```

---

## 🚀 Deploy

### Docker (Produção)

```bash
# Build para produção
docker-compose -f docker-compose.prod.yml up -d

# Com variáveis de ambiente customizadas
docker-compose up -d \
  -e JWT_SECRET=seu-secret-super-seguro \
  -e DB_PASSWORD=senha-forte
```

### Manual (Produção)

```bash
# Backend
cd backend
NODE_ENV=production npm start

# Frontend
npm run build
# Servir pasta dist/ com Nginx
```

---

## 🔒 Segurança

- ✅ JWT com expiração configurável
- ✅ Senhas hash com bcrypt
- ✅ Validação de entrada com express-validator
- ✅ Rate limiting nas rotas
- ✅ CORS configurável
- ✅ Headers de segurança (helmet)

**Em Produção:**
- Altere `JWT_SECRET` para valor seguro
- Use senhas fortes para banco de dados
- Habilite SSL/TLS
- Configure CORS para seu domínio
- Use HTTPS

---

## 🐛 Troubleshooting

### Problemas Comuns

**PostgreSQL não conecta:**
```bash
# Verificar se está rodando
docker-compose ps postgres
# ou
sudo service postgresql status
```

**Redis não conecta:**
```bash
# Verificar se está rodando
docker-compose ps redis
# ou
redis-cli ping
```

**Porta já em uso:**
```bash
# Ver o que está usando
lsof -i :3000
# Alterar porta no .env ou docker-compose.yml
```

📚 Mais soluções: [FIXES_APPLIED.md](FIXES_APPLIED.md)

---

## 🤝 Contribuindo

Contribuições são bem-vindas!

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 License

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Autores

- **Thiago Bauken** - [GitHub](https://github.com/ThiagoBauken)

---

## 📞 Suporte

- 📧 Email: [seu-email@example.com]
- 💬 Issues: [GitHub Issues](https://github.com/ThiagoBauken/maturadorweb/issues)
- 📖 Docs: [Documentação](SETUP.md)

---

## 🙏 Agradecimentos

- [Evolution API](https://evolution-api.com/) - WhatsApp API
- [shadcn/ui](https://ui.shadcn.com/) - UI Components
- [Vite](https://vitejs.dev/) - Build tool
- [Express](https://expressjs.com/) - Web framework

---

⭐ **Se este projeto te ajudou, considere dar uma estrela!** ⭐
