import crypto from 'crypto';

const BUYPIX_API = 'https://buypix.me/api/v1';
const API_KEY = process.env.BUYPIX_API_KEY;

export default async function handler(req, res) {
  // Apenas POST é aceito
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { amount } = req.body;

    // Validar entrada
    if (!amount || amount < 0.1) {
      return res.status(400).json({
        success: false,
        message: 'Valor mínimo: R$ 0.10'
      });
    }

    if (!API_KEY) {
      console.error('BUYPIX_API_KEY não configurada');
      return res.status(500).json({
        success: false,
        message: 'Chave de API não configurada no servidor'
      });
    }

    // Gerar chave de idempotência (evita duplicação)
    const idempotencyKey = crypto.randomUUID();

    // Chamar BuyPix API
    const response = await fetch(`${BUYPIX_API}/deposits`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify({
        amount: parseFloat(amount)
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('BuyPix Error:', data);
      return res.status(response.status).json({
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
    console.error('Error in create-deposit:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}
