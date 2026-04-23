# 💳 Terminal PIX - Máquina de Cartão com QR Code Real

Terminal PIX funcional para aceitar pagamentos via QR Code da BuyPix API. Instalável no celular como app, com histórico de vendas e confirmação em tempo real.

## ✨ Features

- ✅ QR Code gerado em tempo real via BuyPix API
- ✅ Confirmação automática (verde/vermelho)
- ✅ Histórico de vendas do dia (localStorage)
- ✅ Total do dia em tempo real
- ✅ Installável como PWA (funciona no celular)
- ✅ 100% grátis (Vercel + BuyPix)
- ✅ Polling a cada 2 segundos
- ✅ Suporte a webhook automático

## 🚀 Quick Start

### 1. Clone/Prepare o Projeto
```bash
git clone seu-repo
cd pix-terminal
npm install
```

### 2. Configure Variáveis de Ambiente
```bash
# .env.local
VITE_BUYPIX_API_KEY=bpx_live_sua_chave_aqui
```

### 3. Dev Local
```bash
npm run dev
# Acessa http://localhost:5173
```

### 4. Deploy Vercel
```bash
npm install -g vercel
vercel
# Configura BUYPIX_API_KEY na dashboard
```

## 📱 Usar como App

### Android (Chrome)
1. Menu (⋮) → "Instalar app"

### iOS (Safari)
1. Compartilhar → "Na tela inicial"

## 🔌 API Integration

### POST `/api/create-deposit`
Gera QR Code da BuyPix

**Request:**
```json
{
  "amount": 50.00
}
```

**Response:**
```json
{
  "success": true,
  "deposit_id": "dep_abc123",
  "qr_code_base64": "iVBORw0KGgoAAAA...",
  "expires_at": "2024-01-15T15:00:45Z"
}
```

### POST `/api/check-deposit`
Verifica status do pagamento

**Request:**
```json
{
  "deposit_id": "dep_abc123"
}
```

**Response:**
```json
{
  "success": true,
  "status": "completed",
  "amount": 50.00,
  "net_amount": 47.50
}
```

## 📊 Statuses BuyPix

- `pending` - Aguardando pagamento
- `depix_sent` - PIX enviado (confirmado)
- `completed` - Completo
- `expired` - QR expirou (30 min)
- `canceled` - Cancelado
- `error` - Erro

## 🔐 Segurança

- ✅ API Key nunca fica no frontend
- ✅ HMAC validation no webhook (opcional)
- ✅ Idempotência contra duplicação
- ✅ Rate limit (1000 req/hr BuyPix)

## 📝 Estrutura

```
pix-terminal/
├── src/
│   ├── App.jsx           # UI principal
│   └── main.jsx          # Entry React
├── api/
│   ├── create-deposit.js # Gera QR
│   ├── check-deposit.js  # Verifica status
│   └── webhook.js        # Recebe notificações
├── package.json
├── vite.config.js
└── vercel.json
```

## 🧪 Teste Rápido

1. Abre app
2. Digita `0.50`
3. Clica "Gerar QR Code"
4. Escaneia do seu celular
5. Paga da sua conta
6. **Tela fica verde em 2-3 segundos**

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| Erro ao gerar QR | Verifica `BUYPIX_API_KEY` no Vercel |
| Não confirma | Aguarda 2-3 seg, polling está rodando |
| QR não aparece | F12 Console, testa endpoint |
| Histórico vazio | Abre DevTools → Application → Local Storage |

## 📚 Documentação

- [Guia Completo Deploy](./GUIA-DEPLOY.md)
- [BuyPix API Docs](https://buypix.me/docs)

## 💡 Próximos Passos

- [ ] Adicionar dashboard com gráficos
- [ ] Integrar banco de dados (MongoDB)
- [ ] Webhook automático BuyPix
- [ ] Multi-dispositivo via Firebase
- [ ] Exportar relatório PDF/CSV

## 📄 License

MIT - Use livremente

---

**Criado com ❤️ para PIX + BuyPix**
