#!/bin/bash

# Script para resetar o banco de dados
# CUIDADO: Isso vai apagar TODOS os dados!

echo "⚠️  ATENÇÃO: Isso vai apagar TODOS os dados do banco!"
read -p "Tem certeza? Digite 'SIM' para confirmar: " confirm

if [ "$confirm" != "SIM" ]; then
    echo "❌ Operação cancelada."
    exit 1
fi

echo ""
echo "🗑️  Parando containers..."
docker-compose down -v

echo ""
echo "🔄 Recriando containers..."
docker-compose up -d

echo ""
echo "⏳ Aguardando serviços ficarem prontos..."
sleep 15

echo ""
echo "👤 Criando usuário admin padrão..."
./scripts/create-admin.sh

echo ""
echo "✅ Banco de dados resetado com sucesso!"
echo "🌐 Acesse: http://localhost"
echo "📧 Login: admin@example.com"
echo "🔑 Senha: admin123"
