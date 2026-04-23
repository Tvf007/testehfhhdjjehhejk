// api/create-deposit.js
import crypto from 'crypto';

const BUYPIX_API = 'https://buypix.me/api/v1';
const API_KEY = process.env.BUYPIX_API_KEY;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valor inválido'
      });
    }

    if (!API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'API não configurada'
      });
    }

    // Gera ID de idempotência único
    const idempotencyKey = crypto.randomUUID();

    const response = await fetch(`${BUYPIX_API}/deposits`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify({
        amount: amount,
        webhook_url: WEBHOOK_URL || `${process.env.VERCEL_URL}/api/webhook`
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('BuyPix Error:', data);
      return res.status(400).json({
        success: false,
        message: data.message || 'Erro ao gerar QR Code'
      });
    }

    return res.status(201).json({
      success: true,
      deposit_id: data.data.id,
      qr_code: data.data.pix_qr_code,
      qr_code_base64: data.data.pix_qr_code_base64,
      amount: data.data.amount,
      expires_at: data.data.expires_at
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro no servidor'
    });
  }
}
