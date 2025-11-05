# AquecedorWeb Backend Setup

This document outlines how to set up and configure the backend services for the AquecedorWeb platform.

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v14 or higher)
- Redis (v6 or higher)
- Evolution API v2 instance
- Deepseek API account

## Setting Up Dependencies

### 1. PostgreSQL Setup

1. Install PostgreSQL if not already installed
2. Create a new database:
   ```sql
   CREATE DATABASE aquecedorweb;
   ```
3. Update the `.env` file with your PostgreSQL credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=aquecedorweb
   DB_USER=your_postgres_username
   DB_PASSWORD=your_postgres_password
   ```

### 2. Redis Setup

1. Install Redis if not already installed
2. Update the `.env` file with your Redis configuration:
   ```
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=your_redis_password_if_any
   ```

## Evolution API v2 Integration

### 1. Setting Up Evolution API v2

1. Install Evolution API v2 by following the instructions at [their official repository](https://github.com/evolution-api/evolution-api)
2. Once you have Evolution API running, note the base URL (e.g., `http://localhost:8080`)
3. Generate an API key in the Evolution API dashboard

### 2. Configure Evolution API Credentials

Update the `.env` file with your Evolution API credentials:
```
EVOLUTION_API_URL=http://your-evolution-api-url
EVOLUTION_API_KEY=your_evolution_api_key
```

## Deepseek AI Configuration

### 1. Setting Up Deepseek API

1. Create an account at [Deepseek AI](https://deepseek.ai) if you don't have one
2. Navigate to the API section in your account dashboard
3. Generate an API key

### 2. Configure Deepseek Credentials

Update the `.env` file with your Deepseek API information:
```
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_API_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
```

You can also customize the model used by changing the `DEEPSEEK_MODEL` value.

## Rate Limiting Configuration

The application comes with pre-configured rate limiting settings to prevent WhatsApp blocks. You can adjust these in the `.env` file:

```
BULK_SEND_MIN_DELAY=40         # Minimum delay (seconds) between bulk messages
BULK_SEND_MAX_DELAY=200        # Maximum delay (seconds) between bulk messages
BULK_SEND_PAUSE_COUNT=10       # Take a longer pause after this many messages
BULK_SEND_PAUSE_SECONDS=120    # Length of longer pause (seconds)
WARMING_MIN_DELAY=30           # Minimum delay (seconds) between warming messages
WARMING_MAX_DELAY=90           # Maximum delay (seconds) between warming messages
VERIFY_SESSION_LIMIT=2500      # Max verifications per session in time window
VERIFY_SESSION_WINDOW_HOURS=12 # Time window for verification limit
MAX_CONCURRENT_OPERATIONS=25   # Max simultaneous operations across all features
```

## Running the Backend

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

The server will run on the port specified in the `.env` file (default: 5000).

## API Documentation

- Authentication: `/api/auth/*`
- Sessions: `/api/sessions/*`
- Verification: `/api/verifier/*`
- Warming: `/api/warmers/*`
- Bulk Messaging: `/api/bulk/*`
- Analytics: `/api/analytics/*`

For detailed API documentation, refer to the API documentation section.
