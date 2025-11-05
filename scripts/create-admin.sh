#!/bin/bash

# Script para criar usuário admin
# Uso: ./scripts/create-admin.sh [email] [password] [name]

EMAIL=${1:-"admin@example.com"}
PASSWORD=${2:-"admin123"}
NAME=${3:-"Admin User"}

echo "🔧 Criando usuário admin..."
echo "Email: $EMAIL"
echo "Nome: $NAME"
echo ""

docker-compose exec backend sh -c "
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    \"name\": \"$NAME\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"role\": \"admin\"
  }'
"

echo ""
echo ""
echo "✅ Usuário admin criado!"
echo "📧 Email: $EMAIL"
echo "🔑 Senha: $PASSWORD"
echo "🌐 Acesse: http://localhost"
