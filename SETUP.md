# AquecedorWeb - Setup Guide

## 🚀 Quick Start

This guide will help you set up the AquecedorWeb platform - a comprehensive WhatsApp automation and management system.

## 📋 Prerequisites

- **Node.js** v18 or higher
- **PostgreSQL** 12 or higher
- **Redis** 6 or higher
- **Evolution API v2** (for WhatsApp integration)
- **npm** or **yarn** or **bun**

## 🔧 Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd maturadorweb
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Configure Environment Variables

Copy the `.env.example` file to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=whatsapp_platform

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Evolution API
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=your_evolution_api_key

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRATION=24h

# DeepSeek AI (Optional - for AI features)
DEEPSEEK_API_KEY=your_deepseek_api_key
```

#### Set Up Database

1. Create PostgreSQL database:

```bash
createdb whatsapp_platform
```

2. The backend will automatically sync database models on first run in development mode.

#### Start Backend Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The backend will be available at `http://localhost:3000`

### 3. Frontend Setup

#### Install Dependencies

```bash
cd ..  # Back to root directory
npm install
```

#### Configure Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

The `.env` file should contain:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

#### Start Frontend Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🗄️ Database Setup

### Automatic Sync (Development)

In development mode, the application automatically syncs database models. You can control this behavior:

```bash
# Normal sync (safe - doesn't drop tables)
npm run dev

# Force sync (⚠️ WARNING: Drops all tables and recreates them)
DB_FORCE_SYNC=true npm run dev

# Alter sync (Updates existing tables to match models)
DB_ALTER_SYNC=true npm run dev
```

### Manual Migration (Production)

For production, use Sequelize migrations:

```bash
cd backend
npx sequelize-cli db:migrate
```

## 🔑 Initial User Creation

### Option 1: Register via API

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "password123",
    "role": "admin"
  }'
```

### Option 2: Register via Frontend

1. Start the frontend
2. Navigate to the login page
3. Create a new account

## 📦 Evolution API Setup

AquecedorWeb requires Evolution API v2 for WhatsApp integration:

1. Install and configure Evolution API following their documentation
2. Get your API key
3. Add the API URL and key to your backend `.env` file

## 🎯 Features Overview

### Session Management
- Create and manage multiple WhatsApp sessions
- QR code-based connection
- Session health monitoring
- Automatic reconnection

### Phone Number Verification
- Batch verification of phone numbers
- CSV import/export
- Campaign management
- Real-time progress tracking

### Account Warming
- Standard number-to-number warming
- Group warming
- AI-powered conversation generation
- Intelligent scheduling

### Bulk Messaging
- Campaign creation and management
- Message templates with variables
- Media attachment support
- AI message variations
- Scheduled delivery with rate limiting

### Analytics
- Dashboard with KPIs
- Campaign performance metrics
- Session health status
- Usage analytics

## 🔐 Authentication

The platform uses JWT-based authentication:

1. Register or login to get a JWT token
2. Token is automatically stored and sent with requests
3. Tokens expire after 24 hours (configurable)

## 📱 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user

### Sessions
- `GET /api/v1/sessions` - List sessions
- `POST /api/v1/sessions` - Create session
- `POST /api/v1/sessions/:id/qrcode` - Generate QR code
- `POST /api/v1/sessions/:id/connect` - Connect session
- `DELETE /api/v1/sessions/:id` - Disconnect session

### Bulk Campaigns
- `GET /api/v1/bulk/campaigns` - List campaigns
- `POST /api/v1/bulk/campaigns` - Create campaign
- `PATCH /api/v1/bulk/campaigns/:id/status` - Update status

### Verification
- `GET /api/v1/verifier` - List verification campaigns
- `POST /api/v1/verifier` - Create campaign
- `POST /api/v1/verifier/:id/start` - Start verification

### Warmers
- `GET /api/v1/warmers` - List warmers
- `POST /api/v1/warmers` - Create warmer
- `PATCH /api/v1/warmers/:id/status` - Update status

### Analytics
- `GET /api/v1/analytics/dashboard` - Dashboard summary
- `GET /api/v1/analytics/activity` - Recent activity
- `GET /api/v1/analytics/sessions/health` - Session health

## 🛠️ Development

### Backend Development

```bash
cd backend
npm run dev  # Starts with nodemon for auto-reload
```

### Frontend Development

```bash
npm run dev  # Starts Vite dev server
```

### Building for Production

#### Frontend
```bash
npm run build
```

#### Backend
```bash
cd backend
npm start
```

## 🐛 Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists: `psql -l`

### Redis Connection Issues

- Ensure Redis is running: `redis-cli ping`
- Check Redis connection settings in `.env`

### Evolution API Issues

- Verify Evolution API is running
- Check API URL and key in `.env`
- Test connection: `curl http://localhost:8080/health`

### Port Already in Use

Backend (3000):
```bash
lsof -ti:3000 | xargs kill -9
```

Frontend (5173):
```bash
lsof -ti:5173 | xargs kill -9
```

## 📚 Additional Resources

- [Evolution API Documentation](https://doc.evolution-api.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)

## 🔒 Security Notes

- Change JWT_SECRET in production
- Use strong database passwords
- Enable SSL for database in production
- Keep API keys secure
- Use HTTPS in production

## 📝 License

[Your License Here]

## 🤝 Contributing

[Contributing Guidelines]

## 📞 Support

[Support Information]
