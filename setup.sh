#!/bin/bash

# Script de Setup - Terminal PIX
# Executa: bash setup.sh

echo "🚀 Inicializando Terminal PIX..."
echo ""

# 1. Instalar dependências
echo "📦 Instalando dependências..."
npm install --silent

# 2. Criar .env se não existir
if [ ! -f .env ]; then
  echo "⚙️ Criando arquivo .env..."
  cp .env.example .env
  echo "✅ Arquivo .env criado! Verifique se a chave está correta."
else
  echo "✅ Arquivo .env já existe"
fi

# 3. Verificar estrutura de pastas
echo "📁 Verificando estrutura..."
mkdir -p src api public

# 4. Verificar se está pronto para rodar
echo ""
echo "✅ Setup completo!"
echo ""
echo "Próximos passos:"
echo "  1. Testar localmente: npm run dev"
echo "  2. Ou fazer deploy: vercel"
echo ""
echo "📚 Mais informações em: SETUP-GITHUB-VERCEL.md"
