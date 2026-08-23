import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePanelStore } from '../../stores/usePanelStore';
import { api } from '../../lib/client';

export function ConfiguracionPagosExitoPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const usuario = usePanelStore((s) => s.usuario);

  useEffect(() => {
    async function verifyStatus() {
      if (!usuario?.negocioId) return;
      try {
        const res = await api.get(`/negocios/${usuario.negocioId}/stripe/estado`);
        const { chargesEnabled, detailsSubmitted, onboardingCompleto } = res.data.data;
        if (chargesEnabled && detailsSubmitted && onboardingCompleto) {
          setSuccess(true);
        } else {
          setError('El onboarding de Stripe no se ha completado por completo. Revisa la configuración e intenta nuevamente.');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Hubo un error al verificar el estado de Stripe.');
      } finally {
        setLoading(false);
      }
    }
    verifyStatus();
  }, [usuario]);

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h1>Verificación de Configuración de Pagos</h1>
      {loading ? (
        <p>Verificando estado con Stripe, por favor espera...</p>
      ) : error ? (
        <div style={{ color: 'red' }}>
          <p>⚠️ {error}</p>
          <button onClick={() => navigate('/dashboard')} style={{ marginTop: '1rem' }}>Volver al Panel</button>
        </div>
      ) : success ? (
        <div style={{ color: 'green' }}>
          <p>✅ ¡Configuración de pagos completada exitosamente!</p>
          <button onClick={() => navigate('/dashboard')} style={{ marginTop: '1rem' }}>Ir al Panel</button>
        </div>
      ) : null}
    </div>
  );
}
