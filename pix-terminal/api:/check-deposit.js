const BUYPIX_API = 'https://buypix.me/api/v1';
const API_KEY = process.env.BUYPIX_API_KEY;

export default async function handler(req, res) {
  // Apenas POST é aceito
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { deposit_id } = req.body;

    // Validar entrada
    if (!deposit_id) {
      return res.status(400).json({
        success: false,
        message: 'deposit_id é obrigatório'
      });
    }

    if (!API_KEY) {
      console.error('BUYPIX_API_KEY não configurada');
      return res.status(500).json({
        success: false,
        message: 'Chave de API não configurada no servidor'
      });
    }

    // Chamar BuyPix API para verificar status
    const response = await fetch(`${BUYPIX_API}/deposits/${deposit_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('BuyPix Error:', data);
      return res.status(response.status).json({
        success: false,
        message: data.message || 'Erro ao verificar depósito'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: data.data.id,
        status: data.data.status,
        amount: data.data.amount,
        fee_amount: data.data.fee_amount,
        net_amount: data.data.net_amount,
        expires_at: data.data.expires_at
      }
    });

  } catch (error) {
    console.error('Error in check-deposit:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao verificar depósito'
    });
  }
}
