import { useEffect, useState } from 'react';
import api from '../services/api';
import { Activity, Users, CheckCircle2, AlertCircle } from 'lucide-react';

export default function StatusCheck() {
  const [status, setStatus] = useState('Verificando conexão...');
  const [online, setOnline] = useState(false);
  const [devs, setDevs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar status do backend
    api.get('/status')
      .then((res) => {
        setStatus(res.data.status || 'API Online');
        setOnline(true);
      })
      .catch((err) => {
        console.error('Erro ao conectar ao Backend:', err);
        setStatus('Erro ao conectar com o Backend (Certifique-se que está rodando na porta 8080)');
        setOnline(false);
      });

    // Buscar lista de desenvolvedores
    api.get('/developers')
      .then((res) => {
        setDevs(res.data);
      })
      .catch((err) => {
        console.error('Erro ao buscar desenvolvedores:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div style={{
      maxWidth: '700px',
      margin: '40px auto',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f8fafc',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      color: '#1e293b'
    }}>
      <header style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={24} color="#2563eb" /> FieldOps — Conexão & Integração
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
          Validação inicial de comunicação entre React (Frontend) e Spring Boot (Backend)
        </p>
      </header>

      {/* Card de Status da API */}
      <section style={{
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: online ? '#f0fdf4' : '#fef2f2',
        border: `1px solid ${online ? '#bbf7d0' : '#fecaca'}`,
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        {online ? <CheckCircle2 size={24} color="#16a34a" /> : <AlertCircle size={24} color="#dc2626" />}
        <div>
          <strong style={{ display: 'block', fontSize: '15px' }}>Status da Conexão:</strong>
          <span style={{ fontSize: '14px', color: online ? '#15803d' : '#b91c1c' }}>{status}</span>
        </div>
      </section>

      {/* Card de Desenvolvedores */}
      <section style={{
        backgroundColor: '#ffffff',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={20} color="#475569" /> Desenvolvedores do Projeto
        </h2>

        {loading ? (
          <p style={{ color: '#64748b' }}>Carregando dados do servidor...</p>
        ) : devs.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {devs.map((dev, index) => (
              <li key={index} style={{
                padding: '10px 12px',
                borderBottom: index < devs.length - 1 ? '1px solid #f1f5f9' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '14px'
              }}>
                <span style={{ fontWeight: '500' }}>{dev.nome || dev.contato}</span>
                {dev.handle && <span style={{ color: '#2563eb', backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>{dev.handle}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Nenhum dado retornado ou backend indisponível.</p>
        )}
      </section>
    </div>
  );
}
