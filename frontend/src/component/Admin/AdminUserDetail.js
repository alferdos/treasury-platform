import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import axios from 'axios';
import AdminShell from './AdminShell';

const API = process.env.REACT_APP_API_URL || '';

export default function AdminUserDetail() {
  const { userId } = useParams();
  const history = useHistory();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${API}/api/getUserDetail/${userId}`)
      .then(res => {
        if (res.data.status === 1) setData(res.data);
        else setError('Failed to load user details');
        setLoading(false);
      })
      .catch(() => { setError('Failed to load user details'); setLoading(false); });
  }, [userId]);

  const formatSAR = (val) => `﷼ ${(val || 0).toLocaleString('en-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatDate = (d) => new Date(d).toLocaleDateString('en-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) return (
    <AdminShell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '4px solid #e5e7eb', borderTopColor: '#c9a84c', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#6b7280' }}>Loading user details...</p>
        </div>
      </div>
    </AdminShell>
  );

  if (error) return (
    <AdminShell>
      <div style={{ padding: 32, textAlign: 'center', color: '#ef4444' }}>{error}</div>
    </AdminShell>
  );

  const { user, balances, transactions } = data;
  const totalUnitsValue = balances.reduce((sum, b) => sum + ((b.units || 0) * (b.propertyId?.tokenPrice || 0)), 0);

  return (
    <AdminShell>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .ud-card { background: #fff; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); padding: 24px; margin-bottom: 24px; }
        .ud-stat { background: #f9fafb; border-radius: 10px; padding: 20px; text-align: center; }
        .ud-stat-val { font-size: 24px; font-weight: 700; color: #1a1a2e; margin-bottom: 4px; }
        .ud-stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
        .ud-table { width: 100%; border-collapse: collapse; }
        .ud-table th { background: #f9fafb; padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e5e7eb; }
        .ud-table td { padding: 14px 16px; font-size: 14px; color: #374151; border-bottom: 1px solid #f3f4f6; }
        .ud-table tr:hover td { background: #f9fafb; }
        .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .badge-buy { background: #d1fae5; color: #065f46; }
        .badge-sell { background: #fee2e2; color: #991b1b; }
        .back-btn { display: inline-flex; align-items: center; gap: 8px; background: none; border: none; color: #6b7280; font-size: 14px; cursor: pointer; padding: 8px 0; margin-bottom: 20px; }
        .back-btn:hover { color: #1a1a2e; }
      `}</style>

      <button className="back-btn" onClick={() => history.push('/admin/users')}>
        ← Back to Users
      </button>

      {/* User Profile Card */}
      <div className="ud-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          {user.profile_image && user.profile_image.startsWith('http') ? (
            <img src={user.profile_image} alt={user.name} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid #c9a84c' }} />
          ) : (
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #c9a84c, #0e3725)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', margin: '0 0 4px' }}>{user.name}</h2>
            <p style={{ color: '#6b7280', margin: '0 0 4px', fontSize: 14 }}>{user.email}</p>
            <p style={{ color: '#6b7280', margin: 0, fontSize: 14 }}>{user.phone_no} &nbsp;·&nbsp; ID: {user.national_id}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 20, background: user.role === 1 ? '#fef3c7' : '#dbeafe', color: user.role === 1 ? '#92400e' : '#1e40af', fontSize: 12, fontWeight: 600 }}>
              {user.role === 1 ? 'Admin' : 'Investor'}
            </span>
            <p style={{ color: '#9ca3af', fontSize: 12, margin: '8px 0 0' }}>Joined {formatDate(user.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="ud-stat">
          <div className="ud-stat-val" style={{ color: '#c9a84c' }}>{formatSAR(user.totalBalance)}</div>
          <div className="ud-stat-label">SAR Balance</div>
        </div>
        <div className="ud-stat">
          <div className="ud-stat-val">{balances.length}</div>
          <div className="ud-stat-label">Properties Held</div>
        </div>
        <div className="ud-stat">
          <div className="ud-stat-val">{balances.reduce((s, b) => s + (b.units || 0), 0).toLocaleString()}</div>
          <div className="ud-stat-label">Total Units</div>
        </div>
        <div className="ud-stat">
          <div className="ud-stat-val" style={{ color: '#0e3725' }}>{formatSAR(totalUnitsValue)}</div>
          <div className="ud-stat-label">Portfolio Value</div>
        </div>
        <div className="ud-stat">
          <div className="ud-stat-val">{transactions.length}</div>
          <div className="ud-stat-label">Transactions</div>
        </div>
      </div>

      {/* Property Holdings */}
      <div className="ud-card">
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', margin: '0 0 20px' }}>Property Holdings</h3>
        {balances.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🏠</div>
            <p>No property units held yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="ud-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Units Held</th>
                  <th>Unit Price</th>
                  <th>Total Value</th>
                  <th>Contract</th>
                </tr>
              </thead>
              <tbody>
                {balances.map((b, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1a1a2e' }}>{b.propertyId?.title || 'Unknown Property'}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>{b.propertyId?.address || ''}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{(b.units || 0).toLocaleString()}</td>
                    <td>{formatSAR(b.propertyId?.tokenPrice)}</td>
                    <td style={{ fontWeight: 600, color: '#0e3725' }}>{formatSAR((b.units || 0) * (b.propertyId?.tokenPrice || 0))}</td>
                    <td>
                      {b.propertyId?.contract_address ? (
                        <a href={`https://testnet.bscscan.com/token/${b.propertyId.contract_address}`} target="_blank" rel="noreferrer"
                          style={{ fontSize: 12, color: '#c9a84c', textDecoration: 'none', fontFamily: 'monospace' }}>
                          {b.propertyId.contract_address.slice(0, 10)}...
                        </a>
                      ) : <span style={{ color: '#d1d5db', fontSize: 12 }}>Not deployed</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="ud-card">
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', margin: '0 0 20px' }}>Transaction History</h3>
        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
            <p>No transactions yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="ud-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Property</th>
                  <th>Action</th>
                  <th>Units</th>
                  <th>Amount (SAR)</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 13, color: '#6b7280' }}>{formatDate(t.createdAt)}</td>
                    <td style={{ fontWeight: 500 }}>{t.propertyId?.title || 'Unknown'}</td>
                    <td>
                      <span className={`badge badge-${t.action}`}>
                        {t.action?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{(t.units || 0).toLocaleString()}</td>
                    <td style={{ fontWeight: 600, color: t.action === 'buy' ? '#ef4444' : '#10b981' }}>
                      {t.action === 'buy' ? '-' : '+'}{formatSAR(t.price)}
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>
                        {t.isSubscription ? 'Subscription' : 'Exchange'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
