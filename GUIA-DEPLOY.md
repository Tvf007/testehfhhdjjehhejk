# 🚀 Terminal PIX - Guia Completo de Deploy

## O que você terá:
✅ Tela com input de valor  
✅ QR Code gerado em tempo real (via BuyPix)  
✅ Confirmação verde/vermelha automática  
✅ Histórico de vendas do dia  
✅ Funciona no celular como app  
✅ 100% gratuito (Vercel)  

---

## ⚡ Passo 1: Preparar o projeto localmente

### 1.1 Criar pasta do projeto
```bash
mkdir pix-terminal
cd pix-terminal
```

### 1.2 Copiar os arquivos
- `package.json` (já criado)
- `pix-terminal-frontend.jsx` → renomear para `src/App.jsx`
- `api-create-deposit.js` → `api/create-deposit.js`
- `api-check-deposit.js` → `api/check-deposit.js`
- `api-webhook.js` → `api/webhook.js`
- `vercel.json`

### 1.3 Estrutura final
```
pix-terminal/
├── package.json
├── vercel.json
├── src/
│   ├── App.jsx
│   └── main.jsx (criar: vite entry)
├── api/
│   ├── create-deposit.js
│   ├── check-deposit.js
│   └── webhook.js
└── index.html (criar: html raiz)
```

### 1.4 Criar arquivos faltantes

**src/main.jsx:**
```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**index.html:**
```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Terminal PIX com QR Code real" />
    <meta name="theme-color" content="#000000" />
    <title>Terminal PIX</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### 1.5 Instalar dependências
```bash
npm install
```

### 1.6 Testar localmente
```bash
npm run dev
```
Acessa em `http://localhost:5173`

---

## 🔑 Passo 2: Configurar API Key da BuyPix

**Você precisa de sua chave de API da BuyPix:**
- Acessa: https://buypix.me/dashboard
- Procura por "API Keys" ou "Chave de API"
- Copia a chave que começa com `bpx_live_`

---

## 🌐 Passo 3: Deploy no Vercel (GRÁTIS)

### 3.1 Criar conta Vercel
1. Vai em https://vercel.com
2. Clica "Sign Up"
3. Usa GitHub/GitLab/Bitbucket (recomendado)

### 3.2 Conectar repositório
1. Na dashboard do Vercel, clica "New Project"
2. Conecta seu repositório GitHub
3. Clica "Import"

### 3.3 Configurar variáveis de ambiente
Na tela de configuração do projeto:

1. **Environment Variables:**
   - Nome: `BUYPIX_API_KEY`
   - Valor: Sua chave (bpx_live_...)
   - Clica "Add"

2. Clica "Deploy"

### 3.4 Aguardar deployment
- Vercel vai fazer build automaticamente
- Levará ~2-3 minutos
- Você recebe um URL tipo: `https://pix-terminal-xxxxx.vercel.app`

### 3.5 Testar no navegador
Entra no link que Vercel gerou:
- Digita um valor (ex: 50)
- Clica "Gerar QR Code"
- **QR Code real aparece!**

---

## 📱 Passo 4: Instalar como App no Celular

### Android (Chrome)
1. Abre o link em `chrome://`
2. Toca nos 3 pontinhos (menu)
3. "Instalar app"
4. Aparece na tela inicial como app

### iOS (Safari)
1. Abre o link em Safari
2. Toca o botão "Compartilhar"
3. Desliza até "Na tela inicial"
4. "Adicionar"

---

## 🧪 Passo 5: Testar com Pagamento Real

### Opção A: Teste com sua própria conta PIX
1. Gera um QR Code (ex: R$ 0.50)
2. Abre seu app bancário
3. Escaneia o QR gerado
4. Paga desde sua conta
5. **Tela fica VERDE automaticamente**
6. Valor aparece no histórico

### Opção B: Teste com transferência manual (sem QR)
1. Use o `deposit_id` da resposta
2. Faça uma transferência PIX manual com a mesma chave/valor
3. Sistema confirma automaticamente

---

## 🔧 Troubleshooting

### "Erro ao gerar QR Code"
- ❌ Verificar se `BUYPIX_API_KEY` está configurada no Vercel
- ❌ Verificar se a chave é válida (começa com `bpx_live_`)
- ✅ Redeployer: `vercel --prod`

### "Pagamento não confirma"
- Espera 2-3 segundos (polling está verificando a cada 2s)
- Se passarem 30 min, QR Code expira automaticamente
- Gera um novo QR Code

### "QR Code não aparece"
- Verifica console (F12 → Console)
- Vê se há erro de CORS
- Tenta recarregar página

### Precisa resetar histórico?
- Abre DevTools (F12)
- Vai em "Application" → "Local Storage"
- Deleta a chave `pix_sales`

---

## 📊 Estrutura de Dados

### Histórico (localStorage)
```javascript
[
  {
    id: "deposit_abc123",
    amount: 50.00,
    timestamp: "2024-01-15T14:30:45.123Z",
    status: "confirmed"
  }
]
```

### Response do /api/create-deposit
```json
{
  "success": true,
  "deposit_id": "dep_abc123",
  "qr_code": "00020126360014br.gov.bcb.pix...",
  "qr_code_base64": "iVBORw0KGgoAAAANS...",
  "amount": 50.00,
  "expires_at": "2024-01-15T15:00:45Z"
}
```

---

## 🎯 Próximos passos (opcional)

### Adicionar webhook automático
1. Na dashboard BuyPix, configura webhook para:
   ```
   https://seu-dominio.vercel.app/api/webhook
   ```

2. Testa enviando evento:
   - BuyPix Dashboard → Webhooks → Test
   - Seu backend recebe e registra

### Integrar com banco de dados
- Adiciona MongoDB Atlas (grátis até 512MB)
- Salva histórico na nuvem
- Sincroniza múltiplos dispositivos

### Adicionar dashboard
- Gráficos de vendas (Chart.js)
- Filtro por data
- Exportar CSV/PDF

---

## 💡 Dicas finais

✅ **Teste primeiro com valores baixos** (R$ 0.50)  
✅ **Guarda sua chave de API em local seguro**  
✅ **Configura webhook pra sincronizar em tempo real**  
✅ **PWA funciona offline** (mostra QR do cache)  
✅ **Vercel faz backup automático**  

---

## 📞 Suporte

Se der erro:
1. Verifica o console (F12)
2. Copia o erro
3. Testa no Postman:
   ```
   POST https://seu-dominio.vercel.app/api/create-deposit
   Body: { "amount": 10 }
   ```

---

**Pronto! Seu terminal PIX está 100% funcional! 🎉**
