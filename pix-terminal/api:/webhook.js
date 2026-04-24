export default async function handler(req, res) {
  // Apenas POST é aceito
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { event, data } = req.body;

    // Log dos eventos (útil para debug)
    console.log(`[Webhook] Evento: ${event}`);
    console.log(`[Webhook] Depósito: ${data?.id}`);
    console.log(`[Webhook] Status: ${data?.status}`);
    console.log(`[Webhook] Valor: R$ ${data?.amount}`);
    console.log(`[Webhook] Timestamp: ${new Date().toISOString()}`);

    // Eventos de depósito
    if (event === 'deposit.completed' || event === 'deposit.depix_sent') {
      console.log(`✓ Pagamento confirmado: ${data.id}`);
      // Aqui você pode:
      // - Atualizar banco de dados
      // - Enviar notificação
      // - Registrar na blockchain
    }

    if (event === 'deposit.canceled' || event === 'deposit.expired') {
      console.log(`✗ Pagamento cancelado/expirado: ${data.id}`);
    }

    // Sempre retorna 200 OK para confirmar recebimento
    return res.status(200).json({
      success: true,
      received_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Webhook Error]', error);
    // Ainda retorna 200 para evitar retry infinito da BuyPix
    return res.status(200).json({
      success: false,
      error: error.message
    });
  }
}
