// api/webhook.js
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.BUYPIX_WEBHOOK_SECRET || 'your-webhook-secret';

// Verifica assinatura HMAC do webhook
function verifyWebhookSignature(payload, signature) {
  const hash = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return hash === signature;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const signature = req.headers['x-webhook-signature'];
    const payload = req.body;

    // Verifica assinatura (opcional - comentado inicialmente)
    // if (!verifyWebhookSignature(payload, signature)) {
    //   console.warn('Invalid webhook signature');
    //   return res.status(401).json({ success: false, message: 'Unauthorized' });
    // }

    console.log('Webhook recebido:', {
      event: payload.event,
      deposit_id: payload.data?.id,
      status: payload.data?.status,
      amount: payload.data?.amount,
      timestamp: new Date().toISOString()
    });

    // Tipos de eventos:
    // - deposit.created
    // - deposit.completed
    // - deposit.under_review
    // - deposit.canceled
    // - deposit.refunded
    // - deposit.delayed
    // - deposit.pending_pix2fa
    // - withdrawal.created
    // - withdrawal.completed
    // - withdrawal.failed

    const { event, data } = payload;

    if (event === 'deposit.completed' || event === 'deposit.depix_sent') {
      console.log(`✓ Pagamento confirmado: ${data.id} - R$ ${data.amount}`);
      // Aqui você pode:
      // - Atualizar banco de dados
      // - Enviar notificação via email/SMS
      // - Registrar na blockchain/Liquid
      // - Sync com dashboard em tempo real
    }

    if (event === 'deposit.canceled' || event === 'deposit.expired') {
      console.log(`✗ Pagamento expirou/cancelado: ${data.id}`);
    }

    // Sempre retornar 200 OK para confirmar recebimento
    return res.status(200).json({
      success: true,
      received_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Webhook Error:', error);
    // Ainda retorna 200 para evitar retry infinito da BuyPix
    return res.status(200).json({
      success: false,
      error: error.message
    });
  }
}
