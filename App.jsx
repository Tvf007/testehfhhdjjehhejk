import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';

const PixTerminal = () => {
  const [amount, setAmount] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, loading, pending, confirmed, error
  const [statusMessage, setStatusMessage] = useState('');
  const [transactionId, setTransactionId] = useState(null);
  const [sales, setSales] = useState(() => {
    const saved = localStorage.getItem('pix_sales');
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);
  const [totalToday, setTotalToday] = useState(0);

  // Calcular total do dia
  useEffect(() => {
    const today = new Date().toDateString();
    const todaySales = sales.filter(s => new Date(s.timestamp).toDateString() === today);
    const total = todaySales.reduce((sum, s) => sum + s.amount, 0);
    setTotalToday(total);
  }, [sales]);

  // Polling para confirmação
  useEffect(() => {
    if (status !== 'pending' || !transactionId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/check-deposit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deposit_id: transactionId })
        });

        if (!response.ok) throw new Error('Erro ao verificar');

        const data = await response.json();

        if (data.status === 'completed' || data.status === 'depix_sent') {
          setStatus('confirmed');
          setStatusMessage('✓ Pagamento confirmado!');

          // Salvar venda
          const newSale = {
            id: transactionId,
            amount: parseFloat(amount),
            timestamp: new Date().toISOString(),
            status: 'confirmed'
          };
          const updated = [...sales, newSale];
          setSales(updated);
          localStorage.setItem('pix_sales', JSON.stringify(updated));

          // Limpar em 3 segundos
          setTimeout(() => {
            setAmount('');
            setQrCode(null);
            setStatus('idle');
            setStatusMessage('');
            setTransactionId(null);
          }, 3000);

          clearInterval(interval);
        } else if (data.status === 'expired' || data.status === 'canceled') {
          setStatus('error');
          setStatusMessage('✗ Pagamento expirado ou cancelado');
          clearInterval(interval);
          setTimeout(() => {
            setAmount('');
            setQrCode(null);
            setStatus('idle');
            setStatusMessage('');
            setTransactionId(null);
          }, 3000);
        }
      } catch (err) {
        console.error('Erro no polling:', err);
      }
    }, 2000); // Verifica a cada 2 segundos

    return () => clearInterval(interval);
  }, [status, transactionId, amount, sales]);

  const handleGenerateQR = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setStatusMessage('Digite um valor válido');
      return;
    }

    setStatus('loading');
    setStatusMessage('Gerando QR Code...');

    try {
      // Chama backend que tem acesso seguro à chave BuyPix
      const response = await fetch('/api/create-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount) })
      });

      if (!response.ok) throw new Error('Erro ao gerar QR');

      const data = await response.json();

      if (data.success) {
        setQrCode(data.qr_code_base64);
        setTransactionId(data.deposit_id);
        setStatus('pending');
        setStatusMessage('Aguardando pagamento...');
      } else {
        throw new Error(data.message || 'Erro desconhecido');
      }
    } catch (err) {
      setStatus('error');
      setStatusMessage(`✗ ${err.message}`);
      setTimeout(() => {
        setStatus('idle');
        setStatusMessage('');
      }, 3000);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Limpar histórico de vendas?')) {
      setSales([]);
      localStorage.removeItem('pix_sales');
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        body { margin: 0; padding: 0; background: var(--color-background-tertiary); font-family: var(--font-sans); }
        * { box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>💳 Terminal PIX</h1>
        <button
          onClick={() => setShowHistory(!showHistory)}
          style={{
            ...styles.button,
            ...styles.historyButton,
            background: showHistory ? 'var(--color-background-info)' : 'var(--color-border-secondary)'
          }}
        >
          📊 Vendas ({sales.length})
        </button>
      </div>

      {/* Histórico */}
      {showHistory && (
        <div style={styles.historyPanel}>
          <div style={styles.historyHeader}>
            <h2 style={styles.historyTitle}>Vendas do dia</h2>
            <div style={styles.totalBox}>
              <span style={styles.totalLabel}>Total:</span>
              <span style={styles.totalValue}>R$ {totalToday.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>

          <div style={styles.salesList}>
            {sales.length === 0 ? (
              <p style={styles.emptyMessage}>Nenhuma venda registrada</p>
            ) : (
              sales.map((sale, idx) => (
                <div key={idx} style={styles.saleItem}>
                  <span style={styles.saleTime}>
                    {new Date(sale.timestamp).toLocaleTimeString('pt-BR')}
                  </span>
                  <span style={styles.saleAmount}>
                    R$ {sale.amount.toFixed(2).replace('.', ',')}
                  </span>
                  <span style={styles.saleStatus}>✓</span>
                </div>
              ))
            )}
          </div>

          <button
            onClick={handleClearHistory}
            style={{ ...styles.button, ...styles.dangerButton, width: '100%', marginTop: '1rem' }}
          >
            Limpar histórico
          </button>
        </div>
      )}

      {/* Terminal Principal */}
      <div style={styles.terminal}>
        {/* Input de Valor */}
        <div style={styles.inputSection}>
          <label style={styles.label}>Valor (R$)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            disabled={status !== 'idle'}
            style={styles.input}
            step="0.01"
            min="0"
          />
        </div>

        {/* QR Code ou Estado */}
        <div style={styles.displayArea}>
          {status === 'idle' && !qrCode && (
            <div style={styles.placeholder}>
              <p style={styles.placeholderText}>Digite o valor e gere o QR Code</p>
            </div>
          )}

          {status === 'loading' && (
            <div style={styles.loadingBox}>
              <div style={styles.spinner}></div>
              <p>{statusMessage}</p>
            </div>
          )}

          {qrCode && (status === 'pending' || status === 'confirmed' || status === 'error') && (
            <div style={{
              ...styles.statusBox,
              background: status === 'confirmed'
                ? 'var(--color-background-success)'
                : status === 'error'
                ? 'var(--color-background-danger)'
                : 'var(--color-background-primary)'
            }}>
              {status === 'pending' && (
                <>
                  <img src={qrCode} alt="QR Code" style={styles.qrImage} />
                  <p style={styles.statusText}>Aguardando pagamento...</p>
                  <p style={styles.amountText}>R$ {parseFloat(amount).toFixed(2).replace('.', ',')}</p>
                </>
              )}

              {status === 'confirmed' && (
                <>
                  <div style={styles.checkmark}>✓</div>
                  <p style={{ ...styles.statusText, color: 'var(--color-text-success)' }}>
                    {statusMessage}
                  </p>
                  <p style={styles.amountText}>R$ {parseFloat(amount).toFixed(2).replace('.', ',')}</p>
                </>
              )}

              {status === 'error' && (
                <>
                  <div style={styles.errorIcon}>✗</div>
                  <p style={{ ...styles.statusText, color: 'var(--color-text-danger)' }}>
                    {statusMessage}
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Botão Gerar QR */}
        <button
          onClick={handleGenerateQR}
          disabled={status !== 'idle' || !amount}
          style={{
            ...styles.button,
            ...styles.primaryButton,
            opacity: (status !== 'idle' || !amount) ? 0.5 : 1,
            cursor: (status !== 'idle' || !amount) ? 'not-allowed' : 'pointer'
          }}
        >
          {status === 'loading' ? 'Gerando...' : 'Gerar QR Code'}
        </button>
      </div>

      {/* Info API */}
      <div style={styles.footer}>
        <p style={styles.footerText}>
          🔌 Conectado à BuyPix API | {sales.length} venda(s) hoje
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    background: 'var(--color-background-tertiary)',
    padding: '0',
    margin: '0'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    background: 'var(--color-background-primary)',
    borderBottom: '1px solid var(--color-border-tertiary)',
    gap: '1rem'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
    color: 'var(--color-text-primary)'
  },
  historyButton: {
    fontSize: '14px',
    padding: '0.5rem 1rem'
  },
  historyPanel: {
    background: 'var(--color-background-secondary)',
    borderBottom: '1px solid var(--color-border-tertiary)',
    padding: '1rem',
    maxHeight: '300px',
    overflowY: 'auto'
  },
  historyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid var(--color-border-tertiary)'
  },
  historyTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--color-text-primary)'
  },
  totalBox: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'baseline'
  },
  totalLabel: {
    fontSize: '14px',
    color: 'var(--color-text-secondary)'
  },
  totalValue: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--color-text-success)'
  },
  salesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1rem'
  },
  saleItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    background: 'var(--color-background-primary)',
    borderRadius: 'var(--border-radius-md)',
    fontSize: '14px'
  },
  saleTime: {
    color: 'var(--color-text-secondary)',
    fontSize: '12px'
  },
  saleAmount: {
    fontWeight: '600',
    color: 'var(--color-text-primary)'
  },
  saleStatus: {
    color: 'var(--color-text-success)',
    fontWeight: 'bold'
  },
  emptyMessage: {
    textAlign: 'center',
    color: 'var(--color-text-secondary)',
    fontSize: '14px',
    margin: 0
  },
  terminal: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem',
    gap: '1.5rem',
    maxWidth: '500px',
    margin: '0 auto',
    width: '100%'
  },
  inputSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--color-text-primary)'
  },
  input: {
    padding: '0.75rem',
    fontSize: '18px',
    border: '2px solid var(--color-border-tertiary)',
    borderRadius: 'var(--border-radius-md)',
    background: 'var(--color-background-primary)',
    color: 'var(--color-text-primary)',
    fontWeight: '600'
  },
  displayArea: {
    minHeight: '300px',
    background: 'var(--color-background-primary)',
    borderRadius: 'var(--border-radius-lg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  placeholder: {
    textAlign: 'center',
    color: 'var(--color-text-secondary)'
  },
  placeholderText: {
    margin: 0,
    fontSize: '16px'
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    color: 'var(--color-text-primary)'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid var(--color-border-tertiary)',
    borderTop: '3px solid var(--color-text-primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  statusBox: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    gap: '1rem',
    borderRadius: 'var(--border-radius-lg)'
  },
  qrImage: {
    width: '200px',
    height: '200px',
    borderRadius: 'var(--border-radius-md)'
  },
  statusText: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--color-text-primary)'
  },
  amountText: {
    margin: '0.5rem 0 0 0',
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--color-text-primary)'
  },
  checkmark: {
    fontSize: '60px',
    color: 'var(--color-text-success)',
    fontWeight: 'bold'
  },
  errorIcon: {
    fontSize: '60px',
    color: 'var(--color-text-danger)',
    fontWeight: 'bold'
  },
  button: {
    padding: '0.75rem 1.5rem',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    borderRadius: 'var(--border-radius-md)',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  primaryButton: {
    background: 'var(--color-background-info)',
    color: '#fff'
  },
  dangerButton: {
    background: 'var(--color-background-danger)',
    color: '#fff'
  },
  footer: {
    padding: '1rem',
    textAlign: 'center',
    borderTop: '1px solid var(--color-border-tertiary)',
    background: 'var(--color-background-primary)'
  },
  footerText: {
    margin: 0,
    fontSize: '12px',
    color: 'var(--color-text-secondary)'
  }
};

export default PixTerminal;
